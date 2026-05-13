-- SAFE SQL Migration for MySQL (Use this in PHPMyAdmin)
-- This script safely adds missing columns to the bookings table for BEST VENUE OPTION

DELIMITER //

CREATE PROCEDURE AddMissingColumns()
BEGIN
    -- Check for is_locked column
    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'bookings' 
        AND COLUMN_NAME = 'is_locked'
    ) THEN
        ALTER TABLE bookings ADD COLUMN is_locked TINYINT(1) DEFAULT 0;
    END IF;

    -- Check for is_manual column
    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'bookings' 
        AND COLUMN_NAME = 'is_manual'
    ) THEN
        ALTER TABLE bookings ADD COLUMN is_manual TINYINT(1) DEFAULT 0;
    END IF;

    -- Check for extra_services column
    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'bookings' 
        AND COLUMN_NAME = 'extra_services'
    ) THEN
        ALTER TABLE bookings ADD COLUMN extra_services JSON;
    END IF;
END //

DELIMITER ;

-- Execute the procedure
CALL AddMissingColumns();

-- Clean up
DROP PROCEDURE AddMissingColumns;
