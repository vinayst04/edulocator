const db = require("../db/config");
const {
  validateSchoolData,
  validateCoordinates,
} = require("../utils/validation");
const { calculateDistance } = require("../utils/distance");
const axios = require("axios");

// In-memory storage for when database is not available
const inMemorySchools = [];
let lastId = 0;

/**
 * Add a new school to the database
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function addSchool(req, res) {
  try {
    const schoolData = req.body;

    // Validate input data
    const validationResult = validateSchoolData(schoolData);

    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        errors: validationResult.errors,
      });
    }

    // Check if database is connected
    let useInMemory = true;

    if (db.isDatabaseConnected() && db.pool) {
      try {
        // Try to insert into database - using PostgreSQL parameter syntax ($1, $2, etc.)
        const result = await db.pool.query(
          "INSERT INTO schools (name, address, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING id",
          [
            schoolData.name,
            schoolData.address,
            parseFloat(schoolData.latitude),
            parseFloat(schoolData.longitude),
          ]
        );

        // If we get here, database worked
        useInMemory = false;

        res.status(201).json({
          success: true,
          message: "School added successfully",
          data: {
            id: result.rows[0].id,
            ...schoolData,
          },
        });
      } catch (dbError) {
        console.error("Database error during insertion:", dbError);
        useInMemory = true;
      }
    }

    // If database isn't connected or insert failed, use in-memory storage
    if (useInMemory) {
      lastId++;
      const newSchool = {
        id: lastId,
        name: schoolData.name,
        address: schoolData.address,
        latitude: parseFloat(schoolData.latitude),
        longitude: parseFloat(schoolData.longitude),
        created_at: new Date().toISOString(),
      };

      inMemorySchools.push(newSchool);

      res.status(201).json({
        success: true,
        message:
          "School added successfully (in-memory storage - database not available)",
        data: newSchool,
      });
    }
  } catch (error) {
    console.error("Error adding school:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding the school",
      error: error.message,
    });
  }
}

/**
 * List all schools sorted by proximity to the specified location
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function listSchools(req, res) {
  try {
    // Get user's coordinates from query parameters
    const userCoordinates = {
      latitude: req.query.latitude,
      longitude: req.query.longitude,
    };

    // Validate coordinates
    const validationResult = validateCoordinates(userCoordinates);

    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        errors: validationResult.errors,
      });
    }

    // Parse coordinates to floats
    const userLat = parseFloat(userCoordinates.latitude);
    const userLong = parseFloat(userCoordinates.longitude);

    let schools = [];
    let fromMemory = true;

    // Check if database is connected
    if (db.isDatabaseConnected() && db.pool) {
      try {
        // Fetch all schools from the database - PostgreSQL syntax
        const result = await db.pool.query("SELECT * FROM schools");
        schools = result.rows;
        fromMemory = false;
      } catch (dbError) {
        console.error("Database error during fetch:", dbError);
        // Fallback to in-memory data
        schools = inMemorySchools;
      }
    } else {
      // Use in-memory storage if database is not available
      schools = inMemorySchools;
    }

    // Calculate distance for each school and add it to the school object
    const schoolsWithDistance = schools.map((school) => {
      const distance = calculateDistance(
        userLat,
        userLong,
        school.latitude,
        school.longitude
      );

      return {
        ...school,
        distance: parseFloat(distance.toFixed(2)), // Round to 2 decimal places
      };
    });

    // Sort schools by distance (nearest first)
    schoolsWithDistance.sort((a, b) => a.distance - b.distance);

    res.status(200).json({
      success: true,
      count: schoolsWithDistance.length,
      data: schoolsWithDistance,
      fromMemory: fromMemory,
    });
  } catch (error) {
    console.error("Error listing schools:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching schools",
      error: error.message,
    });
  }
}

/**
 * Find real schools near a location using OpenStreetMap API
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function findRealSchools(req, res) {
  try {
    // Get user's coordinates from query parameters
    const userCoordinates = {
      latitude: req.query.latitude,
      longitude: req.query.longitude,
    };

    // Validate coordinates
    const validationResult = validateCoordinates(userCoordinates);

    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        errors: validationResult.errors,
      });
    }

    // Parse coordinates to floats
    const userLat = parseFloat(userCoordinates.latitude);
    const userLong = parseFloat(userCoordinates.longitude);

    // Use Overpass API to find schools (educational facilities) nearby
    // Calculate a bounding box roughly 10km around the user's location
    const radius = 0.1; // approximately 10km in degrees
    const bbox = {
      south: userLat - radius,
      west: userLong - radius,
      north: userLat + radius,
      east: userLong + radius,
    };

    // Create Overpass API query to find educational facilities with address details
    const overpassQuery = `
      [out:json];
      (
        node["amenity"="school"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
        node["amenity"="kindergarten"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
        node["amenity"="college"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
        node["amenity"="university"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
        way["amenity"="school"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
        way["amenity"="kindergarten"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
        way["amenity"="college"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
        way["amenity"="university"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
        relation["amenity"="school"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
        relation["amenity"="kindergarten"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
        relation["amenity"="college"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
        relation["amenity"="university"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      );
      out body;
      out meta;
      >;
      out body qt;
    `;

    let results = [];
    let useBackupData = false;

    try {
      console.log("Attempting to connect to Overpass API...");

      // Set a timeout for the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      // Make the request to Overpass API with timeout
      const response = await axios.post(
        "https://overpass-api.de/api/interpreter",
        overpassQuery,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          signal: controller.signal,
          timeout: 10000, // 10 second timeout
        }
      );

      clearTimeout(timeoutId);

      console.log("Overpass API response received");

      // Process the results
      results = response.data.elements
        .filter((element) => element.tags && element.tags.name) // Only include elements with names
        .map((element) => {
          // Get coordinates based on element type
          let lat, lon;
          if (element.type === "node") {
            lat = element.lat;
            lon = element.lon;
          } else if (element.center) {
            // For ways and relations with center
            lat = element.center.lat;
            lon = element.center.lon;
          } else {
            // Skip if we can't determine coordinates
            return null;
          }

          // Construct address from available tags
          let address = "Address not available";
          const addressParts = [];

          // Try to build a comprehensive address from available tags
          if (element.tags) {
            const tags = element.tags;

            // Street address
            if (tags["addr:housenumber"] && tags["addr:street"]) {
              addressParts.push(
                `${tags["addr:housenumber"]} ${tags["addr:street"]}`
              );
            } else if (tags["addr:street"]) {
              addressParts.push(tags["addr:street"]);
            }

            // City/town/locality
            if (tags["addr:city"]) {
              addressParts.push(tags["addr:city"]);
            } else if (tags["addr:town"]) {
              addressParts.push(tags["addr:town"]);
            } else if (tags["addr:locality"]) {
              addressParts.push(tags["addr:locality"]);
            }

            // State/province and postal code
            if (tags["addr:state"] || tags["addr:postcode"]) {
              const statePostal = [];
              if (tags["addr:state"]) statePostal.push(tags["addr:state"]);
              if (tags["addr:postcode"])
                statePostal.push(tags["addr:postcode"]);
              addressParts.push(statePostal.join(" "));
            }

            // Country
            if (tags["addr:country"]) {
              addressParts.push(tags["addr:country"]);
            }

            // Use full address if available
            if (tags["addr:full"]) {
              address = tags["addr:full"];
            } else if (addressParts.length > 0) {
              address = addressParts.join(", ");
            } else if (tags.address) {
              address = tags.address;
            } else if (tags.location) {
              address = tags.location;
            }
          }

          // Calculate distance from user coordinates
          const distance = calculateDistance(userLat, userLong, lat, lon);

          // Educational level mapping
          const educationalLevels = {
            kindergarten: "Preschool/Kindergarten",
            school: "School",
            college: "College",
            university: "University",
          };

          const educationalLevel =
            educationalLevels[element.tags.amenity] || "Educational Facility";

          return {
            id: element.id,
            name: element.tags.name,
            address: address,
            type: educationalLevel,
            level:
              element.tags.isced_level || element.tags.education_level || "",
            website: element.tags.website || "",
            phone: element.tags.phone || element.tags["contact:phone"] || "",
            latitude: lat,
            longitude: lon,
            distance: parseFloat(distance.toFixed(2)),
          };
        })
        .filter(Boolean); // Remove any null entries
    } catch (apiError) {
      console.error("Overpass API error:", apiError.message);
      useBackupData = true;

      // Log additional details for debugging
      if (apiError.response) {
        console.error("Response data:", apiError.response.data);
        console.error("Response status:", apiError.response.status);
      } else if (apiError.request) {
        console.error("No response received. Request:", apiError.request);
      }

      // If we fail to get data from Overpass API, create some mock data as fallback
      // This way users can still see something rather than a complete error
      console.log("Using backup data for schools near:", userLat, userLong);

      // Generate 5 mock school entries near the requested location
      results = generateMockSchools(userLat, userLong);
    }

    // Sort by distance
    results.sort((a, b) => a.distance - b.distance);

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
      fromBackup: useBackupData,
    });
  } catch (error) {
    console.error("Error fetching schools from OpenStreetMap:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching real schools",
      error: error.message,
    });
  }
}

/**
 * Generate mock school data as a fallback when API fails
 * @param {number} lat - User's latitude
 * @param {number} lon - User's longitude
 * @returns {Array} Array of mock school objects
 */
function generateMockSchools(lat, lon) {
  const schoolTypes = [
    "School",
    "Preschool/Kindergarten",
    "College",
    "University",
  ];
  const mockSchools = [];

  // Generate a small random offset to put schools at slightly different locations
  const randomOffset = () => (Math.random() - 0.5) * 0.02; // ~1-2km offset

  // Generate 8 mock schools
  const schoolNames = [
    "Springfield Elementary School",
    "Central High School",
    "Little Stars Kindergarten",
    "Sunshine Preschool",
    "Metropolitan University",
    "Technical College",
    "International Academy",
    "Progressive Public School",
  ];

  for (let i = 0; i < 8; i++) {
    // Create a small offset from the user location
    const latOffset = randomOffset();
    const lonOffset = randomOffset();
    const schoolLat = lat + latOffset;
    const schoolLon = lon + lonOffset;

    // Calculate actual distance from offset
    const distance = calculateDistance(lat, lon, schoolLat, schoolLon);

    // Determine type based on name
    let type = schoolTypes[i % schoolTypes.length];
    if (
      schoolNames[i].includes("Elementary") ||
      schoolNames[i].includes("Public")
    ) {
      type = "School";
    } else if (
      schoolNames[i].includes("Kindergarten") ||
      schoolNames[i].includes("Preschool")
    ) {
      type = "Preschool/Kindergarten";
    } else if (schoolNames[i].includes("College")) {
      type = "College";
    } else if (schoolNames[i].includes("University")) {
      type = "University";
    }

    mockSchools.push({
      id: `mock-${i + 1}`,
      name: schoolNames[i],
      address: `${Math.floor(Math.random() * 300) + 1} Main Street, Local City`,
      type: type,
      level: "",
      website: "",
      phone: "",
      latitude: schoolLat,
      longitude: schoolLon,
      distance: parseFloat(distance.toFixed(2)),
    });
  }

  // Sort by distance
  mockSchools.sort((a, b) => a.distance - b.distance);

  return mockSchools;
}

/**
 * Delete a school from the database or in-memory storage
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function deleteSchool(req, res) {
  try {
    const schoolId = req.params.id;

    console.log("Delete request received for school ID:", schoolId);

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    let deleted = false;
    let fromMemory = true;

    // Check if database is connected
    if (db.isDatabaseConnected() && db.pool) {
      try {
        // Try to delete from database - PostgreSQL parameter syntax
        const result = await db.pool.query(
          "DELETE FROM schools WHERE id = $1",
          [schoolId]
        );

        console.log("Database delete result:", result);

        if (result.rowCount > 0) {
          deleted = true;
          fromMemory = false;
        }
      } catch (dbError) {
        console.error("Database error during deletion:", dbError);
        // Will try in-memory deletion
      }
    }

    // If database isn't connected or delete failed, try in-memory storage
    if (!deleted && fromMemory) {
      const initialLength = inMemorySchools.length;

      // Filter out the school with the given ID
      const index = inMemorySchools.findIndex(
        (school) => school.id.toString() === schoolId.toString()
      );

      console.log("In-memory delete - School index:", index);

      if (index !== -1) {
        inMemorySchools.splice(index, 1);
        deleted = true;
      }
    }

    if (deleted) {
      res.status(200).json({
        success: true,
        message: fromMemory
          ? "School deleted successfully from in-memory storage"
          : "School deleted successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "School not found",
      });
    }
  } catch (error) {
    console.error("Error deleting school:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the school",
      error: error.message,
    });
  }
}

module.exports = {
  addSchool,
  listSchools,
  findRealSchools,
  deleteSchool,
};
