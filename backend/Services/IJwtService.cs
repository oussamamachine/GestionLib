using LibraryManagement.API.Domain.Entities;

namespace LibraryManagement.API.Services
{
    public interface IJwtService
    {
        JwtTokenResult GenerateToken(User user);
    }
}
