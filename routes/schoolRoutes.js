const express = require("express");
const {
  addSchool,
  listSchools,
  findRealSchools,
  deleteSchool,
} = require("../controllers/schoolController");

const router = express.Router();

// POST /addSchool - Add a new school
router.post("/addSchool", addSchool);

// GET /listSchools - List schools sorted by proximity
router.get("/listSchools", listSchools);

// GET /findRealSchools - Find real schools from OpenStreetMap
router.get("/findRealSchools", findRealSchools);

// DELETE /deleteSchool/:id - Delete a school by ID
router.delete("/deleteSchool/:id", deleteSchool);

// Ensure all routes are properly registered
console.log("Available routes:");
console.log("POST /api/addSchool");
console.log("GET /api/listSchools");
console.log("GET /api/findRealSchools");
console.log("DELETE /api/deleteSchool/:id");

module.exports = router;
