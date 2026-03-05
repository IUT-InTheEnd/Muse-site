<?php

namespace App\Http\Resources;

use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

#[SchemaName('Echonest')]
class TrackEchonestResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->track_id,
            'acousticness' => $this->acousticness,
            'energy' => $this->energy,
            'instrumentalness' => $this->instrumentalness,
            'liveness' => $this->liveness,
            'speechiness' => $this->speechiness,
            'valence' => $this->valence,
            'danceability' => $this->danceability,
            'tempo' => $this->tempo,
            'artist_discovery' => $this->artist_discovery,
            'artist_hottness' => $this->artist_hottness,
            'artist_familiarity' => $this->artist_familiarity,
            'track_hottness' => $this->track_hottness,
            'track_currency' => $this->track_currency,
        ];
    }
}
