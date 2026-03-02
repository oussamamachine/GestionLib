using System.ComponentModel.DataAnnotations;

namespace LibraryManagement.API.Domain.Entities
{
    public class Book
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = null!;

        [MaxLength(150)]
        public string? Author { get; set; }

        [MaxLength(50)]
        public string? ISBN { get; set; }

        // Number of copies available for loan
        public int CopiesAvailable { get; set; } = 1;

        // Navigation
        public List<Loan>? Loans { get; set; }
    }
}
