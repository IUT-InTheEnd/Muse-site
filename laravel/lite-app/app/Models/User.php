<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * Class User
 *
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property string|null $user_image_file
 * @property float|null $user_age
 * @property string|null $user_job
 * @property string|null $user_plays_music
 * @property string|null $user_gender
 * @property string|null $user_instruments
 * @property string|null $user_music_contexts
 * @property int|null $profile_id
 * @property UserProfile|null $user_profile
 * @property UserPreferenceEchonest|null $user_preference_echonest
 * @property Collection|PossedePlaylist[] $possede_playlists
 * @property Collection|Represente[] $representes
 * @property Collection|UserParle[] $user_parles
 * @property Collection|Artist[] $artists
 * @property Collection|AjouteFavori[] $ajoute_favoris
 * @property Collection|AjouteGenreFavori[] $ajoute_genre_favoris
 * @property Collection|Album[] $albums
 * @property Collection|UserEcoute[] $user_ecoutes
 */
class User extends Authenticatable
{
    use Notifiable, TwoFactorAuthenticatable;

    protected $table = 'user';

    protected $casts = [
        'email_verified_at' => 'datetime',
        'two_factor_confirmed_at' => 'datetime',
        'user_age' => 'float',
        'profile_id' => 'int',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
    ];

    protected $fillable = [
        'name',
        'email',
        'email_verified_at',
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
        'user_image_file',
        'user_age',
        'user_job',
        'user_plays_music',
        'user_gender',
        'user_instruments',
        'user_music_contexts',
        'profile_id',
    ];

    public function user_profile()
    {
        return $this->belongsTo(UserProfile::class, 'profile_id');
    }

    public function user_preference_echonest()
    {
        return $this->hasOne(UserPreferenceEchonest::class);
    }

    public function playlist()
    {
        return $this->hasMany(Playlist::class);
    }

    public function representes()
    {
        return $this->hasMany(Represente::class);
    }

    public function user_parles()
    {
        return $this->hasMany(UserParle::class);
    }

    public function artists()
    {
        return $this->belongsToMany(Artist::class, 'user_prefere_artiste');
    }

    public function ajoute_favoris()
    {
        return $this->hasMany(AjouteFavori::class);
    }

    public function ajoute_genre_favoris()
    {
        return $this->hasMany(AjouteGenreFavori::class);
    }

    public function albums()
    {
        return $this->belongsToMany(Album::class, 'user_ajoute_album_favoris');
    }

    public function user_ecoutes()
    {
        return $this->hasMany(UserEcoute::class);
    }
}
