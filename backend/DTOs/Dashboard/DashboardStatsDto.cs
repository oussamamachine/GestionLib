namespace LibraryManagement.API.DTOs.Dashboard
{
    public class DashboardStatsDto
    {
        public int TotalBooks { get; set; }
        public int AvailableBooks { get; set; }
        public int TotalLoans { get; set; }
        public int ActiveLoans { get; set; }
        public int OverdueLoans { get; set; }
        public int TotalUsers { get; set; }
        public List<RecentActivityDto> RecentActivities { get; set; } = new();
    }

    public class RecentActivityDto
    {
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public DateTime Timestamp { get; set; }
        public string Type { get; set; } = null!; // "Loan", "Return", "User", "Book"
    }
}
