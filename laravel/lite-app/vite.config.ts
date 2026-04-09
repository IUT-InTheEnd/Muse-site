import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
            buildDirectory: 'build',
        }),
        react({
            babel: { plugins: ['babel-plugin-react-compiler'] },
        }),
        tailwindcss(),
        wayfinder({ formVariants: true }),
    ],
    esbuild: { jsx: 'automatic' },
    build: {
        target: 'esnext',
        minify: 'esbuild',
        cssCodeSplit: true,
        assetsInlineLimit: 8,
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) return;

                    const p = id.replace(/\\/g, '/');

                    if (
                        p.includes('/node_modules/react/') ||
                        p.includes('/node_modules/react-dom/') ||
                        p.includes('/node_modules/scheduler/')
                    ) {
                        return 'framework';
                    }

                    if (p.includes('/node_modules/@inertiajs/')) {
                        return 'inertia';
                    }

                    if (p.includes('/node_modules/@radix-ui/')) {
                        return 'radix';
                    }

                    return 'vendor';
                },
            },
        },
    },
    server: {
        strictPort: true,
        hmr: false,
    },
    optimizeDeps: {
        include: ['react', 'react-dom', '@inertiajs/react', 'lucide-react'],
    },
});