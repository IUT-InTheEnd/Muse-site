<?php

namespace App\Http\Controllers;

use App\Services\RecommendationService;
use Illuminate\Http\Request;

class RecommendationController extends Controller
{
    public function __construct(private RecommendationService $recommendations) {}

    public function getNewUserRecommendations(Request $request)
    {
        $request->validate([
            'n' => 'nullable|integer|min:1|max:50',
        ]);

        try {
            $trackIds = $this->recommendations->newUser($request->n ?? 10);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }

        return response()->json([
            'track_ids' => $trackIds,
            'count' => count($trackIds),
            'type' => 'user_based_p1',
        ]);
    }
}
