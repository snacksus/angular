import { Injectable, OnDestroy } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { SessionState } from '../models/session.model';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService implements OnDestroy {
  private client: Client | null = null;
  private sessionState$ = new BehaviorSubject<SessionState | null>(null);
  private connected$ = new BehaviorSubject<boolean>(false);

  getSessionState(): Observable<SessionState | null> {
    return this.sessionState$.asObservable();
  }

  isConnected(): Observable<boolean> {
    return this.connected$.asObservable();
  }

  connect(sessionId: string): void {
    if (this.client?.connected) {
      this.disconnect();
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        this.connected$.next(true);
        this.client?.subscribe(`/topic/session/${sessionId}`, (message: IMessage) => {
          const state: SessionState = JSON.parse(message.body);
          this.sessionState$.next(state);
        });
      },
      onDisconnect: () => {
        this.connected$.next(false);
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        this.connected$.next(false);
      }
    });

    this.client.activate();
  }

  sendVote(sessionId: string, playerId: string, vote: string): void {
    this.client?.publish({
      destination: `/app/session/${sessionId}/vote`,
      body: JSON.stringify({ type: 'VOTE', playerId, vote })
    });
  }

  revealVotes(sessionId: string, playerId: string): void {
    this.client?.publish({
      destination: `/app/session/${sessionId}/reveal`,
      body: JSON.stringify({ type: 'REVEAL', playerId })
    });
  }

  resetVotes(sessionId: string, playerId: string): void {
    this.client?.publish({
      destination: `/app/session/${sessionId}/reset`,
      body: JSON.stringify({ type: 'RESET', playerId })
    });
  }

  setTopic(sessionId: string, topic: string): void {
    this.client?.publish({
      destination: `/app/session/${sessionId}/topic`,
      body: JSON.stringify({ type: 'TOPIC', topic })
    });
  }

  leaveSession(sessionId: string, playerId: string): void {
    this.client?.publish({
      destination: `/app/session/${sessionId}/leave`,
      body: JSON.stringify({ type: 'LEAVE', playerId })
    });
  }

  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    this.connected$.next(false);
    this.sessionState$.next(null);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
