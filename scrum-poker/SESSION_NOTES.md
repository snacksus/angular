# Scrum Poker - Session Notes

## Project Status

The full project scaffolding is **complete**. All source files for both backend and frontend have been created. Next steps are to install dependencies and run the application.

## Project Location

```
c:\dev\projects\angular\scrum-poker\
```

## What's Done

### Backend (Spring Boot 3 / Java 17) - COMPLETE
- `backend/pom.xml` — Maven project with spring-boot-starter-web + spring-boot-starter-websocket
- `ScrumPokerApplication.java` — Main entry point
- `WebSocketConfig.java` — STOMP over SockJS at `/ws`, broker on `/topic`, app prefix `/app`
- `CorsConfig.java` — Allows all origins for dev
- `Player.java`, `Session.java` — Domain models
- `CreateSessionRequest.java`, `JoinSessionRequest.java`, `VoteMessage.java`, `PlayerState.java`, `SessionState.java` — DTOs
- `SessionService.java` — In-memory session management (ConcurrentHashMap)
- `SessionController.java` — REST: POST `/api/sessions`, POST `/api/sessions/{id}/join`, GET `/api/sessions/{id}`
- `PokerWebSocketController.java` — WS: vote, reveal, reset, topic, leave

### Frontend (Angular 19) - COMPLETE (not yet installed)
- `frontend/package.json` — Dependencies: Angular 19, @stomp/stompjs, sockjs-client
- `frontend/angular.json` — Build config with proxy
- `frontend/proxy.conf.json` — Proxies `/api` and `/ws` to localhost:8080
- `frontend/tsconfig.json` / `tsconfig.app.json`
- `src/index.html`, `src/main.ts`, `src/styles.css` — Entry files
- `app.component.ts` — Root component with header
- `app.config.ts` — Providers (router, httpClient)
- `app.routes.ts` — Routes: `/` → Lobby, `/session/:sessionId` → Session
- `models/session.model.ts` — TypeScript interfaces
- `services/session.service.ts` — HTTP service for REST API
- `services/websocket.service.ts` — STOMP WebSocket service
- `components/lobby/lobby.component.ts` — Create/join session UI
- `components/session/session.component.ts` — Poker board with Fibonacci cards, player grid, SM controls

## What's Left To Do

1. **Install frontend dependencies**
   ```bash
   cd c:\dev\projects\angular\scrum-poker\frontend
   npm install
   ```

2. **Start the backend** (requires Java 17+ and Maven)
   ```bash
   cd c:\dev\projects\angular\scrum-poker\backend
   mvn spring-boot:run
   ```

3. **Start the frontend**
   ```bash
   cd c:\dev\projects\angular\scrum-poker\frontend
   npm start
   ```

4. **Test end-to-end** — Open http://localhost:4200, create a session, open a second browser tab, join with the session ID, vote, reveal

5. **Potential enhancements** (not yet implemented):
   - Persist sessions to a database
   - Add authentication
   - Auto-detect when all players have voted
   - Confetti animation on consensus
   - Dark mode

## Environment

- **OS**: Windows
- **Node.js**: v24 (just installed, reboot needed)
- **Java**: 17+ required
- **Maven**: required (or use `mvnw` wrapper — `.mvn/wrapper/maven-wrapper.properties` is set up)
- **Angular CLI**: v19 (installed via npm as dev dependency, no global install needed)

## Key Architecture Decisions

- **No database** — Sessions are stored in-memory (ConcurrentHashMap). Data resets on backend restart.
- **STOMP over SockJS** — For WebSocket communication with automatic fallback
- **Standalone components** — Angular 19 standalone architecture (no NgModules)
- **Proxy config** — Angular dev server proxies `/api` and `/ws` to Spring Boot on port 8080
- **Fibonacci sequence**: 1, 2, 3, 5, 8, 13, 21, ? (question mark for "unsure")
- **Scrum Master role** — The session creator becomes SM; only SM can reveal/reset votes
