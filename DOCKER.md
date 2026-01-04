# Docker Setup for Freelance PM

This guide will help you run the Freelance PM application using Docker Desktop on Windows.

## Prerequisites

- [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/) installed
- At least 4GB RAM available for Docker
- Git (to clone the repository)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/sokrateng/FreelanceApp.git
cd FreelanceApp
```

### 2. Configure Environment Variables

Copy the example environment file and update it with your values:

```bash
cp .env.example .env
```

**Important**: Edit `.env` and update at least these values:
- `POSTGRES_PASSWORD` - Choose a strong password
- `JWT_SECRET` - Choose a secure secret (min 32 characters)
- `EMAIL_USER` and `EMAIL_PASS` - Your Gmail credentials for sending invitations

### 3. Start the Application

Open Docker Desktop and make sure it's running. Then execute:

```bash
docker-compose up --build
```

This will:
- Build and start PostgreSQL database
- Build and start the Backend API (port 3001)
- Build and start the Frontend (port 3000)

### 4. Access the Application

Once all services are running, open your browser:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health**: http://localhost:3001/api/health

### 5. Initialize the Database

The first time you run the application, you need to create the tables:

```bash
# Run database migrations
docker-compose exec backend npm run migrate
```

### 6. Create Admin User

```bash
docker-compose exec backend node scripts/update-admin.js
```

**Default Admin Credentials:**
- Email: `admin@example.com`
- Password: `Admin123!`

⚠️ **Change the password after first login!**

## Docker Commands

### Start Services (in background)

```bash
docker-compose up -d
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Stop Services

```bash
docker-compose down
```

### Stop Services and Remove Volumes

```bash
docker-compose down -v
```

⚠️ **Warning**: This will delete all data!

### Rebuild Services

```bash
docker-compose up --build
```

### Execute Commands in Container

```bash
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend sh

# Database
docker-compose exec postgres psql -U freelancepm -d freelance_pm
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | Database username | `freelancepm` |
| `POSTGRES_PASSWORD` | Database password | `freelancepm_password` |
| `POSTGRES_DB` | Database name | `freelance_pm` |
| `JWT_SECRET` | JWT signing secret | *(required)* |
| `JWT_EXPIRES_IN` | Token expiration | `1h` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | `7d` |
| `EMAIL_HOST` | SMTP server | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | Gmail address | *(required)* |
| `EMAIL_PASS` | Gmail app password | *(required)* |
| `EMAIL_FROM` | From email address | `noreply@freelancepm.com` |

## Email Configuration (Gmail)

To send invitation emails, you need to configure Gmail:

1. Enable [2-Step Verification](https://myaccount.google.com/security) on your Google Account
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Use the App Password in `EMAIL_PASS` variable

## Troubleshooting

### Port Already in Use

If you see errors about ports 3000, 3001, or 5432 being in use:

1. Check what's using the port:
   ```bash
   netstat -ano | findstr :3000
   ```

2. Either stop the conflicting service or change the ports in `docker-compose.yml`

### Database Connection Issues

If the backend can't connect to the database:

1. Check if PostgreSQL is running:
   ```bash
   docker-compose ps
   ```

2. Check database logs:
   ```bash
   docker-compose logs postgres
   ```

3. Restart services:
   ```bash
   docker-compose restart backend
   ```

### Frontend Can't Reach Backend

1. Check if both services are running:
   ```bash
   docker-compose ps
   ```

2. Verify the network:
   ```bash
   docker network inspect freelance-network
   ```

3. Check frontend environment variable `NEXT_PUBLIC_API_URL`

### Memory Issues

If Docker is using too much memory:

1. Open Docker Desktop
2. Go to Settings → Resources
3. Increase RAM allocation (recommended: 4GB+)
4. Click "Apply & Restart"

## Production Deployment

For production deployment, consider:

1. **Change all default passwords** in `.env`
2. **Use strong JWT_SECRET** (min 32 characters)
3. **Enable HTTPS** (use reverse proxy like nginx)
4. **Set `NODE_ENV=production`** (already configured)
5. **Use managed PostgreSQL** (AWS RDS, Azure Database, etc.)
6. **Configure backup strategy** for database
7. **Monitor logs and metrics**
8. **Set up CI/CD pipeline**

## Updating the Application

When you pull changes from GitHub:

```bash
git pull origin main
docker-compose up --build
```

This will rebuild the containers with the latest code.

## Data Persistence

Database data is stored in a Docker volume named `postgres_data`. This means:
- Data persists even if you stop/restart containers
- Data is NOT deleted when you run `docker-compose down`
- Data IS deleted when you run `docker-compose down -v`

## Support

For issues or questions:
- GitHub Issues: https://github.com/sokrateng/FreelanceApp/issues
- Documentation: https://github.com/sokrateng/FreelanceApp
