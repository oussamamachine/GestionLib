using LibraryManagement.API.Data;
using LibraryManagement.API.Domain.Entities;
using LibraryManagement.API.DTOs.Loans;
using LibraryManagement.API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagement.API.Services
{
    public class LoanService : ILoanService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<LoanService> _logger;

        public LoanService(IUnitOfWork unitOfWork, ApplicationDbContext context, ILogger<LoanService> logger)
        {
            _unitOfWork = unitOfWork;
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<LoanResponseDto>> GetAllLoansAsync()
        {
            var loans = await _context.Loans
                .Include(l => l.User)
                .Include(l => l.Book)
                .ToListAsync();

            return loans.Select(l => MapToDto(l));
        }

        public async Task<LoanResponseDto?> GetLoanByIdAsync(int id)
        {
            var loan = await _context.Loans
                .Include(l => l.User)
                .Include(l => l.Book)
                .FirstOrDefaultAsync(l => l.Id == id);

            return loan == null ? null : MapToDto(loan);
        }

        public async Task<LoanResponseDto> CreateLoanAsync(LoanCreateDto dto)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(dto.UserId);
            var book = await _unitOfWork.Books.GetByIdAsync(dto.BookId);

            if (user == null)
                throw new KeyNotFoundException($"User with ID {dto.UserId} not found");

            if (book == null)
                throw new KeyNotFoundException($"Book with ID {dto.BookId} not found");

            if (book.CopiesAvailable <= 0)
                throw new InvalidOperationException("No copies available for loan");

            var loan = new Loan
            {
                UserId = dto.UserId,
                BookId = dto.BookId,
                LoanDate = DateTime.UtcNow,
                DueDate = DateTime.UtcNow.AddDays(14)
            };

            book.CopiesAvailable -= 1;

            await _unitOfWork.Loans.AddAsync(loan);
            _unitOfWork.Books.Update(book);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Loan created: {LoanId} - User: {UserId}, Book: {BookId}", loan.Id, dto.UserId, dto.BookId);

            // Reload with navigation properties
            var createdLoan = await _context.Loans
                .Include(l => l.User)
                .Include(l => l.Book)
                .FirstOrDefaultAsync(l => l.Id == loan.Id);

            return MapToDto(createdLoan!);
        }

        public async Task ReturnLoanAsync(int id)
        {
            var loan = await _context.Loans
                .Include(l => l.Book)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (loan == null)
                throw new KeyNotFoundException($"Loan with ID {id} not found");

            if (loan.ReturnDate != null)
                throw new InvalidOperationException("Loan already returned");

            loan.ReturnDate = DateTime.UtcNow;
            if (loan.Book != null)
                loan.Book.CopiesAvailable += 1;

            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Loan returned: {LoanId}", id);
        }

        public async Task<IEnumerable<LoanResponseDto>> GetUserLoansAsync(int userId)
        {
            var loans = await _context.Loans
                .Include(l => l.User)
                .Include(l => l.Book)
                .Where(l => l.UserId == userId)
                .ToListAsync();

            return loans.Select(l => MapToDto(l));
        }

        private static LoanResponseDto MapToDto(Loan loan)
        {
            return new LoanResponseDto
            {
                Id = loan.Id,
                UserId = loan.UserId,
                BookId = loan.BookId,
                LoanDate = loan.LoanDate,
                DueDate = loan.DueDate,
                ReturnDate = loan.ReturnDate,
                Username = loan.User?.Username,
                BookTitle = loan.Book?.Title
            };
        }
    }
}
