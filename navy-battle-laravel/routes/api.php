<?php


use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserStatController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\BoardController;
use App\Http\Controllers\ShipController;
use App\Http\Controllers\RankingController;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Rutas de autenticación (públicas)
Route::post('auth/register', [UserController::class, 'register']);
Route::post('auth/login', [UserController::class, 'login']);

// Todas las rutas protegidas
Route::middleware('auth:sanctum')->group(function () {
    // Ruta para obtener usuario actual
    Route::get('auth/me', [UserController::class, 'me']);
    Route::post('auth/logout', [UserController::class, 'logout']);
    
    // Rutas para usuarios
    Route::apiResource('users', UserController::class);
    
    // Rutas para estadísticas de usuario
    Route::get('users/{userId}/stats', [UserStatController::class, 'show']);
    Route::put('users/{userId}/stats', [UserStatController::class, 'update']);
    
    // Rutas para juegos
    Route::apiResource('games', GameController::class);
    Route::get('games/status/active', [GameController::class, 'active']);
    Route::get('users/{userId}/games', function ($userId) {
        $games = \App\Models\Game::where('user_id', $userId)->get();
        return response()->json($games);
    });
    
    // Ruta para iniciar una partida
    Route::post('games/start', [GameController::class, 'startNewGame']);
    // Ruta para finalizar una partida
    Route::post('games/{gameId}/finish', [GameController::class, 'finishGame']);
    
 
    // Rutas para tableros
    Route::get('boards/{id}', [BoardController::class, 'show']);
    Route::put('boards/{id}', [BoardController::class, 'update']);
    Route::get('games/{gameId}/board', function ($gameId) {
        $board = \App\Models\Board::where('game_id', $gameId)
            ->with('ships')
            ->firstOrFail();
        return response()->json($board);
    });
    
    // Rutas para barcos
    Route::get('ships/{id}', [ShipController::class, 'show']);
    Route::put('ships/{id}', [ShipController::class, 'update']);
    Route::get('boards/{boardId}/ships', [ShipController::class, 'index']);
    Route::post('boards/{boardId}/ships', [ShipController::class, 'store']);
    
    // Rutas para rankings
    Route::get('rankings', [RankingController::class, 'index']);
    Route::get('users/{userId}/ranking', [RankingController::class, 'show']);
    Route::put('users/{userId}/ranking', [RankingController::class, 'updateOrCreate']);
});