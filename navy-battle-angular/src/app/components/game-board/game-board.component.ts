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
  
  // Mantener un mapa del estado de cada celda para garantizar consistencia
  boardState: Map<string, any> = new Map();
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navalApiService: NavalApiService
  ) { }

  ngOnInit(): void {
    // Inicializar el tablero vacío con estructura consistente
    this.initializeEmptyBoard();
    
    // Obtener el ID del juego de los parámetros de la ruta
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.gameId = +params['id'];
        
        // Verificar si hay datos de navegación (state)
        const navigation = this.router.getCurrentNavigation();
        if (navigation?.extras.state) {
          const state = navigation.extras.state as any;
          
          if (state.resumedGame && state.gameData) {
            // Si la navegación incluye datos de un juego reanudado, usarlos directamente
            this.loadResumedGameState(state.gameData);
          } else {
            // Comprobar si hay un estado de juego reanudado en sessionStorage
            const resumedGameState = sessionStorage.getItem('resumedGameState');
            
            if (resumedGameState) {
              // Si hay un estado guardado, lo cargamos directamente
              this.loadResumedGameState(JSON.parse(resumedGameState));
              // Limpiamos el estado guardado para evitar conflictos en futuras cargas
              sessionStorage.removeItem('resumedGameState');
            } else {
              // Si no hay estado guardado, cargamos el juego normalmente
              this.loadGame();
            }
          }
        } else {
          // Comprobar si hay un estado de juego reanudado en sessionStorage
          const resumedGameState = sessionStorage.getItem('resumedGameState');
          
          if (resumedGameState) {
            // Si hay un estado guardado, lo cargamos directamente
            this.loadResumedGameState(JSON.parse(resumedGameState));
            // Limpiamos el estado guardado para evitar conflictos en futuras cargas
            sessionStorage.removeItem('resumedGameState');
          } else {
            // Si no hay estado guardado, intentamos reanudar el juego mediante el endpoint
            this.resumeGame();
          }
        }
      } else {
        // Si no hay ID, intentar crear un nuevo juego
        this.createNewGame();
      }
    });
  }

  // Método específico para reanudar un juego usando el endpoint /resume
  resumeGame(): void {
    if (!this.gameId) return;

    this.isLoading = true;
    this.navalApiService.resumeGame(this.gameId).subscribe({
      next: (resumeData) => {
        // Procesar los datos del juego reanudado
        this.loadResumedGameState(resumeData);
      },
      error: (error) => {
        console.error('Error al reanudar el juego:', error);
        // Si falla la reanudación, intentamos cargar el juego normalmente
        this.loadGame();
      }
    });
  }

  // Cargar estado desde un juego reanudado
  loadResumedGameState(resumedState: any): void {
    try {
      console.log('Cargando estado reanudado:', resumedState);
      
      // Actualizar el estado del juego
      if (resumedState.game) {
        this.gameState = resumedState.game;
      } else {
        this.gameState = resumedState; // En caso de que el objeto raíz sea el estado del juego
      }
      
      // Comprobar si el juego está terminado
      this.isGameOver = this.gameState.status === 'completed' || 
                        this.gameState.status === 'abandoned' || 
                        this.gameState.status === 'finished';
      
      // Actualizar el tablero con los datos reanudados
      if (resumedState.board) {
        this.updateBoardFromResumedState(resumedState.board);
      }
      
      // Mostrar mensaje de reanudación
      this.message = resumedState.message || 'Juego reanudado correctamente';
      
      this.isLoading = false;
      
    } catch (error) {
      console.error('Error al cargar el estado reanudado:', error);
      // Si hay un error con el estado reanudado, intentamos cargar el juego normalmente
      this.loadGame();
    }
  }
  
  // Método específico para actualizar el tablero desde el estado reanudado
  updateBoardFromResumedState(boardData: any[][]): void {
    // Verificamos que los datos sean válidos
    if (!boardData || !Array.isArray(boardData) || boardData.length === 0) {
      console.error('Datos de tablero inválidos:', boardData);
      return;
    }

    console.log('Actualizando tablero desde estado reanudado');
    
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        // IMPORTANTE: Usar clave consistente
        const cellKey = `${x},${y}`;
        const cellState = this.boardState.get(cellKey);
        
        // Verificamos que la celda existe en ambos lados
        if (cellState && boardData[y] && boardData[y][x]) {
          // Obtener el estado de la celda desde el estado reanudado
          const serverCell = boardData[y][x];
          
          // Limpiamos propiedades adicionales primero
          delete cellState.ship_type;
          delete cellState.part_of_ship;
          
          // Copiamos propiedades básicas
          cellState.state = serverCell.state;
          cellState.hit = serverCell.hit;
          
          // Copiamos propiedades adicionales si existen
          if (serverCell.ship_type) {
            cellState.ship_type = serverCell.ship_type;
          }
          
          if (serverCell.part_of_ship) {
            cellState.part_of_ship = serverCell.part_of_ship;
          }
        }
      }
    }
  }

  // Inicializar tablero vacío con estructura consistente
  initializeEmptyBoard(): void {
    this.board = [];
    for (let y = 0; y < 10; y++) {
      const row = [];
      for (let x = 0; x < 10; x++) {
        // IMPORTANTE: Coordenadas (x,y) donde x es columna y y es fila
        const cellKey = `${x},${y}`;
        const cellState = {
          state: 'unknown',
          hit: false,
          key: cellKey // Agregar una clave única para cada celda
        };
        
        // Guardar el estado en el mapa
        this.boardState.set(cellKey, cellState);
        row.push(cellState);
      }
      this.board.push(row);
    }
  }

  loadGame(): void {
    if (!this.gameId) return;

    this.isLoading = true;
    
    // Cargar el estado del tablero
    this.navalApiService.getRevealedBoard(this.gameId).subscribe({
      next: (response) => {
        // Actualizar el estado del tablero sin recrearlo
        this.updateBoardFromResponse(response.board);
        
        // Cargar el estado del juego
        this.navalApiService.getGameState(this.gameId!).subscribe({
          next: (stateResponse) => {
            this.gameState = stateResponse;
            this.isGameOver = stateResponse.status === 'completed' || stateResponse.status === 'abandoned' 
                           || stateResponse.status === 'finished';
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

  // Actualizar el estado del tablero sin recrearlo
  updateBoardFromResponse(boardData: any[][]): void {
    // Verificamos que los datos sean válidos
    if (!boardData || !Array.isArray(boardData) || boardData.length === 0) {
      console.error('Datos de tablero inválidos:', boardData);
      return;
    }

    // Imprimir estructura de boardData para depuración
    console.log('Estructura de datos del tablero:', 
      JSON.stringify(boardData.slice(0, 2).map(row => row.slice(0, 2))));
    
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        // IMPORTANTE: Usar clave consistente
        const cellKey = `${x},${y}`;
        const cellState = this.boardState.get(cellKey);
        
        // Verificamos que la celda existe en ambos lados
        if (cellState && boardData[y] && boardData[y][x]) {
          // Actualizar propiedades manteniendo la referencia
          const serverCell = boardData[y][x];
          
          // Limpiamos propiedades adicionales primero
          delete cellState.ship_type;
          delete cellState.part_of_ship;
          
          // Copiamos propiedades básicas
          cellState.state = serverCell.state;
          cellState.hit = serverCell.hit;
          
          // Copiamos propiedades adicionales
          if (serverCell.ship_type) {
            cellState.ship_type = serverCell.ship_type;
          }
          
          if (serverCell.part_of_ship) {
            cellState.part_of_ship = serverCell.part_of_ship;
          }
        }
      }
    }
  }

  createNewGame(): void {
    this.isLoading = true;
    this.navalApiService.startGame().subscribe({
      next: (response) => {
        this.gameId = response.game.game_id;
        this.message = response.message;
        
        // Reiniciar el estado del tablero
        this.initializeEmptyBoard();
        
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
    this.navalApiService.fireShot(this.gameId, x, y).subscribe({
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
        
        // Actualizar la celda de disparo inmediatamente
        this.updateCellAfterShot(x, y, response);
        
        // Si se destruyó un barco o terminó el juego, actualizar el tablero completo
        // pero mantener la estructura de referencia
        if (response.result.ship_destroyed || response.result.game_over) {
          setTimeout(() => {
            this.loadGame();
          }, 100); // Pequeño retraso para mejor experiencia visual
        }
        
        // Actualizar estadísticas del juego
        this.updateGameStats(response);
      },
      error: (error) => {
        this.handleError('Error al realizar el disparo', error.message || error);
      }
    });
  }

  // Actualizar rápidamente la celda después del disparo
  updateCellAfterShot(x: number, y: number, response: any): void {
    // IMPORTANTE: Usar formato de clave consistente
    const cellKey = `${x},${y}`;
    const cellState = this.boardState.get(cellKey);
    
    if (cellState) {
      cellState.hit = true;
      cellState.state = response.result.hit ? 'hit' : 'miss';
      
      if (response.result.hit && response.result.ship_type) {
        cellState.ship_type = response.result.ship_type;
      }
    }
  }

  // Actualizar estadísticas del juego
  updateGameStats(response: any): void {
    if (this.gameState) {
      this.gameState.total_shots = (this.gameState.total_shots || 0) + 1;
      
      if (response.result.hit) {
        this.gameState.successful_shots = (this.gameState.successful_shots || 0) + 1;
      }
      
      if (this.gameState.total_shots > 0) {
        this.gameState.accuracy = Math.round((this.gameState.successful_shots / this.gameState.total_shots) * 100);
      }
      
      if (response.result.ship_destroyed && this.gameState.ships) {
        this.gameState.ships.destroyed = (this.gameState.ships.destroyed || 0) + 1;
      }
    }
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

    this.navalApiService.abandonGame(this.gameId).subscribe({
      next: (response) => {
        this.message = response.message;
        // No cambiar isGameOver a true para que pueda reanudarse después
        
        // Redirigir a la página de juegos
        this.router.navigate(['/games']);
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

  // Esta función ayuda a Angular a mantener la identidad de las filas durante la actualización
  trackRow(index: number, row: any): number {
    return index;
  }
  
  // Esta función ayuda a Angular a mantener la identidad de las celdas durante la actualización
  trackCell(index: number, cell: any): string {
    // Si la celda tiene una clave única, usarla
    if (cell && cell.key) {
      return cell.key;
    }
    // De lo contrario, usar el índice
    return index.toString();
  }
}