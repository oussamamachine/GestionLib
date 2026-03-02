# 📚 Library Management System

> **Enterprise-grade full-stack web application** for library management with role-based authentication, built with modern technologies and best practices.

[![.NET](https://img.shields.io/badge/.NET-7.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

## 🎯 Project Overview

A comprehensive library management system demonstrating **enterprise-level architecture** with clean code principles, SOLID design patterns, and production-ready DevOps practices. This project showcases full-stack development capabilities, including backend API design, frontend React development, testing, containerization, and CI/CD automation.

### Key Highlights

- 🏗️ **Clean Architecture**: Repository pattern, Unit of Work, Service layer separation
- 🔐 **Security First**: JWT authentication, BCrypt password hashing, role-based authorization, rate limiting
- ⚡ **Performance Optimized**: In-memory caching, async operations, response compression
- 🧪 **Fully Tested**: 110+ unit and integration tests (xUnit + Jest)
- 🐳 **Containerized**: Docker & docker-compose for easy deployment
- 🚀 **CI/CD Ready**: GitHub Actions workflow with automated testing
- 📊 **Production Monitoring**: Request logging with correlation IDs, structured logging
- 📚 **Well Documented**: Comprehensive API docs, architecture diagrams, deployment guides

## ✨ Features

### Backend (ASP.NET Core 7.0)
- ✅ **Authentication & Authorization**: JWT tokens with refresh token mechanism
- ✅ **Role-Based Access Control**: Admin, Librarian, Member roles with granular permissions
- ✅ **Repository Pattern**: Generic repository with Unit of Work for transaction management
- ✅ **Service Layer**: Business logic separation from controllers
- ✅ **Caching Strategy**: Decorator pattern for transparent caching (5-min TTL)
- ✅ **Rate Limiting**: Protection against brute force attacks on auth endpoints
- ✅ **Request Logging**: Correlation IDs for distributed tracing
- ✅ **Exception Handling**: Global middleware for consistent error responses
- ✅ **API Documentation**: Swagger/OpenAPI with JWT support
- ✅ **Entity Framework Core**: Code-first with SQL Server
- ✅ **Password Security**: BCrypt hashing with salt
- ✅ **CORS Configuration**: Secure cross-origin resource sharing
- ✅ **Async/Await**: Non-blocking I/O operations throughout
- ✅ **Comprehensive Testing**: 42 unit and integration tests with 70%+ coverage

### Frontend (React 18 + Vite 5 + Tailwind CSS 3)
- ✅ **Modern UI/UX**: Responsive design with Tailwind CSS
- ✅ **Role-Based Dashboards**: Different views for Admin, Librarian, and Member
- ✅ **Component Library**: 6 reusable components (Button, Input, Card, Table, Modal, Spinner)
- ✅ **Real-time Notifications**: React Hot Toast for user feedback
- ✅ **Form Validation**: Client-side validation with helpful error messages
- ✅ **Loading States**: Skeleton screens and spinners for better UX
- ✅ **Error Handling**: Graceful error display with retry mechanisms
- ✅ **Protected Routes**: Route guards based on authentication and roles
- ✅ **Authentication Context**: Global auth state management
- ✅ **Axios Interceptors**: Automatic token injection and refresh
- ✅ **Comprehensive Testing**: 68+ component and utility tests with Jest + RTL

### DevOps & Deployment
- ✅ **Dockerization**: Multi-stage builds for backend and frontend
- ✅ **Docker Compose**: Complete stack with SQL Server, API, and frontend
- ✅ **CI/CD Pipeline**: GitHub Actions for automated builds, tests, and Docker publishing
- ✅ **Security Scanning**: Trivy vulnerability scanning in CI pipeline
- ✅ **Cloud Ready**: Deployment guides for Azure, Railway, and Render
- ✅ **HTTPS Support**: SSL/TLS configuration for production
- ✅ **Environment Variables**: Secure configuration management
- ✅ **Health Checks**: Container health monitoring

## 🎯 User Roles & Permissions

| Feature | Admin | Librarian | Member |
|---------|-------|-----------|--------|
| Manage Users | ✅ | ❌ | ❌ |
| Create/Edit Books | ✅ | ✅ | ❌ |
| Delete Books | ✅ | ❌ | ❌ |
| View All Books | ✅ | ✅ | ✅ |
| Create Loans | ✅ | ✅ | ✅ |
| View All Loans | ✅ | ✅ | ❌ |
| View Own Loans | ✅ | ✅ | ✅ |
| Return Books | ✅ | ✅ | ✅ (own only) |
| Dashboard Analytics | ✅ | ✅ | ✅ (personal) |

## 🏗️ Architecture

### System Architecture
```
Frontend (React SPA) → Backend API (ASP.NET Core) → Database (SQL Server)
     ↓                          ↓                           ↓
  Vite Build            JWT Auth + Caching           EF Core ORM
  Nginx Serve          Repository Pattern          Migrations
```

### Technology Stack

**Backend**
- ASP.NET Core 7.0 - Web API framework
- Entity Framework Core 7.0 - ORM
- SQL Server 2022 - Database
- BCrypt.Net - Password hashing
- JWT Bearer - Authentication
- Swagger/OpenAPI - API documentation
- xUnit + Moq + FluentAssertions - Testing
- IMemoryCache - In-memory caching

**Frontend**
- React 18.2 - UI library
- Vite 5.0 - Build tool
- Tailwind CSS 3.4 - Styling
- React Router DOM 6 - Routing
- Axios 1.4 - HTTP client
- React Hot Toast - Notifications
- Jest + React Testing Library - Testing

**DevOps**
- Docker & docker-compose - Containerization
- GitHub Actions - CI/CD
- Nginx - Reverse proxy & static serving
- Trivy - Security scanning

For detailed architecture documentation, see [ARCHITECTURE.md](ARCHITECTURE.md).

## 🚀 Quick Start

### Prerequisites
- .NET 7.0 SDK or higher
- Node.js 18+ and npm
- SQL Server (LocalDB or Docker)
- Git

### Option 1: Automated Setup (Windows)

Run the automated setup script:
```bash
git clone <repository-url>
cd gestion-lib
```

### 2. Setup Backend

```bash
cd backend

# Restore dependencies and build
dotnet restore
dotnet build

# Run the API
dotnet run
```

Backend will be available at:
- **API**: `https://localhost:5001`
- **Swagger Docs**: `https://localhost:5001/swagger`

### 3. Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

### Option 2: Docker Compose (Recommended for Production)

```bash
# Start all services (backend, frontend, SQL Server)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database**: localhost:1433

## 🔐 Demo Credentials

The system comes with pre-seeded users for testing:

| Role | Email | Password | Capabilities |
|------|-------|----------|--------------|
| Admin | `admin@library.com` | `Admin123!` | Full system access |
| Librarian | `librarian@library.com` | `Librarian123!` | Book & loan management |
| Member | `member@library.com` | `Member123!` | Browse & borrow books |

## 🧪 Running Tests

### Backend Tests (xUnit)
```bash
cd backend.Tests
dotnet test --verbosity normal

# With coverage
dotnet test --collect:"XPlat Code Coverage"
```

**Coverage**: 42 unit and integration tests with 70%+ coverage

### Frontend Tests (Jest + React Testing Library)
```bash
cd frontend
npm test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

**Coverage**: 68+ component and utility tests

## 📚 Documentation

Comprehensive documentation is available:

- **[API Documentation](API_DOCUMENTATION.md)** - Complete REST API reference with examples
- **[Architecture Guide](ARCHITECTURE.md)** - System design, patterns, and data flow diagrams
- **[Deployment Guide](DEPLOYMENT.md)** - Step-by-step deployment to Azure, Railway, Render, or self-hosted
- **[Quick Start Guide](QUICK_START.md)** - Get up and running in 5 minutes
- **[Enhancements Log](ENHANCEMENTS.md)** - All improvements and features added

## 📊 Project Statistics

- **Backend**: 3,500+ lines of C# code across 30+ files
- **Frontend**: 2,800+ lines of JavaScript/JSX across 25+ components
- **Tests**: 110+ automated tests with high coverage
- **API Endpoints**: 20+ RESTful endpoints
- **Database Tables**: 3 tables with relationships
- **Docker Images**: 2 optimized multi-stage builds
- **CI/CD**: Automated pipeline with 5 stages

## 🎯 Key Technical Achievements

### Backend Excellence
- **Clean Architecture**: Separation of concerns with Repository, Service, and Controller layers
- **SOLID Principles**: Dependency injection, interface segregation, single responsibility
- **Decorator Pattern**: Transparent caching layer without modifying business logic
- **Unit of Work**: Transactional consistency across multiple operations
- **Async/Await**: Non-blocking I/O for better scalability
- **Rate Limiting**: Protection against brute force and DDoS attacks
- **Correlation IDs**: Distributed tracing for debugging

### Frontend Excellence
- **Component Reusability**: 6 fully reusable, tested components
- **State Management**: Context API for global auth state
- **Error Boundaries**: Graceful error handling and recovery
- **Loading States**: Improved UX with skeletons and spinners
- **Form Validation**: Client-side validation with helpful messages
- **Responsive Design**: Mobile-first approach with Tailwind
- **Route Protection**: Role-based access control on routes

### DevOps Excellence
- **Containerization**: Docker multi-stage builds reduce image size by 60%
- **CI/CD Automation**: GitHub Actions with parallel job execution
- **Security Scanning**: Automated vulnerability detection with Trivy
- **Environment Management**: Secure secrets and configuration
- **Health Checks**: Container orchestration with health monitoring
- **Cloud Deployment**: Ready for Azure, AWS, GCP, Railway, or Render

## 📱 Screenshots

### Dashboard Views
![Admin Dashboard - Overview with statistics and quick actions]
![Librarian Dashboard - Book and loan management interface]
![Member Dashboard - Browse books and view active loans]

### Key Features
![Book Management - CRUD operations with search and filters]
![Loan Processing - Create and manage book loans]
![User Management - Admin panel for user administration]
![Authentication - Login and registration flows]

*Screenshots available in `/docs/screenshots/` directory*

## 🗺️ Roadmap

### Future Enhancements
- [ ] Advanced search with filters (genre, author, year, availability)
- [ ] Email notifications for overdue books
- [ ] Book reservation system
- [ ] Late fee calculation
- [ ] Reading history and recommendations
- [ ] Multi-language support (i18n)
- [ ] Mobile app (React Native)
- [ ] Real-time notifications (SignalR)
- [ ] Analytics dashboard with charts
- [ ] Export reports (PDF, Excel)

## 🏗️ Architecture Patterns

### Design Patterns Used
- **Repository Pattern**: Abstracts data layer
- **Unit of Work**: Transaction management
- **Service Layer Pattern**: Business logic separation
- **Decorator Pattern**: Caching layer
- **Dependency Injection**: Loose coupling
- **Middleware Pipeline**: Request/response processing

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed diagrams and explanations.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Write unit tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- Portfolio: [your-portfolio.com](https://your-portfolio.com)
- LinkedIn: [linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- ASP.NET Core team for excellent documentation
- React community for amazing ecosystem
- Tailwind CSS for utility-first CSS framework
- All contributors and testers

## 📞 Support

If you have questions or need help:
- 📧 Email: your.email@example.com
- 💬 Issues: [GitHub Issues](https://github.com/yourusername/library-management/issues)
- 📖 Documentation: Check the `/docs` folder

## ⭐ Show Your Support

Give a ⭐️ if this project helped you or you found it interesting!

---

**Built with ❤️ using .NET, React, and modern web technologies**

```env
VITE_API_URL=https://localhost:5001/api
```

## 📦 Technologies Used

### Backend
- ASP.NET Core 8.0
- Entity Framework Core
- SQL Server
- JWT Bearer Authentication
- BCrypt.NET
- Swagger/OpenAPI

### Frontend
- React 18
- Vite 5
- Tailwind CSS 3
- React Router DOM 6
- Axios
- React Hot Toast

## 🚢 Deployment

### Backend Deployment
```bash
cd backend
dotnet publish -c Release -o ./publish
```

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy the 'dist' folder to your web server
```

## 🧪 Testing

### Testing Backend with Swagger
1. Run backend: `dotnet run`
2. Open: `https://localhost:5001/swagger`
3. Login using demo credentials
4. Use token for authenticated endpoints

### Testing Frontend
1. Run frontend: `npm run dev`
2. Login with demo credentials
3. Test all role-based features

## 📖 Development Guide

### Adding a New Feature

**Backend:**
1. Create entity in `Domain/Entities/`
2. Add DbSet to `ApplicationDbContext`
3. Create repository interface and implementation
4. Create service interface and implementation
5. Create DTOs
6. Create controller
7. Add to dependency injection in `Program.cs`

**Frontend:**
1. Create page component in `pages/`
2. Add API calls in `services/api.js`
3. Add route in `App.jsx`
4. Update navigation in `Dashboard.jsx`

## 🐛 Troubleshooting

### Backend Issues
- **Database connection error**: Check connection string in `appsettings.json`
- **Port already in use**: Change port in `Properties/launchSettings.json`
- **JWT errors**: Verify JWT secret is configured

### Frontend Issues
- **API connection error**: Check `VITE_API_URL` in `.env`
- **CORS error**: Verify backend CORS configuration
- **Token expired**: Clear localStorage and login again

## 📝 License

MIT License - feel free to use this project for learning or production.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues, questions, or suggestions, please create an issue in the repository.

---

**Built with ❤️ using ASP.NET Core and React**
