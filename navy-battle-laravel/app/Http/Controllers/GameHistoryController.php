<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\Board;
use App\Models\Ship;
use Illuminate\Support\Facades\Auth;

class GameHistoryController extends Controller
{
    /**
     * List all games for the current user
     */
    public function index()
    {
        $games = Game::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json([
            'total_games' => $games->count(),
            'games' => $games->map(function($game) {
                return $this->formatGameSummary($game);
            })
        ]);
    }
    
    /**
     * List only active games for the current user
     */
    public function active()
    {
        $games = Game::where('user_id', Auth::id())
            ->whereIn('status', ['created', 'ready', 'in_progress'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json([
            'total_active_games' => $games->count(),
            'games' => $games->map(function($game) {
                return $this->formatGameSummary($game);
            })
        ]);
    }
    
    /**
     * List completed games for the current user
     */
    public function completed()
    {
        $games = Game::where('user_id', Auth::id())
            ->where('status', 'completed')
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json([
            'total_completed_games' => $games->count(),
            'games' => $games->map(function($game) {
                return $this->formatGameSummary($game);
            })
        ]);
    }
    
    /**
     * Get data needed to resume an existing game
     */
    public function resumeGame($gameId)
    {
        $game = Game::findOrFail($gameId);
        
        // Verify that the game belongs to the authenticated user
        if ($game->user_id != Auth::id()) {
            return response()->json(['error' => 'Not authorized to access this game'], 403);
        }
        
        // Check if the game can be resumed
        if (!in_array($game->status, ['ready', 'in_progress'])) {
            return response()->json([
                'error' => 'This game cannot be resumed',
                'status' => $game->status,
                'message' => $this->getStatusMessage($game->status)
            ], 400);
        }
        
        // Get the board with ships
        $board = Board::where('game_id', $gameId)->firstOrFail();
        
        // Get ships data
        $ships = Ship::where('game_id', $gameId)->get();
        
        // Count destroyed and remaining ships
        $totalShips = $ships->count();
        $destroyedShips = $ships->where('is_destroyed', true)->count();
        
        // Get revealed board (for display)
        $gamePlayController = new GamePlayController();
        $revealedBoardResponse = $gamePlayController->getRevealedBoard($gameId);
        $revealedBoardData = json_decode($revealedBoardResponse->getContent(), true);
        
        // Prepare response with all data needed to resume the game
        return response()->json([
            'game' => [
                'game_id' => $game->game_id,
                'status' => $game->status,
                'start_time' => $game->start_time,
                'total_shots' => $game->total_shots ?? 0,
                'successful_shots' => $game->successful_shots ?? 0,
                'accuracy' => $game->total_shots ? round(($game->successful_shots / $game->total_shots) * 100, 2) : 0,
                'time_elapsed' => $game->start_time ? now()->diffInSeconds($game->start_time) : 0,
            ],
            'ships' => [
                'total' => $totalShips,
                'destroyed' => $destroyedShips,
                'remaining' => $totalShips - $destroyedShips
            ],
            'board' => $revealedBoardData['board'], // The revealed board for display
            'message' => 'Game loaded successfully. Ready to resume.',
            'last_action_timestamp' => $board->updated_at
        ]);
    }
    
    /**
     * Format game summary for listing
     */
    private function formatGameSummary($game)
    {
        // Get ships data if needed
        $shipsData = null;
        
        if ($game->status != 'created') {
            $ships = Ship::where('game_id', $game->game_id)->get();
            $totalShips = $ships->count();
            $destroyedShips = $ships->where('is_destroyed', true)->count();
            
            $shipsData = [
                'total' => $totalShips,
                'destroyed' => $destroyedShips,
                'remaining' => $totalShips - $destroyedShips
            ];
        }
        
        // Format the game data
        return [
            'game_id' => $game->game_id,
            'status' => $game->status,
            'status_text' => $this->getStatusMessage($game->status),
            'created_at' => $game->created_at,
            'start_time' => $game->start_time,
            'last_played' => $game->updated_at,
            'total_shots' => $game->total_shots ?? 0,
            'successful_shots' => $game->successful_shots ?? 0,
            'accuracy' => $game->total_shots ? round(($game->successful_shots / $game->total_shots) * 100, 2) : 0,
            'time_elapsed' => $game->start_time ? ($game->end_time ?? now())->diffInSeconds($game->start_time) : 0,
            'ships' => $shipsData,
            'can_resume' => in_array($game->status, ['ready', 'in_progress'])
        ];
    }
    
    /**
     * Get a human-readable status message
     */
    private function getStatusMessage($status)
    {
        switch ($status) {
            case 'created':
                return 'Game created, waiting to place ships';
            case 'ready':
                return 'Game ready to play';
            case 'in_progress':
                return 'Game in progress';
            case 'completed':
                return 'Game completed';
            case 'abandoned':
                return 'Game abandoned';
            default:
                return 'Unknown status';
        }
    }
}