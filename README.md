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
- A confirmation screen after login; training history is not connected yet.

Create a test account using the backend's `users.rest`. Registration and logout screens are not implemented yet. The browser manages the HTTP-only session cookie; no token is stored in localStorage.

## Manual checks

With both servers running:

1. Log in with an existing account; expect the signed-in confirmation.
2. Refresh; the session should remain active.
3. In a private browser window, enter a wrong password; expect the API error in the form.
4. Stop the backend and try submitting; expect an error and an enabled button for retry.

Repeated login attempts may trigger the backend's shared authentication rate limit.

## Commands

- `npm run dev`: development server on port 5173.
- `npm run build`: TypeScript check and production build.
- `npm run lint`: ESLint checks.
- `npm run preview`: preview the production build. Its default port differs from the allowed local frontend origin; adjust the backend origin when testing authentication there.

See [the backend API reference](../backend/API-REFERENCE.md) for request and response details.
