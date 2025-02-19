
DROP DATABASE IF EXISTS naval_battle;


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
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Tabla de partidas
CREATE TABLE games (
    game_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    status ENUM('active', 'finished') DEFAULT 'active',
    total_shots INT DEFAULT 0,
    successful_shots INT DEFAULT 0,
    game_time INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Tabla de tableros
CREATE TABLE boards (
    board_id INT PRIMARY KEY AUTO_INCREMENT,
    game_id INT NOT NULL,
    board_data_json JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(game_id)
);


-- Tabla de barcos
CREATE TABLE ships (
    ship_id INT PRIMARY KEY AUTO_INCREMENT,
    board_id INT NOT NULL,
    game_id INT NOT NULL,
    ship_type ENUM('carrier', 'battleship', 'cruiser', 'submarine', 'destroyer') NOT NULL,
    size INT NOT NULL,
    start_x INT NOT NULL,
    start_y INT NOT NULL,
    orientation ENUM('horizontal', 'vertical') NOT NULL,
    is_destroyed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (board_id) REFERENCES boards(board_id),
    FOREIGN KEY (game_id) REFERENCES games(game_id)
);

-- Tabla para ranking
CREATE TABLE rankings (
    ranking_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    score INT NOT NULL,
    game_count INT NOT NULL,
    average_time FLOAT NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Limpiamos tablas en orden inverso para evitar problemas de FK
DELETE FROM rankings;
DELETE FROM ships;
DELETE FROM boards;
DELETE FROM games;
DELETE FROM user_stats;
DELETE FROM users;

-- Reiniciamos los auto_increment
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE games AUTO_INCREMENT = 1;
ALTER TABLE boards AUTO_INCREMENT = 1;
ALTER TABLE ships AUTO_INCREMENT = 1;
ALTER TABLE rankings AUTO_INCREMENT = 1;


-- Mock data para users
INSERT INTO users (username, password_hash, email, created_at, last_login) VALUES
('player1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'player1@example.com', NOW(), NOW()),
('player2', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'player2@example.com', NOW(), NOW()),
('admiral', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admiral@example.com', NOW(), NOW()),
('captain', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'captain@example.com', NOW(), NOW()),
('sailor1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'sailor1@example.com', NOW(), NOW()),
('seadog', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'seadog@example.com', NOW(), NOW()),
('navigator', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'navigator@example.com', NOW(), NOW()),
('mariner', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mariner@example.com', NOW(), NOW()),
('seafarer', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'seafarer@example.com', NOW(), NOW()),
('pirate', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pirate@example.com', NOW(), NOW());

-- Mock data para user_stats
INSERT INTO user_stats (user_id, total_games, games_won, total_shots, hits) VALUES
(1, 15, 7, 120, 45),
(2, 20, 12, 180, 75),
(3, 8, 3, 65, 25),
(4, 25, 15, 200, 89),
(5, 12, 5, 95, 35),
(6, 30, 18, 250, 110),
(7, 10, 4, 85, 30),
(8, 18, 9, 150, 65),
(9, 22, 11, 190, 80),
(10, 16, 8, 130, 50);

-- Mock data para games
INSERT INTO games (user_id, start_time, end_time, status, total_shots, successful_shots, game_time) VALUES
(1, NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 1 HOUR, 'active', 25, 12, 3600),
(2, NOW() - INTERVAL 3 HOUR, NOW() - INTERVAL 2 HOUR, 'active', 30, 15, 3800),
(3, NOW() - INTERVAL 1 HOUR, NULL, 'active', 10, 5, 1800),
(4, NOW() - INTERVAL 4 HOUR, NOW() - INTERVAL 3 HOUR, 'finished', 28, 14, 4200),
(5, NOW() - INTERVAL 30 MINUTE, NULL, 'active', 8, 3, 900),
(6, NOW() - INTERVAL 5 HOUR, NOW() - INTERVAL 4 HOUR, 'active', 15, 7, 2400),
(7, NOW() - INTERVAL 6 HOUR, NOW() - INTERVAL 5 HOUR, 'finished', 22, 11, 3300),
(8, NOW() - INTERVAL 15 MINUTE, NULL, 'active', 5, 2, 600),
(9, NOW() - INTERVAL 7 HOUR, NOW() - INTERVAL 6 HOUR, 'finished', 27, 13, 3900),
(10, NOW() - INTERVAL 8 HOUR, NOW() - INTERVAL 7 HOUR, 'finished', 24, 12, 3500);

-- Mock data para boards
INSERT INTO boards (game_id, board_data_json) VALUES
(1, '[[0,0,0,"X",0,0,0,0,0,0],[0,0,0,0,"X",0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]]'),
(2, '[[0,0,0,0,0,0,0,0,0,0],[0,"X",0,0,0,0,0,0,0,0],[0,"X",0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]]'),
(3, '[[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,"X","X",0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]]'),
(4, '[[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,"X","X","X",0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]]'),
(5, '[[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,"X","X","X","X",0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]]'),
(6, '[[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,"X","X","X","X","X",0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]]'),
(7, '[[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,"X","X","X",0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]]'),
(8, '[[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,"X","X",0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]]'),
(9, '[[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],["X","X","X","X",0,0,0,0,0,0]]'),
(10, '[[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,"X","X","X",0,0,0,0,0]]');

-- Mock data para ships
INSERT INTO ships (board_id, game_id, ship_type, size, start_x, start_y, orientation, is_destroyed) VALUES
(1, 1, 'destroyer', 2, 0, 3, 'horizontal', false),
(2, 2, 'submarine', 3, 1, 1, 'vertical', false),
(3, 3, 'cruiser', 3, 3, 3, 'horizontal', false),
(4, 4, 'battleship', 4, 2, 4, 'horizontal', false),
(5, 5, 'carrier', 5, 3, 5, 'horizontal', false),
(6, 6, 'carrier', 5, 1, 6, 'horizontal', false),
(7, 7, 'cruiser', 3, 2, 7, 'horizontal', false),
(8, 8, 'destroyer', 2, 1, 8, 'horizontal', false),
(9, 9, 'battleship', 4, 0, 9, 'horizontal', true),
(10, 10, 'cruiser', 3, 2, 9, 'horizontal', false);

-- Mock data para rankings
INSERT INTO rankings (user_id, score, game_count, average_time) VALUES
(1, 1200, 15, 3200.5),
(2, 1800, 20, 3500.2),
(3, 800, 8, 2800.0),
(4, 2200, 25, 3800.7),
(5, 950, 12, 3100.3),
(6, 2500, 30, 4000.1),
(7, 850, 10, 2900.8),
(8, 1500, 18, 3300.4),
(9, 1900, 22, 3600.6),
(10, 1300, 16, 3400.9);