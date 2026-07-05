-- Database: invoice_management
-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS `invoice_management`;
USE `invoice_management`;

-- 1. Organizations Table
CREATE TABLE IF NOT EXISTS `organizations` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `address` TEXT,
    `email` VARCHAR(255),
    `phone` VARCHAR(50),
    `logo_url` VARCHAR(255),
    `tax_id` VARCHAR(100),
    `currency` VARCHAR(10) DEFAULT 'USD',
    `color_theme` VARCHAR(50) DEFAULT '#3b82f6',
    `whatsapp_sid` VARCHAR(255),
    `whatsapp_token` VARCHAR(255),
    `whatsapp_phone` VARCHAR(50),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `organization_id` INT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'staff', 'client') DEFAULT 'staff',
    `avatar` VARCHAR(255) DEFAULT NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE SET NULL
);

-- 3. Customers Table
CREATE TABLE IF NOT EXISTS `customers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `organization_id` INT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255),
    `phone` VARCHAR(50),
    `address` TEXT,
    `tax_id` VARCHAR(100),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE
);

-- 3.5 Customer Attachments Table
CREATE TABLE IF NOT EXISTS `customer_attachments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `customer_id` INT NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `file_url` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE
);

-- 4. Products Table
CREATE TABLE IF NOT EXISTS `products` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `organization_id` INT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `price` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `tax_rate` DECIMAL(5, 2) DEFAULT 0.00,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE
);

-- 5. Invoices Table
CREATE TABLE IF NOT EXISTS `invoices` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `organization_id` INT NOT NULL,
    `customer_id` INT NOT NULL,
    `invoice_number` VARCHAR(50) NOT NULL UNIQUE,
    `date` DATE NOT NULL,
    `due_date` DATE NOT NULL,
    `status` ENUM('draft', 'sent', 'paid', 'overdue', 'partially_paid') DEFAULT 'draft',
    `subtotal` DECIMAL(15, 2) DEFAULT 0.00,
    `tax_amount` DECIMAL(15, 2) DEFAULT 0.00,
    `discount` DECIMAL(15, 2) DEFAULT 0.00,
    `total` DECIMAL(15, 2) DEFAULT 0.00,
    `notes` TEXT,
    `client_token` VARCHAR(100) UNIQUE, -- For public client portal link
    `pdf_url` VARCHAR(255) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE
);

-- 6. Invoice Items Table
CREATE TABLE IF NOT EXISTS `invoice_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `invoice_id` INT NOT NULL,
    `product_id` INT,
    `description` VARCHAR(255) NOT NULL,
    `quantity` DECIMAL(10, 2) NOT NULL DEFAULT 1.00,
    `unit_price` DECIMAL(15, 2) NOT NULL,
    `tax_rate` DECIMAL(5, 2) DEFAULT 0.00,
    `tax_amount` DECIMAL(15, 2) DEFAULT 0.00,
    `total` DECIMAL(15, 2) NOT NULL,
    FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL
);

-- 7. Payments Table
CREATE TABLE IF NOT EXISTS `payments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `invoice_id` INT NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `payment_date` DATE NOT NULL,
    `payment_method` VARCHAR(50),
    `transaction_id` VARCHAR(100),
    `note` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE
);

-- 8. Expenses Table
CREATE TABLE IF NOT EXISTS `expenses` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `organization_id` INT NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `category` VARCHAR(100),
    `amount` DECIMAL(15, 2) NOT NULL,
    `date` DATE NOT NULL,
    `receipt_url` VARCHAR(255),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE
);

-- 9. Notifications Table
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `organization_id` INT NOT NULL,
    `invoice_id` INT,
    `type` VARCHAR(50) NOT NULL, -- Email, WhatsApp, etc.
    `recipient` VARCHAR(255),
    `status` VARCHAR(50), -- Sent, Failed
    `sent_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE SET NULL
);

-- 10. Audit Logs Table
CREATE TABLE IF NOT EXISTS `audit_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT,
    `action` VARCHAR(255) NOT NULL,
    `entity_type` VARCHAR(100),
    `entity_id` INT,
    `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
);
