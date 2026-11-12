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

- Registration with name, email, and password.
- Login with email and password, with switching between both forms.
- Loading state and API/network error messages.
- Cookie-based authentication and session restoration through `GET /me`.
- Training history with exercise names, dates, categories, and notes.
- Session details with ordered strength/cardio sets and measurement units.
- Editing session dates and notes from the detail screen.
- Editing saved set measurements with prefilled category-specific inputs.
- Training library with creating, renaming, archiving, restoring, and deleting unused types.
- Session logging with an active type, date, notes, and multiple strength/cardio sets.
- Loading, empty, and error states with retry.
- Logout and return to login when history requests report an expired session.

Create an account from the login screen. Registration returns to login with the email prefilled; it does not log in automatically. Adding/removing saved sets and deleting sessions from the detail screen are not implemented yet. The browser manages the HTTP-only session cookie; no token is stored in localStorage.

## Manual checks

With both servers running:

1. Create an account, check the success message and prefilled email, then log in; expect its training history in the backend's order.
2. Refresh; the session should remain active.
3. Select a session name; check its sets and measurements, then return to history.
4. In a private browser window, enter a wrong password; expect the API error in the form.
5. Stop the backend and reload; log in again after restarting it. History errors offer a retry button.
6. Log out; expect the login form. Refresh and confirm you remain logged out.
7. Log in with an account without sessions; expect the empty-history message.
8. Invalidate the browser session through the backend, then refresh; expect login instead of private history.

Also try registering an existing email; the form should show the duplicate-account error.

Training library checks:

- Open Manage training types, add an exercise, and rename it.
- Repeat an existing name; expect the backend duplicate-name error.
- Archive and restore a type; check its badge changes.
- Cancel deletion, then delete an unused disposable type.
- Try deleting a type used by sessions; expect the message to archive it instead.
- Return to history and check renamed exercises show the new name.

Session logging checks:

- Choose Log session and save a weighted session with multiple sets; expect its details to open.
- Return to history and confirm the new session is listed. Log another session on the same date.
- Log bodyweight without added weight and cardio with optional measurements.
- Add/remove draft sets; changing exercise should clear them without clearing the date or notes.
- Archive all training types, then open Log session; expect a link to the library.
- Stop the backend before saving; check that input remains available for retry.

Session positions are chosen from the latest sessions on the selected date just before saving. If another request takes that position first, the backend returns a conflict; submitting again fetches the positions again.

Session editing checks:

- Open a session and choose Edit session; date and notes should be prefilled.
- Change notes, save, and confirm the details update. Clear notes and save again.
- Move a session to another date; it should appear after that date's existing sessions.
- Return to history and confirm the new date and notes are visible.
- Edit and cancel; no data should change.
- Stop the backend before saving; the form should show an error and retain input.

Set editing checks:

- Open a session, choose Edit set, and confirm the saved measurements are prefilled.
- Change reps/weight or cardio measurements, save, and verify details and a browser refresh show the update.
- Clear optional added weight or cardio measurements and save; required measurements must remain filled.
- Cancel edits; the saved set should remain unchanged.
- Try saving while the backend is unavailable; the form should retain input and allow retry.

Repeated registration/login attempts may trigger the backend's shared authentication rate limit.

## Commands

- `npm run dev`: development server on port 5173.
- `npm run build`: TypeScript check and production build.
- `npm run lint`: ESLint checks.
- `npm run preview`: preview the production build. Its default port differs from the allowed local frontend origin; adjust the backend origin when testing authentication there.

See [the backend API reference](../backend/API-REFERENCE.md) for request and response details.
