# Backend Testing Guide

## Overview
This test suite provides comprehensive coverage for the Library Management System backend, including unit tests and integration tests.

## Test Structure

```
backend.Tests/
├── UnitTests/
│   └── Services/
│       ├── BookServiceTests.cs       # 11 tests
│       ├── UserServiceTests.cs       # 10 tests
│       └── LoanServiceTests.cs       # 8 tests
├── IntegrationTests/
│   └── ApiIntegrationTests.cs        # 13 tests
└── LibraryManagement.Tests.csproj
```

## Running Tests

### Run All Tests
```bash
cd backend.Tests
dotnet test
```

### Run with Detailed Output
```bash
dotnet test --verbosity normal
```

### Run Specific Test Class
```bash
dotnet test --filter "FullyQualifiedName~BookServiceTests"
```

### Generate Code Coverage
```bash
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=opencover
```

## Test Categories

### Unit Tests (29 tests total)

#### BookServiceTests (11 tests)
- ✅ GetAllBooksAsync - Returns all books
- ✅ GetAllBooksAsync - Returns empty list when no books
- ✅ GetBookByIdAsync - Returns book with valid ID
- ✅ GetBookByIdAsync - Returns null with invalid ID
- ✅ CreateBookAsync - Creates book with valid data
- ✅ CreateBookAsync - Logs book creation
- ✅ UpdateBookAsync - Updates book with valid data
- ✅ UpdateBookAsync - Throws exception with invalid ID
- ✅ DeleteBookAsync - Deletes book with valid ID
- ✅ DeleteBookAsync - Throws exception with invalid ID
- ✅ BookExistsAsync - Returns correct existence status

#### UserServiceTests (10 tests)
- ✅ RegisterUserAsync - Creates user with valid data
- ✅ RegisterUserAsync - Throws exception for existing username
- ✅ RegisterUserAsync - Throws exception for non-member role without admin privilege
- ✅ RegisterUserAsync - Hashes password correctly
- ✅ AuthenticateAsync - Returns token with valid credentials
- ✅ AuthenticateAsync - Throws exception with invalid username
- ✅ AuthenticateAsync - Throws exception with invalid password
- ✅ GetUserByIdAsync - Returns user with valid ID
- ✅ GetUserByIdAsync - Returns null with invalid ID
- ✅ DeleteUserAsync - Deletes user successfully

#### LoanServiceTests (8 tests)
- ✅ CreateLoanAsync - Creates loan with valid data
- ✅ CreateLoanAsync - Throws exception with invalid user
- ✅ CreateLoanAsync - Throws exception with invalid book
- ✅ CreateLoanAsync - Throws exception when no copies available
- ✅ ReturnLoanAsync - Marks loan as returned
- ✅ ReturnLoanAsync - Throws exception with invalid loan ID
- ✅ ReturnLoanAsync - Throws exception when already returned
- ✅ GetUserLoansAsync - Returns user's loans

### Integration Tests (13 tests)

#### Auth Integration Tests
- ✅ Login with valid credentials returns token
- ✅ Login with invalid credentials returns unauthorized
- ✅ Register with valid data creates user

#### Books API Integration Tests
- ✅ GetAll with authentication returns books
- ✅ GetAll without authentication returns unauthorized
- ✅ Create as Admin creates book
- ✅ Create as Member returns forbidden
- ✅ GetById with valid ID returns book
- ✅ Update as Admin updates book
- ✅ Delete as Admin deletes book

#### Users API Integration Tests
- ✅ GetAll as Admin returns users
- ✅ GetAll as Member returns forbidden

## Testing Patterns

### AAA Pattern (Arrange-Act-Assert)
All tests follow the AAA pattern for clarity:

```csharp
[Fact]
public async Task MethodName_Scenario_ExpectedBehavior()
{
    // Arrange - Setup test data and mocks
    var dto = new CreateDto { ... };
    _mockRepository.Setup(...);

    // Act - Execute the method being tested
    var result = await _service.MethodAsync(dto);

    // Assert - Verify the outcome
    result.Should().NotBeNull();
    result.Property.Should().Be(expectedValue);
}
```

### Mocking with Moq
```csharp
// Setup mock to return specific value
_mockRepository.Setup(r => r.GetByIdAsync(1))
    .ReturnsAsync(testEntity);

// Verify method was called
_mockRepository.Verify(r => r.AddAsync(It.IsAny<Entity>()), Times.Once);
```

### Fluent Assertions
```csharp
// Better readability compared to Assert
result.Should().NotBeNull();
result.Should().HaveCount(2);
result.Should().Contain(x => x.Property == value);
exception.Message.Should().Contain("expected text");
```

## Best Practices Implemented

### ✅ Test Isolation
- Each test is independent
- In-memory database for integration tests
- Proper cleanup with IDisposable

### ✅ Comprehensive Coverage
- Happy path scenarios
- Error cases and exceptions
- Edge cases (empty lists, null values)
- Authorization scenarios

### ✅ Clear Test Names
- Format: `MethodName_Scenario_ExpectedBehavior`
- Example: `GetBookByIdAsync_WithInvalidId_ShouldReturnNull`

### ✅ Mock Verification
- Verify repository methods are called correctly
- Verify logging occurs
- Verify state changes

### ✅ Async/Await Support
- All async tests properly use await
- No blocking calls

## Common Test Scenarios

### Testing Service Layer
```csharp
// 1. Successful operation
// 2. Entity not found
// 3. Validation failure
// 4. Business rule violation
// 5. Logging verification
```

### Testing API Endpoints
```csharp
// 1. Successful request with valid authentication
// 2. Unauthorized (no token)
// 3. Forbidden (wrong role)
// 4. Not found (invalid ID)
// 5. Validation errors
```

## Running Specific Tests

### By Category
```bash
# Unit tests only
dotnet test --filter "FullyQualifiedName~UnitTests"

# Integration tests only
dotnet test --filter "FullyQualifiedName~IntegrationTests"
```

### By Class
```bash
dotnet test --filter "FullyQualifiedName~BookServiceTests"
```

### By Test Name
```bash
dotnet test --filter "Name~CreateBookAsync"
```

## Code Coverage

Current coverage areas:
- ✅ Service layer business logic
- ✅ Repository pattern usage
- ✅ API endpoints
- ✅ Authentication and authorization
- ✅ Error handling
- ✅ Logging

## CI/CD Integration

Tests are designed to run in CI/CD pipelines:

```yaml
- name: Run Tests
  run: dotnet test --no-build --verbosity normal
```

## Troubleshooting

### Tests Fail with Database Error
- Ensure in-memory database is properly configured
- Check that tests properly dispose of context

### Mock Not Working
- Verify Setup() is called before the test
- Ensure interface is being mocked, not concrete class
- Check that method signature matches exactly

### Integration Tests Fail
- Verify WebApplicationFactory setup
- Check that test data is properly seeded
- Ensure JWT token is correctly formatted

## Next Steps

Consider adding:
- [ ] Performance tests
- [ ] Load tests
- [ ] End-to-end tests with Selenium
- [ ] Mutation testing
- [ ] Contract testing

## Resources

- [xUnit Documentation](https://xunit.net/)
- [Moq Documentation](https://github.com/moq/moq4)
- [FluentAssertions Documentation](https://fluentassertions.com/)
- [ASP.NET Core Testing](https://docs.microsoft.com/en-us/aspnet/core/test/)
