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

    public function stream(Request $request)
    {
        // 1. Récupérer et valider l'URL
        $url = $request->query('url');

        if (! $url || ! filter_var($url, FILTER_VALIDATE_URL)) {
            abort(400, 'URL invalide ou manquante');
        }

        // 2. Vérifier que le domaine est autorisé
        $host = parse_url($url, PHP_URL_HOST);

        if (! in_array($host, $this->allowedDomains)) {
            abort(403, 'Domaine non autorisé: '.$host);
        }

        // 3. Récupérer la ressource distante
        try {
            $response = Http::withOptions([
                'timeout' => 30,
            ])->get($url);
        } catch (\Exception $e) {
            abort(502, 'Erreur lors de la connexion au serveur distant');
        }

        if (! $response->successful()) {
            abort($response->status(), 'Erreur lors de la récupération de la ressource');
        }

        // 4. Vérifier le Content-Type
        $contentType = $response->header('Content-Type') ?? 'application/octet-stream';
        $baseContentType = trim(explode(';', $contentType)[0]);

        if (! in_array($baseContentType, $this->allowedContentTypes)) {
            abort(403, 'Type de contenu non autorisé: '.$baseContentType);
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
}
