# HIKEYFX Supabase setup

This repository uses Supabase Auth for public account registration, email verification, login and password recovery. GitHub Pages remains the static frontend host.

## 1. Create a Supabase project
1. Create a project at https://supabase.com/dashboard.
2. Choose a strong database password and keep it private.
3. In Project Settings -> API, copy the Project URL and the publishable key (or legacy anon public key).
4. Do not copy, commit or share the service_role/secret key.

## 2. Configure the frontend
Edit `supabase-config.js` in the GitHub repository and replace:
- `YOUR_SUPABASE_PROJECT_URL` with the project URL.
- `YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY` with the publishable/anon public key.

These values are intended for a browser client. Database Row Level Security must remain enabled.

## 3. Create the user tables and access policies
Open the Supabase SQL Editor, paste all of `supabase-schema.sql`, and run it. The script creates private profiles, preferences, watchlists and a signal journal. Row Level Security policies restrict each user's records to that authenticated user.

## 4. Configure authentication URLs
In Authentication -> URL Configuration:
- Set Site URL to `https://hikemumo.github.io/hikeyfx-forex-intelligence/`.
- Add that same URL to the allowed redirect URLs.
- Keep email confirmation enabled.
- Configure the email templates and SMTP provider before public launch; default email delivery may be rate-limited.

Password recovery returns to the site. Test the full email link flow before inviting users.

## 5. Test before public launch
- Register with an email address you control.
- Confirm the verification email and sign in.
- Request password recovery and set a new password.
- Sign out and confirm the dashboard is hidden when backend configuration is active.
- Create a second test account and verify it cannot read the first account's profile, preferences, watchlist or signal journal.

## Important limitations
- Do not store Twelve Data API keys as shared account data yet. The current market-data key is browser-local. A server-side proxy is a separate required security upgrade before treating the data connection as production-ready.
- This setup does not make HIKEYFX a broker, connect to MT5, execute trades or guarantee profitable signals.
- Configure and test email delivery, database policies and recovery URLs before announcing public registration.
