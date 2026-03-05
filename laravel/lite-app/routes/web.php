<?php

use App\Http\Controllers\AlbumController;
use App\Http\Controllers\ArtistController;
use App\Http\Controllers\FavoritesController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (auth()->check()) {
        return Inertia::render('dashboard');
    }

    return Inertia::render('welcome');
})->name('home');

Route::get('/mentionslegales', function () {
    return Inertia::render('mentionslegales');
})->name('mentionslegales');

Route::get('/support', function () {
    return Inertia::render('support');
})->name('support');

Route::get('/genpassword', function () {
    return view('genpassword');
})->name('genpassword');

<<<<<<< api
Route::get('/test-music-player', [App\Http\Controllers\TestMusicPlayer::class, 'playMusic'])->name('test-music-player');

// Proxy pour les ressources externes (audio, images) - protégé par auth
Route::middleware('auth')->get('/proxy', [App\Http\Controllers\ProxyController::class, 'stream'])->name('proxy');

Route::get('/artiste/{id}' ,[ArtistController::class,"show"]);

=======
>>>>>>> main
// Routes pour les documentations
Route::prefix('documentation')->name('documentation.')->group(function () {
    Route::get('/', function () {
        return Inertia::render('documentation/index', [                 // accueil docs
            'links' => [
                'installation' => route('documentation.installation'),  // doc installation
<<<<<<< api
                'api'          => route('documentation.api'),           // doc api
                'utilisation'  => route('documentation.utilisation'),   // doc utilisation
=======
                'api' => route('documentation.api'),           // doc api
                'utilisation' => route('documentation.utilisation'),   // doc utilisation
>>>>>>> main
            ],
        ]);
    })->name('index');

    Route::get('/installation', fn () => Inertia::render('documentation/installation'))
        ->name('installation');

    Route::get('/api', fn () => Inertia::render('documentation/api'))
        ->name('api');

    Route::get('/utilisation', fn () => Inertia::render('documentation/utilisation'))
        ->name('utilisation');
});

Route::middleware(['auth'])->group(function () {
    // Redirection du dashboard vers la page d'accueil si connecté
    Route::get('/dashboard', function () {
        return redirect('/');
    })->name('dashboard');

    // Music player
    Route::get('/test-music-player', [App\Http\Controllers\MusicController::class, 'playMusic'])->name('test-music-player');
    Route::post('/add-listen', [App\Http\Controllers\MusicController::class, 'addListen'])->name('add-listen');

    // Proxy pour les ressources externes (audio, images) - protégé par auth
    Route::get('/proxy', [App\Http\Controllers\ProxyController::class, 'stream'])->name('proxy');

    Route::get('/artiste/{id}', [ArtistController::class, 'show'])->name('artist');
    Route::get('/artiste/{id}/all', [ArtistController::class, 'allTracks'])->name('artist/all_song');
    Route::post('/artiste/{id}/follow', [ArtistController::class, 'follow'])->name('artist.follow');
    Route::delete('/artiste/{id}/follow', [ArtistController::class, 'unfollow'])->name('artist.unfollow');

    // User profile
    Route::patch('/user/profile', [App\Http\Controllers\UserController::class, 'updateUserProfile'])->name('user.updateProfile');
    Route::patch('/user/info', [App\Http\Controllers\UserController::class, 'updateUserInfo'])->name('user.updateInfo');

    Route::get('/album/{id}', [AlbumController::class, 'view'])->name('album.view');

    // Favorites - User
    Route::get('/favorites', [FavoritesController::class, 'index'])->name('favorites.index');

    // Favorites - Tracks
    Route::post('/favorites/toggle', [FavoritesController::class, 'toggle'])->name('favorites.toggle');
    Route::post('/favorites/check', [FavoritesController::class, 'check'])->name('favorites.check');

    // Favorites - Albums
    Route::post('/favorites/album/toggle', [FavoritesController::class, 'toggleAlbum'])->name('favorites.album.toggle');
    Route::post('/favorites/album/check', [FavoritesController::class, 'checkAlbum'])->name('favorites.album.check');

    // Playlists
    Route::get('/playlists/user', [App\Http\Controllers\PlaylistController::class, 'getUserPlaylists'])->name('playlists.list');
    Route::get('/playlists/for-track', [App\Http\Controllers\PlaylistController::class, 'getUserPlaylistsForTrack'])->name('playlists.forTrack');
    Route::post('/playlists/create', [App\Http\Controllers\PlaylistController::class, 'create'])->name('playlists.create');
    Route::post('/playlists/add-track', [App\Http\Controllers\PlaylistController::class, 'addTrack'])->name('playlists.addTrack');
    Route::post('/playlists/remove-track', [App\Http\Controllers\PlaylistController::class, 'removeTrack'])->name('playlists.removeTrack');
    Route::post('/playlists/sync-track', [App\Http\Controllers\PlaylistController::class, 'syncTrackPlaylists'])->name('playlists.syncTrack');
    Route::patch('/playlists/update', [App\Http\Controllers\PlaylistController::class, 'update'])->name('playlists.update');
    Route::delete('/playlists/delete', [App\Http\Controllers\PlaylistController::class, 'delete'])->name('playlists.delete');

    // route playlist
    Route::get('/user/playlists', [App\Http\Controllers\PlaylistController::class, 'myPlaylists'])->name('my.playlists');
    Route::get('/playlist/{id}', [App\Http\Controllers\PlaylistController::class, 'show'])->name('playlist.show');

    // route profile user publique
    Route::get('/user/{username}', [App\Http\Controllers\UserController::class, 'show'])->name('user.profile');

    // Images create/update/delete
    Route::post('/image', [App\Http\Controllers\ImageFileController::class, 'uploadImage'])->name('image.upload');
    Route::patch('/image', [App\Http\Controllers\ImageFileController::class, 'updateImage'])->name('image.update');
    Route::delete('/image', [App\Http\Controllers\ImageFileController::class, 'deleteImage'])->name('image.delete');
});

<<<<<<< api
// // Playlist
// Route::middleware(['auth', 'verified'])->get('/playlist/{id}', [App\Http\Controllers\PlaylistController::class, 'index'])->name('playlist.index');
=======
// Images read
Route::get('/image/{filename}', [App\Http\Controllers\ImageFileController::class, 'getImage'])->name('image.get');
>>>>>>> main

// DEBUG DE GOLMON
Route::get('/apy', function () {
    return view('apy');
})->name('apy');
Route::get('/valr', function () {
    return view('validationTest');
});

require __DIR__.'/settings.php';
