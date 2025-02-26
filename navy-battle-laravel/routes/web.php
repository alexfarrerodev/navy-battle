<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserStatController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\BoardController;
use App\Http\Controllers\ShipController;
use App\Http\Controllers\RankingController;
use App\Http\Controllers\GamePlayController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Fix for login route not defined error
Route::get('login', function(){
    return response()->json(['message' => 'Please login to continue'], 401);
})->name('login');

// Authentication routes
Route::post('auth/register', [UserController::class, 'register']);
Route::post('auth/login', [UserController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('auth/logout', [UserController::class, 'logout']);
    Route::get('auth/me', [UserController::class, 'me']);
    
    // Users
    Route::apiResource('users', UserController::class);
    
    // User statistics
    Route::get('users/{userId}/stats', [UserStatController::class, 'show']);
    
    // Games
    Route::get('games', [GameController::class, 'index']);
    Route::get('games/{id}', [GameController::class, 'show']);
    Route::get('games/status/active', [GameController::class, 'active']);
    
    // Single Player Game Management
    Route::post('games/start', [GamePlayController::class, 'startNewGameWithAutoShips']); // New endpoint that auto-places ships
    Route::post('games/{gameId}/finish', [GameController::class, 'finishGame']);
    
    // Game Interaction - Single Player
    Route::post('games/{gameId}/auto-place-ships', [GamePlayController::class, 'autoPlaceShips']); // Manual triggering
    Route::post('games/{gameId}/fire', [GamePlayController::class, 'fireShot']);
    Route::get('games/{gameId}/state', [GamePlayController::class, 'getGameState']);
    Route::get('games/{gameId}/board', [GamePlayController::class, 'getRevealedBoard']); // Renamed from getOpponentBoard
    
    // Rankings
    Route::get('rankings', [RankingController::class, 'index']);
    Route::get('users/{userId}/ranking', [RankingController::class, 'show']);
});