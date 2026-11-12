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
- Account settings with current-password verification and new-password confirmation.
- Account deletion with password verification, permanent-deletion confirmation, and return to login.
- Loading state and API/network error messages.
- Cookie-based authentication and session restoration through `GET /me`.
- Training history with exercise names, dates, categories, and notes.
- History search, strength/cardio filtering, and inclusive date-range filters.
- Monthly calendar with session counts, selected-day sessions, and logging on a chosen date.
- Session details with ordered strength/cardio sets and measurement units.
- Editing session dates and notes from the detail screen.
- Deleting sessions and their sets with confirmation, returning to refreshed history.
- Editing saved set measurements with prefilled category-specific inputs.
- Adding and removing sets from saved sessions, with removal confirmation and last-set protection.
- Training library with creating, renaming, archiving, restoring, and deleting unused types.
- Session logging with an active type, date, notes, and multiple strength/cardio sets.
- Loading, empty, and error states with retry.
- Logout and return to login when history requests report an expired session.

Create an account from the login screen. Registration returns to login with the email prefilled; it does not log in automatically. The browser manages the HTTP-only session cookie; no token is stored in localStorage.

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

Saved-set management checks:

- Open a session and add a set; check it appears after the existing sets and persists after refresh.
- Add a cardio set with optional measurements and a bodyweight set without added weight.
- Cancel an add form; no set should be created.
- Remove a set, cancel the confirmation, then confirm removal; check the list updates.
- With one set remaining, removal should be disabled. Existing order gaps are preserved.
- Stop the backend before adding/removing; expect an error without losing saved sets or draft input.

Session deletion checks:

- Open a disposable session and choose Delete session. Cancel first; the session should remain.
- Confirm deletion; expect refreshed history without the session. Refresh the browser to verify.
- Delete a session containing a single set; whole-session deletion should still be allowed.
- Stop the backend before deleting; expect an error with the details still visible and actions enabled for retry.

History filtering checks:

- Search for part of a training name and apply; matching should be case-insensitive.
- Choose Strength; weighted and bodyweight sessions should both appear. Choose Cardio to see only cardio sessions.
- Apply a date range and verify both boundary dates are included. One-sided ranges should also work.
- Combine search, category, and dates; expect only sessions matching all filters.
- Try a start date after the end date; expect validation without replacing the current results.
- Open details and return; applied filter values should remain.
- Clear filters to restore all history. A search with no matches should show the filtered-empty message.

Calendar checks:

- Open Calendar and move between months, including December/January and February in a leap year.
- Verify training dates have counts and selecting a day shows its sessions in order.
- Select a date with no sessions, choose Log session, and verify the date is prefilled.
- Save, edit, or delete a session, then return to the calendar; counts and the selected day's list should refresh.
- Open details and return; the displayed month and selected date should remain.
- With no active training types, follow the library link from the log form and return to the calendar.
- Stop the backend before changing months; expect an error with retry available.

Password change checks:

- Open Account settings, enter the current password, and confirm a new one; expect a success message and cleared password fields.
- Enter mismatched new passwords; expect a validation error without a request.
- Enter an incorrect current password; expect an error while staying on the form.
- Refresh after a successful change; this browser should stay logged in. Other previously saved sessions should be invalid.
- Log out; the old password should fail and the new password should work.
- Stop the backend before submitting; expect an error with a retry available.

Account deletion checks (use a disposable account):

- Enter the current password and choose Delete my account; cancel the confirmation and verify the account remains.
- Try an incorrect password; expect an error while staying signed in.
- Confirm with the correct password; expect login with a deletion message and no private training UI.
- Refresh and try logging in with the deleted account; it should fail.
- Stop the backend before submitting; expect an error and an enabled form for retry.

Repeated registration/login attempts may trigger the backend's shared authentication rate limit.

## Commands

- `npm run dev`: development server on port 5173.
- `npm run build`: TypeScript check and production build.
- `npm run lint`: ESLint checks.
- `npm run preview`: preview the production build. Its default port differs from the allowed local frontend origin; adjust the backend origin when testing authentication there.

See [the backend API reference](../backend/API-REFERENCE.md) for request and response details.
