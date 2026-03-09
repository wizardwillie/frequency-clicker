# Development Guide

## Project Structure

### Root
- `index.html`: page shell and canvas element
- `style.css`: global page/canvas styling
- `README.md`: project overview and run instructions
- `ARCHITECTURE.md`: module-level architecture
- `GAMEPLAY.md`: player-facing mechanics
- `DEVELOPMENT.md`: developer implementation guidance
- `AGENTS.md`: AI-agent working rules

### src/
- `main.js`: bootstraps `Game` and starts loop
- `game.js`: main coordinator; loop, state, input routing, panel rendering
- `laser.js`: laser entity behavior and rendering
- `target.js`: target entity behavior and rendering
- `spawn.js`: spawn timing, type selection, spawn cap enforcement
- `collision.js`: laser/target collision and reward payout
- `floatingText.js`: transient text entity
- `upgrades.js`: laser upgrade logic/costs/effects
- `targetUpgrades.js`: target economy upgrade logic/costs/effects
- `laserTypes.js`: laser tier definitions
- `constants.js`: shared balance/config values
- `economy.js`: placeholder (currently unused)
- `ui.js`: placeholder (currently unused)

## Coding Conventions
- Use ES modules (`import` / `export`).
- Keep gameplay constants in `constants.js` (no magic numbers in systems).
- Keep rendering in entity/system draw methods and panel methods.
- Keep systems modular; avoid placing all logic in `game.js`.
- Use descriptive names for upgrade levels, timers, and costs.

## Guidelines for Adding New Systems

### 1) Add a New Target Type
1. Add constants for probability/value/health/radius in `constants.js`.
2. Extend spawn selection logic in `spawn.js`.
3. Add visuals/feedback in `target.js`.
4. Ensure collision handling supports the target behavior in `collision.js`.
5. Update docs (`README.md`, `GAMEPLAY.md`, `ARCHITECTURE.md`).

### 2) Add a New Upgrade
1. Decide ownership:
   - Laser performance -> `upgrades.js`
   - Economy/spawn -> `targetUpgrades.js`
2. Add base costs/steps/growth constants.
3. Add buy/getCost methods in upgrade system.
4. Add panel button + click routing in `game.js`.
5. Verify progression and affordability feedback in panel rendering.

### 3) Add a New Laser Type
1. Add definition in `laserTypes.js`:
   - Base stats
   - Colors
   - Optional glow/flash multipliers
2. Ensure unlock/switch controls are added in panel flow (`game.js`).
3. Confirm upgrade behavior for the new type’s stat container.
4. Validate visual identity in `laser.js`.

### 4) Add New Panel UI Elements
1. Define button geometry in `Game` constructor.
2. Add draw call in `drawPanel()`.
3. Add click handling in `handlePanelClick()`.
4. Keep panel scroll behavior correct:
   - Drawing happens in translated panel space.
   - Click Y is adjusted by `panelScroll`.

## Keeping Files Maintainable
- `game.js` is orchestration-heavy; avoid placing algorithmic sub-systems there.
- Keep entity-specific visuals in entity files (`laser.js`, `target.js`).
- Keep formulas and balance values in constants/config files.

## Testing Checklist (Manual)
- Panel vs grid click routing works.
- Panel scroll clips correctly and click hitboxes align while scrolled.
- Target spawning continues correctly under cap conditions.
- Collision rewards/health behaviors remain correct for all target types.
- Laser tier switching updates visuals and cadence behavior as expected.
