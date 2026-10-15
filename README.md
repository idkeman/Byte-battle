# Byte Battle

A browser-based real-time strategy battler built with plain HTML, CSS, and JavaScript.

## Play
Enable GitHub Pages in **Settings → Pages**, selecting branch `main` and folder `/(root)`, then open https://idkeman.github.io/Byte-battle/.

## Authentication
Byte Battle integrates the reusable email/password Supabase login module from [Login-n-multiplayer-systems](https://github.com/idkeman/Login-n-multiplayer-systems).

- Create an account, log in, log out, and request password-reset email.
- Username/profile update through the existing `profiles` table.
- Persistent Supabase auth sessions, account-ban handling, profile role/verification data from the shared module.
- Game progression is separated by Supabase user ID in this browser's local storage. This is not cloud-synced game saving.
- Browser code uses only the Supabase publishable key; never put a service-role key in client code.

The login module expects the same Supabase project and a compatible `profiles` table and row-level security policies used by the source repository. Account signup may require email verification depending on Supabase settings.

## Online lobby
- Host a private realtime room, share the generated invite link/code, and join by code or link.
- Lobby player list updates as players join.
- Room chat broadcasts messages to connected lobby members.
- This lobby uses the reusable `multiplayer.js` transport from the source project.
- Important: online room/chat is implemented; the current battlefield simulation itself is not synchronized between clients. Local PvP remains hot-seat gameplay on one device.

## Gameplay
- Start with 160 Bytes and earn more passively during a match.
- Deploy Scouts, Tanks, and Snipers; units differ in speed, health, damage, and range.
- Choose Absolute Noobie, Easy, Normal, or Hard AI.
- Choose Solo vs AI, Team battle vs AI, or Local player vs player.
- Select spawn lanes and deploy quick formations.
- Permanent Core and Byte Generator upgrades and the increased starting reserve after wins save locally.
- Secret DJ Zombie Cube: press **Ctrl + Shift + J** during a live match.

## Files
- `index.html` — game and account/lobby interface
- `style.css` — styling
- `game.js` — battlefield simulation and progression
- `auth.js` — reusable Supabase authentication module from the shared login project
- `multiplayer.js` — reusable Supabase Realtime room transport
- `account.js` — Byte Battle account controls, lobby controls, and room chat

## Deployment notes
All files are static and suitable for GitHub Pages. Authentication and Realtime depend on the Supabase project being configured correctly. For production, confirm the Supabase Auth redirect allowlist includes the GitHub Pages URL and review database RLS policies for the `profiles` and `public_rooms` tables.
