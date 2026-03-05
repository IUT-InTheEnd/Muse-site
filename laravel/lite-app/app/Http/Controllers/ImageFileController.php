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
        $file->storeAs('images', $fileName, 'public');

        // Enregistre le path de l'image dans la base de données
        if ($request->table === 'user') {
            $user = auth()->user();

            // Supprime l'ancienne image si elle existe
            if ($user->user_image_file) {
                $oldPath = storage_path('app/public/images/'.$user->user_image_file);
                if (file_exists($oldPath)) {
                    unlink($oldPath);
                }
            }

            $user->user_image_file = $fileName;
            $user->save();
        } elseif ($request->table === 'playlist') {
            $playlist = Playlist::find($request->playlist_id);
            $playlist->playlist_image_file = $fileName;
            $playlist->save();
        }

        return back();
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
        $file->storeAs('images', $fileName, 'public');

        // Enregistre le path de l'image dans la base de données
        if ($request->table === 'user') {
            // retire l'image précédente si elle existe
            if (auth()->user()->user_image_file) {
                $oldPath = storage_path('app/public/images/'.auth()->user()->user_image_file);
                if (file_exists($oldPath)) {
                    unlink($oldPath);
                }
            }

            $user = auth()->user();
            $user->user_image_file = $fileName;
            $user->save();
        } elseif ($request->table === 'playlist') {
            if ($request->playlist_id) {
                $playlist = Playlist::find($request->playlist_id);
                if ($playlist && $playlist->playlist_image_file) {
                    $oldPath = storage_path('app/public/images/'.$playlist->playlist_image_file);
                    if (file_exists($oldPath)) {
                        unlink($oldPath);
                    }
                }
            }
            $playlist = Playlist::find($request->playlist_id);
            $playlist->playlist_image_file = $fileName;
            $playlist->save();
        }

        return back();
    }

    public function deleteImage(Request $request)
    {
        $request->validate([
            'table' => ['required'],
            'playlist_id' => ['required_if:table,playlist', 'integer', 'exists:playlist,playlist_id'],
        ]);

        if ($request->table === 'user') {
            if (auth()->user()->user_image_file) {
                $oldPath = storage_path('app/public/images/'.auth()->user()->user_image_file);
                if (file_exists($oldPath)) {
                    unlink($oldPath);
                }
                auth()->user()->user_image_file = null;
                auth()->user()->save();
            }
        } elseif ($request->table === 'playlist') {
            if ($request->playlist_id) {
                $playlist = Playlist::find($request->playlist_id);
                if ($playlist && $playlist->playlist_image_file) {
                    $oldPath = storage_path('app/public/images/'.$playlist->playlist_image_file);
                    if (file_exists($oldPath)) {
                        unlink($oldPath);
                    }
                    $playlist->playlist_image_file = null;
                    $playlist->save();
                }
            }
        }

        return back();
    }

    public function getImage(string $filename)
    {
        $path = storage_path('app/public/images/'.$filename);

        if (! file_exists($path)) {
            abort(404);
        }

        $lastModified = filemtime($path);
        $etag = md5_file($path);

        return response()->file($path, [
            'Cache-Control' => 'public, max-age=31536000, immutable',
            'ETag' => $etag,
            'Last-Modified' => gmdate('D, d M Y H:i:s', $lastModified).' GMT',
        ]);
    }
}
