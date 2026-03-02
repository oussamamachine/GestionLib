# Library Management System - API Documentation

## Overview
RESTful API built with ASP.NET Core 7.0 for managing a library system with role-based authentication.

**Base URL**: `https://your-domain.com/api`  
**Authentication**: JWT Bearer Token  
**Content-Type**: `application/json`

## Authentication

All endpoints except `/auth/login` and `/auth/register` require authentication via JWT Bearer token.

### Include Token in Requests
```http
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register User
Create a new user account.

**Endpoint**: `POST /api/auth/register`  
**Auth Required**: No  
**Rate Limit**: 5 requests/minute

#### Request Body
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "Password123!",
  "role": "Member"
}
```

#### Response (201 Created)
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "Member"
}
```

#### Validation Rules
- Username: Required, 3-50 characters
- Email: Required, valid email format
- Password: Min 8 characters, must contain uppercase, lowercase, number, special character
- Role: Must be "Admin", "Librarian", or "Member"

---

### Login
Authenticate and receive JWT tokens.

**Endpoint**: `POST /api/auth/login`  
**Auth Required**: No  
**Rate Limit**: 5 requests/60 seconds

#### Request Body
```json
{
  "username": "admin",
  "password": "Admin123!"
}
```

#### Response (200 OK)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "dGVzdC1yZWZyZXNoLXRva2Vu",
  "expiresAt": "2024-01-15T14:30:00Z",
  "username": "admin",
  "email": "admin@library.com",
  "role": "Admin"
}
```

#### Error (401 Unauthorized)
```json
{
  "error": "Invalid username or password"
}
```

---

### Get Current User
Get authenticated user information.

**Endpoint**: `GET /api/auth/me`  
**Auth Required**: Yes

#### Response (200 OK)
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@library.com",
  "role": "Admin"
}
```

---

### Refresh Token
Obtain new access token using refresh token.

**Endpoint**: `POST /api/refreshtoken/refresh`  
**Auth Required**: No  
**Rate Limit**: 10 requests/minute

#### Request Body
```json
{
  "refreshToken": "dGVzdC1yZWZyZXNoLXRva2Vu"
}
```

#### Response (200 OK)
```json
{
  "token": "new_jwt_token",
  "refreshToken": "new_refresh_token",
  "expiresAt": "2024-01-15T15:30:00Z",
  "username": "admin",
  "email": "admin@library.com",
  "role": "Admin"
}
```

---

### Revoke Token
Revoke a refresh token.

**Endpoint**: `POST /api/refreshtoken/revoke`  
**Auth Required**: Yes

#### Request Body
```json
{
  "refreshToken": "token_to_revoke"
}
```

#### Response (200 OK)
```json
{
  "message": "Token revoked successfully"
}
```

---

## Books Endpoints

### Get All Books
Retrieve list of all books (cached for 5 minutes).

**Endpoint**: `GET /api/books`  
**Auth Required**: Yes  
**Roles Allowed**: All

#### Response (200 OK)
```json
[
  {
    "id": 1,
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "978-0-7432-7356-5",
    "publishedYear": 1925,
    "genre": "Fiction",
    "totalCopies": 5,
    "availableCopies": 3
  },
  {
    "id": 2,
    "title": "To Kill a Mockingbird",
    "author": "Harper Lee",
    "isbn": "978-0-06-112008-4",
    "publishedYear": 1960,
    "genre": "Fiction",
    "totalCopies": 4,
    "availableCopies": 2
  }
]
```

---

### Get Book by ID
Retrieve specific book details.

**Endpoint**: `GET /api/books/{id}`  
**Auth Required**: Yes  
**Roles Allowed**: All

#### Response (200 OK)
```json
{
  "id": 1,
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "978-0-7432-7356-5",
  "publishedYear": 1925,
  "genre": "Fiction",
  "totalCopies": 5,
  "availableCopies": 3
}
```

#### Error (404 Not Found)
```json
{
  "message": "Book not found"
}
```

---

### Create Book
Add a new book to the library.

**Endpoint**: `POST /api/books`  
**Auth Required**: Yes  
**Roles Allowed**: Admin, Librarian

#### Request Body
```json
{
  "title": "1984",
  "author": "George Orwell",
  "isbn": "978-0-452-28423-4",
  "publishedYear": 1949,
  "genre": "Dystopian Fiction",
  "totalCopies": 10
}
```

#### Response (201 Created)
```json
{
  "id": 3,
  "title": "1984",
  "author": "George Orwell",
  "isbn": "978-0-452-28423-4",
  "publishedYear": 1949,
  "genre": "Dystopian Fiction",
  "totalCopies": 10,
  "availableCopies": 10
}
```

#### Error (403 Forbidden)
```json
{
  "message": "You do not have permission to perform this action"
}
```

---

### Update Book
Update existing book information.

**Endpoint**: `PUT /api/books/{id}`  
**Auth Required**: Yes  
**Roles Allowed**: Admin, Librarian

#### Request Body
```json
{
  "title": "1984 (Updated Edition)",
  "author": "George Orwell",
  "isbn": "978-0-452-28423-4",
  "publishedYear": 1949,
  "genre": "Dystopian Fiction",
  "totalCopies": 15
}
```

#### Response (200 OK)
```json
{
  "id": 3,
  "title": "1984 (Updated Edition)",
  "author": "George Orwell",
  "isbn": "978-0-452-28423-4",
  "publishedYear": 1949,
  "genre": "Dystopian Fiction",
  "totalCopies": 15,
  "availableCopies": 13
}
```

---

### Delete Book
Remove a book from the library.

**Endpoint**: `DELETE /api/books/{id}`  
**Auth Required**: Yes  
**Roles Allowed**: Admin only

#### Response (204 No Content)
No response body

#### Error (403 Forbidden)
```json
{
  "message": "Only administrators can delete books"
}
```

---

## Loans Endpoints

### Get All Loans
Retrieve all loans in the system.

**Endpoint**: `GET /api/loans`  
**Auth Required**: Yes  
**Roles Allowed**: Admin, Librarian

#### Response (200 OK)
```json
[
  {
    "id": 1,
    "bookId": 1,
    "bookTitle": "The Great Gatsby",
    "userId": 2,
    "username": "john_doe",
    "loanDate": "2024-01-01T10:00:00Z",
    "dueDate": "2024-01-15T10:00:00Z",
    "returnDate": null,
    "status": "Active"
  },
  {
    "id": 2,
    "bookId": 2,
    "bookTitle": "To Kill a Mockingbird",
    "userId": 3,
    "username": "jane_smith",
    "loanDate": "2024-01-05T14:00:00Z",
    "dueDate": "2024-01-19T14:00:00Z",
    "returnDate": "2024-01-18T09:30:00Z",
    "status": "Returned"
  }
]
```

---

### Get User Loans
Retrieve loans for a specific user.

**Endpoint**: `GET /api/loans/user/{userId}`  
**Auth Required**: Yes  
**Roles Allowed**: All (users can only see their own loans)

#### Response (200 OK)
```json
[
  {
    "id": 1,
    "bookId": 1,
    "bookTitle": "The Great Gatsby",
    "userId": 2,
    "username": "john_doe",
    "loanDate": "2024-01-01T10:00:00Z",
    "dueDate": "2024-01-15T10:00:00Z",
    "returnDate": null,
    "status": "Active"
  }
]
```

---

### Create Loan
Create a new book loan.

**Endpoint**: `POST /api/loans`  
**Auth Required**: Yes  
**Roles Allowed**: All

#### Request Body
```json
{
  "bookId": 1,
  "userId": 2
}
```

#### Response (201 Created)
```json
{
  "id": 3,
  "bookId": 1,
  "bookTitle": "The Great Gatsby",
  "userId": 2,
  "username": "john_doe",
  "loanDate": "2024-01-10T10:00:00Z",
  "dueDate": "2024-01-24T10:00:00Z",
  "returnDate": null,
  "status": "Active"
}
```

#### Error (400 Bad Request)
```json
{
  "message": "No copies available for this book"
}
```

---

### Return Book
Mark a loan as returned.

**Endpoint**: `PUT /api/loans/{id}/return`  
**Auth Required**: Yes  
**Roles Allowed**: All (users can only return their own books)

#### Response (200 OK)
```json
{
  "id": 1,
  "bookId": 1,
  "bookTitle": "The Great Gatsby",
  "userId": 2,
  "username": "john_doe",
  "loanDate": "2024-01-01T10:00:00Z",
  "dueDate": "2024-01-15T10:00:00Z",
  "returnDate": "2024-01-14T16:30:00Z",
  "status": "Returned"
}
```

---

## Users Endpoints

### Get All Users
Retrieve all registered users.

**Endpoint**: `GET /api/users`  
**Auth Required**: Yes  
**Roles Allowed**: Admin only

#### Response (200 OK)
```json
[
  {
    "id": 1,
    "username": "admin",
    "email": "admin@library.com",
    "role": "Admin",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  {
    "id": 2,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "Member",
    "createdAt": "2024-01-05T10:00:00Z"
  }
]
```

---

### Get User by ID
Retrieve specific user details.

**Endpoint**: `GET /api/users/{id}`  
**Auth Required**: Yes  
**Roles Allowed**: Admin, or the user themselves

#### Response (200 OK)
```json
{
  "id": 2,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "Member",
  "createdAt": "2024-01-05T10:00:00Z"
}
```

---

### Update User
Update user information.

**Endpoint**: `PUT /api/users/{id}`  
**Auth Required**: Yes  
**Roles Allowed**: Admin, or the user themselves

#### Request Body
```json
{
  "username": "john_doe_updated",
  "email": "john.updated@example.com",
  "role": "Librarian"
}
```

#### Response (200 OK)
```json
{
  "id": 2,
  "username": "john_doe_updated",
  "email": "john.updated@example.com",
  "role": "Librarian",
  "createdAt": "2024-01-05T10:00:00Z"
}
```

---

### Delete User
Remove a user from the system.

**Endpoint**: `DELETE /api/users/{id}`  
**Auth Required**: Yes  
**Roles Allowed**: Admin only

#### Response (204 No Content)
No response body

---

## Error Responses

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (successful deletion) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limit exceeded) |
| 500 | Internal Server Error |

### Error Response Format
```json
{
  "message": "Error description",
  "errors": {
    "field": ["Validation error message"]
  },
  "correlationId": "abc-123-def-456"
}
```

---

## Rate Limiting

Certain endpoints have rate limiting to prevent abuse:

- **Login**: 5 requests per 60 seconds per IP
- **Register**: 5 requests per 60 seconds per IP
- **Refresh Token**: 10 requests per 60 seconds per IP

When rate limit is exceeded:
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
Content-Type: text/plain

Too many requests. Please try again later.
```

---

## Caching

Book endpoints use server-side caching:
- **GET /api/books**: Cached for 5 minutes
- **GET /api/books/{id}**: Cached for 5 minutes
- Cache automatically invalidated on create/update/delete operations

Cache headers:
```http
X-Cache: HIT
X-Cache-TTL: 240
```

---

## Correlation IDs

All responses include a correlation ID header for request tracking:
```http
X-Correlation-ID: 550e8400-e29b-41d4-a716-446655440000
```

Include this ID when reporting issues.

---

## Example Usage

### cURL

#### Login
```bash
curl -X POST https://api.library.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123!"}'
```

#### Get Books (Authenticated)
```bash
curl https://api.library.com/api/books \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

#### Create Book
```bash
curl -X POST https://api.library.com/api/books \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "1984",
    "author": "George Orwell",
    "isbn": "978-0-452-28423-4",
    "publishedYear": 1949,
    "genre": "Fiction",
    "totalCopies": 10
  }'
```

### JavaScript (Axios)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.library.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Login
const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  localStorage.setItem('token', response.data.token);
  api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
  return response.data;
};

// Get all books
const getBooks = async () => {
  const response = await api.get('/books');
  return response.data;
};

// Create book
const createBook = async (bookData) => {
  const response = await api.post('/books', bookData);
  return response.data;
};
```

### Python (requests)

```python
import requests

BASE_URL = "https://api.library.com/api"

# Login
response = requests.post(
    f"{BASE_URL}/auth/login",
    json={"username": "admin", "password": "Admin123!"}
)
token = response.json()["token"]

# Get books
headers = {"Authorization": f"Bearer {token}"}
response = requests.get(f"{BASE_URL}/books", headers=headers)
books = response.json()

# Create book
book_data = {
    "title": "1984",
    "author": "George Orwell",
    "isbn": "978-0-452-28423-4",
    "publishedYear": 1949,
    "genre": "Fiction",
    "totalCopies": 10
}
response = requests.post(
    f"{BASE_URL}/books",
    json=book_data,
    headers=headers
)
```

---

## Swagger/OpenAPI

Interactive API documentation available at:
```
https://api.library.com/swagger
```

Features:
- Try API endpoints directly in browser
- View request/response schemas
- Authentication testing
- Download OpenAPI specification

---

## Versioning

Current API version: **v1**

Future versions will be accessible via:
```
/api/v2/books
```

---

## Support

For API issues or questions:
- Email: support@library.com
- GitHub Issues: https://github.com/your-repo/issues
- Documentation: https://docs.library.com
