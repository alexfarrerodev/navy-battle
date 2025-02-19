<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserStat extends Model
{
    use HasFactory;

    protected $table = 'user_stats';
    protected $primaryKey = 'user_id';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'total_games',
        'games_won',
        'total_shots',
        'hits',
    ];

    // Relaciones
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}