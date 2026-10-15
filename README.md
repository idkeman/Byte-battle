# Byte Battle

A browser-based real-time strategy battler built with plain HTML, CSS, and JavaScript. No build step or dependencies.

## Play
Enable GitHub Pages in **Settings → Pages**, choosing branch `main` and folder `/(root)`, then open https://idkeman.github.io/Byte-battle/.

## Gameplay
- Start with 160 **Bytes** and automatically earn more while a match is running.
- Deploy Scouts, Tanks, and Snipers. Units have different speed, health, damage, and attack range.
- AI opponents spawn units over time. **Absolute Noobie** greatly slows the AI; Easy, Normal, and Hard increase pressure.
- Win rewards vary by difficulty. Hard matches pay less than Easy.
- Permanent Core and Byte Generator upgrades, plus an increasing starting reserve after wins, save in this browser.
- Choose **Solo vs AI**, **Team battle vs AI**, or **Local player vs player** (two players sharing one device).
- Customize your spawn lane and deploy a Scout Rush, Armored Push, or Sniper Line formation.
- Hidden DJ Zombie Cube ability: during a live match, press **Ctrl + Shift + J**. Its pulse stuns enemies and lightly damages units on the battlefield.

## Controls
1. Start battle.
2. Select a unit and deploy it, or choose a quick formation.
3. Use Bytes for core and generator upgrades.
4. In Local PvP, red player uses the red deploy button on the same device.
5. Reset Match to start over with saved upgrades.

## Files
- `index.html` — interface
- `style.css` — responsive styling
- `game.js` — simulation, AI, combat, currency, formations, and save data

## Notes
Saved progression uses this browser's local storage; it does not sync across devices. Local PvP is hot-seat multiplayer, not online matchmaking.
