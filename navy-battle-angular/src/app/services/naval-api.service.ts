import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavalApiService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) { }

  private getAuthHeaders() {
    const token = sessionStorage.getItem('access_token');
    return {
      headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` })
    };
  }

  // Authentication endpoints
  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, { username, email, password });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {}, this.getAuthHeaders());
  }

  // Game management endpoints
  startGame(): Observable<any> {
    return this.http.post(`${this.apiUrl}/games/start-auto`, {}, this.getAuthHeaders());
  }

  getBoard(gameId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/games/${gameId}/board`, this.getAuthHeaders());
  }

  // Get the revealed board showing hits/misses
  getRevealedBoard(gameId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/games/${gameId}/revealed-board`, this.getAuthHeaders());
  }

  fireShot(gameId: number, x: number, y: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/games/${gameId}/fire`, { x, y }, this.getAuthHeaders());
  }

  getGameState(gameId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/games/${gameId}/state`, this.getAuthHeaders());
  }

  // User statistics endpoints
  getUserStats(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${userId}/stats`, this.getAuthHeaders());
  }

  // Ranking endpoints
  getRankings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/rankings`, this.getAuthHeaders());
  }

  // Game history endpoints
  getGameHistory(): Observable<any> {
    return this.http.get(`${this.apiUrl}/games/history`, this.getAuthHeaders());
  }

  getActiveGames(): Observable<any> {
    return this.http.get(`${this.apiUrl}/games/history/active`, this.getAuthHeaders());
  }

  getCompletedGames(): Observable<any> {
    return this.http.get(`${this.apiUrl}/games/history/completed`, this.getAuthHeaders());
  }

  // Abandonar un juego pero mantenerlo activo para reanudar después
  abandonGame(gameId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/games/${gameId}/abandon`, {}, this.getAuthHeaders());
  }

  // Método para obtener TODOS los juegos del usuario (activos y completados)
  getAllGames(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/games/history/all`, this.getAuthHeaders());
  }

  // Método para reanudar un juego existente (obtiene todos los datos necesarios)
  resumeGame(gameId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/games/${gameId}/resume`, this.getAuthHeaders());
  }
}