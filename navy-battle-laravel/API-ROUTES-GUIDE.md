# Navy Battle Game API Flow

| Step | HTTP Method | Endpoint | Request Body | Description | Expected Response |
|------|------------|----------|--------------|-------------|-------------------|
| 1 | POST | `/api/auth/register` | `{ "username": "player1", "email": "player@example.com", "password": "password123" }` | Register a new user | User information and token |
| 2 | POST | `/api/auth/login` | `{ "email": "player@example.com", "password": "password123" }` | Login with credentials | Authentication token |
| 3 | POST | `/api/games/start` | `{}` | Start a new game (with auto-placed ships) | Game object with ID and "ready" status |
| 4 | GET | `/api/games/{gameId}/board` | none | Get the initial board state | Board with ships hidden (all "unknown" state) |
| 5 | POST | `/api/games/{gameId}/fire` | `{ "x": 3, "y": 5 }` | Fire a shot at position (3,5) | Hit/miss result and game status |
| 6 | GET | `/api/games/{gameId}/board` | none | Get the updated board state | Board with hit/miss positions revealed |
| 7 | POST | `/api/games/{gameId}/fire` | `{ "x": 4, "y": 5 }` | Fire another shot | Hit/miss result and game status |
| 8 | GET | `/api/games/{gameId}/state` | none | Get current game statistics | Shots fired, hits, accuracy, etc. |
| 9 | *Repeat steps 5-8* | ... | ... | Continue firing until game is over | ... |
| 10 | GET | `/api/games/{gameId}/state` | none | Get final game statistics (when game_over=true) | Complete game statistics |
| 11 | GET | `/api/users/{userId}/stats` | none | Get overall user statistics | User's performance across all games |
| 12 | GET | `/api/rankings` | none | View global rankings | List of top players by score |

## Example of Gameplay Sequence

### 1. Register a new user
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "player1",
  "email": "player@example.com",
  "password": "password123"
}
```

### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "player@example.com",
  "password": "password123"
}
```

### 3. Start a new game (ships will be placed automatically)
```http
POST /api/games/start
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

### 4. Fire a shot
```http
POST /api/games/123/fire
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

### 5. Get updated board
```http
GET /api/games/123/board
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

### 6. Get game state
```http
GET /api/games/123/state
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
