using LibraryManagement.API.DTOs.Auth;
using LibraryManagement.API.Services;
using LibraryManagement.API.Middleware;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibraryManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly TokenService _tokenService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IUserService userService, TokenService tokenService, ILogger<AuthController> logger)
        {
            _userService = userService;
            _tokenService = tokenService;
            _logger = logger;
        }

        /// <summary>
        /// Register a new user (Members can self-register, Admins can create any role)
        /// </summary>
        [HttpPost("register")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            try
            {
                var isAdminCreating = User.Identity?.IsAuthenticated == true && User.IsInRole("Admin");
                var user = await _userService.RegisterUserAsync(model, isAdminCreating);

                return Ok(new
                {
                    user.Id,
                    user.Username,
                    user.Email,
                    Role = user.Role.ToString()
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { error = ex.Message });
            }
        }

        /// <summary>
        /// Login and receive JWT token in HttpOnly cookie
        /// </summary>
        [HttpPost("login")]
        [RateLimit(maxRequests: 5, timeWindowSeconds: 60)]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            try
            {
                var (token, expiresAt) = await _userService.AuthenticateAsync(model);
                var user = await _userService.GetUserByUsernameAsync(model.Username);

                // Generate refresh token
                var refreshToken = _tokenService.GenerateRefreshToken();
                _tokenService.StoreRefreshToken(refreshToken, user!.Id);

                // Set JWT in HttpOnly cookie (secure, can't be accessed by JavaScript)
                var isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";
                var cookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = false, // False for HTTP development
                    SameSite = SameSiteMode.Lax, // Lax works with HTTP
                    Expires = expiresAt,
                    Path = "/"
                };
                Response.Cookies.Append("jwt", token, cookieOptions);

                _logger.LogInformation("JWT cookie set. Expires: {ExpiresAt}", expiresAt);

                // Set refresh token in HttpOnly cookie
                var refreshCookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = false,
                    SameSite = SameSiteMode.Lax,
                    Expires = DateTimeOffset.UtcNow.AddDays(7),
                    Path = "/"
                };
                Response.Cookies.Append("refreshToken", refreshToken, refreshCookieOptions);

                // Return user info with token
                var response = new
                {
                    token = token,
                    username = user!.Username,
                    email = user.Email,
                    role = user.Role.ToString(),
                    expiresAt = expiresAt
                };

                _logger.LogInformation("User {Username} logged in successfully", user.Username);
                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("Failed login attempt for {Username}", model.Username);
                return Unauthorized(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Logout and clear authentication cookies
        /// </summary>
        [HttpPost("logout")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public IActionResult Logout()
        {
            // Clear HttpOnly cookies
            Response.Cookies.Delete("jwt");
            Response.Cookies.Delete("refreshToken");
            
            _logger.LogInformation("User logged out successfully");
            return Ok(new { message = "Logged out successfully" });
        }

        /// <summary>
        /// Get current user info (requires authentication)
        /// </summary>
        [HttpGet("me")]
        [Authorize]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetCurrentUser()
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
                return Unauthorized();

            var user = await _userService.GetUserByUsernameAsync(username);
            if (user == null)
                return NotFound(new { error = "User not found" });

            return Ok(new
            {
                user.Id,
                user.Username,
                user.Email,
                Role = user.Role.ToString()
            });
        }
    }
}
