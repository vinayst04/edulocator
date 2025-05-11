const { Pool } = require("pg");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config({ path: "./config.env" });

let pool = null;

try {
  // Configure database connection
  const connectionString = process.env.DATABASE_URL;

  // Create connection pool
  pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 10,
    idleTimeoutMillis: 30000,
  });

  // Test connection
  pool.connect((err, client, release) => {
    if (err) {
      console.error("Database connection error:", err.message);
      return;
    }

    client.query("SELECT NOW()", (err, result) => {
      release();
      if (err) {
        console.error("Query error:", err.message);
        return;
      }
      console.log("Database connected successfully");
    });
  });
} catch (error) {
  console.error("Failed to initialize database connection:", error);
}

// Check database connection status
const isDatabaseConnected = () => {
  return !!pool;
};

module.exports = {
  pool,
  isDatabaseConnected,
};
