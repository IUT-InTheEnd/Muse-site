<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
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

    public function stream(Request $request)
    {
        $url = $request->query('url');

        if (!$url || !filter_var($url, FILTER_VALIDATE_URL)) {
            return $this->returnPlaceholder($this->guessTypeFromUrl($url));
        }

        $host = parse_url($url, PHP_URL_HOST);
        if (!$host || !$this->isAllowedDomain($host)) {
            return $this->returnPlaceholder($this->guessTypeFromUrl($url));
        }

        $isImage = $this->guessTypeFromUrl($url) === 'image';
        $cacheKey = 'proxy/' . md5($url);

        if ($isImage && Storage::disk('public')->exists($cacheKey)) {
            return response()->file(Storage::disk('public')->path($cacheKey), [
                'Cache-Control' => 'public, max-age=604800',
            ]);
        }

        try {
            // Do not forward Range requests until partial-content handling is
            // implemented correctly end-to-end. Chrome rejects malformed 206
            // responses more aggressively than Firefox.
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            ])
                ->timeout(10)
                ->get($url);

            if (!$response->successful()) {
                return $this->returnPlaceholder($this->guessTypeFromUrl($url));
            }

            $upstreamContentType = explode(';', $response->header('Content-Type'))[0];
            if (! $this->isAllowedContentType($upstreamContentType, $isImage)) {
                return $this->returnPlaceholder($this->guessTypeFromContentType($upstreamContentType));
            }

            $contentType = $this->normalizeContentType($url, $upstreamContentType, $isImage);

            // --- OPTIMISATION 2 : ÉCRITURE DANS LE CACHE ET RÉPONSE ---
            if ($isImage) {
                $content = $response->body();
                Storage::disk('public')->put($cacheKey, $content);
                return response($content)->header('Content-Type', $contentType)
                    ->header('Cache-Control', 'public, max-age=604800');
            }

            // Réponse audio bufferisée : plus robuste que le pseudo-streaming
            // actuel pour les lecteurs HTMLAudioElement.
            return response($response->body(), 200, [
                'Content-Type' => $contentType,
                'Cache-Control' => 'public, max-age=86400',
                'Content-Length' => $response->header('Content-Length'),
            ]);

        } catch (\Exception $e) {
            return $this->returnPlaceholder($this->guessTypeFromUrl($url));
        }
    }

    private function isAllowedDomain(string $host): bool
    {
        foreach ($this->allowedDomains as $domain) {
            if ($host === $domain || str_ends_with($host, '.' . $domain)) return true;
        }
        return false;
    }

    private function isAllowedContentType(string $contentType, bool $isImage): bool
    {
        if (in_array($contentType, $this->allowedContentTypes, true)) {
            return true;
        }

        if (! $isImage && $contentType === 'application/octet-stream') {
            return true;
        }

        return false;
    }

    private function normalizeContentType(string $url, string $contentType, bool $isImage): string
    {
        if ($isImage && $contentType === 'application/octet-stream') {
            return 'image/jpeg';
        }

        if ($isImage || $contentType !== 'application/octet-stream') {
            return $contentType;
        }

        return match (strtolower(pathinfo(parse_url($url, PHP_URL_PATH) ?? '', PATHINFO_EXTENSION))) {
            'mp3' => 'audio/mpeg',
            'wav' => 'audio/wav',
            'ogg' => 'audio/ogg',
            'm4a', 'mp4' => 'audio/mp4',
            default => 'audio/mpeg',
        };
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

    private function guessTypeFromContentType(string $contentType): string
    {
        return str_contains($contentType, 'audio') ? 'audio' : 'image';
    }
}
