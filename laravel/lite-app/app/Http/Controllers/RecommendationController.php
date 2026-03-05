<?php

namespace App\Http\Controllers;

use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;
use Illuminate\Http\Request;

class RecommendationController extends Controller
{
    // Lien avec des scripts python pour les recommandations
    public function getRecommendations(Request $request)
    {
        $recommandationType = ['item_based_matheo', 'item_based_mathieu', 'echonest', 'user_based_p1', 'user_based_p2', 'user_based_p3', 'hybride'];

        $validated = $request->validate([
            'user_id' => 'required|integer,exists:users,id',
            'recommandation_type' => 'required|string|in:'.implode(',', $recommandationType),
        ]);

        switch ($request->recommandation_type) {
            case 'item_based_matheo':
                $scriptPath = app_path().'/Http/Controllers/RecommendationScripts/reco_item_based_matheo.py';
                $arguments = [];
                break;
            case 'item_based_mathieu':
                $scriptPath = app_path().'/Http/Controllers/RecommendationScripts/reco_item_based_mathieu.py';
                $arguments = [];
                break;
            case 'echonest':
                $scriptPath = app_path().'/Http/Controllers/RecommendationScripts/reco_steph_echonest.py';
                $arguments = [];
                break;
            case 'user_based_p1':
                $scriptPath = app_path().'/Http/Controllers/RecommendationScripts/reco_user_based_p1.py';
                $arguments = [];
                break;
            case 'user_based_p2':
                $scriptPath = app_path().'/Http/Controllers/RecommendationScripts/reco_user_based_p2.py';
                $arguments = [];
                break;
            case 'user_based_p3':
                $scriptPath = app_path().'/Http/Controllers/RecommendationScripts/reco_user_based_p3.py';
                $arguments = [];
                break;
            case 'hybride':
                $scriptPath = app_path().'/Http/Controllers/RecommendationScripts/hybride.py';
                $arguments = [];
                break;
        }

        $process = new Process(array_merge(['python3', $scriptPath], $arguments));
        $process->run();

        // executes after the command finishes
        if (! $process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }

        return $process->getOutput();

    }
}
