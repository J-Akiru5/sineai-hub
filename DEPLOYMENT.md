# SineAI Hub - Deployment Guide

## DigitalOcean App Platform Deployment

### Prerequisites
1. DigitalOcean account with App Platform access
2. GitHub repository connected to DigitalOcean
3. DigitalOcean Spaces bucket configured
4. PostgreSQL and Redis database (included in App Platform)

### Environment Variables

Set these environment variables in your DigitalOcean App:

#### Application Settings
```
APP_NAME=SineAI Hub
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-app-domain.ondigitalocean.app
APP_KEY=base64:... (generate with: php artisan key:generate --show)
```

#### Database
```
DB_CONNECTION=pgsql
DATABASE_URL=${db.DATABASE_URL}  # Auto-injected by App Platform
```

#### Cache & Sessions
```
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
REDIS_URL=${redis.REDIS_URL}  # Auto-injected by App Platform
```

#### DigitalOcean Spaces (File Storage)
```
FILESYSTEM_DISK=do_spaces
DO_SPACES_KEY=your-spaces-key
DO_SPACES_SECRET=your-spaces-secret
DO_SPACES_ENDPOINT=https://sgp1.digitaloceanspaces.com
DO_SPACES_REGION=sgp1
DO_SPACES_BUCKET=your-bucket-name
DO_SPACES_CDN=https://your-bucket.sgp1.cdn.digitaloceanspaces.com
```

#### Supabase (Real-time features)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Deployment Steps

#### 1. Using App Platform UI
1. Go to DigitalOcean App Platform
2. Create New App
3. Connect your GitHub repository
4. Select the `main` branch
5. Configure build commands:
   ```bash
   composer install --no-dev --optimize-autoloader
   npm ci && npm run build
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```
6. Set run command: `heroku-php-apache2 public/`
7. Add environment variables
8. Deploy!

#### 2. Using doctl CLI
```bash
# Install doctl
# https://docs.digitalocean.com/reference/doctl/how-to/install/

# Authenticate
doctl auth init

# Deploy using app spec
doctl apps create --spec .do/app.yaml
```

### Post-Deployment

#### Run Migrations
```bash
# Via App Platform Console or SSH
php artisan migrate --force
```

#### Seed Database (if needed)
```bash
php artisan db:seed --force
```

#### Clear Caches (if issues)
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### Setting Up DigitalOcean Spaces

1. Create a Space in your preferred region
2. Create Spaces access keys (Settings → API → Spaces Keys)
3. Configure CORS if needed:
```json
[
  {
    "AllowedOrigins": ["https://your-app-domain.ondigitalocean.app"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

4. Enable CDN for faster file delivery

### Production Checklist

- [ ] SSL/HTTPS enabled (automatic with App Platform)
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Storage permissions configured
- [ ] Queue worker running (for background jobs)
- [ ] Error logging configured (Sentry, etc.)
- [ ] Backup schedule configured
- [ ] Monitoring/alerts set up

### Scaling

#### Horizontal Scaling
- Increase `instance_count` in app.yaml
- App Platform auto-balances traffic

#### Vertical Scaling
- Upgrade `instance_size_slug`:
  - `basic-xxs`: 512MB RAM, shared CPU
  - `basic-xs`: 1GB RAM, shared CPU
  - `basic-s`: 2GB RAM, shared CPU
  - `professional-xs`: 1GB RAM, dedicated CPU
  - etc.

### Troubleshooting

#### View Logs
```bash
doctl apps logs <app-id> --type=run
```

#### SSH into Container
Not available on App Platform. Use Console tab in UI or build-time debugging.

#### Common Issues

1. **500 errors**: Check APP_KEY is set and matches
2. **Database errors**: Verify DATABASE_URL is correct
3. **File upload issues**: Check Spaces credentials
4. **Session issues**: Verify REDIS_URL is correct
5. **Build failures**: Check composer.json and package.json

### Alternative: Droplet Deployment

For more control, deploy to a DigitalOcean Droplet:

1. Create Ubuntu 22.04 droplet
2. Install LEMP stack (nginx, PHP 8.2, PostgreSQL)
3. Configure nginx virtual host
4. Clone repository
5. Run composer and npm
6. Configure environment
7. Set up supervisor for queue workers
8. Configure Let's Encrypt SSL

See Laravel deployment docs: https://laravel.com/docs/deployment
