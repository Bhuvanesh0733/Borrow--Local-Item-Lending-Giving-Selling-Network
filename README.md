# Borrow — Local Item Lending, Giving & Selling Network

A modern full-stack platform where people in the same area can **lend, borrow, give away, or sell** physical items.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, React Router v7, Framer Motion, Leaflet Maps |
| Backend | Node.js, Express, Socket.io |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Images | Multer (streams/buffers) |
| Real-time | Socket.io (chat + typing indicators) |

## Color Palette

- Primary: `#C6FF00` (Radium Yellow-Green)
- Secondary: `#FFD600` (Bright Yellow)
- Accent: `#00A3FF` (Clean Blue)
- Dark: `#0A0E1A` (Deep Navy)

## Project Structure

```
borrow-platform/
├── client/                  # React SPA
│   └── src/
│       ├── api/             # axios instance + socket
│       ├── components/      # Navbar, ItemCard, SearchBar
│       ├── context/         # AuthContext
│       └── pages/           # All 11 pages
└── server/                  # Node.js + Express
    ├── models/              # Mongoose schemas
    ├── routes/              # REST API routes
    ├── middleware/          # auth JWT, multer upload
    └── uploads/             # uploaded images
```

## Pages

1. **/** — Landing / Home (hero, map preview, featured items, how it works)
2. **/map** — Full-screen interactive map explorer with pins + side panel
3. **/search** — Search results with filters sidebar
4. **/items/:id** — Item detail with request form
5. **/list** — Multi-step item listing form with map location picker
6. **/requests** — Incoming/outgoing requests with accept/decline
7. **/chat/:requestId** — Real-time chat (Socket.io, only after acceptance)
8. **/dashboard** — User dashboard (listed items, active borrows, lending)
9. **/notifications** — Notification center
10. **/profile/:id** — Public profile with ratings
11. **/settings** — Edit profile, avatar upload, notification prefs
12. **/login**, **/register**, **/forgot-password** — Auth pages

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally on port 27017

### 1. Server
```bash
cd server
npm install
# Edit .env if needed (MONGO_URI, JWT_SECRET, PORT)
npm start
```

### 2. Client
```bash
cd client
npm install
npm start
```

### 3. Open
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | — | Register |
| POST | /api/auth/login | — | Login |
| GET | /api/items | — | Search/filter items |
| GET | /api/items/map | — | Map pins |
| POST | /api/items | ✓ | List item (multipart) |
| GET | /api/items/:id | — | Item detail |
| PUT | /api/items/:id | ✓ | Edit item |
| DELETE | /api/items/:id | ✓ | Delete item |
| GET | /api/requests | ✓ | My requests |
| POST | /api/requests | ✓ | Send request |
| PUT | /api/requests/:id/accept | ✓ | Accept |
| PUT | /api/requests/:id/decline | ✓ | Decline |
| PUT | /api/requests/:id/complete | ✓ | Complete |
| GET | /api/messages/:requestId | ✓ | Get messages |
| POST | /api/messages/:requestId | ✓ | Send message |
| POST | /api/ratings | ✓ | Submit rating |
| GET | /api/notifications | ✓ | Get notifications |
| GET | /api/users/me | ✓ | My profile |
| PUT | /api/users/me | ✓ | Update profile |
| GET | /api/users/:id | — | Public profile |

## Socket.io Events

| Event | Direction | Description |
|---|---|---|
| `join_chat` | client→server | Join a chat room |
| `leave_chat` | client→server | Leave a chat room |
| `message` | server→client | New message received |
| `typing` | bidirectional | Typing indicator |
