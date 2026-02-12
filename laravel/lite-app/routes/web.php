<?php
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\ArtistController;
use App\Http\Controllers\FavoritesController;
use App\Http\Controllers\AlbumController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Route::middleware(['auth', 'verified'])->group(function () {
//     Route::get('/', function () {
//         return Inertia::render('homepage');
//     })->name('homepage');
// });

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::get('/genpassword', function () {
    return view('genpassword');
})->name('genpassword');

Route::get('/test-music-player', [App\Http\Controllers\MusicController::class, 'playMusic'])->name('test-music-player');

// Proxy pour les ressources externes (audio, images) - protégé par auth
Route::middleware('auth')->get('/proxy', [App\Http\Controllers\ProxyController::class, 'stream'])->name('proxy');

Route::get('/artiste/{id}' ,[ArtistController::class,"show"]);

// Api user
Route::middleware('auth')->patch('/user/profile', [App\Http\Controllers\UserController::class, 'updateUserProfile'])->name('user.updateProfile');
Route::middleware('auth')->patch('/user/info', [App\Http\Controllers\UserController::class, 'updateUserInfo'])->name('user.updateInfo');

// Routes pour les documentations
Route::prefix('documentation')->name('documentation.')->group(function () {
    Route::get('/', function () {
        return Inertia::render('documentation/index', [                 // accueil docs
            'links' => [
                'installation' => route('documentation.installation'),  // doc installation
                'api'          => route('documentation.api'),           // doc api
                'utilisation'  => route('documentation.utilisation'),   // doc utilisation
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

// Favoris
Route::get('/favoris', fn () => Inertia::render('favoris/index'))->name('favorites.index');

// // Playlist
// Route::middleware(['auth', 'verified'])->get('/playlist/{id}', [App\Http\Controllers\PlaylistController::class, 'index'])->name('playlist.index');

Route::get('/album/{id}', [AlbumController::class, 'view'])->name('album.view');

require __DIR__.'/settings.php';
