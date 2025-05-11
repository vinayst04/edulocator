const express = require("express");
const {
  addSchool,
  listSchools,
  findRealSchools,
  deleteSchool,
} = require("../controllers/schoolController");

const router = express.Router();

// School management routes
router.post("/addSchool", addSchool);
router.get("/listSchools", listSchools);
router.get("/findRealSchools", findRealSchools);
router.delete("/deleteSchool/:id", deleteSchool);

module.exports = router;
