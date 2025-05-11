/**
 * Validates school data
 * @param {Object} schoolData - School data to validate
 * @returns {Object} - Object containing isValid boolean and errors array
 */
function validateSchoolData(schoolData) {
  const errors = [];

  // Check if name is provided and is a string
  if (
    !schoolData.name ||
    typeof schoolData.name !== "string" ||
    schoolData.name.trim() === ""
  ) {
    errors.push("School name is required and must be a non-empty string");
  }

  // Check if address is provided and is a string
  if (
    !schoolData.address ||
    typeof schoolData.address !== "string" ||
    schoolData.address.trim() === ""
  ) {
    errors.push("School address is required and must be a non-empty string");
  }

  // Check if latitude is provided and is a valid number
  if (
    schoolData.latitude === undefined ||
    schoolData.latitude === null ||
    isNaN(parseFloat(schoolData.latitude)) ||
    parseFloat(schoolData.latitude) < -90 ||
    parseFloat(schoolData.latitude) > 90
  ) {
    errors.push(
      "Latitude is required and must be a valid number between -90 and 90"
    );
  }

  // Check if longitude is provided and is a valid number
  if (
    schoolData.longitude === undefined ||
    schoolData.longitude === null ||
    isNaN(parseFloat(schoolData.longitude)) ||
    parseFloat(schoolData.longitude) < -180 ||
    parseFloat(schoolData.longitude) > 180
  ) {
    errors.push(
      "Longitude is required and must be a valid number between -180 and 180"
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates coordinates for the list schools endpoint
 * @param {Object} coordinates - Object containing latitude and longitude
 * @returns {Object} - Object containing isValid boolean and errors array
 */
function validateCoordinates(coordinates) {
  const errors = [];

  // Check if latitude is provided and is a valid number
  if (
    coordinates.latitude === undefined ||
    coordinates.latitude === null ||
    isNaN(parseFloat(coordinates.latitude)) ||
    parseFloat(coordinates.latitude) < -90 ||
    parseFloat(coordinates.latitude) > 90
  ) {
    errors.push(
      "Latitude is required and must be a valid number between -90 and 90"
    );
  }

  // Check if longitude is provided and is a valid number
  if (
    coordinates.longitude === undefined ||
    coordinates.longitude === null ||
    isNaN(parseFloat(coordinates.longitude)) ||
    parseFloat(coordinates.longitude) < -180 ||
    parseFloat(coordinates.longitude) > 180
  ) {
    errors.push(
      "Longitude is required and must be a valid number between -180 and 180"
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateSchoolData,
  validateCoordinates,
};
