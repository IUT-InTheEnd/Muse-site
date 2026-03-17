<?php

namespace App\Services;

use Illuminate\Support\Facades\File;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class RecommendationService
{
    /**
     * Retourne les IDs de tracks recommandés via un script Python.
     *
     * @param  string  $scriptPath  Chemin absolu vers le script Python
     * @param  array  $arguments  Arguments passés au script
     * @param  int  $timeout  Timeout en secondes
     * @return int[]
     *
     * @throws ProcessFailedException
     */
    public function runScript(string $scriptPath, array $arguments, int $timeout = 120): array
    {
        $python = $this->resolvePythonBinary();
        $process = new Process(array_merge([$python, $scriptPath], $arguments));
        $process->setTimeout($timeout);
        $process->run();

        if (! $process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }

        $trackIds = json_decode(trim($process->getOutput()), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \RuntimeException("Invalid JSON output from recommendation script: $scriptPath: ".$process->getOutput());
        }

        return $trackIds ?? [];
    }

    private function resolvePythonBinary(): string
    {
        $candidates = [
            base_path('python-env/bin/python3'),
            base_path('venv/bin/python3'),
            base_path('../../.venv/bin/python3'),
        ];

        foreach ($candidates as $candidate) {
            if (File::exists($candidate)) {
                return $candidate;
            }
        }

        throw new \RuntimeException(
            'Python environment not found. Expected one of: '.implode(', ', $candidates)
        );
    }

    /**
     * Recommandations user-based (utilisateur avec historique).
     *
     * @return int[]
     */
    public function userBased(int $userId, int $n = 10): array
    {
        $scriptPath = app_path().'/Http/Controllers/RecommendationScripts/reco_user_based_p2.py';

        return $this->runScript($scriptPath, [(string) $userId, (string) $n]);
    }

    /**
     * Recommandations cold-start (nouvel utilisateur).
     *
     * @return int[]
     */
    public function newUser(int $n = 10): array
    {
        $scriptPath = app_path().'/Http/Controllers/RecommendationScripts/reco_user_based_p1.py';
        return $this->runScript($scriptPath, [(string) $n]);
    }

    /**
     * Recommandations item-based (Mathéo) — cosine similarity sur métadonnées artiste/album.
     *
     * @return int[]
     */
    public function itemBasedMatheo(int $userId, int $trackId, int $n = 10, int $mode = 3): array
    {
        $scriptPath = app_path().'/Http/Controllers/RecommendationScripts/reco_item_based_matheo.py';
        return $this->runScript($scriptPath, [(string) $userId, (string) $trackId, (string) $n, (string) $mode]);
    }

    /**
     * Recommandations item-based (Mathieu) — cosine similarity genre + popularité.
     *
     * @return int[]
     */
    public function itemBasedMathieu(int $trackId, int $n = 10, float $simRatio = 0.8, float $seuilSim = 0.4): array
    {
        $scriptPath = app_path().'/Http/Controllers/RecommendationScripts/reco_item_based_mathieu.py';
        return $this->runScript($scriptPath, [(string) $trackId, (string) $n, (string) $simRatio, (string) $seuilSim]);
    }

    /**
     * Recommandations EchoNest — vecteurs audio avec filtrage genre.
     *
     * @return int[]
     */
    public function echoNest(int $userId, int $trackId, int $n = 10, bool $compareGenre = true): array
    {
        $scriptPath = app_path().'/Http/Controllers/RecommendationScripts/reco_steph_echonest.py';

        return $this->runScript($scriptPath, [
            (string) $userId,
            (string) $trackId,
            (string) $n,
            $compareGenre ? 'true' : 'false',
        ]);
    }

    /**
     * Recommandations hybrides (user-based + EchoNest).
     *
     * @return int[]
     */
    public function hybrid(int $userId, int $trackId, int $n = 10, bool $compareGenre = true, int $topK = 10): array
    {
        $scriptPath = app_path().'/Http/Controllers/RecommendationScripts/hybride.py';

        return $this->runScript($scriptPath, [
            (string) $userId,
            (string) $trackId,
            (string) $n,
            $compareGenre ? 'true' : 'false',
            (string) $topK,
        ]);
    }
}
