-- Creación de la base de datos
CREATE DATABASE IF NOT EXISTS naval_battle;
USE naval_battle;

-- Tabla de usuarios
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Tabla de estadísticas de usuario
CREATE TABLE user_stats (
    user_id INT PRIMARY KEY,
    total_games INT DEFAULT 0,
    games_won INT DEFAULT 0,
    total_shots INT DEFAULT 0,
    hits INT DEFAULT 0,
    total_time_played INT DEFAULT 0, -- en segundos
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Tabla de partidas
CREATE TABLE games (
    game_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    status ENUM('active', 'completed', 'abandoned') DEFAULT 'active',
    total_shots INT DEFAULT 0,
    successful_shots INT DEFAULT 0,
    game_time INT DEFAULT 0, -- tiempo en segundos
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Tabla de barcos
CREATE TABLE ships (
    ship_id INT PRIMARY KEY AUTO_INCREMENT,
    game_id INT NOT NULL,
    ship_type ENUM('carrier', 'battleship', 'cruiser', 'submarine', 'destroyer') NOT NULL,
    size INT NOT NULL,
    is_sunk BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (game_id) REFERENCES games(game_id)
);

-- Tabla de coordenadas de barcos
CREATE TABLE ship_coordinates (
    coord_id INT PRIMARY KEY AUTO_INCREMENT,
    ship_id INT NOT NULL,
    x_coord INT NOT NULL,
    y_coord INT NOT NULL,
    is_hit BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (ship_id) REFERENCES ships(ship_id)
);

-- Tabla de disparos realizados
CREATE TABLE shots (
    shot_id INT PRIMARY KEY AUTO_INCREMENT,
    game_id INT NOT NULL,
    x_coord INT NOT NULL,
    y_coord INT NOT NULL,
    is_hit BOOLEAN NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(game_id)
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_game_user ON games(user_id);
CREATE INDEX idx_ship_game ON ships(game_id);
CREATE INDEX idx_shot_game ON shots(game_id);
CREATE INDEX idx_ship_coords ON ship_coordinates(ship_id);

-- Tabla para ranking (opcional)
CREATE TABLE rankings (
    ranking_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    score INT NOT NULL,
    game_count INT NOT NULL,
    average_time FLOAT NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);