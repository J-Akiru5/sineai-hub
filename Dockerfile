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

# Configure Nginx to serve the Laravel public directory and pass PHP to php-fpm
RUN mkdir -p /var/www/public
RUN rm -f /etc/nginx/conf.d/default.conf
RUN bash -c 'cat > /etc/nginx/conf.d/default.conf <<"EOF"\nserver {\n    listen 80;\n    server_name _;\n    root /var/www/public;\n\n    add_header X-Frame-Options "SAMEORIGIN";\n    add_header X-Content-Type-Options "nosniff";\n\n    index index.php index.html;\n\n    charset utf-8;\n\n    location / {\n        try_files $uri $uri/ /index.php?$query_string;\n    }\n\n    location ~ \.php$ {\n        fastcgi_pass 127.0.0.1:9000;\n        fastcgi_index index.php;\n        include fastcgi_params;\n        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;\n        fastcgi_split_path_info ^(.+\\.php)(/.+)$;\n    }\n\n    location ~ /\.ht {\n        deny all;\n    }\n}\nEOF'

# Supervisor config: run php-fpm and nginx together
RUN bash -c 'cat > /etc/supervisor/conf.d/supervisord.conf <<"EOF"\n[supervisord]\n nodaemon=true\n\n[program:php-fpm]\ncommand=php-fpm -F\nautostart=true\nautorestart=true\npriority=10\nredirect_stderr=true\nstdout_logfile=/dev/fd/1\nstdout_logfile_maxbytes=0\n\n[program:nginx]\ncommand=/usr/sbin/nginx -g "daemon off;"\nautostart=true\nautorestart=true\npriority=20\nredirect_stderr=true\nstdout_logfile=/dev/fd/1\nstdout_logfile_maxbytes=0\nEOF'

# Expose HTTP port for the DigitalOcean App Platform
EXPOSE 80

# Start supervisord which manages nginx and php-fpm
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]