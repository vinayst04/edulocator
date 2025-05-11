const mysql = require("mysql2");

// MySQL connection config
const config = {
  host: "localhost",
  user: "root",
  password: "VINAYst@2004",
};

console.log("Setting up database for School Management API...");

// Create connection
const connection = mysql.createConnection(config);

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    process.exit(1);
  }

  console.log("Connected to MySQL server successfully.");

  // Create database
  console.log("\nCreating school_management database...");
  connection.query("CREATE DATABASE IF NOT EXISTS school_management", (err) => {
    if (err) {
      console.error("Error creating database:", err);
      connection.end();
      return;
    }

    console.log("Database school_management created or already exists.");

    // Use database
    console.log("\nSwitching to school_management database...");
    connection.query("USE school_management", (err) => {
      if (err) {
        console.error("Error selecting database:", err);
        connection.end();
        return;
      }

      // Create schools table
      console.log("\nCreating schools table...");
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS schools (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          address VARCHAR(255) NOT NULL,
          latitude FLOAT NOT NULL,
          longitude FLOAT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      connection.query(createTableQuery, (err) => {
        if (err) {
          console.error("Error creating schools table:", err);
          connection.end();
          return;
        }

        console.log("Schools table created successfully.");

        // Display success message
        console.log("\n✅ Database setup complete!");
        console.log("\nYour config.env file should have these settings:");
        console.log("------------------------------------------");
        console.log("DB_HOST=localhost");
        console.log("DB_USER=root");
        console.log("DB_PASSWORD=VINAYst@2004");
        console.log("DB_NAME=school_management");
        console.log("PORT=3000");
        console.log("------------------------------------------");

        // Close connection
        connection.end(() => {
          console.log("\nMySQL connection closed.");
        });
      });
    });
  });
});
