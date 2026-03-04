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

        // 3. Récupérer la ressource distante
        try {
            $response = Http::withOptions([
                'timeout' => 30,
            ])->get($url);
        } catch (\Exception $e) {
            return $this->returnPlaceholder($this->guessTypeFromUrl($url));
        }

        if (! $response->successful()) {
            return $this->returnPlaceholder($this->guessTypeFromUrl($url));
        }

        // 4. Vérifier le Content-Type
        $contentType = $response->header('Content-Type') ?? 'application/octet-stream';
        $baseContentType = trim(explode(';', $contentType)[0]);

        if (! in_array($baseContentType, $this->allowedContentTypes)) {
            return $this->returnPlaceholder($this->guessTypeFromContentType($baseContentType));
        }

        // 5. Construire les headers de réponse
        $headers = [
            'Content-Type' => $contentType,
            'Cache-Control' => 'public, max-age=86400', // Cache 24h
        ];

        // Ajouter Content-Length si disponible
        $contentLength = $response->header('Content-Length');
        if ($contentLength) {
            $headers['Content-Length'] = $contentLength;
        }

        // 6. Retourner la réponse
        return response($response->body(), 200, $headers);
    }

    /**
     * Retourne le placeholder selon le type
     */
    private function returnPlaceholder(string $type): \Illuminate\Http\Response
    {
        $placeholder = $this->placeholders[$type] ?? $this->placeholders['image'];
        $path = asset($placeholder['path']);

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
