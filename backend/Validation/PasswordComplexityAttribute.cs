using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace LibraryManagement.API.Validation
{
    /// <summary>
    /// Validates password complexity requirements
    /// Password must contain at least:
    /// - 8 characters
    /// - 1 uppercase letter
    /// - 1 lowercase letter  
    /// - 1 number
    /// - 1 special character
    /// </summary>
    public class PasswordComplexityAttribute : ValidationAttribute
    {
        private const int MinLength = 8;
        
        public PasswordComplexityAttribute()
        {
            ErrorMessage = "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character.";
        }

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value == null)
                return new ValidationResult("Password is required.");

            var password = value.ToString();
            
            if (string.IsNullOrWhiteSpace(password))
                return new ValidationResult("Password cannot be empty.");

            var errors = new List<string>();

            if (password.Length < MinLength)
                errors.Add($"at least {MinLength} characters");

            if (!Regex.IsMatch(password, @"[A-Z]"))
                errors.Add("at least one uppercase letter");

            if (!Regex.IsMatch(password, @"[a-z]"))
                errors.Add("at least one lowercase letter");

            if (!Regex.IsMatch(password, @"[0-9]"))
                errors.Add("at least one number");

            if (!Regex.IsMatch(password, @"[\W_]"))
                errors.Add("at least one special character");

            if (errors.Any())
            {
                return new ValidationResult($"Password must contain {string.Join(", ", errors)}.");
            }

            return ValidationResult.Success;
        }
    }
}
