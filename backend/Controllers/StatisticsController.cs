using System.Security.Claims;
using LibraryManagement.API.DTOs.Dashboard;
using LibraryManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibraryManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StatisticsController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public StatisticsController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet]
        [ProducesResponseType(typeof(DashboardStatsDto), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetStats()
        {
            if (User.IsInRole("Admin") || User.IsInRole("Librarian"))
            {
                var stats = await _dashboardService.GetAdminStatsAsync();
                return Ok(stats);
            }
            else
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                var stats = await _dashboardService.GetMemberStatsAsync(userId);
                return Ok(stats);
            }
        }
    }
}
