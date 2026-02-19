import { Routes } from '@angular/router';
import { LobbyComponent } from './components/lobby/lobby.component';
import { SessionComponent } from './components/session/session.component';

export const routes: Routes = [
  { path: '', component: LobbyComponent },
  { path: 'session/:sessionId', component: SessionComponent },
  { path: '**', redirectTo: '' }
];
