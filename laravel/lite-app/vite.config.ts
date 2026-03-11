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
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        return 'vendor';
                    }
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
