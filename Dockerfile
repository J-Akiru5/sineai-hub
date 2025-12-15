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
    ffmpeg \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_pgsql mbstring exif pcntl bcmath gd

# Configure PHP for large file uploads (500MB max)
RUN echo "upload_max_filesize = 512M" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "post_max_size = 520M" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "memory_limit = 1024M" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "max_execution_time = 600" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "max_input_time = 600" >> /usr/local/etc/php/conf.d/uploads.ini

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

# Configure Nginx to serve the Laravel public directory with large file upload support
RUN mkdir -p /var/www/public
RUN rm -f /etc/nginx/conf.d/default.conf
RUN cat > /etc/nginx/conf.d/default.conf <<'EOF'
server {
    listen 8000;
    server_name _;
    root /var/www/public;

    # Allow large file uploads (512MB)
    client_max_body_size 512M;
    client_body_timeout 600s;
    client_body_buffer_size 128k;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php index.html;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_read_timeout 600;
        fastcgi_send_timeout 600;
    }

    location ~ /\.ht {
        deny all;
    }
}
EOF

# Supervisor config: run php-fpm and nginx together
COPY docker/supervisord.conf /etc/supervisor/supervisord.conf

# Expose HTTP port for the DigitalOcean App Platform
EXPOSE 8000

# Start supervisord which manages nginx and php-fpm
CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/supervisord.conf"]