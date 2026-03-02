# Backend API Implementation Guide

## Overview
This guide provides implementation details for the new API endpoints required to support the advanced frontend features.

---

## 🔔 Notifications API

### 1. Get User Notifications
```csharp
GET /api/notifications

Query Parameters:
- unreadOnly: bool (optional, default: false)
- limit: int (optional, default: 50)

Response: 200 OK
{
  "notifications": [
    {
      "id": 1,
      "type": "overdue",        // overdue, due_soon, returned, info
      "title": "Overdue Book",
      "message": "The book 'Clean Code' is overdue by 3 days",
      "timestamp": "2024-01-15T10:30:00Z",
      "read": false,
      "bookId": 123,
      "userId": 456,
      "metadata": {
        "daysOverdue": 3
      }
    }
  ],
  "unreadCount": 5
}

Implementation Notes:
- Check user role to filter relevant notifications
- Admin/Librarian: See all overdue books notifications
- Member: See only their own loan notifications
- Order by timestamp DESC
- Mark old notifications as expired (>30 days)
```

**C# Controller Example:**
```csharp
[HttpGet]
[Authorize]
public async Task<ActionResult<NotificationResponse>> GetNotifications(
    [FromQuery] bool unreadOnly = false,
    [FromQuery] int limit = 50)
{
    var userId = User.GetUserId();
    var userRole = User.GetUserRole();
    
    var query = _context.Notifications
        .Where(n => n.UserId == userId || userRole == "Admin");
    
    if (unreadOnly)
        query = query.Where(n => !n.Read);
    
    var notifications = await query
        .OrderByDescending(n => n.Timestamp)
        .Take(limit)
        .ToListAsync();
    
    var unreadCount = await query.CountAsync(n => !n.Read);
    
    return Ok(new { notifications, unreadCount });
}
```

### 2. Mark Notification as Read
```csharp
PUT /api/notifications/{id}/mark-read

Path Parameters:
- id: int (notification ID)

Response: 204 No Content

Implementation Notes:
- Verify user owns notification or is admin
- Update read field to true
- Update readAt timestamp
```

**C# Controller Example:**
```csharp
[HttpPut("{id}/mark-read")]
[Authorize]
public async Task<IActionResult> MarkAsRead(int id)
{
    var userId = User.GetUserId();
    var notification = await _context.Notifications
        .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);
    
    if (notification == null)
        return NotFound();
    
    notification.Read = true;
    notification.ReadAt = DateTime.UtcNow;
    await _context.SaveChangesAsync();
    
    return NoContent();
}
```

### 3. Mark All as Read
```csharp
DELETE /api/notifications/mark-all-read

Response: 204 No Content

Implementation Notes:
- Mark all unread notifications for current user as read
- Bulk update for performance
```

**C# Controller Example:**
```csharp
[HttpDelete("mark-all-read")]
[Authorize]
public async Task<IActionResult> MarkAllAsRead()
{
    var userId = User.GetUserId();
    
    await _context.Notifications
        .Where(n => n.UserId == userId && !n.Read)
        .ExecuteUpdateAsync(n => n
            .SetProperty(p => p.Read, true)
            .SetProperty(p => p.ReadAt, DateTime.UtcNow));
    
    return NoContent();
}
```

### 4. Notification Generation Service

**Background Service for Auto-Notifications:**
```csharp
public class NotificationService : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await CheckOverdueBooks();
            await CheckDueSoonBooks();
            
            // Run every hour
            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
        }
    }
    
    private async Task CheckOverdueBooks()
    {
        var overdueLoans = await _context.Loans
            .Include(l => l.Book)
            .Include(l => l.User)
            .Where(l => l.DueDate < DateTime.UtcNow && l.ReturnDate == null)
            .ToListAsync();
        
        foreach (var loan in overdueLoans)
        {
            // Check if notification already exists
            var exists = await _context.Notifications
                .AnyAsync(n => n.LoanId == loan.Id && n.Type == "overdue");
            
            if (!exists)
            {
                var notification = new Notification
                {
                    UserId = loan.UserId,
                    Type = "overdue",
                    Title = "Overdue Book",
                    Message = $"The book '{loan.Book.Title}' is overdue by {(DateTime.UtcNow - loan.DueDate).Days} days",
                    Timestamp = DateTime.UtcNow,
                    BookId = loan.BookId,
                    LoanId = loan.Id,
                    Read = false
                };
                
                _context.Notifications.Add(notification);
            }
        }
        
        await _context.SaveChangesAsync();
    }
    
    private async Task CheckDueSoonBooks()
    {
        var tomorrow = DateTime.UtcNow.AddDays(1);
        var dueSoon = await _context.Loans
            .Include(l => l.Book)
            .Where(l => l.DueDate <= tomorrow && 
                       l.DueDate > DateTime.UtcNow && 
                       l.ReturnDate == null)
            .ToListAsync();
        
        foreach (var loan in dueSoon)
        {
            var exists = await _context.Notifications
                .AnyAsync(n => n.LoanId == loan.Id && n.Type == "due_soon");
            
            if (!exists)
            {
                var notification = new Notification
                {
                    UserId = loan.UserId,
                    Type = "due_soon",
                    Title = "Book Due Soon",
                    Message = $"The book '{loan.Book.Title}' is due tomorrow",
                    Timestamp = DateTime.UtcNow,
                    BookId = loan.BookId,
                    LoanId = loan.Id,
                    Read = false
                };
                
                _context.Notifications.Add(notification);
            }
        }
        
        await _context.SaveChangesAsync();
    }
}
```

**Entity Model:**
```csharp
public class Notification
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Type { get; set; } // overdue, due_soon, returned, info
    public string Title { get; set; }
    public string Message { get; set; }
    public DateTime Timestamp { get; set; }
    public bool Read { get; set; }
    public DateTime? ReadAt { get; set; }
    public int? BookId { get; set; }
    public int? LoanId { get; set; }
    public string Metadata { get; set; } // JSON for additional data
    
    // Navigation properties
    public User User { get; set; }
    public Book Book { get; set; }
    public Loan Loan { get; set; }
}
```

---

## 📊 Statistics API

### 1. Admin Analytics
```csharp
GET /api/statistics/analytics

Response: 200 OK
{
  "loanTrends": [
    {
      "date": "2024-01-08",
      "loans": 15,
      "returns": 10
    }
  ],
  "popularCategories": [
    {
      "category": "Fiction",
      "count": 45,
      "percentage": 35.5
    }
  ],
  "topBorrowedBooks": [
    {
      "bookId": 123,
      "title": "Clean Code",
      "author": "Robert Martin",
      "borrowCount": 8
    }
  ]
}

Implementation Notes:
- Loan trends: Last 7 days by default
- Popular categories: Current month
- Top borrowed: All time or configurable period
- Cache results for 5 minutes
```

**C# Controller Example:**
```csharp
[HttpGet("analytics")]
[Authorize(Roles = "Admin,Librarian")]
public async Task<ActionResult<AnalyticsResponse>> GetAnalytics()
{
    var startDate = DateTime.UtcNow.AddDays(-7);
    
    // Loan Trends
    var loanTrends = await _context.Loans
        .Where(l => l.LoanDate >= startDate)
        .GroupBy(l => l.LoanDate.Date)
        .Select(g => new
        {
            Date = g.Key,
            Loans = g.Count(),
            Returns = g.Count(l => l.ReturnDate != null)
        })
        .OrderBy(x => x.Date)
        .ToListAsync();
    
    // Popular Categories
    var popularCategories = await _context.Loans
        .Include(l => l.Book)
        .Where(l => l.LoanDate >= DateTime.UtcNow.AddMonths(-1))
        .GroupBy(l => l.Book.Category)
        .Select(g => new
        {
            Category = g.Key,
            Count = g.Count(),
            Percentage = (g.Count() * 100.0) / _context.Loans.Count()
        })
        .OrderByDescending(x => x.Count)
        .Take(5)
        .ToListAsync();
    
    return Ok(new { loanTrends, popularCategories });
}
```

### 2. Member Reading Statistics
```csharp
GET /api/statistics/reading-stats

Response: 200 OK
{
  "overview": {
    "booksRead": 12,
    "avgReadingTime": 7,      // days
    "favoriteGenre": "Fiction"
  },
  "readingProgress": [
    {
      "month": "Jan",
      "count": 3
    }
  ],
  "genreDistribution": [
    {
      "name": "Fiction",
      "value": 12,
      "color": "#3B82F6"
    }
  ],
  "weeklyConsistency": [
    {
      "day": "Mon",
      "minutes": 45
    }
  ],
  "goals": {
    "booksRead": {
      "current": 8,
      "target": 12
    },
    "pagesRead": {
      "current": 2400,
      "target": 3600
    }
  }
}

Implementation Notes:
- Calculate from user's loan history
- Reading time = days between loan and return
- Genre distribution from completed loans
- Weekly consistency = estimated based on reading patterns
```

**C# Controller Example:**
```csharp
[HttpGet("reading-stats")]
[Authorize(Roles = "Member")]
public async Task<ActionResult<ReadingStatsResponse>> GetReadingStats()
{
    var userId = User.GetUserId();
    var userLoans = await _context.Loans
        .Include(l => l.Book)
        .Where(l => l.UserId == userId && l.ReturnDate != null)
        .ToListAsync();
    
    // Overview
    var booksRead = userLoans
        .Count(l => l.LoanDate >= DateTime.UtcNow.AddYears(-1));
    
    var avgReadingTime = userLoans
        .Where(l => l.ReturnDate != null)
        .Average(l => (l.ReturnDate.Value - l.LoanDate).TotalDays);
    
    var favoriteGenre = userLoans
        .GroupBy(l => l.Book.Category)
        .OrderByDescending(g => g.Count())
        .First().Key;
    
    // Reading Progress (last 6 months)
    var readingProgress = Enumerable.Range(0, 6)
        .Select(i => DateTime.UtcNow.AddMonths(-i))
        .Select(month => new
        {
            Month = month.ToString("MMM"),
            Count = userLoans.Count(l => 
                l.LoanDate.Month == month.Month && 
                l.LoanDate.Year == month.Year)
        })
        .Reverse()
        .ToList();
    
    // Genre Distribution
    var genreDistribution = userLoans
        .GroupBy(l => l.Book.Category)
        .Select(g => new
        {
            Name = g.Key,
            Value = g.Count()
        })
        .ToList();
    
    return Ok(new
    {
        Overview = new { booksRead, avgReadingTime, favoriteGenre },
        ReadingProgress = readingProgress,
        GenreDistribution = genreDistribution
    });
}
```

---

## 📚 Books API Enhancements

### 1. Enhanced Paged Books with Filters
```csharp
GET /api/books/paged?search=...&status=...&category=...&dateFrom=...&dateTo=...&availability=true&page=1&pageSize=10

Query Parameters:
- search: string (optional)
- status: string (optional) - "all", "active", "overdue", "returned"
- category: string (optional)
- dateFrom: datetime (optional)
- dateTo: datetime (optional)
- availability: bool (optional) - only available books
- page: int (default: 1)
- pageSize: int (default: 10)

Response: 200 OK
{
  "items": [...],
  "page": 1,
  "pageSize": 10,
  "totalCount": 120,
  "totalPages": 12
}
```

**C# Controller Example:**
```csharp
[HttpGet("paged")]
public async Task<ActionResult<PagedResult<BookResponseDto>>> GetPagedBooks(
    [FromQuery] string search = null,
    [FromQuery] string status = "all",
    [FromQuery] string category = null,
    [FromQuery] DateTime? dateFrom = null,
    [FromQuery] DateTime? dateTo = null,
    [FromQuery] bool? availability = null,
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 10)
{
    var query = _context.Books.AsQueryable();
    
    // Search filter
    if (!string.IsNullOrEmpty(search))
    {
        query = query.Where(b => 
            b.Title.Contains(search) || 
            b.Author.Contains(search) || 
            b.ISBN.Contains(search));
    }
    
    // Category filter
    if (!string.IsNullOrEmpty(category))
    {
        query = query.Where(b => b.Category == category);
    }
    
    // Availability filter
    if (availability == true)
    {
        query = query.Where(b => b.CopiesAvailable > 0);
    }
    
    // Status filter (requires joining with Loans)
    if (status != "all")
    {
        switch (status.ToLower())
        {
            case "active":
                query = query.Where(b => 
                    _context.Loans.Any(l => 
                        l.BookId == b.Id && 
                        l.ReturnDate == null &&
                        l.DueDate >= DateTime.UtcNow));
                break;
            case "overdue":
                query = query.Where(b => 
                    _context.Loans.Any(l => 
                        l.BookId == b.Id && 
                        l.ReturnDate == null &&
                        l.DueDate < DateTime.UtcNow));
                break;
            case "returned":
                query = query.Where(b => 
                    _context.Loans.Any(l => 
                        l.BookId == b.Id && 
                        l.ReturnDate != null));
                break;
        }
    }
    
    // Date range filter
    if (dateFrom.HasValue || dateTo.HasValue)
    {
        query = query.Where(b => 
            _context.Loans.Any(l => 
                l.BookId == b.Id &&
                (!dateFrom.HasValue || l.LoanDate >= dateFrom) &&
                (!dateTo.HasValue || l.LoanDate <= dateTo)));
    }
    
    var totalCount = await query.CountAsync();
    
    var items = await query
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(b => new BookResponseDto
        {
            Id = b.Id,
            Title = b.Title,
            Author = b.Author,
            ISBN = b.ISBN,
            Category = b.Category,
            CopiesAvailable = b.CopiesAvailable
        })
        .ToListAsync();
    
    return Ok(new PagedResult<BookResponseDto>
    {
        Items = items,
        Page = page,
        PageSize = pageSize,
        TotalCount = totalCount,
        TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
    });
}
```

### 2. Get Book Categories
```csharp
GET /api/books/categories

Response: 200 OK
[
  "Fiction",
  "Non-Fiction",
  "Science",
  "History",
  "Biography"
]

Implementation Notes:
- Return distinct categories from all books
- Order alphabetically
- Cache for 1 hour
```

**C# Controller Example:**
```csharp
[HttpGet("categories")]
public async Task<ActionResult<List<string>>> GetCategories()
{
    var categories = await _context.Books
        .Select(b => b.Category)
        .Distinct()
        .OrderBy(c => c)
        .ToListAsync();
    
    return Ok(categories);
}
```

### 3. Personalized Recommendations
```csharp
GET /api/books/recommendations

Response: 200 OK
{
  "recommendations": [
    {
      "id": 123,
      "title": "Clean Architecture",
      "author": "Robert Martin",
      "category": "Technology",
      "rating": 4.5,
      "copiesAvailable": 3,
      "matchScore": 92,
      "reasons": ["genre_match", "author_match"]
    }
  ],
  "insights": {
    "topGenres": ["Fiction", "Mystery"],
    "readingStreak": 7,
    "booksThisMonth": 3
  }
}

Implementation Notes:
- Algorithm based on user's reading history
- Match score calculation:
  - Genre match: +30 points
  - Author match: +25 points
  - Trending (popular): +20 points
  - Similar readers liked: +25 points
- Limit to top 10 recommendations
```

**C# Controller Example:**
```csharp
[HttpGet("recommendations")]
[Authorize(Roles = "Member")]
public async Task<ActionResult<RecommendationsResponse>> GetRecommendations()
{
    var userId = User.GetUserId();
    
    // Get user's reading history
    var userLoans = await _context.Loans
        .Include(l => l.Book)
        .Where(l => l.UserId == userId && l.ReturnDate != null)
        .ToListAsync();
    
    // Calculate user preferences
    var favoriteGenres = userLoans
        .GroupBy(l => l.Book.Category)
        .OrderByDescending(g => g.Count())
        .Take(3)
        .Select(g => g.Key)
        .ToList();
    
    var favoriteAuthors = userLoans
        .GroupBy(l => l.Book.Author)
        .OrderByDescending(g => g.Count())
        .Take(3)
        .Select(g => g.Key)
        .ToList();
    
    // Get books not yet read
    var readBookIds = userLoans.Select(l => l.BookId).ToHashSet();
    
    var candidateBooks = await _context.Books
        .Where(b => !readBookIds.Contains(b.Id) && b.CopiesAvailable > 0)
        .ToListAsync();
    
    // Score each book
    var recommendations = candidateBooks
        .Select(book => new
        {
            Book = book,
            Score = CalculateMatchScore(book, favoriteGenres, favoriteAuthors),
            Reasons = GetMatchReasons(book, favoriteGenres, favoriteAuthors)
        })
        .OrderByDescending(x => x.Score)
        .Take(10)
        .Select(x => new RecommendationDto
        {
            Id = x.Book.Id,
            Title = x.Book.Title,
            Author = x.Book.Author,
            Category = x.Book.Category,
            Rating = 4.5, // TODO: Implement rating system
            CopiesAvailable = x.Book.CopiesAvailable,
            MatchScore = x.Score,
            Reasons = x.Reasons
        })
        .ToList();
    
    var insights = new
    {
        TopGenres = favoriteGenres,
        ReadingStreak = CalculateReadingStreak(userId),
        BooksThisMonth = userLoans.Count(l => 
            l.LoanDate >= DateTime.UtcNow.AddMonths(-1))
    };
    
    return Ok(new { Recommendations = recommendations, Insights = insights });
}

private int CalculateMatchScore(Book book, List<string> favoriteGenres, List<string> favoriteAuthors)
{
    int score = 0;
    
    if (favoriteGenres.Contains(book.Category))
        score += 30;
    
    if (favoriteAuthors.Contains(book.Author))
        score += 25;
    
    // Add trending bonus (based on recent loan count)
    var recentLoans = _context.Loans
        .Count(l => l.BookId == book.Id && 
                   l.LoanDate >= DateTime.UtcNow.AddMonths(-1));
    if (recentLoans > 5)
        score += 20;
    
    return Math.Min(score, 100);
}

private List<string> GetMatchReasons(Book book, List<string> favoriteGenres, List<string> favoriteAuthors)
{
    var reasons = new List<string>();
    
    if (favoriteGenres.Contains(book.Category))
        reasons.Add("genre_match");
    
    if (favoriteAuthors.Contains(book.Author))
        reasons.Add("author_match");
    
    var recentLoans = _context.Loans
        .Count(l => l.BookId == book.Id && 
                   l.LoanDate >= DateTime.UtcNow.AddMonths(-1));
    if (recentLoans > 5)
        reasons.Add("trending");
    
    return reasons;
}
```

---

## 📖 Loans API Enhancements

### 1. My Loan History
```csharp
GET /api/loans/my-history

Response: 200 OK
{
  "summary": {
    "total": 24,
    "completed": 20,
    "active": 3,
    "overdue": 1
  },
  "loans": [
    {
      "id": 1,
      "bookId": 123,
      "bookTitle": "Clean Code",
      "bookAuthor": "Robert Martin",
      "loanDate": "2024-01-01T10:00:00Z",
      "dueDate": "2024-01-15T10:00:00Z",
      "returnDate": "2024-01-14T15:30:00Z",
      "status": "returned"
    }
  ]
}

Implementation Notes:
- Order by loanDate DESC
- Calculate status dynamically
- Status values: "returned", "active", "overdue"
```

**C# Controller Example:**
```csharp
[HttpGet("my-history")]
[Authorize(Roles = "Member")]
public async Task<ActionResult<LoanHistoryResponse>> GetMyHistory()
{
    var userId = User.GetUserId();
    
    var allLoans = await _context.Loans
        .Include(l => l.Book)
        .Where(l => l.UserId == userId)
        .OrderByDescending(l => l.LoanDate)
        .ToListAsync();
    
    var summary = new
    {
        Total = allLoans.Count,
        Completed = allLoans.Count(l => l.ReturnDate != null),
        Active = allLoans.Count(l => 
            l.ReturnDate == null && l.DueDate >= DateTime.UtcNow),
        Overdue = allLoans.Count(l => 
            l.ReturnDate == null && l.DueDate < DateTime.UtcNow)
    };
    
    var loans = allLoans.Select(l => new LoanHistoryDto
    {
        Id = l.Id,
        BookId = l.BookId,
        BookTitle = l.Book.Title,
        BookAuthor = l.Book.Author,
        LoanDate = l.LoanDate,
        DueDate = l.DueDate,
        ReturnDate = l.ReturnDate,
        Status = GetLoanStatus(l)
    }).ToList();
    
    return Ok(new { Summary = summary, Loans = loans });
}

private string GetLoanStatus(Loan loan)
{
    if (loan.ReturnDate != null)
        return "returned";
    
    if (loan.DueDate < DateTime.UtcNow)
        return "overdue";
    
    return "active";
}
```

---

## 🔒 Security & Performance

### 1. Rate Limiting
```csharp
// Add to Program.cs
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("api", options =>
    {
        options.PermitLimit = 100;
        options.Window = TimeSpan.FromMinutes(1);
    });
});

// Apply to specific endpoints
[RateLimit("api")]
[HttpGet("notifications")]
public async Task<ActionResult> GetNotifications() { }
```

### 2. Caching
```csharp
// Install package: Microsoft.Extensions.Caching.Memory

public class BookService
{
    private readonly IMemoryCache _cache;
    
    public async Task<List<string>> GetCategoriesAsync()
    {
        const string cacheKey = "book_categories";
        
        if (!_cache.TryGetValue(cacheKey, out List<string> categories))
        {
            categories = await _context.Books
                .Select(b => b.Category)
                .Distinct()
                .ToListAsync();
            
            _cache.Set(cacheKey, categories, TimeSpan.FromHours(1));
        }
        
        return categories;
    }
}
```

### 3. Database Indexing
```csharp
// Add to ApplicationDbContext.OnModelCreating
modelBuilder.Entity<Notification>()
    .HasIndex(n => new { n.UserId, n.Read });

modelBuilder.Entity<Loan>()
    .HasIndex(l => new { l.UserId, l.ReturnDate });

modelBuilder.Entity<Book>()
    .HasIndex(b => b.Category);
```

---

## 🧪 Testing

### Unit Test Example
```csharp
[Fact]
public async Task GetNotifications_ReturnsOnlyUserNotifications()
{
    // Arrange
    var userId = 1;
    var context = CreateMockContext();
    var controller = new NotificationsController(context);
    controller.SetupUser(userId, "Member");
    
    // Act
    var result = await controller.GetNotifications();
    
    // Assert
    var okResult = Assert.IsType<OkObjectResult>(result.Result);
    var response = Assert.IsType<NotificationResponse>(okResult.Value);
    Assert.All(response.Notifications, n => Assert.Equal(userId, n.UserId));
}
```

---

## 📝 Migration Scripts

```bash
# Create migration for Notification entity
dotnet ef migrations add AddNotificationEntity

# Update database
dotnet ef database update
```

**Migration Example:**
```csharp
public partial class AddNotificationEntity : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Notifications",
            columns: table => new
            {
                Id = table.Column<int>(nullable: false)
                    .Annotation("SqlServer:Identity", "1, 1"),
                UserId = table.Column<int>(nullable: false),
                Type = table.Column<string>(maxLength: 50, nullable: false),
                Title = table.Column<string>(maxLength: 200, nullable: false),
                Message = table.Column<string>(maxLength: 1000, nullable: false),
                Timestamp = table.Column<DateTime>(nullable: false),
                Read = table.Column<bool>(nullable: false, defaultValue: false),
                ReadAt = table.Column<DateTime>(nullable: true),
                BookId = table.Column<int>(nullable: true),
                LoanId = table.Column<int>(nullable: true),
                Metadata = table.Column<string>(nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Notifications", x => x.Id);
                table.ForeignKey(
                    name: "FK_Notifications_Users_UserId",
                    column: x => x.UserId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_Notifications_Books_BookId",
                    column: x => x.BookId,
                    principalTable: "Books",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.SetNull);
            });
        
        migrationBuilder.CreateIndex(
            name: "IX_Notifications_UserId_Read",
            table: "Notifications",
            columns: new[] { "UserId", "Read" });
    }
    
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "Notifications");
    }
}
```

---

## 🚀 Deployment Checklist

- [ ] Create Notification entity and migration
- [ ] Implement NotificationService background worker
- [ ] Add NotificationsController with all endpoints
- [ ] Implement enhanced Books/Paged endpoint with filters
- [ ] Add Books/Categories endpoint
- [ ] Add Books/Recommendations endpoint
- [ ] Add StatisticsController with Analytics endpoint
- [ ] Add StatisticsController with ReadingStats endpoint
- [ ] Add Loans/MyHistory endpoint
- [ ] Configure rate limiting
- [ ] Add memory caching for categories
- [ ] Create database indexes
- [ ] Test all endpoints
- [ ] Update API documentation
- [ ] Deploy and monitor

---

**Version**: 1.0  
**Last Updated**: 2024-01-15  
**Maintained By**: Backend Team
