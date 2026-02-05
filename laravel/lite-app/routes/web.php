<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

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

Route::get('/genpasswordtest', function () {
    return view('genpassword');
})->name('genpasswordtest');

Route::get('/mentionslegales', function () {
    return Inertia::render('mentionslegales');
})->name('mentionslegales');

Route::get('/support', function () {
    return Inertia::render('support');
})->name('support');

require __DIR__.'/settings.php';
