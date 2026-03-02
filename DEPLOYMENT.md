# Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the Library Management System to various cloud platforms.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Database Migration](#database-migration)
4. [Deployment Options](#deployment-options)
   - [Azure App Service](#azure-app-service)
   - [Railway](#railway)
   - [Render](#render)
   - [Docker Compose](#docker-compose)
5. [HTTPS Configuration](#https-configuration)
6. [Post-Deployment](#post-deployment)

## Prerequisites

- Git repository with your code
- Docker installed (for Docker deployments)
- Cloud platform account (Azure/Railway/Render)
- Domain name (optional, for custom domains)

## Environment Variables

### Backend Environment Variables

```bash
# Database
ConnectionStrings__DefaultConnection=Server=<your-server>;Database=LibraryManagement;User Id=<user>;Password=<password>;TrustServerCertificate=True

# JWT Settings
JwtSettings__Secret=<your-secret-key-minimum-32-characters>
JwtSettings__Issuer=LibraryManagementAPI
JwtSettings__Audience=LibraryManagementClient
JwtSettings__ExpirationMinutes=60

# Environment
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:80
```

### Frontend Environment Variables

```bash
VITE_API_URL=https://your-backend-api-url.com/api
```

## Database Migration

### Option 1: Automatic Migration (Code First)
The application automatically creates the database on first run using `db.Database.EnsureCreated()`.

### Option 2: Manual Migration
```bash
cd backend
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### Option 3: SQL Script
Export migration to SQL script:
```bash
dotnet ef migrations script -o migration.sql
```

## Deployment Options

### Azure App Service

#### Backend Deployment

1. **Create Azure Resources**
   ```bash
   # Login to Azure
   az login
   
   # Create resource group
   az group create --name library-rg --location eastus
   
   # Create SQL Server
   az sql server create \
     --name library-sql-server \
     --resource-group library-rg \
     --location eastus \
     --admin-user sqladmin \
     --admin-password <YourStrongPassword>
   
   # Create SQL Database
   az sql db create \
     --resource-group library-rg \
     --server library-sql-server \
     --name LibraryManagement \
     --service-objective S0
   
   # Create App Service Plan
   az appservice plan create \
     --name library-plan \
     --resource-group library-rg \
     --sku B1 \
     --is-linux
   
   # Create Web App for Backend
   az webapp create \
     --resource-group library-rg \
     --plan library-plan \
     --name library-backend-api \
     --runtime "DOTNETCORE:7.0"
   ```

2. **Configure Application Settings**
   ```bash
   az webapp config appsettings set \
     --resource-group library-rg \
     --name library-backend-api \
     --settings \
       ConnectionStrings__DefaultConnection="Server=tcp:library-sql-server.database.windows.net,1433;Database=LibraryManagement;User ID=sqladmin;Password=<password>;Encrypt=True;TrustServerCertificate=False;" \
       JwtSettings__Secret="<your-secret-key>" \
       JwtSettings__Issuer="LibraryManagementAPI" \
       JwtSettings__Audience="LibraryManagementClient" \
       JwtSettings__ExpirationMinutes="60"
   ```

3. **Deploy Backend**
   ```bash
   cd backend
   dotnet publish -c Release -o ./publish
   cd publish
   zip -r deploy.zip .
   az webapp deployment source config-zip \
     --resource-group library-rg \
     --name library-backend-api \
     --src deploy.zip
   ```

#### Frontend Deployment

1. **Create Static Web App**
   ```bash
   az staticwebapp create \
     --name library-frontend \
     --resource-group library-rg \
     --source https://github.com/<your-username>/<your-repo> \
     --location eastus \
     --branch main \
     --app-location "/frontend" \
     --output-location "dist"
   ```

2. **Configure Environment Variables**
   In Azure Portal:
   - Go to Static Web App → Configuration
   - Add application setting: `VITE_API_URL` = `https://library-backend-api.azurewebsites.net/api`

### Railway

#### Quick Deploy

1. **Backend Deployment**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Create new project
   railway init
   
   # Add PostgreSQL/MySQL database
   railway add
   
   # Set environment variables
   railway variables set ConnectionStrings__DefaultConnection="<your-connection-string>"
   railway variables set JwtSettings__Secret="<your-secret>"
   railway variables set JwtSettings__Issuer="LibraryManagementAPI"
   railway variables set JwtSettings__Audience="LibraryManagementClient"
   railway variables set JwtSettings__ExpirationMinutes="60"
   
   # Deploy
   cd backend
   railway up
   ```

2. **Frontend Deployment**
   - Create another Railway service
   - Connect GitHub repository
   - Set root directory to `/frontend`
   - Add environment variable: `VITE_API_URL`
   - Deploy automatically

#### Using Railway Dashboard

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Add PostgreSQL database service
6. Configure environment variables
7. Deploy

### Render

#### Backend Deployment

1. **Create New Web Service**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     ```
     Name: library-backend
     Environment: Docker
     Region: Choose closest
     Branch: main
     Dockerfile Path: backend/Dockerfile
     ```

2. **Add Environment Variables**
   ```
   ASPNETCORE_ENVIRONMENT=Production
   ConnectionStrings__DefaultConnection=<your-database-url>
   JwtSettings__Secret=<your-secret>
   JwtSettings__Issuer=LibraryManagementAPI
   JwtSettings__Audience=LibraryManagementClient
   JwtSettings__ExpirationMinutes=60
   ```

3. **Add PostgreSQL Database**
   - Click "New +" → "PostgreSQL"
   - Name: library-database
   - Copy internal database URL to backend environment variables

#### Frontend Deployment

1. **Create Static Site**
   - Click "New +" → "Static Site"
   - Connect GitHub repository
   - Configure:
     ```
     Name: library-frontend
     Root Directory: frontend
     Build Command: npm install && npm run build
     Publish Directory: dist
     ```

2. **Add Environment Variable**
   ```
   VITE_API_URL=https://library-backend.onrender.com/api
   ```

### Docker Compose (Self-Hosted)

#### Prerequisites
- Linux server with Docker and Docker Compose installed
- Domain name pointed to server IP
- SSH access to server

#### Deployment Steps

1. **Clone Repository**
   ```bash
   git clone https://github.com/<your-username>/<your-repo>.git
   cd <your-repo>
   ```

2. **Configure Environment**
   ```bash
   # Create .env file
   cat > .env << EOF
   SQL_SA_PASSWORD=YourStrong@Passw0rd
   JWT_SECRET=your-super-secret-key-min-32-chars
   BACKEND_URL=http://localhost:5000
   EOF
   ```

3. **Update docker-compose.yml**
   - Replace placeholder values with production credentials
   - Update connection strings
   - Configure volumes for data persistence

4. **Start Services**
   ```bash
   docker-compose up -d
   ```

5. **Verify Deployment**
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

6. **Stop Services**
   ```bash
   docker-compose down
   ```

## HTTPS Configuration

### Using Let's Encrypt with Nginx

1. **Install Certbot**
   ```bash
   sudo apt-get update
   sudo apt-get install certbot python3-certbot-nginx
   ```

2. **Obtain Certificate**
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

3. **Auto-Renewal**
   ```bash
   sudo certbot renew --dry-run
   ```

### Azure App Service
- HTTPS is automatically enabled
- Custom domain: App Service → Custom domains → Add custom domain
- SSL: App Service → TLS/SSL settings → Private Key Certificates

### Render/Railway
- Automatic HTTPS with free SSL certificates
- Custom domains supported in dashboard

## Post-Deployment

### 1. Verify Backend
```bash
curl https://your-backend-url/api/health
```

### 2. Test Authentication
```bash
curl -X POST https://your-backend-url/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123!"}'
```

### 3. Check Database Connection
- Login to admin account
- Verify data is persisting
- Test CRUD operations

### 4. Monitor Application
- Check logs for errors
- Set up monitoring (Application Insights, Datadog, etc.)
- Configure alerts

### 5. Performance Testing
```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test endpoint
ab -n 1000 -c 10 https://your-backend-url/api/books
```

### 6. Security Checklist
- [ ] HTTPS enabled
- [ ] Strong JWT secret in production
- [ ] Database credentials secured
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] SQL injection protection verified
- [ ] XSS protection headers set
- [ ] Environment variables not exposed

## Troubleshooting

### Backend Not Starting
```bash
# Check logs
docker logs library-backend
# or
kubectl logs <pod-name>

# Common issues:
# - Database connection string incorrect
# - Missing environment variables
# - Port already in use
```

### Database Connection Failed
```bash
# Test SQL Server connection
sqlcmd -S <server> -U <user> -P <password>

# Check firewall rules
# Verify connection string format
```

### Frontend Can't Connect to Backend
- Verify VITE_API_URL is correct
- Check CORS configuration in backend
- Ensure backend is accessible from frontend URL
- Check browser console for errors

## Backup and Recovery

### Database Backup
```bash
# Azure SQL
az sql db export \
  --resource-group library-rg \
  --server library-sql-server \
  --name LibraryManagement \
  --storage-key <storage-key> \
  --storage-uri https://<storage-account>.blob.core.windows.net/backups/backup.bacpac

# Docker SQL Server
docker exec library-sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "<password>" \
  -Q "BACKUP DATABASE LibraryManagement TO DISK = '/var/opt/mssql/backup/library.bak'"
```

### Restore Database
```bash
# Azure SQL
az sql db import \
  --resource-group library-rg \
  --server library-sql-server \
  --name LibraryManagement \
  --storage-key <storage-key> \
  --storage-uri https://<storage-account>.blob.core.windows.net/backups/backup.bacpac
```

## Scaling

### Horizontal Scaling (Azure)
```bash
az appservice plan update \
  --resource-group library-rg \
  --name library-plan \
  --number-of-workers 3
```

### Vertical Scaling (Azure)
```bash
az appservice plan update \
  --resource-group library-rg \
  --name library-plan \
  --sku P1V2
```

## Cost Optimization

- Use autoscaling to reduce costs during low traffic
- Choose appropriate database tier
- Enable CDN for static assets
- Implement caching strategies
- Monitor resource usage

## Support

For issues or questions:
- Check application logs
- Review GitHub issues
- Contact: your-email@example.com
