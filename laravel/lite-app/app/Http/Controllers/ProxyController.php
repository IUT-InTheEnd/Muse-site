<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ProxyController extends Controller
{
    // Domaines qu'on proxy pour éviter les problèmes de CORS
    private array $allowedDomains = [
        'freemusicarchive.org',
        'files.freemusicarchive.org',
        'artphotolimited.com',
        'bigissue.com',
        'cdn-images.dzcdn.net',
        'cdn-s-www.leprogres.fr',
        'cdn.artphotolimited.com',
        'cnews.fr',
        'concertandco.com',
        'crunchyroll.com',
        'dzcdn.net',
        'elle.fr',
        'encrypted-tbn0.gstatic.com',
        'estlink.de',
        'france3-regions.franceinfo.fr',
        'franceinfo.fr',
        'gettyimages.com',
        'googleusercontent.com',
        'gstatic.com',
        'hiphopcorner.fr',
        'i.redd.it',
        'i.scdn.co',
        'i.ytimg.com',
        'i0.wp.com',
        'images.radio-canada.ca',
        'images.squarespace-cdn.com',
        'img.lemde.fr',
        'img.nrj.fr',
        'imgsrv.crunchyroll.com',
        'intrld.com',
        'lacigale.fr',
        'lavagueparallele.com',
        'lemde.fr',
        'leprogres.fr',
        'lesvendangesmusicales.fr',
        'm.media-amazon.com',
        'media-amazon.com',
        'media.gettyimages.com',
        'media.printler.com',
        'musique.rfi.fr',
        'nrj.fr',
        'nyt.com',
        'outdoormixfestival.com',
        'printler.com',
        'ra.co',
        'radio-canada.ca',
        'radiofrance.fr',
        'redd.it',
        'resize.elle.fr',
        'rfi.fr',
        'rocknfolk.com',
        'rocksound.tv',
        'rollingstone.com',
        'rollingstone.fr',
        'scdn.co',
        'shop.rocksound.tv',
        'squarespace-cdn.com',
        'static.cnews.fr',
        'static.ra.co',
        'static01.nyt.com',
        'strapi.outdoormixfestival.com',
        'universalmusic.store',
        'upload.wikimedia.org',
        'wikimedia.org',
        'wp.com',
        'www.bigissue.com',
        'www.concertandco.com',
        'www.radiofrance.fr',
        'www.rocknfolk.com',
        'www.rollingstone.com',
        'www.rollingstone.fr',
        'yt3.googleusercontent.com',
        'ytimg.com',
    ];

    // Types de contenu autorisés
    private array $allowedContentTypes = [
        // Audio
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'audio/mp4',
        // Images
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        // JSON (pour les API)
        'application/json',
    ];

    // Placeholders par type de contenu
    private array $placeholders = [
        'audio' => [
            'path' => 'placeholders/audio-placeholder.mp3',
            'content_type' => 'audio/mpeg',
        ],
        'image' => [
            'path' => 'placeholders/image-placeholder.png',
            'content_type' => 'image/png',
        ],
    ];

    public function stream(Request $request)
    {
        // 1. Récupérer et valider l'URL
        $url = $request->query('url');

        if (! $url || ! filter_var($url, FILTER_VALIDATE_URL)) {
            return $this->returnPlaceholder($this->guessTypeFromUrl($url));
        }

        // 2. Vérifier que le domaine est autorisé
        $host = parse_url($url, PHP_URL_HOST);

        if (! in_array($host, $this->allowedDomains)) {
            return $this->returnPlaceholder($this->guessTypeFromUrl($url));
        }

        // 3. Préparer les headers à transmettre au serveur distant
        $forwardHeaders = [
            // Certains serveurs bloquent les requêtes sans User-Agent
            'User-Agent' => 'Mozilla/5.0 (compatible; LITE-Proxy/1.0)',
        ];

        // Transmettre le header Range pour le seeking audio/vidéo
        if ($request->hasHeader('Range')) {
            $forwardHeaders['Range'] = $request->header('Range');
        }

        // 4. Récupérer la ressource distante en streaming (ne charge pas le fichier en mémoire)
        try {
            $response = Http::withHeaders($forwardHeaders)
                ->withOptions([
                    'stream' => true,
                    'timeout' => 30,
                ])
                ->get($url);
        } catch (\Exception $e) {
            return $this->returnPlaceholder($this->guessTypeFromUrl($url));
        }

        $statusCode = $response->status();

        if ($statusCode >= 400) {
            return $this->returnPlaceholder($this->guessTypeFromUrl($url));
        }

        // 5. Vérifier le Content-Type
        $contentType = $response->header('Content-Type') ?? 'application/octet-stream';
        $baseContentType = trim(explode(';', $contentType)[0]);

        if (! in_array($baseContentType, $this->allowedContentTypes)) {
            return $this->returnPlaceholder($this->guessTypeFromContentType($baseContentType));
        }

        // 6. Construire les headers de réponse
        $responseHeaders = [
            'Content-Type' => $contentType,
            'Cache-Control' => 'public, max-age=86400',
            'Accept-Ranges' => 'bytes', // Indique au client qu'il peut faire du seeking
        ];

        if ($contentLength = $response->header('Content-Length')) {
            $responseHeaders['Content-Length'] = $contentLength;
        }

        // Retransmettre Content-Range pour les réponses 206 Partial Content
        if ($contentRange = $response->header('Content-Range')) {
            $responseHeaders['Content-Range'] = $contentRange;
        }

        // 7. Streamer chunk par chunk (évite de charger tout le fichier en mémoire)
        $stream = $response->toPsrResponse()->getBody();

        return response()->stream(
            function () use ($stream) {
                while (! $stream->eof()) {
                    echo $stream->read(8192);
                    flush();
                }
            },
            $statusCode,
            $responseHeaders
        );
    }

    /**
     * Retourne le placeholder selon le type
     */
    private function returnPlaceholder(string $type): \Illuminate\Http\Response
    {
        $placeholder = $this->placeholders[$type] ?? $this->placeholders['image'];
        $path = public_path($placeholder['path']);

        if (! file_exists($path)) {
            abort(404, 'Placeholder non trouvé');
        }

        return response(file_get_contents($path), 200, [
            'Content-Type' => $placeholder['content_type'],
            'Cache-Control' => 'public, max-age=3600', // Cache 1h pour les placeholders
        ]);
    }

    /**
     * Devine le type de ressource à partir de l'URL
     */
    private function guessTypeFromUrl(?string $url): string
    {
        if (! $url) {
            return 'image';
        }

        $extension = strtolower(pathinfo(parse_url($url, PHP_URL_PATH) ?? '', PATHINFO_EXTENSION));

        return match ($extension) {
            'mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac' => 'audio',
            default => 'image',
        };
    }

    /**
     * Devine le type de ressource à partir du Content-Type
     */
    private function guessTypeFromContentType(string $contentType): string
    {
        if (str_starts_with($contentType, 'audio/')) {
            return 'audio';
        }

        return 'image';
    }
}
