import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  register(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { username, password });
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { username, password });
  }

  getAirlines(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/airlines`);
  }

  getAircraft(airline: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/aircraft/${airline}`);
  }

  getSeen(username: string, airline: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/seen/${username}/${airline}`);
  }

  updateSeen(username: string, airline: string, registration: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/seen`, { username, airline, registration });
  }
}
