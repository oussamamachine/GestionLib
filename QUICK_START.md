# 🚀 Quick Reference Guide

## Starting the Application

### Option 1: Automated Start
```bash
# Run setup first time only
setup.bat

# Then use this to start both services
start.bat
```

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
dotnet run
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Access URLs

- **Frontend**: http://localhost:5173
- **Backend API**: https://localhost:5001
- **Swagger Docs**: https://localhost:5001/swagger

## Demo Accounts

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Librarian | librarian | librarian123 |
| Member | member | member123 |

## Common Commands

### Backend
```bash
# Restore packages
dotnet restore

# Run application
dotnet run

# Build for production
dotnet publish -c Release

# Run migrations
dotnet ef migrations add MigrationName
dotnet ef database update
```

### Frontend
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## API Testing (Swagger)

1. Open: https://localhost:5001/swagger
2. Login via `/api/auth/login`
3. Copy the token from response
4. Click "Authorize" button at top
5. Paste token in format: `Bearer YOUR_TOKEN_HERE`
6. Test all endpoints

## Quick Feature Test

### As Admin
1. Login with admin credentials
2. Navigate to Users tab → View all users
3. Navigate to Books tab → Add a new book
4. Navigate to Loans tab → Create a loan
5. Test book return functionality

### As Librarian
1. Login with librarian credentials
2. Add/Edit books
3. Create and manage loans
4. Process book returns

### As Member
1. Login with member credentials
2. Browse available books
3. View "My Loans" tab
4. Return a borrowed book

## Troubleshooting

### Backend Issues

**Database Connection Error**
```json
// Update in backend/appsettings.json
"ConnectionStrings": {
  "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=LibraryManagementDb;Trusted_Connection=True;"
}
```

**Port Already in Use**
```bash
# Change port in backend/Properties/launchSettings.json
# Or kill existing process
```

**JWT Secret Error**
```json
// Ensure JWT secret is configured in backend/appsettings.json
"JwtSettings": {
  "Secret": "YourSecretKeyHere"
}
```

### Frontend Issues

**API Connection Failed**
```env
# Check frontend/.env file
VITE_API_URL=https://localhost:5001/api
```

**CORS Error**
- Verify backend is running
- Check CORS configuration in backend/Program.cs
- Ensure frontend URL is in AllowedOrigins

**Token Expired**
```javascript
// Clear browser localStorage
localStorage.clear()
// Then login again
```

**npm install fails**
```bash
# Clear npm cache
npm cache clean --force
# Delete node_modules
rm -rf node_modules
# Reinstall
npm install
```

## File Structure

### Backend Key Files
```
backend/
├── Program.cs                 # App configuration
├── appsettings.json          # Configuration
├── Controllers/              # API endpoints
├── Services/                 # Business logic
├── Repositories/             # Data access
└── Domain/Entities/          # Data models
```

### Frontend Key Files
```
frontend/
├── src/
│   ├── App.jsx              # Main app & routing
│   ├── main.jsx             # Entry point
│   ├── components/          # Reusable components
│   ├── pages/               # Page components
│   ├── contexts/            # React contexts
│   └── services/api.js      # API configuration
├── .env                     # Environment config
└── package.json             # Dependencies
```

## Environment Variables

### Backend (appsettings.json)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "YOUR_DB_CONNECTION"
  },
  "JwtSettings": {
    "Secret": "YOUR_JWT_SECRET",
    "ExpiryMinutes": 60
  }
}
```

### Frontend (.env)
```env
VITE_API_URL=https://localhost:5001/api
```

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors  
- [ ] Swagger documentation loads
- [ ] Can login with all 3 roles
- [ ] Can create a book (Admin/Librarian)
- [ ] Can create a loan (Admin/Librarian)
- [ ] Can return a book (All roles)
- [ ] Can view users (Admin only)
- [ ] Member sees only their loans
- [ ] Toast notifications appear
- [ ] Forms validate correctly
- [ ] Loading spinners show
- [ ] Responsive on mobile

## Git Commands

```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Enhanced library management system"

# Add remote
git remote add origin YOUR_REPO_URL

# Push to remote
git push -u origin main
```

## Production Deployment

### Backend
```bash
cd backend
dotnet publish -c Release -o ./publish
# Deploy contents of ./publish to server
```

### Frontend
```bash
cd frontend
npm run build
# Deploy contents of ./dist to web server
```

## Performance Tips

### Backend
- Enable response compression
- Add caching for frequent queries
- Use async/await consistently
- Implement pagination for large datasets

### Frontend
- Use React.memo for expensive components
- Implement virtual scrolling for large lists
- Lazy load routes
- Optimize images

## Security Checklist

- [x] Passwords are hashed with BCrypt
- [x] JWT tokens are used for authentication
- [x] Role-based authorization is implemented
- [x] CORS is properly configured
- [x] Input validation on both frontend and backend
- [x] SQL injection prevented by EF Core
- [x] XSS prevented by React

## Browser DevTools Tips

### Check API Calls
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Watch API requests/responses

### Check Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors or warnings

### Check Local Storage
1. Open DevTools (F12)
2. Go to Application tab
3. Look under Storage → Local Storage
4. View token and user data

## VS Code Extensions (Recommended)

- C# (ms-dotnettools.csharp)
- Prettier (esbenp.prettier-vscode)
- ESLint (dbaeumer.vscode-eslint)
- Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)
- ES7+ React Snippets (dsznajder.es7-react-js-snippets)

## Keyboard Shortcuts

### VS Code
- `Ctrl + P` - Quick file open
- `Ctrl + Shift + P` - Command palette
- `F5` - Start debugging
- `Ctrl + ~` - Toggle terminal

### Browser
- `F12` - Open DevTools
- `Ctrl + Shift + R` - Hard refresh
- `Ctrl + Shift + C` - Inspect element

## Support & Resources

- Main README: `README.md`
- Backend Guide: `backend/README.md`
- Frontend Guide: `frontend/README.md`
- Enhancement Details: `ENHANCEMENTS.md`
- Swagger Docs: https://localhost:5001/swagger

---

**Remember**: Always run backend before frontend, and ensure database is accessible!
