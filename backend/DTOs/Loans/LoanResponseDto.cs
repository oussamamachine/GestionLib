namespace LibraryManagement.API.DTOs.Loans
{
    // DTO returned to clients representing a loan
    public class LoanResponseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int BookId { get; set; }
        public DateTime LoanDate { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime? ReturnDate { get; set; }
        public string? Username { get; set; }
        public string? BookTitle { get; set; }
    }
}
