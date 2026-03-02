using LibraryManagement.API.DTOs.Dashboard;

namespace LibraryManagement.API.Services
{
    public interface IDashboardService
    {
        Task<DashboardStatsDto> GetAdminStatsAsync();
        Task<DashboardStatsDto> GetMemberStatsAsync(int userId);
    }
}
