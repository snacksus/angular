import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateSessionResponse, JoinSessionResponse, SessionState } from '../models/session.model';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private baseUrl = '/api/sessions';

  constructor(private http: HttpClient) {}

  createSession(sessionName: string, playerName: string): Observable<CreateSessionResponse> {
    return this.http.post<CreateSessionResponse>(this.baseUrl, { sessionName, playerName });
  }

  joinSession(sessionId: string, playerName: string): Observable<JoinSessionResponse> {
    return this.http.post<JoinSessionResponse>(`${this.baseUrl}/${sessionId}/join`, { playerName });
  }

  getSession(sessionId: string): Observable<SessionState> {
    return this.http.get<SessionState>(`${this.baseUrl}/${sessionId}`);
  }
}
