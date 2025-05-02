# Full-Stack Authentication Template

A basic full-stack web application template with authentication functionality using Node.js, Express, MongoDB, React, and PrimeReact.

## Features

- User registration and login
- JWT-based authentication
- Protected routes
- Clean and modular codebase
- PrimeReact UI components

## Project Structure

```
.
├── backend/                # Node.js backend
│   ├── middleware/         # Express middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   └── server.js           # Express server setup
│
└── frontend/               # React frontend
    ├── public/             # Static files
    └── src/
        ├── components/     # Reusable components
        ├── context/        # React context
        ├── pages/          # Page components
        └── services/       # API services
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/auth_app
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   ```

4. Start the backend server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the frontend development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Register a new user account
2. Login with your credentials
3. Access the protected dashboard

## License

MIT
