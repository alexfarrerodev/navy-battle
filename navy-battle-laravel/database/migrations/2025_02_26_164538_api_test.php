<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table) {
                $table->id('user_id');
                $table->string('username', 50)->unique();
                $table->string('password_hash', 255);
                $table->string('email', 100)->unique();
                $table->timestamp('created_at')->useCurrent();
                $table->timestamp('last_login')->nullable();
            });
        }

        if (!Schema::hasTable('user_stats')) {
            Schema::create('user_stats', function (Blueprint $table) {
                $table->unsignedBigInteger('user_id')->primary();
                $table->integer('total_games')->default(0);
                $table->integer('games_won')->default(0);
                $table->integer('total_shots')->default(0);
                $table->integer('hits')->default(0);
                $table->foreign('user_id')->references('user_id')->on('users');
            });
        }

        if (!Schema::hasTable('games')) {
            Schema::create('games', function (Blueprint $table) {
                $table->id('game_id');
                $table->unsignedBigInteger('user_id');
                $table->timestamp('start_time')->useCurrent();
                $table->timestamp('end_time')->nullable();
                $table->enum('status', ['active', 'finished'])->default('active');
                $table->integer('total_shots')->default(0);
                $table->integer('successful_shots')->default(0);
                $table->integer('game_time')->default(0);
                $table->foreign('user_id')->references('user_id')->on('users');
            });
        }

        if (!Schema::hasTable('boards')) {
            Schema::create('boards', function (Blueprint $table) {
                $table->id('board_id');
                $table->unsignedBigInteger('game_id');
                $table->json('board_data_json');
                $table->timestamp('created_at')->useCurrent();
                $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
                $table->foreign('game_id')->references('game_id')->on('games');
            });
        }

        if (!Schema::hasTable('ships')) {
            Schema::create('ships', function (Blueprint $table) {
                $table->id('ship_id');
                $table->unsignedBigInteger('board_id');
                $table->unsignedBigInteger('game_id');
                $table->enum('ship_type', ['carrier', 'battleship', 'cruiser', 'submarine', 'destroyer']);
                $table->integer('size');
                $table->integer('start_x');
                $table->integer('start_y');
                $table->enum('orientation', ['horizontal', 'vertical']);
                $table->boolean('is_destroyed')->default(false);
                $table->foreign('board_id')->references('board_id')->on('boards');
                $table->foreign('game_id')->references('game_id')->on('games');
            });
        }

        if (!Schema::hasTable('rankings')) {
            Schema::create('rankings', function (Blueprint $table) {
                $table->id('ranking_id');
                $table->unsignedBigInteger('user_id');
                $table->integer('score');
                $table->integer('game_count');
                $table->float('average_time');
                $table->timestamp('last_updated')->useCurrent()->useCurrentOnUpdate();
                $table->foreign('user_id')->references('user_id')->on('users');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rankings');
        Schema::dropIfExists('ships');
        Schema::dropIfExists('boards');
        Schema::dropIfExists('games');
        Schema::dropIfExists('user_stats');
        Schema::dropIfExists('users');
    }
};