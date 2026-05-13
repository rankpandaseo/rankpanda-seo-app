# Deployment Guide — RankPanda SEO App

## VPS Specifications

- **Host:** Hostinger
- **IP:** 76.13.58.79
- **Domain:** app.rankpanda.cloud
- **OS:** Ubuntu 22.04 LTS
- **SSH Key:** Configured (no password auth)

## Prerequisites

1. **Docker & Docker Compose** installed on VPS
2. **Nginx** for reverse proxy + SSL
3. **PostgreSQL** running in container
4. **Environment variables** configured

## Step 1: VPS Setup (First Time Only)

### SSH into VPS

```bash
ssh root@76.13.58.79
```

### Install Docker

```bash
apt update
apt install -y docker.io docker-compose
systemctl enable docker
systemctl start docker
```

### Install Nginx & Certbot

```bash
apt install -y nginx certbot python3-certbot-nginx
```

### Clone Repository

```bash
cd /opt
git clone https://github.com/rankpandaseo/rankpanda-seo-app.git rankpanda-app
cd rankpanda-app
```

### Configure Environment

```bash
# Copy .env.example and fill in production values
cp .env.example .env.prod

# Edit with secure values
nano .env.prod
# Required variables:
# DATABASE_URL=postgresql://rankpanda_prod:STRONG_PASSWORD@postgres:5432/rankpanda_prod
# SESSION_SECRET=RANDOM_64_CHAR_KEY
```

### Create Nginx Configuration

Create `/etc/nginx/sites-available/rankpanda-app`:

```nginx
upstream rankpanda_app {
  server localhost:3000;
}

server {
  listen 80;
  server_name app.rankpanda.cloud;
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name app.rankpanda.cloud;

  ssl_certificate /etc/letsencrypt/live/app.rankpanda.cloud/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/app.rankpanda.cloud/privkey.pem;

  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers on;

  location / {
    proxy_pass http://rankpanda_app;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location /api/health {
    access_log off;
    proxy_pass http://rankpanda_app;
  }
}
```

Enable and test:

```bash
ln -s /etc/nginx/sites-available/rankpanda-app /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Get SSL Certificate

```bash
certbot certonly --nginx -d app.rankpanda.cloud
# Choose option 1 (standalone) if above fails
```

### Create Backup Script

Create `/opt/rankpanda-app/scripts/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups"
DB_NAME="rankpanda_prod"
DB_USER="rankpanda_prod"

mkdir -p $BACKUP_DIR

# Backup database
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/rankpanda_$(date +%Y-%m-%d_%H-%M-%S).sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "rankpanda_*.sql.gz" -mtime +7 -delete

echo "Backup completed at $(date)"
```

Enable backup cron:

```bash
chmod +x /opt/rankpanda-app/scripts/backup.sh
# Add to crontab:
# 0 2 * * * /opt/rankpanda-app/scripts/backup.sh
```

## Step 2: Deploy Application

### Option A: Automated Deploy Script

```bash
cd /opt/rankpanda-app
chmod +x scripts/deploy.sh
./scripts/deploy.sh production
```

### Option B: Manual Deploy

```bash
cd /opt/rankpanda-app

# Build Docker images
docker-compose -f docker-compose.prod.yml build

# Start containers
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec -T app npx prisma migrate deploy

# Verify
curl https://app.rankpanda.cloud/api/health
```

## Step 3: Verify Deployment

### Health Check

```bash
curl https://app.rankpanda.cloud/api/health
# Response: {"status":"ok","timestamp":"2026-05-13T...Z"}
```

### Test Signup Flow

```bash
curl -X POST https://app.rankpanda.cloud/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","confirmPassword":"testpass123"}'
```

### View Logs

```bash
docker-compose -f docker-compose.prod.yml logs -f app
docker-compose -f docker-compose.prod.yml logs -f postgres
```

## Monitoring

### Health Check Endpoint

Automatically checked every 30 seconds by Docker.

### Manual Monitoring

```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# Check disk space
df -h

# Check logs for errors
docker-compose -f docker-compose.prod.yml logs app | tail -50
```

## Backup & Restore

### Backup

```bash
/opt/rankpanda-app/scripts/backup.sh
ls -lh /backups/
```

### Restore

```bash
BACKUP_FILE="/backups/rankpanda_2026-05-13_02-00-00.sql.gz"
gunzip < $BACKUP_FILE | docker-compose -f docker-compose.prod.yml exec -T postgres psql -U rankpanda_prod rankpanda_prod
```

## Troubleshooting

### Port Already in Use

```bash
lsof -i :3000  # Find process
kill -9 PID    # Kill it
```

### Database Connection Error

```bash
# Check if postgres is healthy
docker-compose -f docker-compose.prod.yml ps

# View postgres logs
docker-compose -f docker-compose.prod.yml logs postgres

# Restart postgres
docker-compose -f docker-compose.prod.yml restart postgres
```

### Nginx SSL Certificate Issues

```bash
certbot renew --dry-run  # Test renewal
certbot renew            # Force renewal
systemctl restart nginx
```

### Application Crashes

```bash
# View error logs
docker-compose -f docker-compose.prod.yml logs app -n 100

# Restart application
docker-compose -f docker-compose.prod.yml restart app

# Check Prisma schema
docker-compose -f docker-compose.prod.yml exec -T app npx prisma db push
```

## Maintenance

### Update Application

```bash
cd /opt/rankpanda-app
git pull origin main
./scripts/deploy.sh production
```

### Database Migrations

Migrations run automatically on deploy. To manually run:

```bash
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
```

### SSL Certificate Renewal

Certbot automatically renews 30 days before expiration. Monitor:

```bash
certbot renew --dry-run
```

## Environment Variables

Required for production:

```env
NODE_ENV=production
DATABASE_URL=postgresql://rankpanda_prod:PASSWORD@postgres:5432/rankpanda_prod
SESSION_SECRET=RANDOM_64_CHARACTER_KEY
PORT=3000
```

Store securely — never in Git.

## Performance Tuning

### Database Optimization

```bash
# Connect to postgres
docker-compose -f docker-compose.prod.yml exec postgres psql -U rankpanda_prod rankpanda_prod

# View indexes
\d keywords

# Analyze query performance
ANALYZE;
```

### Nginx Caching

Add to Nginx config for static assets:

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
```

## Security Checklist

- [ ] SSH key-based auth only (no passwords)
- [ ] Firewall configured (ufw)
- [ ] HTTPS enforced (redirect HTTP → HTTPS)
- [ ] Database password is strong (20+ chars)
- [ ] SESSION_SECRET is random (64+ chars)
- [ ] Secrets not in .git history
- [ ] Regular backups (7-day retention minimum)
- [ ] Monitoring/alerting configured

## Support

For issues, check:

1. Docker container logs: `docker-compose logs app`
2. Nginx logs: `/var/log/nginx/error.log`
3. Database health: `docker-compose ps`
4. Memory/disk: `df -h` and `free -h`

Contact: support@rankpanda.pt
