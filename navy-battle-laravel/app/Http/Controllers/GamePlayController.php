<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\Board;
use App\Models\Ship;
use App\Models\UserStat;
use App\Models\Ranking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class GamePlayController extends Controller
{
    /**
     * Automatically place ships on the board for single player mode
     * This eliminates the need for the user to place ships manually
     */
    public function autoPlaceShips($gameId)
    {
        
        $game = Game::findOrFail($gameId);
        
        // Verify that the game belongs to the authenticated user
        if ($game->user_id != 14) {
            return response()->json(['error' => 'Not authorized to modify this game'], 403);
        }
        
        // Verify the game is in initial state
        if ($game->status != 'active') {
            return response()->json(['error' => 'Cannot place ships on a game that has already started'], 400);
        }
        
        // Get or create the board
        $board = Board::firstOrCreate(['game_id' => $gameId], [
            'board_data_json' => $this->createEmptyBoard()
        ]);

        DB::beginTransaction();
        
        try {
            // Delete existing ships if any
            Ship::where('board_id', $board->board_id)->delete();
            
            $boardData = $board->board_data_json;
            
            // Initialize empty board
            for ($i = 0; $i < 10; $i++) {
                for ($j = 0; $j < 10; $j++) {
                    $boardData[$i][$j] = [
                        'state' => 'water',
                        'ship_id' => null,
                        'hit' => false
                    ];
                }
            }
            
            // Valid ship types and their sizes
            $shipTypes = [
                'carrier' => 5,
                'battleship' => 4,
                'cruiser' => 3,
                'submarine' => 3,
                'destroyer' => 2
            ];
            
            // Place each ship randomly on the board
            foreach ($shipTypes as $type => $size) {
                $placed = false;
                $maxAttempts = 100; // Prevent infinite loops
                $attempts = 0;
                
                while (!$placed && $attempts < $maxAttempts) {
                    $attempts++;
                    
                    // Randomly decide orientation
                    $orientation = rand(0, 1) ? 'horizontal' : 'vertical';
                    
                    // Generate random coordinates based on orientation
                    if ($orientation == 'horizontal') {
                        $startX = rand(0, 10 - $size);
                        $startY = rand(0, 9);
                    } else {
                        $startX = rand(0, 9);
                        $startY = rand(0, 10 - $size);
                    }
                    
                    // Check if all cells are free for the ship
                    $canPlaceShip = true;
                    for ($i = 0; $i < $size; $i++) {
                        $x = $orientation == 'horizontal' ? $startX + $i : $startX;
                        $y = $orientation == 'vertical' ? $startY + $i : $startY;
                        
                        if ($boardData[$x][$y]['state'] !== 'water') {
                            $canPlaceShip = false;
                            break;
                        }
                    }
                    
                    // If can place ship, create it and update board
                    if ($canPlaceShip) {
                        $ship = Ship::create([
                            'board_id' => $board->board_id,
                            'game_id' => $gameId,
                            'ship_type' => $type,
                            'size' => $size,
                            'start_x' => $startX,
                            'start_y' => $startY,
                            'orientation' => $orientation,
                            'is_destroyed' => false
                        ]);
                        
                        // Place the ship on the board
                        for ($i = 0; $i < $size; $i++) {
                            $x = $orientation == 'horizontal' ? $startX + $i : $startX;
                            $y = $orientation == 'vertical' ? $startY + $i : $startY;
                            
                            $boardData[$x][$y] = [
                                'state' => 'ship',
                                'ship_id' => $ship->ship_id,
                                'hit' => false
                            ];
                        }
                        
                        $placed = true;
                    }
                }
                
                // If after max attempts, still couldn't place the ship
                if (!$placed) {
                    DB::rollBack();
                    return response()->json(['error' => 'Failed to place ships after multiple attempts. Please try again.'], 500);
                }
            }
            
            // Save the updated board
            $board->board_data_json = $boardData;
            $board->save();
            
            // Update game status
            $game->status = 'active';
            $game->save();
            
            DB::commit();
            
            return response()->json([
                'message' => 'Ships placed automatically',
                'game_id' => $gameId,
                'status' => 'active'
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Error placing ships: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Fire a shot at the board
     */
    public function fireShot(Request $request, $gameId)
    {
        // Validation
        $request->validate([
            'x' => 'required|integer|between:0,9',
            'y' => 'required|integer|between:0,9',
        ]);
        
        $game = Game::findOrFail($gameId);
        
        // Verify that the game belongs to the authenticated user
        if ($game->user_id != 14) {
            return response()->json(['error' => 'Not authorized to play this game'], 403);
        }
        
        // Verify the game is in a valid state for firing
        if ($game->status != 'active' && $game->status != 'active') {
            return response()->json(['error' => 'Cannot fire in the current game state'], 400);
        }
        
        // Get the board
        $board = Board::where('game_id', $gameId)->firstOrFail();
        $boardData = $board->board_data_json;
        
        // Shot coordinates
        $x = $request->x;
        $y = $request->y;
        
        // Check if already fired at this position
        if ($boardData[$x][$y]['hit'] === true) {
            return response()->json(['error' => 'Already fired at this position'], 400);
        }
        
        // Mark the shot on the board
        $boardData[$x][$y]['hit'] = true;
        
        // Determine shot result
        $result = [
            'hit' => false,
            'ship_destroyed' => false,
            'game_over' => false,
            'ship_type' => null
        ];
        
        // Update game status if it's the first shot
        if ($game->status === 'active') {
            $game->status = 'active';
            $game->start_time = now();
        }
        
        // Increment shot counter
        $game->total_shots = ($game->total_shots ?? 0) + 1;
        
        // If there's a ship at the position
        if ($boardData[$x][$y]['state'] === 'ship') {
            $shipId = $boardData[$x][$y]['ship_id'];
            $ship = Ship::findOrFail($shipId);
            
            $result['hit'] = true;
            $result['ship_type'] = $ship->ship_type;
            
            // Increment successful shots counter
            $game->successful_shots = ($game->successful_shots ?? 0) + 1;
            
            // Check if the ship has been destroyed
            $shipDestroyed = true;
            
            // Check all positions of the ship
            for ($i = 0; $i < $ship->size; $i++) {
                $checkX = $ship->orientation == 'horizontal' ? $ship->start_x + $i : $ship->start_x;
                $checkY = $ship->orientation == 'vertical' ? $ship->start_y + $i : $ship->start_y;
                
                // If any position of the ship hasn't been hit, it's not destroyed
                if ($boardData[$checkX][$checkY]['hit'] === false) {
                    $shipDestroyed = false;
                    break;
                }
            }
            
            // If the ship is destroyed, update it
            if ($shipDestroyed) {
                $ship->is_destroyed = true;
                $ship->save();
                $result['ship_destroyed'] = true;
                
                // Check if all ships have been destroyed (game over)
                $allShipsDestroyed = Ship::where('game_id', $gameId)
                    ->where('is_destroyed', false)
                    ->count() === 0;
                
                if ($allShipsDestroyed) {
                    $result['game_over'] = true;
                    $game->status = 'finished';
                    $game->end_time = now();
                    $game->game_time = $game->end_time->diffInSeconds($game->start_time);
                    
                    // Update user stats
                    $this->updateUserStats($game);
                }
            }
        }
        
        // Save changes to the board and game
        $board->board_data_json = $boardData;
        $board->save();
        $game->save();
        
        // Prepare response
        $response = [
            'result' => $result,
            'position' => ['x' => $x, 'y' => $y],
            'game_status' => $game->status
        ];
        
        // If the game is over, include stats
        if ($result['game_over']) {
            $response['stats'] = [
                'total_shots' => $game->total_shots,
                'successful_shots' => $game->successful_shots,
                'accuracy' => round(($game->successful_shots / $game->total_shots) * 100, 2),
                'time_seconds' => $game->game_time
            ];
        }
        
        return response()->json($response);
    }
    
    /**
     * Get the current game state
     */
    public function getGameState($gameId)
    {
        $game = Game::with('ships')->findOrFail($gameId);
        
        // Verify that the game belongs to the authenticated user
        if ($game->user_id != 14) {
            return response()->json(['error' => 'Not authorized to view this game'], 403);
        }
        
        $board = Board::where('game_id', $gameId)->firstOrFail();
        
        // Count destroyed ships
        $ships = Ship::where('game_id', $gameId)->get();
        $totalShips = $ships->count();
        $destroyedShips = $ships->where('is_destroyed', true)->count();
        
        return response()->json([
            'game_id' => $game->game_id,
            'status' => $game->status,
            'total_shots' => $game->total_shots ?? 0,
            'successful_shots' => $game->successful_shots ?? 0,
            'accuracy' => $game->total_shots ? round(($game->successful_shots / $game->total_shots) * 100, 2) : 0,
            'time_elapsed' => $game->start_time ? ($game->end_time ?? now())->diffInSeconds($game->start_time) : 0,
            'ships' => [
                'total' => $totalShips,
                'destroyed' => $destroyedShips,
                'remaining' => $totalShips - $destroyedShips
            ]
        ]);
    }
    
    /**
 * Get the player's board with revealed hits/misses
 * This replaces getOpponentBoard since in single player there's only one board
 */
public function getRevealedBoard($gameId)
{
    $game = Game::findOrFail($gameId);
    
    // Verify that the game belongs to the authenticated user
    if ($game->user_id != 14) {
        return response()->json(['error' => 'Not authorized to view this game'], 403);
    }
    
    $board = Board::where('game_id', $gameId)->firstOrFail();
    $boardData = $board->board_data_json;
    
    // Create a version of the board that only shows hits/misses
    $revealedBoard = [];
    
    // Inicializar un tablero vacío con estructura consistente
    for ($y = 0; $y < 10; $y++) {
        $revealedBoard[$y] = [];
        for ($x = 0; $x < 10; $x++) {
            $revealedBoard[$y][$x] = [
                'state' => 'unknown',
                'hit' => false
            ];
        }
    }
    
    // Rellenar el tablero con los datos reales
    for ($y = 0; $y < 10; $y++) {
        for ($x = 0; $x < 10; $x++) {
            // Asegurarse que existen los datos para esta coordenada
            if (isset($boardData[$x][$y])) {
                $cell = $boardData[$x][$y];
                
                if ($cell['hit'] === true) {
                    // Show hit or miss
                    $revealedBoard[$y][$x]['state'] = $cell['state'] === 'ship' ? 'hit' : 'miss';
                    $revealedBoard[$y][$x]['hit'] = true;
                    
                    // If it's a destroyed ship, show the type
                    if ($cell['state'] === 'ship') {
                        $ship = Ship::find($cell['ship_id']);
                        if ($ship && $ship->is_destroyed) {
                            $revealedBoard[$y][$x]['ship_type'] = $ship->ship_type;
                            
                            // Reveal the entire ship when destroyed
                            for ($k = 0; $k < $ship->size; $k++) {
                                $shipX = $ship->orientation == 'horizontal' ? $ship->start_x + $k : $ship->start_x;
                                $shipY = $ship->orientation == 'vertical' ? $ship->start_y + $k : $ship->start_y;
                                
                                // Asegurar que las coordenadas son válidas
                                if ($shipX >= 0 && $shipX < 10 && $shipY >= 0 && $shipY < 10) {
                                    $revealedBoard[$shipY][$shipX]['ship_type'] = $ship->ship_type;
                                    $revealedBoard[$shipY][$shipX]['part_of_ship'] = true;
                                    
                                    // Si esta parte del barco fue golpeada, mostrar como 'hit'
                                    if (isset($boardData[$shipX][$shipY]) && $boardData[$shipX][$shipY]['hit'] === true) {
                                        $revealedBoard[$shipY][$shipX]['state'] = 'hit';
                                        $revealedBoard[$shipY][$shipX]['hit'] = true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Verificar que todas las celdas tengan las propiedades correctas
    for ($y = 0; $y < 10; $y++) {
        for ($x = 0; $x < 10; $x++) {
            if (!isset($revealedBoard[$y][$x]['state'])) {
                $revealedBoard[$y][$x]['state'] = 'unknown';
            }
            if (!isset($revealedBoard[$y][$x]['hit'])) {
                $revealedBoard[$y][$x]['hit'] = false;
            }
        }
    }
    
    return response()->json([
        'game_id' => $gameId,
        'board' => $revealedBoard
    ]);
}
    
    /**
     * Start a new game with auto-placed ships
     * This is a convenience method that creates a game and places ships automatically
     */
    public function startNewGameWithAutoShips()
    {
        DB::beginTransaction();
        
        try {
            // Create a new game
            $game = Game::create([
                'user_id' => 14,
                'status' => 'active',
                'total_shots' => 0,
                'successful_shots' => 0
            ]);

            
            
            // Create an empty board
            $board = Board::create([
                'game_id' => $game->game_id,
                'board_data_json' => $this->createEmptyBoard()
            ]);
            
            // Place ships automatically
            $result = $this->autoPlaceShips($game->game_id);
            
            // If ships were placed successfully
            if ($result->getStatusCode() === 200) {
                DB::commit();
                
                return response()->json([
                    'message' => 'New game started with ships placed automatically',
                    'game' => $game,
                    'ready_to_play' => true
                ]);
            } else {
                // If there was an error, roll back
                DB::rollBack();
                return $result;
            }
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Error creating game: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Update user stats when a game is finished
     */
    private function updateUserStats(Game $game)
    {
        $userId = $game->user_id;
        
        // Update user statistics
        $userStat = UserStat::firstOrCreate(['user_id' => $userId], [
            'total_games' => 0,
            'games_won' => 0,
            'total_shots' => 0,
            'hits' => 0
        ]);
        
        $userStat->total_games += 1;
        $userStat->games_won += 1; // In this game, if it ends, the player always wins
        $userStat->total_shots += $game->total_shots;
        $userStat->hits += $game->successful_shots;
        $userStat->save();
        
        // Update ranking
        $accuracy = $game->total_shots > 0 ? ($game->successful_shots / $game->total_shots) * 100 : 0;
        $score = $this->calculateScore($game->total_shots, $accuracy, $game->game_time);
        
        // Get or create ranking
        $ranking = Ranking::firstOrCreate(['user_id' => $userId], [
            'score' => 0,
            'game_count' => 0,
            'average_time' => 0
        ]);
        
        // Update score (keep the best)
        $ranking->score = max($ranking->score, $score);
        $ranking->game_count += 1;
        
        // Update average time
        $totalTime = $ranking->average_time * ($ranking->game_count - 1) + $game->game_time;
        $ranking->average_time = $totalTime / $ranking->game_count;
        
        $ranking->save();
    }
    
    /**
     * Calculate score based on shots, accuracy, and time
     */
    private function calculateScore($totalShots, $accuracy, $timeSeconds)
    {
        // Scoring factors
        $baseShotScore = 1000; // Base score for completing the game
        $shotPenalty = 5; // Penalty per shot
        $accuracyBonus = 10; // Bonus for accuracy
        $timeBonus = 100; // Bonus for time
        
        // Score calculation
        $shotScore = $baseShotScore - ($totalShots * $shotPenalty);
        $accuracyScore = $accuracy * $accuracyBonus;
        
        // Time bonus (better if less)
        $timeScore = $timeSeconds < 300 ? (300 - $timeSeconds) * ($timeBonus / 300) : 0;
        
        // Total score (minimum 0)
        $totalScore = max(0, $shotScore + $accuracyScore + $timeScore);
        
        return round($totalScore);
    }
    
    /**
     * Create an empty 10x10 board
     */
    private function createEmptyBoard()
    {
        $board = [];
        
        for ($i = 0; $i < 10; $i++) {
            for ($j = 0; $j < 10; $j++) {
                $board[$i][$j] = [
                    'state' => 'water',
                    'ship_id' => null,
                    'hit' => false
                ];
            }
        }
        
        return $board;
    }
   /**
 * Abandon a game but keep it active for resuming later
 */
public function abandonGame($gameId)
{
    $game = Game::findOrFail($gameId);
    
    // Verify that the game belongs to the authenticated user
    if ($game->user_id != 14) {
        return response()->json(['error' => 'Not authorized to modify this game'], 403);
    }
    
    // Solo modificamos si el juego está activo
    if ($game->status == 'active') {
        // Mantenemos el estado como "active" para que pueda reanudarse
        $game->status = 'active';
        $game->save();
        
        return response()->json([
            'message' => 'Juego abandonado temporalmente. Puedes reanudarlo más tarde.',
            'game_id' => $gameId,
            'status' => $game->status
        ]);
    }
    
    return response()->json([
        'message' => 'El juego ya no está activo.',
        'game_id' => $gameId,
        'status' => $game->status
    ]);
}
}