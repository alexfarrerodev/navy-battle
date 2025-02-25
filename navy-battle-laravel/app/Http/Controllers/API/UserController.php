<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    /**
     * Registrar un nuevo usuario
     */
    public function register(Request $request)
    {
        
        try{
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

        // Crear token de acceso
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }catch (\Exception $e){
        return response()->json($e->getMessage());
    }
    }

    /**
     * Iniciar sesión
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Buscar usuario por email
        $user = User::where('email', $request->email)->first();
        
        // Verificar si el usuario existe y la contraseña es correcta
        if (!$user || !Hash::check($request->password, $user->password_hash)) {
            return response()->json([
                'message' => 'Credenciales incorrectas'
            ], 401);
        }
        
        // Actualizar último login
        $user->last_login = now();
        $user->save();

        // Crear nuevo token
        $token = $user->createToken('auth_token')->plainTextToken;
        
        return response()->json([
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Cerrar sesión
     */
    public function logout(Request $request)
    {
        // Revocar todos los tokens del usuario actual
        $request->user()->tokens()->delete();
        
        return response()->json([
            'message' => 'Sesión cerrada correctamente'
        ]);
    }

    /**
     * Obtener usuario actual
     */
    public function me(Request $request)
    {
        return response()->json($request->user()->load(['stats', 'ranking']));
    }

    // Los métodos existentes permanecen igual...
    public function index()
    {
        $users = User::with('stats')->get();
        return response()->json($users);
    }

    public function store(Request $request)
    {
        // Este método puede redirigir al register para mantener coherencia
        return $this->register($request);
    }

    public function show($id)
    {
        $user = User::with(['stats', 'games', 'ranking'])->findOrFail($id);
        return response()->json($user);
    }

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

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        
        return response()->json(null, 204);
    }
}