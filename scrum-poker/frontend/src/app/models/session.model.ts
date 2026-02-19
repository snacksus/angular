export interface PlayerState {
  id: string;
  name: string;
  scrumMaster: boolean;
  vote: string | null;
  hasVoted: boolean;
}

export interface SessionState {
  sessionId: string;
  sessionName: string;
  players: PlayerState[];
  revealed: boolean;
  currentTopic: string | null;
}

export interface CreateSessionResponse {
  sessionId: string;
  playerId: string;
}

export interface JoinSessionResponse {
  sessionId: string;
  playerId: string;
}
