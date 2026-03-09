# AGENTS

## Project Purpose
Frequency Laser Clicker is a modular browser incremental game focused on wave-laser combat, progression upgrades, and scalable target economy systems.

## Architecture Rules
- `game.js` owns global runtime state and orchestrates systems.
- System logic should stay modular in dedicated files.
- Entity rendering stays in entity draw methods (`laser.js`, `target.js`, `floatingText.js`).
- Balance/config values belong in `constants.js`.
- Laser tier definitions belong in `laserTypes.js`.

## File Ownership Guidance
- **State + routing + loop**: `game.js`
- **Spawn logic**: `spawn.js`
- **Collision logic**: `collision.js`
- **Laser upgrades**: `upgrades.js`
- **Target economy upgrades**: `targetUpgrades.js`
- **Entity visuals/behavior**: `laser.js`, `target.js`, `floatingText.js`

## Keep These Files Focused
- Do not overload `game.js` with detailed algorithmic logic.
- Do not move constants into random modules.
- Do not implement target rendering logic outside `target.js`.
- Do not implement laser rendering logic outside `laser.js`.

## Rules for Adding New Systems
1. Add/extend constants first.
2. Implement behavior in a dedicated module.
3. Wire module into `game.js` orchestration.
4. Add panel input/draw wiring if needed.
5. Update documentation to match code.

## Practical Agent Checklist
Before shipping a change:
- Confirm panel and grid coordinate spaces are handled correctly.
- Confirm scrolling UI hit detection still aligns with visual positions.
- Confirm new upgrades use exponential cost scaling when appropriate.
- Confirm target and laser systems remain bounded/performance-safe.
- Confirm docs reflect the new behavior.

## Current Placeholders
- `src/economy.js` and `src/ui.js` are currently placeholders.
- Keep future implementations modular; do not collapse them into `game.js`.
