using LibraryManagement.API.Domain.Entities;
using LibraryManagement.API.DTOs.Books;
using LibraryManagement.API.DTOs.Common;
using LibraryManagement.API.Repositories;

namespace LibraryManagement.API.Services
{
    public class BookService : IBookService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<BookService> _logger;

        public BookService(IUnitOfWork unitOfWork, ILogger<BookService> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<IEnumerable<BookResponseDto>> GetAllBooksAsync()
        {
            var books = await _unitOfWork.Books.GetAllAsync();
            return books.Select(b => MapToDto(b));
        }

        public async Task<PaginatedResultDto<BookResponseDto>> GetPagedBooksAsync(string? searchTerm, int page, int pageSize)
        {
            var pagedResult = await _unitOfWork.Books.GetPagedAsync(
                b => string.IsNullOrEmpty(searchTerm) || 
                     b.Title.Contains(searchTerm) || 
                     (b.Author != null && b.Author.Contains(searchTerm)) || 
                     (b.ISBN != null && b.ISBN.Contains(searchTerm)),
                page,
                pageSize,
                query => query.OrderBy(b => b.Title));

            return new PaginatedResultDto<BookResponseDto>
            {
                Items = pagedResult.Items.Select(MapToDto),
                TotalCount = pagedResult.TotalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<BookResponseDto?> GetBookByIdAsync(int id)
        {
            var book = await _unitOfWork.Books.GetByIdAsync(id);
            return book == null ? null : MapToDto(book);
        }

        public async Task<BookResponseDto> CreateBookAsync(BookCreateDto dto)
        {
            var book = new Book
            {
                Title = dto.Title,
                Author = dto.Author,
                ISBN = dto.ISBN,
                CopiesAvailable = dto.CopiesAvailable
            };

            await _unitOfWork.Books.AddAsync(book);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Book created: {BookId} - {Title}", book.Id, book.Title);
            return MapToDto(book);
        }

        public async Task UpdateBookAsync(int id, BookUpdateDto dto)
        {
            var book = await _unitOfWork.Books.GetByIdAsync(id);
            if (book == null)
                throw new KeyNotFoundException($"Book with ID {id} not found");

            book.Title = dto.Title;
            book.Author = dto.Author;
            book.ISBN = dto.ISBN;
            book.CopiesAvailable = dto.CopiesAvailable;

            _unitOfWork.Books.Update(book);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Book updated: {BookId} - {Title}", book.Id, book.Title);
        }

        public async Task DeleteBookAsync(int id)
        {
            var book = await _unitOfWork.Books.GetByIdAsync(id);
            if (book == null)
                throw new KeyNotFoundException($"Book with ID {id} not found");

            _unitOfWork.Books.Remove(book);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Book deleted: {BookId}", id);
        }

        public async Task<bool> BookExistsAsync(int id)
        {
            return await _unitOfWork.Books.ExistsAsync(b => b.Id == id);
        }

        private static BookResponseDto MapToDto(Book book)
        {
            return new BookResponseDto
            {
                Id = book.Id,
                Title = book.Title,
                Author = book.Author,
                ISBN = book.ISBN,
                CopiesAvailable = book.CopiesAvailable
            };
        }
    }
}
