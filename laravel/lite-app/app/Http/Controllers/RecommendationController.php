<?php

namespace App\Http\Controllers;

use App\Services\RecommendationService;
use Illuminate\Http\Request;
use Symfony\Component\Process\Exception\ProcessFailedException;

class RecommendationController extends Controller
{
    public function __construct(private RecommendationService $recommendations) {}

    // Lien avec des scripts python pour les recommandations
    public function getRecommendations(Request $request)
    {
        // user_based_p1 est exclu : réservé aux nouveaux utilisateurs
        $recommandationType = ['item_based_matheo', 'item_based_mathieu', 'echonest', 'user_based_p2', 'hybride'];

        $request->validate([
            'recommandation_type' => 'required|string|in:'.implode(',', $recommandationType),
            'n' => 'nullable|integer|min:1|max:50',
        ]);

        $userId = auth()->id();
        $n = $request->n ?? 10;

        try {
            $trackIds = match ($request->recommandation_type) {
                'item_based_matheo' => $this->itemBasedMatheo($request, $userId, $n),
                'item_based_mathieu' => $this->itemBasedMathieu($request, $n),
                'echonest' => $this->echoNest($request, $userId, $n),
                'user_based_p2' => $this->recommendations->userBased($userId, $n),
                'hybride' => $this->hybrid($request, $userId, $n),
            };
        } catch (ProcessFailedException $e) {
            return response()->json(['error' => 'Recommendation script failed', 'details' => $e->getMessage()], 500);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 500);
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

        try {
            $trackIds = $this->recommendations->newUser($request->n ?? 10);
        } catch (ProcessFailedException $e) {
            return response()->json(['error' => 'Recommendation script failed', 'details' => $e->getMessage()], 500);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }

        return response()->json([
            'track_ids' => $trackIds,
            'count' => count($trackIds),
            'type' => 'user_based_p1',
        ]);
    }

    // -------------------------------------------------------------------------
    // Helpers privés — validation + délégation au service
    // -------------------------------------------------------------------------

    private function itemBasedMatheo(Request $request, int $userId, int $n): array
    {
        $request->validate([
            'track_id' => 'required|integer|exists:track,track_id',
            'mode' => 'nullable|integer|in:1,2,3',
        ]);

        return $this->recommendations->itemBasedMatheo($userId, $request->track_id, $n, $request->mode ?? 3);
    }

    private function itemBasedMathieu(Request $request, int $n): array
    {
        $request->validate([
            'track_id' => 'required|integer|exists:track,track_id',
            'sim_ratio' => 'nullable|numeric|min:0|max:1',
            'seuil_sim' => 'nullable|numeric|min:0|max:1',
        ]);

        return $this->recommendations->itemBasedMathieu(
            $request->track_id,
            $n,
            $request->sim_ratio ?? 0.8,
            $request->seuil_sim ?? 0.4,
        );
    }

    private function echoNest(Request $request, int $userId, int $n): array
    {
        $request->validate([
            'track_id' => 'required|integer|exists:track,track_id',
            'compare_genre' => 'nullable|boolean',
        ]);

        return $this->recommendations->echoNest($userId, $request->track_id, $n, $request->compare_genre ?? true);
    }

    private function hybrid(Request $request, int $userId, int $n): array
    {
        $request->validate([
            'track_id' => 'required|integer|exists:track,track_id',
            'compare_genre' => 'nullable|boolean',
            'top_k' => 'nullable|integer|min:1|max:50',
        ]);

        return $this->recommendations->hybrid(
            $userId,
            $request->track_id,
            $n,
            $request->compare_genre ?? true,
            $request->top_k ?? 10,
        );
    }
}
