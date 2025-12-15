#!/bin/bash
set -e

# Create storage directories if they don't exist
mkdir -p /var/www/storage/app/public
mkdir -p /var/www/storage/framework/cache
mkdir -p /var/www/storage/framework/sessions
mkdir -p /var/www/storage/framework/views
mkdir -p /var/www/storage/logs
mkdir -p /var/www/bootstrap/cache

# Set permissions
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Generate app key if not set
if [ -z "$APP_KEY" ]; then
    echo "Warning: APP_KEY not set, generating one..."
    php artisan key:generate --force
fi

# Clear and cache configs for production
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Run migrations (optional, controlled by env var)
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "Running migrations..."
    php artisan migrate --force
fi

# Create storage symlink
php artisan storage:link --force 2>/dev/null || true

echo "Starting supervisord..."
exec /usr/bin/supervisord -n -c /etc/supervisor/supervisord.conf
