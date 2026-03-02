using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Net;

namespace LibraryManagement.API.Middleware
{
    public class RateLimitAttribute : ActionFilterAttribute
    {
        private static readonly Dictionary<string, List<DateTime>> _requestLog = new();
        private static readonly object _lock = new object();
        private readonly int _maxRequests;
        private readonly int _timeWindowSeconds;

        public RateLimitAttribute(int maxRequests = 5, int timeWindowSeconds = 60)
        {
            _maxRequests = maxRequests;
            _timeWindowSeconds = timeWindowSeconds;
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            var ipAddress = context.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var endpoint = $"{context.HttpContext.Request.Method}:{context.HttpContext.Request.Path}";
            var key = $"{ipAddress}_{endpoint}";

            lock (_lock)
            {
                var now = DateTime.UtcNow;
                var cutoffTime = now.AddSeconds(-_timeWindowSeconds);

                if (!_requestLog.ContainsKey(key))
                {
                    _requestLog[key] = new List<DateTime>();
                }

                // Remove old requests outside the time window
                _requestLog[key] = _requestLog[key].Where(t => t > cutoffTime).ToList();

                if (_requestLog[key].Count >= _maxRequests)
                {
                    context.Result = new ContentResult
                    {
                        StatusCode = (int)HttpStatusCode.TooManyRequests,
                        Content = "Too many requests. Please try again later.",
                        ContentType = "text/plain"
                    };
                    
                    context.HttpContext.Response.Headers.Add("Retry-After", _timeWindowSeconds.ToString());
                    return;
                }

                _requestLog[key].Add(now);
            }

            base.OnActionExecuting(context);
        }
    }

    // Background service to clean up old entries
    public class RateLimitCleanupService : BackgroundService
    {
        private readonly ILogger<RateLimitCleanupService> _logger;

        public RateLimitCleanupService(ILogger<RateLimitCleanupService> logger)
        {
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(TimeSpan.FromMinutes(10), stoppingToken);
                // Cleanup logic would go here if needed
                _logger.LogDebug("Rate limit cleanup executed");
            }
        }
    }
}
