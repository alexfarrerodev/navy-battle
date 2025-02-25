<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Board;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BoardController extends Controller
{
    /**
     * Obtener un tablero específico
     */
    public function show($id)
    {
        $board = Board::with(['game', 'ships'])->findOrFail($id);
        return response()->json($board);
    }

    /**
     * Actualizar un tablero (para registrar disparos)
     */
    public function update(Request $request, $id)
    {
        $board = Board::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'board_data_json' => 'required|json',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $board->board_data_json = $request->board_data_json;
        $board->save();
        
        return response()->json($board);
    }
}