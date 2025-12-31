# Authentication & Sessions – React + Node.js

Minimal authentication system implementing login, register, protected routes, session persistence, and token refresh.

## Stack

- Frontend: React (Create React App + CRACO)
- Backend: Node.js + Express
- Auth: JWT (access + refresh tokens)
- State: React Context + useReducer
- Routing: React Router
- HTTP: Axios
- Dev Env: VS Code + WSL (Ubuntu)


## Features (Exercise Requirements)

- Login and Register
- JWT-based authentication
- Protected routes
- Session persistence (“remember session”)
- Automatic token refresh
- Automatic logout on token expiration
- Session sync between browser tabs

## Setup

### Backend

===bash
cd backend
npm install
npm run dev


Runs on:

http://localhost:5000

### Frontend

===bash
cd auth-frontend
npm install
npm start

Runs on:

http://localhost:3000

## Usage

1. Register a new user at:

    /register

2. Login at:

   /login

3. Access protected content at:

   /dashboard

Session is persisted across reloads and browser restarts.

## Notes

* User storage is in-memory (exercise scope).
* No database integration by design.
* Focused strictly on authentication and session handling.
