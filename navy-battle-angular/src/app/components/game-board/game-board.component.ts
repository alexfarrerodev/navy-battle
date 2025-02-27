import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NavalApiService } from '../../services/naval-api.service';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.css',
  providers: [NavalApiService]
})
export class GameBoardComponent implements OnInit {
  gameId: number | null = null;
  board: any[][] = [];
  gameState: any = null;
  isLoading: boolean = true;
  error: string | null = null;
  message: string | null = null;
  isGameOver: boolean = false;
  selectedCell: { x: number, y: number } | null = null;
  
  // Token fijo para pruebas (en una aplicación real, esto vendría de un servicio de autenticación)
  token: string = 'fIW9MAeCCbomZdW9L7cwaHt3eO08rqIOIuJv6I6M33411b8d';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navalApiService: NavalApiService
  ) { }

  ngOnInit(): void {
    // Obtener el ID del juego de los parámetros de la ruta
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.gameId = +params['id'];
        this.loadGame();
      } else {
        // Si no hay ID, intentar crear un nuevo juego
        this.createNewGame();
      }
    });
  }

  loadGame(): void {
    if (!this.gameId) return;

    this.isLoading = true;
    
    // Cargar el estado del tablero
    this.navalApiService.getBoard(this.gameId, this.token).subscribe({
      next: (response) => {
        this.board = response.board;
        
        // Cargar el estado del juego
        this.navalApiService.getGameState(this.gameId!, this.token).subscribe({
          next: (stateResponse) => {
            this.gameState = stateResponse;
            this.isGameOver = stateResponse.status === 'completed' || stateResponse.status === 'abandoned';
            this.isLoading = false;
          },
          error: (error) => {
            this.handleError('Error al cargar el estado del juego', error);
          }
        });
      },
      error: (error) => {
        this.handleError('Error al cargar el tablero', error);
      }
    });
  }

  createNewGame(): void {
    this.isLoading = true;
    this.navalApiService.startGame(this.token).subscribe({
      next: (response) => {
        this.gameId = response.game.game_id;
        this.message = response.message;
        
        
        
        // Cargar el tablero del nuevo juego
        this.loadGame();
      },
      error: (error) => {
        this.handleError('Error al crear un nuevo juego', error);
      }
    });
  }

  handleCellClick(x: number, y: number): void {
    if (this.isLoading || this.isGameOver || !this.gameId) return;
    
    this.selectedCell = { x, y };
    
    // Realizar un disparo en las coordenadas seleccionadas
    this.navalApiService.fireShot(this.gameId, x, y, this.token).subscribe({
      next: (response) => {
        // Actualizar mensaje basado en el resultado
        if (response.result.hit) {
          this.message = `¡Impacto! Has golpeado un ${response.result.ship_type}.`;
          if (response.result.ship_destroyed) {
            this.message += ' ¡Has hundido el barco!';
          }
          if (response.result.game_over) {
            this.message += ' ¡Juego completado!';
            this.isGameOver = true;
          }
        } else {
          this.message = '¡Agua! El disparo ha fallado.';
        }
        
        // Recargar el tablero para reflejar el disparo
        this.loadGame();
      },
      error: (error) => {
        this.handleError('Error al realizar el disparo', error);
      }
    });
  }

  getCellClass(cell: any): string {
    if (cell.hit) {
      return cell.state === 'hit' ? 'hit' : 'miss';
    }
    return 'unknown';
  }

  restartGame(): void {
    this.createNewGame();
  }

  finishGame(): void {
    if (!this.gameId) return;

    this.navalApiService.finishGame(this.gameId, this.token).subscribe({
      next: (response) => {
        this.message = response.message;
        this.isGameOver = true;
        // Actualizar el estado del juego
        this.loadGame();
      },
      error: (error) => {
        this.handleError('Error al finalizar el juego', error);
      }
    });
  }

  handleError(message: string, error: any): void {
    this.isLoading = false;
    this.error = `${message}: ${error.message || 'Error desconocido'}`;
    console.error(this.error, error);
  }
}