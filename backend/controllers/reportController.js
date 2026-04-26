const db = require('../config/db');

// Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  const organizationId = req.organizationId;
  
  try {
    // 1. Total Revenue (Paid + Partially Paid)
    const [totalRevenue] = await db.execute(
      'SELECT SUM(amount) as revenue FROM payments p JOIN invoices i ON p.invoice_id = i.id WHERE i.organization_id = ?',
      [organizationId]
    );

    // 2. Total Outstanding Balance
    const [outstanding] = await db.execute(
      'SELECT SUM(total - COALESCE((SELECT SUM(amount) FROM payments WHERE invoice_id = invoices.id), 0)) as balance FROM invoices WHERE organization_id = ? AND status != "paid"',
      [organizationId]
    );

    // 3. Invoice status counts
    const [counts] = await db.execute(
      'SELECT status, COUNT(*) as count FROM invoices WHERE organization_id = ? GROUP BY status',
      [organizationId]
    );

    // 4. Recent Activities (Audit Logs)
    const [activities] = await db.execute(
      'SELECT * FROM audit_logs WHERE user_id IN (SELECT id FROM users WHERE organization_id = ?) ORDER BY timestamp DESC LIMIT 50',
      [organizationId]
    );

    // 5. Monthly income data for chart (Last 6 months)
    const [monthly] = await db.execute(
      'SELECT DATE_FORMAT(payment_date, "%b") as month, SUM(amount) as total FROM payments p JOIN invoices i ON p.invoice_id = i.id WHERE i.organization_id = ? AND p.payment_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) GROUP BY month ORDER BY p.payment_date ASC',
      [organizationId]
    );

    // 6. Expenses summary
    const [expenses] = await db.execute(
      'SELECT SUM(amount) as total FROM expenses WHERE organization_id = ?',
      [organizationId]
    );

    // 7. Customers Count
    const [customers] = await db.execute(
      'SELECT COUNT(*) as count FROM customers WHERE organization_id = ?',
      [organizationId]
    );

    res.json({
      revenue: totalRevenue[0].revenue || 0,
      outstanding: outstanding[0].balance || 0,
      expenses: expenses[0].total || 0,
      customersCount: customers[0].count || 0,
      counts,
      activities: activities || [],
      monthlyChart: monthly || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching report stats' });
  }
};

// Financial Detailed Report (Revenue, Expenses, Profit/Loss)
exports.getFinancialReport = async (req, res) => {
    const organizationId = req.organizationId;
    const { startDate, endDate } = req.query;

    try {
        let whereClause = ' WHERE organization_id = ?';
        let params = [organizationId];

        if (startDate && endDate) {
            whereClause += ' AND date BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        const [revenue] = await db.execute(
            'SELECT SUM(total) as total FROM invoices WHERE organization_id = ?' + (startDate ? ' AND date BETWEEN ? AND ?' : ''),
            startDate ? [organizationId, startDate, endDate] : [organizationId]
        );

        const [expenses] = await db.execute(
            'SELECT SUM(amount) as total FROM expenses' + whereClause,
            params
        );

        const [payments] = await db.execute(
            'SELECT SUM(amount) as total FROM payments p JOIN invoices i ON p.invoice_id = i.id WHERE i.organization_id = ?' + (startDate ? ' AND p.payment_date BETWEEN ? AND ?' : ''),
            startDate ? [organizationId, startDate, endDate] : [organizationId]
        );

        res.json({
            totalInvoiced: revenue[0].total || 0,
            totalReceived: payments[0].total || 0,
            totalExpenses: expenses[0].total || 0,
            grossProfit: (payments[0].total || 0) - (expenses[0].total || 0)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error generating financial report' });
    }
};
