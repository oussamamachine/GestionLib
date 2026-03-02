using BCrypt.Net;
using LibraryManagement.API.Domain.Entities;
using LibraryManagement.API.DTOs.Auth;
using LibraryManagement.API.Repositories;

namespace LibraryManagement.API.Services
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly JwtService _jwtService;
        private readonly ILogger<UserService> _logger;

        public UserService(IUnitOfWork unitOfWork, JwtService jwtService, ILogger<UserService> logger)
        {
            _unitOfWork = unitOfWork;
            _jwtService = jwtService;
            _logger = logger;
        }

        public async Task<User?> GetUserByIdAsync(int id)
        {
            return await _unitOfWork.Users.GetByIdAsync(id);
        }

        public async Task<User?> GetUserByUsernameAsync(string username)
        {
            return await _unitOfWork.Users.FirstOrDefaultAsync(u => u.Username == username);
        }

        public async Task<User> RegisterUserAsync(RegisterDto dto, bool isAdminCreating = false)
        {
            // Check if username already exists
            if (await _unitOfWork.Users.ExistsAsync(u => u.Username == dto.Username))
                throw new InvalidOperationException("Username already exists");

            // Validate role (only admins can create elevated roles)
            if (!isAdminCreating && dto.Role != Role.Member)
                throw new UnauthorizedAccessException("Only administrators can create users with elevated roles");

            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = dto.Role
            };

            await _unitOfWork.Users.AddAsync(user);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("User registered: {UserId} - {Username} ({Role})", user.Id, user.Username, user.Role);

            return user;
        }

        public async Task<(string Token, DateTime ExpiresAt)> AuthenticateAsync(LoginDto dto)
        {
            var user = await GetUserByUsernameAsync(dto.Username);
            if (user == null)
                throw new UnauthorizedAccessException("Invalid credentials");

            // Check if account is locked
            if (user.LockoutEndTime.HasValue && user.LockoutEndTime.Value > DateTime.UtcNow)
            {
                var remainingMinutes = (int)(user.LockoutEndTime.Value - DateTime.UtcNow).TotalMinutes + 1;
                _logger.LogWarning("Login attempt for locked account: {Username}. Locked until {LockoutEnd}", 
                    user.Username, user.LockoutEndTime.Value);
                throw new UnauthorizedAccessException($"Account is locked. Try again in {remainingMinutes} minute(s).");
            }

            // Reset lockout if lockout period has expired
            if (user.LockoutEndTime.HasValue && user.LockoutEndTime.Value <= DateTime.UtcNow)
            {
                user.FailedLoginAttempts = 0;
                user.LockoutEndTime = null;
                _unitOfWork.Users.Update(user);
                await _unitOfWork.SaveChangesAsync();
            }

            // Verify password
            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            {
                // Increment failed login attempts
                user.FailedLoginAttempts++;
                
                // Lock account after 5 failed attempts
                const int maxFailedAttempts = 5;
                const int lockoutMinutes = 15;
                
                if (user.FailedLoginAttempts >= maxFailedAttempts)
                {
                    user.LockoutEndTime = DateTime.UtcNow.AddMinutes(lockoutMinutes);
                    _logger.LogWarning("Account locked due to {FailedAttempts} failed login attempts: {Username}", 
                        maxFailedAttempts, user.Username);
                }
                
                _unitOfWork.Users.Update(user);
                await _unitOfWork.SaveChangesAsync();
                
                _logger.LogWarning("Failed login attempt {Attempt}/{MaxAttempts} for user {Username}", 
                    user.FailedLoginAttempts, maxFailedAttempts, user.Username);
                
                throw new UnauthorizedAccessException("Invalid credentials");
            }

            // Successful login - reset failed attempts
            if (user.FailedLoginAttempts > 0)
            {
                user.FailedLoginAttempts = 0;
                user.LockoutEndTime = null;
                _unitOfWork.Users.Update(user);
                await _unitOfWork.SaveChangesAsync();
            }

            var result = _jwtService.GenerateToken(user);
            _logger.LogInformation("User authenticated: {UserId} - {Username}", user.Id, user.Username);

            return (result.Token, result.ExpiresAt);
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _unitOfWork.Users.GetAllAsync();
        }

        public async Task DeleteUserAsync(int id)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id);
            if (user == null)
                throw new KeyNotFoundException($"User with ID {id} not found");

            _unitOfWork.Users.Remove(user);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("User deleted: {UserId}", id);
        }

        public async Task UpdateUserRoleAsync(int userId, string newRole)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null)
                throw new KeyNotFoundException($"User with ID {userId} not found");

            if (!Enum.TryParse<Role>(newRole, out var role))
                throw new ArgumentException($"Invalid role: {newRole}");

            user.Role = role;
            _unitOfWork.Users.Update(user);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Updated role for user {UserId} to {Role}", userId, role);
        }
    }
}
