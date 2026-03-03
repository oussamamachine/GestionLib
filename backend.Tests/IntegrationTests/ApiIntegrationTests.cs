using FluentAssertions;
using LibraryManagement.API.Data;
using LibraryManagement.API.Domain.Entities;
using LibraryManagement.API.DTOs.Auth;
using LibraryManagement.API.DTOs.Books;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Xunit;

namespace LibraryManagement.Tests.IntegrationTests
{
    /// <summary>
    /// Integration tests for API endpoints
    /// Tests full request/response cycle with in-memory database
    /// </summary>
    public class ApiIntegrationTests : IClassFixture<WebApplicationFactory<Program>>, IDisposable
    {
        private readonly HttpClient _client;
        private readonly WebApplicationFactory<Program> _factory;
        private readonly IServiceScope _scope;
        private readonly ApplicationDbContext _context;

        public ApiIntegrationTests(WebApplicationFactory<Program> factory)
        {
            var dbName = "TestDatabase_" + Guid.NewGuid();
            _factory = factory.WithWebHostBuilder(builder =>
            {
                builder.UseEnvironment("Testing");
                builder.ConfigureServices(services =>
                {
                    // Remove existing DbContext
                    var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
                    if (descriptor != null)
                    {
                        services.Remove(descriptor);
                    }

                    // Add in-memory database with a fixed name so all contexts share the same store
                    services.AddDbContext<ApplicationDbContext>(options =>
                    {
                        options.UseInMemoryDatabase(dbName);
                    });
                });
            });

            _client = _factory.CreateClient();
            _scope = _factory.Services.CreateScope();
            _context = _scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // Seed test data
            SeedTestData();
        }

        private void SeedTestData()
        {
            // Add test users
            var adminUser = new User
            {
                Id = 1,
                Username = "admin",
                Email = "admin@test.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Role = Role.Admin
            };

            var memberUser = new User
            {
                Id = 2,
                Username = "member",
                Email = "member@test.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("member123"),
                Role = Role.Member
            };

            _context.Users.AddRange(adminUser, memberUser);

            // Add test books
            var book1 = new Book { Id = 1, Title = "Test Book 1", Author = "Author 1", ISBN = "ISBN001", CopiesAvailable = 5 };
            var book2 = new Book { Id = 2, Title = "Test Book 2", Author = "Author 2", ISBN = "ISBN002", CopiesAvailable = 3 };

            _context.Books.AddRange(book1, book2);
            _context.SaveChanges();
        }

        private async Task<string> GetAuthTokenAsync(string username, string password)
        {
            var loginDto = new LoginDto { Username = username, Password = password };
            var response = await _client.PostAsJsonAsync("/api/auth/login", loginDto);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<JwtResponse>();
            return result!.Token;
        }

        #region Auth Tests

        [Fact]
        public async Task Auth_Login_WithValidCredentials_ShouldReturnToken()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                Username = "admin",
                Password = "admin123"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/login", loginDto);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<JwtResponse>();
            result.Should().NotBeNull();
            result!.Token.Should().NotBeNullOrEmpty();
            result.Username.Should().Be("admin");
            result.Role.Should().Be("Admin");
        }

        [Fact]
        public async Task Auth_Login_WithInvalidCredentials_ShouldReturnUnauthorized()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                Username = "admin",
                Password = "wrongpassword"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/login", loginDto);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task Auth_Register_WithValidData_ShouldCreateUser()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                Username = "newuser",
                Email = "newuser@test.com",
                Password = "Password123!",
                Role = Role.Member
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/auth/register", registerDto);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<dynamic>();
            ((object?)result).Should().NotBeNull();
        }

        #endregion

        #region Books API Tests

        [Fact]
        public async Task Books_GetAll_WithAuthentication_ShouldReturnBooks()
        {
            // Arrange
            var token = await GetAuthTokenAsync("admin", "admin123");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.GetAsync("/api/books");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var books = await response.Content.ReadFromJsonAsync<List<BookResponseDto>>();
            books.Should().NotBeNull();
            books.Should().HaveCountGreaterThan(0);
        }

        [Fact]
        public async Task Books_GetAll_WithoutAuthentication_ShouldReturnUnauthorized()
        {
            // Act
            var response = await _client.GetAsync("/api/books");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task Books_Create_AsAdmin_ShouldCreateBook()
        {
            // Arrange
            var token = await GetAuthTokenAsync("admin", "admin123");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var createDto = new BookCreateDto
            {
                Title = "New Test Book",
                Author = "Test Author",
                ISBN = "ISBN999",
                CopiesAvailable = 10
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/books", createDto);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Created);
            var book = await response.Content.ReadFromJsonAsync<BookResponseDto>();
            book.Should().NotBeNull();
            book!.Title.Should().Be("New Test Book");
        }

        [Fact]
        public async Task Books_Create_AsMember_ShouldReturnForbidden()
        {
            // Arrange
            var token = await GetAuthTokenAsync("member", "member123");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var createDto = new BookCreateDto
            {
                Title = "New Test Book",
                Author = "Test Author",
                ISBN = "ISBN999",
                CopiesAvailable = 10
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/books", createDto);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        }

        [Fact]
        public async Task Books_GetById_WithValidId_ShouldReturnBook()
        {
            // Arrange
            var token = await GetAuthTokenAsync("admin", "admin123");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.GetAsync("/api/books/1");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var book = await response.Content.ReadFromJsonAsync<BookResponseDto>();
            book.Should().NotBeNull();
            book!.Id.Should().Be(1);
        }

        [Fact]
        public async Task Books_Update_AsAdmin_ShouldUpdateBook()
        {
            // Arrange
            var token = await GetAuthTokenAsync("admin", "admin123");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var updateDto = new BookUpdateDto
            {
                Title = "Updated Title",
                Author = "Updated Author",
                ISBN = "ISBN001",
                CopiesAvailable = 10
            };

            // Act
            var response = await _client.PutAsJsonAsync("/api/books/1", updateDto);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NoContent);

            // Verify update
            var getResponse = await _client.GetAsync("/api/books/1");
            var book = await getResponse.Content.ReadFromJsonAsync<BookResponseDto>();
            book!.Title.Should().Be("Updated Title");
        }

        [Fact]
        public async Task Books_Delete_AsAdmin_ShouldDeleteBook()
        {
            // Arrange
            var token = await GetAuthTokenAsync("admin", "admin123");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.DeleteAsync("/api/books/2");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NoContent);

            // Verify deletion
            var getResponse = await _client.GetAsync("/api/books/2");
            getResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        #endregion

        #region Users API Tests

        [Fact]
        public async Task Users_GetAll_AsAdmin_ShouldReturnUsers()
        {
            // Arrange
            var token = await GetAuthTokenAsync("admin", "admin123");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.GetAsync("/api/users");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var users = await response.Content.ReadFromJsonAsync<List<dynamic>>();
            users.Should().NotBeNull();
            users.Should().HaveCountGreaterThan(0);
        }

        [Fact]
        public async Task Users_GetAll_AsMember_ShouldReturnForbidden()
        {
            // Arrange
            var token = await GetAuthTokenAsync("member", "member123");
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            // Act
            var response = await _client.GetAsync("/api/users");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        }

        #endregion

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _scope.Dispose();
            _client.Dispose();
        }
    }
}
