<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class RecommendationController extends Controller
{
    // Lien avec des scripts python pour les recommandations
    public function getRecommendations(Request $request)
    {
        // user_based_p1 est exclu : réservé aux nouveaux utilisateurs
        $recommandationType = ['item_based_matheo', 'item_based_mathieu', 'echonest', 'user_based_p2', 'hybride'];

        $request->validate([
            'recommandation_type' => 'required|string|in:'.implode(',', $recommandationType),
            'n' => 'nullable|integer|min:1|max:50',
        ]);

        // Toujours utiliser l'utilisateur authentifié (plus sécurisé que de l'accepter en param)
        $userId = auth()->id();
        $n = $request->n ?? 10;

        switch ($request->recommandation_type) {
            case 'item_based_matheo':
                $request->validate([
                    'track_id' => 'required|integer|exists:track,track_id',
                    'mode' => 'nullable|integer|in:1,2,3',
                ]);
                $scriptPath = app_path().'/Http/Controllers/RecommendationScripts/reco_item_based_matheo.py';
                $arguments = [
                    $userId,
                    $request->track_id,
                    $n,
                    $request->mode ?? 3,
                ];
                break;

            case 'item_based_mathieu':
                $request->validate([
                    'track_id' => 'required|integer|exists:track,track_id',
                    'sim_ratio' => 'nullable|numeric|min:0|max:1',
                    'seuil_sim' => 'nullable|numeric|min:0|max:1',
                ]);
                $scriptPath = app_path().'/Http/Controllers/RecommendationScripts/reco_item_based_mathieu.py';
                $arguments = [
                    $request->track_id,
                    $n,
                    $request->sim_ratio ?? 0.8,
                    $request->seuil_sim ?? 0.4,
                ];
                break;

            case 'echonest':
                $request->validate([
                    'track_id' => 'required|integer|exists:track,track_id',
                    'compare_genre' => 'nullable|boolean',
                ]);
                $scriptPath = app_path().'/Http/Controllers/RecommendationScripts/reco_steph_echonest.py';
                $arguments = [
                    $userId,
                    $request->track_id,
                    $n,
                    $request->compare_genre ?? true ? 'true' : 'false',
                ];
                break;

            case 'user_based_p2':
                $scriptPath = app_path().'/Http/Controllers/RecommendationScripts/reco_user_based_p2.py';
                $arguments = [
                    $userId,
                    $n,
                ];
                break;

            case 'hybride':
                $request->validate([
                    'track_id' => 'required|integer|exists:track,track_id',
                    'compare_genre' => 'nullable|boolean',
                    'top_k' => 'nullable|integer|min:1|max:50',
                ]);
                $scriptPath = app_path().'/Http/Controllers/RecommendationScripts/hybride.py';
                $arguments = [
                    $userId,
                    $request->track_id,
                    $n,
                    $request->compare_genre ?? true ? 'true' : 'false',
                    $request->top_k ?? 10,
                ];
                break;

            default:
                return response()->json(['error' => 'Type de recommandation invalide'], 400);
        }

        $process = new Process(array_merge(['python3', $scriptPath], $arguments));
        $process->setTimeout(120);
        $process->run();

        if (! $process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }

        $output = trim($process->getOutput());
        $trackIds = json_decode($output, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return response()->json([
                'error' => 'Invalid response from recommendation script',
                'raw_output' => $output,
            ], 500);
        }

        return response()->json([
            'track_ids' => $trackIds,
            'count' => count($trackIds),
            'type' => $request->recommandation_type,
        ]);
    }

    public function getNewUserRecommendations(Request $request)
    {
        $request->validate([
            'n' => 'nullable|integer|min:1|max:50',
        ]);

        $n = $request->n ?? 10;
        $scriptPath = app_path() . '/Http/Controllers/RecommendationScripts/reco_user_based_p1.py';
        $process = new Process(['python3', $scriptPath, $n]);
        $process->setTimeout(120);
        $process->run();

        if (!$process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }

        $output = trim($process->getOutput());
        $trackIds = json_decode($output, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return response()->json([
                'error' => 'Invalid response from recommendation script',
                'raw_output' => $output,
            ], 500);
        }

        return response()->json([
            'track_ids' => $trackIds,
            'count' => count($trackIds),
            'type' => 'user_based_p1',
        ]);
    }
}
