const db = require('../config/db');
const { logActivity } = require('../utils/logger');
const { encrypt, decrypt } = require('../utils/crypto');

// Get Organization General Settings
exports.getSettings = async (req, res) => {
  const organizationId = req.organizationId;
  try {
    const [rows] = await db.execute('SELECT * FROM organizations WHERE id = ?', [organizationId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Organization not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching organization settings' });
  }
};

// Update Organization Settings
exports.updateSettings = async (req, res) => {
  const organizationId = req.organizationId;
  const { name, address, email, phone, tax_id, currency, color_theme } = req.body;
  const logoUrl = req.file ? `/uploads/logos/${req.file.filename}` : undefined;

  try {
    let query = 'UPDATE organizations SET name = ?, address = ?, email = ?, phone = ?, tax_id = ?, currency = ?, color_theme = ?';
    let params = [name, address, email, phone, tax_id, currency, color_theme];

    if (logoUrl) {
      query += ', logo_url = ?';
      params.push(logoUrl);
    }
    
    query += ' WHERE id = ?';
    params.push(organizationId);

    await db.execute(query, params);
    
    await logActivity(req.userId, 'Updated organization settings', 'Organization', organizationId);
    
    res.json({ message: 'Organization settings updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating organization settings' });
  }
};

// Get WhatsApp Configuration
exports.getWhatsAppConfig = async (req, res) => {
  const organizationId = req.organizationId;
  try {
    const [rows] = await db.execute(
      'SELECT whatsapp_sid, whatsapp_token, whatsapp_phone FROM organizations WHERE id = ?', 
      [organizationId]
    );
    
    let config = rows[0] || {};
    if (config.whatsapp_sid) config.whatsapp_sid = decrypt(config.whatsapp_sid);
    if (config.whatsapp_token) config.whatsapp_token = decrypt(config.whatsapp_token);

    res.json(config);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching WhatsApp settings' });
  }
};

// Update WhatsApp Configuration
exports.updateWhatsAppConfig = async (req, res) => {
  const organizationId = req.organizationId;
  const { whatsapp_sid, whatsapp_token, whatsapp_phone } = req.body;

  try {
    const encSid = encrypt(whatsapp_sid);
    const encToken = encrypt(whatsapp_token);

    await db.execute(
      'UPDATE organizations SET whatsapp_sid = ?, whatsapp_token = ?, whatsapp_phone = ? WHERE id = ?',
      [encSid, encToken, whatsapp_phone, organizationId]
    );
    
    await logActivity(req.userId, 'Updated WhatsApp configuration', 'Organization', organizationId);
    
    res.json({ message: 'WhatsApp configuration updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating WhatsApp configuration' });
  }
};
