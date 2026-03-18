<?php

namespace App\Services;

use App\Models\ArtisteChante;
use App\Models\Artist;
use App\Models\ContientGenre;
use App\Models\Genre;
use App\Models\Language;
use App\Models\Track;
use App\Models\TrackChanterEn;
use Illuminate\Support\Collection;

class SearchQueryService
{
    public function tracks(string $search, array $selectedGenres = [], array $selectedLanguages = []): Collection
    {
        $selectedGenres = array_map('intval', $selectedGenres);
        $selectedLanguages = array_map('intval', $selectedLanguages);

        $trackIdsFromFilters = $this->trackIdsFromFilters($selectedGenres, $selectedLanguages);

        $tracks = Track::query()
            ->select('track_id', 'track_title', 'track_image_file', 'track_listens', 'track_favorites', 'track_likes', 'track_dislikes', 'track_duration')
            ->with('realisers.artist')
            ->where('track_title', 'ilike', "%{$search}%");

        if ($trackIdsFromFilters->isNotEmpty()) {
            $tracks->whereIn('track_id', $trackIdsFromFilters->pluck('track_id'));
        }

        return $tracks
            ->orderBy('track_listens', 'desc')
            ->limit(100)
            ->get()
            ->each(function ($track) {
                $track->artist = $track->realisers->first()?->artist;
            });
    }

    public function artists(string $search, array $selectedLanguages = []): Collection
    {
        $selectedLanguages = array_map('intval', $selectedLanguages);
        $artistIdsFromLanguage = $this->artistIdsFromLanguages($selectedLanguages);

        $artists = Artist::query()
            ->select('artist_id', 'artist_name', 'artist_image_file')
            ->where('artist_name', 'ilike', "%{$search}%");

        if ($artistIdsFromLanguage->isNotEmpty()) {
            $artists->whereIn('artist_id', $artistIdsFromLanguage->pluck('artist_id'));
        }

        return $artists
            ->orderBy('artist_id')
            ->limit(100)
            ->get();
    }

    public function languages(): Collection
    {
        return Language::query()
            ->select('language_id', 'language_label')
            ->orderBy('language_label')
            ->distinct()
            ->get();
    }

    public function rootGenres(): Collection
    {
        return Genre::query()
            ->select('genre_id', 'genre_title')
            ->where('genre_parent_id', null)
            ->orderBy('genre_title')
            ->distinct()
            ->get();
    }

    private function trackIdsFromFilters(array $selectedGenres, array $selectedLanguages): Collection
    {
        $trackIdsFromGenre = collect();
        $trackIdsFromLanguage = collect();

        if ($selectedGenres !== []) {
            $trackIdsFromGenre = ContientGenre::query()
                ->select('track_id')
                ->whereIn('genre_id', $selectedGenres)
                ->get();
        }

        if ($selectedLanguages !== []) {
            $trackIdsFromLanguage = TrackChanterEn::query()
                ->select('track_id')
                ->whereIn('language_id', $selectedLanguages)
                ->get();
        }

        if ($selectedLanguages !== [] && $selectedGenres !== []) {
            return $trackIdsFromGenre->merge($trackIdsFromLanguage)->unique('track_id')->values();
        }

        if ($selectedLanguages !== []) {
            return $trackIdsFromLanguage;
        }

        if ($selectedGenres !== []) {
            return $trackIdsFromGenre;
        }

        return collect();
    }

    private function artistIdsFromLanguages(array $selectedLanguages): Collection
    {
        if ($selectedLanguages === []) {
            return collect();
        }

        return ArtisteChante::query()
            ->select('artist_id')
            ->whereIn('language_id', $selectedLanguages)
            ->get();
    }
}
