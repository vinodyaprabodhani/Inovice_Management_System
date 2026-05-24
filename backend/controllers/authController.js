const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail, sendLoginEmail } = require('../utils/mailer');
require('dotenv').config();

// Register
exports.register = async (req, res) => {
  const { name, email, password, organizationName } = req.body;

  // Validate username for special characters
  const hasSpecialChars = /[^a-zA-Z0-9\s_-]/.test(name);
  if (hasSpecialChars) {
    return res.status(400).json({ message: 'Invalid username.The username cannot contain special characters' });
  }

  try {
    // 1. Check if user already exists
    const [existing] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create Organization
    const [orgResult] = await db.execute(
      'INSERT INTO organizations (name) VALUES (?)',
      [organizationName || `${name}'s Organization`]
    );
    const orgId = orgResult.insertId;

    // 4. Create User
    const [userResult] = await db.execute(
      'INSERT INTO users (organization_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [orgId, name, email, hashedPassword, 'admin']
    );

    // 5. Send Welcome Email
    await sendWelcomeEmail(email, name, organizationName || `${name}'s Organization`);

    res.status(201).json({ message: 'User registered successfully', userId: userResult.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user
    const [users] = await db.execute(
      'SELECT u.*, o.name as org_name FROM users u LEFT JOIN organizations o ON u.organization_id = o.id WHERE u.email = ?',
      [email]
    );
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 3. Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, organizationId: user.organization_id },
      process.env.JWT_SECRET || 'supersecretkey123',
      { expiresIn: '24h' }
    );

    // 4. Send Login Confirmation Email
    sendLoginEmail(user.email, user.name, user.org_name);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organization_id,
        organizationName: user.org_name,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
