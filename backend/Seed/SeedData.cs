using LibraryManagement.API.Domain.Entities;
using LibraryManagement.API.Data;

namespace LibraryManagement.API.Seed
{
    public static class SeedData
    {
        public static void Initialize(ApplicationDbContext db)
        {
            db.Database.EnsureCreated();

            if (!db.Users.Any())
            {
                var admin = new User
                {
                    Username = "admin",
                    Email = "admin@library.local",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                    Role = Role.Admin
                };

                var librarian = new User
                {
                    Username = "librarian",
                    Email = "librarian@library.local",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("librarian123"),
                    Role = Role.Librarian
                };

                var member = new User
                {
                    Username = "member",
                    Email = "member@library.local",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("member123"),
                    Role = Role.Member
                };

                db.Users.AddRange(admin, librarian, member);
            }

            if (!db.Books.Any())
            {
                db.Books.AddRange(
                    new Book { Title = "The Pragmatic Programmer", Author = "Andrew Hunt", ISBN = "9780201616224", CopiesAvailable = 3 },
                    new Book { Title = "Clean Code", Author = "Robert C. Martin", ISBN = "9780132350884", CopiesAvailable = 2 },
                    new Book { Title = "Design Patterns", Author = "Gamma et al.", ISBN = "9780201633610", CopiesAvailable = 1 }
                );
            }

            if (!db.Loans.Any())
            {
                // create a sample loan for demo purposes: member borrows first available book
                var memberUser = db.Users.FirstOrDefault(u => u.Username == "member");
                var book = db.Books.FirstOrDefault();
                if (memberUser != null && book != null && book.CopiesAvailable > 0)
                {
                    var loan = new Loan
                    {
                        UserId = memberUser.Id,
                        BookId = book.Id,
                        LoanDate = DateTime.UtcNow,
                        DueDate = DateTime.UtcNow.AddDays(14)
                    };
                    book.CopiesAvailable -= 1;
                    db.Loans.Add(loan);
                }
            }

            db.SaveChanges();
        }
    }
}
