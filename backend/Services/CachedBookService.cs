using Microsoft.Extensions.Caching.Memory;
using LibraryManagement.API.Services;
using LibraryManagement.API.DTOs.Books;
using LibraryManagement.API.DTOs.Common;

namespace LibraryManagement.API.Services
{
    public class CachedBookService : IBookService
    {
        private readonly IBookService _innerService;
        private readonly IMemoryCache _cache;
        private readonly ILogger<CachedBookService> _logger;
        private const string ALL_BOOKS_CACHE_KEY = "all_books";
        private const int CACHE_DURATION_MINUTES = 5;

        public CachedBookService(
            IBookService innerService,
            IMemoryCache cache,
            ILogger<CachedBookService> logger)
        {
            _innerService = innerService;
            _cache = cache;
            _logger = logger;
        }

        public async Task<IEnumerable<BookResponseDto>> GetAllBooksAsync()
        {
            if (_cache.TryGetValue(ALL_BOOKS_CACHE_KEY, out IEnumerable<BookResponseDto>? cachedBooks))
            {
                _logger.LogInformation("Retrieved books from cache");
                return cachedBooks!;
            }

            _logger.LogInformation("Cache miss - fetching books from database");
            var books = await _innerService.GetAllBooksAsync();

            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(CACHE_DURATION_MINUTES))
                .SetPriority(CacheItemPriority.Normal);

            _cache.Set(ALL_BOOKS_CACHE_KEY, books, cacheOptions);
            return books;
        }

        public async Task<PaginatedResultDto<BookResponseDto>> GetPagedBooksAsync(string? searchTerm, int page, int pageSize)
        {
            var cacheKey = $"books_paged_{searchTerm ?? "none"}_{page}_{pageSize}";

            if (!_cache.TryGetValue(cacheKey, out PaginatedResultDto<BookResponseDto>? cachedResult))
            {
                _logger.LogInformation("Cache miss for paged books - searchTerm: {SearchTerm}, page: {Page}", searchTerm, page);
                cachedResult = await _innerService.GetPagedBooksAsync(searchTerm, page, pageSize);

                var cacheOptions = new MemoryCacheEntryOptions()
                    .SetSlidingExpiration(TimeSpan.FromMinutes(CACHE_DURATION_MINUTES));

                _cache.Set(cacheKey, cachedResult, cacheOptions);
            }
            else
            {
                _logger.LogInformation("Retrieved paged books from cache - searchTerm: {SearchTerm}, page: {Page}", searchTerm, page);
            }

            return cachedResult!;
        }

        public async Task<BookResponseDto?> GetBookByIdAsync(int id)
        {
            var cacheKey = $"book_{id}";
            
            if (_cache.TryGetValue(cacheKey, out BookResponseDto? cachedBook))
            {
                _logger.LogInformation("Retrieved book {BookId} from cache", id);
                return cachedBook;
            }

            var book = await _innerService.GetBookByIdAsync(id);
            if (book != null)
            {
                var cacheOptions = new MemoryCacheEntryOptions()
                    .SetAbsoluteExpiration(TimeSpan.FromMinutes(CACHE_DURATION_MINUTES));
                
                _cache.Set(cacheKey, book, cacheOptions);
            }
            
            return book;
        }

        public async Task<BookResponseDto> CreateBookAsync(BookCreateDto bookDto)
        {
            var result = await _innerService.CreateBookAsync(bookDto);
            InvalidateCache();
            return result;
        }

        public async Task UpdateBookAsync(int id, BookUpdateDto bookDto)
        {
            await _innerService.UpdateBookAsync(id, bookDto);
            InvalidateCache();
            _cache.Remove($"book_{id}");
        }

        public async Task DeleteBookAsync(int id)
        {
            await _innerService.DeleteBookAsync(id);
            InvalidateCache();
            _cache.Remove($"book_{id}");
        }

        public Task<bool> BookExistsAsync(int id)
        {
            return _innerService.BookExistsAsync(id);
        }

        private void InvalidateCache()
        {
            _cache.Remove(ALL_BOOKS_CACHE_KEY);
            _logger.LogInformation("Book cache invalidated");
        }
    }
}
