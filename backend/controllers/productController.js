const db = require('../config/db');

// Create Product
exports.create = async (req, res) => {
  const { name, description, price, tax_rate, is_active } = req.body;
  const organizationId = req.organizationId;

  try {
    const [result] = await db.execute(
      'INSERT INTO products (organization_id, name, description, price, tax_rate, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [organizationId, name, description, price, tax_rate, is_active !== undefined ? is_active : true]
    );
    res.status(201).json({ message: 'Product created', productId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating product' });
  }
};

// Get All Products for Org
exports.getAll = async (req, res) => {
  const organizationId = req.organizationId;
  const { search, activeOnly } = req.query;

  try {
    let query = 'SELECT * FROM products WHERE organization_id = ?';
    let params = [organizationId];

    if (activeOnly === 'true') {
      query += ' AND is_active = TRUE';
    }
    if (search) {
      query += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching products' });
  }
};

// Get Single Product
exports.getById = async (req, res) => {
  const organizationId = req.organizationId;
  const { id } = req.params;

  try {
    const [rows] = await db.execute(
      'SELECT * FROM products WHERE id = ? AND organization_id = ?',
      [id, organizationId]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching product' });
  }
};

// Update Product
exports.update = async (req, res) => {
  const organizationId = req.organizationId;
  const { id } = req.params;
  const { name, description, price, tax_rate, is_active } = req.body;

  try {
    await db.execute(
      'UPDATE products SET name = ?, description = ?, price = ?, tax_rate = ?, is_active = ? WHERE id = ? AND organization_id = ?',
      [name, description, price, tax_rate, is_active, id, organizationId]
    );
    res.json({ message: 'Product updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating product' });
  }
};

// Delete Product
exports.delete = async (req, res) => {
  const organizationId = req.organizationId;
  const { id } = req.params;

  try {
    await db.execute('DELETE FROM products WHERE id = ? AND organization_id = ?', [id, organizationId]);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting product' });
  }
};
