<?php

namespace App\Http\Controllers;

use App\Models\Playlist;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ImageFileController extends Controller
{
    public function uploadImage(Request $request)
    {
        $request->validate([
            'formData' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:3072'],
            'table' => ['required'],
            'playlist_id' => ['required_if:table,playlist', 'integer', 'exists:playlist,playlist_id'],
        ]);

        $file = $request->file('formData');
        $fileName = Str::uuid().'.'.$file->getClientOriginalExtension();
        $file->storeAs('public/images', $fileName);

        // Enregistre le path de l'image dans la base de données
        if ($request->table === 'user') {
            $user = auth()->user();
            $user->user_image_file = 'storage/images/'.$fileName;
            $user->save();
        } elseif ($request->table === 'playlist') {
            $playlist = Playlist::find($request->playlist_id);
            $playlist->playlist_image_file = 'storage/images/'.$fileName;
            $playlist->save();
        }

        return response()->json(['message' => 'Image uploaded successfully', 'path' => 'storage/images/'.$fileName], 200);
    }

    public function updateImage(Request $request)
    {
        $request->validate([
            'formData' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:3072'],
            'table' => ['required'],
            'playlist_id' => ['required_if:table,playlist', 'integer', 'exists:playlist,playlist_id'],
        ]);

        $file = $request->file('formData');
        $fileName = Str::uuid().'.'.$file->getClientOriginalExtension();
        $file->storeAs('public/images', $fileName);

        // Enregistre le path de l'image dans la base de données
        if ($request->table === 'user') {
            // retire l'image précédente si elle existe
            if (auth()->user()->user_image_file) {
                $oldImagePath = str_replace('storage/', 'public/', auth()->user()->user_image_file);
                if (file_exists(storage_path('app/'.$oldImagePath))) {
                    unlink(storage_path('app/'.$oldImagePath));
                }
            }

            $user = auth()->user();
            $user->user_image_file = 'storage/images/'.$fileName;
            $user->save();
        } elseif ($request->table === 'playlist') {
            if ($request->playlist_id) {
                $playlist = Playlist::find($request->playlist_id);
                if ($playlist && $playlist->playlist_image_file) {
                    $oldImagePath = str_replace('storage/', 'public/', $playlist->playlist_image_file);
                    if (file_exists(storage_path('app/'.$oldImagePath))) {
                        unlink(storage_path('app/'.$oldImagePath));
                    }
                }
            }
            $playlist = Playlist::find($request->playlist_id);
            $playlist->playlist_image_file = 'storage/images/'.$fileName;
            $playlist->save();
        }

        return response()->json(['message' => 'Image updated successfully', 'path' => 'storage/images/'.$fileName], 200);
    }

    public function deleteImage(Request $request)
    {
        $request->validate([
            'table' => ['required'],
            'playlist_id' => ['required_if:table,playlist', 'integer', 'exists:playlist,playlist_id'],
        ]);

        if ($request->table === 'user') {
            if (auth()->user()->user_image_file) {
                $oldImagePath = str_replace('storage/', 'public/', auth()->user()->user_image_file);
                if (file_exists(storage_path('app/'.$oldImagePath))) {
                    unlink(storage_path('app/'.$oldImagePath));
                }
                auth()->user()->user_image_file = null;
                auth()->user()->save();
            }
        } elseif ($request->table === 'playlist') {
            if ($request->playlist_id) {
                $playlist = Playlist::find($request->playlist_id);
                if ($playlist && $playlist->playlist_image_file) {
                    $oldImagePath = str_replace('storage/', 'public/', $playlist->playlist_image_file);
                    if (file_exists(storage_path('app/'.$oldImagePath))) {
                        unlink(storage_path('app/'.$oldImagePath));
                    }
                    $playlist->playlist_image_file = null;
                    $playlist->save();
                }
            }
        }

        return response()->json(['message' => 'Image deleted successfully'], 200);
    }
}
