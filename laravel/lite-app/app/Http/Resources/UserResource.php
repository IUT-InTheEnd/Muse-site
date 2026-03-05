<?php

namespace App\Http\Resources;

use App\Enums\Instruments;
use App\Enums\ListeningContext;
use Dedoc\Scramble\Attributes\SchemaName;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

#[SchemaName('User')]
class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'image_file' => $this->user_image_file,
            'age' => $this->user_age,
            'job' => $this->user_job,
            'plays_music' => boolval($this->user_plays_music),
            'gender' => $this->user_gender,
            /** @var array<Instruments> */
            'instruments' => $this->user_instruments == 'nan' ? [] : eval('return'.$this->user_instruments.';'),
            /** @var array<ListeningContext> */
            'music_contexts' => $this->user_music_contexts == 'nan' ? [] : eval('return'.$this->user_music_contexts.';'),
        ];
    }
}
