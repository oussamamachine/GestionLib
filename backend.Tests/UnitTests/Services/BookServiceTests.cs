using FluentAssertions;
using LibraryManagement.API.Domain.Entities;
using LibraryManagement.API.DTOs.Books;
using LibraryManagement.API.Repositories;
using LibraryManagement.API.Services;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace LibraryManagement.Tests.UnitTests.Services
{
    /// <summary>
    /// Unit tests for BookService
    /// Following AAA pattern: Arrange, Act, Assert
    /// </summary>
    public class BookServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUnitOfWork;
        private readonly Mock<IRepository<Book>> _mockBookRepository;
        private readonly Mock<ILogger<BookService>> _mockLogger;
        private readonly BookService _bookService;

        public BookServiceTests()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockBookRepository = new Mock<IRepository<Book>>();
            _mockLogger = new Mock<ILogger<BookService>>();

            // Setup UnitOfWork to return mocked repository
            _mockUnitOfWork.Setup(u => u.Books).Returns(_mockBookRepository.Object);

            _bookService = new BookService(_mockUnitOfWork.Object, _mockLogger.Object);
        }

        #region GetAllBooksAsync Tests

        [Fact]
        public async Task GetAllBooksAsync_ShouldReturnAllBooks()
        {
            // Arrange
            var books = new List<Book>
            {
                new Book { Id = 1, Title = "Book 1", Author = "Author 1", ISBN = "ISBN1", CopiesAvailable = 5 },
                new Book { Id = 2, Title = "Book 2", Author = "Author 2", ISBN = "ISBN2", CopiesAvailable = 3 }
            };
            _mockBookRepository.Setup(r => r.GetAllAsync()).ReturnsAsync(books);

            // Act
            var result = await _bookService.GetAllBooksAsync();

            // Assert
            result.Should().HaveCount(2);
            result.Should().Contain(b => b.Title == "Book 1");
            result.Should().Contain(b => b.Title == "Book 2");
            _mockBookRepository.Verify(r => r.GetAllAsync(), Times.Once);
        }

        [Fact]
        public async Task GetAllBooksAsync_WhenNoBooks_ShouldReturnEmptyList()
        {
            // Arrange
            _mockBookRepository.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Book>());

            // Act
            var result = await _bookService.GetAllBooksAsync();

            // Assert
            result.Should().BeEmpty();
        }

        #endregion

        #region GetBookByIdAsync Tests

        [Fact]
        public async Task GetBookByIdAsync_WithValidId_ShouldReturnBook()
        {
            // Arrange
            var book = new Book { Id = 1, Title = "Test Book", Author = "Test Author", ISBN = "ISBN123", CopiesAvailable = 5 };
            _mockBookRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(book);

            // Act
            var result = await _bookService.GetBookByIdAsync(1);

            // Assert
            result.Should().NotBeNull();
            result!.Title.Should().Be("Test Book");
            result.Author.Should().Be("Test Author");
        }

        [Fact]
        public async Task GetBookByIdAsync_WithInvalidId_ShouldReturnNull()
        {
            // Arrange
            _mockBookRepository.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Book?)null);

            // Act
            var result = await _bookService.GetBookByIdAsync(999);

            // Assert
            result.Should().BeNull();
        }

        #endregion

        #region CreateBookAsync Tests

        [Fact]
        public async Task CreateBookAsync_WithValidData_ShouldCreateBook()
        {
            // Arrange
            var createDto = new BookCreateDto
            {
                Title = "New Book",
                Author = "New Author",
                ISBN = "ISBN123",
                CopiesAvailable = 10
            };

            _mockUnitOfWork.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

            // Act
            var result = await _bookService.CreateBookAsync(createDto);

            // Assert
            result.Should().NotBeNull();
            result.Title.Should().Be("New Book");
            result.Author.Should().Be("New Author");
            result.CopiesAvailable.Should().Be(10);
            _mockBookRepository.Verify(r => r.AddAsync(It.IsAny<Book>()), Times.Once);
            _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task CreateBookAsync_ShouldLogBookCreation()
        {
            // Arrange
            var createDto = new BookCreateDto
            {
                Title = "New Book",
                Author = "New Author",
                ISBN = "ISBN123",
                CopiesAvailable = 10
            };

            _mockUnitOfWork.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

            // Act
            await _bookService.CreateBookAsync(createDto);

            // Assert
            _mockLogger.Verify(
                x => x.Log(
                    LogLevel.Information,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Book created")),
                    null,
                    It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
                Times.Once);
        }

        #endregion

        #region UpdateBookAsync Tests

        [Fact]
        public async Task UpdateBookAsync_WithValidData_ShouldUpdateBook()
        {
            // Arrange
            var existingBook = new Book { Id = 1, Title = "Old Title", Author = "Old Author", ISBN = "ISBN1", CopiesAvailable = 5 };
            var updateDto = new BookUpdateDto
            {
                Title = "Updated Title",
                Author = "Updated Author",
                ISBN = "ISBN2",
                CopiesAvailable = 10
            };

            _mockBookRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existingBook);
            _mockUnitOfWork.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

            // Act
            await _bookService.UpdateBookAsync(1, updateDto);

            // Assert
            existingBook.Title.Should().Be("Updated Title");
            existingBook.Author.Should().Be("Updated Author");
            existingBook.CopiesAvailable.Should().Be(10);
            _mockBookRepository.Verify(r => r.Update(existingBook), Times.Once);
            _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task UpdateBookAsync_WithInvalidId_ShouldThrowException()
        {
            // Arrange
            _mockBookRepository.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Book?)null);
            var updateDto = new BookUpdateDto { Title = "Test", Author = "Test", ISBN = "Test", CopiesAvailable = 1 };

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _bookService.UpdateBookAsync(999, updateDto));
        }

        #endregion

        #region DeleteBookAsync Tests

        [Fact]
        public async Task DeleteBookAsync_WithValidId_ShouldDeleteBook()
        {
            // Arrange
            var book = new Book { Id = 1, Title = "Test Book", Author = "Test Author", ISBN = "ISBN1", CopiesAvailable = 5 };
            _mockBookRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(book);
            _mockUnitOfWork.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

            // Act
            await _bookService.DeleteBookAsync(1);

            // Assert
            _mockBookRepository.Verify(r => r.Remove(book), Times.Once);
            _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task DeleteBookAsync_WithInvalidId_ShouldThrowException()
        {
            // Arrange
            _mockBookRepository.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Book?)null);

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _bookService.DeleteBookAsync(999));
        }

        #endregion

        #region BookExistsAsync Tests

        [Fact]
        public async Task BookExistsAsync_WhenBookExists_ShouldReturnTrue()
        {
            // Arrange
            _mockBookRepository.Setup(r => r.ExistsAsync(It.IsAny<System.Linq.Expressions.Expression<Func<Book, bool>>>()))
                .ReturnsAsync(true);

            // Act
            var result = await _bookService.BookExistsAsync(1);

            // Assert
            result.Should().BeTrue();
        }

        [Fact]
        public async Task BookExistsAsync_WhenBookDoesNotExist_ShouldReturnFalse()
        {
            // Arrange
            _mockBookRepository.Setup(r => r.ExistsAsync(It.IsAny<System.Linq.Expressions.Expression<Func<Book, bool>>>()))
                .ReturnsAsync(false);

            // Act
            var result = await _bookService.BookExistsAsync(999);

            // Assert
            result.Should().BeFalse();
        }

        #endregion
    }
}
