const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: "./config.env" });

// Import database and routes
const initializeDatabase = require("./db/init");
const { isDatabaseConnected } = require("./db/config");
const schoolRoutes = require("./routes/schoolRoutes");

// Initialize express app
const app = express();

// Set up middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// API Routes
app.use("/api", schoolRoutes);

// Show available HTTP methods for OPTIONS requests
app.options("*", (req, res) => {
  res.header("Allow", "GET, POST, DELETE, OPTIONS");
  res.status(200).end();
});

// Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Handle 404 routes
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
    // Initialize database
    try {
      const dbInitialized = await initializeDatabase();
      if (!dbInitialized) {
        console.warn("Warning: Using in-memory storage (database unavailable)");
      }
    } catch (dbError) {
      console.warn("Warning: Using in-memory storage (database error)");
    }

    // Start listening
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(
        `Database: ${
          isDatabaseConnected() ? "Connected" : "Using in-memory storage"
        }`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
