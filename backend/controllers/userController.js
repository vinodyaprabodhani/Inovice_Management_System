const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { logActivity } = require('../utils/logger');
const { sendInviteEmail } = require('../utils/mailer');

// Get all users in the organization
exports.getOrgUsers = async (req, res) => {
  const orgId = req.organizationId;
  try {
    const [rows] = await db.execute(
      'SELECT id, name, email, role, is_active, created_at FROM users WHERE organization_id = ?',
      [orgId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Create/Invite new user
exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const orgId = req.organizationId;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (organization_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [orgId, name, email, hashedPassword, role || 'staff']
    );
    
    await logActivity(req.userId, `Created new user: ${name} (${role})`, 'User', result.insertId);
    
    // Fetch org name for the email
    const [orgResult] = await db.execute('SELECT name FROM organizations WHERE id = ?', [orgId]);
    const orgName = orgResult[0]?.name || 'our organization';
    
    // Send invitation email
    await sendInviteEmail(email, name, orgName, password);
    
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Email already exists' });
    console.error(err);
    res.status(500).json({ message: 'Error creating user' });
  }
};

// Update User Status or Role
exports.updateUser = async (req, res) => {
    const { role, is_active } = req.body;
    const { id } = req.params;
    const orgId = req.organizationId;

    try {
        await db.execute(
            'UPDATE users SET role = ?, is_active = ? WHERE id = ? AND organization_id = ?',
            [role, is_active, id, orgId]
        );
        res.json({ message: 'User updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating user' });
    }
};

// Update Own Profile
exports.updateProfile = async (req, res) => {
  const { name, email, password, removeAvatar } = req.body;
  const userId = req.userId;
  let avatarUrl = null;

  if (req.file) {
    avatarUrl = `/uploads/avatars/${req.file.filename}`;
  } else if (removeAvatar === 'true') {
    avatarUrl = 'REMOVE';
  }

  try {
    let query = 'UPDATE users SET name = ?, email = ?';
    const queryParams = [name, email];

    if (password) {
      query += ', password = ?';
      queryParams.push(await bcrypt.hash(password, 10));
    }

    if (avatarUrl === 'REMOVE') {
      query += ', avatar = NULL';
    } else if (avatarUrl) {
      query += ', avatar = ?';
      queryParams.push(avatarUrl);
    }

    query += ' WHERE id = ?';
    queryParams.push(userId);

    await db.execute(query, queryParams);
    
    await logActivity(req.userId, `Updated their profile`, 'User', userId);
    res.json({ message: 'Profile updated successfully.', avatar: avatarUrl });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Email already exists' });
    console.error(err);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// Remove User
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  const orgId = req.organizationId;

  try {
    const [result] = await db.execute(
      'DELETE FROM users WHERE id = ? AND organization_id = ? AND role != "admin"',
      [id, orgId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found or cannot delete admin' });
    
    await logActivity(req.userId, `Removed user ID: ${id}`, 'User', id);
    
    res.json({ message: 'User removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error removing user' });
  }
};
