using System.ComponentModel.DataAnnotations;

namespace LibraryManagement.API.DTOs.Books
{
    // DTO used when creating a book
    public class BookCreateDto
    {
        [Required]
        [StringLength(200, MinimumLength = 1)]
        public string Title { get; set; } = null!;

        [StringLength(150)]
        public string? Author { get; set; }

        [StringLength(50)]
        public string? ISBN { get; set; }

        [Range(0, 1000)]
        public int CopiesAvailable { get; set; } = 1;
    }
}
