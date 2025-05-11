/**
 * MySQL Setup Instructions for School Management API
 *
 * This file contains instructions on how to properly set up MySQL for the application.
 */

console.log(`
=====================================================
MySQL SETUP INSTRUCTIONS FOR SCHOOL MANAGEMENT API
=====================================================

1. VERIFY MYSQL INSTALLATION
---------------------------
- Make sure MySQL is properly installed on your system
- Verify MySQL service is running
- On Windows: Check Services (services.msc) for "MySQL" service
- On Linux/Mac: Run "sudo service mysql status" or "sudo systemctl status mysql"

2. CONNECT TO MYSQL
------------------
- Use MySQL command line or a tool like MySQL Workbench
- For command line:
  > mysql -u root -p
  (Enter your root password when prompted)

3. CREATE DATABASE AND USER
-------------------------
- Once connected to MySQL, run these commands:

  # Create the database
  CREATE DATABASE school_management;

  # Create a dedicated user (replace 'your_secure_password' with a strong password)
  CREATE USER 'school_app'@'localhost' IDENTIFIED BY 'your_secure_password';

  # Grant privileges to the user
  GRANT ALL PRIVILEGES ON school_management.* TO 'school_app'@'localhost';

  # Apply changes
  FLUSH PRIVILEGES;

4. UPDATE YOUR CONFIG FILE
------------------------
- Open "config.env" file in this project and update it with:

  DB_HOST=localhost
  DB_USER=school_app
  DB_PASSWORD=your_secure_password   # Use the password you created
  DB_NAME=school_management
  PORT=3000

5. TEST CONNECTION
---------------
- Run "node test-db.js" to verify connection

6. START THE APPLICATION
---------------------
- Run "npm run dev" to start the application

=====================================================
TROUBLESHOOTING
=====================================================

If you cannot connect to MySQL:
1. Double-check your MySQL service is running
2. Verify the password is correct
3. Make sure the user has proper permissions
4. Check if MySQL is listening on the default port (3306)

For Windows Users:
- You may need to open MySQL Command Line Client from the Start menu
- Default installation puts this in MySQL folder in Start menu

For connection refused errors:
- Check firewall settings
- Verify MySQL is running on the expected port
`);

console.log(
  "\nRun this script again anytime you need to see these instructions."
);
