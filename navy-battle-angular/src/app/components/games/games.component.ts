import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NavalApiService } from '../../services/naval-api.service';

interface Game {
  game_id: number;
  status: string;
  start_time: string;
  end_time?: string;
  total_shots: number;
  successful_shots: number;
}

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './games.component.html',
  styleUrl: 'games.component.css'
})
export class GamesComponent implements OnInit {
  allGames: Game[] = [];
  isLoading: boolean = true;
  error: string | null = null;

  constructor(
    private router: Router,
    private navalApiService: NavalApiService
  ) {}

  ngOnInit(): void {
    this.loadAllGames();
  }

  loadAllGames(): void {
    this.isLoading = true;
    
    this.navalApiService.getAllGames().subscribe({
      next: (response) => {
        console.log('Respuesta completa de la API:', response);
        
        // Asegurarse de que la respuesta tenga la estructura esperada
        if (response && response.games && Array.isArray(response.games)) {
          this.allGames = response.games;
        } else if (response && Array.isArray(response)) {
          // Si la respuesta es directamente un array
          this.allGames = response;
        } else if (response && typeof response === 'object') {
          // Si la respuesta es un objeto pero sin la propiedad 'games'
          const possibleGames = Object.values(response).find(val => Array.isArray(val));
          if (possibleGames) {
            this.allGames = possibleGames as Game[];
          } else {
            this.handleError('Formato de respuesta inválido', 'La API no devolvió la estructura esperada de juegos');
          }
        } else {
          this.handleError('Formato de respuesta inválido', 'La API no devolvió la estructura esperada de juegos');
        }
        
        console.log(`Total de juegos cargados: ${this.allGames.length}`);
        console.log(`Juegos activos: ${this.activeGames.length}`);
        console.log(`Juegos finalizados: ${this.finishedGames.length}`);
        
        this.isLoading = false;
      },
      error: (error) => {
        this.handleError('Error al cargar juegos', error);
      }
    });
  }

  goToGame(gameId: number): void {
    const game = this.allGames.find(g => g.game_id === gameId);
    
    if (game && game.status === 'active') {
      // Si es un juego activo, usamos resumeGame para obtener todos los datos necesarios
      this.resumeGame(gameId);
    } else if (game && game.status === 'finished') {
      // Si es un juego finalizado, simplemente mostramos los detalles
      this.router.navigate(['/game-board', gameId], {
        state: { viewOnly: true }
      });
    } else {
      this.handleError(`Error al acceder al juego #${gameId}`, 'Estado de juego desconocido');
    }
  }

  resumeGame(gameId: number): void {
    this.isLoading = true;
    
    this.navalApiService.resumeGame(gameId).subscribe({
      next: (response) => {
        console.log('Datos del juego recuperado:', response);
        
        // Verificar que la respuesta contenga los datos necesarios
        if (response) {
          // Almacenamos el estado completo del juego para que el componente del tablero pueda usarlo
          sessionStorage.setItem('resumedGameState', JSON.stringify(response));
          
          // Navegamos al componente del tablero con el ID del juego
          this.router.navigate(['/game-board', gameId], {
            state: { 
              resumedGame: true,
              gameData: response
            }
          });
        } else {
          this.handleError(`Error al reanudar el juego #${gameId}`, 'Datos del juego incompletos');
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        this.handleError(`Error al reanudar el juego #${gameId}`, error);
      }
    });
  }

  startNewGame(): void {
    this.isLoading = true;
    
    this.navalApiService.startGame().subscribe({
      next: (response) => {
        console.log('Respuesta al crear juego:', response);
        
        if (response && response.game && response.game.game_id) {
          // Navegamos al tablero de juego con el nuevo ID
          this.router.navigate(['/game-board', response.game.game_id], {
            state: { 
              newGame: true,
              gameData: response
            }
          });
        } else {
          this.handleError('Error al crear nuevo juego', 'No se recibió ID de juego válido');
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        this.handleError('Error al crear nuevo juego', error);
        this.isLoading = false;
      }
    });
  }

  // Obtener juegos activos
  get activeGames(): Game[] {
    return this.allGames.filter(game => game.status === 'active');
  }

  // Obtener juegos finalizados
  get finishedGames(): Game[] {
    return this.allGames.filter(game => game.status === 'finished');
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  calculateAccuracy(game: Game): string {
    if (!game.total_shots || game.total_shots === 0) return '0%';
    
    const accuracy = (game.successful_shots / game.total_shots) * 100;
    return `${accuracy.toFixed(1)}%`;
  }

  handleError(message: string, error: any): void {
    this.isLoading = false;
    this.error = `${message}: ${error.message || error || 'Error desconocido'}`;
    console.error(this.error, error);
  }
}