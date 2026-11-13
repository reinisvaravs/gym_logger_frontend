# Gym Logger Frontend

React, TypeScript, Vite, Tailwind, and React Router frontend for Gym Logger.

## Local setup

```sh
npm install
npm run dev
```

Open `http://localhost:5173`. Start the backend separately on port 4000 and set its `FRONTEND_URL` to `http://localhost:5173`.

The development API URL defaults to `http://localhost:4000`. To change it, copy `.env.example` to `.env` and set `VITE_API_URL` without a trailing slash. Restart Vite after changing environment values. Vite variables are public; do not put secrets in them.

Production builds use `/api` on the same origin and are served by Express. The repositories stay separate: Render deploys from [gym_logger_backend](https://github.com/reinisvaravs/gym_logger_backend), whose build script clones this public repository’s `main` branch and builds it. See [the deployment guide](https://github.com/reinisvaravs/gym_logger_backend/blob/main/DEPLOYMENT.md). After pushing frontend-only changes, manually redeploy the backend Render service to publish the new frontend. No separate frontend service or production environment variables are needed. `npm run preview` only previews static files; use the combined server for production API checks.

## Current features

- Registration with name, email, and password.
- Login with email and password, with switching between both forms.
- Account settings with current-password verification and new-password confirmation.
- Account deletion with password verification, permanent-deletion confirmation, and return to login.
- Light/dark mode across the app, saved in the browser with a system-preference default.
- Saved metric/imperial preference for weights, distances, and elevation in forms and session details.
- Loading state and API/network error messages.
- Cookie-based authentication and session restoration through `GET /me`.
- Training history with exercise names, dates, categories, and notes.
- Progress page with date filters, training-day/strength/cardio totals, weekly activity, strength records and reps-at-weight charts, and separate cardio activity summaries/history.
- History search, strength/cardio filtering, and inclusive date-range filters.
- Monthly calendar with session counts, selected-day sessions, and logging on a chosen date.
- Session details with ordered strength/cardio sets, measurement units, and calculated cardio average speed.
- Editing session dates and notes from the detail screen.
- Deleting sessions and their sets with confirmation, returning to refreshed history.
- Editing saved set measurements with prefilled category-specific inputs.
- Adding and removing sets from saved sessions, with removal confirmation and last-set protection.
- Training library with creating, renaming, archiving, restoring, and deleting unused types.
- Session logging with an active type, date, notes, and multiple strength/cardio sets.
- Loading, empty, and error states with retry.
- Logout and return to login when history requests report an expired session.

Create an account from the login screen. Registration returns to login with the email prefilled; it does not log in automatically. The browser manages the HTTP-only session cookie; no token is stored in localStorage.

## Navigation

The persistent navigation has five sections: History, Calendar, Progress, Library, and Settings. Desktop uses a sidebar; smaller screens use a compact navigation bar. Only the current section is highlighted. Log session is a separate action in the page header. Logout is available across signed-in pages.

The interface shares button, field, panel, status-message, and typography styles across pages. History uses compact session rows; session details group measurements into cards. Theme and measurement preferences live in Settings.

| Page | URL |
| --- | --- |
| Login / registration | `/login`, `/register` |
| History | `/history` |
| Calendar | `/calendar` |
| Progress | `/progress` |
| Training library | `/training-types` |
| Account settings | `/settings` |
| Log session | `/history/sessions/new` or `/calendar/sessions/new` |
| Session details | `/history/sessions/:sessionId`, `/calendar/sessions/:sessionId`, or `/progress/sessions/:sessionId` |

Session pages show breadcrumbs to their parent section. History filters live in the query string; calendar URLs store `month=YYYY-MM` and `date=YYYY-MM-DD`. Browser Back/Forward, refresh, and copied URLs preserve that context. Login is required for private pages. Unsaved form drafts are not persisted when navigating away.

Vite handles page refreshes during development. When deploying, configure frontend hosting to serve `index.html` for client-side routes; the backend API remains a separate service.

## Measurement units

Choose Metric or Imperial under Settings → Preferences. Metric is the default; the choice is stored as `gym-units` in localStorage for this browser, not per account.

Imperial uses pounds, miles, and feet. Reps, seconds, bpm, watts, and cadence remain unchanged. The frontend converts measurements for display and converts input back to kg/km/metres before sending it to the API. Stored values and API field names remain metric.

Cardio average speed is calculated from distance and duration, shown in km/h or mph to two decimal places. It is not stored as another measurement.

Converted inputs/display values use up to three decimal places. Saving an unchanged measurement in the set editor preserves the exact original metric value. Open forms retain the unit system selected when they were opened; cancel/back and reopen to use a newly selected preference. This prevents existing draft numbers from being reinterpreted.

Cardio forms accept duration in minutes, including decimals (for example, `1.5` minutes). The frontend converts to whole seconds for the API, rounding to the nearest second. Existing durations are converted back to minutes in the set editor.

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

Theme checks:

- Change Theme under Settings → Preferences, then check other pages and the logged-out screen.
- Refresh and revisit the app; the selected theme should persist through login and logout.
- Check inputs, dropdowns, calendar days, selected states, error messages, and account deletion in both themes.
- Remove `gym-theme` from localStorage and refresh; the initial theme should match the system setting.

Unit preference checks:

- Change units in Settings → Preferences, then open session details: 20 kg should show about 44.092 lb; distances and elevation should switch to mi/ft.
- Refresh; the preference should persist. Login/logout should not change it.
- Log/add/edit weighted and cardio sets in Imperial, then switch to Metric to check the saved conversions.
- Save an unchanged converted set; the metric values should not drift.
- Clear an optional added weight/elevation field; it should stay absent after saving.
- Reopen measurement forms after changing the preference in Settings; labels and inputs should use the new units.

Navigation checks:

- Visit each tab; exactly one should be active, including on session detail/logging pages.
- Apply history filters, open a session, use the breadcrumb and browser Back/Forward, and refresh; verify filters remain.
- Choose a calendar month/day, open a session or log one, and return; verify the date context remains.
- Open a copied detail URL while signed in and refresh; the same session should load.
- Logout from Calendar, Library, or Settings; private pages should redirect to login.

Repeated registration/login attempts may trigger the backend's shared authentication rate limit.

## Commands

- `npm run dev`: development server on port 5173.
- `npm run build`: TypeScript check and production build.
- `npm run lint`: ESLint checks.
- `npm run preview`: preview the production build. Its default port differs from the allowed local frontend origin; adjust the backend origin when testing authentication there.

See [the backend API reference](../backend/API-REFERENCE.md) for request and response details.

## Progress checks

- Open Progress: training days count a calendar date once even with multiple exercises. Strength sets and cardio duration/distance match the selected period.
- Switch between the last 30/90 days, this year, all history, and custom dates. Boundary dates are inclusive. An empty period should show an empty state; reversed dates should show validation.
- Weekly charts show up to the latest 12 weeks in the selected period, with Monday starts and zero weeks. First/last weeks can be partial. Overall totals cover the full selected period.
- Select a strength exercise and weight. Compare daily best reps and records to the actual logged sets, including fractional reps and tied records.
- Pull-ups show bodyweight reps without inferring body weight; zero/empty added weight are grouped together. Dumbbell loads remain per dumbbell.
- Switch weekly sets/reps/recorded volume; volume is available only for weighted exercises and is not a strength score.
- Select indoor/outdoor cardio separately. Missing distance/heart rate should show a dash, never a fabricated zero. Coverage states how many sets have measurements.
- Check the average-speed progress chart for the selected cardio activity: one point per session, km/h or mph according to Settings, gaps for missing speed, and links to session details.
- Average speed uses eligible total distance / duration; heart rate is duration-weighted over available readings. Compare a long and a short ride to check weighting.
- Select a record/chart point/history date; open session details and use the Progress breadcrumb. Selection and dates should remain. Editing/deleting a session should update statistics on return.
- Change units in Settings; weights, distance, speed, and recorded volume should convert. Check both themes and mobile widths.
- Log out and open `/progress`; it must redirect to login. Stop the backend and verify the error/retry state.

Progress uses one authenticated `/statistics` response, with charts drawn using SVG and existing app styles. No chart dependency or stored statistics table is added. Only logged exercises appear in selectors; archived exercises with history remain included.

Chart tooltips show dates, values, units, and relevant set/activity details on hover, keyboard focus, or touch. Line charts retain straight dot-to-dot recorded values and overlay a curved trailing average of up to eight recorded entries in the selected series/period. The trend uses no future values, missing measurements remain gaps, and tooltip values distinguish the recorded value from the smoothed average. Weekly consistency tooltips show both strength and cardio days.

Line-chart vertical axes fit the non-missing recorded values with padding, making small differences visible. Zero remains in range when it is actually recorded (including zero-activity weeks); missing values do not pull the axis down to zero. Constant/single-point series retain a nonzero axis range.
