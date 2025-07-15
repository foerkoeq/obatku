-- ================================================
-- SETUP DATABASE UNTUK APLIKASI OBATKU
-- ================================================

-- Create databases
CREATE DATABASE IF NOT EXISTS obatku_dev;
CREATE DATABASE IF NOT EXISTS obatku_test;

-- Create user untuk development (optional - bisa pakai root)
-- CREATE USER 'obatku_dev'@'localhost' IDENTIFIED BY 'Foerkoeqrb3!';
-- GRANT ALL PRIVILEGES ON obatku_dev.* TO 'obatku_dev'@'localhost';
-- GRANT ALL PRIVILEGES ON obatku_test.* TO 'obatku_dev'@'localhost';
-- FLUSH PRIVILEGES;

-- Verify databases created
SHOW DATABASES LIKE 'obatku_%';

-- Use development database
USE obatku_dev;
SELECT DATABASE() as 'Current Database';
