<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserStatController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\RankingController;
use App\Http\Controllers\GamePlayController;
use App\Http\Controllers\GameHistoryController;

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

// Game History & Resume Functionality
Route::get('games/history/all', [GameHistoryController::class, 'index']); // Lista todas las partidas del usuario actual
Route::get('games/history/active', [GameHistoryController::class, 'active']); // Lista solo partidas activas
Route::get('games/history/completed', [GameHistoryController::class, 'completed']); // Lista partidas completadas
Route::get('games/{gameId}/resume', [GameHistoryController::class, 'resumeGame']);

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
