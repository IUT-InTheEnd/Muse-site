<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
class ProxyController extends Controller
{
    // Domaines autorisés
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
        'yt3.googleusercontent.com',
        'ytimg.com',
    ];

    // Contenus autorisés
    private array $allowedContentTypes = [
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'audio/mp4',

        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',

        'application/json',
    ];

    // placeholders pour les contenus qui marche pas
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

    // Proxy méthode principale
    public function stream(Request $request)
    {
        $url = $request->query('url');

        if (! $url || ! filter_var($url, FILTER_VALIDATE_URL)) {
            return $this->returnPlaceholder($this->guessTypeFromUrl($url));
        }

        $host = parse_url($url, PHP_URL_HOST);

        if (! $host || ! $this->isAllowedDomain($host)) {
            return $this->returnPlaceholder($this->guessTypeFromUrl($url));
        }

        $forwardHeaders = [
            'User-Agent' => 'Mozilla/5.0 (compatible; LITE-Proxy/1.0)',
        ];

        // Support du seeking audio
        if ($request->hasHeader('Range')) {
            $forwardHeaders['Range'] = $request->header('Range');
        }

        try {
            $response = Http::withHeaders($forwardHeaders)
                ->retry(2, 200)
                ->withOptions([
                    'stream' => true,
                    'connect_timeout' => 5,
                    'timeout' => 30,
                ])
                ->get($url);
        } catch (\Exception $e) {
            Log::warning('Proxy request failed', [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);

            return $this->returnPlaceholder($this->guessTypeFromUrl($url));
        }

        $statusCode = $response->status();

        if ($statusCode >= 400) {
            return $this->returnPlaceholder($this->guessTypeFromUrl($url));
        }

        $contentType = $response->header('Content-Type') ?? 'application/octet-stream';
        $baseContentType = trim(explode(';', $contentType)[0]);

        if (! in_array($baseContentType, $this->allowedContentTypes)) {
            return $this->returnPlaceholder(
                $this->guessTypeFromContentType($baseContentType)
            );
        }

        $responseHeaders = [
            'Content-Type' => $contentType,
            'Cache-Control' => 'public, max-age=86400, stale-while-revalidate=604800',
            'Accept-Ranges' => 'bytes',
        ];

        if ($length = $response->header('Content-Length')) {
            $responseHeaders['Content-Length'] = $length;
        }

        if ($range = $response->header('Content-Range')) {
            $responseHeaders['Content-Range'] = $range;
        }

        // HEAD request (optimisation)
        if ($request->isMethod('HEAD')) {
            return response('', $statusCode, $responseHeaders);
        }

        $stream = $response->toPsrResponse()->getBody();

        return response()->stream(
            function () use ($stream) {
                while (! $stream->eof()) {

                    echo $stream->read(65536);

                    if (ob_get_level() > 0) {
                        ob_flush();
                    }

                    flush();
                }
            },
            $statusCode,
            $responseHeaders
        );
    }

    // Verifie si le domaine est autorise (exact ou sous-domaine)
    private function isAllowedDomain(string $host): bool
    {
        foreach ($this->allowedDomains as $domain) {

            if ($host === $domain || str_ends_with($host, '.'.$domain)) {
                return true;
            }
        }

        return false;
    }

    // Retourne un placeholder selon le type (audio ou image)
    private function returnPlaceholder(string $type): BinaryFileResponse
    {
        $placeholder = $this->placeholders[$type] ?? $this->placeholders['image'];
        $path = public_path($placeholder['path']);

        if (! file_exists($path)) {
            abort(404, 'Placeholder non trouvé');
        }

        return response()->file($path, [
            'Content-Type' => $placeholder['content_type'],
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }

    // Trouve le type selon l'extension
    private function guessTypeFromUrl(?string $url): string
    {
        if (! $url) {
            return 'image';
        }

        $extension = strtolower(
            pathinfo(parse_url($url, PHP_URL_PATH) ?? '', PATHINFO_EXTENSION)
        );

        return match ($extension) {
            'mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac' => 'audio',
            default => 'image',
        };
    }

    // Trouve le type selon le content-type
    private function guessTypeFromContentType(string $contentType): string
    {
        if (str_starts_with($contentType, 'audio/')) {
            return 'audio';
        }

        return 'image';
    }
}
