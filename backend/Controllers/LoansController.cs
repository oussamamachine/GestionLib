using System.Security.Claims;
using LibraryManagement.API.Domain.Entities;
using LibraryManagement.API.DTOs.Loans;
using LibraryManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LibraryManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoansController : ControllerBase
    {
        private readonly ILoanService _loanService;
        private readonly ILogger<LoansController> _logger;

        public LoansController(ILoanService loanService, ILogger<LoansController> logger)
        {
            _loanService = loanService;
            _logger = logger;
        }

        /// <summary>
        /// Get all loans (Admin and Librarian only)
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin,Librarian")]
        [ProducesResponseType(typeof(IEnumerable<LoanResponseDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll()
        {
            var loans = await _loanService.GetAllLoansAsync();
            return Ok(loans);
        }

        /// <summary>
        /// Get a specific loan by ID
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Librarian,Member")]
        [ProducesResponseType(typeof(LoanResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> Get(int id)
        {
            var loan = await _loanService.GetLoanByIdAsync(id);
            if (loan == null)
                return NotFound(new { error = "Loan not found" });

            // If caller is a Member, ensure they own the loan
            if (User.IsInRole(Role.Member.ToString()))
            {
                var callerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
                if (loan.UserId != callerId)
                    return Forbid();
            }

            return Ok(loan);
        }

        /// <summary>
        /// Get loans for the current user
        /// </summary>
        [HttpGet("my-loans")]
        [Authorize]
        [ProducesResponseType(typeof(IEnumerable<LoanResponseDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetMyLoans()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
            var loans = await _loanService.GetUserLoansAsync(userId);
            return Ok(loans);
        }

        /// <summary>
        /// Create a new loan (Members can borrow for themselves, Admins/Librarians can for anyone)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin,Librarian,Member")]
        [ProducesResponseType(typeof(LoanResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] LoanCreateDto model)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            try
            {
                // If caller is a Member, force UserId to be themselves
                if (User.IsInRole("Member"))
                {
                    model.UserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
                }
                
                var loan = await _loanService.CreateLoanAsync(model);
                return CreatedAtAction(nameof(Get), new { id = loan.Id }, loan);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Return a loaned book
        /// </summary>
        [HttpPost("{id}/return")]
        [Authorize(Roles = "Admin,Librarian,Member")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> Return(int id)
        {
            try
            {
                var loan = await _loanService.GetLoanByIdAsync(id);
                if (loan == null)
                    return NotFound(new { error = "Loan not found" });

                // If caller is Member, ensure they own the loan
                if (User.IsInRole(Role.Member.ToString()))
                {
                    var callerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
                    if (loan.UserId != callerId)
                        return Forbid();
                }

                await _loanService.ReturnLoanAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
