# Navy Battle Game API Flow

| Step | HTTP Method | Endpoint | Request Body | Description | Expected Response |
|------|------------|----------|--------------|-------------|-------------------|
| 1 | POST | `/auth/register` | `{ "username": "player1", "email": "player@example.com", "password": "password123" }` | Register a new user | User information and token |
| 2 | POST | `/auth/login` | `{ "email": "player@example.com", "password": "password123" }` | Login with credentials | Authentication token |
| 3 | POST | `/games/start` | `{}` | Start a new game (with auto-placed ships) | Game object with ID and "ready" status |
| 4 | GET | `/games/{gameId}/board` | none | Get the initial board state | Board with ships hidden (all "unknown" state) |
| 5 | POST | `/games/{gameId}/fire` | `{ "x": 3, "y": 5 }` | Fire a shot at position (3,5) | Hit/miss result and game status |
| 6 | GET | `/games/{gameId}/board` | none | Get the updated board state | Board with hit/miss positions revealed |
| 7 | POST | `/games/{gameId}/fire` | `{ "x": 4, "y": 5 }` | Fire another shot | Hit/miss result and game status |
| 8 | GET | `/games/{gameId}/state` | none | Get current game statistics | Shots fired, hits, accuracy, etc. |
| 9 | *Repeat steps 5-8* | ... | ... | Continue firing until game is over | ... |
| 10 | GET | `/games/{gameId}/state` | none | Get final game statistics (when game_over=true) | Complete game statistics |
| 11 | GET | `/users/{userId}/stats` | none | Get overall user statistics | User's performance across all games |
| 12 | GET | `/rankings` | none | View global rankings | List of top players by score |

## Additional Game History & Management Endpoints

| Step | HTTP Method | Endpoint | Request Body | Description | Expected Response |
|------|------------|----------|--------------|-------------|-------------------|
| H1 | GET | `/games/history` | none | List all games for current user | List of all games with summary information |
| H2 | GET | `/games/history/active` | none | List active games for current user | List of games in progress |
| H3 | GET | `/games/history/completed` | none | List completed games for current user | List of finished games |
| H4 | GET | `/games/{gameId}/resume` | none | Get data to resume a game | Complete game state for resuming play |
| H5 | POST | `/games/{gameId}/finish` | none | Manually end a game | Updated game with completed status |

## Example of Gameplay Sequence

### 1. Register a new user
```http
POST /auth/register
Content-Type: application/json

{
  "username": "player1",
  "email": "player@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "user": {
    "user_id": 1,
    "username": "player1",
    "email": "player@example.com",
    "created_at": "2023-01-01T12:00:00.000000Z",
    "updated_at": "2023-01-01T12:00:00.000000Z"
  },
  "access_token": "1|a1b2c3d4e5f6...",
  "token_type": "Bearer"
}
```

### 2. Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "player@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "user": {
    "user_id": 1,
    "username": "player1",
    "email": "player@example.com",
    "created_at": "2023-01-01T12:00:00.000000Z",
    "last_login": "2023-01-02T09:15:00.000000Z",
    "updated_at": "2023-01-02T09:15:00.000000Z"
  },
  "access_token": "2|g7h8i9j0k1l2...",
  "token_type": "Bearer"
}
```

### 3. Start a new game (ships will be placed automatically)
```http
POST /games/start
Authorization: Bearer {your_token}
```

Response:
```json
{
  "message": "New game started with ships placed automatically",
  "game": {
    "game_id": 123,
    "user_id": 1,
    "status": "ready",
    "total_shots": 0,
    "successful_shots": 0
  },
  "ready_to_play": true
}
```

### 4. Get the initial board state
```http
GET /games/123/board
Authorization: Bearer {your_token}
```

Response:
```json
{
  "game_id": 123,
  "board": [
    [
      {"state": "unknown", "hit": false},
      {"state": "unknown", "hit": false},
      ...
    ],
    ...
  ]
}
```

### 5. Fire a shot
```http
POST /games/123/fire
Authorization: Bearer {your_token}
Content-Type: application/json

{
  "x": 3,
  "y": 5
}
```

Response (hit):
```json
{
  "result": {
    "hit": true,
    "ship_destroyed": false,
    "game_over": false,
    "ship_type": "cruiser"
  },
  "position": {
    "x": 3,
    "y": 5
  },
  "game_status": "in_progress"
}
```

### 6. Get updated board
```http
GET /games/123/board
Authorization: Bearer {your_token}
```

Response:
```json
{
  "game_id": 123,
  "board": [
    [
      {"state": "unknown", "hit": false},
      {"state": "unknown", "hit": false},
      ...
    ],
    ...
    [
      {"state": "unknown", "hit": false},
      {"state": "unknown", "hit": false},
      {"state": "hit", "hit": true},
      ...
    ],
    ...
  ]
}
```

### 7. Get game state
```http
GET /games/123/state
Authorization: Bearer {your_token}
```

Response:
```json
{
  "game_id": 123,
  "status": "in_progress",
  "total_shots": 1,
  "successful_shots": 1,
  "accuracy": 100.00,
  "time_elapsed": 45,
  "ships": {
    "total": 5,
    "destroyed": 0,
    "remaining": 5
  }
}
```

### 8. List active games (from history)
```http
GET /games/history/active
Authorization: Bearer {your_token}
```

Response:
```json
{
  "total_active_games": 2,
  "games": [
    {
      "game_id": 123,
      "status": "in_progress",
      "status_text": "Game in progress",
      "created_at": "2023-01-02T10:30:00.000000Z",
      "start_time": "2023-01-02T10:30:15.000000Z",
      "last_played": "2023-01-02T10:31:05.000000Z",
      "total_shots": 1,
      "successful_shots": 1,
      "accuracy": 100.00,
      "time_elapsed": 50,
      "ships": {
        "total": 5,
        "destroyed": 0,
        "remaining": 5
      },
      "can_resume": true
    },
    {
      "game_id": 122,
      "status": "ready",
      "status_text": "Game ready to play",
      "created_at": "2023-01-01T16:45:00.000000Z",
      "start_time": null,
      "last_played": "2023-01-01T16:45:00.000000Z",
      "total_shots": 0,
      "successful_shots": 0,
      "accuracy": 0,
      "time_elapsed": 0,
      "ships": {
        "total": 5,
        "destroyed": 0,
        "remaining": 5
      },
      "can_resume": true
    }
  ]
}
```

### 9. Resume a previously started game
```http
GET /games/122/resume
Authorization: Bearer {your_token}
```

Response:
```json
{
  "game": {
    "game_id": 122,
    "status": "ready",
    "start_time": null,
    "total_shots": 0,
    "successful_shots": 0,
    "accuracy": 0,
    "time_elapsed": 0
  },
  "ships": {
    "total": 5,
    "destroyed": 0,
    "remaining": 5
  },
  "board": [
    [
      {"state": "unknown", "hit": false},
      {"state": "unknown", "hit": false},
      ...
    ],
    ...
  ],
  "message": "Game loaded successfully. Ready to resume.",
  "last_action_timestamp": "2023-01-01T16:45:00.000000Z"
}
```

### 10. Get user statistics
```http
GET /users/1/stats
Authorization: Bearer {your_token}
```

Response:
```json
{
  "user_id": 1,
  "total_games": 15,
  "games_won": 12,
  "total_shots": 350,
  "hits": 210
}
```

### 11. View rankings
```http
GET /rankings
Authorization: Bearer {your_token}
```

Response:
```json
[
  {
    "ranking_id": 3,
    "user_id": 5,
    "score": 9850,
    "game_count": 20,
    "average_time": 245.5,
    "last_updated": "2023-01-02T08:15:00.000000Z",
    "user": {
      "user_id": 5,
      "username": "navymaster"
    }
  },
  {
    "ranking_id": 1,
    "user_id": 1,
    "score": 8700,
    "game_count": 15,
    "average_time": 280.2,
    "last_updated": "2023-01-02T10:45:00.000000Z",
    "user": {
      "user_id": 1,
      "username": "player1"
    }
  },
  ...
]
```

### 12. Manually finish a game
```http
POST /games/122/finish
Authorization: Bearer {your_token}
```

Response:
```json
{
  "message": "Game finalizado correctamente",
  "game": {
    "game_id": 122,
    "user_id": 1,
    "status": "abandoned",
    "start_time": null,
    "end_time": "2023-01-02T11:05:00.000000Z",
    "total_shots": 0,
    "successful_shots": 0,
    "game_time": 0
  }
}
```