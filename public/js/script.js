// DOM Elements
const addSchoolForm = document.getElementById("addSchoolForm");
const findSchoolsForm = document.getElementById("findSchoolsForm");
const getCurrentLocationBtn = document.getElementById("getCurrentLocation");
const currentLocationInfo = document.getElementById("currentLocationInfo");
const schoolsList = document.getElementById("schoolsList");
const responseAlert = document.getElementById("responseAlert");
const alertTitle = document.getElementById("alertTitle");
const alertMessage = document.getElementById("alertMessage");
const useRealSchools = document.getElementById("useRealSchools");
const refreshList = document.getElementById("refreshList");

// DOM Elements for API Testing
const navMain = document.getElementById("nav-main");
const navApiTest = document.getElementById("nav-api-test");
const mainSection = document.getElementById("main-section");
const apiTestSection = document.getElementById("api-test-section");
const testAddSchoolForm = document.getElementById("testAddSchoolForm");
const testListSchoolsForm = document.getElementById("testListSchoolsForm");
const testFindRealSchoolsForm = document.getElementById(
  "testFindRealSchoolsForm"
);
const testDeleteSchoolForm = document.getElementById("testDeleteSchoolForm");
const apiTestStatus = document.getElementById("apiTestStatus");
const apiTestTime = document.getElementById("apiTestTime");
const apiTestEndpoint = document.getElementById("apiTestEndpoint");
const apiTestResponse = document.getElementById("apiTestResponse");
const postmanRequest = document.getElementById("postmanRequest");
const copyPostmanButton = document.getElementById("copyPostmanButton");

// Base URL for API
const API_BASE_URL = "/api";

// Toast component initialization (Bootstrap)
const toast = new bootstrap.Toast(responseAlert);

// Global state for pagination
let currentPage = 1;
let schoolsPerPage = 5;
let currentSchoolsList = [];
let isRealSchoolData = false;

// Show alert message
function showAlert(title, message, type = "success") {
  alertTitle.textContent = title;
  alertMessage.textContent = message;
  responseAlert.classList.remove(
    "bg-success",
    "bg-danger",
    "bg-info",
    "bg-warning"
  );

  if (type === "success") {
    responseAlert.classList.add("bg-success");
  } else if (type === "danger") {
    responseAlert.classList.add("bg-danger");
  } else if (type === "info") {
    responseAlert.classList.add("bg-info");
  } else if (type === "warning") {
    responseAlert.classList.add("bg-warning");
  }

  responseAlert.classList.add("text-white");
  toast.show();
}

// Add School Form Submission
addSchoolForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const schoolData = {
    name: document.getElementById("schoolName").value,
    address: document.getElementById("schoolAddress").value,
    latitude: document.getElementById("latitude").value,
    longitude: document.getElementById("longitude").value,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/addSchool`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(schoolData),
    });

    const result = await response.json();

    if (result.success) {
      showAlert("Success", "School added successfully!");
      addSchoolForm.reset();
    } else {
      const errorMessage = result.errors
        ? Object.values(result.errors).join("\n")
        : result.message || "An error occurred";
      showAlert("Error", errorMessage, "danger");
    }
  } catch (error) {
    showAlert("Error", "Failed to connect to the server", "danger");
    console.error("Error:", error);
  }
});

// Find Schools Form Submission
findSchoolsForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const latitude = document.getElementById("searchLatitude").value;
  const longitude = document.getElementById("searchLongitude").value;

  await performSearch(latitude, longitude);
});

// Refresh button click handler
refreshList.addEventListener("click", async () => {
  const latitude = document.getElementById("searchLatitude").value;
  const longitude = document.getElementById("searchLongitude").value;

  if (!latitude || !longitude) {
    showAlert(
      "Info",
      "Please enter coordinates or use your current location first",
      "danger"
    );
    return;
  }

  await performSearch(latitude, longitude);
});

// Perform search based on current toggle state
async function performSearch(latitude, longitude) {
  if (useRealSchools.checked) {
    await searchRealSchools(latitude, longitude);
  } else {
    await searchNearbySchools(latitude, longitude);
  }
}

// Get Current Location
getCurrentLocationBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    currentLocationInfo.innerHTML =
      '<div class="spinner-border spinner-border-sm text-primary" role="status"></div> Getting your location...';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Update location info
        currentLocationInfo.innerHTML = `
          <div class="alert alert-info mt-2">
            <strong>Your Location:</strong><br>
            Latitude: ${latitude.toFixed(6)}<br>
            Longitude: ${longitude.toFixed(6)}
          </div>
        `;

        // Fill the search form with the current coordinates
        document.getElementById("searchLatitude").value = latitude;
        document.getElementById("searchLongitude").value = longitude;
      },
      (error) => {
        currentLocationInfo.innerHTML = `
          <div class="alert alert-danger mt-2">
            Error: ${getGeolocationErrorMessage(error)}
          </div>
        `;
      }
    );
  } else {
    currentLocationInfo.innerHTML = `
      <div class="alert alert-danger mt-2">
        Geolocation is not supported by this browser.
      </div>
    `;
  }
});

// Helper function to translate geolocation errors
function getGeolocationErrorMessage(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "User denied the request for geolocation.";
    case error.POSITION_UNAVAILABLE:
      return "Location information is unavailable.";
    case error.TIMEOUT:
      return "The request to get user location timed out.";
    case error.UNKNOWN_ERROR:
      return "An unknown error occurred.";
    default:
      return "An error occurred while getting location.";
  }
}

// Search Nearby Schools
async function searchNearbySchools(latitude, longitude) {
  try {
    schoolsList.innerHTML = `
      <div class="d-flex flex-column justify-content-center align-items-center py-4">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <div>Finding nearby schools from database...</div>
      </div>
    `;

    // Add loading state to refresh button
    refreshList.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
    refreshList.disabled = true;

    const response = await fetch(
      `${API_BASE_URL}/listSchools?latitude=${latitude}&longitude=${longitude}`
    );
    const result = await response.json();

    // Reset refresh button
    refreshList.innerHTML = '<i class="bi bi-arrow-clockwise"></i>';
    refreshList.disabled = false;

    if (result.success) {
      displaySchools(result.data, result.fromMemory);
    } else {
      schoolsList.innerHTML = `
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          ${result.message || "An error occurred while fetching schools"}
        </div>
      `;
    }
  } catch (error) {
    // Reset refresh button
    refreshList.innerHTML = '<i class="bi bi-arrow-clockwise"></i>';
    refreshList.disabled = false;

    schoolsList.innerHTML = `
      <div class="alert alert-danger">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        Failed to connect to the server. Please try again later.
      </div>
    `;
    console.error("Error:", error);
  }
}

// Display Schools with pagination
function displaySchools(schools, fromMemory) {
  // Store the schools data globally for pagination
  currentSchoolsList = schools;
  isRealSchoolData = false;
  currentPage = 1; // Reset to first page when new data is loaded

  if (schools.length === 0) {
    schoolsList.innerHTML = `
      <div class="alert alert-info">
        No schools found nearby.
      </div>
    `;
    return;
  }

  renderCurrentPage();
}

// Search Real Schools from OpenStreetMap
async function searchRealSchools(latitude, longitude) {
  try {
    schoolsList.innerHTML = `
      <div class="d-flex flex-column justify-content-center align-items-center py-4">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <div>Fetching real school data from OpenStreetMap...</div>
        <div class="small text-muted mt-1">This may take a moment</div>
      </div>
    `;

    // Add loading state to refresh button
    refreshList.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
    refreshList.disabled = true;

    try {
      const response = await fetch(
        `${API_BASE_URL}/findRealSchools?latitude=${latitude}&longitude=${longitude}`
      );

      // Reset refresh button
      refreshList.innerHTML = '<i class="bi bi-arrow-clockwise"></i>';
      refreshList.disabled = false;

      const result = await response.json();

      if (result.success) {
        // Check if backup data was used
        if (result.fromBackup) {
          showAlert(
            "Info",
            "OpenStreetMap API is currently unavailable. Showing approximate school locations instead.",
            "warning"
          );
        }

        displayRealSchools(result.data);
      } else {
        schoolsList.innerHTML = `
          <div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            ${
              result.message ||
              "An error occurred while fetching schools from OpenStreetMap"
            }
          </div>
        `;
      }
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);

      // Reset refresh button
      refreshList.innerHTML = '<i class="bi bi-arrow-clockwise"></i>';
      refreshList.disabled = false;

      // Fall back to database schools
      showAlert(
        "Warning",
        "Could not connect to OpenStreetMap. Showing database schools instead.",
        "warning"
      );
      await searchNearbySchools(latitude, longitude);
    }
  } catch (error) {
    // Reset refresh button
    refreshList.innerHTML = '<i class="bi bi-arrow-clockwise"></i>';
    refreshList.disabled = false;

    schoolsList.innerHTML = `
      <div class="alert alert-danger">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        Failed to connect to the server. Please try again later.
      </div>
    `;
    console.error("Error:", error);
  }
}

// Display Real Schools from OpenStreetMap with pagination
function displayRealSchools(schools) {
  // Store the schools data globally for pagination
  currentSchoolsList = schools;
  isRealSchoolData = true;
  currentPage = 1; // Reset to first page when new data is loaded

  if (schools.length === 0) {
    schoolsList.innerHTML = `
      <div class="alert alert-info">
        No educational facilities found nearby in OpenStreetMap.
      </div>
    `;
    return;
  }

  renderCurrentPage();
}

// Render the current page of schools
function renderCurrentPage() {
  const schools = currentSchoolsList;
  const totalPages = Math.ceil(schools.length / schoolsPerPage);

  // Adjust current page if it's out of bounds
  if (currentPage < 1) currentPage = 1;
  if (currentPage > totalPages) currentPage = totalPages;

  // Calculate pagination indices
  const startIndex = (currentPage - 1) * schoolsPerPage;
  const endIndex = Math.min(startIndex + schoolsPerPage, schools.length);
  const currentSchools = schools.slice(startIndex, endIndex);

  let html = "";

  // Add data source info for normal schools
  if (!isRealSchoolData && currentSchools.length > 0) {
    // Check if we have fromMemory flag from the response
    if (schools.fromMemory) {
      html += `
        <div class="alert alert-warning mb-3">
          <small>Note: Data is being served from in-memory storage as the database connection is unavailable.</small>
        </div>
      `;
    }
  }

  // Add OpenStreetMap info for real schools
  if (isRealSchoolData) {
    // Check if we're showing backup data (check for mock IDs)
    const isMockData =
      currentSchoolsList.length > 0 &&
      currentSchoolsList[0].id.toString().startsWith("mock");

    if (isMockData) {
      html += `
        <div class="alert alert-warning mb-3">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          <small>OpenStreetMap API is currently unavailable. Showing approximate school locations.</small>
        </div>
      `;
    }

    html += `
      <div class="alert alert-info mb-3">
        <small>Showing real educational facilities from OpenStreetMap (${
          startIndex + 1
        }-${endIndex} of ${schools.length})</small>
      </div>
    `;
  }

  html += '<div class="list-group mb-3">';

  // Render schools based on type
  if (isRealSchoolData) {
    // Display real schools
    currentSchools.forEach((school) => {
      // Determine school type class for styling
      const typeClass =
        school.type.toLowerCase().includes("preschool") ||
        school.type.toLowerCase().includes("kindergarten")
          ? "school-kindergarten"
          : school.type.toLowerCase().includes("school")
          ? "school-school"
          : school.type.toLowerCase().includes("college")
          ? "school-college"
          : school.type.toLowerCase().includes("university")
          ? "school-university"
          : "";

      // Create contact section if available
      let contactSection = "";
      if (school.website || school.phone) {
        contactSection = `<div class="contact-info">`;

        if (school.website) {
          contactSection += `
            <div><i class="bi bi-globe"></i> <a href="${school.website}" target="_blank" rel="noopener noreferrer">Website</a></div>
          `;
        }

        if (school.phone) {
          contactSection += `
            <div><i class="bi bi-telephone"></i> <a href="tel:${school.phone}">${school.phone}</a></div>
          `;
        }

        contactSection += `</div>`;
      }

      html += `
        <div class="list-group-item school-card ${typeClass}">
          <div class="d-flex w-100 justify-content-between align-items-center">
            <h5 class="mb-1">${school.name}</h5>
          </div>
          <div class="mb-2">
            <span class="badge school-distance"><i class="bi bi-geo-alt-fill me-1"></i> ${
              school.distance
            } KM</span>
            <span class="school-type-badge">${school.type}</span>
            ${
              school.level
                ? `<span class="school-type-badge">Level: ${school.level}</span>`
                : ""
            }
          </div>
          <div class="mt-1">${school.address}</div>
          ${contactSection}
          <div class="school-details">
            <small class="text-muted">Coordinates: ${school.latitude.toFixed(
              6
            )}, ${school.longitude.toFixed(6)}</small>
          </div>
        </div>
      `;
    });
  } else {
    // Display database schools
    currentSchools.forEach((school) => {
      html += `
        <div class="list-group-item school-card school-school">
          <div class="d-flex w-100 justify-content-between align-items-center">
            <h5 class="mb-1">${school.name}</h5>
            <button class="btn btn-sm btn-danger delete-school-btn" data-id="${
              school.id
            }" title="Delete school">
              <i class="bi bi-trash"></i>
            </button>
          </div>
          <div class="mb-2">
            <span class="badge school-distance"><i class="bi bi-geo-alt-fill me-1"></i> ${
              school.distance
            } KM</span>
            <span class="school-type-badge">School</span>
          </div>
          <p class="mb-1">${school.address}</p>
          <div class="school-details">
            <small class="text-muted">Coordinates: ${school.latitude.toFixed(
              6
            )}, ${school.longitude.toFixed(6)}</small>
          </div>
        </div>
      `;
    });
  }

  html += "</div>";

  // Add pagination controls if there's more than one page
  if (totalPages > 1) {
    html += `
      <nav aria-label="School pagination">
        <ul class="pagination justify-content-center">
          <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
            <a class="page-link" href="#" data-page="prev" aria-label="Previous">
              <span aria-hidden="true">&laquo;</span>
            </a>
          </li>
    `;

    // Generate page numbers with proper limits
    const maxVisiblePages = 5; // Show at most 5 page numbers
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add first page with ellipsis if needed
    if (startPage > 1) {
      html += `
        <li class="page-item">
          <a class="page-link" href="#" data-page="1">1</a>
        </li>
      `;

      if (startPage > 2) {
        html += `
          <li class="page-item disabled">
            <a class="page-link" href="#">...</a>
          </li>
        `;
      }
    }

    // Add visible page numbers
    for (let i = startPage; i <= endPage; i++) {
      html += `
        <li class="page-item ${currentPage === i ? "active" : ""}">
          <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>
      `;
    }

    // Add last page with ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        html += `
          <li class="page-item disabled">
            <a class="page-link" href="#">...</a>
          </li>
        `;
      }

      html += `
        <li class="page-item">
          <a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a>
        </li>
      `;
    }

    html += `
          <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
            <a class="page-link" href="#" data-page="next" aria-label="Next">
              <span aria-hidden="true">&raquo;</span>
            </a>
          </li>
        </ul>
      </nav>
    `;
  }

  schoolsList.innerHTML = html;

  // Add event listeners to pagination controls
  document.querySelectorAll(".pagination .page-link").forEach((link) => {
    link.addEventListener("click", handlePaginationClick);
  });
}

// Handle pagination clicks
function handlePaginationClick(e) {
  e.preventDefault();

  // Make sure we get the link element even if the user clicked on a child element
  const linkElement = e.target.closest(".page-link");
  if (!linkElement) return;

  const page = linkElement.getAttribute("data-page");
  const totalPages = Math.ceil(currentSchoolsList.length / schoolsPerPage);

  // Don't do anything if clicking on a disabled link
  if (linkElement.parentElement.classList.contains("disabled")) {
    return;
  }

  // Handle different page navigation actions
  if (page === "prev") {
    currentPage = Math.max(1, currentPage - 1);
  } else if (page === "next") {
    currentPage = Math.min(totalPages, currentPage + 1);
  } else {
    // Ensure we parse as integer to avoid string concatenation
    currentPage = parseInt(page, 10);
  }

  // Ensure current page is within bounds
  if (currentPage < 1) currentPage = 1;
  if (currentPage > totalPages) currentPage = totalPages;

  // Update the display
  renderCurrentPage();

  // Scroll to top of the list with smooth scrolling
  schoolsList.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Add CSS file (for future use)
function addStylesheet() {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "css/styles.css";
  document.head.appendChild(link);
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  // Set initial section visibility
  mainSection.style.display = "block";
  apiTestSection.style.display = "none";

  // Show a notification about navigation options
  setTimeout(() => {
    showAlert(
      "Navigation Options",
      "Use the 'Main' and 'API Testing' buttons in the navbar to switch between views",
      "info"
    );
  }, 1000);
});

// Delete a school
async function deleteSchoolById(id) {
  try {
    console.log(`Attempting to delete school with ID: ${id}`);
    showAlert("Info", "Deleting school...", "info");

    const url = `${API_BASE_URL}/deleteSchool/${id}`;
    console.log("Delete URL:", url);

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Delete response status:", response.status);
    const result = await response.json();
    console.log("Delete response data:", result);

    if (result.success) {
      showAlert("Success", result.message);

      // Refresh the school list
      const latitude = document.getElementById("searchLatitude").value;
      const longitude = document.getElementById("searchLongitude").value;

      if (latitude && longitude) {
        await searchNearbySchools(latitude, longitude);
      }
    } else {
      showAlert("Error", result.message || "Failed to delete school", "danger");
    }
  } catch (error) {
    console.error("Error during delete:", error);
    showAlert(
      "Error",
      "Failed to connect to the server or process the response",
      "danger"
    );
  }
}

// Event delegation for delete buttons
document.addEventListener("click", async (e) => {
  if (
    e.target.classList.contains("delete-school-btn") ||
    e.target.closest(".delete-school-btn")
  ) {
    const button = e.target.classList.contains("delete-school-btn")
      ? e.target
      : e.target.closest(".delete-school-btn");

    const schoolId = button.getAttribute("data-id");

    if (confirm("Are you sure you want to delete this school?")) {
      await deleteSchoolById(schoolId);
    }
  }
});

// Switch between Main and API Testing sections
navMain.addEventListener("click", (e) => {
  e.preventDefault();
  mainSection.style.display = "block";
  apiTestSection.style.display = "none";
  navMain.classList.add("active");
  navApiTest.classList.remove("active");
});

navApiTest.addEventListener("click", (e) => {
  e.preventDefault();
  mainSection.style.display = "none";
  apiTestSection.style.display = "block";
  navMain.classList.remove("active");
  navApiTest.classList.add("active");
});

// Handle API Test Form Submissions
testAddSchoolForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const schoolData = {
    name: document.getElementById("test-schoolName").value,
    address: document.getElementById("test-schoolAddress").value,
    latitude: document.getElementById("test-latitude").value,
    longitude: document.getElementById("test-longitude").value,
  };

  // Generate Postman equivalent
  const postmanEquivalent = generatePostmanRequestCode(
    "POST",
    "addSchool",
    null,
    schoolData
  );

  // Make the API request
  await makeApiRequest(
    "POST",
    "addSchool",
    null,
    schoolData,
    postmanEquivalent
  );
});

testListSchoolsForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const params = {
    latitude: document.getElementById("test-listLatitude").value,
    longitude: document.getElementById("test-listLongitude").value,
  };

  // Generate Postman equivalent
  const postmanEquivalent = generatePostmanRequestCode(
    "GET",
    "listSchools",
    params
  );

  // Make the API request
  await makeApiRequest("GET", "listSchools", params, null, postmanEquivalent);
});

testFindRealSchoolsForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const params = {
    latitude: document.getElementById("test-findRealLatitude").value,
    longitude: document.getElementById("test-findRealLongitude").value,
  };

  // Generate Postman equivalent
  const postmanEquivalent = generatePostmanRequestCode(
    "GET",
    "findRealSchools",
    params
  );

  // Make the API request
  await makeApiRequest(
    "GET",
    "findRealSchools",
    params,
    null,
    postmanEquivalent
  );
});

testDeleteSchoolForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const schoolId = document.getElementById("test-deleteId").value;

  // Generate Postman equivalent
  const postmanEquivalent = generatePostmanRequestCode(
    "DELETE",
    `deleteSchool/${schoolId}`
  );

  // Make the API request
  await makeApiRequest(
    "DELETE",
    `deleteSchool/${schoolId}`,
    null,
    null,
    postmanEquivalent
  );
});

// Make API request and display results
async function makeApiRequest(method, endpoint, params, data, postmanCode) {
  try {
    // Update UI
    apiTestStatus.textContent = "Loading...";
    apiTestStatus.className = "";
    apiTestTime.textContent = "-";
    apiTestEndpoint.textContent = buildFullEndpoint(endpoint, params);
    apiTestResponse.textContent = "Fetching response...";
    postmanRequest.textContent = postmanCode;

    // Build URL with query parameters - fix the double /api issue
    // Remove both the leading slash and any 'api/' prefix from the endpoint to prevent double paths
    let cleanEndpoint = endpoint;

    // Remove leading slash if present
    if (cleanEndpoint.startsWith("/")) {
      cleanEndpoint = cleanEndpoint.substring(1);
    }

    // Remove 'api/' prefix if present to avoid duplication
    if (cleanEndpoint.startsWith("api/")) {
      cleanEndpoint = cleanEndpoint.substring(4);
    }

    let url = `${API_BASE_URL}/${cleanEndpoint}`;

    if (params) {
      const queryString = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&");
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    console.log("Making API request to:", url);

    // Record start time
    const startTime = performance.now();

    // Make the request
    const options = {
      method,
      headers: {},
    };

    if (data) {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const responseData = await response.json();

    // Record end time
    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Update UI with results
    apiTestStatus.textContent = `${response.status} ${response.statusText}`;
    apiTestStatus.className = response.ok ? "text-success" : "text-danger";
    apiTestTime.textContent = `${duration}s`;
    apiTestResponse.textContent = JSON.stringify(responseData, null, 2);
  } catch (error) {
    console.error("Error in API test:", error);
    apiTestStatus.textContent = "Error";
    apiTestStatus.className = "text-danger";
    apiTestResponse.textContent = `Error: ${error.message}\n\nMake sure the server is running.`;
  }
}

// Build full endpoint with query parameters
function buildFullEndpoint(endpoint, params) {
  if (!params) return endpoint;

  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return `${endpoint}?${queryString}`;
}

// Generate Postman request code
function generatePostmanRequestCode(method, endpoint, params, data) {
  let code = `// Postman equivalent request\n`;

  code += `pm.request.method = "${method}";\n`;

  // Build URL
  // Remove leading slash and api/ prefix if they exist
  let cleanEndpoint = endpoint;

  // Remove leading slash if present
  if (cleanEndpoint.startsWith("/")) {
    cleanEndpoint = cleanEndpoint.substring(1);
  }

  // Remove 'api/' prefix if present to avoid duplication
  if (cleanEndpoint.startsWith("api/")) {
    cleanEndpoint = cleanEndpoint.substring(4);
  }

  let url = `{{baseUrl}}/${cleanEndpoint}`;

  if (params) {
    const queryParams = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
    if (queryParams) {
      url += `?${queryParams}`;
    }
  }
  code += `pm.request.url.raw = "${url}";\n`;

  // Add headers and body if needed
  if (data) {
    code += `pm.request.headers.add({key: "Content-Type", value: "application/json"});\n`;
    code += `pm.request.body = {\n`;
    code += `  mode: "raw",\n`;
    code += `  raw: '${JSON.stringify(data, null, 2)}'\n`;
    code += `};\n`;
  }

  code += `\n// Send the request with\npm.sendRequest(pm.request);`;

  return code;
}

// Copy Postman request to clipboard
copyPostmanButton.addEventListener("click", () => {
  const text = postmanRequest.textContent;
  navigator.clipboard.writeText(text).then(
    () => {
      showAlert("Success", "Postman request copied to clipboard");
    },
    () => {
      showAlert("Error", "Failed to copy to clipboard", "danger");
    }
  );
});
