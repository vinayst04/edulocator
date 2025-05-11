const mysql = require("mysql2");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config({ path: "./config.env" });

console.log("Attempting to connect to MySQL database with these credentials:");
console.log(`- Host: ${process.env.DB_HOST}`);
console.log(`- User: ${process.env.DB_USER}`);
console.log(`- Database: ${process.env.DB_NAME}`);
console.log("- Password: [HIDDEN]");

// Create connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Test connection
connection.connect((err) => {
  if (err) {
    console.error("Failed to connect to MySQL:", err);
    process.exit(1);
  }

  console.log("Successfully connected to MySQL!");

  // Test query
  connection.query("SELECT 1 + 1 AS solution", (err, results) => {
    if (err) {
      console.error("Query failed:", err);
    } else {
      console.log("Database query successful. Result:", results[0].solution);
    }

    // Close connection
    connection.end(() => {
      console.log("Connection closed");
    });
  });
});
