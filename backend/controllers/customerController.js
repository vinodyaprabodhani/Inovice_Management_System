const db = require('../config/db');

// Create Customer
exports.create = async (req, res) => {
  const { name, email, phone, address, tax_id } = req.body;
  const organizationId = req.organizationId;

  try {
    const [result] = await db.execute(
      'INSERT INTO customers (organization_id, name, email, phone, address, tax_id) VALUES (?, ?, ?, ?, ?, ?)',
      [organizationId, name, email || null, phone || null, address || null, tax_id || null]
    );
    res.status(201).json({ message: 'Customer created', customerId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating customer' });
  }
};

// Get All Customers for Org
exports.getAll = async (req, res) => {
  const organizationId = req.organizationId;
  const { search } = req.query;

  try {
    let query = 'SELECT * FROM customers WHERE organization_id = ?';
    let params = [organizationId];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching customers' });
  }
};

// Get Single Customer
exports.getById = async (req, res) => {
  const organizationId = req.organizationId;
  const { id } = req.params;

  try {
    const [rows] = await db.execute(
      'SELECT * FROM customers WHERE id = ? AND organization_id = ?',
      [id, organizationId]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Customer not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching customer' });
  }
};

// Update Customer
exports.update = async (req, res) => {
  const organizationId = req.organizationId;
  const { id } = req.params;
  const { name, email, phone, address, tax_id } = req.body;

  try {
    await db.execute(
      'UPDATE customers SET name = ?, email = ?, phone = ?, address = ?, tax_id = ? WHERE id = ? AND organization_id = ?',
      [name, email, phone, address, tax_id, id, organizationId]
    );
    res.json({ message: 'Customer updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating customer' });
  }
};

// Delete Customer
exports.delete = async (req, res) => {
  const organizationId = req.organizationId;
  const { id } = req.params;

  try {
    await db.execute('DELETE FROM customers WHERE id = ? AND organization_id = ?', [id, organizationId]);
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting customer' });
  }
};
