using LibraryManagement.API.DTOs.Books;
using LibraryManagement.API.DTOs.Common;
using LibraryManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibraryManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BooksController : ControllerBase
    {
        private readonly IBookService _bookService;
        private readonly ILogger<BooksController> _logger;

        public BooksController(IBookService bookService, ILogger<BooksController> logger)
        {
            _bookService = bookService;
            _logger = logger;
        }

        /// <summary>
        /// Get all books
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin,Librarian,Member")]
        [ProducesResponseType(typeof(IEnumerable<BookResponseDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll()
        {
            var books = await _bookService.GetAllBooksAsync();
            return Ok(books);
        }

        /// <summary>
        /// Get books with pagination and search
        /// </summary>
        [HttpGet("paged")]
        [Authorize(Roles = "Admin,Librarian,Member")]
        [ProducesResponseType(typeof(PaginatedResultDto<BookResponseDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPaged([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _bookService.GetPagedBooksAsync(search, page, pageSize);
            return Ok(result);
        }

        /// <summary>
        /// Get a book by ID
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Librarian,Member")]
        [ProducesResponseType(typeof(BookResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Get(int id)
        {
            var book = await _bookService.GetBookByIdAsync(id);
            if (book == null)
                return NotFound(new { error = "Book not found" });

            return Ok(book);
        }

        /// <summary>
        /// Create a new book
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin,Librarian")]
        [ProducesResponseType(typeof(BookResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] BookCreateDto model)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            var book = await _bookService.CreateBookAsync(model);
            return CreatedAtAction(nameof(Get), new { id = book.Id }, book);
        }

        /// <summary>
        /// Update an existing book
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Librarian")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(int id, [FromBody] BookUpdateDto model)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            try
            {
                await _bookService.UpdateBookAsync(id, model);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Delete a book
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _bookService.DeleteBookAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }
    }
}
