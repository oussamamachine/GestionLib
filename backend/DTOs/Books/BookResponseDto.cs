namespace LibraryManagement.API.DTOs.Books
{
    // DTO returned to clients representing a book
    public class BookResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string? Author { get; set; }
        public string? ISBN { get; set; }
        public int CopiesAvailable { get; set; }
    }
}
