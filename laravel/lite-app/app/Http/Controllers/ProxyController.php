<?php

namespace App\Http\Controllers;

use App\Services\ProxyMedia\ProxyMediaCacheService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ProxyController extends Controller
{
    private array $allowedDomains = [
        'freemusicarchive.org', 'files.freemusicarchive.org', 'artphotolimited.com',
        'bigissue.com', 'cdn-images.dzcdn.net', 'cdn-s-www.leprogres.fr',
        'cdn.artphotolimited.com', 'cnews.fr', 'concertandco.com',
        'crunchyroll.com', 'dzcdn.net', 'elle.fr', 'encrypted-tbn0.gstatic.com',
        'estlink.de', 'france3-regions.franceinfo.fr', 'franceinfo.fr',
        'gettyimages.com', 'googleusercontent.com', 'gstatic.com',
        'hiphopcorner.fr', 'i.redd.it', 'i.scdn.co', 'i.ytimg.com',
        'i0.wp.com', 'images.radio-canada.ca', 'images.squarespace-cdn.com',
        'img.lemde.fr', 'img.nrj.fr', 'imgsrv.crunchyroll.com',
        'intrld.com', 'lacigale.fr', 'lavagueparallele.com',
        'lemde.fr', 'leprogres.fr', 'lesvendangesmusicales.fr',
        'm.media-amazon.com', 'media-amazon.com', 'media.gettyimages.com',
        'media.printler.com', 'musique.rfi.fr', 'nrj.fr', 'nyt.com',
        'outdoormixfestival.com', 'printler.com', 'ra.co', 'radio-canada.ca',
        'radiofrance.fr', 'redd.it', 'resize.elle.fr', 'rfi.fr',
        'rocknfolk.com', 'rocksound.tv', 'rollingstone.com',
        'rollingstone.fr', 'scdn.co', 'shop.rocksound.tv',
        'squarespace-cdn.com', 'static.cnews.fr', 'static.ra.co',
        'static01.nyt.com', 'strapi.outdoormixfestival.com',
        'universalmusic.store', 'upload.wikimedia.org',
        'wikimedia.org', 'wp.com', 'yt3.googleusercontent.com', 'ytimg.com',
    ];

    private array $allowedContentTypes = [
        'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/mp4', 'audio/x-m4a',
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/json', 'application/octet-stream',
    ];

    public function __construct(
        private readonly ProxyMediaCacheService $proxyMediaCache,
    ) {}

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

        try {
            $file = $this->proxyMediaCache->getOrFetch($url);
            if ($file === null) {
                return $this->returnPlaceholder($this->guessTypeFromUrl($url));
            }

            $response = response()->file($file->absolutePath, [
                'Content-Type' => $file->contentType,
                'Cache-Control' => $file->assetType === 'image'
                    ? 'public, max-age=604800'
                    : 'public, max-age=86400',
            ]);

            if ($file->deleteAfterSend) {
                $response->deleteFileAfterSend(true);
            }

            return $response;
        } catch (\Throwable $exception) {
            Log::warning('Proxy media request failed.', [
                'url' => $url,
                'host' => $host,
                'expected_type' => $this->guessTypeFromUrl($url),
                'exception_class' => $exception::class,
                'message' => $exception->getMessage(),
                'exception' => $exception,
            ]);

            return $this->returnPlaceholder($this->guessTypeFromUrl($url));
        }
    }

    private function isAllowedDomain(string $host): bool
    {
        foreach ($this->allowedDomains as $domain) {
            if ($host === $domain || str_ends_with($host, '.'.$domain)) {
                return true;
            }
        }

        return false;
    }

    private function returnPlaceholder(string $type): BinaryFileResponse
    {
        $path = public_path($type === 'audio' ? 'placeholders/audio-placeholder.mp3' : 'placeholders/image-placeholder.png');

        return response()->file($path);
    }

    private function guessTypeFromUrl(?string $url): string
    {
        $ext = strtolower(pathinfo(parse_url($url, PHP_URL_PATH) ?? '', PATHINFO_EXTENSION));

        return in_array($ext, ['mp3', 'wav', 'ogg', 'm4a']) ? 'audio' : 'image';
    }
}
