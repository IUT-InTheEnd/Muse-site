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

    return `/proxy?url=${encodeURIComponent(url)}`;
}
