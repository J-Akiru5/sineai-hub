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

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libpq-dev \
    nodejs \
    npm

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_pgsql mbstring exif pcntl bcmath gd

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy backend files
COPY . .

# Copy built frontend assets from Stage 1
COPY --from=frontend /app/public/build public/build
COPY --from=frontend /app/public/build/manifest.json public/build/manifest.json

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Set permissions
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Expose port 8000 and start server
EXPOSE 8000
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=8000