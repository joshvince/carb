# carb (ISOCRA)

Rails app where people rank five carbs. No accounts, no test suite.

## Smoke test

Run in development on the worktree's `PORT` from `.env`: `bin/rails db:prepare`, `bin/rails tailwindcss:build`, then `bin/rails server -b 0.0.0.0 -p $PORT`. No sign-in.

1. Open `/`. It redirects to `/ask`; the page shows "The Question".
2. On `/ask`, drag the five emoji into positions 1 to 5, click "Answer the question". It lands on `/results` showing "The Results".
3. On `/results`, click the Corrigan Score / Havoc Ratio switch. The page stays up.
4. Click "About us" in the navigation. `/about` loads.
5. Click "The Question" in the navigation. `/ask` loads.

Fail on any 5xx response or browser console error.
