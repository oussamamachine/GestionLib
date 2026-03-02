using System.ComponentModel.DataAnnotations;
using LibraryManagement.API.Domain.Entities;
using LibraryManagement.API.Validation;

namespace LibraryManagement.API.DTOs.Auth
{
    // DTO for user registration with validation attributes
    public class RegisterDto
    {
        [Required]
        [StringLength(100, MinimumLength = 3)]
        public string Username { get; set; } = null!;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        [StringLength(100, MinimumLength = 8, ErrorMessage = "Password must be at least 8 characters long.")]
        [PasswordComplexity]
        public string Password { get; set; } = null!;

        // Requesting role; will be restricted for non-admin callers
        [Required]
        public Role Role { get; set; } = Role.Member;
    }
}
