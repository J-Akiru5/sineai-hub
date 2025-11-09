import './bootstrap';
import '../css/app.css';
import 'aos/dist/aos.css';
import AOS from 'aos';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const appName = window.document.getElementsByTagName('title')[0]?.innerText || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);

        // Initialize AOS for scroll animations (matches nefa template usage)
        try {
            // Unified animation rhythm: slightly longer duration, smooth easing, and offset to trigger a bit earlier
            AOS.init({ duration: 800, easing: 'ease-out-cubic', once: true, disable: 'phone', offset: 120 });
        } catch (e) {
            // ignore if AOS isn't installed yet
            // console.warn('AOS init failed', e);
        }
    },
    progress: {
        color: '#4B5563',
    },
});
