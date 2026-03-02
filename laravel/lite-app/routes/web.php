<?php

use App\Http\Controllers\AlbumController;
use App\Http\Controllers\ArtistController;
use App\Http\Controllers\FavoritesController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    if (auth()->check()) {
        return Inertia::render('dashboard');
    }

    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->get('/dashboard', function () {
    return redirect('/');
})->name('dashboard');

// Route::middleware(['auth', 'verified'])->group(function () {
//     Route::get('/', function () {
//         return Inertia::render('homepage');
//     })->name('homepage');
// });

Route::get('/genpassword', function () {
    return view('genpassword');
})->name('genpassword');

Route::get('/test-music-player', [App\Http\Controllers\MusicController::class, 'playMusic'])->name('test-music-player');

// Proxy pour les ressources externes (audio, images) - protégé par auth
Route::middleware('auth')->get('/proxy', [App\Http\Controllers\ProxyController::class, 'stream'])->name('proxy');

Route::middleware('auth')->get('/artiste/{id}' ,[ArtistController::class,"show"])->name('artist');
Route::middleware('auth')->get('/artiste/{id}/all' ,[ArtistController::class,"allTracks"])->name('artist/all_song');
Route::middleware('auth')->post('/artiste/{id}/follow', [ArtistController::class, 'follow'])->name('artist.follow');
Route::middleware('auth')->delete('/artiste/{id}/follow', [ArtistController::class, 'unfollow'])->name('artist.unfollow');


// Api user
Route::middleware('auth')->patch('/user/profile', [App\Http\Controllers\UserController::class, 'updateUserProfile'])->name('user.updateProfile');
Route::middleware('auth')->patch('/user/info', [App\Http\Controllers\UserController::class, 'updateUserInfo'])->name('user.updateInfo');

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

// favoris utilisateur
Route::middleware(['auth'])->group(function () {
    Route::get('/favoris', [FavoritesController::class, 'index'])
        ->name('favorites.index');
});

Route::get('/album/{id}', [AlbumController::class, 'view'])->name('album.view');

// route profile user publique
Route::get('/user/{username}', [App\Http\Controllers\UserController::class, 'show'])->name('user.profile');

// Images create/read/update/delete - protégé par auth
Route::get('/image/{filename}', [App\Http\Controllers\ImageFileController::class, 'getImage'])->name('image.get');
Route::middleware('auth')->post('/image', [App\Http\Controllers\ImageFileController::class, 'uploadImage'])->name('image.upload');
Route::middleware('auth')->patch('/image', [App\Http\Controllers\ImageFileController::class, 'updateImage'])->name('image.update');
Route::middleware('auth')->delete('/image', [App\Http\Controllers\ImageFileController::class, 'deleteImage'])->name('image.delete');

require __DIR__.'/settings.php';
