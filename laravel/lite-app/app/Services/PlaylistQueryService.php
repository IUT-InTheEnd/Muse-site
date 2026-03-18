<?php

namespace App\Services;

use App\Models\Playlist;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class PlaylistQueryService
{
    public function userEditablePlaylists(User $user, array $columns = ['playlist_id', 'playlist_name', 'playlist_image_file']): Collection
    {
        return Playlist::where('user_id', $user->id)
            ->where('playlist_deletable', true)
            ->orderBy('playlist_name')
            ->get($columns);
    }

    public function userEditablePlaylistsForTrack(User $user, int $trackId): Collection
    {
        return $this->userEditablePlaylists($user)
            ->map(function ($playlist) use ($trackId) {
                $playlist->has_track = $playlist->tracks()
                    ->where('track.track_id', $trackId)
                    ->exists();

                return $playlist;
            });
    }

    public function userOwnedPlaylist(User $user, int $playlistId, bool $deletableOnly = false): ?Playlist
    {
        $query = Playlist::where('playlist_id', $playlistId)
            ->where('user_id', $user->id);

        if ($deletableOnly) {
            $query->where('playlist_deletable', true);
        }

        return $query->first();
    }

    public function playlistContainsTrack(Playlist $playlist, int $trackId): bool
    {
        return $playlist->tracks()
            ->where('track.track_id', $trackId)
            ->exists();
    }

    public function playlistForShow(int $playlistId): Playlist
    {
        return Playlist::with(['tracks.realisers.artist', 'user'])
            ->findOrFail($playlistId);
    }

    public function userPlaylistsForManagement(User $user): Collection
    {
        return Playlist::where('user_id', $user->id)
            ->with('tracks:track_id')
            ->withCount('tracks')
            ->orderBy('playlist_date_updated', 'desc')
            ->get();
    }
}
