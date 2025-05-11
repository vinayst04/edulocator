const mysql = require("mysql2");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config({ path: "./config.env" });

// Configure connection options - handle empty password case specially
const connectionOptions = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  database: process.env.DB_NAME || "school_management",
};

// Only add password if it's not empty
if (process.env.DB_PASSWORD) {
  connectionOptions.password = process.env.DB_PASSWORD;
}

// Create a connection to test
const connection = mysql.createConnection(connectionOptions);

// Test the connection
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    process.exit(1);
  }

  console.log("Successfully connected to the MySQL database!");

  // Try to create database if it doesn't exist
  connection.query(
    `CREATE DATABASE IF NOT EXISTS ${
      process.env.DB_NAME || "school_management"
    }`,
    (err) => {
      if (err) {
        console.error("Error creating database:", err);
      } else {
        console.log("Database created or already exists");
      }

      // Close the connection
      connection.end();
    }
  );
});
