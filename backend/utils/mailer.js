const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_user_id' || process.env.SMTP_PASS === 'your_email_password') {
    console.log("No valid SMTP credentials found. Please set your email password in .env.");
    console.log("Falling back to Ethereal Email for testing...");
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
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return transporter;
};

const generateEmailTemplate = (title, content, preheader = '') => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    .email-wrapper { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); }
    .email-header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 40px; text-align: center; color: #ffffff; }
    .email-header h1 { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
    .email-body { padding: 40px; color: #374151; font-size: 16px; line-height: 1.6; }
    .email-footer { background-color: #f9fafb; padding: 30px 40px; text-align: center; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; }
    .btn { display: inline-block; padding: 14px 28px; background-color: #2563eb; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; text-align: center; margin: 24px 0; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); transition: all 0.2s; }
    .btn:hover { background-color: #1d4ed8; box-shadow: 0 6px 8px -1px rgba(37, 99, 235, 0.3); }
    .data-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 24px 0; }
    .data-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
    .data-row:last-child { margin-bottom: 0; }
    .data-label { color: #64748b; font-weight: 500; font-size: 14px; }
    .data-value { color: #0f172a; font-weight: 600; font-size: 15px; text-align: right; }
    .highlight-amount { font-size: 28px; color: #0f172a; font-weight: 700; margin: 20px 0 10px; text-align: center; }
    .text-center { text-align: center; }
    .greeting { font-size: 20px; font-weight: 600; color: #111827; margin-bottom: 16px; }
    .success-text { color: #16a34a; }
    .danger-text { color: #dc2626; }
  </style>
</head>
<body>
  <div style="display: none; max-height: 0px; overflow: hidden;">${preheader || title}</div>
  <div class="email-wrapper">
    <div class="email-header">
      <h1>${title}</h1>
    </div>
    <div class="email-body">
      ${content}
    </div>
    <div class="email-footer">
      <p>Thank you for using our services.</p>
      <p style="margin-top: 16px; font-size: 12px; color: #9ca3af;">© ${new Date().getFullYear()} InvoicePro System. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

exports.sendInvoiceEmail = async (to, invoice) => {
  const amount = `${invoice.currency || '$'}${Number(invoice.total).toFixed(2)}`;
  const mailOptions = {
    from: process.env.FROM_EMAIL || '"InvoicePro System" <noreply@invoicems.com>',
    to: to,
    subject: `New Invoice ${invoice.invoice_number} from ${invoice.org_name}`,
    html: generateEmailTemplate(
      invoice.org_name,
      `
      <div class="greeting">Hello ${invoice.customer_name},</div>
      <p>You have received a new invoice from <strong>${invoice.org_name}</strong>.</p>
      
      <div class="data-box">
        <div class="data-row">
          <span class="data-label">Invoice Number</span>
          <span class="data-value">#${invoice.invoice_number}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Due Date</span>
          <span class="data-value">${invoice.due_date}</span>
        </div>
        <div class="highlight-amount">${amount}</div>
      </div>
      
      <div class="text-center">
        <p>You can securely view, download, or pay your invoice online:</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/portal/invoice/${invoice.client_token}" class="btn">View & Pay Invoice</a>
      </div>
      `,
      `New invoice ${invoice.invoice_number} for ${amount}`
    )
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
  const amount = `${invoice.currency || '$'}${parseFloat(paymentDetails.amount).toFixed(2)}`;
  const mailOptions = {
    from: process.env.FROM_EMAIL || '"InvoicePro System" <noreply@invoicems.com>',
    to: to,
    subject: `Payment Receipt for Invoice ${invoice.invoice_number} from ${invoice.org_name}`,
    html: generateEmailTemplate(
      'Payment Received',
      `
      <div class="greeting">Thank you, ${invoice.customer_name}!</div>
      <p>We successfully processed your payment of <strong class="success-text">${amount}</strong> to ${invoice.org_name}.</p>
      
      <div class="data-box" style="border-left: 4px solid #16a34a;">
        <div class="data-row">
          <span class="data-label">Invoice Number</span>
          <span class="data-value">#${invoice.invoice_number}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Payment Method</span>
          <span class="data-value">${paymentDetails.method}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Date Received</span>
          <span class="data-value">${new Date().toLocaleDateString()}</span>
        </div>
        <div class="highlight-amount success-text">${amount}</div>
      </div>
      
      <div class="text-center">
        <p>You can view your updated invoice status here:</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/portal/invoice/${invoice.client_token}" class="btn">View Updated Invoice</a>
      </div>
      `,
      `Your payment of ${amount} has been processed`
    )
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
  const amount = `${invoice.currency || '$'}${Number(invoice.total).toFixed(2)}`;
  const mailOptions = {
    from: process.env.FROM_EMAIL || '"InvoicePro System" <noreply@invoicems.com>',
    to: to,
    subject: `Reminder: Invoice ${invoice.invoice_number} from ${invoice.org_name} is Due Soon`,
    html: generateEmailTemplate(
      'Payment Reminder',
      `
      <div class="greeting">Friendly Reminder, ${invoice.customer_name}</div>
      <p>This is a quick reminder that your invoice from <strong>${invoice.org_name}</strong> is coming due on <strong>${invoice.due_date}</strong>.</p>
      
      <div class="data-box" style="border-left: 4px solid #f59e0b;">
        <div class="data-row">
          <span class="data-label">Invoice Number</span>
          <span class="data-value">#${invoice.invoice_number}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Due Date</span>
          <span class="data-value">${invoice.due_date}</span>
        </div>
        <div class="highlight-amount">${amount}</div>
      </div>
      
      <div class="text-center">
        <p>You can conveniently view and pay your invoice online:</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/portal/invoice/${invoice.client_token}" class="btn">Pay Now</a>
      </div>
      `,
      `Reminder: Your payment of ${amount} is due soon`
    )
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
  const amount = `${invoice.currency || '$'}${Number(invoice.total).toFixed(2)}`;
  const mailOptions = {
    from: process.env.FROM_EMAIL || '"InvoicePro System" <noreply@invoicems.com>',
    to: to,
    subject: `URGENT: Invoice ${invoice.invoice_number} is Overdue - ${invoice.org_name}`,
    html: generateEmailTemplate(
      'Overdue Notice',
      `
      <div class="greeting danger-text">Overdue Invoice Notice</div>
      <p>Dear ${invoice.customer_name},</p>
      <p>Our records indicate that your invoice from <strong>${invoice.org_name}</strong> is now past due. Please submit your payment immediately to avoid service interruption or late fees.</p>
      
      <div class="data-box" style="border-left: 4px solid #dc2626; background-color: #fef2f2;">
        <div class="data-row">
          <span class="data-label">Invoice Number</span>
          <span class="data-value">#${invoice.invoice_number}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Original Due Date</span>
          <span class="data-value">${invoice.due_date}</span>
        </div>
        <div class="highlight-amount danger-text">${amount}</div>
      </div>
      
      <div class="text-center">
        <p>Please resolve this immediately by paying through our secure portal:</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/portal/invoice/${invoice.client_token}" class="btn" style="background-color: #dc2626; box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.2);">Pay Outstanding Balance</a>
      </div>
      `,
      `URGENT: Your payment of ${amount} is overdue`
    )
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
    from: process.env.FROM_EMAIL || '"InvoicePro System" <noreply@invoicems.com>',
    to: to,
    subject: `You have been invited to join ${orgName} on InvoicePro`,
    html: generateEmailTemplate(
      'Organization Invitation',
      `
      <div class="greeting">Hello ${name},</div>
      <p>You have been invited to join <strong>${orgName}</strong> on the InvoicePro System.</p>
      <p>Your account has been created with the following temporary credentials:</p>
      
      <div class="data-box">
        <div class="data-row">
          <span class="data-label">Login Email</span>
          <span class="data-value">${to}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Temporary Password</span>
          <span class="data-value" style="font-family: monospace; letter-spacing: 1px;">${password}</span>
        </div>
      </div>
      
      <div class="text-center">
        <p>Please log in and change your password as soon as possible.</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="btn">Login to Your Account</a>
      </div>
      `,
      `You're invited to join ${orgName}`
    )
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
    from: process.env.FROM_EMAIL || '"InvoicePro System" <noreply@invoicems.com>',
    to: to,
    subject: `Welcome to InvoicePro System, ${name}!`,
    html: generateEmailTemplate(
      'Welcome Aboard!',
      `
      <div class="greeting">Welcome to the InvoicePro System!</div>
      <p>Hi ${name},</p>
      <p>Your account for <strong>${orgName}</strong> has been successfully created.</p>
      <p>We're thrilled to have you here. With InvoicePro, you can manage your invoices effortlessly, track payments, and streamline your entire billing process.</p>
      
      <div class="text-center" style="margin-top: 32px;">
        <p>Ready to get started?</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="btn">Go to Dashboard</a>
      </div>
      `,
      `Your account for ${orgName} is ready`
    )
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

exports.sendLoginEmail = async (to, name, orgName) => {
  const time = new Date().toLocaleString();
  const mailOptions = {
    from: process.env.FROM_EMAIL || '"InvoicePro System" <noreply@invoicems.com>',
    to: to,
    subject: `New Login to InvoicePro System`,
    html: generateEmailTemplate(
      'New Login Detected',
      `
      <div class="greeting">Hello ${name},</div>
      <p>We detected a new login to your account for <strong>${orgName}</strong>.</p>
      
      <div class="data-box" style="border-left: 4px solid #3b82f6;">
        <div class="data-row">
          <span class="data-label">Time</span>
          <span class="data-value">${time}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Account</span>
          <span class="data-value">${to}</span>
        </div>
      </div>
      
      <p>If this was you, you can safely ignore this email.</p>
      <div class="text-center" style="margin-top: 24px;">
        <p style="color: #6b7280; font-size: 14px;">If you didn't log in recently, please contact support or reset your password immediately.</p>
      </div>
      `,
      `New login detected for your account`
    )
  };

  try {
    const t = await getTransporter();
    const info = await t.sendMail(mailOptions);
    console.log(`Login email sent to ${to}`);
    if (info.messageId && nodemailer.getTestMessageUrl(info)) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    return true;
  } catch (err) {
    console.error('Error sending login email:', err);
    return false;
  }
};
