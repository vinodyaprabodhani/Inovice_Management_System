const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const seedData = async () => {
    console.log('🌱 Starting database seeding...');
    
    try {
        // 1. Create Organization
        const [orgResult] = await db.execute(
            'INSERT INTO organizations (name, address, email, phone, tax_id, currency, color_theme) VALUES (?, ?, ?, ?, ?, ?, ?)',
            ['Acme Professional Services', '123 Business Way, Silicon Valley, CA', 'contact@acme.com', '+1 (555) 987-6543', 'TAX-889900', 'USD', '#2563eb']
        );
        const orgId = orgResult.insertId;
        console.log('✅ Created Organization: Acme Professional Services');

        // 2. Create Admin User
        const hashedPassword = await bcrypt.hash('password123', 10);
        await db.execute(
            'INSERT INTO users (organization_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
            [orgId, 'Demo Admin', 'admin@demo.com', hashedPassword, 'admin']
        );
        console.log('✅ Created Admin User: admin@demo.com');

        // 3. Create Customers
        const customers = [
            ['Global Tech Solutions', 'billing@globaltech.com', '+1 (555) 111-2222', '456 Tech Park, NY'],
            ['Stellar Marketing', 'accounts@stellar.co', '+1 (555) 333-4444', '789 Creative St, LA']
        ];
        
        const customerIds = [];
        for (const c of customers) {
            const [cRes] = await db.execute(
                'INSERT INTO customers (organization_id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)',
                [orgId, ...c]
            );
            customerIds.push(cRes.insertId);
        }
        console.log('✅ Created 2 Customers');

        // 4. Create Products
        const products = [
            ['Monthly Retainer', 'Premium support & consulting', 2500.00, 10.00],
            ['UI/UX Design Package', 'Custom dashboard design', 4500.00, 5.00],
            ['Cloud Migration', 'Infrastructure setup', 12000.00, 15.00]
        ];

        for (const p of products) {
            await db.execute(
                'INSERT INTO products (organization_id, name, description, price, tax_rate) VALUES (?, ?, ?, ?, ?)',
                [orgId, ...p]
            );
        }
        console.log('✅ Created 3 Products');

        // 5. Create Invoices
        const [invResult] = await db.execute(
            'INSERT INTO invoices (organization_id, customer_id, invoice_number, date, due_date, status, subtotal, tax_amount, total, client_token) VALUES (?, ?, ?, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 14 DAY), ?, ?, ?, ?, ?)',
            [orgId, customerIds[0], 'INV-2026-001', 'sent', 2500.00, 250.00, 2750.00, uuidv4()]
        );
        
        await db.execute(
            'INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, tax_rate, tax_amount, total) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [invResult.insertId, 'Monthly Retainer', 1, 2500.00, 10.00, 250.00, 2750.00]
        );
        console.log('✅ Created 1 Sample Invoice');

        console.log('🚀 Seeding complete! Login with admin@demo.com / password123');
        process.exit(0);

    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
};

seedData();
