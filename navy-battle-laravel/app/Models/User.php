<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $primaryKey = 'user_id';
    
    protected $fillable = [
        'username',
        'email',
        'password_hash',
    ];

    protected $hidden = [
        'password_hash',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'last_login' => 'datetime',
    ];

    // Relaciones
    public function stats()
    {
        return $this->hasOne(UserStat::class, 'user_id');
    }

    public function games()
    {
        return $this->hasMany(Game::class, 'user_id');
    }

    public function ranking()
    {
        return $this->hasOne(Ranking::class, 'user_id');
    }
}