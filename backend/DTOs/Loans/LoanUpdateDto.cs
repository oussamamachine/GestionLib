using System.ComponentModel.DataAnnotations;

namespace LibraryManagement.API.DTOs.Loans
{
    // DTO used to update loan fields (e.g., due date)
    public class LoanUpdateDto
    {
        [Required]
        public DateTime DueDate { get; set; }
    }
}
