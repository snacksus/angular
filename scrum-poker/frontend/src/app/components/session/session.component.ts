import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SessionState, PlayerState } from '../../models/session.model';
import { SessionService } from '../../services/session.service';
import { WebSocketService } from '../../services/websocket.service';

@Component({
  selector: 'app-session',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="session-container" *ngIf="sessionState">
      <!-- Session Header -->
      <div class="session-header">
        <div class="session-info">
          <h2>{{ sessionState.sessionName }}</h2>
          <div class="session-id">
            Session ID: <strong>{{ sessionState.sessionId }}</strong>
            <button class="btn-copy" (click)="copySessionId()">📋 Copy</button>
          </div>
        </div>
        @if (sessionState.currentTopic) {
          <div class="current-topic">
            📌 Topic: <strong>{{ sessionState.currentTopic }}</strong>
          </div>
        }
      </div>

      <!-- Scrum Master Controls -->
      @if (isScrumMaster) {
        <div class="sm-controls">
          <div class="topic-input">
            <input type="text" [(ngModel)]="topicInput" placeholder="Enter story / topic..."
                   (keyup.enter)="setTopic()" />
            <button class="btn btn-small" (click)="setTopic()" [disabled]="!topicInput">
              Set Topic
            </button>
          </div>
          <div class="sm-actions">
            <button class="btn btn-reveal" (click)="revealVotes()"
                    [disabled]="sessionState.revealed || !anyoneVoted">
              👁️ Reveal Votes
            </button>
            <button class="btn btn-reset" (click)="resetVotes()">
              🔄 New Round
            </button>
          </div>
        </div>
      }

      <!-- Voting Cards -->
      <div class="voting-section">
        <h3>{{ sessionState.revealed ? 'Results are in!' : 'Cast your vote' }}</h3>
        <div class="fibonacci-cards">
          @for (card of fibonacciCards; track card) {
            <button
              class="poker-card"
              [class.selected]="selectedVote === card"
              [class.disabled]="sessionState.revealed"
              (click)="vote(card)"
              [disabled]="sessionState.revealed">
              {{ card }}
            </button>
          }
        </div>
      </div>

      <!-- Players Table -->
      <div class="players-section">
        <h3>Team ({{ sessionState.players.length }} members)</h3>
        <div class="players-grid">
          @for (player of sessionState.players; track player.id) {
            <div class="player-card" [class.has-voted]="player.hasVoted" [class.is-me]="player.id === playerId">
              <div class="player-avatar" [class.voted]="player.hasVoted">
                {{ getInitials(player.name) }}
              </div>
              <div class="player-name">
                {{ player.name }}
                @if (player.scrumMaster) {
                  <span class="badge-sm">SM</span>
                }
                @if (player.id === playerId) {
                  <span class="badge-you">You</span>
                }
              </div>
              <div class="player-vote">
                @if (sessionState.revealed && player.vote) {
                  <span class="vote-value">{{ player.vote }}</span>
                } @else if (player.hasVoted) {
                  <span class="vote-hidden">✓</span>
                } @else {
                  <span class="vote-waiting">...</span>
                }
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Vote Summary (when revealed) -->
      @if (sessionState.revealed) {
        <div class="vote-summary">
          <h3>Summary</h3>
          <div class="summary-stats">
            <div class="stat">
              <span class="stat-label">Average</span>
              <span class="stat-value">{{ averageVote }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Highest</span>
              <span class="stat-value">{{ highestVote }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Lowest</span>
              <span class="stat-value">{{ lowestVote }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Consensus</span>
              <span class="stat-value">{{ consensus }}</span>
            </div>
          </div>
        </div>
      }

      <!-- Leave Button -->
      <div class="leave-section">
        <button class="btn btn-leave" (click)="leaveSession()">Leave Session</button>
      </div>
    </div>

    <!-- Loading State -->
    <div class="loading" *ngIf="!sessionState">
      <p>Connecting to session...</p>
    </div>
  `,
  styles: [`
    .session-container {
      width: 100%;
      max-width: 900px;
    }

    .session-header {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    }
    .session-info h2 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }
    .session-id {
      color: #777;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .session-id strong {
      font-family: monospace;
      background: #f0f0f0;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
    }
    .btn-copy {
      background: none;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 0.2rem 0.5rem;
      cursor: pointer;
      font-size: 0.8rem;
    }
    .btn-copy:hover { background: #f0f0f0; }
    .current-topic {
      margin-top: 0.75rem;
      padding: 0.5rem 0.75rem;
      background: #f8f4ff;
      border-radius: 8px;
      color: #555;
    }

    /* Scrum Master Controls */
    .sm-controls {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      border-left: 4px solid #667eea;
    }
    .topic-input {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    .topic-input input {
      flex: 1;
      padding: 0.6rem 0.8rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 0.95rem;
    }
    .topic-input input:focus {
      outline: none;
      border-color: #667eea;
    }
    .sm-actions {
      display: flex;
      gap: 0.75rem;
    }
    .btn {
      padding: 0.6rem 1.2rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.95rem;
    }
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn-small {
      background: #667eea;
      color: white;
      padding: 0.6rem 1rem;
    }
    .btn-reveal {
      background: linear-gradient(135deg, #43e97b, #38f9d7);
      color: #1a472a;
      flex: 1;
    }
    .btn-reveal:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(67,233,123,0.4);
    }
    .btn-reset {
      background: linear-gradient(135deg, #ffecd2, #fcb69f);
      color: #8b4513;
      flex: 1;
    }
    .btn-reset:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(252,182,159,0.4);
    }

    /* Voting Cards */
    .voting-section {
      margin-bottom: 1.5rem;
    }
    .voting-section h3 {
      color: #555;
      margin-bottom: 1rem;
    }
    .fibonacci-cards {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      justify-content: center;
    }
    .poker-card {
      width: 70px;
      height: 100px;
      border: 3px solid #e0e0e0;
      border-radius: 12px;
      background: white;
      font-size: 1.5rem;
      font-weight: 700;
      color: #333;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .poker-card:hover:not(:disabled) {
      border-color: #667eea;
      transform: translateY(-4px);
      box-shadow: 0 6px 16px rgba(102,126,234,0.3);
    }
    .poker-card.selected {
      border-color: #667eea;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      transform: translateY(-4px);
      box-shadow: 0 6px 16px rgba(102,126,234,0.4);
    }
    .poker-card.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Players Section */
    .players-section {
      margin-bottom: 1.5rem;
    }
    .players-section h3 {
      color: #555;
      margin-bottom: 1rem;
    }
    .players-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 1rem;
    }
    .player-card {
      background: white;
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      transition: all 0.3s;
      border: 2px solid transparent;
    }
    .player-card.is-me {
      border-color: #667eea22;
    }
    .player-card.has-voted {
      border-color: #43e97b55;
    }
    .player-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #e8ecf4;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: #667eea;
      font-size: 1.1rem;
      transition: all 0.3s;
    }
    .player-avatar.voted {
      background: #d4f5e0;
      color: #2d8a4e;
    }
    .player-name {
      font-weight: 600;
      color: #333;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.95rem;
    }
    .badge-sm {
      background: #667eea;
      color: white;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 700;
    }
    .badge-you {
      background: #f0f0f0;
      color: #888;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      font-size: 0.7rem;
    }
    .player-vote {
      margin-top: 0.25rem;
    }
    .vote-value {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 0.3rem 0.8rem;
      border-radius: 8px;
      font-weight: 700;
      font-size: 1.2rem;
    }
    .vote-hidden {
      color: #43e97b;
      font-size: 1.2rem;
      font-weight: 700;
    }
    .vote-waiting {
      color: #ccc;
      font-size: 1.2rem;
    }

    /* Summary */
    .vote-summary {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    }
    .vote-summary h3 {
      color: #555;
      margin-bottom: 1rem;
    }
    .summary-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }
    .stat {
      text-align: center;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }
    .stat-label {
      display: block;
      font-size: 0.8rem;
      color: #888;
      margin-bottom: 0.3rem;
      text-transform: uppercase;
      font-weight: 600;
    }
    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #333;
    }

    /* Leave */
    .leave-section {
      text-align: center;
      margin-top: 1rem;
    }
    .btn-leave {
      background: none;
      border: 2px solid #e0e0e0;
      color: #888;
      padding: 0.5rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }
    .btn-leave:hover {
      border-color: #f5576c;
      color: #f5576c;
    }

    .loading {
      text-align: center;
      color: #888;
      padding: 3rem;
    }

    @media (max-width: 600px) {
      .summary-stats {
        grid-template-columns: repeat(2, 1fr);
      }
      .poker-card {
        width: 56px;
        height: 80px;
        font-size: 1.2rem;
      }
      .sm-actions {
        flex-direction: column;
      }
    }
  `]
})
export class SessionComponent implements OnInit, OnDestroy {
  sessionState: SessionState | null = null;
  playerId = '';
  isScrumMaster = false;
  selectedVote: string | null = null;
  topicInput = '';

  fibonacciCards = ['1', '2', '3', '5', '8', '13', '21', '?'];

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sessionService: SessionService,
    private wsService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.playerId = sessionStorage.getItem('playerId') || '';
    this.isScrumMaster = sessionStorage.getItem('isScrumMaster') === 'true';

    const sessionId = this.route.snapshot.paramMap.get('sessionId');
    if (!sessionId || !this.playerId) {
      this.router.navigate(['/']);
      return;
    }

    // Load initial state via REST
    this.sessionService.getSession(sessionId).subscribe({
      next: (state) => {
        this.sessionState = state;
        // Find own vote if already voted
        const me = state.players.find(p => p.id === this.playerId);
        if (me?.vote) {
          this.selectedVote = me.vote;
        }
      },
      error: () => {
        this.router.navigate(['/']);
      }
    });

    // Connect WebSocket for real-time updates
    this.wsService.connect(sessionId);
    this.subscriptions.push(
      this.wsService.getSessionState().subscribe(state => {
        if (state) {
          this.sessionState = state;
          // If votes were reset, clear selection
          const me = state.players.find(p => p.id === this.playerId);
          if (me && !me.hasVoted) {
            this.selectedVote = null;
          }
        }
      })
    );
  }

  get anyoneVoted(): boolean {
    return this.sessionState?.players.some(p => p.hasVoted) ?? false;
  }

  get averageVote(): string {
    if (!this.sessionState) return '-';
    const numericVotes = this.sessionState.players
      .filter(p => p.vote && p.vote !== '?')
      .map(p => parseInt(p.vote!, 10));
    if (numericVotes.length === 0) return '-';
    const avg = numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length;
    return avg.toFixed(1);
  }

  get highestVote(): string {
    if (!this.sessionState) return '-';
    const numericVotes = this.sessionState.players
      .filter(p => p.vote && p.vote !== '?')
      .map(p => parseInt(p.vote!, 10));
    if (numericVotes.length === 0) return '-';
    return Math.max(...numericVotes).toString();
  }

  get lowestVote(): string {
    if (!this.sessionState) return '-';
    const numericVotes = this.sessionState.players
      .filter(p => p.vote && p.vote !== '?')
      .map(p => parseInt(p.vote!, 10));
    if (numericVotes.length === 0) return '-';
    return Math.min(...numericVotes).toString();
  }

  get consensus(): string {
    if (!this.sessionState) return '-';
    const votes = this.sessionState.players
      .filter(p => p.vote)
      .map(p => p.vote);
    if (votes.length === 0) return '-';
    const allSame = votes.every(v => v === votes[0]);
    return allSame ? '✅ Yes' : '❌ No';
  }

  vote(card: string): void {
    if (this.sessionState?.revealed) return;
    this.selectedVote = card;
    const sessionId = this.sessionState?.sessionId;
    if (sessionId) {
      this.wsService.sendVote(sessionId, this.playerId, card);
    }
  }

  revealVotes(): void {
    const sessionId = this.sessionState?.sessionId;
    if (sessionId) {
      this.wsService.revealVotes(sessionId, this.playerId);
    }
  }

  resetVotes(): void {
    const sessionId = this.sessionState?.sessionId;
    if (sessionId) {
      this.wsService.resetVotes(sessionId, this.playerId);
    }
  }

  setTopic(): void {
    const sessionId = this.sessionState?.sessionId;
    if (sessionId && this.topicInput.trim()) {
      this.wsService.setTopic(sessionId, this.topicInput.trim());
      this.topicInput = '';
    }
  }

  copySessionId(): void {
    if (this.sessionState) {
      navigator.clipboard.writeText(this.sessionState.sessionId);
    }
  }

  leaveSession(): void {
    const sessionId = this.sessionState?.sessionId;
    if (sessionId) {
      this.wsService.leaveSession(sessionId, this.playerId);
    }
    this.wsService.disconnect();
    sessionStorage.clear();
    this.router.navigate(['/']);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
