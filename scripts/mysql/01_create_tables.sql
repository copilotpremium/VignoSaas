-- Hotel Booking SaaS - MySQL Database Schema
-- Run this script in your cPanel phpMyAdmin or MySQL command line

-- Create database (if not already created in cPanel)
-- CREATE DATABASE IF NOT EXISTS hotel_booking_saas;
-- USE hotel_booking_saas;

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS billing_records;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS room_types;
DROP TABLE IF EXISTS guests;
DROP TABLE IF EXISTS hotels;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS subscription_plans;

-- Create subscription_plans table
CREATE TABLE subscription_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    max_rooms INT NOT NULL DEFAULT 0,
    features JSON,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'hotel_owner', 'hotel_staff', 'guest') DEFAULT 'guest',
    hotel_id INT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_hotel_id (hotel_id)
);

-- Create hotels table
CREATE TABLE hotels (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    owner_id INT NOT NULL,
    subscription_plan_id INT DEFAULT 1,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    settings JSON,
    images JSON,
    amenities JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_plan_id) REFERENCES subscription_plans(id),
    INDEX idx_slug (slug),
    INDEX idx_owner_id (owner_id),
    INDEX idx_status (status)
);

-- Create guests table
CREATE TABLE guests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    id_number VARCHAR(50),
    nationality VARCHAR(100),
    date_of_birth DATE,
    preferences JSON,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_phone (phone)
);

-- Create room_types table
CREATE TABLE room_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    hotel_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    max_occupancy INT NOT NULL DEFAULT 2,
    size_sqm INT,
    bed_type VARCHAR(100),
    amenities JSON,
    images JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    INDEX idx_hotel_id (hotel_id)
);

-- Create rooms table
CREATE TABLE rooms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    hotel_id INT NOT NULL,
    room_type_id INT NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    floor INT,
    status ENUM('available', 'occupied', 'maintenance', 'out_of_order') DEFAULT 'available',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE,
    UNIQUE KEY unique_room_per_hotel (hotel_id, room_number),
    INDEX idx_hotel_id (hotel_id),
    INDEX idx_room_type_id (room_type_id),
    INDEX idx_status (status)
);

-- Create bookings table
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    hotel_id INT NOT NULL,
    room_id INT NOT NULL,
    guest_id INT NOT NULL,
    booking_reference VARCHAR(50) UNIQUE NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    adults INT NOT NULL DEFAULT 1,
    children INT DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show') DEFAULT 'pending',
    payment_status ENUM('pending', 'partial', 'paid', 'refunded') DEFAULT 'pending',
    special_requests TEXT,
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_hotel_id (hotel_id),
    INDEX idx_room_id (room_id),
    INDEX idx_guest_id (guest_id),
    INDEX idx_booking_reference (booking_reference),
    INDEX idx_check_in_date (check_in_date),
    INDEX idx_check_out_date (check_out_date),
    INDEX idx_status (status)
);

-- Create billing_records table
CREATE TABLE billing_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    hotel_id INT NOT NULL,
    subscription_plan_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    invoice_url VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_plan_id) REFERENCES subscription_plans(id),
    INDEX idx_hotel_id (hotel_id),
    INDEX idx_status (status),
    INDEX idx_billing_period (billing_period_start, billing_period_end)
);

-- Add foreign key constraint for users.hotel_id (after hotels table is created)
ALTER TABLE users ADD FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE SET NULL;

-- Create triggers for automatic booking reference generation
DELIMITER //

CREATE TRIGGER generate_booking_reference 
BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
    IF NEW.booking_reference IS NULL OR NEW.booking_reference = '' THEN
        SET NEW.booking_reference = CONCAT('BK', YEAR(NOW()), LPAD(MONTH(NOW()), 2, '0'), LPAD(DAY(NOW()), 2, '0'), LPAD(NEW.hotel_id, 3, '0'), LPAD(CONNECTION_ID(), 4, '0'));
    END IF;
END//

DELIMITER ;

-- Create indexes for better performance
CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX idx_bookings_hotel_status ON bookings(hotel_id, status);
CREATE INDEX idx_rooms_hotel_status ON rooms(hotel_id, status);
CREATE INDEX idx_users_role_hotel ON users(role, hotel_id);

-- Create views for common queries
CREATE VIEW active_hotels AS
SELECT h.*, sp.name as plan_name, sp.max_rooms, u.full_name as owner_name
FROM hotels h
JOIN subscription_plans sp ON h.subscription_plan_id = sp.id
JOIN users u ON h.owner_id = u.id
WHERE h.status = 'active' AND h.deleted_at IS NULL;

CREATE VIEW hotel_room_availability AS
SELECT 
    h.id as hotel_id,
    h.name as hotel_name,
    rt.id as room_type_id,
    rt.name as room_type_name,
    rt.base_price,
    COUNT(r.id) as total_rooms,
    COUNT(CASE WHEN r.status = 'available' THEN 1 END) as available_rooms
FROM hotels h
JOIN room_types rt ON h.id = rt.hotel_id
LEFT JOIN rooms r ON rt.id = r.room_type_id AND r.deleted_at IS NULL
WHERE h.status = 'active' AND h.deleted_at IS NULL AND rt.deleted_at IS NULL
GROUP BY h.id, rt.id;

-- Insert success message
SELECT 'Database schema created successfully!' as message;
