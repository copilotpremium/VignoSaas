-- Hotel Booking SaaS - Seed Data
-- Run this script after creating tables and functions

-- Insert subscription plans
INSERT INTO subscription_plans (name, description, price, max_rooms, features, active) VALUES
('Free', 'Perfect for small properties getting started', 0.00, 5, 
 JSON_ARRAY('Up to 5 rooms', 'Basic booking management', 'Email support'), TRUE),
('Starter', 'Great for growing properties', 29.99, 25, 
 JSON_ARRAY('Up to 25 rooms', 'Calendar view', 'Guest CRM', 'Basic reports', 'Priority support'), TRUE),
('Pro', 'For established hotels', 79.99, 100, 
 JSON_ARRAY('Up to 100 rooms', 'Advanced analytics', 'Custom branding', 'API access', 'Phone support'), TRUE),
('Enterprise', 'For large hotel chains', 199.99, 999999, 
 JSON_ARRAY('Unlimited rooms', 'Multi-property management', 'Custom integrations', 'Dedicated support', 'White-label solution'), TRUE);

-- Insert sample super admin user (password: admin123)
-- Note: In production, you should change this password immediately
INSERT INTO users (email, password_hash, full_name, role, email_verified) VALUES
('admin@hotelbooking.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'Super Admin', 'super_admin', TRUE);

-- Insert sample hotel owner (password: owner123)
INSERT INTO users (email, password_hash, full_name, role, email_verified) VALUES
('owner@grandhotel.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Smith', 'hotel_owner', TRUE);

-- Insert sample hotel
INSERT INTO hotels (name, slug, description, address, phone, email, owner_id, subscription_plan_id, status) VALUES
('Grand Hotel & Spa', 'grand-hotel-spa', 
 'A luxurious 5-star hotel offering world-class amenities and exceptional service in the heart of the city.',
 '123 Main Street, Downtown, City 12345',
 '+1-555-0123',
 'info@grandhotel.com',
 2, -- owner user id
 2, -- Starter plan
 'active');

-- Update hotel owner's hotel_id
UPDATE users SET hotel_id = 1 WHERE id = 2;

-- Insert sample hotel staff (password: staff123)
INSERT INTO users (email, password_hash, full_name, role, hotel_id, email_verified) VALUES
('staff@grandhotel.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane Doe', 'hotel_staff', 1, TRUE);

-- Insert sample room types
INSERT INTO room_types (hotel_id, name, description, base_price, max_occupancy, size_sqm, bed_type, amenities) VALUES
(1, 'Standard Room', 'Comfortable room with city view', 120.00, 2, 25, 'Queen Bed', 
 JSON_ARRAY('Free WiFi', 'Air Conditioning', 'TV', 'Mini Fridge', 'Coffee Maker')),
(1, 'Deluxe Room', 'Spacious room with premium amenities', 180.00, 3, 35, 'King Bed', 
 JSON_ARRAY('Free WiFi', 'Air Conditioning', 'Smart TV', 'Mini Bar', 'Coffee Machine', 'Balcony')),
(1, 'Junior Suite', 'Elegant suite with separate living area', 280.00, 4, 50, 'King Bed + Sofa Bed', 
 JSON_ARRAY('Free WiFi', 'Air Conditioning', 'Smart TV', 'Mini Bar', 'Coffee Machine', 'Balcony', 'Separate Living Area')),
(1, 'Presidential Suite', 'Luxurious suite with panoramic city views', 500.00, 6, 80, '2 King Beds', 
 JSON_ARRAY('Free WiFi', 'Air Conditioning', 'Smart TV', 'Full Bar', 'Espresso Machine', 'Large Balcony', 'Separate Living & Dining Areas', 'Butler Service'));

-- Insert sample rooms
INSERT INTO rooms (hotel_id, room_type_id, room_number, floor, status) VALUES
-- Standard Rooms (Floor 1-2)
(1, 1, '101', 1, 'available'),
(1, 1, '102', 1, 'available'),
(1, 1, '103', 1, 'available'),
(1, 1, '201', 2, 'available'),
(1, 1, '202', 2, 'available'),
(1, 1, '203', 2, 'available'),
-- Deluxe Rooms (Floor 3-4)
(1, 2, '301', 3, 'available'),
(1, 2, '302', 3, 'available'),
(1, 2, '401', 4, 'available'),
(1, 2, '402', 4, 'available'),
-- Junior Suites (Floor 5)
(1, 3, '501', 5, 'available'),
(1, 3, '502', 5, 'available'),
-- Presidential Suite (Floor 6)
(1, 4, '601', 6, 'available');

-- Insert sample guests
INSERT INTO guests (full_name, email, phone, address, id_number) VALUES
('Alice Johnson', 'alice.johnson@email.com', '+1-555-0101', '456 Oak Avenue, Suburb, City 12346', 'ID123456789'),
('Bob Wilson', 'bob.wilson@email.com', '+1-555-0102', '789 Pine Street, District, City 12347', 'ID987654321'),
('Carol Brown', 'carol.brown@email.com', '+1-555-0103', '321 Elm Drive, Area, City 12348', 'ID456789123'),
('David Miller', 'david.miller@email.com', '+1-555-0104', '654 Maple Lane, Zone, City 12349', 'ID789123456');

-- Insert sample bookings
INSERT INTO bookings (hotel_id, room_id, guest_id, booking_reference, check_in_date, check_out_date, adults, children, total_amount, status, payment_status, special_requests) VALUES
(1, 1, 1, 'BK20250101001', '2025-01-15', '2025-01-18', 2, 0, 360.00, 'confirmed', 'paid', 'Late check-in requested'),
(1, 7, 2, 'BK20250102001', '2025-01-20', '2025-01-23', 2, 1, 594.00, 'confirmed', 'paid', 'Extra towels please'),
(1, 11, 3, 'BK20250103001', '2025-02-01', '2025-02-05', 4, 0, 1120.00, 'pending', 'pending', 'Honeymoon package'),
(1, 2, 4, 'BK20250104001', '2025-02-10', '2025-02-12', 1, 0, 240.00, 'confirmed', 'partial', NULL);

-- Insert sample billing records
INSERT INTO billing_records (hotel_id, subscription_plan_id, amount, billing_period_start, billing_period_end, status, payment_method) VALUES
(1, 2, 29.99, '2025-01-01', '2025-01-31', 'paid', 'credit_card'),
(1, 2, 29.99, '2025-02-01', '2025-02-28', 'pending', 'credit_card');

-- Create some indexes for better performance on sample data
CREATE INDEX idx_bookings_hotel_dates ON bookings(hotel_id, check_in_date, check_out_date);
CREATE INDEX idx_guests_email ON guests(email);

SELECT 'Sample data inserted successfully!' as message;
SELECT 'You can now login with:' as info;
SELECT 'Super Admin: admin@hotelbooking.com / admin123' as super_admin_login;
SELECT 'Hotel Owner: owner@grandhotel.com / owner123' as hotel_owner_login;
SELECT 'Hotel Staff: staff@grandhotel.com / staff123' as hotel_staff_login;
