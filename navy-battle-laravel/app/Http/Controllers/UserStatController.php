<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\UserStat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserStatController extends Controller
{
    /**
     * Obtener estadísticas de un usuario
     */
    public function show($userId)
    {
        $stats = UserStat::where('user_id', $userId)->firstOrFail();
        return response()->json($stats);
    }

    /**
     * Actualizar estadísticas de un usuario
     */
    public function update(Request $request, $userId)
    {
        $stats = UserStat::where('user_id', $userId)->firstOrFail();
        
        $validator = Validator::make($request->all(), [
            'total_games' => 'sometimes|integer',
            'games_won' => 'sometimes|integer',
            'total_shots' => 'sometimes|integer',
            'hits' => 'sometimes|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->has('total_games')) {
            $stats->total_games = $request->total_games;
        }
        
        if ($request->has('games_won')) {
            $stats->games_won = $request->games_won;
        }
        
        if ($request->has('total_shots')) {
            $stats->total_shots = $request->total_shots;
        }
        
        if ($request->has('hits')) {
            $stats->hits = $request->hits;
        }
        
        $stats->save();
        
        return response()->json($stats);
    }
}