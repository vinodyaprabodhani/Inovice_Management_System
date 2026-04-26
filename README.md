# InvoicePro Management System

A modern, professional, cloud-ready SaaS Invoice Management System designed for businesses to streamline billing, customer relationships, and financial tracking.

## 🚀 Key Features

- **Comprehensive Dashboard**: Real-time revenue analytics, outstanding invoices, and expense oversight using beautiful Recharts visualizations.
- **Advanced Invoice Engine**: Modular creation system with automated tax calculations, discounts, and professional branding.
- **Multi-Channel Notifications**: Built-in support for **Email** (Nodemailer) and **WhatsApp** (Twilio/WhatsApp Business API) invoice delivery.
- **Secure Client Portal**: Dedicated, branded portal for clients to view, download, and pay for their invoices securely.
- **Staff & Roles**: Robust Role-Based Access Control (RBAC) to manage team permissions.
- **Expense Management**: Track business spending with receipt uploads and category analytics.
- **Rich Reporting**: Detailed financial statements including Profit & Loss and revenue collection progress.
- **Branding & Customization**: Upload company logos and customize invoice themes.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS (Utility-first styling), Lucide Icons, Recharts (Analytics).
- **Backend**: Node.js, Express.js (Modular Controller Architecture).
- **Database**: MySQL (Optimized for multi-organization scaling).
- **Security**: JWT Authentication, Bcrypt Password Encryption, CORS protection.
- **Services**: Twilio (WhatsApp), Nodemailer (Email), PDFKit (Invoice PDF Generation).

## 📋 Prerequisites

- **Node.js**: v18.0.0+
- **MySQL**: Server running locally (XAMPP/WAMP) or on a cloud provider.
- **Optional**: Twilio Account (for WhatsApp), SMTP Server (for Email).

## ⚙️ Installation & Setup

### 1. Database Configuration

1. Create a database in MySQL: `CREATE DATABASE invoice_management;`
2. Import the `database.sql` file from the root directory into your database.

### 2. Backend Installation

1. Navigate to `/backend`.
2. Install dependencies: `npm install`
3. Configure environment variables in `.env`:

   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=your_password
   DB_NAME=invoice_management
   JWT_SECRET=your_secure_secret
   FRONTEND_URL=http://localhost:5173
   
   # Notifications (Optional)
   SMTP_HOST=smtp.mailtrap.io
   SMTP_PORT=587
   SMTP_USER=your_user
   SMTP_PASS=your_pass
   
   TWILIO_SID=your_sid
   TWILIO_TOKEN=your_token
   ```

4. Start the server: `npm run dev`

### 3. Frontend Installation

1. Navigate to `/frontend`.
2. Install dependencies: `npm install`
3. Start the application: `npm run dev`
4. Access the app at `http://localhost:5173`.

### 4. Demo Data (Recommended)

To quickly populate the system with professional demo data:

1. Open a terminal in `/backend`.
2. Run: `node scripts/seed.js`
3. **Login Details**:
   - **Email**: `admin@acme.com`
   - **Password**: `password123`

## 📁 Project Structure

```text
/backend
  /controllers  - Business logic handlers
  /routes       - API route definitions
  /middleware   - Security and authentication
  /utils        - Helpers (logger, email, PDF generation)
  /scripts      - Seeder scripts for demo data
/frontend
  /src/pages    - UI screens (Dashboard, Invoices, Reports, etc.)
  /src/components- Reusable UI atoms
  /src/context  - State management (Auth)
/uploads        - Local storage for receipts and logos
```
