using LibraryManagement.API.Domain.Entities;

namespace LibraryManagement.API.Repositories
{
    public interface IUnitOfWork : IDisposable
    {
        IRepository<User> Users { get; }
        IRepository<Book> Books { get; }
        IRepository<Loan> Loans { get; }
        Task<int> SaveChangesAsync();
    }
}
