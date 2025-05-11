const { Pool } = require("pg");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config({ path: "./config.env" });

let pool = null;

try {
  // Configure pool options
  const connectionString = process.env.DATABASE_URL;

  // Create connection pool
  pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false, // Required for some hosted PostgreSQL providers
    },
    max: 10, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  });

  // Test connection
  pool.connect((err, client, release) => {
    if (err) {
      console.error("Error connecting to CockroachDB:", err.message);
      return;
    }

    client.query("SELECT NOW()", (err, result) => {
      release();
      if (err) {
        console.error("Error executing test query:", err.message);
        return;
      }
      console.log("Successfully connected to CockroachDB!");
    });
  });
} catch (error) {
  console.error("Failed to initialize database connection:", error);
}

// Function to check if database is connected
const isDatabaseConnected = () => {
  return !!pool;
};

module.exports = {
  pool,
  isDatabaseConnected,
};
