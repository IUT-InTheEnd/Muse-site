<?php

namespace App\Http\Resources;

use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

#[SchemaName('Album')]
class AlbumResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->album_id,
            'title' => $this->album_title,
            'date_release' => $this->album_date_release,
            'date_created' => $this->album_date_created,
            'listens' => $this->album_listens,
            'favorites' => $this->album_favorites,
            'likes' => $this->album_likes,
            'dislikes' => $this->album_dislikes,
            'comments' => $this->album_comments,
            'type' => $this->album_type,
            'url' => $this->album_url,
            'handle' => $this->album_handle,
            'information' => $this->album_information,
            'tracks' => $this->album_tracks,
            'producer' => $this->album_producer,
            'engineer' => $this->album_engineer,
            'image_file' => $this->album_image_file,
        ];
    }
}
