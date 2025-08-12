# GlobeTrotter - Personalized Travel Planner

![GlobeTrotter](https://img.shields.io/badge/GlobeTrotter-Travel%20Planner-blue)
![License](https://img.shields.io/badge/license-MIT-green)

# [Video Link](https://youtu.be/QLRdSAYtyYY)

## 🌍 Overview

GlobeTrotter is a comprehensive travel planning platform that helps users create personalized trip itineraries, manage travel budgets, and share their adventures. Built with a modern tech stack, it offers a feature-rich experience for travel enthusiasts.

## 🚀 Features

### Authentication & Security
- JWT-based authentication with access and refresh tokens
- Email verification & password reset functionality
- Role-based access control (User/Admin)
- Rate limiting & brute force protection

### User Management
- User profiles with avatar upload
- Account management
- User statistics and travel insights

### Trip Planning
- Create, read, update, delete trips
- Add stops with multiple activities
- Budget tracking and management
- Trip sharing functionality

### Public Trip Discovery
- Browse public trips
- Search by location, date, and keywords
- View shared trip itineraries

## 🏗️ Architecture

### Backend
- **Node.js** with **Express** framework
- **MongoDB** database for data storage
- RESTful API design with standardized responses
- JWT authentication and authorization
- Cloudinary integration for image uploads
- Comprehensive error handling and logging

### Frontend
- **React** with **TypeScript**
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Chart.js** for data visualization
- **Axios** for API communication
- Form validation with **React Hook Form** and **Yup**

## 🛠️ Tech Stack

### Backend
- Node.js & Express
- MongoDB & Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Cloudinary for image storage
- Winston for logging
- Express Validator for validation

### Frontend
- React 18
- TypeScript
- Redux Toolkit
- React Router
- Tailwind CSS
- Material Tailwind components
- Chart.js & React-Chartjs-2
- Framer Motion for animations

## 📋 Project Structure

```
├── Backend/                # Node.js Express backend
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── middlewares/   # Express middlewares
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utility functions
│   │   ├── app.js         # Express app setup
│   │   └── server.js      # Server entry point
│   └── package.json       # Backend dependencies
│
├── Frontend/              # React TypeScript frontend
│   ├── src/
│   │   ├── api/           # API client and services
│   │   ├── app/           # App configuration
│   │   ├── components/    # Reusable components
│   │   ├── DataCenter/    # Data management
│   │   ├── features/      # Feature modules
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   ├── routes/        # Routing configuration
│   │   ├── styles/        # Global styles
│   │   ├── utils/         # Utility functions
│   │   ├── App.tsx        # Main App component
│   │   └── main.tsx       # Entry point
│   └── package.json       # Frontend dependencies
```

## 🚦 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB
- Cloudinary account (for image uploads)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_ACCESS_SECRET=your_access_token_secret
   JWT_REFRESH_SECRET=your_refresh_token_secret
   JWT_ACCESS_EXPIRES=15m
   JWT_REFRESH_EXPIRES=7d
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   APP_URL=http://localhost:5000
   FRONTEND_URL=http://localhost:5173
   NODE_ENV=development
   BCRYPT_SALT_ROUNDS=12
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   VITE_API_URL=http://localhost:5000/api/v1
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🔄 API Endpoints

The backend provides a comprehensive RESTful API. For detailed documentation, refer to the [Backend DETAILS.MD](./Backend/DETAILS.MD) file.

## 🔮 Future Improvements

GlobeTrotter has a roadmap of exciting features planned for future development:

1. **AI Trip Planner**
   - AI-powered itinerary suggestions
   - Personalized activity recommendations
   - Smart budget optimization

2. **Real-time Collaboration**
   - Multi-user trip editing
   - Real-time chat and comments
   - Collaborative budget tracking

3. **Interactive Trip Visualization**
   - Interactive timeline view
   - Dynamic map integration
   - Photo galleries and rich media

4. **Smart Budget Management**
   - Multi-currency support
   - Expense tracking with categories
   - Receipt scanning and storage

5. **Mobile-First Experience**
   - Progressive Web App
   - Offline functionality
   - Push notifications

For a complete list of planned improvements, see the [improvement plan](./remaining.txt).

## 📜 License

This project is licensed under the MIT License.

## 👥 Contributors

- GlobeTrotter Team
