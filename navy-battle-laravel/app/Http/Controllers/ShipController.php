<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Ship;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ShipController extends Controller
{
    /**
     * Obtener listado de barcos de un tablero
     */
    public function index($boardId)
    {
        $ships = Ship::where('board_id', $boardId)->get();
        return response()->json($ships);
    }

    /**
     * Obtener un barco específico
     */
    public function show($id)
    {
        $ship = Ship::findOrFail($id);
        return response()->json($ship);
    }

    /**
     * Actualizar un barco (para marcar como destruido)
     */
    public function update(Request $request, $id)
    {
        $ship = Ship::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'is_destroyed' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $ship->is_destroyed = $request->is_destroyed;
        $ship->save();
        
        return response()->json($ship);
    }
}
