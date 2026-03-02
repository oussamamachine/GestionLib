using System.ComponentModel.DataAnnotations;

namespace LibraryManagement.API.DTOs.Auth
{
    // DTO for login
    public class LoginDto
    {
        [Required]
        public string Username { get; set; } = null!;

        [Required]
        public string Password { get; set; } = null!;
    }
}
