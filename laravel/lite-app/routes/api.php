<?php

use App\Http\Controllers\AlbumController;
use App\Http\Controllers\ArtistController;
use App\Http\Controllers\PlaylistController;
use App\Http\Controllers\TrackController;
use App\Http\Controllers\TrackEchonestController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserProfileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('db_api')->group(function () {
    // {{{ User
    Route::get('/user', [UserController::class, 'getUser'])
        ->name('getInfo')
        ->middleware('auth:sanctum');

    Route::get('/user/Profile', [UserProfileController::class, 'getProfile'])
        ->name('getProfile')
        ->middleware('auth:sanctum');

    Route::patch('/user', [UserController::class, 'updateUserInfo'])
        ->name('updateInfo')
        ->middleware('auth:sanctum');

    Route::patch('/user/profile', [UserProfileController::class, 'updateUserProfile'])
        ->name('updateProfile')
        ->middleware('auth:sanctum');
    // }}}

    // {{{ Music
    Route::get('/track/{id}', [TrackController::class, 'getTrack'])
        ->name('getTrack');

    Route::get('/tracks', [TrackController::class, 'getAllTracks'])
        ->name('getAllTracks');
    // }}}

    // {{{ Echonest
    Route::get('/echonest/{id}', [TrackEchonestController::class, 'getEchonest'])
        ->name('getEchonest');
    // }}}

    // {{{ Artist
    Route::get('/artist/{id}', [ArtistController::class, 'getArtist'])
        ->name('getArtist');

    Route::get('/artists', [ArtistController::class, 'getAllArtists'])
        ->name('getAllArtists');
    // }}}

    // {{{ Album
    Route::get('/album/{id}', [AlbumController::class, 'getAlbum'])
        ->name('getAlbum');

    Route::get('/albums', [AlbumController::class, 'getAllAlbums'])
        ->name('getAllAlbums');
    // }}}

    // {{{ Playlist
    Route::get('/playlist/{id}', [PlaylistController::class, 'getPlaylist'])
        ->name('getPlaylist')
        ->middleware('auth:sanctum');

    Route::post('/playlist', [PlaylistController::class, 'create'])
        ->name('createPlaylist')
        ->middleware('auth:sanctum');

    Route::post('/playlist/track', [PlaylistController::class, 'addTrack'])
        ->name('addSong')
        ->middleware('auth:sanctum');

    Route::delete('/playlist', [PlaylistController::class, 'delete'])
        ->name('deletePlaylist')
        ->middleware('auth:sanctum');

    Route::delete('/playlist/track', [PlaylistController::class, 'removeTrack'])
        ->name('removeSong')
        ->middleware('auth:sanctum');
    // }}}

    Route::middleware('web')->group(function () {
        Route::get('/token/create', function (Request $request) {
            $token = $request->user()->createToken($request->token_name);

            return ['token' => $token->plainTextToken];
        });

        //    Route::get('/whoami', function (Request $request) {
        //        return $request->user();
        //    });
    });
});

// Debug route // no documentation
Route::get('/token/create/{id}/{name}', [UserController::class, 'debugCreateToken']);
