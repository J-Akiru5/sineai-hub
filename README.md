# SineAI Hub

## 🚀 A Centralized Ecosystem for the Next Generation of AI Filmmakers

SineAI Hub is the official web platform for the **SineAI Guild of Western Visayas**. It is a modern, full-stack application designed to be the definitive home for AI filmmakers in the region. The platform provides a unified space for our community to connect, showcase their work, and access AI-powered tools to accelerate their creative process.

---

## ✨ Key Features

This project is being developed in phases. The long-term vision includes:

*   **Community Hub:** An interactive, real-time chatroom for members to collaborate, share techniques, and network.
*   **Creator Portfolios:** A dedicated space for registered filmmakers to upload, manage, and showcase their AI-assisted films.
*   **AI Pre-production Assistant ("Spark"):** An integrated chatbot designed to help with scriptwriting, mood boarding, and production planning.
*   **Featured Showcase:** A curated landing page that highlights the best and most innovative stories from our community.
*   **"Aetherium Fragments" Mini-Game:** A lightweight discovery game to foster daily engagement and community building.

---

## 🛠️ Technology Stack

SineAI Hub is built with a modern, scalable, and professional technology stack designed for rapid development and long-term maintainability.

*   **Backend:** **[Laravel](https://laravel.com/)** - A powerful PHP framework providing a secure and organized RESTful API.
*   **Frontend:** **[React.js](https://react.dev/)** - A leading JavaScript library for building dynamic and interactive user interfaces.
*   **The Bridge:** **[Inertia.js](https://inertiajs.com/)** - Creates a seamless, single-page application experience.
*   **Database & BaaS:** **[Supabase](https://supabase.com/)** - A PostgreSQL-based backend-as-a-service providing our database, user authentication, file storage, and real-time capabilities.

---

## 📋 Project Status

*   **Current Phase:** Phase 1 - The Core Foundation (MVP)
*   **Next Milestone:** Implement Creator Portfolio functionality (database schema, file uploads, and frontend display).

---

## ⚙️ Getting Started (Development Setup)

These are the instructions to set up the project on a local development machine.

### Prerequisites

*   PHP (version compatible with Laravel 9/10)
*   [Composer](https://getcomposer.org/)
*   [Node.js & NPM](https://nodejs.org/en)
*   A Supabase account

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/J-Akiru5/sineai-hub.git
    cd sineai-hub
    ```

2.  **Install PHP dependencies:**
    ```bash
    composer install
    ```

3.  **Install JavaScript dependencies:**
    ```bash
    npm install
    ```

4.  **Set up the environment file:**
    *   Create a copy of the example environment file:
        ```bash
        cp .env.example .env
        ```
    *   Generate a new application key:
        ```bash
        php artisan key:generate
        ```
    *   Open the `.env` file and configure your Supabase database credentials (`DB_HOST`, `DB_PASSWORD`, etc.) using the **Connection Pooler** settings.

5.  **Run the database migrations:**
    *   This will create all the necessary tables in your Supabase database.
        ```bash
        php artisan migrate
        ```

6.  **Start the development servers:**
    *   In your first terminal, start the Vite server:
        ```bash
        npm run dev
        ```
    *   In a second terminal, start the Laravel server:
        ```bash
        php artisan serve
        ```

You can now access the application at `http://127.0.0.1:8000`.

---
*This project is managed by Jeff Martinez.*