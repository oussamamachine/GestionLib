namespace LibraryManagement.API.DTOs.Auth
{
    // DTO returned after successful authentication
    public class JwtResponse
    {
        public string Token { get; set; } = null!;
        public string? RefreshToken { get; set; }
        public DateTime ExpiresAt { get; set; }
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Role { get; set; } = null!;
    }
}
