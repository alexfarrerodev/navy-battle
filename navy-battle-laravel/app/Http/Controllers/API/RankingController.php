<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Ranking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RankingController extends Controller
{
    /**
     * Obtener el ranking completo
     */
    public function index()
    {
        $rankings = Ranking::with('user')
                    ->orderBy('score', 'desc')
                    ->get();
        return response()->json($rankings);
    }

    /**
     * Obtener el ranking de un usuario
     */
    public function show($userId)
    {
        $ranking = Ranking::where('user_id', $userId)->firstOrFail();
        return response()->json($ranking);
    }

    /**
     * Actualizar o crear el ranking de un usuario
     */
    public function updateOrCreate(Request $request, $userId)
    {
        $validator = Validator::make($request->all(), [
            'score' => 'required|integer',
            'game_count' => 'required|integer',
            'average_time' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $ranking = Ranking::updateOrCreate(
            ['user_id' => $userId],
            [
                'score' => $request->score,
                'game_count' => $request->game_count,
                'average_time' => $request->average_time,
            ]
        );
        
        return response()->json($ranking);
    }
}