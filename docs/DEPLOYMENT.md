# Production Deployment Guide

## Overview

This guide covers deploying Phase 1 to **Hostinger VPS (76.13.58.79)** running **Ubuntu 22.04 LTS**.

## Prerequisites

- VPS access (SSH key-based authentication)
- Docker + Docker Compose installed on VPS
- Domain `app.rankpanda.cloud` DNS pointed to VPS IP
- Git access to repository
- GitHub Secrets configured for CD deployment

## Architecture

```
User → HTTPS (Let's Encrypt SSL) → Nginx Proxy → Docker Container (Node.js 3000)
                                                        ↓
                                                  PostgreSQL 16 (5432)
```

## Step-by-Step Deployment

### 1. Prepare Environment Variables

**Locally, create `.env.prod`:**

```bash
# Generate secure SESSION_SECRET (min 32 chars)
openssl rand -base64 32

# Create .env.prod with:
DATABASE_URL=postgresql://rankpanda_prod:STRONG_PASSWORD@postgres:5432/rankpanda_prod
SESSION_SECRET=<generated_above>
NODE_ENV=production
PORT=3000
```

**Add to GitHub Secrets:**

Go to repository Settings → Secrets and variables → Actions

- `DATABASE_URL` = `postgresql://rankpanda_prod:STRONG_PASSWORD@postgres:5432/rankpanda_prod`
- `SESSION_SECRET` = `<generated>`
- `NODE_ENV` = `production`

### 2. SSH to VPS and Clone Repository

```bash
ssh root@76.13.58.79

# Create app directory
mkdir -p /opt/rankpanda-app
cd /opt/rankpanda-app

# Clone repository
git clone https://github.com/rankpandaseo/rankpanda-seo-app.git .
```

### 3. Build Docker Image (on VPS)

```bash
cd /opt/rankpanda-app

# Create .env from GitHub Secrets (manually or via CI/CD)
cat > .env << EOF
DATABASE_URL=postgresql://rankpanda_prod:$(openssl rand -base64 16)@postgres:5432/rankpanda_prod
SESSION_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
PORT=3000
EOF

# Build and start containers
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Run Database Migrations

```bash
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
```

### 5. Configure Nginx Reverse Proxy

**Create `/etc/nginx/sites-available/rankpanda-app`:**

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

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/app.rankpanda.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.rankpanda.cloud/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Proxy settings
    location / {
        proxy_pass http://rankpanda_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

**Enable and reload:**

```bash
ln -s /etc/nginx/sites-available/rankpanda-app /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 6. Set Up SSL Certificate (Let's Encrypt)

```bash
apt-get install certbot python3-certbot-nginx

certbot certonly --nginx -d app.rankpanda.cloud
# Follow prompts to verify domain ownership
```

### 7. Verify Deployment

```bash
# Health check
curl -I https://app.rankpanda.cloud

# Check containers
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f app
```

### 8. Smoke Test (via Browser)

1. Visit `https://app.rankpanda.cloud`
2. Click "Sign Up"
3. Create account (test@example.com / password)
4. Dashboard should load
5. Test CSV upload (if available)
6. Logout
7. Login again with same credentials

## Backup Strategy

**Daily automated backups:**

```bash
# Create backup script at /usr/local/bin/rankpanda-backup.sh
#!/bin/bash
BACKUP_DIR="/backups/rankpanda-app"
mkdir -p $BACKUP_DIR
docker-compose -f /opt/rankpanda-app/docker-compose.prod.yml exec -T postgres \
  pg_dump -U rankpanda_prod rankpanda_prod | \
  gzip > $BACKUP_DIR/rankpanda_$(date +%Y%m%d_%H%M%S).sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

**Add to crontab:**

```bash
0 2 * * * /usr/local/bin/rankpanda-backup.sh
```

## Monitoring & Logs

```bash
# Application logs
docker-compose -f docker-compose.prod.yml logs -f app

# Database logs
docker-compose -f docker-compose.prod.yml logs -f postgres

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Rollback Procedure

If deployment fails:

```bash
# Stop current containers
docker-compose -f docker-compose.prod.yml down

# Restore from backup
gunzip < /backups/rankpanda-app/rankpanda_YYYYMMDD_HHMMSS.sql.gz | \
  docker-compose -f docker-compose.prod.yml exec -T postgres \
  psql -U rankpanda_prod rankpanda_prod

# Checkout previous commit
git checkout <previous_commit_hash>

# Rebuild and restart
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

## Security Checklist

- [ ] SESSION_SECRET is ≥32 random characters
- [ ] DB_PASSWORD is strong (16+ chars, mixed case/numbers/symbols)
- [ ] HTTPS enforced (80 → 443 redirect)
- [ ] Security headers in Nginx configured
- [ ] Database backups encrypted and stored securely
- [ ] VPS firewall allows only ports 80, 443, 22
- [ ] SSH key-based auth only (no password auth)
- [ ] Monitor logs for suspicious activity
- [ ] System packages updated (`apt update && apt upgrade`)
- [ ] Enable fail2ban for SSH brute-force protection

## Troubleshooting

**Container won't start:**
```bash
docker-compose -f docker-compose.prod.yml logs app
```

**Database connection failed:**
```bash
docker-compose -f docker-compose.prod.yml exec app \
  psql postgresql://rankpanda_prod:$DB_PASSWORD@postgres:5432/rankpanda_prod -c "SELECT 1"
```

**HTTPS not working:**
```bash
certbot certificates
certbot renew --dry-run
```

**High memory usage:**
```bash
docker stats rankpanda_app_prod
# If needed, limit memory in docker-compose.prod.yml
```

## Maintenance Schedule

### Weekly
- Review application logs for errors
- Verify backup completion
- Check SSL certificate expiry (certbot auto-renews)

### Monthly
- Review database performance
- Update system packages

### Quarterly
- Performance benchmarking
- Security audit
- Database optimization (VACUUM, ANALYZE)

---

**Status:** Production-Ready | **Version:** 1.0 | **Last Updated:** 2026-05-13
