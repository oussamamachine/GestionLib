using System.ComponentModel.DataAnnotations;

namespace LibraryManagement.API.DTOs.Loans
{
    // DTO used to request creation of a loan
    public class LoanCreateDto
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        public int BookId { get; set; }
    }
}
