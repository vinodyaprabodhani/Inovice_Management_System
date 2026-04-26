const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_USER === 'your_user_id' || !process.env.SMTP_USER) {
    console.log("No real SMTP credentials found. Setting up Ethereal Email for testing...");
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
      port: process.env.SMTP_PORT || 2525,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return transporter;
};

exports.sendInvoiceEmail = async (to, invoice) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL || '"Invoice System" <noreply@invoicems.com>',
    to: to,
    subject: `New Invoice ${invoice.invoice_number} from ${invoice.org_name}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Hello ${invoice.customer_name},</h2>
        <p>You have received a new invoice from <strong>${invoice.org_name}</strong>.</p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 5px;">
          <p><strong>Invoice #:</strong> ${invoice.invoice_number}</p>
          <p><strong>Amount Due:</strong> ${invoice.currency || '$'}${invoice.total.toFixed(2)}</p>
          <p><strong>Due Date:</strong> ${invoice.due_date}</p>
        </div>
        <p>You can view and download your invoice at the following link:</p>
        <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/portal/invoice/${invoice.client_token}" style="display: inline-block; padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">View Invoice</a></p>
        <p>Thank you for your business!</p>
      </div>
    `
  };

  try {
    const t = await getTransporter();
    const info = await t.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
    if (info.messageId && nodemailer.getTestMessageUrl(info)) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    return true;
  } catch (err) {
    console.error('Error sending email:', err);
    return false;
  }
};

exports.sendPaymentConfirmationEmail = async (to, invoice, paymentDetails) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL || '"Invoice System" <noreply@invoicems.com>',
    to: to,
    subject: `Payment Receipt for Invoice ${invoice.invoice_number} from ${invoice.org_name}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Payment Received, ${invoice.customer_name}!</h2>
        <p>We successfully processed your payment of <strong>${invoice.currency || '$'}${parseFloat(paymentDetails.amount).toFixed(2)}</strong>.</p>
        <div style="background: #e6fcf5; padding: 15px; border-radius: 5px; border-left: 4px solid #20c997;">
          <p><strong>Invoice #:</strong> ${invoice.invoice_number}</p>
          <p><strong>Payment Method:</strong> ${paymentDetails.method}</p>
          <p><strong>Date Received:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <p>You can view your updated invoice status here:</p>
        <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/portal/invoice/${invoice.client_token}" style="display: inline-block; padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">View Invoice</a></p>
        <p>Thank you for your business!</p>
      </div>
    `
  };

  try {
    const t = await getTransporter();
    const info = await t.sendMail(mailOptions);
    console.log(`Receipt sent to ${to}`);
    if (info.messageId && nodemailer.getTestMessageUrl(info)) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    return true;
  } catch (err) {
    console.error('Error sending receipt:', err);
    return false;
  }
};

exports.sendReminderEmail = async (to, invoice) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL || '"Invoice System" <noreply@invoicems.com>',
    to: to,
    subject: `Reminder: Invoice ${invoice.invoice_number} from ${invoice.org_name} is Due Soon`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Friendly Reminder, ${invoice.customer_name}</h2>
        <p>This is a quick reminder that your invoice from <strong>${invoice.org_name}</strong> is coming due on <strong>${invoice.due_date}</strong>.</p>
        <div style="background: #fdf6e3; padding: 15px; border-radius: 5px; border-left: 4px solid #f59f00;">
          <p><strong>Invoice #:</strong> ${invoice.invoice_number}</p>
          <p><strong>Amount Due:</strong> ${invoice.currency || '$'}${invoice.total.toFixed(2)}</p>
        </div>
        <p>You can conveniently view and pay your invoice online:</p>
        <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/portal/invoice/${invoice.client_token}" style="display: inline-block; padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">Pay Now</a></p>
      </div>
    `
  };

  try {
    const t = await getTransporter();
    const info = await t.sendMail(mailOptions);
    console.log(`Reminder sent to ${to}`);
    if (info.messageId && nodemailer.getTestMessageUrl(info)) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    return true;
  } catch (err) {
    console.error('Error sending reminder:', err);
    return false;
  }
};

exports.sendOverdueEmail = async (to, invoice) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL || '"Invoice System" <noreply@invoicems.com>',
    to: to,
    subject: `URGENT: Invoice ${invoice.invoice_number} is Overdue - ${invoice.org_name}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2 style="color: #e03131;">Overdue Invoice Notice</h2>
        <p>Dear ${invoice.customer_name},</p>
        <p>Our records indicate that your invoice from <strong>${invoice.org_name}</strong> is now past due. Please submit your payment immediately to avoid service interruption or late fees.</p>
        <div style="background: #fff5f5; padding: 15px; border-radius: 5px; border-left: 4px solid #e03131;">
          <p><strong>Invoice #:</strong> ${invoice.invoice_number}</p>
          <p><strong>Original Due Date:</strong> ${invoice.due_date}</p>
          <p><strong>Total Amount Overdue:</strong> <span style="color: #e03131; font-weight: bold;">${invoice.currency || '$'}${invoice.total.toFixed(2)}</span></p>
        </div>
        <p>Please resolve this immediately by paying through our secure portal:</p>
        <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/portal/invoice/${invoice.client_token}" style="display: inline-block; padding: 10px 20px; background: #e03131; color: white; text-decoration: none; border-radius: 5px;">Pay Outstanding Balance</a></p>
      </div>
    `
  };

  try {
    const t = await getTransporter();
    const info = await t.sendMail(mailOptions);
    console.log(`Overdue notice sent to ${to}`);
    if (info.messageId && nodemailer.getTestMessageUrl(info)) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    return true;
  } catch (err) {
    console.error('Error sending overdue notice:', err);
    return false;
  }
};

exports.sendInviteEmail = async (to, name, orgName, password) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL || '"Invoice System" <noreply@invoicems.com>',
    to: to,
    subject: `You have been invited to join ${orgName} on Invoice System`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Hello ${name},</h2>
        <p>You have been invited to join <strong>${orgName}</strong> on the Invoice System.</p>
        <p>Your account has been created with the following temporary credentials:</p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 5px;">
          <p><strong>Email:</strong> ${to}</p>
          <p><strong>Password:</strong> ${password}</p>
        </div>
        <p>Please log in and change your password as soon as possible.</p>
        <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="display: inline-block; padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">Login Now</a></p>
      </div>
    `
  };

  try {
    const t = await getTransporter();
    const info = await t.sendMail(mailOptions);
    console.log(`Invite email sent to ${to}`);
    if (info.messageId && nodemailer.getTestMessageUrl(info)) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    return true;
  } catch (err) {
    console.error('Error sending invite email:', err);
    return false;
  }
};

exports.sendWelcomeEmail = async (to, name, orgName) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL || '"Invoice System" <noreply@invoicems.com>',
    to: to,
    subject: `Welcome to Invoice System, ${name}!`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Welcome to the Invoice System!</h2>
        <p>Hi ${name},</p>
        <p>Your account for <strong>${orgName}</strong> has been successfully created.</p>
        <p>You can now log in to manage your invoices, track payments, and more.</p>
        <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="display: inline-block; padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">Go to Dashboard</a></p>
        <p>Thank you for joining us!</p>
      </div>
    `
  };

  try {
    const t = await getTransporter();
    const info = await t.sendMail(mailOptions);
    console.log(`Welcome email sent to ${to}`);
    if (info.messageId && nodemailer.getTestMessageUrl(info)) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    return true;
  } catch (err) {
    console.error('Error sending welcome email:', err);
    return false;
  }
};
