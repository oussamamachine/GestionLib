# Library Management API (Backend)

This is a minimal scaffold for a Library Management System backend using ASP.NET Core, EF Core and SQL Server.

Quick start (Windows, PowerShell):

1. Install .NET SDK 7.0+ from https://dotnet.microsoft.com

2. Navigate to backend folder and restore packages:

```powershell
cd backend
dotnet restore
```

3. Update the connection string in `appsettings.json` if needed.

4. Create and apply migrations (requires `dotnet-ef` tool):

```powershell
dotnet tool install --global dotnet-ef
dotnet ef migrations add Initial -p .
dotnet ef database update -p .
```

5. Run the API:

```powershell
dotnet run --project .
```

Default seeded users:
- admin / Admin123! (Admin)
- librarian / Lib123! (Librarian)
- member / Member123! (Member)

Notes & next steps:
- This scaffold uses simple password hashing (BCrypt) and JWT tokens. Replace the JWT secret before production.
- Next: implement DTOs, refine validation, add paging, unit tests, and build frontend (React + Tailwind).
