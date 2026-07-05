const db = require('../config/db');
const { sendInvoiceEmail, sendPaymentConfirmationEmail, sendReminderEmail, sendOverdueEmail } = require('../utils/mailer');
const twilio = require('twilio');
const { decrypt } = require('../utils/crypto');

// Send Invoice via Email
exports.sendEmailInvoice = async (req, res) => {
  const { invoiceId } = req.params;
  const orgId = req.organizationId;

  try {
    const [invoices] = await db.execute(`
      SELECT i.*, c.name as customer_name, c.email as customer_email, o.name as org_name, o.currency
      FROM invoices i 
      JOIN customers c ON i.customer_id = c.id 
      JOIN organizations o ON i.organization_id = o.id
      WHERE i.id = ? AND i.organization_id = ?
    `, [invoiceId, orgId]);

    if (invoices.length === 0) return res.status(404).json({ message: 'Invoice not found' });
    const invoice = invoices[0];

    if (!invoice.customer_email) return res.status(400).json({ message: 'Customer email not found' });

    const emailSent = await sendInvoiceEmail(invoice.customer_email, invoice);

    if (emailSent) {
      await db.execute(
        'INSERT INTO notifications (organization_id, invoice_id, type, recipient, status) VALUES (?, ?, ?, ?, ?)',
        [orgId, invoiceId, 'Email', invoice.customer_email, 'Sent']
      );
      res.json({ message: 'Invoice email sent successfully' });
    } else {
      res.status(500).json({ message: 'Failed to send invoice email' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error sending email' });
  }
};

// Send Invoice via WhatsApp
exports.sendWhatsAppInvoice = async (req, res) => {
    const { invoiceId } = req.params;
    const orgId = req.organizationId;
  
    try {
      const [orgs] = await db.execute('SELECT name, whatsapp_sid, whatsapp_token, whatsapp_phone FROM organizations WHERE id = ?', [orgId]);
      const org = orgs[0];
      
      const [invoices] = await db.execute(`
        SELECT i.*, c.name as customer_name, c.phone as customer_phone 
        FROM invoices i 
        JOIN customers c ON i.customer_id = c.id 
        WHERE i.id = ? AND i.organization_id = ?
      `, [invoiceId, orgId]);
  
      const invoice = invoices[0];
      if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
      if (!invoice.customer_phone) return res.status(400).json({ message: 'Customer phone number missing' });

      if (org.whatsapp_sid) org.whatsapp_sid = decrypt(org.whatsapp_sid);
      if (org.whatsapp_token) org.whatsapp_token = decrypt(org.whatsapp_token);
  
      if (!org.whatsapp_sid || !org.whatsapp_token) {
          return res.status(400).json({ message: 'WhatsApp configuration missing in settings' });
      }

      const client = twilio(org.whatsapp_sid, org.whatsapp_token);
      const portalUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/portal/invoice/${invoice.client_token}`;
  
      await client.messages.create({
        from: `whatsapp:${org.whatsapp_phone}`,
        to: `whatsapp:${invoice.customer_phone}`,
        body: `Hello ${invoice.customer_name}! Your invoice #${invoice.invoice_number} from ${org.name} for ${invoice.total} is ready. View and pay here: ${portalUrl}`
      });
  
      await db.execute(
        'INSERT INTO notifications (organization_id, invoice_id, type, recipient, status) VALUES (?, ?, ?, ?, ?)',
        [orgId, invoiceId, 'WhatsApp', invoice.customer_phone, 'Sent']
      );
  
      res.json({ message: 'Invoice sent via WhatsApp' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error sending WhatsApp notification' });
    }
};

// Test WhatsApp Configuration
exports.testWhatsApp = async (req, res) => {
    const { phone } = req.body;
    const orgId = req.organizationId;
  
    try {
      const [orgs] = await db.execute(
        'SELECT whatsapp_sid, whatsapp_token, whatsapp_phone FROM organizations WHERE id = ?',
        [orgId]
      );
  
      const org = orgs[0];
      if (org.whatsapp_sid) org.whatsapp_sid = decrypt(org.whatsapp_sid);
      if (org.whatsapp_token) org.whatsapp_token = decrypt(org.whatsapp_token);

      if (!org.whatsapp_sid || !org.whatsapp_token) {
        return res.status(400).json({ message: 'WhatsApp configuration missing' });
      }
  
      const client = twilio(org.whatsapp_sid, org.whatsapp_token);
      
      await client.messages.create({
        from: `whatsapp:${org.whatsapp_phone}`,
        to: `whatsapp:${phone}`,
        body: 'Your InvoicePro WhatsApp integration is successfully connected! 🚀'
      });
  
      res.json({ message: 'Test WhatsApp message sent' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to send WhatsApp message. Check credentials.' });
    }
};

// Trigger Payment Reminder
exports.triggerPaymentReminder = async (req, res) => {
  const { invoiceId } = req.params;
  const orgId = req.organizationId;

  try {
    const [invoices] = await db.execute(`
      SELECT i.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone, o.name as org_name, o.currency, o.whatsapp_sid, o.whatsapp_token, o.whatsapp_phone
      FROM invoices i 
      JOIN customers c ON i.customer_id = c.id 
      JOIN organizations o ON i.organization_id = o.id
      WHERE i.id = ? AND i.organization_id = ?
    `, [invoiceId, orgId]);

    if (invoices.length === 0) return res.status(404).json({ message: 'Invoice not found' });
    const invoice = invoices[0];
    if (invoice.whatsapp_sid) invoice.whatsapp_sid = decrypt(invoice.whatsapp_sid);
    if (invoice.whatsapp_token) invoice.whatsapp_token = decrypt(invoice.whatsapp_token);

    // Email
    if (invoice.customer_email) {
      const emailSent = await sendReminderEmail(invoice.customer_email, invoice);
      if (emailSent) {
        await db.execute('INSERT INTO notifications (organization_id, invoice_id, type, recipient, status) VALUES (?, ?, ?, ?, ?)', [orgId, invoiceId, 'Email', invoice.customer_email, 'Sent']);
      }
    }

    // WhatsApp
    if (invoice.whatsapp_sid && invoice.whatsapp_token && invoice.customer_phone) {
      try {
        const client = twilio(invoice.whatsapp_sid, invoice.whatsapp_token);
        const portalUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/portal/invoice/${invoice.client_token}`;
        await client.messages.create({
          from: `whatsapp:${invoice.whatsapp_phone}`,
          to: `whatsapp:${invoice.customer_phone}`,
          body: `Friendly Reminder! Hi ${invoice.customer_name}, your invoice #${invoice.invoice_number} from ${invoice.org_name} for ${invoice.currency || '$'}${invoice.total} is due soon (${invoice.due_date}). View and pay here: ${portalUrl}`
        });
        await db.execute('INSERT INTO notifications (organization_id, invoice_id, type, recipient, status) VALUES (?, ?, ?, ?, ?)', [orgId, invoiceId, 'WhatsApp', invoice.customer_phone, 'Sent']);
      } catch (err) {
        console.error('WhatsApp Reminder Error:', err);
      }
    }

    res.json({ message: 'Payment reminder dispatched' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error dispatching payment reminder' });
  }
};

// Trigger Overdue Notice
exports.triggerOverdueNotice = async (req, res) => {
  const { invoiceId } = req.params;
  const orgId = req.organizationId;

  try {
    const [invoices] = await db.execute(`
      SELECT i.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone, o.name as org_name, o.currency, o.whatsapp_sid, o.whatsapp_token, o.whatsapp_phone
      FROM invoices i 
      JOIN customers c ON i.customer_id = c.id 
      JOIN organizations o ON i.organization_id = o.id
      WHERE i.id = ? AND i.organization_id = ?
    `, [invoiceId, orgId]);

    if (invoices.length === 0) return res.status(404).json({ message: 'Invoice not found' });
    const invoice = invoices[0];
    if (invoice.whatsapp_sid) invoice.whatsapp_sid = decrypt(invoice.whatsapp_sid);
    if (invoice.whatsapp_token) invoice.whatsapp_token = decrypt(invoice.whatsapp_token);

    // Email
    if (invoice.customer_email) {
      const emailSent = await sendOverdueEmail(invoice.customer_email, invoice);
      if (emailSent) {
        await db.execute('INSERT INTO notifications (organization_id, invoice_id, type, recipient, status) VALUES (?, ?, ?, ?, ?)', [orgId, invoiceId, 'Email', invoice.customer_email, 'Sent']);
      }
    }

    // WhatsApp
    if (invoice.whatsapp_sid && invoice.whatsapp_token && invoice.customer_phone) {
      try {
        const client = twilio(invoice.whatsapp_sid, invoice.whatsapp_token);
        const portalUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/portal/invoice/${invoice.client_token}`;
        await client.messages.create({
          from: `whatsapp:${invoice.whatsapp_phone}`,
          to: `whatsapp:${invoice.customer_phone}`,
          body: `URGENT: Hi ${invoice.customer_name}, your invoice #${invoice.invoice_number} from ${invoice.org_name} is OVERDUE. Please submit your payment of ${invoice.currency || '$'}${invoice.total} immediately: ${portalUrl}`
        });
        await db.execute('INSERT INTO notifications (organization_id, invoice_id, type, recipient, status) VALUES (?, ?, ?, ?, ?)', [orgId, invoiceId, 'WhatsApp', invoice.customer_phone, 'Sent']);
      } catch (err) {
        console.error('WhatsApp Overdue Notice Error:', err);
      }
    }

    res.json({ message: 'Overdue notice dispatched' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error dispatching overdue notice' });
  }
};

// Internal Utility: Send Payment Confirmation
exports.sendPaymentConfirmation = async (invoiceId, amount, method, orgId) => {
  try {
    const [invoices] = await db.execute(`
      SELECT i.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone, o.name as org_name, o.currency, o.whatsapp_sid, o.whatsapp_token, o.whatsapp_phone
      FROM invoices i 
      JOIN customers c ON i.customer_id = c.id 
      JOIN organizations o ON i.organization_id = o.id
      WHERE i.id = ? AND i.organization_id = ?
    `, [invoiceId, orgId]);

    if (invoices.length === 0) return;
    const invoice = invoices[0];
    if (invoice.whatsapp_sid) invoice.whatsapp_sid = decrypt(invoice.whatsapp_sid);
    if (invoice.whatsapp_token) invoice.whatsapp_token = decrypt(invoice.whatsapp_token);
    const paymentDetails = { amount, method };

    // Email
    if (invoice.customer_email) {
      const emailSent = await sendPaymentConfirmationEmail(invoice.customer_email, invoice, paymentDetails);
      if (emailSent) {
        await db.execute('INSERT INTO notifications (organization_id, invoice_id, type, recipient, status) VALUES (?, ?, ?, ?, ?)', [orgId, invoiceId, 'Email', invoice.customer_email, 'Sent']);
      }
    }

    // WhatsApp
    if (invoice.whatsapp_sid && invoice.whatsapp_token && invoice.customer_phone) {
      try {
        const client = twilio(invoice.whatsapp_sid, invoice.whatsapp_token);
        const portalUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/portal/invoice/${invoice.client_token}`;
        await client.messages.create({
          from: `whatsapp:${invoice.whatsapp_phone}`,
          to: `whatsapp:${invoice.customer_phone}`,
          body: `Payment Received! Thank you ${invoice.customer_name}. We successfully processed your payment of ${invoice.currency || '$'}${amount} for invoice #${invoice.invoice_number}. - ${invoice.org_name}. View updated invoice here: ${portalUrl}`
        });
        await db.execute('INSERT INTO notifications (organization_id, invoice_id, type, recipient, status) VALUES (?, ?, ?, ?, ?)', [orgId, invoiceId, 'WhatsApp', invoice.customer_phone, 'Sent']);
      } catch (err) {
        console.error('WhatsApp Payment Confirmation Error:', err);
      }
    }
  } catch (err) {
    console.error('Error in sendPaymentConfirmation utility:', err);
  }
};

// Internal Utility: Dispatch Invoice Created / Sent Notifications
exports.dispatchInvoiceNotifications = async (invoiceId, orgId) => {
  try {
    const [invoices] = await db.execute(`
      SELECT i.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone, o.name as org_name, o.currency, o.whatsapp_sid, o.whatsapp_token, o.whatsapp_phone
      FROM invoices i 
      JOIN customers c ON i.customer_id = c.id 
      JOIN organizations o ON i.organization_id = o.id
      WHERE i.id = ? AND i.organization_id = ?
    `, [invoiceId, orgId]);

    if (invoices.length === 0) return;
    const invoice = invoices[0];
    if (invoice.whatsapp_sid) invoice.whatsapp_sid = decrypt(invoice.whatsapp_sid);
    if (invoice.whatsapp_token) invoice.whatsapp_token = decrypt(invoice.whatsapp_token);

    // Email
    if (invoice.customer_email) {
      const emailSent = await sendInvoiceEmail(invoice.customer_email, invoice);
      if (emailSent) {
        await db.execute('INSERT INTO notifications (organization_id, invoice_id, type, recipient, status) VALUES (?, ?, ?, ?, ?)', [orgId, invoiceId, 'Email', invoice.customer_email, 'Sent']);
      }
    }

    // WhatsApp
    if (invoice.whatsapp_sid && invoice.whatsapp_token && invoice.customer_phone) {
      try {
        const client = twilio(invoice.whatsapp_sid, invoice.whatsapp_token);
        const portalUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/portal/invoice/${invoice.client_token}`;
        await client.messages.create({
          from: `whatsapp:${invoice.whatsapp_phone}`,
          to: `whatsapp:${invoice.customer_phone}`,
          body: `Hello ${invoice.customer_name}! Your invoice #${invoice.invoice_number} from ${invoice.org_name} for ${invoice.currency || '$'}${invoice.total} is ready. View and pay here: ${portalUrl}`
        });
        await db.execute('INSERT INTO notifications (organization_id, invoice_id, type, recipient, status) VALUES (?, ?, ?, ?, ?)', [orgId, invoiceId, 'WhatsApp', invoice.customer_phone, 'Sent']);
      } catch (err) {
        console.error('WhatsApp Invoice Notification Error:', err);
      }
    }
  } catch (err) {
    console.error('Error in dispatchInvoiceNotifications utility:', err);
  }
};

// Send Custom Message
exports.sendCustomMessage = async (req, res) => {
  const { recipient, subject, message, type } = req.body;
  const orgId = req.organizationId;

  if (!recipient || !message) {
    return res.status(400).json({ message: 'Recipient and message content are required.' });
  }

  try {
    const messageType = type || (recipient.includes('@') ? 'Email' : 'Message');
    const [result] = await db.execute(
      'INSERT INTO notifications (organization_id, type, recipient, status) VALUES (?, ?, ?, ?)',
      [orgId, messageType, recipient, 'Sent']
    );

    if (recipient.includes('@')) {
      const { sendCustomEmail } = require('../utils/mailer');
      await sendCustomEmail(recipient, subject, message);
    }

    res.status(201).json({ message: 'Message sent successfully!', id: result.insertId });
  } catch (err) {
    console.error('Error sending custom message:', err);
    res.status(500).json({ message: 'Error sending message' });
  }
};

// Get Notifications List
exports.getNotifications = async (req, res) => {
  const orgId = req.organizationId;
  try {
    const [rows] = await db.execute(
      'SELECT * FROM notifications WHERE organization_id = ? ORDER BY sent_at DESC LIMIT 20',
      [orgId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};
