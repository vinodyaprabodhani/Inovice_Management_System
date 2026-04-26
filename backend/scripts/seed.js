const db = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const seed = async () => {
    try {
        console.log('Starting Seeder...');

        // 1. Create Organization
        const [orgResult] = await db.execute(
            'INSERT INTO organizations (name, address, email, phone, currency, color_theme) VALUES (?, ?, ?, ?, ?, ?)',
            ['Acme Worldwide Ltd', '123 Business Ave, New York, NY', 'billing@acme.com', '+1555012345', 'USD', '#2563eb']
        );
        const orgId = orgResult.insertId;

        // 2. Create Admin User
        const hashedPassword = await bcrypt.hash('password123', 10);
        await db.execute(
            'INSERT INTO users (organization_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
            [orgId, 'Admin User', 'admin@acme.com', hashedPassword, 'admin']
        );

        // 3. Create Customers
        const [cust1] = await db.execute(
            'INSERT INTO customers (organization_id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)',
            [orgId, 'Global Tech Solutions', 'contact@globaltech.com', '+1555987654', '456 Innovation Way, San Francisco, CA']
        );
        const [cust2] = await db.execute(
            'INSERT INTO customers (organization_id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)',
            [orgId, 'Creative Studio Inc', 'hello@creativestudio.com', '+1555444333', '789 Design Blvd, Austin, TX']
        );

        // 4. Create Products
        const [prod1] = await db.execute(
            'INSERT INTO products (organization_id, name, description, price, tax_rate) VALUES (?, ?, ?, ?, ?)',
            [orgId, 'Web Development', 'Custom React.js website development', 2500.00, 5.0]
        );
        const [prod2] = await db.execute(
            'INSERT INTO products (organization_id, name, description, price, tax_rate) VALUES (?, ?, ?, ?, ?)',
            [orgId, 'SEO Optimization', 'Monthly search engine optimization', 800.00, 0.0]
        );

        // 5. Create Invoices
        const clientToken = crypto.randomBytes(16).toString('hex');
        const [invResult] = await db.execute(
            'INSERT INTO invoices (organization_id, customer_id, invoice_number, date, due_date, status, subtotal, tax_amount, total, client_token) VALUES (?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), ?, ?, ?, ?, ?)',
            [orgId, cust1.insertId, 'INV-1001', 'sent', 3300.00, 125.00, 3425.00, clientToken]
        );
        const invoiceId = invResult.insertId;

        // 6. Create Invoice Items
        await db.execute(
            'INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, tax_rate, tax_amount, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [invoiceId, prod1.insertId, 'Web Development', 1, 2500.00, 5.0, 125.00, 2625.00]
        );
        await db.execute(
            'INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, tax_rate, tax_amount, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [invoiceId, prod2.insertId, 'SEO Optimization', 1, 800.00, 0.0, 0.0, 800.00]
        );

        // 7. Create Expense
        await db.execute(
            'INSERT INTO expenses (organization_id, description, category, amount, date) VALUES (?, ?, ?, ?, CURDATE())',
            [orgId, 'AWS Cloud Hosting', 'Software', 150.00]
        );

        console.log('Seeding completed successfully! 🚀');
        console.log('Login with: admin@acme.com / password123');
        process.exit();
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seed();
