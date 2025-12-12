import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    // ADD THIS SECTION
    optimizeDeps: {
        include: [
            '@tiptap/react',
            '@tiptap/starter-kit',
            '@tiptap/extension-placeholder',
            '@tiptap/pm/state',
            '@tiptap/pm/view',
            '@tiptap/pm/model',
            '@tiptap/pm/transform',
        ],
    },
});