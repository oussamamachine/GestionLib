using FluentAssertions;
using LibraryManagement.API.Data;
using LibraryManagement.API.Domain.Entities;
using LibraryManagement.API.DTOs.Loans;
using LibraryManagement.API.Repositories;
using LibraryManagement.API.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace LibraryManagement.Tests.UnitTests.Services
{
    /// <summary>
    /// Unit tests for LoanService
    /// Tests loan creation, returns, and business rules
    /// </summary>
    public class LoanServiceTests : IDisposable
    {
        private readonly Mock<IUnitOfWork> _mockUnitOfWork;
        private readonly Mock<IRepository<User>> _mockUserRepository;
        private readonly Mock<IRepository<Book>> _mockBookRepository;
        private readonly Mock<IRepository<Loan>> _mockLoanRepository;
        private readonly ApplicationDbContext _context;
        private readonly Mock<ILogger<LoanService>> _mockLogger;
        private readonly LoanService _loanService;

        public LoanServiceTests()
        {
            // Setup in-memory database for loan tests (needs EF context)
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new ApplicationDbContext(options);

            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockUserRepository = new Mock<IRepository<User>>();
            _mockBookRepository = new Mock<IRepository<Book>>();
            _mockLoanRepository = new Mock<IRepository<Loan>>();
            _mockLogger = new Mock<ILogger<LoanService>>();

            _mockUnitOfWork.Setup(u => u.Users).Returns(_mockUserRepository.Object);
            _mockUnitOfWork.Setup(u => u.Books).Returns(_mockBookRepository.Object);
            _mockUnitOfWork.Setup(u => u.Loans).Returns(_mockLoanRepository.Object);

            _loanService = new LoanService(
                _mockUnitOfWork.Object,
                _context,
                _mockLogger.Object);
        }

        #region CreateLoanAsync Tests

        [Fact]
        public async Task CreateLoanAsync_WithValidData_ShouldCreateLoan()
        {
            // Arrange
            var user = new User { Id = 1, Username = "testuser", Email = "test@test.com", PasswordHash = "hash", Role = Role.Member };
            var book = new Book { Id = 1, Title = "Test Book", Author = "Test Author", ISBN = "ISBN1", CopiesAvailable = 5 };

            _mockUserRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(user);
            _mockBookRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(book);
            _mockUnitOfWork.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

            // Add to in-memory context for Include query
            _context.Users.Add(user);
            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            var createDto = new LoanCreateDto { UserId = 1, BookId = 1 };

            // Act
            var result = await _loanService.CreateLoanAsync(createDto);

            // Assert
            result.Should().NotBeNull();
            result.UserId.Should().Be(1);
            result.BookId.Should().Be(1);
            result.LoanDate.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
            result.DueDate.Should().BeCloseTo(DateTime.UtcNow.AddDays(14), TimeSpan.FromSeconds(5));
            result.ReturnDate.Should().BeNull();

            // Verify book copies were decremented
            book.CopiesAvailable.Should().Be(4);
            _mockBookRepository.Verify(r => r.Update(book), Times.Once);
        }

        [Fact]
        public async Task CreateLoanAsync_WithInvalidUser_ShouldThrowException()
        {
            // Arrange
            _mockUserRepository.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((User?)null);
            _mockBookRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(new Book { Id = 1, Title = "Test", Author = "Test", ISBN = "ISBN", CopiesAvailable = 5 });

            var createDto = new LoanCreateDto { UserId = 999, BookId = 1 };

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                _loanService.CreateLoanAsync(createDto));
        }

        [Fact]
        public async Task CreateLoanAsync_WithInvalidBook_ShouldThrowException()
        {
            // Arrange
            _mockUserRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(new User { Id = 1, Username = "test", Email = "test@test.com", PasswordHash = "hash", Role = Role.Member });
            _mockBookRepository.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Book?)null);

            var createDto = new LoanCreateDto { UserId = 1, BookId = 999 };

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                _loanService.CreateLoanAsync(createDto));
        }

        [Fact]
        public async Task CreateLoanAsync_WhenNoCopiesAvailable_ShouldThrowException()
        {
            // Arrange
            var user = new User { Id = 1, Username = "testuser", Email = "test@test.com", PasswordHash = "hash", Role = Role.Member };
            var book = new Book { Id = 1, Title = "Test Book", Author = "Test Author", ISBN = "ISBN1", CopiesAvailable = 0 };

            _mockUserRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(user);
            _mockBookRepository.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(book);

            var createDto = new LoanCreateDto { UserId = 1, BookId = 1 };

            // Act & Assert
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                _loanService.CreateLoanAsync(createDto));
            exception.Message.Should().Contain("No copies available");
        }

        #endregion

        #region ReturnLoanAsync Tests

        [Fact]
        public async Task ReturnLoanAsync_WithValidLoan_ShouldMarkAsReturned()
        {
            // Arrange
            var book = new Book { Id = 1, Title = "Test Book", Author = "Test Author", ISBN = "ISBN1", CopiesAvailable = 4 };
            var loan = new Loan
            {
                Id = 1,
                UserId = 1,
                BookId = 1,
                LoanDate = DateTime.UtcNow.AddDays(-7),
                DueDate = DateTime.UtcNow.AddDays(7),
                ReturnDate = null,
                Book = book
            };

            _context.Books.Add(book);
            _context.Loans.Add(loan);
            await _context.SaveChangesAsync();

            _mockUnitOfWork.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

            // Act
            await _loanService.ReturnLoanAsync(1);

            // Assert
            loan.ReturnDate.Should().NotBeNull();
            loan.ReturnDate.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
            book.CopiesAvailable.Should().Be(5); // Incremented
        }

        [Fact]
        public async Task ReturnLoanAsync_WithInvalidLoanId_ShouldThrowException()
        {
            // Arrange
            // No loan in context

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                _loanService.ReturnLoanAsync(999));
        }

        [Fact]
        public async Task ReturnLoanAsync_WhenAlreadyReturned_ShouldThrowException()
        {
            // Arrange
            var loan = new Loan
            {
                Id = 1,
                UserId = 1,
                BookId = 1,
                LoanDate = DateTime.UtcNow.AddDays(-14),
                DueDate = DateTime.UtcNow.AddDays(-7),
                ReturnDate = DateTime.UtcNow.AddDays(-1) // Already returned
            };

            _context.Loans.Add(loan);
            await _context.SaveChangesAsync();

            // Act & Assert
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                _loanService.ReturnLoanAsync(1));
            exception.Message.Should().Contain("already returned");
        }

        #endregion

        #region GetUserLoansAsync Tests

        [Fact]
        public async Task GetUserLoansAsync_ShouldReturnUserLoans()
        {
            // Arrange
            var user = new User { Id = 1, Username = "testuser", Email = "test@test.com", PasswordHash = "hash", Role = Role.Member };
            var book1 = new Book { Id = 1, Title = "Book 1", Author = "Author 1", ISBN = "ISBN1", CopiesAvailable = 5 };
            var book2 = new Book { Id = 2, Title = "Book 2", Author = "Author 2", ISBN = "ISBN2", CopiesAvailable = 3 };

            var loan1 = new Loan { Id = 1, UserId = 1, BookId = 1, LoanDate = DateTime.UtcNow, DueDate = DateTime.UtcNow.AddDays(14), User = user, Book = book1 };
            var loan2 = new Loan { Id = 2, UserId = 1, BookId = 2, LoanDate = DateTime.UtcNow, DueDate = DateTime.UtcNow.AddDays(14), User = user, Book = book2 };

            _context.Users.Add(user);
            _context.Books.AddRange(book1, book2);
            _context.Loans.AddRange(loan1, loan2);
            await _context.SaveChangesAsync();

            // Act
            var result = await _loanService.GetUserLoansAsync(1);

            // Assert
            result.Should().HaveCount(2);
            result.Should().Contain(l => l.BookTitle == "Book 1");
            result.Should().Contain(l => l.BookTitle == "Book 2");
        }

        [Fact]
        public async Task GetUserLoansAsync_WithNoLoans_ShouldReturnEmptyList()
        {
            // Arrange
            // No loans in context

            // Act
            var result = await _loanService.GetUserLoansAsync(999);

            // Assert
            result.Should().BeEmpty();
        }

        #endregion

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
