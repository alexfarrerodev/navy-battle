import { Component, OnInit, ElementRef, ViewChild, Renderer2, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NavalApiService } from '../../services/naval-api.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.css',
  providers: [NavalApiService]
})
export class GameBoardComponent implements OnInit, OnDestroy {
  @ViewChild('victoryModal') victoryModal!: ElementRef;
  @ViewChild('gameContainer') gameContainer!: ElementRef;
  
  // Attributes
  isLoggedIn: boolean = false;
  username: string | null = null;
  gameId: number | null = null;
  board: any[][] = [];
  gameState: any = null;
  isLoading: boolean = true;
  error: string | null = null;
  message: string | null = null;
  warningMessage: string | null = null;
  isGameOver: boolean = false;
  selectedCell: { x: number, y: number } | null = null;
  isMuted: boolean = false;
  
  // Tiempo transcurrido formateado
  formattedTime: string = '0s';
  // Suscripción para actualizar el tiempo
  private timerSubscription: Subscription | null = null;
  // Tiempo inicial para calcular la duración
  private gameStartTime: number = 0;
  
  // Sound effects
  private sfx = {
    shot: new Audio('/assets/sounds/shot.mp3'),
    hit: new Audio('/assets/sounds/explosion.mp3'),
    miss: new Audio('/assets/sounds/splash.mp3'),
    shipSunk: new Audio('/assets/sounds/ship-sinking.mp3'),
    victory: new Audio('/assets/sounds/victory.mp3'),
    background: new Audio('/assets/sounds/ocean-ambient.mp3')
  };
  
  // Game animation properties
  isAnimatingExplosion: boolean = false;
  lastHitCoords: { x: number, y: number } | null = null;
  
  // Maintain a map of each cell state to ensure consistency
  boardState: Map<string, any> = new Map();
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navalApiService: NavalApiService,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    this.checkLoginStatus();
    
    window.addEventListener('storage', () => {
      this.checkLoginStatus();
    });

    // Initialize empty board with consistent structure
    this.initializeEmptyBoard();
    
    // Configure sound effects
    this.configureSounds();
    
    // Get game ID from route parameters
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.gameId = +params['id'];
        
        // Check if there's navigation data (state)
        const navigation = this.router.getCurrentNavigation();
        if (navigation?.extras.state) {
          const state = navigation.extras.state as any;
          
          if (state.resumedGame && state.gameData) {
            // If navigation includes resumed game data, use it directly
            this.loadResumedGameState(state.gameData);
          } else {
            // Check if there's a resumed game state in sessionStorage
            const resumedGameState = sessionStorage.getItem('resumedGameState');
            
            if (resumedGameState) {
              // If there's a saved state, load it directly
              this.loadResumedGameState(JSON.parse(resumedGameState));
              // Clean up saved state to avoid conflicts in future loads
              sessionStorage.removeItem('resumedGameState');
            } else {
              // If no saved state, load the game normally
              this.loadGame();
            }
          }
        } else {
          // Check if there's a resumed game state in sessionStorage
          const resumedGameState = sessionStorage.getItem('resumedGameState');
          
          if (resumedGameState) {
            // If there's a saved state, load it directly
            this.loadResumedGameState(JSON.parse(resumedGameState));
            // Clean up saved state to avoid conflicts in future loads
            sessionStorage.removeItem('resumedGameState');
          } else {
            // If no saved state, try to resume the game using the endpoint
            this.resumeGame();
          }
        }
      } else {
        // If no ID, try to create a new game
        this.createNewGame();
      }
    });
  }
  
  ngAfterViewInit() {
    // Start background sound when game is loaded
    this.playSoundEffect('background', true);
  }
  
  ngOnDestroy() {
    // Stop all sounds when component is destroyed
    Object.values(this.sfx).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    
    // Detener la suscripción del timer al destruir el componente
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
  
  // Método para formatear el tiempo en horas, minutos y segundos
  formatTimeElapsed(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const remainingMinutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;
      return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
    }
  }
  
  // Método para iniciar el temporizador
  startTimer(initialSeconds: number): void {
    // Detener cualquier temporizador activo
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    
    // Calcular el tiempo inicial basado en los segundos proporcionados
    this.gameStartTime = Date.now() - (initialSeconds * 1000);
    
    // Formatear el tiempo inicial
    this.formattedTime = this.formatTimeElapsed(initialSeconds);
    
    // Iniciar un timer que se actualiza cada segundo
    this.timerSubscription = interval(1000).subscribe(() => {
      if (!this.isGameOver) {
        // Calcular tiempo transcurrido en segundos
        const elapsedSeconds = Math.floor((Date.now() - this.gameStartTime) / 1000);
        
        // Actualizar el tiempo formateado
        this.formattedTime = this.formatTimeElapsed(elapsedSeconds);
        
        // Actualizar el valor en el gameState para mantener la consistencia
        if (this.gameState) {
          this.gameState.time_elapsed = elapsedSeconds;
        }
      }
    });
  }
  
  // Configure sound effects
  configureSounds(): void {
    // Set volume levels
    this.sfx.shot.volume = 0.4;
    this.sfx.hit.volume = 0.6;
    this.sfx.miss.volume = 0.3;
    this.sfx.shipSunk.volume = 0.7;
    this.sfx.victory.volume = 0.7;
    this.sfx.background.volume = 0.2;
    
    // Loop background sound
    this.sfx.background.loop = true;
  }
  
  // Play sound effects
  playSoundEffect(soundType: string, loop: boolean = false): void {
    if (this.isMuted) return;
    
    // Get the corresponding sound
    const sound = this.sfx[soundType as keyof typeof this.sfx];
    
    if (sound) {
      // Reset sound to start
      sound.currentTime = 0;
      
      // Set loop property
      sound.loop = loop;
      
      // Play the sound
      sound.play().catch(error => {
        console.error(`Error playing ${soundType} sound:`, error);
      });
    }
  }
  
  // Toggle mute for all sounds
  toggleMute(): void {
    this.isMuted = !this.isMuted;
    
    Object.values(this.sfx).forEach(audio => {
      audio.muted = this.isMuted;
    });
  }

  // Specific method to resume a game using the /resume endpoint
  resumeGame(): void {
    if (!this.gameId) return;

    this.isLoading = true;
    this.navalApiService.resumeGame(this.gameId).subscribe({
      next: (resumeData) => {
        // Process resumed game data
        this.loadResumedGameState(resumeData);
      },
      error: (error) => {
        console.error('Error resuming game:', error);
        // If resume fails, try to load the game normally
        this.loadGame();
      }
    });
  }

  // Load state from a resumed game
  loadResumedGameState(resumedState: any): void {
    try {
      console.log('Loading resumed state:', resumedState);
      
      // Update game state
      if (resumedState.game) {
        this.gameState = resumedState.game;
      } else {
        this.gameState = resumedState; // In case the root object is the game state
      }
      
      // Check if the game is finished
      this.isGameOver = this.gameState.status === 'completed' || 
                        this.gameState.status === 'abandoned' || 
                        this.gameState.status === 'finished';
      
      // Update the board with resumed data
      if (resumedState.board) {
        this.updateBoardFromResumedState(resumedState.board);
      }
      
      // Show resume message
      this.message = resumedState.message || 'Battle resumed successfully';
      this.warningMessage = null;
      
      this.isLoading = false;
      
      // Iniciar el temporizador con el tiempo transcurrido del juego
      if (this.gameState && this.gameState.time_elapsed !== undefined) {
        this.startTimer(this.gameState.time_elapsed);
      }
      
      // Check for victory conditions in resumed game
      if (this.isGameOver && this.gameState.status === 'completed') {
        setTimeout(() => {
          this.showVictoryAnimation();
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error loading resumed state:', error);
      // If there's an error with the resumed state, load the game normally
      this.loadGame();
    }
  }
  
  // Specific method to update the board from resumed state
  updateBoardFromResumedState(boardData: any[][]): void {
    // Verify valid data
    if (!boardData || !Array.isArray(boardData) || boardData.length === 0) {
      console.error('Invalid board data:', boardData);
      return;
    }

    console.log('Updating board from resumed state');
    
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        // IMPORTANT: Use consistent key
        const cellKey = `${x},${y}`;
        const cellState = this.boardState.get(cellKey);
        
        // Verify cell exists on both sides
        if (cellState && boardData[y] && boardData[y][x]) {
          // Get cell state from resumed state
          const serverCell = boardData[y][x];
          
          // Clear additional properties first
          delete cellState.ship_type;
          delete cellState.part_of_ship;
          
          // Copy basic properties
          cellState.state = serverCell.state;
          cellState.hit = serverCell.hit;
          
          // Copy additional properties if they exist
          if (serverCell.ship_type) {
            cellState.ship_type = serverCell.ship_type;
          }
          
          if (serverCell.part_of_ship) {
            cellState.part_of_ship = serverCell.part_of_ship;
          }
        }
      }
    }
    
    // Add visual enhancements to resumed board state
    this.enhanceBoardVisualsAfterLoad();
  }

  // Initialize empty board with consistent structure
  initializeEmptyBoard(): void {
    this.board = [];
    for (let y = 0; y < 10; y++) {
      const row = [];
      for (let x = 0; x < 10; x++) {
        // IMPORTANT: Coordinates (x,y) where x is column and y is row
        const cellKey = `${x},${y}`;
        const cellState = {
          state: 'unknown',
          hit: false,
          key: cellKey, // Add a unique key for each cell
          animationDelay: Math.random() * 2 // Random animation delay for water effects
        };
        
        // Save state in map
        this.boardState.set(cellKey, cellState);
        row.push(cellState);
      }
      this.board.push(row);
    }
  }

  loadGame(): void {
    if (!this.gameId) return;

    this.isLoading = true;
    
    // Load board state
    this.navalApiService.getBoard(this.gameId).subscribe({
      next: (response) => {
        // Update board state without recreating it
        this.updateBoardFromResponse(response.board);
        
        // Load game state
        this.navalApiService.getGameState(this.gameId!).subscribe({
          next: (stateResponse) => {
            this.gameState = stateResponse;
            this.isGameOver = stateResponse.status === 'completed' || stateResponse.status === 'abandoned' 
                           || stateResponse.status === 'finished';
            this.isLoading = false;
            
            // Iniciar el temporizador con el tiempo transcurrido del juego
            if (this.gameState && this.gameState.time_elapsed !== undefined) {
              this.startTimer(this.gameState.time_elapsed);
            }
            
            // Add visual enhancements
            this.enhanceBoardVisualsAfterLoad();
            
            // Check for victory in loaded game
            if (this.isGameOver && stateResponse.status === 'completed') {
              setTimeout(() => {
                this.showVictoryAnimation();
              }, 1000);
            }
          },
          error: (error) => {
            this.handleError('Error loading game state', error);
          }
        });
      },
      error: (error) => {
        this.handleError('Error loading board', error);
      }
    });
  }
  
  // Method to enhance board visuals after loading
  enhanceBoardVisualsAfterLoad(): void {
    // Add ripple effects to water cells
    setTimeout(() => {
      for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
          const cellKey = `${x},${y}`;
          const cellState = this.boardState.get(cellKey);
          
          if (cellState && !cellState.hit) {
            // Add subtle animation delay for water cells
            cellState.animationDelay = (x + y) * 0.1;
          }
        }
      }
    }, 500);
  }

  // Update board state without recreating it
  updateBoardFromResponse(boardData: any[][]): void {
    // Verify valid data
    if (!boardData || !Array.isArray(boardData) || boardData.length === 0) {
      console.error('Invalid board data:', boardData);
      return;
    }

    // Print board data structure for debugging
    console.log('Board data structure:', 
      JSON.stringify(boardData.slice(0, 2).map(row => row.slice(0, 2))));
    
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        // IMPORTANT: Use consistent key
        const cellKey = `${x},${y}`;
        const cellState = this.boardState.get(cellKey);
        
        // Verify cell exists on both sides
        if (cellState && boardData[y] && boardData[y][x]) {
          // Update properties while maintaining the reference
          const serverCell = boardData[y][x];
          
          // Clear additional properties first
          delete cellState.ship_type;
          delete cellState.part_of_ship;
          
          // Copy basic properties
          cellState.state = serverCell.state;
          cellState.hit = serverCell.hit;
          
          // Copy additional properties
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
    this.warningMessage = null;
    this.navalApiService.startGame().subscribe({
      next: (response) => {
        this.gameId = response.game.game_id;
        this.message = response.message;
        
        // Reset the board state
        this.initializeEmptyBoard();
        
        // Load the new game board
        this.loadGame();
        
        // Iniciar el temporizador a 0 para un nuevo juego
        this.startTimer(0);
        
        // Play start game sound
        setTimeout(() => {
          this.playSoundEffect('background', true);
        }, 500);
      },
      error: (error) => {
        this.handleError('Error creating new game', error);
      }
    });
  }

  handleCellClick(x: number, y: number): void {
    if (this.isLoading || this.isGameOver || !this.gameId) return;
    
    // Check if the cell has already been fired at
    const cellKey = `${x},${y}`;
    const cellState = this.boardState.get(cellKey);
    
    if (cellState && cellState.hit) {
      // If cell has already been hit, show a warning message
      this.warningMessage = "This cell has already been targeted. Try a different position.";
      return;
    }
    
    // Play firing sound
    this.playSoundEffect('shot');
    
    // Add visual effects for targeting
    this.addTargetingEffect(x, y);
    
    // Clear the warning message when firing at a valid cell
    this.warningMessage = null;
    this.selectedCell = { x, y };
    
    // Fire shot at selected coordinates
    this.navalApiService.fireShot(this.gameId, x, y).subscribe({
      next: (response) => {
        // Clear any warning message when a valid shot is made
        this.warningMessage = null;
        
        // Update message based on result
        if (response.result.hit) {
          // Play hit sound
          this.playSoundEffect('hit');
          
          this.message = `Hit! You've struck a ${response.result.ship_type}.`;
          if (response.result.ship_destroyed) {
            // Play ship sinking sound
            setTimeout(() => {
              this.playSoundEffect('shipSunk');
            }, 300);
            
            this.message += ' Enemy ship sunk!';
            
            // Show ship sinking animation
            this.animateShipDestruction(response.result.ship_type, x, y);
          }
          if (response.result.game_over) {
            this.message += ' Victory! All enemy vessels neutralized!';
            this.isGameOver = true;
            
            // Show victory animation
            setTimeout(() => {
              this.showVictoryAnimation();
            }, 1500);
          }
        } else {
          // Play miss sound
          this.playSoundEffect('miss');
          
          this.message = 'Miss! Your shot found only water.';
        }
        
        // Update shot cell immediately
        this.updateCellAfterShot(x, y, response);
        
        // If a ship was destroyed or game ended, update the complete board
        // but maintain the reference structure
        if (response.result.ship_destroyed || response.result.game_over) {
          setTimeout(() => {
            this.loadGame();
          }, 300); // Small delay for better visual experience
        }
        
        // Update game stats
        this.updateGameStats(response);
        
        // Set last hit coordinates for animation
        if (response.result.hit) {
          this.lastHitCoords = { x, y };
        }
      },
      error: (error) => {
        // Check if it's an error for a cell that's already been shot
        if (error && typeof error === 'string' && error.includes('already shot')) {
          // Show warning message without clearing the regular message
          this.warningMessage = "This cell has already been targeted. Try a different position.";
        } else {
          // For other errors, use the normal handler
          this.handleError('Error firing shot', error);
        }
      }
    });
  }
  
  // Add targeting effect when clicking a cell
  addTargetingEffect(x: number, y: number): void {
    const cellKey = `${x},${y}`;
    const cellState = this.boardState.get(cellKey);
    
    if (cellState) {
      cellState.targeting = true;
      
      // Remove targeting effect after animation completes
      setTimeout(() => {
        if (cellState) {
          cellState.targeting = false;
        }
      }, 500);
    }
  }
  
  // Animate ship destruction when sunk
  animateShipDestruction(shipType: string, x: number, y: number): void {
    // Find all cells belonging to this ship
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const cellKey = `${x},${y}`;
        const cellState = this.boardState.get(cellKey);
        
        if (cellState && cellState.ship_type === shipType) {
          cellState.part_of_ship = 'destroyed';
          
          // Add explosion animation with delay based on position
          cellState.exploding = true;
          const delay = Math.random() * 500;
          
          setTimeout(() => {
            if (cellState) {
              cellState.exploding = false;
            }
          }, 1000 + delay);
        }
      }
    }
  }
  
  // Show victory animation
  showVictoryAnimation(): void {
    if (!this.isGameOver) return;
    
    // Play victory sound
    this.playSoundEffect('victory');
    
    // Show victory modal if available
    if (this.victoryModal) {
      this.renderer.addClass(this.victoryModal.nativeElement, 'visible');
      
      // Add victory effects to page
      if (this.gameContainer) {
        this.renderer.addClass(this.gameContainer.nativeElement, 'victory');
        
        // Create and add fireworks/explosion elements
        for (let i = 0; i < 20; i++) {
          const firework = this.renderer.createElement('div');
          this.renderer.addClass(firework, 'firework');
          
          // Random position
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const delay = Math.random() * 2;
          
          this.renderer.setStyle(firework, 'left', `${left}%`);
          this.renderer.setStyle(firework, 'top', `${top}%`);
          this.renderer.setStyle(firework, 'animation-delay', `${delay}s`);
          
          this.renderer.appendChild(this.gameContainer.nativeElement, firework);
        }
      }
    }
  }
  
  // Close victory modal
  closeVictoryModal(): void {
    if (this.victoryModal) {
      this.renderer.removeClass(this.victoryModal.nativeElement, 'visible');
    }
  }
  
  // Quickly update cell after shot
  updateCellAfterShot(x: number, y: number, response: any): void {
    // IMPORTANT: Use consistent key format
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

  // Update game stats
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

  getCellClass(cell: any): any {
    // Return object with classes instead of string for more flexibility
    const classes: any = {};
    
    if (cell.hit) {
      classes[cell.state === 'hit' ? 'hit' : 'miss'] = true;
    } else {
      classes.unknown = true;
    }
    
    // Add animation classes
    if (cell.targeting) classes.targeting = true;
    if (cell.exploding) classes.exploding = true;
    
    return classes;
  }

  restartGame(): void {
    this.isLoading = true;
    
    this.navalApiService.startGame().subscribe({
      next: (response) => {
        console.log('Response when creating game:', response);
        
        if (response && response.game && response.game.game_id) {
          // Navigate to game board with new ID
          this.router.navigate(['/game-board', response.game.game_id], {
            state: { 
              newGame: true,
              gameData: response
            }
          });
        } else {
          this.handleError('Error creating new game', 'No valid game ID received');
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        this.handleError('Error creating new game', error);
        this.isLoading = false;
      }
    });
  }

  finishGame(): void {
    if (!this.gameId) return;

    this.warningMessage = null;
    this.navalApiService.abandonGame(this.gameId).subscribe({
      next: (response) => {
        this.message = response.message;
        // Don't change isGameOver to true so it can be resumed later
        
        // Detener el temporizador
        if (this.timerSubscription) {
          this.timerSubscription.unsubscribe();
          this.timerSubscription = null;
        }
        
        // Redirect to games page
        this.router.navigate(['/games']);
      },
      error: (error) => {
        this.handleError('Error finishing game', error);
      }
    });
  }

  handleError(message: string, error: any): void {
    this.isLoading = false;
    this.error = `${message}: ${error.message || 'Unknown error'}`;
    console.error(this.error, error);
  }

  // This function helps Angular maintain row identity during updates
  trackRow(index: number, row: any): number {
    return index;
  }
  
  // This function helps Angular maintain cell identity during updates
  trackCell(index: number, cell: any): string {
    // If the cell has a unique key, use it
    if (cell && cell.key) {
      return cell.key;
    }
    // Otherwise, use the index
    return index.toString();
  }

  /**
   * Checks if the user is logged in or not.
   */
  private checkLoginStatus() {
    const token = sessionStorage.getItem('access_token');
    this.isLoggedIn = !!token;
    if (this.isLoggedIn) {
      this.username = sessionStorage.getItem('username');
    } else {
      this.username = null;
    }
  }
}