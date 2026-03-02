# Library Management System - Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              React SPA (Port 3000/5173)                   │  │
│  │                                                             │  │
│  │  Components:                                                │  │
│  │  • Dashboard      • Books Management                        │  │
│  │  • Loans         • Users Management                         │  │
│  │  • Authentication • Protected Routes                        │  │
│  │                                                             │  │
│  │  State Management: Context API (AuthContext)               │  │
│  │  Routing: React Router DOM v6                              │  │
│  │  UI: Tailwind CSS + Custom Components                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                      │
│                            │ HTTPS/REST API                      │
│                            ▼                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         ASP.NET Core 7.0 Web API (Port 5000)             │  │
│  │                                                             │  │
│  │  Middleware Pipeline:                                       │  │
│  │  1. Request Logging (Correlation IDs)                      │  │
│  │  2. Exception Handling                                      │  │
│  │  3. Authentication (JWT Bearer)                             │  │
│  │  4. Authorization (Role-based)                              │  │
│  │  5. Rate Limiting                                           │  │
│  │  6. CORS                                                    │  │
│  │                                                             │  │
│  │  Controllers:                                               │  │
│  │  • AuthController      • BooksController                    │  │
│  │  • LoansController     • UsersController                    │  │
│  │  • RefreshTokenController                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                      │
└────────────────────────────┼──────────────────────────────────────┘
                             │
┌────────────────────────────┼──────────────────────────────────────┐
│                      SERVICE LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│                            │                                      │
│  ┌────────────────────────▼──────────────────────────────────┐  │
│  │                  Business Logic Services                   │  │
│  │                                                             │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │ UserService  │  │ BookService  │  │ LoanService  │   │  │
│  │  │              │  │ (Cached)     │  │              │   │  │
│  │  │ - Register   │  │ - CRUD Ops   │  │ - Create     │   │  │
│  │  │ - Login      │  │ - Search     │  │ - Return     │   │  │
│  │  │ - Auth       │  │ - Validate   │  │ - Overdue    │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  │                                                             │  │
│  │  ┌──────────────┐  ┌──────────────┐                       │  │
│  │  │ JwtService   │  │ TokenService │                       │  │
│  │  │              │  │              │                       │  │
│  │  │ - Generate   │  │ - Refresh    │                       │  │
│  │  │ - Validate   │  │ - Revoke     │                       │  │
│  │  └──────────────┘  └──────────────┘                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                      │
│                            ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               Memory Cache (IMemoryCache)                 │  │
│  │  • Book listings cache (5 min TTL)                        │  │
│  │  • Individual book cache                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                      │
└────────────────────────────┼──────────────────────────────────────┘
                             │
┌────────────────────────────┼──────────────────────────────────────┐
│                   DATA ACCESS LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                            │                                      │
│  ┌────────────────────────▼──────────────────────────────────┐  │
│  │              Repository Pattern (Generic)                  │  │
│  │                                                             │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │           IRepository<T> / Repository<T>             │ │  │
│  │  │                                                        │ │  │
│  │  │  • GetAllAsync()      • GetByIdAsync()              │ │  │
│  │  │  • AddAsync()         • UpdateAsync()               │ │  │
│  │  │  • DeleteAsync()      • FindAsync()                 │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  │                                                             │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │         IUnitOfWork / UnitOfWork                     │ │  │
│  │  │                                                        │ │  │
│  │  │  • Books Repository                                  │ │  │
│  │  │  • Loans Repository                                  │ │  │
│  │  │  • Users Repository                                  │ │  │
│  │  │  • SaveChangesAsync()                                │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                      │
│                            ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Entity Framework Core 7.0 (ORM)                   │  │
│  │  • Code First Migrations                                   │  │
│  │  • DbContext: ApplicationDbContext                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                      │
└────────────────────────────┼──────────────────────────────────────┘
                             │
┌────────────────────────────┼──────────────────────────────────────┐
│                    DATABASE LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│                            │                                      │
│  ┌────────────────────────▼──────────────────────────────────┐  │
│  │           SQL Server (LocalDB / Docker)                    │  │
│  │                                                             │  │
│  │  Tables:                                                    │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐               │  │
│  │  │  Users   │  │  Books   │  │  Loans   │               │  │
│  │  ├──────────┤  ├──────────┤  ├──────────┤               │  │
│  │  │ Id       │  │ Id       │  │ Id       │               │  │
│  │  │ Username │  │ Title    │  │ BookId   │               │  │
│  │  │ Email    │  │ Author   │  │ UserId   │               │  │
│  │  │ Password │  │ ISBN     │  │ LoanDate │               │  │
│  │  │ Role     │  │ Copies   │  │ DueDate  │               │  │
│  │  └──────────┘  └──────────┘  │ Returned │               │  │
│  │                               └──────────┘               │  │
│  │                                                             │  │
│  │  Relationships:                                             │  │
│  │  • Users 1:N Loans                                          │  │
│  │  • Books 1:N Loans                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   CROSS-CUTTING CONCERNS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Security:                  Logging:                              │
│  • JWT Authentication       • Structured Logging                 │
│  • BCrypt Password Hash     • Correlation IDs                    │
│  • Role-based Auth          • Request/Response Logging           │
│  • Rate Limiting            • Error Tracking                     │
│                                                                   │
│  Performance:               Testing:                              │
│  • Memory Caching           • Unit Tests (xUnit)                 │
│  • Response Compression     • Integration Tests                  │
│  • Async/Await              • Mock Repositories (Moq)            │
│                                                                   │
│  DevOps:                                                          │
│  • Docker Containers        • GitHub Actions CI/CD               │
│  • docker-compose           • Automated Testing                  │
│  • Health Checks            • Code Coverage                      │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0
- **Styling**: Tailwind CSS 3.4
- **Routing**: React Router DOM 6
- **HTTP Client**: Axios 1.4
- **State Management**: Context API
- **Notifications**: React Hot Toast
- **Testing**: Jest + React Testing Library

### Backend
- **Framework**: ASP.NET Core 7.0
- **ORM**: Entity Framework Core 7.0
- **Database**: SQL Server 2022
- **Authentication**: JWT Bearer Tokens
- **Password Hashing**: BCrypt.Net
- **API Documentation**: Swagger/OpenAPI
- **Testing**: xUnit + Moq + FluentAssertions
- **Caching**: IMemoryCache

### DevOps
- **Containerization**: Docker + docker-compose
- **CI/CD**: GitHub Actions
- **Version Control**: Git
- **Cloud**: Azure / Railway / Render
- **Reverse Proxy**: Nginx

## Architecture Patterns

### 1. Repository Pattern
- Abstracts data access logic
- Generic `IRepository<T>` interface
- Entity-specific repositories

### 2. Unit of Work Pattern
- Manages transactions across multiple repositories
- Ensures data consistency
- Single SaveChanges() point

### 3. Service Layer Pattern
- Encapsulates business logic
- Decouples controllers from data access
- Improves testability

### 4. Dependency Injection
- Constructor injection throughout
- Configured in Program.cs
- Promotes loose coupling

### 5. Decorator Pattern (Caching)
- `CachedBookService` wraps `BookService`
- Transparent caching layer
- Cache invalidation on mutations

### 6. Middleware Pipeline
- Request logging with correlation IDs
- Global exception handling
- Authentication & authorization
- Rate limiting
- CORS

## Security Features

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication
- **Refresh Tokens**: Extended sessions
- **Role-Based Access**: Admin, Librarian, Member
- **Password Security**: BCrypt hashing with salt
- **Token Expiration**: Configurable timeout

### API Security
- **Rate Limiting**: Prevents brute force attacks
- **CORS**: Controlled origin access
- **HTTPS**: Encrypted communication
- **Input Validation**: DTO validation
- **SQL Injection Prevention**: Parameterized queries (EF Core)

## Performance Optimizations

### Caching Strategy
- **What**: Book listings and individual books
- **Where**: In-memory cache (IMemoryCache)
- **TTL**: 5 minutes
- **Invalidation**: On create/update/delete

### Database
- **Async Operations**: All I/O operations are async
- **Connection Pooling**: Managed by EF Core
- **Indexing**: Primary keys and foreign keys
- **Eager Loading**: Include() for related entities

### Frontend
- **Code Splitting**: Vite automatic chunking
- **Lazy Loading**: Route-based code splitting
- **Asset Optimization**: Minification + compression
- **CDN**: Static asset caching (Nginx)

## Data Flow

### User Authentication Flow
```
1. User enters credentials → Frontend
2. POST /api/auth/login → Backend API
3. UserService.AuthenticateAsync() → Service Layer
4. Verify password (BCrypt) → Security
5. Generate JWT + Refresh Token → JwtService/TokenService
6. Return tokens → Frontend
7. Store tokens (localStorage) → Client
8. Add Authorization header → All future requests
```

### Book Creation Flow
```
1. Admin submits form → Frontend
2. POST /api/books → Backend API (Auth required)
3. BooksController.CreateBook() → Controller
4. IBookService.CreateBookAsync() → Service Layer
5. Validate business rules → BookService
6. Repository.AddAsync() → Repository
7. UnitOfWork.SaveChangesAsync() → Data Layer
8. Cache invalidation → CachedBookService
9. Return created book → Frontend
```

### Loan Processing Flow
```
1. Member requests loan → Frontend
2. POST /api/loans → Backend API
3. LoansController.CreateLoan() → Controller
4. LoanService.CreateLoanAsync() → Service Layer
5. Check book availability → Business Logic
6. Check existing loans → Repository Query
7. Create loan + Update copies → UnitOfWork Transaction
8. Return loan details → Frontend
9. Update UI → React State
```

## Deployment Architecture

### Development
```
Frontend (Vite Dev Server:5173) 
    ↓ HTTP
Backend (Kestrel:5000)
    ↓ TCP
SQL Server (LocalDB)
```

### Production (Docker)
```
                    ┌─────────────┐
                    │   Nginx     │
                    │   (Port 80) │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
    ┌─────────────────┐      ┌─────────────────┐
    │   Frontend      │      │    Backend      │
    │  (Static SPA)   │      │  (ASP.NET Core) │
    └─────────────────┘      └────────┬────────┘
                                      │
                                      ▼
                            ┌─────────────────┐
                            │   SQL Server    │
                            │   (Container)   │
                            └─────────────────┘
```

### CI/CD Pipeline
```
GitHub Push
    ↓
GitHub Actions Workflow
    ├─ Backend Tests (xUnit)
    ├─ Frontend Tests (Jest)
    ├─ Build Docker Images
    ├─ Security Scan (Trivy)
    ↓
Docker Hub / Registry
    ↓
Deploy to Cloud
    ├─ Azure App Service
    ├─ Railway
    └─ Render
```

## Database Schema

```sql
-- Users Table
CREATE TABLE Users (
    Id INT PRIMARY KEY IDENTITY,
    Username NVARCHAR(50) UNIQUE NOT NULL,
    Email NVARCHAR(100) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(20) NOT NULL, -- Admin, Librarian, Member
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

-- Books Table
CREATE TABLE Books (
    Id INT PRIMARY KEY IDENTITY,
    Title NVARCHAR(200) NOT NULL,
    Author NVARCHAR(100) NOT NULL,
    ISBN NVARCHAR(13) UNIQUE,
    PublishedYear INT,
    Genre NVARCHAR(50),
    TotalCopies INT NOT NULL,
    AvailableCopies INT NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

-- Loans Table
CREATE TABLE Loans (
    Id INT PRIMARY KEY IDENTITY,
    BookId INT NOT NULL FOREIGN KEY REFERENCES Books(Id),
    UserId INT NOT NULL FOREIGN KEY REFERENCES Users(Id),
    LoanDate DATETIME2 NOT NULL,
    DueDate DATETIME2 NOT NULL,
    ReturnDate DATETIME2 NULL,
    Status NVARCHAR(20) NOT NULL, -- Active, Returned, Overdue
    CreatedAt DATETIME2 DEFAULT GETDATE()
);
```

## API Endpoints Overview

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns JWT + Refresh Token)
- `POST /api/auth/me` - Get current user info
- `POST /api/refreshtoken/refresh` - Refresh access token
- `POST /api/refreshtoken/revoke` - Revoke refresh token

### Books
- `GET /api/books` - Get all books
- `GET /api/books/{id}` - Get book by ID
- `POST /api/books` - Create book (Admin/Librarian)
- `PUT /api/books/{id}` - Update book (Admin/Librarian)
- `DELETE /api/books/{id}` - Delete book (Admin)

### Loans
- `GET /api/loans` - Get all loans (Admin/Librarian)
- `GET /api/loans/user/{userId}` - Get user's loans
- `POST /api/loans` - Create loan
- `PUT /api/loans/{id}/return` - Return book

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/{id}` - Get user by ID
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user (Admin)

## Scalability Considerations

### Horizontal Scaling
- Stateless API design (JWT tokens)
- Session data in tokens, not server
- Cache can be moved to Redis
- Database read replicas

### Vertical Scaling
- Async operations reduce thread blocking
- Connection pooling optimizes DB connections
- Memory cache reduces DB queries
- Response compression reduces bandwidth

### Future Enhancements
- Redis distributed cache
- Message queue (RabbitMQ/Azure Service Bus)
- Microservices architecture
- CDN for static assets
- ElasticSearch for book search
- Real-time notifications (SignalR)

## Monitoring & Observability

### Logging
- Structured logging (Serilog recommended)
- Correlation IDs for request tracking
- Log levels: Debug, Info, Warning, Error
- Centralized logging (Application Insights, ELK)

### Metrics
- Response times
- Error rates
- Cache hit/miss ratio
- Database query performance
- API endpoint usage

### Health Checks
- Database connectivity
- Cache availability
- Memory usage
- Disk space
