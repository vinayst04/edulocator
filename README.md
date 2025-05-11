# EduLocator

A comprehensive School Management System that helps find and manage educational institutions based on geographic proximity.

## Features

- Manage school data with full CRUD operations
- Find schools by proximity to any location
- Real-time educational data from OpenStreetMap API
- Interactive geolocation functionality
- Responsive Bootstrap UI with modern design
- Intelligent fallback to in-memory storage when database is unavailable
- Interactive API testing playground

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: CockroachDB (PostgreSQL compatible)
- **Frontend**: HTML5, CSS3, JavaScript ES6+, Bootstrap 5
- **External APIs**: OpenStreetMap
- **Deployment**: Vercel

## Live Demo

Visit the live application: [https://edulocator.vercel.app](https://edulocator.vercel.app)

## Installation

1. Clone the repository

```bash
git clone https://github.com/vinayst04/edulocator.git
cd edulocator
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables

```
PORT=3000
DATABASE_URL=your_cockroachdb_connection_string
```

4. Initialize the database

```bash
node db/init.js
```

5. Start the server

```bash
npm start
```

## API Documentation

### Add School

- **Endpoint**: `POST /api/addSchool`
- **Description**: Add a new school with location data
- **Request Body**:
  ```json
  {
    "name": "Example School",
    "address": "123 Education St",
    "latitude": 40.7128,
    "longitude": -74.006
  }
  ```

### List Schools

- **Endpoint**: `GET /api/listSchools?latitude=40.7128&longitude=-74.0060`
- **Description**: List all schools sorted by proximity to the provided coordinates

### Find Real Schools

- **Endpoint**: `GET /api/findRealSchools?latitude=40.7128&longitude=-74.0060`
- **Description**: Query OpenStreetMap for actual educational institutions near the coordinates

### Delete School

- **Endpoint**: `DELETE /api/deleteSchool/:id`
- **Description**: Remove a school from the database

## Contact

For questions or collaboration opportunities, please reach out directly.
