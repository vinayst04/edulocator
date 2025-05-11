# EduLocator

A comprehensive School Management System with geolocation capabilities for finding nearby educational institutions.

## Features

- Add schools with location coordinates
- Find schools by proximity to a specified location
- Query real school data from OpenStreetMap API
- Manage school data with CRUD operations
- In-memory storage fallback when database is unavailable
- API testing playground for direct endpoint testing

## Technologies Used

- **Backend**: Node.js with Express
- **Database**: CockroachDB (PostgreSQL compatible)
- **Frontend**: HTML, CSS, JavaScript with Bootstrap
- **APIs**: OpenStreetMap for real school data
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- A CockroachDB database or other PostgreSQL-compatible database

### Installation

1. Clone the repository

```
git clone https://github.com/vinayst04/edulocator.git
cd edulocator
```

2. Install dependencies

```
npm install
```

3. Set up environment variables in config.env

```
PORT=3000
DATABASE_URL=your_cockroachdb_connection_string
```

4. Initialize the database

```
node db/init.js
```

5. Start the server

```
node server.js
```

## API Endpoints

- `POST /api/addSchool` - Add a new school
- `GET /api/listSchools` - List schools sorted by proximity
- `GET /api/findRealSchools` - Find real schools from OpenStreetMap
- `DELETE /api/deleteSchool/:id` - Delete a school by ID

## License

This project is licensed under the MIT License
