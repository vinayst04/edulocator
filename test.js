const mysql = require("mysql2");

try {
  // Create a simple connection with minimal parameters
  const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "", // Empty password
  });

  // Test the connection
  connection.connect((err) => {
    if (err) {
      console.error("Error connecting to MySQL:", err);
      process.exit(1);
    }

    console.log("Successfully connected to MySQL!");

    // Close the connection
    connection.end(() => {
      console.log("Connection closed");
      process.exit(0);
    });
  });
} catch (error) {
  console.error("Unexpected error:", error);
  process.exit(1);
}
