# Stage 1: Build the Frontend Assets (React/Vite)
FROM node:20 as frontend
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install node dependencies
RUN npm install

# Copy ALL project files (Config files, resources, etc.)
# The .dockerignore file will prevent node_modules from being copied
COPY . .

# Build the assets
RUN npm run build

# Stage 2: Build the Backend (Laravel)
FROM php:8.2-fpm

# Install system dependencies needed for PHP extensions and composer
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libpq-dev \
    nginx \
    supervisor \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_pgsql mbstring exif pcntl bcmath gd

# Install Composer binary from official image
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy composer files first to leverage Docker cache
COPY composer.json composer.lock ./

# Install PHP dependencies without running scripts (artisan doesn't exist yet)
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-progress --no-scripts

# Copy application files
COPY . .

# Copy built frontend assets from Stage 1
COPY --from=frontend /app/public/build public/build
COPY --from=frontend /app/public/build/manifest.json public/build/manifest.json

# Now run composer scripts (artisan exists now)
RUN composer dump-autoload --optimize && php artisan package:discover --ansi

# Ensure appropriate permissions for runtime
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache || true

# Copy nginx and supervisor config files
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose HTTP port for the DigitalOcean App Platform
EXPOSE 8000

# Start supervisord which manages nginx and php-fpm
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]