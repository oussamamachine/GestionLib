using System.Text;
using System.Text.Json.Serialization;
using System.Data;
using LibraryManagement.API.Data;
using LibraryManagement.API.Middleware;
using LibraryManagement.API.Repositories;
using LibraryManagement.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Ensure the app listens on port 5050 for local development
if (Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER") != "true")
{
    builder.WebHost.ConfigureKestrel(options =>
    {
        options.ListenLocalhost(5050);
    });
}

// Configuration
var configuration = builder.Configuration;

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Convert Enums to strings in JSON
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

// Configure custom validation response
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(e => e.Value?.Errors.Count > 0)
            .ToDictionary(
                kvp => kvp.Key,
                kvp => kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray()
            );

        return new BadRequestObjectResult(new
        {
            Message = "One or more validation errors occurred.",
            Errors = errors
        });
    };
});

builder.Services.AddEndpointsApiExplorer();

// Configure Swagger with JWT support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Library Management API",
        Version = "v1",
        Description = "A comprehensive library management system API"
    });

    // Add JWT authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// DbContext - Use SQL Server or SQLite based on connection string
var connectionString = configuration.GetConnectionString("DefaultConnection") 
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    // Check if running in Docker or if connection string is SQL Server
    var isDocker = Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER") == "true";
    var isSqlServer = connectionString.Contains("Server=", StringComparison.OrdinalIgnoreCase) &&
                      !connectionString.EndsWith(".db", StringComparison.OrdinalIgnoreCase);
    
    if (isDocker || isSqlServer)
    {
        // Use SQL Server for production/Docker
        options.UseSqlServer(connectionString);
    }
    else
    {
        // Use SQLite for local development
        options.UseSqlite(connectionString);
    }
});

// Jwt settings
var jwtSection = configuration.GetSection("JwtSettings");
builder.Services.Configure<JwtSettings>(jwtSection);
var jwtSettings = jwtSection.Get<JwtSettings>()!;
var key = Encoding.UTF8.GetBytes(jwtSettings.Secret);

// JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ClockSkew = TimeSpan.Zero
    };
    
    // Allow JWT from HttpOnly cookie
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            // Check if token is in cookie
            if (context.Request.Cookies.TryGetValue("jwt", out var token))
            {
                context.Token = token;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:3000",
                "http://127.0.0.1:3000"
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Register repositories
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

// Register application services
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<BookService>();
builder.Services.AddScoped<IBookService>(sp =>
{
    var innerService = sp.GetRequiredService<BookService>();
    var cache = sp.GetRequiredService<IMemoryCache>();
    var logger = sp.GetRequiredService<ILogger<CachedBookService>>();
    return new CachedBookService(innerService, cache, logger);
});
builder.Services.AddScoped<ILoanService, LoanService>();

// Add memory cache for performance
builder.Services.AddMemoryCache();

// Add background services
builder.Services.AddHostedService<RateLimitCleanupService>();

// Add logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

var app = builder.Build();

// Seed data on startup (skip in Testing environment)
if (!app.Environment.IsEnvironment("Testing"))
{
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        try
        {
            var db = services.GetRequiredService<ApplicationDbContext>();
            db.Database.EnsureCreated();
            EnsureUserLockoutColumns(db);
            LibraryManagement.API.Seed.SeedData.Initialize(db);
        }
        catch (Exception ex)
        {
            var logger = services.GetRequiredService<ILogger<Program>>();
            logger.LogError(ex, "An error occurred while seeding the database.");
        }
    }
}

// Configure middleware pipeline
app.UseMiddleware<RequestLoggingMiddleware>();
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Library Management API v1");
    });
}

// app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Only bind to port 80 when running in Docker container
if (Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER") == "true")
{
    app.Run("http://0.0.0.0:80");
}
else
{
    // Use default ports for local development (5000/5001)
    app.Run();
}

static void EnsureUserLockoutColumns(ApplicationDbContext db)
{
    var providerName = db.Database.ProviderName ?? string.Empty;

    if (!providerName.Contains("Sqlite", StringComparison.OrdinalIgnoreCase) &&
        !providerName.Contains("SqlServer", StringComparison.OrdinalIgnoreCase))
    {
        return;
    }

    using var connection = db.Database.GetDbConnection();
    if (connection.State != ConnectionState.Open)
    {
        connection.Open();
    }

    var existingColumns = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

    using (var command = connection.CreateCommand())
    {
        if (providerName.Contains("Sqlite", StringComparison.OrdinalIgnoreCase))
        {
            command.CommandText = "PRAGMA table_info('Users');";
        }
        else if (providerName.Contains("SqlServer", StringComparison.OrdinalIgnoreCase))
        {
            command.CommandText = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users';";
        }
        else
        {
            return;
        }

        using var reader = command.ExecuteReader();
        while (reader.Read())
        {
            if (providerName.Contains("Sqlite", StringComparison.OrdinalIgnoreCase))
            {
                var name = reader[1]?.ToString();
                if (!string.IsNullOrWhiteSpace(name))
                {
                    existingColumns.Add(name);
                }
            }
            else
            {
                var name = reader[0]?.ToString();
                if (!string.IsNullOrWhiteSpace(name))
                {
                    existingColumns.Add(name);
                }
            }
        }
    }

    if (providerName.Contains("Sqlite", StringComparison.OrdinalIgnoreCase))
    {
        if (!existingColumns.Contains("FailedLoginAttempts"))
        {
            using var addFailedAttempts = connection.CreateCommand();
            addFailedAttempts.CommandText = "ALTER TABLE Users ADD COLUMN FailedLoginAttempts INTEGER NOT NULL DEFAULT 0;";
            addFailedAttempts.ExecuteNonQuery();
        }

        if (!existingColumns.Contains("LockoutEndTime"))
        {
            using var addLockoutEnd = connection.CreateCommand();
            addLockoutEnd.CommandText = "ALTER TABLE Users ADD COLUMN LockoutEndTime TEXT NULL;";
            addLockoutEnd.ExecuteNonQuery();
        }
    }
    else if (providerName.Contains("SqlServer", StringComparison.OrdinalIgnoreCase))
    {
        if (!existingColumns.Contains("FailedLoginAttempts"))
        {
            using var addFailedAttempts = connection.CreateCommand();
            addFailedAttempts.CommandText = "ALTER TABLE [Users] ADD [FailedLoginAttempts] INT NOT NULL CONSTRAINT [DF_Users_FailedLoginAttempts] DEFAULT 0;";
            addFailedAttempts.ExecuteNonQuery();
        }

        if (!existingColumns.Contains("LockoutEndTime"))
        {
            using var addLockoutEnd = connection.CreateCommand();
            addLockoutEnd.CommandText = "ALTER TABLE [Users] ADD [LockoutEndTime] DATETIME2 NULL;";
            addLockoutEnd.ExecuteNonQuery();
        }
    }
}

// Make Program class accessible for integration tests
public partial class Program { }
