const mysql = require("mysql2");

// Using the provided MySQL root password
const password = "VINAYst@2004";

console.log("Attempting to connect to MySQL with root user...");

// Create connection without specifying a database
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: password,
});

// Test connection
connection.connect((err) => {
  if (err) {
    console.error("Failed to connect to MySQL:", err);
    console.log("\nPlease ensure:");
    console.log("1. MySQL service is running");
    console.log(
      "2. The password in this script matches your MySQL root password"
    );
    console.log("3. The MySQL server is configured to accept connections");
    process.exit(1);
  }

  console.log("Successfully connected to MySQL server!");

  // List databases
  connection.query("SHOW DATABASES", (err, results) => {
    if (err) {
      console.error("Failed to query databases:", err);
    } else {
      console.log("\nAvailable databases:");
      results.forEach((db) => {
        console.log(`- ${db.Database}`);
      });
    }

    console.log("\nTo setup for production:");
    console.log("1. Create a new database: CREATE DATABASE school_management;");
    console.log(
      "2. Create a dedicated user: CREATE USER 'school_app'@'localhost' IDENTIFIED BY 'your_password';"
    );
    console.log(
      "3. Grant privileges: GRANT ALL PRIVILEGES ON school_management.* TO 'school_app'@'localhost';"
    );
    console.log("4. Apply changes: FLUSH PRIVILEGES;");

    // Close connection
    connection.end(() => {
      console.log("\nConnection closed");
    });
  });
});
