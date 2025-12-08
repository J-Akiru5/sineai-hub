const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
    // use the 'class' strategy so toggling the 'dark' class on <html> controls dark mode
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                'sineai-red-700': '#991b1b',
                'sineai-red-600': '#b91c1c',
                'sineai-red-900': '#7f1d1d',
                'sineai-gold': '#f59e0b',
            },
            boxShadow: {
                'sineai-lg': '0 10px 25px -8px rgba(153,27,27,0.35)',
            },
        },
    },

    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
    ],
};
