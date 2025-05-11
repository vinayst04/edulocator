const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: "./config.env" });

// Import database initialization function
const initializeDatabase = require("./db/init");
const { isDatabaseConnected } = require("./db/config");

// Import routes
const schoolRoutes = require("./routes/schoolRoutes");

// Initialize express app
const app = express();

// Set up middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api", schoolRoutes);
console.log("API routes registered on /api path");

// Show available HTTP methods for debugging
app.options("*", (req, res) => {
  res.header("Allow", "GET, POST, DELETE, OPTIONS");
  res.status(200).end();
});

// Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Handle 404 routes - using regular expression instead of wildcard '*'
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Set port
const PORT = process.env.PORT || 3000;

// Start server
const startServer = async () => {
  try {
    // Try to initialize database, but don't fail if it doesn't work
    try {
      const dbInitialized = await initializeDatabase();
      if (!dbInitialized) {
        console.warn(
          "Warning: Database initialization failed, but server will still start with in-memory storage"
        );
      } else {
        console.log("Database initialized successfully");
      }
    } catch (dbError) {
      console.warn(
        "Warning: Database initialization error, but server will still start with in-memory storage"
      );
      console.error("Database error details:", dbError);
    }

    // Start listening
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(
        `Database connection: ${
          isDatabaseConnected()
            ? "Connected"
            : "Not Connected - using in-memory storage"
        }`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
