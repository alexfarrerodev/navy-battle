import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavalApiService {
  private apiUrl = 'http://localhost:8000';
  private token : string | null = null;

  constructor(private http: HttpClient) { }

  private getAuthHeaders(token : string | null) {
    this.token = sessionStorage.getItem('access_token')
    return {
      headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` })
    };
  }

  ngOnInit(){
    this.token = sessionStorage.getItem('access_token')
  }


  // Authentication endpoints
  register(username: string, email: string, password: string): Observable<any> {
    
    return this.http.post(`${this.apiUrl}/auth/register`, { username, email, password });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {});
  }


  // Game management endpoints
  startGame(): Observable<any> {
    
    return this.http.post(`${this.apiUrl}/games/start`, {}, this.getAuthHeaders(this.token));
  }

  getBoard(gameId: number): Observable<any> {
    
    return this.http.get(`${this.apiUrl}/games/${gameId}/board`, this.getAuthHeaders(this.token));
  }

  fireShot(gameId: number, x: number, y: number): Observable<any> {
    
    return this.http.post(`${this.apiUrl}/games/${gameId}/fire`, { x, y }, this.getAuthHeaders(this.token));
  }

  getGameState(gameId: number): Observable<any> {
    
    return this.http.get(`${this.apiUrl}/games/${gameId}/state`, this.getAuthHeaders(this.token));
  }

  // User statistics endpoints
  getUserStats(userId: number): Observable<any> {
    
    return this.http.get(`${this.apiUrl}/users/${userId}/stats`, this.getAuthHeaders(this.token));
  }

  // Ranking endpoints
  getRankings(): Observable<any> {
    
    return this.http.get(`${this.apiUrl}/rankings`, this.getAuthHeaders(this.token));
  }

  // Game history endpoints
  getGameHistory(): Observable<any> {
    
    return this.http.get(`${this.apiUrl}/games/history`, this.getAuthHeaders(this.token));
  }

  getActiveGames(): Observable<any> {
    
    return this.http.get(`${this.apiUrl}/games/history/active`, this.getAuthHeaders(this.token));
  }

  getCompletedGames(): Observable<any> {
    
    return this.http.get(`${this.apiUrl}/games/history/completed`, this.getAuthHeaders(this.token));
  }

  

  finishGame(gameId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/games/${gameId}/abandon`, {});
  }

    // Método para obtener TODOS los juegos del usuario (activos y completados)
    getAllGames(): Observable<any> {
      return this.http.get<any>(`${this.apiUrl}/games/history/all`);
    }

     // Método para reanudar un juego existente (obtiene todos los datos necesarios)
  resumeGame(gameId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/games/${gameId}/resume`);
  }
  
    
}