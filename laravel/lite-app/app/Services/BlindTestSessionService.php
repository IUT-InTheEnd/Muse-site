<?php

namespace App\Services;

use Illuminate\Session\Store;

class BlindTestSessionService
{
    private const SESSION_KEY = 'blind_test.ephemeral';

    public function storeEphemeral(Store $session, array $trackIds, array $generation = []): array
    {
        $payload = [
            'source' => 'ephemeral',
            'track_ids' => array_values(array_map('intval', $trackIds)),
            'track_count' => count($trackIds),
            'generated_at' => now()->toIso8601String(),
            'generation' => $generation,
        ];

        $session->put(self::SESSION_KEY, $payload);

        return $payload;
    }

    public function getEphemeral(Store $session): ?array
    {
        $payload = $session->get(self::SESSION_KEY);

        return is_array($payload) ? $payload : null;
    }

    public function clearEphemeral(Store $session): void
    {
        $session->forget(self::SESSION_KEY);
    }

    public function sharedData(Store $session): array
    {
        $ephemeral = $this->getEphemeral($session);

        return [
            'has_ephemeral' => $ephemeral !== null,
            'ephemeral' => $ephemeral ? [
                'track_count' => $ephemeral['track_count'] ?? count($ephemeral['track_ids'] ?? []),
                'generated_at' => $ephemeral['generated_at'] ?? null,
                'generation' => $ephemeral['generation'] ?? [],
            ] : null,
        ];
    }
}
