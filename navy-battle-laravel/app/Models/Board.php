<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Board extends Model
{
    use HasFactory;
    
    protected $primaryKey = 'board_id';

    protected $fillable = [
        'game_id',
        'board_data_json',
    ];

    protected $casts = [
        'board_data_json' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relaciones
    public function game()
    {
        return $this->belongsTo(Game::class, 'game_id');
    }

    public function ships()
    {
        return $this->hasMany(Ship::class, 'board_id');
    }
}
