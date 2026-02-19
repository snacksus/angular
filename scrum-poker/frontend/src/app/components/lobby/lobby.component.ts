import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="lobby">
      <div class="lobby-card">
        <h2>Start or Join a Session</h2>

        <!-- Create Session -->
        <div class="section">
          <h3>Create New Session</h3>
          <div class="form-group">
            <label for="newSessionName">Session Name</label>
            <input id="newSessionName" type="text" [(ngModel)]="newSessionName"
                   placeholder="e.g. Sprint 42 Planning" />
          </div>
          <div class="form-group">
            <label for="createPlayerName">Your Name</label>
            <input id="createPlayerName" type="text" [(ngModel)]="createPlayerName"
                   placeholder="e.g. Jane (Scrum Master)" />
          </div>
          <button class="btn btn-primary" (click)="createSession()"
                  [disabled]="!newSessionName || !createPlayerName">
            Create Session
          </button>
          <p class="hint">You will be the Scrum Master for this session.</p>
        </div>

        <div class="divider">
          <span>OR</span>
        </div>

        <!-- Join Session -->
        <div class="section">
          <h3>Join Existing Session</h3>
          <div class="form-group">
            <label for="sessionId">Session ID</label>
            <input id="sessionId" type="text" [(ngModel)]="joinSessionId"
                   placeholder="e.g. a1b2c3d4" />
          </div>
          <div class="form-group">
            <label for="joinPlayerName">Your Name</label>
            <input id="joinPlayerName" type="text" [(ngModel)]="joinPlayerName"
                   placeholder="e.g. John" />
          </div>
          <button class="btn btn-secondary" (click)="joinSession()"
                  [disabled]="!joinSessionId || !joinPlayerName">
            Join Session
          </button>
        </div>

        @if (errorMessage) {
          <div class="error">{{ errorMessage }}</div>
        }
      </div>
    </div>
  `,
  styles: [`
    .lobby {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      width: 100%;
      max-width: 500px;
    }
    .lobby-card {
      background: white;
      border-radius: 16px;
      padding: 2.5rem;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      width: 100%;
    }
    .lobby-card h2 {
      text-align: center;
      color: #333;
      margin-bottom: 2rem;
    }
    .section h3 {
      color: #555;
      margin-bottom: 1rem;
      font-size: 1.1rem;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    .form-group label {
      display: block;
      margin-bottom: 0.3rem;
      font-weight: 500;
      color: #555;
      font-size: 0.9rem;
    }
    .form-group input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }
    .form-group input:focus {
      outline: none;
      border-color: #667eea;
    }
    .btn {
      width: 100%;
      padding: 0.85rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102,126,234,0.4);
    }
    .btn-secondary {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }
    .btn-secondary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(245,87,108,0.4);
    }
    .hint {
      text-align: center;
      color: #888;
      font-size: 0.85rem;
      margin-top: 0.5rem;
    }
    .divider {
      display: flex;
      align-items: center;
      margin: 2rem 0;
      color: #aaa;
    }
    .divider::before, .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e0e0e0;
    }
    .divider span {
      padding: 0 1rem;
      font-weight: 600;
    }
    .error {
      background: #fee;
      color: #c33;
      padding: 0.75rem;
      border-radius: 8px;
      margin-top: 1rem;
      text-align: center;
      font-size: 0.9rem;
    }
  `]
})
export class LobbyComponent {
  newSessionName = '';
  createPlayerName = '';
  joinSessionId = '';
  joinPlayerName = '';
  errorMessage = '';

  constructor(
    private sessionService: SessionService,
    private router: Router
  ) {}

  createSession(): void {
    this.errorMessage = '';
    this.sessionService.createSession(this.newSessionName, this.createPlayerName).subscribe({
      next: (response) => {
        sessionStorage.setItem('playerId', response.playerId);
        sessionStorage.setItem('playerName', this.createPlayerName);
        sessionStorage.setItem('isScrumMaster', 'true');
        this.router.navigate(['/session', response.sessionId]);
      },
      error: () => {
        this.errorMessage = 'Failed to create session. Please try again.';
      }
    });
  }

  joinSession(): void {
    this.errorMessage = '';
    this.sessionService.joinSession(this.joinSessionId, this.joinPlayerName).subscribe({
      next: (response) => {
        sessionStorage.setItem('playerId', response.playerId);
        sessionStorage.setItem('playerName', this.joinPlayerName);
        sessionStorage.setItem('isScrumMaster', 'false');
        this.router.navigate(['/session', response.sessionId]);
      },
      error: () => {
        this.errorMessage = 'Session not found. Please check the Session ID.';
      }
    });
  }
}
