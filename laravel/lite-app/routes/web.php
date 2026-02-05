<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\ArtistController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::get('/genpassword', function () {
    return view('genpassword');
})->name('genpassword');

Route::get('/test-music-player', [App\Http\Controllers\TestMusicPlayer::class, 'playMusic'])->name('test-music-player');

// Proxy pour les ressources externes (audio, images) - protégé par auth
Route::middleware('auth')->get('/proxy', [App\Http\Controllers\ProxyController::class, 'stream'])->name('proxy');

Route::get('/artiste/{id}' ,[ArtistController::class,"show"]);


require __DIR__.'/settings.php';
