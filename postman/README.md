# School Management API - Postman Collection

This directory contains a Postman collection for testing the School Management API.

## Getting Started

1. Install [Postman](https://www.postman.com/downloads/) if you haven't already
2. Import the collection:
   - Open Postman
   - Click on "Import" in the top left
   - Select the file `School_Management_API.postman_collection.json` from this directory

## Available Endpoints

The collection contains the following API endpoints:

### 1. Add School (POST)

- URL: `http://localhost:3000/api/addSchool`
- Adds a new school to the database
- Body:
  ```json
  {
    "name": "Example School",
    "address": "123 Education St, City, Country",
    "latitude": 37.7749,
    "longitude": -122.4194
  }
  ```

### 2. List Schools by Proximity (GET)

- URL: `http://localhost:3000/api/listSchools?latitude=37.7749&longitude=-122.4194`
- Lists all schools sorted by proximity to the provided coordinates
- Query parameters:
  - `latitude`: The latitude of the reference point
  - `longitude`: The longitude of the reference point

### 3. Find Real Schools from OpenStreetMap (GET)

- URL: `http://localhost:3000/api/findRealSchools?latitude=37.7749&longitude=-122.4194`
- Finds real educational facilities from OpenStreetMap based on coordinates
- Query parameters:
  - `latitude`: The latitude of the reference point
  - `longitude`: The longitude of the reference point

### 4. Delete School (DELETE)

- URL: `http://localhost:3000/api/deleteSchool/1`
- Deletes a school with the specified ID
- URL parameter:
  - School ID (replace `1` with the actual ID)

### 5. Home Page (GET)

- URL: `http://localhost:3000/`
- Returns the web interface for the School Management System

## Testing the API

1. Make sure the server is running (`node server.js` from the project root)
2. Use the collection to test each endpoint
3. For convenience, the collection includes a variable `{{baseUrl}}` set to `http://localhost:3000`

## Response Examples

### Add School (Success)

```json
{
  "success": true,
  "message": "School added successfully",
  "data": {
    "id": 1,
    "name": "Example School",
    "address": "123 Education St, City, Country",
    "latitude": 37.7749,
    "longitude": -122.4194
  }
}
```

### List Schools (Success)

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "name": "Example School",
      "address": "123 Education St, City, Country",
      "latitude": 37.7749,
      "longitude": -122.4194,
      "distance": 0
    },
    {
      "id": 2,
      "name": "Another School",
      "address": "456 Learning Ave, Town, Country",
      "latitude": 37.8049,
      "longitude": -122.4394,
      "distance": 3.65
    }
  ],
  "fromMemory": false
}
```

## Troubleshooting

If you encounter any issues:

1. Ensure the server is running at `http://localhost:3000`
2. Check that all required fields are included in your requests
3. Verify the database connection is working
4. For DELETE operations, ensure you're using a valid ID
