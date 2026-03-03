<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::get('/user', [App\Http\Controllers\UserController::class, 'getUser'])
    ->name('getProfile')
    ->middleware('auth:sanctum');

Route::get('/user/info', [App\Http\Controllers\UserController::class, 'getInfo'])
    ->name('getInfo')
    ->middleware('auth:sanctum');

Route::patch('/user/profile', [App\Http\Controllers\UserController::class, 'updateUserProfile'])
    ->name('updateProfile')
    ->middleware('auth:sanctum');

Route::patch('/user/info', [App\Http\Controllers\UserController::class, 'updateUserInfo'])
    ->name('updateInfo')
    ->middleware('auth:sanctum');

Route::middleware('web')->group(function () {
    Route::get('/token/create', function (Request $request) {
        $token = $request->user()->createToken($request->token_name);

        return ['token' => $token->plainTextToken];
    });

    Route::get('/whoami', function (Request $request) {
        return $request->user();
    });
});
