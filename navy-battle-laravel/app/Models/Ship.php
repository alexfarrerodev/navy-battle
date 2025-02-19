<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ship extends Model
{
    use HasFactory;
    
    protected $primaryKey = 'ship_id';
    public $timestamps = false;

    protected $fillable = [
        'board_id',
        'game_id',
        'ship_type',
        'size',
        'start_x',
        'start_y',
        'orientation',
        'is_destroyed',
    ];

    protected $casts = [
        'is_destroyed' => 'boolean',
    ];

    // Relaciones
    public function board()
    {
        return $this->belongsTo(Board::class, 'board_id');
    }

    public function game()
    {
        return $this->belongsTo(Game::class, 'game_id');
    }
}