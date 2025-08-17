# AI Paint Visualization Backend Setup Guide

## 🎨 Complete Backend Integration with AI APIs & Authentication

This backend system provides AI-powered paint visualization using **Roboflow** for surface detection and **getimg.ai** for paint application, with secure JWT authentication and MongoDB integration.

## 📋 Prerequisites

### Required Services & API Keys

1. **MongoDB Database**
   - Local MongoDB installation OR
   - MongoDB Atlas cloud database
   - Connection string ready

2. **Roboflow API Key**
   - Sign up at [roboflow.com](https://roboflow.com)
   - Create account and get API key
   - Use furniture detection model

3. **getimg.ai API Key**
   - Sign up at [getimg.ai](https://getimg.ai)
   - Get API key for Stable Diffusion XL Inpainting
   - Ensure sufficient credits for image processing

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Update `.env` file with your actual API keys:

```env
# MongoDB (update with your connection string)
MONGODB_URI=mongodb://localhost:27017/paint-visualizer
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/paint-visualizer

# JWT Secret (generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-make-it-very-long-and-random

# API Keys (REQUIRED - replace with actual keys)
ROBOFLOW_API_KEY=your-actual-roboflow-api-key-here
GETIMG_API_KEY=your-actual-getimg-ai-api-key-here

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Database Setup

Seed the database with paint colors:

```bash
npm run seed:colors
```

### 4. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev:server

# OR production mode
npm run server
```

Server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication Routes

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### POST `/api/auth/login`
Login with existing credentials.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### GET `/api/auth/profile` (Protected)
Get current user profile.

**Headers:** `Authorization: Bearer <jwt_token>`

### Paint Visualization Routes

#### POST `/api/paint/process` (Protected)
Process paint visualization with AI.

**Headers:** 
- `Authorization: Bearer <jwt_token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `image`: Image file (JPG/PNG, max 10MB)
- `colorId`: Paint color ID from database
- `projectName`: Optional project name

**Response:**
```json
{
  "success": true,
  "project": {
    "id": "project_id",
    "name": "My Project",
    "originalImage": "/uploads/original.jpg",
    "processedImage": "https://getimg.ai/processed-image-url",
    "selectedColor": {
      "name": "Agreeable Gray",
      "hexCode": "#D4CFC0",
      "brand": "Sherwin-Williams"
    },
    "recommendations": [...],
    "detectedSurfaces": 3
  }
}
```

#### GET `/api/paint/projects` (Protected)
Get user's project history.

#### GET `/api/paint/colors` (Public)
Get available paint colors.

**Query Parameters:**
- `brand`: Filter by brand
- `category`: Filter by category (neutral, warm, cool, bold)
- `search`: Text search
- `limit`: Number of results (default: 50)

#### GET `/api/paint/brands` (Public)
Get list of available paint brands.

## 🔐 Authentication Flow

1. **User Registration/Login** → Receives JWT token
2. **Token Storage** → Frontend stores token in localStorage
3. **Protected Requests** → Include `Authorization: Bearer <token>` header
4. **Token Validation** → Server validates token on protected routes
5. **Auto-Redirect** → Frontend redirects to login if token invalid/expired

## 🤖 AI Processing Pipeline

### Step 1: Surface Detection (Roboflow)
- Upload image to Roboflow API
- Detect furniture, walls, cabinets, doors
- Return bounding boxes and confidence scores

### Step 2: Mask Creation
- Convert detection results to binary mask
- White areas = paintable surfaces
- Black areas = preserve original

### Step 3: Paint Application (getimg.ai)
- Use Stable Diffusion XL Inpainting
- Apply selected color to masked areas
- Generate photorealistic result

### Step 4: Color Recommendations
- Analyze selected color using color theory
- Generate complementary and analogous colors
- Return 3 recommended alternatives

## 🗂️ Project Structure

```
server/
├── config/
│   ├── database.js          # MongoDB connection
│   └── apis.js              # External API configurations
├── models/
│   ├── User.js              # User authentication model
│   ├── Project.js           # Paint visualization projects
│   └── Color.js             # Paint colors database
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── routes/
│   ├── auth.js              # Authentication endpoints
│   └── paintVisualization.js # Paint processing endpoints
├── services/
│   └── paintVisualization.js # AI processing service
├── seeders/
│   └── colorSeeder.js       # Database seeding script
└── index.js                 # Main server file
```

## 🛠️ Development Scripts

```bash
# Start development server with auto-restart
npm run dev:server

# Start production server
npm run server

# Seed database with paint colors
npm run seed:colors

# Run frontend development
npm run dev

# Build frontend for production
npm run build
```

## 🔧 Configuration Options

### MongoDB Options
- **Local:** `mongodb://localhost:27017/paint-visualizer`
- **Atlas:** `mongodb+srv://user:pass@cluster.mongodb.net/paint-visualizer`
- **Docker:** `mongodb://mongo:27017/paint-visualizer`

### JWT Configuration
- **Secret:** Use strong, random string (32+ characters)
- **Expiration:** Default 7 days (`expiresIn: '7d'`)
- **Algorithm:** HS256 (default)

### File Upload Limits
- **Max File Size:** 10MB
- **Allowed Types:** image/jpeg, image/png, image/gif
- **Storage:** Local uploads/ directory

## 🚨 Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details (development only)"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created (registration)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found
- `500` - Internal Server Error

## 🔒 Security Features

- **Password Hashing:** bcrypt with salt rounds
- **JWT Tokens:** Secure, stateless authentication
- **Input Validation:** Request body validation
- **File Upload Security:** Type and size restrictions
- **CORS Protection:** Configured for frontend domain
- **Rate Limiting:** Can be added with express-rate-limit

## 📈 Performance Considerations

- **Database Indexing:** Optimized queries for colors and projects
- **Image Processing:** Async handling with proper error management
- **API Timeouts:** 30s for Roboflow, 60s for getimg.ai
- **Memory Management:** Stream-based file handling
- **Caching:** Can be added with Redis for color data

## 🧪 Testing the API

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Get Colors
```bash
curl http://localhost:5000/api/paint/colors?limit=10
```

### Process Paint Visualization (requires token)
```bash
curl -X POST http://localhost:5000/api/paint/process \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@path/to/room.jpg" \
  -F "colorId=COLOR_ID_FROM_DATABASE" \
  -F "projectName=My Test Project"
```

## 🚀 Production Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=very-long-and-secure-production-secret
ROBOFLOW_API_KEY=your-production-roboflow-key
GETIMG_API_KEY=your-production-getimg-key
PORT=5000
FRONTEND_URL=https://your-frontend-domain.com
```

### Recommended Production Setup
- Use PM2 for process management
- Set up reverse proxy with Nginx
- Use HTTPS with SSL certificates
- Implement rate limiting
- Add logging with Winston
- Use MongoDB Atlas for database
- Set up monitoring and alerts

## 📞 Support & Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check MongoDB is running
   - Verify connection string in .env
   - Ensure network access for Atlas

2. **API Key Errors**
   - Verify Roboflow API key is valid
   - Check getimg.ai credits and permissions
   - Ensure keys are properly set in .env

3. **File Upload Issues**
   - Check uploads/ directory exists and is writable
   - Verify file size under 10MB
   - Ensure proper image format (JPG/PNG)

4. **Authentication Problems**
   - Verify JWT_SECRET is set
   - Check token format in Authorization header
   - Ensure user exists in database

### Getting Help
- Check server logs for detailed error messages
- Use Postman/Insomnia for API testing
- Verify environment variables are loaded
- Test database connection independently

---

## 🎉 You're All Set!

Your AI Paint Visualization Backend is now ready to transform room images with AI-powered paint applications. The system provides secure authentication, intelligent surface detection, and realistic paint visualization using cutting-edge AI technology.

**Next Steps:**
1. Update your frontend to integrate with these new API endpoints
2. Test the complete flow with sample room images
3. Customize the color database with your preferred paint brands
4. Deploy to production when ready

Happy painting! 🎨✨