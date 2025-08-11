# GlobeTrotter Backend API Documentation

---

## Overview

This backend powers the GlobeTrotter personalized travel planner. It is built with Node.js, Express, and MongoDB, and provides a secure, feature-rich REST API for user authentication, trip management, sharing, analytics, and admin operations.

---

## Table of Contents
- [Setup & Environment](#setup--environment)
- [Authentication](#authentication)
- [Standard Response Format](#standard-response-format)
- [API Endpoints](#api-endpoints)
  - [Auth Routes](#auth-routes)
  - [User Routes](#user-routes)
  - [Trip Routes](#trip-routes)
  - [Public/Share Routes](#publicshare-routes)
  - [Admin Routes](#admin-routes)
  - [Search Routes](#search-routes)
- [Models](#models)
- [Validation Rules](#validation-rules)
- [Error Handling](#error-handling)

---

## Setup & Environment

### Requirements
- Node.js v18+
- MongoDB
- Cloudinary account (for image uploads)

### Environment Variables
- `PORT` (default: 5000)
- `MONGO_URI` (MongoDB connection string)
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES`, `JWT_REFRESH_EXPIRES`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `APP_URL` (e.g., http://localhost:5000)
- `FRONTEND_URL` (for CORS)
- `NODE_ENV` (development/production)
- `BCRYPT_SALT_ROUNDS` (default: 12)

### Start Server
```bash
npm install
npm run dev
```

---

## Authentication
- JWT-based (access + refresh tokens)
- Access token in `Authorization: Bearer <token>` header
- Refresh token in HTTP-only cookie
- Email verification required for login

---

## Standard Response Format
```json
{
  "success": true/false,
  "message": "...",
  "timestamp": "...",
  // data or error fields
}
```
- On error: `error: { message, statusCode, timestamp, ... }`
- On success: additional fields as per endpoint

---

## API Endpoints

### Auth Routes (`/api/v1/auth`)

| Method | Path | Description | Auth | Body Params | Query Params |
|--------|------|-------------|------|-------------|--------------|
| POST   | /signup | Register new user | No | name, email, password, phone?, country?, city? | - |
| POST   | /login | Login user | No | email, password | - |
| GET    | /verify-email | Verify email | No | - | token |
| POST   | /forgot-password | Request password reset | No | email | - |
| POST   | /reset-password | Reset password | No | token, password | - |
| POST   | /refresh | Refresh access token | Yes (refresh token cookie) | - | - |
| POST   | /logout | Logout user | Yes | - | - |

#### Example: Signup
```json
POST /api/v1/auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "phone": "+1234567890",
  "country": "USA",
  "city": "New York"
}
```

---

### User Routes (`/api/v1/users`)
> All require `Authorization: Bearer <access_token>`

| Method | Path | Description | Body Params |
|--------|------|-------------|-------------|
| GET    | /me | Get current user profile | - |
| PUT    | /me | Update profile | name?, phone?, country?, city? |
| POST   | /me/avatar | Upload avatar (form-data, field: avatar) | - |
| PUT    | /me/password | Change password | currentPassword, newPassword |
| DELETE | /me | Delete account | password |
| GET    | /me/stats | Get user statistics | - |

---

### Trip Routes (`/api/v1/trips`)
> All require `Authorization: Bearer <access_token>`

| Method | Path | Description | Body Params |
|--------|------|-------------|-------------|
| GET    | /         | List user's trips (pagination, search) | - |
| POST   | /         | Create trip | title, description?, startDate, endDate, coverImage?, isPublic? |
| GET    | /:id      | Get trip by ID | - |
| PUT    | /:id      | Update trip | title?, description?, startDate?, endDate?, coverImage?, isPublic? |
| DELETE | /:id      | Delete trip | - |
| PUT    | /:id/budget | Update trip budget | total?, transport?, stay?, activities?, meals? |
| GET    | /:id/summary | Get trip summary | - |
| POST   | /:tripId/stops | Add stop | city, country, startDate, endDate, bannerImage? |
| PUT    | /:tripId/stops/:stopId | Update stop | city?, country?, startDate?, endDate?, bannerImage? |
| DELETE | /:tripId/stops/:stopId | Delete stop | - |
| POST   | /:tripId/stops/:stopId/activities | Add activity | title, type, cost?, duration?, notes?, providerUrl? |
| PUT    | /:tripId/stops/:stopId/activities/:activityId | Update activity | title?, type?, cost?, duration?, notes?, providerUrl? |
| DELETE | /:tripId/stops/:stopId/activities/:activityId | Delete activity | - |

---

### Public/Share Routes

#### Public Endpoints (`/api/v1/public` or `/public`)
| Method | Path | Description | Query Params |
|--------|------|-------------|--------------|
| GET    | /trips | List public trips (pagination, search) | page, limit, search, country, sortBy, sortOrder |
| GET    | /:publicId | Get shared trip by public ID | - |

#### Share Management (require `Authorization`)
| Method | Path | Description | Body Params |
|--------|------|-------------|-------------|
| POST   | /trips/:id/share | Create share link | expirationDays? |
| GET    | /users/me/shares | List user's share links | - |
| DELETE | /shares/:shareId | Delete share link | - |

---

### Admin Routes (`/api/v1/admin`)
> All require `Authorization: Bearer <access_token>` and admin role

| Method | Path | Description | Query/Body Params |
|--------|------|-------------|-------------------|
| GET    | /stats/trips-over-time | Trip stats over time | period (day/month/year), year |
| GET    | /stats/popular-cities | Popular cities | limit |
| GET    | /stats/platform | Platform stats | - |
| GET    | /users | List users (pagination, search, filter) | page, limit, search, role, verified |
| PUT    | /users/:id/role | Update user role | role |
| DELETE | /users/:id | Delete user | - |

---

### Search Routes

| Method | Path | Description | Query Params |
|--------|------|-------------|--------------|
| GET    | /api/v1/search/cities | Search cities | q (min 2 chars), limit |
| GET    | /api/v1/search/activities | Search activities | q (min 2 chars), type, city, country, limit |

---

## Models

### User
- name, email, passwordHash, phone, country, city, avatarUrl, role, isVerified, etc.

### Trip
- ownerId, title, description, startDate, endDate, coverImage, isPublic, stops[], budget{}

### Stop (subdocument)
- city, country, startDate, endDate, bannerImage, activities[]

### Activity (subdocument)
- title, type (sightseeing, transport, stay, food, other), cost, duration, notes, providerUrl

### Share
- tripId, publicId, expiresAt, createdBy, viewCount, lastViewedAt

---

## Validation Rules
- All endpoints use strict validation (see `/src/utils/validators.js`)
- Passwords: min 8 chars, 1 uppercase, 1 lowercase, 1 number
- Email: valid format
- Trip/Stop/Activity: see model fields above

---

## Error Handling
- Standardized error responses with `success: false` and `error` object
- Common status codes: 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 409 (conflict), 429 (rate limit), 500 (server error)

---

## Testing in Postman
- Set `Content-Type: application/json` for JSON requests
- For protected routes, set `Authorization: Bearer <access_token>`
- For file uploads (avatar), use `multipart/form-data` with field `avatar`
- Use the `/api/v1/auth/login` endpoint to obtain tokens
- Use `/api/v1/auth/refresh` to refresh access token (send refresh token cookie)
- For admin routes, login as a user with `role: admin`

---

## Notes
- Rate limiting is applied to all routes (see `/src/app.js`)
- CORS is enabled for allowed origins (see `/src/app.js`)
- All dates are ISO8601 strings
- All IDs are MongoDB ObjectIds unless otherwise noted
- For more details, see the codebase and controller files 