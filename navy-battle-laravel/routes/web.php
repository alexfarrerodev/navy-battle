<?php


use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\UserStatController;
use App\Http\Controllers\API\GameController;
use App\Http\Controllers\API\BoardController;
use App\Http\Controllers\API\ShipController;
use App\Http\Controllers\API\RankingController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Middleware para proteger rutas (descomentar cuando implementes autenticación)
// Route::middleware('auth:sanctum')->group(function () {

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

// Rutas para rankings
Route::get('rankings', [RankingController::class, 'index']);
Route::get('users/{userId}/ranking', [RankingController::class, 'show']);
Route::put('users/{userId}/ranking', [RankingController::class, 'updateOrCreate']);

// }); // Cierre del middleware auth:sanctum