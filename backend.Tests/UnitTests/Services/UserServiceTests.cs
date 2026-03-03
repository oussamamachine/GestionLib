using FluentAssertions;
using LibraryManagement.API.Domain.Entities;
using LibraryManagement.API.DTOs.Auth;
using LibraryManagement.API.Repositories;
using LibraryManagement.API.Services;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace LibraryManagement.Tests.UnitTests.Services
{
    /// <summary>
    /// Unit tests for UserService
    /// Tests authentication, authorization, and user management
    /// </summary>
    public class UserServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUnitOfWork;
        private readonly Mock<IRepository<User>> _mockUserRepository;
        private readonly Mock<IJwtService> _mockJwtService;
        private readonly Mock<ILogger<UserService>> _mockLogger;
        private readonly UserService _userService;

        public UserServiceTests()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockUserRepository = new Mock<IRepository<User>>();
            _mockJwtService = new Mock<IJwtService>();
            _mockLogger = new Mock<ILogger<UserService>>();

            _mockUnitOfWork.Setup(u => u.Users).Returns(_mockUserRepository.Object);

            _userService = new UserService(
                _mockUnitOfWork.Object,
                _mockJwtService.Object,
                _mockLogger.Object);
        }

        #region RegisterUserAsync Tests

        [Fact]
        public async Task RegisterUserAsync_WithValidData_ShouldCreateUser()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                Username = "newuser",
                Email = "newuser@test.com",
                Password = "password123",
                Role = Role.Member
            };

            _mockUserRepository.Setup(r => r.ExistsAsync(It.IsAny<System.Linq.Expressions.Expression<Func<User, bool>>>()))
                .ReturnsAsync(false);
            _mockUnitOfWork.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

            // Act
            var result = await _userService.RegisterUserAsync(registerDto);

            // Assert
            result.Should().NotBeNull();
            result.Username.Should().Be("newuser");
            result.Email.Should().Be("newuser@test.com");
            result.Role.Should().Be(Role.Member);
            _mockUserRepository.Verify(r => r.AddAsync(It.IsAny<User>()), Times.Once);
        }

        [Fact]
        public async Task RegisterUserAsync_WithExistingUsername_ShouldThrowException()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                Username = "existinguser",
                Email = "test@test.com",
                Password = "password123",
                Role = Role.Member
            };

            _mockUserRepository.Setup(r => r.ExistsAsync(It.IsAny<System.Linq.Expressions.Expression<Func<User, bool>>>()))
                .ReturnsAsync(true);

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                _userService.RegisterUserAsync(registerDto));
        }

        [Fact]
        public async Task RegisterUserAsync_NonMemberRoleWithoutAdminPrivilege_ShouldThrowException()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                Username = "newadmin",
                Email = "admin@test.com",
                Password = "password123",
                Role = Role.Admin
            };

            _mockUserRepository.Setup(r => r.ExistsAsync(It.IsAny<System.Linq.Expressions.Expression<Func<User, bool>>>()))
                .ReturnsAsync(false);

            // Act & Assert
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                _userService.RegisterUserAsync(registerDto, isAdminCreating: false));
        }

        [Fact]
        public async Task RegisterUserAsync_ShouldHashPassword()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                Username = "testuser",
                Email = "test@test.com",
                Password = "plainpassword",
                Role = Role.Member
            };

            User? capturedUser = null;
            _mockUserRepository.Setup(r => r.ExistsAsync(It.IsAny<System.Linq.Expressions.Expression<Func<User, bool>>>()))
                .ReturnsAsync(false);
            _mockUserRepository.Setup(r => r.AddAsync(It.IsAny<User>()))
                .Callback<User>(u => capturedUser = u);
            _mockUnitOfWork.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

            // Act
            await _userService.RegisterUserAsync(registerDto);

            // Assert
            capturedUser.Should().NotBeNull();
            capturedUser!.PasswordHash.Should().NotBe("plainpassword");
            BCrypt.Net.BCrypt.Verify("plainpassword", capturedUser.PasswordHash).Should().BeTrue();
        }

        #endregion

        #region AuthenticateAsync Tests

        [Fact]
        public async Task AuthenticateAsync_WithValidCredentials_ShouldReturnToken()
        {
            // Arrange
            var user = new User
            {
                Id = 1,
                Username = "testuser",
                Email = "test@test.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                Role = Role.Member
            };

            var loginDto = new LoginDto
            {
                Username = "testuser",
                Password = "password123"
            };

            _mockUserRepository.Setup(r => r.FirstOrDefaultAsync(It.IsAny<System.Linq.Expressions.Expression<Func<User, bool>>>()))
                .ReturnsAsync(user);

            var tokenResult = new JwtTokenResult
            {
                Token = "test-jwt-token",
                ExpiresAt = DateTime.UtcNow.AddHours(1)
            };
            _mockJwtService.Setup(j => j.GenerateToken(user)).Returns(tokenResult);

            // Act
            var (token, expiresAt) = await _userService.AuthenticateAsync(loginDto);

            // Assert
            token.Should().Be("test-jwt-token");
            expiresAt.Should().BeCloseTo(DateTime.UtcNow.AddHours(1), TimeSpan.FromSeconds(5));
            _mockJwtService.Verify(j => j.GenerateToken(user), Times.Once);
        }

        [Fact]
        public async Task AuthenticateAsync_WithInvalidUsername_ShouldThrowException()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                Username = "nonexistent",
                Password = "password123"
            };

            _mockUserRepository.Setup(r => r.FirstOrDefaultAsync(It.IsAny<System.Linq.Expressions.Expression<Func<User, bool>>>()))
                .ReturnsAsync((User?)null);

            // Act & Assert
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                _userService.AuthenticateAsync(loginDto));
        }

        [Fact]
        public async Task AuthenticateAsync_WithInvalidPassword_ShouldThrowException()
        {
            // Arrange
            var user = new User
            {
                Id = 1,
                Username = "testuser",
                Email = "test@test.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("correctpassword"),
                Role = Role.Member
            };

            var loginDto = new LoginDto
            {
                Username = "testuser",
                Password = "wrongpassword"
            };

            _mockUserRepository.Setup(r => r.FirstOrDefaultAsync(It.IsAny<System.Linq.Expressions.Expression<Func<User, bool>>>()))
                .ReturnsAsync(user);

            // Act & Assert
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                _userService.AuthenticateAsync(loginDto));
        }

        #endregion

        #region GetUserByIdAsync Tests

        [Fact]
        public async Task GetUserByIdAsync_WithValidId_ShouldReturnUser()
        {
            // Arrange
            var user = new User
            {
                Id = 1,
                Username = "testuser",
                Email = "test@test.com",
                PasswordHash = "hash",
                Role = Role.Member
            };

            _mockUserRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(user);

            // Act
            var result = await _userService.GetUserByIdAsync(1);

            // Assert
            result.Should().NotBeNull();
            result!.Username.Should().Be("testuser");
        }

        [Fact]
        public async Task GetUserByIdAsync_WithInvalidId_ShouldReturnNull()
        {
            // Arrange
            _mockUserRepository.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((User?)null);

            // Act
            var result = await _userService.GetUserByIdAsync(999);

            // Assert
            result.Should().BeNull();
        }

        #endregion

        #region DeleteUserAsync Tests

        [Fact]
        public async Task DeleteUserAsync_WithValidId_ShouldDeleteUser()
        {
            // Arrange
            var user = new User
            {
                Id = 1,
                Username = "testuser",
                Email = "test@test.com",
                PasswordHash = "hash",
                Role = Role.Member
            };

            _mockUserRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(user);
            _mockUnitOfWork.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

            // Act
            await _userService.DeleteUserAsync(1);

            // Assert
            _mockUserRepository.Verify(r => r.Remove(user), Times.Once);
            _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task DeleteUserAsync_WithInvalidId_ShouldThrowException()
        {
            // Arrange
            _mockUserRepository.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((User?)null);

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                _userService.DeleteUserAsync(999));
        }

        #endregion
    }
}
