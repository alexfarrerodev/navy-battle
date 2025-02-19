<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Obtener listado de usuarios
     */
    public function index()
    {
        $users = User::with('stats')->get();
        return response()->json($users);
    }

    /**
     * Almacenar un nuevo usuario
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|max:50|unique:users',
            'email' => 'required|string|email|max:100|unique:users',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password_hash' => Hash::make($request->password),
        ]);

        // Crear estadísticas iniciales
        $user->stats()->create([
            'total_games' => 0,
            'games_won' => 0,
            'total_shots' => 0,
            'hits' => 0
        ]);

        return response()->json($user, 201);
    }

    /**
     * Mostrar un usuario específico
     */
    public function show($id)
    {
        $user = User::with(['stats', 'games', 'ranking'])->findOrFail($id);
        return response()->json($user);
    }

    /**
     * Actualizar un usuario específico
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'username' => 'string|max:50|unique:users,username,'.$id.',user_id',
            'email' => 'string|email|max:100|unique:users,email,'.$id.',user_id',
            'password' => 'sometimes|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->has('username')) {
            $user->username = $request->username;
        }
        
        if ($request->has('email')) {
            $user->email = $request->email;
        }
        
        if ($request->has('password')) {
            $user->password_hash = Hash::make($request->password);
        }

        $user->save();
        
        return response()->json($user);
    }

    /**
     * Eliminar un usuario
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        
        return response()->json(null, 204);
    }
}