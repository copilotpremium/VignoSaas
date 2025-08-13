-- Hotel Booking SaaS - MySQL Functions and Procedures
-- Run this script after creating the tables

DELIMITER //

-- Function to check room availability for a date range
CREATE FUNCTION check_room_availability(
    p_room_id INT,
    p_check_in DATE,
    p_check_out DATE
) RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE room_available BOOLEAN DEFAULT TRUE;
    DECLARE booking_count INT DEFAULT 0;
    
    -- Check if room exists and is available
    SELECT COUNT(*) INTO booking_count
    FROM rooms 
    WHERE id = p_room_id 
      AND status = 'available' 
      AND deleted_at IS NULL;
    
    IF booking_count = 0 THEN
        RETURN FALSE;
    END IF;
    
    -- Check for overlapping bookings
    SELECT COUNT(*) INTO booking_count
    FROM bookings 
    WHERE room_id = p_room_id 
      AND status IN ('confirmed', 'checked_in')
      AND deleted_at IS NULL
      AND (
          (check_in_date <= p_check_in AND check_out_date > p_check_in) OR
          (check_in_date < p_check_out AND check_out_date >= p_check_out) OR
          (check_in_date >= p_check_in AND check_out_date <= p_check_out)
      );
    
    IF booking_count > 0 THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END//

-- Function to calculate booking total amount
CREATE FUNCTION calculate_booking_amount(
    p_room_type_id INT,
    p_check_in DATE,
    p_check_out DATE,
    p_adults INT,
    p_children INT
) RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE base_price DECIMAL(10,2) DEFAULT 0;
    DECLARE nights INT DEFAULT 0;
    DECLARE total_amount DECIMAL(10,2) DEFAULT 0;
    
    -- Get base price
    SELECT base_price INTO base_price
    FROM room_types 
    WHERE id = p_room_type_id AND deleted_at IS NULL;
    
    -- Calculate nights
    SET nights = DATEDIFF(p_check_out, p_check_in);
    
    -- Calculate total (base price * nights)
    -- You can add more complex pricing logic here
    SET total_amount = base_price * nights;
    
    -- Add extra charges for additional adults (example: $20 per extra adult)
    IF p_adults > 2 THEN
        SET total_amount = total_amount + ((p_adults - 2) * 20 * nights);
    END IF;
    
    -- Add charges for children (example: $10 per child)
    IF p_children > 0 THEN
        SET total_amount = total_amount + (p_children * 10 * nights);
    END IF;
    
    RETURN total_amount;
END//

-- Procedure to get available rooms for a hotel and date range
CREATE PROCEDURE get_available_rooms(
    IN p_hotel_id INT,
    IN p_check_in DATE,
    IN p_check_out DATE,
    IN p_adults INT,
    IN p_children INT
)
BEGIN
    SELECT 
        rt.id as room_type_id,
        rt.name as room_type_name,
        rt.description,
        rt.base_price,
        rt.max_occupancy,
        rt.amenities,
        rt.images,
        COUNT(r.id) as available_rooms,
        calculate_booking_amount(rt.id, p_check_in, p_check_out, p_adults, p_children) as total_amount
    FROM room_types rt
    JOIN rooms r ON rt.id = r.room_type_id
    WHERE rt.hotel_id = p_hotel_id
      AND rt.deleted_at IS NULL
      AND r.deleted_at IS NULL
      AND r.status = 'available'
      AND rt.max_occupancy >= p_adults
      AND check_room_availability(r.id, p_check_in, p_check_out) = TRUE
    GROUP BY rt.id
    HAVING available_rooms > 0
    ORDER BY rt.base_price ASC;
END//

-- Procedure to create a new booking
CREATE PROCEDURE create_booking(
    IN p_hotel_id INT,
    IN p_room_type_id INT,
    IN p_guest_id INT,
    IN p_check_in DATE,
    IN p_check_out DATE,
    IN p_adults INT,
    IN p_children INT,
    IN p_special_requests TEXT,
    IN p_created_by INT,
    OUT p_booking_id INT,
    OUT p_success BOOLEAN,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE available_room_id INT DEFAULT 0;
    DECLARE total_amount DECIMAL(10,2) DEFAULT 0;
    DECLARE booking_ref VARCHAR(50);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_success = FALSE;
        SET p_message = 'Database error occurred while creating booking';
        SET p_booking_id = 0;
    END;
    
    START TRANSACTION;
    
    -- Find an available room of the requested type
    SELECT r.id INTO available_room_id
    FROM rooms r
    WHERE r.hotel_id = p_hotel_id
      AND r.room_type_id = p_room_type_id
      AND r.status = 'available'
      AND r.deleted_at IS NULL
      AND check_room_availability(r.id, p_check_in, p_check_out) = TRUE
    LIMIT 1;
    
    IF available_room_id = 0 THEN
        SET p_success = FALSE;
        SET p_message = 'No available rooms of the requested type';
        SET p_booking_id = 0;
        ROLLBACK;
    ELSE
        -- Calculate total amount
        SET total_amount = calculate_booking_amount(p_room_type_id, p_check_in, p_check_out, p_adults, p_children);
        
        -- Generate booking reference
        SET booking_ref = CONCAT('BK', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(p_hotel_id, 3, '0'), LPAD(CONNECTION_ID(), 4, '0'));
        
        -- Create the booking
        INSERT INTO bookings (
            hotel_id, room_id, guest_id, booking_reference,
            check_in_date, check_out_date, adults, children,
            total_amount, status, special_requests, created_by
        ) VALUES (
            p_hotel_id, available_room_id, p_guest_id, booking_ref,
            p_check_in, p_check_out, p_adults, p_children,
            total_amount, 'pending', p_special_requests, p_created_by
        );
        
        SET p_booking_id = LAST_INSERT_ID();
        SET p_success = TRUE;
        SET p_message = 'Booking created successfully';
        
        COMMIT;
    END IF;
END//

-- Procedure to update room status based on bookings
CREATE PROCEDURE update_room_statuses()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE room_id INT;
    DECLARE cur CURSOR FOR 
        SELECT DISTINCT r.id
        FROM rooms r
        JOIN bookings b ON r.id = b.room_id
        WHERE b.status IN ('confirmed', 'checked_in')
          AND CURDATE() BETWEEN b.check_in_date AND b.check_out_date
          AND r.status = 'available';
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Update rooms to occupied if they have active bookings
    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO room_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        UPDATE rooms 
        SET status = 'occupied' 
        WHERE id = room_id;
    END LOOP;
    CLOSE cur;
    
    -- Update rooms back to available if no active bookings
    UPDATE rooms r
    SET status = 'available'
    WHERE r.status = 'occupied'
      AND NOT EXISTS (
          SELECT 1 FROM bookings b
          WHERE b.room_id = r.id
            AND b.status IN ('confirmed', 'checked_in')
            AND CURDATE() BETWEEN b.check_in_date AND b.check_out_date
      );
END//

DELIMITER ;

-- Create events for automatic maintenance (if EVENT_SCHEDULER is enabled)
-- SET GLOBAL event_scheduler = ON;

-- Event to automatically update room statuses daily
-- CREATE EVENT IF NOT EXISTS update_room_statuses_daily
-- ON SCHEDULE EVERY 1 DAY
-- STARTS CURRENT_TIMESTAMP
-- DO CALL update_room_statuses();

-- Event to automatically update booking statuses
-- CREATE EVENT IF NOT EXISTS update_booking_statuses_daily
-- ON SCHEDULE EVERY 1 DAY
-- STARTS CURRENT_TIMESTAMP
-- DO
-- BEGIN
--     -- Mark bookings as checked_out if check_out_date has passed
--     UPDATE bookings 
--     SET status = 'checked_out' 
--     WHERE status = 'checked_in' 
--       AND check_out_date < CURDATE();
--     
--     -- Mark bookings as no_show if check_in_date has passed and still pending
--     UPDATE bookings 
--     SET status = 'no_show' 
--     WHERE status = 'pending' 
--       AND check_in_date < CURDATE();
-- END;

SELECT 'Database functions and procedures created successfully!' as message;
