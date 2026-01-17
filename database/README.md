# Database Schema

This directory contains SQL schemas for the users table.

## Files

- `schema.sql` - MySQL/MariaDB version
- `schema-postgres.sql` - PostgreSQL version

## Users Table

The users table stores user authentication information with the following fields:

- `id` - Primary key (auto-increment)
- `email` - User email address (unique, required)
- `password` - Hashed password (required)
- `created_at` - Timestamp when user was created
- `updated_at` - Timestamp when user was last updated

## Important Notes

⚠️ **Security**: Always hash passwords before storing them in the database. Never store plain text passwords.

Recommended password hashing libraries:
- Node.js: `bcrypt` or `argon2`
- Always use salt rounds (minimum 10 for bcrypt)

## Usage

### MySQL/MariaDB
```bash
mysql -u username -p database_name < schema.sql
```

### PostgreSQL
```bash
psql -U username -d database_name -f schema-postgres.sql
```

## Example Queries

### Create a user (with hashed password)
```sql
INSERT INTO users (email, password) 
VALUES ('user@example.com', '$2b$10$hashedpasswordhere');
```

### Find user by email
```sql
SELECT * FROM users WHERE email = 'user@example.com';
```

### Update user password
```sql
UPDATE users 
SET password = 'newhashedpassword' 
WHERE id = 1;
```

### Delete user
```sql
DELETE FROM users WHERE id = 1;
```
