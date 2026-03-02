using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using LibraryManagement.API.Services;
using LibraryManagement.API.DTOs.Auth;
using LibraryManagement.API.Middleware;

namespace LibraryManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RefreshTokenController : ControllerBase
    {
        private readonly TokenService _tokenService;
        private readonly IUserService _userService;
        private readonly ILogger<RefreshTokenController> _logger;

        public RefreshTokenController(
            TokenService tokenService,
            IUserService userService,
            ILogger<RefreshTokenController> logger)
        {
            _tokenService = tokenService;
            _userService = userService;
            _logger = logger;
        }

        [HttpPost("refresh")]
        [RateLimit(maxRequests: 10, timeWindowSeconds: 60)]
        public async Task<ActionResult<JwtResponse>> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            try
            {
                var userId = _tokenService.GetUserIdFromRefreshToken(request.RefreshToken);
                if (userId == null)
                {
                    return Unauthorized(new { message = "Invalid or expired refresh token" });
                }

                var user = await _userService.GetUserByIdAsync(userId.Value);
                if (user == null)
                {
                    return Unauthorized(new { message = "User not found" });
                }

                // Revoke old refresh token
                _tokenService.RevokeRefreshToken(request.RefreshToken);

                // Generate new tokens
                var newAccessToken = _tokenService.GenerateAccessToken(user);
                var newRefreshToken = _tokenService.GenerateRefreshToken();
                
                _tokenService.StoreRefreshToken(newRefreshToken, user.Id);

                _logger.LogInformation("Tokens refreshed for user {UserId}", user.Id);

                return Ok(new JwtResponse
                {
                    Token = newAccessToken.Token,
                    RefreshToken = newRefreshToken,
                    ExpiresAt = newAccessToken.ExpiresAt,
                    Username = user.Username,
                    Email = user.Email,
                    Role = user.Role.ToString()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing tokens");
                return StatusCode(500, new { message = "An error occurred while refreshing tokens" });
            }
        }

        [HttpPost("revoke")]
        [Authorize]
        public IActionResult RevokeToken([FromBody] RefreshTokenRequest request)
        {
            _tokenService.RevokeRefreshToken(request.RefreshToken);
            _logger.LogInformation("Refresh token revoked");
            return Ok(new { message = "Token revoked successfully" });
        }
    }

    public class RefreshTokenRequest
    {
        public string RefreshToken { get; set; } = string.Empty;
    }
}
