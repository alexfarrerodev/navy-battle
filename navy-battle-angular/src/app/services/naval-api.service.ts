import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavalApiService {

  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(token: string) {
    return {
      headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` })
    };
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, { username, email, password });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password });
  }

  startGame(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/games/start`, {}, this.getAuthHeaders(token));
  }

  getBoard(gameId: number, token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/games/${gameId}/board`, this.getAuthHeaders(token));
  }

  fireShot(gameId: number, x: number, y: number, token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/games/${gameId}/fire`, { x, y }, this.getAuthHeaders(token));
  }

  getGameState(gameId: number, token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/games/${gameId}/state`, this.getAuthHeaders(token));
  }

  getUserStats(userId: number, token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${userId}/stats`, this.getAuthHeaders(token));
  }

  getRankings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/rankings`);
  }
}
