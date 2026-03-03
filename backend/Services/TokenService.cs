using LibraryManagement.API.Domain.Entities;

namespace LibraryManagement.API.Services
{
    public interface ITokenService
    {
        JwtTokenResult GenerateAccessToken(User user);
        string GenerateRefreshToken();
        bool ValidateRefreshToken(string refreshToken);
    }

    public class TokenService : ITokenService
    {
        private readonly IJwtService _jwtService;
        private readonly ILogger<TokenService> _logger;
        private static readonly Dictionary<string, (int UserId, DateTime ExpiresAt)> _refreshTokens = new();
        private static readonly object _lock = new object();

        public TokenService(IJwtService jwtService, ILogger<TokenService> logger)
        {
            _jwtService = jwtService;
            _logger = logger;
        }

        public JwtTokenResult GenerateAccessToken(User user)
        {
            return _jwtService.GenerateToken(user);
        }

        public string GenerateRefreshToken()
        {
            var refreshToken = Convert.ToBase64String(Guid.NewGuid().ToByteArray());
            return refreshToken;
        }

        public bool ValidateRefreshToken(string refreshToken)
        {
            lock (_lock)
            {
                if (_refreshTokens.TryGetValue(refreshToken, out var tokenData))
                {
                    if (tokenData.ExpiresAt > DateTime.UtcNow)
                    {
                        return true;
                    }
                    else
                    {
                        _refreshTokens.Remove(refreshToken);
                        _logger.LogWarning("Expired refresh token removed: {Token}", refreshToken);
                    }
                }
            }
            return false;
        }

        public void StoreRefreshToken(string refreshToken, int userId, int daysValid = 30)
        {
            lock (_lock)
            {
                _refreshTokens[refreshToken] = (userId, DateTime.UtcNow.AddDays(daysValid));
            }
        }

        public void RevokeRefreshToken(string refreshToken)
        {
            lock (_lock)
            {
                _refreshTokens.Remove(refreshToken);
            }
        }

        public int? GetUserIdFromRefreshToken(string refreshToken)
        {
            lock (_lock)
            {
                if (_refreshTokens.TryGetValue(refreshToken, out var tokenData) && tokenData.ExpiresAt > DateTime.UtcNow)
                {
                    return tokenData.UserId;
                }
            }
            return null;
        }
    }
}
