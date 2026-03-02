using LibraryManagement.API.Domain.Entities;
using LibraryManagement.API.DTOs.Auth;

namespace LibraryManagement.API.Services
{
    public interface IUserService
    {
        Task<User?> GetUserByIdAsync(int id);
        Task<User?> GetUserByUsernameAsync(string username);
        Task<User> RegisterUserAsync(RegisterDto dto, bool isAdminCreating = false);
        Task<(string Token, DateTime ExpiresAt)> AuthenticateAsync(LoginDto dto);
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task DeleteUserAsync(int id);
        Task UpdateUserRoleAsync(int userId, string newRole);
    }
}
