# AutoApply Backend

Backend API for the AutoApply job application automation platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- MongoDB (local or cloud)
- Redis (optional, for caching)
- RabbitMQ (optional, for task queue)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Start Production Server**
   ```bash
   npm start
   ```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/         # Database and service configurations
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── services/       # Business logic and external services
│   ├── utils/          # Utility functions
│   └── server.js       # Express server setup
├── logs/               # Application logs
├── uploads/            # File uploads (temporary)
├── .env.example        # Environment variables template
├── .gitignore         # Git ignore rules
└── package.json       # Dependencies and scripts
```

## 🔧 Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/autoapply` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `FRONTEND_URL` | Frontend application URL | `http://localhost:3000` |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CLOUDINARY_*` | Cloudinary configuration | - |
| `REDIS_*` | Redis configuration | - |
| `RABBITMQ_URL` | RabbitMQ connection string | - |
| `OPENAI_API_KEY` | OpenAI API key for resume parsing | - |

## 📊 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |

### Profile Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get user profile |
| PUT | `/api/profile` | Update user profile |
| POST | `/api/profile/resume` | Upload resume |
| GET | `/api/profile/resumes` | Get user resumes |
| DELETE | `/api/profile/resume/:id` | Delete resume |

### Job Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs/search` | Search jobs |
| GET | `/api/jobs/saved` | Get saved jobs |
| POST | `/api/jobs/:id/save` | Save job |
| DELETE | `/api/jobs/:id/save` | Unsave job |

### Application Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/applications/apply/:jobId` | Apply to job |
| GET | `/api/applications` | Get user applications |
| GET | `/api/applications/:id` | Get application details |
| POST | `/api/applications/rapid-apply/start` | Start rapid apply |

## 🛠️ Development

### Available Scripts

```bash
# Development with auto-reload
npm run dev

# Production start
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### Code Style

This project uses ESLint with Airbnb configuration. Run `npm run lint` to check for style issues.

## 🔒 Security Features

- **Helmet.js** - Security headers
- **Rate Limiting** - Prevents abuse
- **CORS** - Cross-origin request handling
- **JWT Authentication** - Secure token-based auth
- **Input Validation** - Request validation with express-validator
- **File Upload Security** - Type and size restrictions

## 📝 Logging

The application uses Winston for logging:
- **Console logs** in development
- **File logs** in production
- **Error tracking** with stack traces
- **Request logging** with Morgan

## 🚨 Error Handling

Centralized error handling with:
- Custom error classes
- Mongoose error formatting
- JWT error handling
- Validation error formatting
- Production-safe error responses

## 🔄 Task Queue (Optional)

The application supports RabbitMQ for background tasks:
- Job application processing
- Email notifications
- Resume parsing
- Batch operations

## 📊 Monitoring

Health check endpoint available at `/health` provides:
- Server status
- Uptime information
- Environment details
- Database connection status

## 🚀 Deployment

### Environment Setup
1. Set production environment variables
2. Configure MongoDB connection
3. Set up Cloudinary for file storage
4. Configure email service for notifications

### Docker Support
```bash
# Build image
docker build -t autoapply-backend .

# Run container
docker run -p 5000:5000 autoapply-backend
```

## 🤝 Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Follow the commit message conventions

## 📄 License

This project is licensed under the MIT License.
