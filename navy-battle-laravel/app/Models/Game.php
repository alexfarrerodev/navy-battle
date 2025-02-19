<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    use HasFactory;
    
    protected $primaryKey = 'game_id';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'start_time',
        'end_time',
        'status',
        'total_shots',
        'successful_shots',
        'game_time',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'status' => 'string',
    ];

    // Relaciones
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function board()
    {
        return $this->hasOne(Board::class, 'game_id');
    }

    public function ships()
    {
        return $this->hasMany(Ship::class, 'game_id');
    }
}