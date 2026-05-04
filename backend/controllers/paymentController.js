const db = require('../config/db');
const { logActivity } = require('../utils/logger');

// Record Payment
exports.recordPayment = async (req, res) => {
  const { invoice_id, amount, payment_date, payment_method, note } = req.body;
  const organizationId = req.organizationId;

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // 1. Record Payment
    const [result] = await connection.execute(
      'INSERT INTO payments (invoice_id, amount, payment_date, payment_method, note) VALUES (?, ?, ?, ?, ?)',
      [invoice_id, amount, payment_date, payment_method, note]
    );

    // 2. Update Invoice Status
    const [invoices] = await connection.execute('SELECT total FROM invoices WHERE id = ?', [invoice_id]);
    const [payments] = await connection.execute('SELECT SUM(amount) as paid FROM payments WHERE invoice_id = ?', [invoice_id]);
    
    const total = invoices[0].total;
    const paid = payments[0].paid || 0;

    let status = 'partially_paid';
    if (paid >= total) {
      status = 'paid';
    }

    await connection.execute('UPDATE invoices SET status = ? WHERE id = ?', [status, invoice_id]);

    await logActivity(req.userId, `Recorded payment of ${amount} for invoice #${invoice_id}`, 'Payment', result.insertId);

    await connection.commit();

    // 3. Trigger Payment Confirmation Notification
    const { sendPaymentConfirmation } = require('./notificationController');
    sendPaymentConfirmation(invoice_id, amount, payment_method, organizationId);

    res.status(201).json({ message: 'Payment recorded and invoice status updated' });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: 'Error recording payment' });
  } finally {
    connection.release();
  }
};

// Process Public Portal Payment (Token based)
exports.processPortalPayment = async (req, res) => {
  const { token } = req.params;
  const { amount, method } = req.body;

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // 1. Get Invoice by Token
    const [invoices] = await connection.execute(
      'SELECT i.id, i.total, i.invoice_number, i.organization_id, o.name as org_name, o.whatsapp_sid, o.whatsapp_token, o.whatsapp_phone, c.name as customer_name, c.phone as customer_phone ' +
      'FROM invoices i ' +
      'JOIN organizations o ON i.organization_id = o.id ' +
      'JOIN customers c ON i.customer_id = c.id ' +
      'WHERE i.client_token = ?', 
      [token]
    );
    
    if (invoices.length === 0) return res.status(404).json({ message: 'Invoice not found' });
    const inv = invoices[0];

    // 2. Record Payment
    const [result] = await connection.execute(
      'INSERT INTO payments (invoice_id, amount, payment_date, payment_method, note) VALUES (?, ?, CURRENT_DATE, ?, ?)',
      [inv.id, amount, method, 'Online Portal Payment']
    );

    // 3. Update Invoice Status
    const [payments] = await connection.execute('SELECT SUM(amount) as paid FROM payments WHERE invoice_id = ?', [inv.id]);
    const paid = payments[0].paid || 0;
    
    let status = 'partially_paid';
    if (paid >= inv.total) status = 'paid';

    await connection.execute('UPDATE invoices SET status = ? WHERE id = ?', [status, inv.id]);

    // 4. Trigger Payment Confirmation Notification (Email & WhatsApp)
    const { sendPaymentConfirmation } = require('./notificationController');
    sendPaymentConfirmation(inv.id, amount, method, inv.organization_id);

    await connection.commit();
    res.json({ message: 'Payment successfully processed' });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: 'Error processing payment' });
  } finally {
    connection.release();
  }
};

// Get Payments by Invoice
exports.getByInvoice = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM payments WHERE invoice_id = ? ORDER BY payment_date DESC', [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching payments' });
  }
};

// Get All Payments for Organization
exports.getAll = async (req, res) => {
  const organizationId = req.organizationId;
  try {
    const [rows] = await db.execute(
      `SELECT p.*, i.invoice_number, i.total, i.status as invoice_status, c.name as customer_name 
       FROM payments p
       JOIN invoices i ON p.invoice_id = i.id
       JOIN customers c ON i.customer_id = c.id
       WHERE i.organization_id = ?
       ORDER BY p.payment_date DESC`,
      [organizationId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching all payments' });
  }
};

// Delete Payment
exports.deletePayment = async (req, res) => {
  const { id } = req.params;
  const organizationId = req.organizationId;

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // Verify payment belongs to org and get invoice_id
    const [payments] = await connection.execute(
      `SELECT p.invoice_id, p.amount FROM payments p
       JOIN invoices i ON p.invoice_id = i.id
       WHERE p.id = ? AND i.organization_id = ?`,
      [id, organizationId]
    );

    if (payments.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Payment not found' });
    }

    const { invoice_id, amount } = payments[0];

    // Delete Payment
    await connection.execute('DELETE FROM payments WHERE id = ?', [id]);

    // Recalculate Invoice Status
    const [invoices] = await connection.execute('SELECT total FROM invoices WHERE id = ?', [invoice_id]);
    const [remainingPayments] = await connection.execute('SELECT SUM(amount) as paid FROM payments WHERE invoice_id = ?', [invoice_id]);
    
    const total = invoices[0].total;
    const paid = remainingPayments[0].paid || 0;

    let status = 'sent';
    if (paid > 0 && paid < total) {
      status = 'partially_paid';
    } else if (paid >= total) {
      status = 'paid';
    }

    await connection.execute('UPDATE invoices SET status = ? WHERE id = ?', [status, invoice_id]);
    await logActivity(req.userId, `Deleted payment of ${amount} for invoice #${invoice_id}`, 'Payment', null);

    await connection.commit();
    res.json({ message: 'Payment deleted and invoice status updated' });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: 'Error deleting payment' });
  } finally {
    connection.release();
  }
};
