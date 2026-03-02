using LibraryManagement.API.DTOs.Loans;

namespace LibraryManagement.API.Services
{
    public interface ILoanService
    {
        Task<IEnumerable<LoanResponseDto>> GetAllLoansAsync();
        Task<LoanResponseDto?> GetLoanByIdAsync(int id);
        Task<LoanResponseDto> CreateLoanAsync(LoanCreateDto dto);
        Task ReturnLoanAsync(int id);
        Task<IEnumerable<LoanResponseDto>> GetUserLoansAsync(int userId);
    }
}
