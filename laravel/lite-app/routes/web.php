<?php

use App\Http\Controllers\AlbumController;
use App\Http\Controllers\AdministratorController;
use App\Http\Controllers\ArtistController;
use App\Http\Controllers\FavoritesController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ImageFileController;
use App\Http\Controllers\MusicController;
use App\Http\Controllers\PlaylistController;
use App\Http\Controllers\PreferencesController;
use App\Http\Controllers\ProxyController;
use App\Http\Controllers\ReactionController;
use App\Http\Controllers\RecommendationController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserProfileController;
use App\Http\Middleware\RefreshVisitorCookie;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/recommendations/new-user', [RecommendationController::class, 'getNewUserRecommendations'])
    ->name('recommendations.new-user');

// Music player
Route::get('/test-music-player', [MusicController::class, 'playMusic'])->name('test-music-player');
Route::get('/tracks', [MusicController::class, 'playMusicBatch'])->name('tracks.batch');

// Proxy pour les ressources externes (audio, images)
Route::get('/proxy', [ProxyController::class, 'stream'])->name('proxy');

Route::get('/mentionslegales', function () {
    return Inertia::render('mentionslegales');
})->name('mentionslegales');

Route::get('/support', function () {
    return Inertia::render('support');
})->name('support');

Route::middleware([RefreshVisitorCookie::class])->group(function () {
    Route::get('/artiste/{id}', [ArtistController::class, 'show'])->name('artist');
    Route::get('/artiste/{id}/all', [ArtistController::class, 'allTracks'])->name('artist/all_song');
    Route::get('/album/{id}', [AlbumController::class, 'view'])->name('album.view');
    Route::get('/search', [SearchController::class, 'view'])->name('search.view');
});

Route::post('/reactions/tracks/{track}', [ReactionController::class, 'reactToTrack'])
    ->middleware(['throttle:30,1'])
    ->name('reactions.tracks.react');
Route::post('/reactions/albums/{album}', [ReactionController::class, 'reactToAlbum'])
    ->middleware(['throttle:30,1'])
    ->name('reactions.albums.react');

Route::get('/genpassword', function () {
    return view('genpassword');
})->name('genpassword');

// Routes pour les documentations
Route::prefix('documentation')->name('documentation.')->group(function () {
    Route::get('/', function () {
        return Inertia::render('documentation/index', [                 // accueil docs
            'links' => [
                'installation' => route('documentation.installation'),  // doc installation
                'api' => route('documentation.api'),           // doc api
                'utilisation' => route('documentation.utilisation'),   // doc utilisation
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

    Route::post('/add-listen', [MusicController::class, 'addListen'])->name('add-listen');

    // Recommendations
    Route::get('/recommendations', [RecommendationController::class, 'getRecommendations'])->name('recommendations.get');

    Route::post('/artiste/{id}/follow', [ArtistController::class, 'follow'])->name('artist.follow');
    Route::delete('/artiste/{id}/follow', [ArtistController::class, 'unfollow'])->name('artist.unfollow');

    // User profile
    Route::patch('/user/profile', [UserProfileController::class, 'updateUserProfile'])->name('user.updateProfile');
    Route::patch('/user/info', [UserController::class, 'updateUserInfo'])->name('user.updateInfo');

    // Favorites - User
    Route::get('/favorites', [FavoritesController::class, 'index'])->name('favorites.index');

    // Favorites - Tracks
    Route::post('/favorites/toggle', [FavoritesController::class, 'toggle'])->name('favorites.toggle');
    Route::post('/favorites/check', [FavoritesController::class, 'check'])->name('favorites.check');

    // Favorites - Albums
    Route::post('/favorites/album/toggle', [FavoritesController::class, 'toggleAlbum'])->name('favorites.album.toggle');
    Route::post('/favorites/album/check', [FavoritesController::class, 'checkAlbum'])->name('favorites.album.check');

    // Playlists
    Route::get('/playlists/user', [PlaylistController::class, 'getUserPlaylists'])->name('playlists.list');
    Route::get('/playlists/for-track', [PlaylistController::class, 'getUserPlaylistsForTrack'])->name('playlists.forTrack');
    Route::post('/playlists/create', [PlaylistController::class, 'create'])->name('playlists.create');
    Route::post('/playlists/add-track', [PlaylistController::class, 'addTrack'])->name('playlists.addTrack');
    Route::post('/playlists/remove-track', [PlaylistController::class, 'removeTrack'])->name('playlists.removeTrack');
    Route::post('/playlists/sync-track', [PlaylistController::class, 'syncTrackPlaylists'])->name('playlists.syncTrack');
    Route::patch('/playlists/update', [PlaylistController::class, 'update'])->name('playlists.update');
    Route::delete('/playlists/delete', [PlaylistController::class, 'delete'])->name('playlists.delete');

    // route playlist
    Route::get('/user/playlists', [PlaylistController::class, 'myPlaylists'])->name('my.playlists');
    Route::get('/playlist/{id}', [PlaylistController::class, 'show'])->name('playlist.show');

    // route preferences
    Route::get('/preferences', [PreferencesController::class, 'index'])
        ->middleware(['auth', 'verified'])
        ->name('preferences.index');
    Route::post('/preferences', [PreferencesController::class, 'store'])->name('preferences.store');

    // route profile user publique
    Route::get('/user/{username}', [UserController::class, 'show'])->name('user.profile');

    // page administrator
    Route::get('/administrator', [AdministratorController::class, 'show'])->name('administrator');

    // Images create/update/delete
    Route::post('/image', [ImageFileController::class, 'uploadImage'])->name('image.upload');
    Route::patch('/image', [ImageFileController::class, 'updateImage'])->name('image.update');
    Route::delete('/image', [ImageFileController::class, 'deleteImage'])->name('image.delete');
});

// Images read
Route::get('/image/{filename}', [ImageFileController::class, 'getImage'])->name('image.get');

// DEBUG DE GOLMON
Route::get('/apy', function () {
    return view('apy');
})->name('apy');
Route::get('/valr', function () {
    return view('validationTest');
});
Route::get('/rds', function () {
    return view('redisTest');
});

require __DIR__.'/settings.php';
