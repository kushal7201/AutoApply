# AutoApply - Job Application Automation Platform

![AutoApply Logo](https://via.placeholder.com/200x50/3B82F6/FFFFFF?text=AutoApply)

AutoApply is a comprehensive job application automation platform that helps job seekers save time by automatically discovering relevant positions and filling out applications using AI-powered form automation.

## 🚀 Features

### Core Features
- **Smart Job Discovery**: AI-powered job search across multiple platforms
- **Automated Applications**: Intelligent form filling using your profile data
- **RapidApply Mode**: Batch apply to multiple jobs simultaneously
- **Application Tracking**: Comprehensive dashboard with audit trails
- **Human-in-the-Loop**: Pause for CAPTCHAs, 2FA, and manual intervention
- **Multi-Resume Support**: Create and manage multiple resume variants

### Advanced Features
- **Browser Extension**: Client-side assistance for better success rates
- **Field Mapping Editor**: Customize form field mappings per portal
- **Smart Rate Limiting**: Respect portal limits and anti-bot measures
- **Privacy First**: Encrypted credentials and GDPR compliance
- **Real-time Updates**: WebSocket-based progress tracking
- **Comprehensive Analytics**: Success rates, metrics, and insights

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB
- **Automation**: Python + Playwright workers
- **Queue System**: RabbitMQ + Celery
- **File Storage**: Cloudinary
- **Real-time**: Socket.io
- **Cache**: Redis
- **Security**: JWT + HashiCorp Vault

### Project Structure
```
AutoApply/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── providers/       # Context providers
│   │   ├── services/        # API services
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── package.json
├── backend/                  # Node.js backend
│   ├── src/
│   │   ├── config/          # Database and service configs
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   └── utils/           # Backend utilities
│   ├── workers/             # Python Playwright workers
│   │   ├── core/            # Worker management
│   │   ├── connectors/      # Job portal connectors
│   │   └── utils/           # Worker utilities
│   └── package.json
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB (local or cloud)
- Redis (optional, for caching)
- RabbitMQ (optional, for queue)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kushal7201/AutoApply.git
   cd AutoApply
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Copy environment file
   cp .env.example .env
   # Edit .env with your configuration
   
   # Install Python dependencies
   cd workers
   pip install -r requirements.txt
   cd ..
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Start Development Servers**
   
   **Backend** (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```
   
   **Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```
   
   **Workers** (Terminal 3):
   ```bash
   cd backend/workers
   python main.py
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/health

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/autoapply

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Redis Configuration
REDIS_URL=redis://localhost:6379

# RabbitMQ Configuration
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_QUEUE_NAME=autoapply_tasks

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@autoapply.com
FROM_NAME=AutoApply

# External APIs
OPENAI_API_KEY=your_openai_api_key

# File Upload
MAX_FILE_SIZE=10485760

# Browser Automation
PUPPETEER_HEADLESS=true
SCREENSHOT_QUALITY=80
```

## 📡 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh JWT token

### Core Endpoints
- `GET /api/jobs` - Search jobs
- `POST /api/jobs/:id/apply` - Apply to job
- `GET /api/applications` - Get user applications
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Health Check
- `GET /health` - Service health status

## 🔐 Security & Privacy

### Security Measures
- **Encrypted Storage**: All sensitive data encrypted at rest
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive input sanitization
- **CORS Protection**: Configurable CORS policies
- **Helmet Security**: Security headers with Helmet.js

### Privacy Compliance
- **Data Minimization**: Only collect necessary data
- **User Consent**: Explicit consent for automation features
- **Data Portability**: Export and delete user data
- **Audit Logs**: Immutable activity logs
- **GDPR Compliance**: European privacy law compliance

### Legal Considerations
- **TOS Compliance**: Respect job portal terms of service
- **API First**: Prefer official APIs over scraping
- **Human Oversight**: Manual intervention for sensitive actions
- **Rate Limiting**: Polite scraping practices

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📋 Roadmap

### Phase 1 (MVP) ✅
- [x] Basic project structure
- [x] User authentication system
- [x] Database models and API foundation
- [x] Frontend React application
- [x] Basic UI components and routing

### Phase 2 (Core Features)
- [ ] Resume upload and parsing
- [ ] Job search integration
- [ ] Basic form automation
- [ ] Application tracking dashboard
- [ ] Browser extension

### Phase 3 (Advanced Features)
- [ ] AI-powered field mapping
- [ ] RapidApply batch processing
- [ ] Advanced analytics
- [ ] Multi-portal connectors
- [ ] Mobile application

### Phase 4 (Enterprise)
- [ ] Team collaboration features
- [ ] Advanced compliance tools
- [ ] White-label solutions
- [ ] API for third-party integrations

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Kushal Bansal** - Project Creator & Lead Developer

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/kushal7201/AutoApply/issues)
- **Email**: support@autoapply.com
- **Documentation**: Coming soon

## 🙏 Acknowledgments

- Thanks to all contributors and testers
- Inspired by the need to streamline job application processes
- Built with modern web technologies and best practices

---

**⚠️ Disclaimer**: AutoApply is designed to assist with job applications while respecting platform terms of service and legal requirements. Users are responsible for ensuring compliance with applicable laws and platform policies.

**🚀 Ready to automate your job search?** Get started by following the installation guide above!