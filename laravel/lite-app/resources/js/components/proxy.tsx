// Proxy les URLs externes pour éviter les problèmes CORS
export function proxyUrl(url: string | null | undefined): string | undefined {
    if (!url) return undefined;

    //si c'est un lien vers le freemusicarchive, on le proxifie
    if (url.includes('freemusicarchive.org')) {
        return `/proxy?url=${encodeURIComponent(url)}`;
    }

    // Proxifier les URLs externes
    else {
        return url;
    }
}
