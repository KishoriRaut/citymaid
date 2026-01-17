-- Users table schema for Siscora app
-- This table stores user authentication information

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Example insert (password should be hashed in production)
-- INSERT INTO users (email, password) VALUES ('user@example.com', '$2b$10$hashedpasswordhere');

-- Example queries:
-- SELECT * FROM users WHERE email = 'user@example.com';
-- SELECT id, email, created_at FROM users;
-- UPDATE users SET password = 'newhashedpassword' WHERE id = 1;
-- DELETE FROM users WHERE id = 1;
