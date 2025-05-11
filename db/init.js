const { Pool } = require("pg");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config({ path: "./config.env" });

/**
 * Initialize the database and create required tables
 * @returns {Promise<boolean>} Success status
 */
async function initializeDatabase() {
  try {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      console.error("Database connection string not configured");
      return false;
    }

    // Create database connection
    const pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    // Verify connection
    await pool.query("SELECT NOW()");

    // Create schools table if it doesn't exist
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

    console.log("Database schema initialized");
    await pool.end();
    return true;
  } catch (error) {
    console.error("Database initialization error:", error.message);
    return false;
  }
}

// Allow direct execution
if (require.main === module) {
  initializeDatabase().then((success) => {
    if (success) {
      console.log("Database setup complete");
      process.exit(0);
    } else {
      console.error("Database setup failed");
      process.exit(1);
    }
  });
}

module.exports = initializeDatabase;
