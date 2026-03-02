using LibraryManagement.API.DTOs.Books;
using LibraryManagement.API.DTOs.Common;

namespace LibraryManagement.API.Services
{
    public interface IBookService
    {
        Task<IEnumerable<BookResponseDto>> GetAllBooksAsync();
        Task<PaginatedResultDto<BookResponseDto>> GetPagedBooksAsync(string? searchTerm, int page, int pageSize);
        Task<BookResponseDto?> GetBookByIdAsync(int id);
        Task<BookResponseDto> CreateBookAsync(BookCreateDto dto);
        Task UpdateBookAsync(int id, BookUpdateDto dto);
        Task DeleteBookAsync(int id);
        Task<bool> BookExistsAsync(int id);
    }
}
