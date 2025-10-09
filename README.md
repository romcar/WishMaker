# WishMaker ✨

A full-stack wish making application built with React, TypeScript, Node.js, Express, and PostgreSQL.

## Features

- 🎯 Create, read, update, and delete wishes
- 🔄 Track wish status (pending, fulfilled, cancelled)
- 💾 PostgreSQL database for data persistence
- 🎨 Beautiful, responsive UI with React
- 🔒 Type-safe with TypeScript across frontend and backend
- 🐳 Docker support for easy database setup

## Tech Stack

### Frontend
- React 18
- TypeScript
- Axios for API calls
- CSS3 with gradient design

### Backend
- Node.js
- Express
- TypeScript
- PostgreSQL with pg driver
- CORS enabled

### Database
- PostgreSQL 16
- Docker Compose setup included

## Project Structure

```
WishMaker/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API service layer
│   │   ├── types/         # TypeScript type definitions
│   │   ├── App.tsx        # Main app component
│   │   └── App.css        # Styles
│   └── package.json
├── backend/               # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── routes/        # API routes
│   │   ├── models/        # Data models
│   │   ├── db/            # Database configuration
│   │   └── index.ts       # Server entry point
│   └── package.json
└── docker-compose.yml     # PostgreSQL setup
```

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for PostgreSQL)
- Git

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/romcar/WishMaker.git
cd WishMaker
```

### 2. Start PostgreSQL Database

```bash
docker-compose up -d
```

This will start a PostgreSQL container with the database initialized.

### 3. Setup Backend

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Build TypeScript
npm run build

# Start the development server
npm run dev
```

The backend API will run on `http://localhost:8000`

### 4. Setup Frontend

```bash
cd frontend
npm install

# Create .env file (optional)
cp .env.example .env

# Start the development server
npm start
```

The frontend will run on `http://localhost:3000`

## Environment Variables

### Backend (.env)

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wishmaker
DB_USER=postgres
DB_PASSWORD=postgres
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## API Endpoints

| Method | Endpoint          | Description           |
| ------ | ----------------- | --------------------- |
| GET    | `/api/wishes`     | Get all wishes        |
| GET    | `/api/wishes/:id` | Get a specific wish   |
| POST   | `/api/wishes`     | Create a new wish     |
| PUT    | `/api/wishes/:id` | Update a wish         |
| DELETE | `/api/wishes/:id` | Delete a wish         |
| GET    | `/health`         | Health check endpoint |

## Database Schema

### Wishes Table

```sql
CREATE TABLE wishes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending'
);
```

## Development

### Backend Development

```bash
cd backend
npm run dev  # Runs with nodemon and auto-reload
```

### Frontend Development

```bash
cd frontend
npm start  # Runs with hot reload
```

### Build for Production

#### Backend

```bash
cd backend
npm run build
npm start
```

#### Frontend

```bash
cd frontend
npm run build
# Serve the build folder with your preferred static server
```

## Testing

The application can be tested by:
1. Creating wishes through the UI
2. Updating wish status
3. Deleting wishes
4. Checking data persistence by refreshing the page

## Troubleshooting

### Database Connection Issues

- Ensure Docker is running: `docker ps`
- Check PostgreSQL logs: `docker-compose logs postgres`
- Verify database is healthy: `docker-compose ps`

### Backend Issues

- Check if port 8000 is available
- Verify environment variables are set correctly
- Check backend logs for errors

### Frontend Issues

- Ensure backend is running first
- Check if port 3000 is available
- Verify REACT_APP_API_URL is correct in .env

## License

MIT License - see LICENSE file for details

## Author

Erwin R. Carrasquilla
