<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Dedoc\Scramble\Attributes\SchemaName;

#[SchemaName('Track')]
class TrackResource extends JsonResource
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
            'title' => $this->track_title,
            'duration' => $this->track_duration,
            'date_created' => $this->track_date_created,
            'date_recorded' => $this->track_date_recorded,
            'composer' => $this->track_composer,
            'lyricist' => $this->track_lyricist,
            'publisher' => $this->track_publisher,
            'listens' => $this->track_listens,
            'favorites' => $this->track_favorites,
            'comments' => $this->track_comments,
            'interest' => $this->track_interest,
            'copyright_c' => $this->track_copyright_c,
            'copyrigth_p' => $this->track_copyright_p,
            'explicit' => $this->track_explicit,
            'explicit_note' => $this->track_explicit_note,
            'instrumental' => $this->track_instrumental,
            'language_code' => $this->track_language_code,
            'image_file' => $this->track_image_file,
            'license_id' => $this->license_id,
            'license' => $this->license,
        ];
    }
}
