<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\Track;
use App\Services\ReactionService;
use App\Services\VisitorIdService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReactionController extends Controller
{
    public function __construct(
        private ReactionService $reactions,
        private VisitorIdService $visitorIds,
    ) {}

    public function reactToTrack(Request $request, Track $track): JsonResponse
    {
        $validated = $request->validate([
            'reaction' => 'nullable|string|in:like,dislike,none',
        ]);

        $user = $request->user();
        $visitorId = $user === null ? $this->visitorIds->ensure($request) : null;

        $result = $this->reactions->reactToTrack(
            track: $track,
            user: $user,
            visitorId: $visitorId,
            reaction: $validated['reaction'] ?? null,
        );

        return response()->json($result);
    }

    public function reactToAlbum(Request $request, Album $album): JsonResponse
    {
        $validated = $request->validate([
            'reaction' => 'nullable|string|in:like,dislike,none',
        ]);

        $user = $request->user();
        $visitorId = $user === null ? $this->visitorIds->ensure($request) : null;

        $result = $this->reactions->reactToAlbum(
            album: $album,
            user: $user,
            visitorId: $visitorId,
            reaction: $validated['reaction'] ?? null,
        );

        return response()->json($result);
    }
}
