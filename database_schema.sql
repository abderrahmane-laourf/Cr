-- ============================================
-- CRM Database Schema
-- Date: December 11, 2025
-- ============================================

-- Create database
CREATE DATABASE IF NOT EXISTS crm_database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE crm_database;

-- ============================================
-- 1. Users Table
-- ============================================
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  login VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'employee', 'confirmation', 'confirmation_manager', 'delivery', 'packaging', 'livreur') NOT NULL DEFAULT 'employee',
  
  -- Personal Information
  phone VARCHAR(20),
  cin VARCHAR(20),
  cnss VARCHAR(20),
  salary DECIMAL(10, 2),
  bank VARCHAR(100),
  rib VARCHAR(50),
  business VARCHAR(100),
  
  -- Security & Status
  active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP NULL,
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMP NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP NULL,
  
  INDEX idx_login (login),
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. Password Resets Table
-- ============================================
CREATE TABLE password_resets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  
  -- Request Information
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- Status & Timestamps
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_email (email),
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. Login Logs Table
-- ============================================
CREATE TABLE login_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NULL,
  login_attempt VARCHAR(50) NOT NULL,
  
  -- Attempt Result
  success BOOLEAN NOT NULL,
  failure_reason VARCHAR(255),
  
  -- Session Information
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_type VARCHAR(50),
  browser VARCHAR(50),
  
  -- Timestamp
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_success (success),
  INDEX idx_attempted_at (attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. Sessions Table
-- ============================================
CREATE TABLE sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id INT NOT NULL,
  
  -- Session Information
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_fingerprint VARCHAR(255),
  
  -- Data & Status
  payload TEXT,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_last_activity (last_activity),
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. Permissions Table
-- ============================================
CREATE TABLE permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  module_id VARCHAR(50) NOT NULL,
  action_id VARCHAR(50) NOT NULL,
  permission_string VARCHAR(100) NOT NULL,
  
  -- Timestamps
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  granted_by INT,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_permission (user_id, module_id, action_id),
  INDEX idx_user_id (user_id),
  INDEX idx_permission_string (permission_string)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. Trusted Devices Table (Optional Security)
-- ============================================
CREATE TABLE trusted_devices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  device_fingerprint VARCHAR(255) NOT NULL,
  device_name VARCHAR(100),
  ip_address VARCHAR(45),
  last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  trusted BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_device_fingerprint (device_fingerprint)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. Two Factor Auth Table (Optional Security)
-- ============================================
CREATE TABLE two_factor_auth (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  secret VARCHAR(255) NOT NULL,
  enabled BOOLEAN DEFAULT FALSE,
  backup_codes JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Insert Default Admin User
-- Password: admin123 (hashed with bcrypt)
-- ============================================
INSERT INTO users (name, email, login, password, role, active, email_verified) VALUES
('Admin System', 'admin@crm.com', 'admin', '$2b$10$rGHQHsZPvYZr3QyxP3pQOeKhvYv8tYQJKjXKj3YvZPvYZr3QyxP3p', 'admin', TRUE, TRUE);

-- Note: The password hash above is just an example. 
-- You should generate a real bcrypt hash for your actual password.
-- Example: In Node.js: bcrypt.hash('admin123', 10)

-- ============================================
-- Stored Procedures for Common Operations
-- ============================================

-- Procedure: Lock user account after failed attempts
DELIMITER //
CREATE PROCEDURE lock_user_account(IN p_user_id INT)
BEGIN
  UPDATE users 
  SET locked_until = DATE_ADD(NOW(), INTERVAL 30 MINUTE),
      failed_login_attempts = failed_login_attempts + 1
  WHERE id = p_user_id;
END //
DELIMITER ;

-- Procedure: Reset failed login attempts
DELIMITER //
CREATE PROCEDURE reset_login_attempts(IN p_user_id INT)
BEGIN
  UPDATE users 
  SET failed_login_attempts = 0,
      locked_until = NULL,
      last_login_at = NOW()
  WHERE id = p_user_id;
END //
DELIMITER ;

-- Procedure: Clean expired password reset tokens
DELIMITER //
CREATE PROCEDURE clean_expired_tokens()
BEGIN
  DELETE FROM password_resets
  WHERE expires_at < NOW() OR (used = TRUE AND used_at < DATE_SUB(NOW(), INTERVAL 7 DAY));
END //
DELIMITER ;

-- Procedure: Clean expired sessions
DELIMITER //
CREATE PROCEDURE clean_expired_sessions()
BEGIN
  DELETE FROM sessions WHERE expires_at < NOW();
END //
DELIMITER ;

-- Procedure: Clean old login logs (keep last 90 days)
DELIMITER //
CREATE PROCEDURE clean_old_login_logs()
BEGIN
  DELETE FROM login_logs WHERE attempted_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
END //
DELIMITER ;

-- ============================================
-- Events for Automatic Cleanup (Optional)
-- ============================================

-- Enable event scheduler
SET GLOBAL event_scheduler = ON;

-- Event: Clean expired tokens daily at 2 AM
CREATE EVENT IF NOT EXISTS clean_tokens_daily
ON SCHEDULE EVERY 1 DAY
STARTS (TIMESTAMP(CURRENT_DATE) + INTERVAL 1 DAY + INTERVAL 2 HOUR)
DO CALL clean_expired_tokens();

-- Event: Clean expired sessions every hour
CREATE EVENT IF NOT EXISTS clean_sessions_hourly
ON SCHEDULE EVERY 1 HOUR
DO CALL clean_expired_sessions();

-- Event: Clean old login logs weekly
CREATE EVENT IF NOT EXISTS clean_logs_weekly
ON SCHEDULE EVERY 1 WEEK
STARTS (TIMESTAMP(CURRENT_DATE) + INTERVAL 1 WEEK + INTERVAL 3 HOUR)
DO CALL clean_old_login_logs();

-- ============================================
-- Useful Views
-- ============================================

-- View: Active users with their last login
CREATE VIEW active_users_view AS
SELECT 
  id,
  name,
  login,
  email,
  role,
  phone,
  business,
  last_login_at,
  created_at,
  CASE 
    WHEN last_login_at IS NULL THEN 'Never logged in'
    WHEN last_login_at > DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 'Active'
    WHEN last_login_at > DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 'Inactive'
    ELSE 'Very Inactive'
  END as activity_status
FROM users
WHERE active = TRUE
ORDER BY last_login_at DESC;

-- View: Login attempts summary
CREATE VIEW login_attempts_summary AS
SELECT 
  DATE(attempted_at) as date,
  COUNT(*) as total_attempts,
  SUM(CASE WHEN success = TRUE THEN 1 ELSE 0 END) as successful,
  SUM(CASE WHEN success = FALSE THEN 1 ELSE 0 END) as failed,
  COUNT(DISTINCT user_id) as unique_users
FROM login_logs
WHERE attempted_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(attempted_at)
ORDER BY date DESC;

-- View: Pending password resets
CREATE VIEW pending_password_resets AS
SELECT 
  pr.id,
  pr.email,
  pr.token,
  pr.created_at,
  pr.expires_at,
  u.name as user_name,
  u.login,
  TIMESTAMPDIFF(MINUTE, NOW(), pr.expires_at) as minutes_until_expiry
FROM password_resets pr
JOIN users u ON pr.user_id = u.id
WHERE pr.used = FALSE 
  AND pr.expires_at > NOW()
ORDER BY pr.created_at DESC;

-- ============================================
-- Sample Queries for Testing
-- ============================================

-- Check if user exists and is active
-- SELECT * FROM users WHERE login = 'admin' AND active = TRUE;

-- Get user with permissions
-- SELECT u.*, GROUP_CONCAT(p.permission_string) as permissions
-- FROM users u
-- LEFT JOIN permissions p ON u.id = p.user_id
-- WHERE u.login = 'admin'
-- GROUP BY u.id;

-- Check failed login attempts
-- SELECT failed_login_attempts, locked_until 
-- FROM users 
-- WHERE login = 'admin';

-- Get recent login activity
-- SELECT * FROM login_logs 
-- WHERE user_id = 1 
-- ORDER BY attempted_at DESC 
-- LIMIT 10;

-- Get active sessions
-- SELECT s.*, u.name, u.login 
-- FROM sessions s
-- JOIN users u ON s.user_id = u.id
-- WHERE s.expires_at > NOW()
-- ORDER BY s.last_activity DESC;

-- ============================================
-- End of Schema
-- ============================================
