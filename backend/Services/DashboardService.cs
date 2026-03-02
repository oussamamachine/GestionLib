using LibraryManagement.API.DTOs.Dashboard;
using LibraryManagement.API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagement.API.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IUnitOfWork _unitOfWork;

        public DashboardService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<DashboardStatsDto> GetAdminStatsAsync()
        {
            var books = await _unitOfWork.Books.GetAllAsync();
            var loans = await _unitOfWork.Loans.GetAllAsync();
            var users = await _unitOfWork.Users.GetAllAsync();

            var stats = new DashboardStatsDto
            {
                TotalBooks = books.Count(),
                AvailableBooks = books.Sum(b => b.CopiesAvailable),
                TotalLoans = loans.Count(),
                ActiveLoans = loans.Count(l => l.ReturnDate == null),
                OverdueLoans = loans.Count(l => l.ReturnDate == null && l.DueDate < DateTime.UtcNow),
                TotalUsers = users.Count()
            };

            // Get recent activity
            var recentLoans = (await _unitOfWork.Loans.FindAsync(l => true))
                .OrderByDescending(l => l.LoanDate)
                .Take(5)
                .Select(l => new RecentActivityDto
                {
                    Title = "New Loan",
                    Description = $"Book {l.BookId} loaned to user {l.UserId}",
                    Timestamp = l.LoanDate,
                    Type = "Loan"
                });

            stats.RecentActivities.AddRange(recentLoans);

            return stats;
        }

        public async Task<DashboardStatsDto> GetMemberStatsAsync(int userId)
        {
            var userLoans = await _unitOfWork.Loans.FindAsync(l => l.UserId == userId);
            
            return new DashboardStatsDto
            {
                TotalLoans = userLoans.Count(),
                ActiveLoans = userLoans.Count(l => l.ReturnDate == null),
                OverdueLoans = userLoans.Count(l => l.ReturnDate == null && l.DueDate < DateTime.UtcNow),
                RecentActivities = userLoans.OrderByDescending(l => l.LoanDate).Take(5).Select(l => new RecentActivityDto {
                    Title = "Your Loan",
                    Description = $"You borrowed a book",
                    Timestamp = l.LoanDate,
                    Type = "Loan"
                }).ToList()
            };
        }
    }
}
