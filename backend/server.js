const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Simple Route
app.get('/', (req, res) => {
  res.send('Invoice Management System API is running...');
});

// Import Routes
const authRoutes = require('./routes/auth');
const orgRoutes = require('./routes/organization');
const customerRoutes = require('./routes/customers');
const productRoutes = require('./routes/products');
const invoiceRoutes = require('./routes/invoices');
const paymentRoutes = require('./routes/payments');
const expenseRoutes = require('./routes/expenses');
const reportRoutes = require('./routes/reports');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/organization', orgRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

const db = require('./config/db');

// Ensure users table has avatar column
db.query("SHOW COLUMNS FROM users LIKE 'avatar'")
  .then(([rows]) => {
    if (rows.length === 0) {
      return db.query("ALTER TABLE users ADD COLUMN avatar VARCHAR(255) DEFAULT NULL");
    }
  })
  .catch(console.error);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
