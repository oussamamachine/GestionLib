using LibraryManagement.API.Data;
using LibraryManagement.API.Domain.Entities;

namespace LibraryManagement.API.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        private IRepository<User>? _users;
        private IRepository<Book>? _books;
        private IRepository<Loan>? _loans;

        public UnitOfWork(ApplicationDbContext context)
        {
            _context = context;
        }

        public IRepository<User> Users => _users ??= new Repository<User>(_context);
        public IRepository<Book> Books => _books ??= new Repository<Book>(_context);
        public IRepository<Loan> Loans => _loans ??= new Repository<Loan>(_context);

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
