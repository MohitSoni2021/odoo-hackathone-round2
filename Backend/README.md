# GlobeTrotter Backend API

A complete, production-ready Node.js backend for the GlobeTrotter personalized travel planner application.

## 🌟 Features

### 🔐 Authentication & Security
- JWT-based authentication (Access + Refresh tokens)
- Email verification & password reset
- Role-based access control (User/Admin)
- Rate limiting & brute force protection
- Secure password hashing with bcrypt
- CORS, Helmet, and Compression middleware

### 🗺️ Trip Management
- Create, read, update, delete trips
- Add stops with multiple activities
- Budget tracking and management
- Public/private trip visibility
- Trip sharing with expirable links
- Comprehensive trip analytics

### 👥 User Management
- User profiles with avatar upload
- User statistics and analytics
- Account management (change password, delete account)
- Admin user management

### 📊 Analytics & Insights
- User dashboard analytics
- Platform-wide statistics (Admin)
- Popular destinations tracking
- Budget trend analysis
- Activity popularity metrics

### 🔍 Search & Discovery
- City and activity search
- Popular destinations
- Activity suggestions by location
- Public trip browsing

### 📧 Email Services
- Account verification emails
- Password reset emails
- Welcome emails
- Responsive HTML email templates

### ☁️ File Management
- Cloudinary integration for image uploads
- Avatar and trip image management
- Automatic image optimization

## 🛠️ Tech Stack

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (jsonwebtoken)
- **File Upload:** Multer + Cloudinary
- **Email:** Nodemailer
- **Security:** bcrypt, helmet, cors, rate-limiter-flexible
- **Logging:** Winston + Morgan
- **Validation:** express-validator
- **Environment:** dotenv

## 📁 Project Structure

```
src/
├── config/
│   ├── db.js              # MongoDB connection
│   ├── cloudinary.js      # Cloudinary setup
│   └── logger.js          # Winston logger
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── trip.controller.js
│   ├── public.controller.js
│   └── admin.controller.js
├── middlewares/
│   ├── auth.middleware.js
│   ├── role.middleware.js
│   ├── error.middleware.js
│   └── validate.middleware.js
├── models/
│   ├── user.model.js
│   ├── trip.model.js
│   ├── stop.model.js      # Subdocument
│   ├── activity.model.js  # Subdocument
│   └── share.model.js
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── trip.routes.js
│   ├── public.routes.js
│   └── admin.routes.js
├── services/
│   ├── email.service.js
│   ├── search.service.js
│   └── analytics.service.js
├── utils/
│   ├── validators.js
│   ├── pagination.js
│   └── response.js
├── app.js                 # Express app setup
└── server.js              # Server entry point
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- Cloudinary account (optional)
- SMTP email service

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Environment Setup:**
Create a `.env` file based on `.env.example`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.wtrgbcz.mongodb.net/globetrotter

# JWT Secrets (generate secure random strings)
JWT_ACCESS_SECRET=your_32_character_access_secret
JWT_REFRESH_SECRET=your_32_character_refresh_secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d

# Password Hashing
BCRYPT_SALT_ROUNDS=12

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Cloudinary (Optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Application URL
APP_URL=http://localhost:5000
```

3. **Database Setup:**
- Create a MongoDB Atlas cluster
- Add your IP to the whitelist
- Create a database user
- Copy the connection string to `MONGO_URI`

4. **Start the server:**

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The server will start on `http://localhost:5000`

### Health Check
Visit `http://localhost:5000/health` to verify the server is running.

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register new user |
| POST | `/auth/login` | User login |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | User logout |
| GET | `/auth/verify-email` | Verify email address |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password |

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | Get current user profile |
| PUT | `/users/me` | Update user profile |
| POST | `/users/me/avatar` | Upload user avatar |
| PUT | `/users/me/password` | Change password |
| DELETE | `/users/me` | Delete account |
| GET | `/users/me/stats` | Get user statistics |

### Trip Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/trips` | Get user's trips |
| POST | `/trips` | Create new trip |
| GET | `/trips/:id` | Get trip by ID |
| PUT | `/trips/:id` | Update trip |
| DELETE | `/trips/:id` | Delete trip |
| PUT | `/trips/:id/budget` | Update trip budget |
| GET | `/trips/:id/summary` | Get trip summary |

### Stops & Activities

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/trips/:tripId/stops` | Add stop to trip |
| PUT | `/trips/:tripId/stops/:stopId` | Update stop |
| DELETE | `/trips/:tripId/stops/:stopId` | Delete stop |
| POST | `/trips/:tripId/stops/:stopId/activities` | Add activity |
| PUT | `/trips/:tripId/stops/:stopId/activities/:actId` | Update activity |
| DELETE | `/trips/:tripId/stops/:stopId/activities/:actId` | Delete activity |

### Public & Sharing

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/public/trips` | Get public trips |
| GET | `/public/:publicId` | Get shared trip |
| POST | `/public/trips/:id/share` | Create share link |
| GET | `/public/users/me/shares` | Get user's shares |
| DELETE | `/public/shares/:shareId` | Delete share link |

### Search

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/search/cities` | Search cities |
| GET | `/search/activities` | Search activities |

### Admin (Admin Role Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/stats/trips-over-time` | Trip creation trends |
| GET | `/admin/stats/popular-cities` | Popular destinations |
| GET | `/admin/stats/platform` | Platform statistics |
| GET | `/admin/users` | Get all users |
| PUT | `/admin/users/:id/role` | Update user role |
| DELETE | `/admin/users/:id` | Delete user |

## 📝 Request/Response Examples

### User Registration
```bash
POST /api/v1/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "country": "United States",
  "city": "New York"
}
```

### Create Trip
```bash
POST /api/v1/trips
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "European Adventure",
  "description": "A 2-week journey through Europe",
  "startDate": "2024-06-01T00:00:00.000Z",
  "endDate": "2024-06-15T00:00:00.000Z",
  "isPublic": false
}
```

### Response Format
All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🔧 Configuration

### Environment Variables

#### Required
- `MONGO_URI` - MongoDB connection string
- `JWT_ACCESS_SECRET` - JWT access token secret
- `JWT_REFRESH_SECRET` - JWT refresh token secret

#### Optional
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment mode
- `BCRYPT_SALT_ROUNDS` - Password hashing rounds
- Email configuration for notifications
- Cloudinary configuration for image uploads

### Database Indexes

The application automatically creates indexes for:
- User email (unique)
- Trip owner and creation date
- Public trips
- Share public IDs
- Date ranges for analytics

## 🛡️ Security Features

### Authentication
- JWT access tokens (15 minutes expiry)
- JWT refresh tokens (30 days expiry, httpOnly cookies)
- Email verification required
- Password strength validation

### Rate Limiting
- Authentication routes: 5 attempts per 15 minutes
- General API: 100 requests per 15 minutes per IP

### Data Protection
- Password hashing with bcrypt (12 rounds)
- Input validation and sanitization
- CORS configuration
- Helmet security headers
- SQL injection protection via Mongoose

### Authorization
- Role-based access control
- Resource ownership validation
- Admin-only endpoints protection

## 📊 Analytics & Monitoring

### Built-in Analytics
- User activity tracking
- Trip creation trends
- Popular destinations
- Budget analysis
- Activity popularity metrics

### Logging
- Request logging with Morgan
- Application logging with Winston
- Error tracking and monitoring
- Performance metrics

## 🚀 Deployment

### Production Checklist

1. **Environment Setup:**
   - Set `NODE_ENV=production`
   - Use strong JWT secrets
   - Configure production MongoDB
   - Set up email service
   - Configure Cloudinary

2. **Security:**
   - Enable HTTPS
   - Configure proper CORS origins
   - Set secure cookie flags
   - Update rate limiting rules

3. **Performance:**
   - Enable gzip compression
   - Set up CDN for static assets
   - Configure database indexes
   - Implement caching strategy

4. **Monitoring:**
   - Set up log aggregation
   - Configure error tracking
   - Monitor database performance
   - Set up health checks

### Deployment Platforms

The application is ready for deployment on:
- **Heroku** - Easy deployment with add-ons
- **DigitalOcean App Platform** - Simple container deployment
- **Railway** - Modern deployment platform
- **Render** - Simple cloud platform
- **AWS/Google Cloud/Azure** - Full cloud platforms

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API examples

---

**GlobeTrotter Backend** - Built with ❤️ for travelers worldwide 🌍