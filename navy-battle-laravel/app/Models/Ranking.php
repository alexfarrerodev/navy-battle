<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ranking extends Model
{
    use HasFactory;
    
    protected $primaryKey = 'ranking_id';
    const CREATED_AT = null;
    const UPDATED_AT = 'last_updated';

    protected $fillable = [
        'user_id',
        'score',
        'game_count',
        'average_time',
    ];

    protected $casts = [
        'last_updated' => 'datetime',
    ];

    // Relaciones
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}