# Scrum Poker

A real-time Scrum Poker (Planning Poker) application with an **Angular 19** frontend and a **Spring Boot 3** (Java 17) backend using **WebSockets** for live updates.

## Features

- **Create sessions** — A Scrum Master creates a session and shares the session ID with the team
- **Join sessions** — Team members join by entering the session ID and their name
- **Fibonacci voting** — Vote using Fibonacci numbers: 1, 2, 3, 5, 8, 13, 21, or ? (unsure)
- **Hidden votes** — Votes are kept hidden (only showing a checkmark) until revealed
- **Reveal votes** — The Scrum Master reveals all votes at once
- **Vote summary** — After reveal, shows average, highest, lowest, and whether there's consensus
- **New round** — Scrum Master can reset for the next story
- **Set topic** — Scrum Master can set the current story/topic being estimated
- **Real-time updates** — All changes are pushed to all connected clients via WebSocket (STOMP over SockJS)

## Project Structure

```
scrum-poker/
├── backend/                          # Spring Boot backend
│   ├── pom.xml
│   └── src/main/java/com/scrumpoker/
│       ├── ScrumPokerApplication.java
│       ├── config/
│       │   ├── CorsConfig.java
│       │   └── WebSocketConfig.java
│       ├── controller/
│       │   ├── SessionController.java        # REST endpoints
│       │   └── PokerWebSocketController.java # WebSocket message handlers
│       ├── dto/
│       │   ├── CreateSessionRequest.java
│       │   ├── JoinSessionRequest.java
│       │   ├── PlayerState.java
│       │   ├── SessionState.java
│       │   └── VoteMessage.java
│       ├── model/
│       │   ├── Player.java
│       │   └── Session.java
│       └── service/
│           └── SessionService.java
│
└── frontend/                         # Angular 19 frontend
    ├── package.json
    ├── angular.json
    ├── tsconfig.json
    ├── proxy.conf.json
    └── src/
        ├── index.html
        ├── main.ts
        ├── styles.css
        └── app/
            ├── app.component.ts
            ├── app.config.ts
            ├── app.routes.ts
            ├── models/
            │   └── session.model.ts
            ├── services/
            │   ├── session.service.ts
            │   └── websocket.service.ts
            └── components/
                ├── lobby/
                │   └── lobby.component.ts
                └── session/
                    └── session.component.ts
```

## Prerequisites

- **Java 17+** (for the backend)
- **Maven 3.8+** (for the backend)
- **Node.js 20+** and **npm** (for the frontend)

## Getting Started

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

The backend starts on **http://localhost:8080**.

> On Windows, use `mvnw.cmd spring-boot:run` or install Maven globally and use `mvn spring-boot:run`.

### Frontend

```bash
cd frontend
npm install
npm start
```

The Angular dev server starts on **http://localhost:4200** and proxies API/WebSocket requests to the backend.

## How to Use

1. **Start both** the backend and frontend servers
2. **Open** http://localhost:4200 in your browser
3. **Create a session** — Enter a session name and your name, then click "Create Session". You become the Scrum Master
4. **Share the Session ID** — Copy the session ID and share it with your team
5. **Team joins** — Team members open the same URL, enter the session ID and their name, then click "Join Session"
6. **Vote** — Everyone clicks a Fibonacci card to cast their vote (votes are hidden)
7. **Reveal** — The Scrum Master clicks "Reveal Votes" to show all votes
8. **New Round** — The Scrum Master clicks "New Round" to reset for the next story

## API Reference

### REST Endpoints

| Method | Endpoint                         | Description          |
|--------|----------------------------------|----------------------|
| POST   | `/api/sessions`                  | Create a new session |
| POST   | `/api/sessions/{id}/join`        | Join a session       |
| GET    | `/api/sessions/{id}`             | Get session state    |

### WebSocket (STOMP)

- **Endpoint**: `/ws` (SockJS)
- **Subscribe**: `/topic/session/{sessionId}` — Receive session state updates
- **Send vote**: `/app/session/{sessionId}/vote`
- **Reveal**: `/app/session/{sessionId}/reveal`
- **Reset**: `/app/session/{sessionId}/reset`
- **Set topic**: `/app/session/{sessionId}/topic`
- **Leave**: `/app/session/{sessionId}/leave`
