// Proxy les URLs externes pour éviter les problèmes CORS
export function proxyUrl(url: string | null | undefined): string | undefined {
    if (!url) return undefined;

    const isAbsoluteUrl = /^https?:\/\//i.test(url);
    if (!isAbsoluteUrl) {
        return url;
    }

    const parsedUrl = (() => {
        try {
            return new URL(url);
        } catch {
            return null;
        }
    })();

    if (!parsedUrl) {
        return url;
    }

    if (typeof window !== 'undefined' && parsedUrl.origin === window.location.origin) {
        return url;
    }

    const pathname = parsedUrl.pathname.toLowerCase();

    const isAudioUrl = /\.(mp3|wav|ogg|m4a)$/i.test(pathname);

    if (isAudioUrl || url.includes('freemusicarchive.org')) {
        return `/proxy?url=${encodeURIComponent(url)}`;
    }

    return url;
}
