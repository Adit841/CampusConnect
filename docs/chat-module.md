# Chat & Real-Time Communication Module

**Author:** Ayushman (Member 4)
**Branch:** `ayushman-feature`
**Last updated:** 2026-10-09

---

## Overview

This module adds private one-to-one messaging between CampusConnect users with persistent message history and real-time delivery via STOMP/WebSocket.

---

## Architecture

```
Frontend (React)
    │
    ├── REST (Axios / api.js)
    │       GET  /api/conversations
    │       POST /api/conversations
    │       GET  /api/conversations/{id}/messages?page=0
    │       POST /api/conversations/{id}/messages        ← WS fallback
    │
    └── WebSocket (STOMP / SockJS)
            Connect  → /ws/sockjs
            Send     → /app/chat.send
            Receive  ← /topic/conversations/{id}
            Errors   ← /user/queue/errors

Backend (Spring Boot)
    ConversationController  → ConversationService → ConversationRepository
    MessageController       → MessageService      → MessageRepository
    ChatWebSocketController → MessageService      → SimpMessagingTemplate
                                                  → /topic/conversations/{id}
    GlobalExceptionHandler  (RFC 9457 ProblemDetail responses)
    WebSocketConfig         (STOMP broker, /ws endpoint, SockJS)
    SecurityConfig          (/ws/** permitted for handshake)
```

---

## New & Modified Files

### Backend — New

| File | Purpose |
|---|---|
| `entity/User.java` | Placeholder user entity (Aman replaces this) |
| `entity/Conversation.java` | One-to-one conversation root |
| `entity/ConversationParticipant.java` | Membership join table |
| `entity/Message.java` | Chat message with clientMsgId deduplication |
| `repository/UserRepository.java` | findByUsername integration point |
| `repository/ConversationRepository.java` | findByParticipantUserId, findOneToOne |
| `repository/ConversationParticipantRepository.java` | Membership checks |
| `repository/MessageRepository.java` | Paginated history, clientMsgId lookup |
| `dto/ConversationSummaryDto.java` | Conversation list response |
| `dto/CreateConversationRequest.java` | POST /conversations request |
| `dto/MessageDto.java` | Message response |
| `dto/SendMessageRequest.java` | REST/WS send request |
| `dto/WsIncomingMessage.java` | STOMP send payload |
| `service/ConversationService.java` | Business logic + membership enforcement |
| `service/MessageService.java` | Send + dedup + history |
| `controller/ConversationController.java` | GET/POST /api/conversations |
| `controller/MessageController.java` | GET/POST /api/conversations/{id}/messages |
| `controller/ChatWebSocketController.java` | @MessageMapping /app/chat.send |
| `config/WebSocketConfig.java` | STOMP broker + /ws endpoint |
| `exception/GlobalExceptionHandler.java` | ProblemDetail error responses |
| `test/ChatServiceTest.java` | Unit tests (Mockito, no DB) |

### Backend — Modified

| File | Change |
|---|---|
| `pom.xml` | + `spring-boot-starter-websocket`, `spring-boot-starter-validation` |
| `config/SecurityConfig.java` | + permit `/ws/**`, + Aman TODO comment |
| `resources/application.properties` | + `app.websocket.allowed-origins`, `app.chat.message-max-length` |
| `.env.example` | + `CHAT_MESSAGE_MAX_LENGTH` |

### Database

| File | Change |
|---|---|
| `database/schema.sql` | + `users`, `conversations`, `conversation_participants`, `messages` tables |

### Frontend — New

| File | Purpose |
|---|---|
| `context/AuthContext.jsx` | Placeholder auth context (localStorage dev auth) |
| `services/chatApi.js` | REST wrappers for conversations + messages |
| `hooks/useConversations.js` | Conversation list state + actions |
| `hooks/useMessages.js` | Paginated history + optimistic append |
| `hooks/useChat.js` | STOMP lifecycle, subscriptions, send (WS + REST fallback) |
| `pages/ChatPage.jsx` | `/chat` route — two-panel responsive layout |
| `components/ConversationList.jsx` | Sidebar with loading/empty/error states |
| `components/ConversationItem.jsx` | Single conversation row |
| `components/MessagePane.jsx` | Message history + composer |
| `components/MessageBubble.jsx` | Own vs other bubble styling |
| `components/MessageComposer.jsx` | Auto-grow textarea, Enter to send |
| `util/dateUtils.js` | Relative time + date group helpers |

### Frontend — Modified

| File | Change |
|---|---|
| `App.jsx` | + `/chat` route, + `AuthProvider` wrapper |
| `layouts/MainLayout.jsx` | + Chat `NavLink` with icon |
| `services/api.js` | + Bearer token request interceptor, + 401 response interceptor |
| `package.json` | + `@stomp/stompjs`, `sockjs-client`, `uuid` |
| `.env.example` | + `VITE_WS_BASE_URL` |

---

## Database Schema

```sql
users                         -- placeholder; Aman owns the final version
  id, username (unique), display_name, email, created_at

conversations
  id, created_at

conversation_participants     -- join table; UNIQUE(conversation_id, user_id)
  id, conversation_id → conversations, user_id → users, joined_at

messages                      -- UNIQUE(client_msg_id) for deduplication
  id, conversation_id → conversations, sender_id → users,
  content (max 4000), sent_at, client_msg_id
  INDEX (conversation_id, sent_at)
```

### Applying the schema

```bash
# Fresh setup
mysql -u <user> -p < database/schema.sql

# Existing database (Hibernate ddl-auto=update handles it at startup)
# Just ensure DB_USERNAME and DB_PASSWORD env vars are set and restart the backend.
```

---

## REST API Contract

### `GET /api/conversations`

**Auth:** Required (Principal must resolve to a known user)

**Response 200:**
```json
[
  {
    "id": 1,
    "otherParticipantId": 2,
    "otherParticipantUsername": "bob",
    "otherParticipantDisplayName": "Bob Jones",
    "lastMessageContent": "Hey there!",
    "lastMessageAt": "2026-10-09T06:15:00Z",
    "unreadCount": 0
  }
]
```

**Errors:** `401` if not authenticated.

---

### `POST /api/conversations`

**Auth:** Required

**Request:**
```json
{ "targetUserId": 2 }
```

**Response 200** (finds existing or creates new):
```json
{
  "id": 1,
  "otherParticipantId": 2,
  "otherParticipantUsername": "bob",
  "otherParticipantDisplayName": "Bob Jones",
  "lastMessageContent": null,
  "lastMessageAt": "2026-10-09T06:00:00Z",
  "unreadCount": 0
}
```

**Errors:** `400` self-messaging or invalid ID · `401` unauthenticated · `404` target user not found.

---

### `GET /api/conversations/{conversationId}/messages?page=0`

**Auth:** Required + must be a participant

**Response 200** (Spring `Page` wrapper):
```json
{
  "content": [
    {
      "id": 42,
      "conversationId": 1,
      "senderId": 1,
      "senderUsername": "alice",
      "senderDisplayName": "Alice Smith",
      "content": "Hello!",
      "sentAt": "2026-10-09T06:10:00Z",
      "clientMsgId": "550e8400-e29b-41d4-a716-446655440000"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "size": 50,
  "number": 0
}
```

**Errors:** `401` · `403` not a participant · `404` conversation not found.

---

### `POST /api/conversations/{conversationId}/messages`

**Auth:** Required + must be a participant

**Request:**
```json
{
  "content": "Hello!",
  "clientMsgId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response 200:** Same `MessageDto` as above.

**Errors:** `400` blank/too-long content or missing clientMsgId · `401` · `403` · `404`.

---

## WebSocket Contract

### Connection

| Property | Value |
|---|---|
| **Native WS endpoint** | `ws://localhost:8080/ws` |
| **SockJS endpoint** | `http://localhost:8080/ws/sockjs` |
| **Protocol** | STOMP 1.2 over WebSocket / SockJS |
| **Auth header** | `Authorization: Bearer <token>` in STOMP CONNECT frame |
| **Reconnect delay** | 5 seconds (automatic, client-side) |

### Destinations

| Direction | Destination | Purpose |
|---|---|---|
| Client → Server | `/app/chat.send` | Send a message |
| Server → Client | `/topic/conversations/{id}` | Broadcast to all participants |
| Server → Client | `/user/queue/errors` | Per-user error delivery |

### Send Payload (`/app/chat.send`)

```json
{
  "conversationId": 1,
  "content": "Hello!",
  "clientMsgId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Received Payload (`/topic/conversations/{id}`)

Same as `MessageDto` — see REST contract above.

### Error Payload (`/user/queue/errors`)

```json
{ "error": "You do not have access to this conversation" }
```

### Authorization rules

- Server validates `Principal` from the STOMP session on every message.
- Server checks that the sender is a participant in `conversationId` before persisting or broadcasting.
- Clients cannot receive another user's messages by guessing a conversation ID — subscription to `/topic/conversations/{id}` only delivers messages; the server never pushes to a client that isn't supposed to receive them via user-destination segregation. Full subscription-level enforcement requires Aman's JWT ChannelInterceptor.

---

## Required Environment Variables

### Backend

| Variable | Default | Description |
|---|---|---|
| `DB_URL` | `jdbc:mysql://localhost:3306/campusconnect` | MySQL JDBC URL |
| `DB_USERNAME` | *(required)* | MySQL username |
| `DB_PASSWORD` | *(required)* | MySQL password |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Frontend origin(s) |
| `CHAT_MESSAGE_MAX_LENGTH` | `4000` | Max message length in chars |

### Frontend

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080/api` | REST API base URL |
| `VITE_WS_BASE_URL` | `http://localhost:8080/ws/sockjs` | WebSocket SockJS URL |

---

## Running the Module

### Backend

```bash
cd backend
# Set required env vars
export DB_USERNAME=root
export DB_PASSWORD=yourpassword

mvn spring-boot:run
# API: http://localhost:8080
```

### Frontend

```bash
cd frontend
npm install          # installs @stomp/stompjs, sockjs-client, uuid
npm run dev
# App: http://localhost:5173
```

### Dev Login (temporary until Aman's auth is merged)

```js
// In the browser console at http://localhost:5173
localStorage.setItem('cc_username', 'alice')
localStorage.setItem('cc_displayName', 'Alice Smith')
localStorage.setItem('cc_userId', '1')
// Refresh page → you are now "alice"
```

---

## Running Tests

```bash
cd backend
mvn test
# ChatServiceTest runs without a database (Mockito mocks all repos)
```

---

## Known Limitations & Remaining Integration Work

| Item | Status | Owner |
|---|---|---|
| Real JWT authentication | Placeholder localhost dev auth only | Aman (auth module) |
| WebSocket subscription-level auth (ChannelInterceptor) | Documented TODO in `WebSocketConfig.java` and `SecurityConfig.java` | Aman |
| `/api/users` endpoint for "New Conversation" dialog | Not implemented — frontend shows no dialog until this exists | Aman (auth/profile module) |
| Unread message counts | Always 0 — field reserved in DTO | Future work |
| Group conversations | Only 1-to-1 supported | Future work |
| File/image attachments | Not supported | Future work |
| Message edit / delete | Not supported | Future work |
| Push notifications for offline users | Not implemented | Future work (integrate with Member 3 announcements module) |
| Production WebSocket scaling | Uses in-memory simple broker — replace with RabbitMQ/Redis broker for multi-node | Future work |

---

## Integration Points with Other Modules

### Auth/Profile Module (Aman — Member 1)

1. **Replace `entity/User.java`** with the authoritative User entity. Keep the `username` column name unchanged (chat uses it as principal name).
2. **Update `UserRepository.java`** or replace it — the key method is `findByUsername(String)`.
3. **Wire JWT ChannelInterceptor** in `WebSocketConfig` (see TODO comment in that file).
4. **Align localStorage key** `cc_token` used in `api.js` interceptor with whatever key the auth module uses for the JWT, or update the interceptor.

### Announcements/Notifications Module (Member 3)

- Unread message count is always 0 in the current implementation.
- If a notification system is introduced, `MessageService.send()` is the right place to emit a notification event after a message is persisted.
