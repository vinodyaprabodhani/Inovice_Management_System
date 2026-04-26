const db = require('../config/db');
const { logActivity } = require('../utils/logger');

// Add Expense
exports.create = async (req, res) => {
  const { description, category, amount, date } = req.body;
  const organizationId = req.organizationId;
  const receiptUrl = req.file ? `/uploads/receipts/${req.file.filename}` : null;

  try {
    const [result] = await db.execute(
      'INSERT INTO expenses (organization_id, description, category, amount, date, receipt_url) VALUES (?, ?, ?, ?, ?, ?)',
      [organizationId, description, category, amount, date, receiptUrl]
    );
    
    await logActivity(req.userId, `Added expense: ${description} (${amount})`, 'Expense', result.insertId);
    
    res.status(201).json({ message: 'Expense added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding expense' });
  }
};

// Get All Expenses
exports.getAll = async (req, res) => {
  const organizationId = req.organizationId;
  const { category, startDate, endDate } = req.query;

  try {
    let query = 'SELECT * FROM expenses WHERE organization_id = ?';
    let params = [organizationId];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (startDate && endDate) {
      query += ' AND date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += ' ORDER BY date DESC';

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching expenses' });
  }
};

// Delete Expense
exports.delete = async (req, res) => {
  const organizationId = req.organizationId;
  const { id } = req.params;

  try {
    const [result] = await db.execute('DELETE FROM expenses WHERE id = ? AND organization_id = ?', [id, organizationId]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Expense not found' });
    
    await logActivity(req.userId, `Deleted expense ID: ${id}`, 'Expense', id);
    
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting expense' });
  }
};
