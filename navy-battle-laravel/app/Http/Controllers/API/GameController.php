<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Game;
use App\Models\Board;
use App\Models\Ship;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class GameController extends Controller
{
    /**
     * Obtener listado de juegos
     */
    public function index()
    {
        $games = Game::with('user')->get();
        return response()->json($games);
    }

    /**
     * Almacenar un nuevo juego
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,user_id',
            'board_data' => 'required|array',
            'ships' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Crear el juego
        $game = Game::create([
            'user_id' => $request->user_id,
            'status' => 'active',
        ]);

        // Crear el tablero
        $board = Board::create([
            'game_id' => $game->game_id,
            'board_data_json' => json_encode($request->board_data),
        ]);

        // Crear los barcos
        foreach ($request->ships as $shipData) {
            Ship::create([
                'board_id' => $board->board_id,
                'game_id' => $game->game_id,
                'ship_type' => $shipData['ship_type'],
                'size' => $shipData['size'],
                'start_x' => $shipData['start_x'],
                'start_y' => $shipData['start_y'],
                'orientation' => $shipData['orientation'],
                'is_destroyed' => false,
            ]);
        }

        $game->load(['board', 'ships']);
        return response()->json($game, 201);
    }

    /**
     * Mostrar un juego específico
     */
    public function show($id)
    {
        $game = Game::with(['user', 'board', 'ships'])->findOrFail($id);
        return response()->json($game);
    }

    /**
     * Actualizar un juego (por ejemplo, para registrar un disparo)
     */
    public function update(Request $request, $id)
    {
        $game = Game::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|in:active,finished',
            'total_shots' => 'sometimes|integer',
            'successful_shots' => 'sometimes|integer',
            'game_time' => 'sometimes|integer',
            'board_data' => 'sometimes|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Actualizar el juego
        if ($request->has('status')) {
            $game->status = $request->status;
            if ($request->status === 'finished') {
                $game->end_time = now();
            }
        }
        
        if ($request->has('total_shots')) {
            $game->total_shots = $request->total_shots;
        }
        
        if ($request->has('successful_shots')) {
            $game->successful_shots = $request->successful_shots;
        }
        
        if ($request->has('game_time')) {
            $game->game_time = $request->game_time;
        }
        
        $game->save();
        
        // Actualizar tablero si se proporciona
        if ($request->has('board_data')) {
            $board = $game->board;
            $board->board_data_json = json_encode($request->board_data);
            $board->save();
        }
        
        // Verificar si hay barcos para actualizar
        if ($request->has('ships')) {
            foreach ($request->ships as $shipData) {
                $ship = Ship::findOrFail($shipData['ship_id']);
                $ship->is_destroyed = $shipData['is_destroyed'];
                $ship->save();
            }
        }
        
        $game->load(['board', 'ships']);
        return response()->json($game);
    }

    /**
     * Eliminar un juego
     */
    public function destroy($id)
    {
        $game = Game::findOrFail($id);
        $game->delete();
        
        return response()->json(null, 204);
    }
    
    /**
     * Listar juegos activos
     */
    public function active()
    {
        $activeGames = Game::where('status', 'active')->with('user')->get();
        return response()->json($activeGames);
    }
}