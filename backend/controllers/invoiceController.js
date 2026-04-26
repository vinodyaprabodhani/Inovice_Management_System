const db = require('../config/db');
// trigger restart
const { v4: uuidv4 } = require('uuid'); // I should have installed this, but I can use a simple hash

const crypto = require('crypto');

// Create Invoice
exports.create = async (req, res) => {
  const { customer_id, invoice_number, date, due_date, items, notes, discount, status } = req.body;
  const organizationId = req.organizationId;

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    let subtotal = 0;
    let totalTaxAmount = 0;

    // 1. Calculate totals from items
    const processedItems = items.map(item => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unit_price) || 0;
      const taxRate = parseFloat(item.tax_rate) || 0;
      
      const itemTotal = quantity * unitPrice;
      const itemTaxAmount = (itemTotal * taxRate) / 100;
      const itemFinalTotal = itemTotal + itemTaxAmount;

      subtotal += itemTotal;
      totalTaxAmount += itemTaxAmount;

      return {
        ...item,
        quantity,
        unit_price: unitPrice,
        tax_rate: taxRate,
        tax_amount: itemTaxAmount,
        total: itemFinalTotal
      };
    });

    const totalDiscount = parseFloat(discount) || 0;
    const finalTotal = subtotal + totalTaxAmount - totalDiscount;

    // 2. Insert Invoice
    const clientToken = crypto.randomBytes(16).toString('hex');
    const [invResult] = await connection.execute(
      'INSERT INTO invoices (organization_id, customer_id, invoice_number, date, due_date, status, subtotal, tax_amount, discount, total, notes, client_token) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [organizationId, customer_id, invoice_number, date, due_date, status || 'sent', subtotal, totalTaxAmount, totalDiscount, finalTotal, notes, clientToken]
    );
    const invoiceId = invResult.insertId;

    // 3. Insert Invoice Items
    for (const item of processedItems) {
      await connection.execute(
        'INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, tax_rate, tax_amount, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [invoiceId, item.product_id || null, item.description, item.quantity, item.unit_price, item.tax_rate, item.tax_amount, item.total]
      );
    }

    await connection.commit();

    // 4. Trigger Automatic Notifications if status is 'sent'
    if (!status || status === 'sent') {
      const { dispatchInvoiceNotifications } = require('./notificationController');
      dispatchInvoiceNotifications(invoiceId, organizationId);
    }

    res.status(201).json({ message: 'Invoice created successfully', invoiceId });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: 'Error creating invoice' });
  } finally {
    connection.release();
  }
};

// Get All Invoices
exports.getAll = async (req, res) => {
  const organizationId = req.organizationId;
  const { status, customer_id } = req.query;

  try {
    let query = `
      SELECT i.*, c.name as customer_name 
      FROM invoices i 
      JOIN customers c ON i.customer_id = c.id 
      WHERE i.organization_id = ?
    `;
    let params = [organizationId];

    if (status) {
      if (Array.isArray(status)) {
        query += ` AND i.status IN (${status.map(() => '?').join(',')})`;
        params.push(...status);
      } else {
        query += ' AND i.status = ?';
        params.push(status);
      }
    }
    if (customer_id) {
      query += ' AND i.customer_id = ?';
      params.push(customer_id);
    }

    query += ' ORDER BY i.created_at DESC';

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching invoices' });
  }
};

// Get Single Invoice with Items
exports.getById = async (req, res) => {
  const organizationId = req.organizationId;
  const { id } = req.params;

  try {
    const [invoices] = await db.execute(
      `SELECT i.*, c.name as customer_name, c.email as customer_email, c.address as customer_address, c.phone as customer_phone
       FROM invoices i 
       JOIN customers c ON i.customer_id = c.id 
       WHERE i.id = ? AND i.organization_id = ?`,
      [id, organizationId]
    );

    if (invoices.length === 0) return res.status(404).json({ message: 'Invoice not found' });

    const [items] = await db.execute(
      'SELECT * FROM invoice_items WHERE invoice_id = ?',
      [id]
    );

    res.json({ ...invoices[0], items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching invoice' });
  }
};

// Update Invoice
exports.update = async (req, res) => {
  const { customer_id, date, due_date, items, notes, discount, status } = req.body;
  const { id } = req.params;
  const organizationId = req.organizationId;

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    let subtotal = 0;
    let totalTaxAmount = 0;

    const processedItems = items.map(item => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unit_price) || 0;
      const taxRate = parseFloat(item.tax_rate) || 0;
      const itemTotal = quantity * unitPrice;
      const itemTaxAmount = (itemTotal * taxRate) / 100;
      const itemFinalTotal = itemTotal + itemTaxAmount;

      subtotal += itemTotal;
      totalTaxAmount += itemTaxAmount;

      return { ...item, quantity, unit_price: unitPrice, tax_rate: taxRate, tax_amount: itemTaxAmount, total: itemFinalTotal };
    });

    const totalDiscount = parseFloat(discount) || 0;
    const finalTotal = subtotal + totalTaxAmount - totalDiscount;

    // 1. Update Invoice
    await connection.execute(
      'UPDATE invoices SET customer_id = ?, date = ?, due_date = ?, status = ?, subtotal = ?, tax_amount = ?, discount = ?, total = ?, notes = ? WHERE id = ? AND organization_id = ?',
      [customer_id, date, due_date, status || 'sent', subtotal, totalTaxAmount, totalDiscount, finalTotal, notes, id, organizationId]
    );

    // 2. Delete existing items
    await connection.execute('DELETE FROM invoice_items WHERE invoice_id = ?', [id]);

    // 3. Insert updated items
    for (const item of processedItems) {
      await connection.execute(
        'INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, tax_rate, tax_amount, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, item.product_id || null, item.description, item.quantity, item.unit_price, item.tax_rate, item.tax_amount, item.total]
      );
    }

    await connection.commit();
    res.json({ message: 'Invoice updated successfully' });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: 'Error updating invoice' });
  } finally {
    connection.release();
  }
};

// Delete Invoice
exports.delete = async (req, res) => {
  const { id } = req.params;
  const organizationId = req.organizationId;

  try {
    await db.execute('DELETE FROM invoices WHERE id = ? AND organization_id = ?', [id, organizationId]);
    res.json({ message: 'Invoice deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting invoice' });
  }
};

// Generate PDF (Utility)
const PDFDocument = require('pdfkit');
const fs = require('fs');

exports.generatePDF = async (req, res) => {
  const { id } = req.params;
  const organizationId = req.organizationId;

  try {
    const [invoices] = await db.execute(
      `SELECT i.*, c.name as customer_name, c.email as customer_email, c.address as customer_address, o.name as org_name, o.address as org_address, o.logo_url as org_logo, o.color_theme as org_color_theme 
       FROM invoices i 
       JOIN customers c ON i.customer_id = c.id 
       JOIN organizations o ON i.organization_id = o.id 
       WHERE i.id = ? AND i.organization_id = ?`,
      [id, organizationId]
    );

    if (invoices.length === 0) return res.status(404).json({ message: 'Invoice not found' });
    const invoice = invoices[0];

    const [items] = await db.execute('SELECT * FROM invoice_items WHERE invoice_id = ?', [id]);

    const doc = new PDFDocument({ margins: { top: 50, left: 50, right: 50, bottom: 0 }, size: 'A4' });
    let filename = `invoice_${invoice.invoice_number}.pdf`;

    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    const themeColor = invoice.org_color_theme || '#3b82f6';
    
    // Top Decorative Bar
    doc.rect(0, 0, doc.page.width, 10).fill(themeColor);

    // Document Header
    let currentY = 50;

    // Organization Info (Left)
    doc.fillColor('#333333').fontSize(24).font('Helvetica-Bold').text(invoice.org_name || 'Company Name', 50, currentY);
    doc.fontSize(10).font('Helvetica').fillColor('#666666').text(invoice.org_address || '', 50, currentY + 30, { width: 250 });

    // Invoice Title & Details (Right)
    doc.fillColor(themeColor).fontSize(28).font('Helvetica-Bold').text('INVOICE', 0, currentY, { align: 'right', width: doc.page.width - 50 });
    
    const detailsY = currentY + 35;
    doc.fontSize(10).fillColor('#333333').font('Helvetica-Bold').text('Invoice #:', doc.page.width - 200, detailsY, { align: 'left', width: 70 });
    doc.font('Helvetica').text(invoice.invoice_number, doc.page.width - 130, detailsY, { align: 'right', width: 80 });

    doc.font('Helvetica-Bold').text('Date:', doc.page.width - 200, detailsY + 15, { align: 'left', width: 70 });
    doc.font('Helvetica').text(invoice.date ? new Date(invoice.date).toLocaleDateString() : '', doc.page.width - 130, detailsY + 15, { align: 'right', width: 80 });

    doc.font('Helvetica-Bold').text('Due Date:', doc.page.width - 200, detailsY + 30, { align: 'left', width: 70 });
    doc.font('Helvetica').text(invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '', doc.page.width - 130, detailsY + 30, { align: 'right', width: 80 });

    // Bill To Section
    currentY = 150;
    
    doc.rect(50, currentY, 280, 90).fill('#f8fafc');
    doc.fillColor(themeColor).fontSize(12).font('Helvetica-Bold').text('BILL TO', 65, currentY + 15);
    doc.fillColor('#333333').fontSize(11).font('Helvetica-Bold').text(invoice.customer_name || 'Customer', 65, currentY + 35);
    doc.fontSize(10).font('Helvetica').fillColor('#666666').text(invoice.customer_email || '', 65, currentY + 50);
    doc.text(invoice.customer_address || '', 65, currentY + 65, { width: 250 });

    // Table Header
    currentY = 270;
    doc.rect(50, currentY, doc.page.width - 100, 25).fill(themeColor);
    
    const colX = { desc: 65, qty: 330, price: 400, total: 470 };
    
    doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold');
    doc.text('Description', colX.desc, currentY + 7);
    doc.text('Qty', colX.qty, currentY + 7);
    doc.text('Price', colX.price, currentY + 7);
    doc.text('Total', colX.total, currentY + 7);

    // Table Rows
    currentY += 25;
    let alternate = false;

    items.forEach(item => {
      if (currentY > doc.page.height - 150) {
        doc.addPage();
        currentY = 50;
      }
      
      if (alternate) {
        doc.rect(50, currentY, doc.page.width - 100, 25).fill('#f8fafc');
      }
      
      doc.fillColor('#333333').font('Helvetica').fontSize(10);
      doc.text(item.description || 'Item', colX.desc, currentY + 7, { width: 250, height: 15, lineBreak: false, ellipsis: true });
      doc.text(Number(item.quantity || 0).toString(), colX.qty, currentY + 7);
      doc.text(`$${Number(item.unit_price || 0).toFixed(2)}`, colX.price, currentY + 7);
      doc.text(`$${Number(item.total || 0).toFixed(2)}`, colX.total, currentY + 7);
      
      currentY += 25;
      alternate = !alternate;
    });

    // Divider
    doc.moveTo(50, currentY).lineTo(doc.page.width - 50, currentY).strokeColor('#e2e8f0').lineWidth(1).stroke();

    // Summary Section
    currentY += 20;
    const summaryX = doc.page.width - 250;
    
    doc.font('Helvetica-Bold').fillColor('#666666').text('Subtotal:', summaryX, currentY, { width: 100 });
    doc.font('Helvetica').fillColor('#333333').text(`$${Number(invoice.subtotal || 0).toFixed(2)}`, summaryX + 100, currentY, { align: 'right', width: 100 });
    
    currentY += 20;
    doc.font('Helvetica-Bold').fillColor('#666666').text('Tax:', summaryX, currentY, { width: 100 });
    doc.font('Helvetica').fillColor('#333333').text(`$${Number(invoice.tax_amount || 0).toFixed(2)}`, summaryX + 100, currentY, { align: 'right', width: 100 });
    
    currentY += 20;
    doc.font('Helvetica-Bold').fillColor('#666666').text('Discount:', summaryX, currentY, { width: 100 });
    doc.font('Helvetica').fillColor('#333333').text(`-$${Number(invoice.discount || 0).toFixed(2)}`, summaryX + 100, currentY, { align: 'right', width: 100 });
    
    currentY += 25;
    doc.rect(summaryX - 10, currentY - 10, 230, 40).fill('#f8fafc');
    doc.font('Helvetica-Bold').fillColor(themeColor).fontSize(14).text('Total Due:', summaryX, currentY);
    doc.font('Helvetica-Bold').fillColor(themeColor).fontSize(16).text(`$${Number(invoice.total || 0).toFixed(2)}`, summaryX + 100, currentY - 2, { align: 'right', width: 100 });

    // Notes
    if (invoice.notes) {
      currentY += 60;
      doc.font('Helvetica-Bold').fillColor('#333333').fontSize(10).text('Notes:', 50, currentY);
      doc.font('Helvetica').fillColor('#666666').text(invoice.notes, 50, currentY + 15, { width: 400 });
    }

    // Footer
    const bottom = doc.page.height - 50;
    doc.rect(0, bottom + 35, doc.page.width, 15).fill(themeColor);
    doc.font('Helvetica').fontSize(9).fillColor('#94a3b8').text('Thank you for your business!', 0, bottom, { align: 'center', width: doc.page.width });

    doc.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error generating PDF', error: err.message, stack: err.stack });
    } else {
      res.end();
    }
  }
};

// Public Access by Token
exports.getByToken = async (req, res) => {
  const { token } = req.params;

  try {
    const [invoices] = await db.execute(
      `SELECT i.*, c.name as customer_name, o.name as org_name, o.logo_url as org_logo, o.address as org_address, o.tax_id as org_tax_id, o.currency as org_currency
       FROM invoices i 
       JOIN customers c ON i.customer_id = c.id 
       JOIN organizations o ON i.organization_id = o.id 
       WHERE i.client_token = ?`,
      [token]
    );

    if (invoices.length === 0) return res.status(404).json({ message: 'Invoice not found' });
    const invoice = invoices[0];

    const [items] = await db.execute('SELECT * FROM invoice_items WHERE invoice_id = ?', [invoice.id]);

    res.json({ ...invoice, items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching invoice' });
  }
};
