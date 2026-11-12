# Gym Logger Frontend

React, TypeScript, Vite, and Tailwind frontend for Gym Logger.

## Local setup

```sh
npm install
npm run dev
```

Open `http://localhost:5173`. Start the backend separately on port 4000 and set its `FRONTEND_URL` to `http://localhost:5173`.

The API URL defaults to `http://localhost:4000`. To change it, copy `.env.example` to `.env` and set `VITE_API_URL` without a trailing slash. Restart Vite after changing environment values. Vite variables are public; do not put secrets in them.

## Current features

- Login with email and password.
- Loading state and API/network error messages.
- Cookie-based authentication and session restoration through `GET /me`.
- Training history with exercise names, dates, categories, and notes.
- Loading, empty, and error states with retry.
- Logout and return to login when history requests report an expired session.

Create a test account using the backend's `users.rest`. Registration and session-detail screens are not implemented yet. The browser manages the HTTP-only session cookie; no token is stored in localStorage.

## Manual checks

With both servers running:

1. Log in with an existing account; expect its training history in the backend's order.
2. Refresh; the session should remain active.
3. In a private browser window, enter a wrong password; expect the API error in the form.
4. Stop the backend and reload; log in again after restarting it. History errors offer a retry button.
5. Log out; expect the login form. Refresh and confirm you remain logged out.
6. Log in with an account without sessions; expect the empty-history message.
7. Invalidate the browser session through the backend, then refresh; expect login instead of private history.

Repeated login attempts may trigger the backend's shared authentication rate limit.

## Commands

- `npm run dev`: development server on port 5173.
- `npm run build`: TypeScript check and production build.
- `npm run lint`: ESLint checks.
- `npm run preview`: preview the production build. Its default port differs from the allowed local frontend origin; adjust the backend origin when testing authentication there.

See [the backend API reference](../backend/API-REFERENCE.md) for request and response details.
