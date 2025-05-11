const { Pool } = require("pg");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config({ path: "./config.env" });

async function initializeDatabase() {
  try {
    // Configure connection from environment variables
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      console.error("DATABASE_URL environment variable not set");
      return false;
    }

    // Create a connection pool
    const pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    // Test the connection
    await pool.query("SELECT NOW()");
    console.log("Successfully connected to CockroachDB");

    // Create the schools table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schools (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        address VARCHAR(255) NOT NULL,
        latitude FLOAT NOT NULL,
        longitude FLOAT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Database tables initialized successfully");

    // Close the connection pool
    await pool.end();

    return true;
  } catch (error) {
    console.error("Error initializing database:", error);

    // Don't throw the error, just return false to indicate failure
    return false;
  }
}

// If this script is run directly, call the function
if (require.main === module) {
  initializeDatabase().then((success) => {
    if (success) {
      console.log("Database initialization complete");
      process.exit(0);
    } else {
      console.error("Database initialization failed");
      process.exit(1);
    }
  });
}

// Export the function to be used in the main server file
module.exports = initializeDatabase;
