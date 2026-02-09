// Proxy les URLs externes pour éviter les problèmes CORS
export function proxyUrl(url: string | null | undefined): string | undefined {
    if (!url) return undefined;
    // Si c'est déjà une URL locale, ne pas proxifier
    if (url.startsWith('/') || url.startsWith(window.location.origin)) {
        return url;
    }
    // Proxifier les URLs externes
    return `/proxy?url=${encodeURIComponent(url)}`;
}
