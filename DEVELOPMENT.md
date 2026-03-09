# Development

## Project Structure

## Root
- `index.html`: page shell + canvas
- `style.css`: page/canvas styling
- `README.md`: high-level overview and run steps
- `ARCHITECTURE.md`: module-level architecture
- `GAMEPLAY.md`: mechanics and progression
- `DEVELOPMENT.md`: this developer guide
- `AGENTS.md`: AI-agent implementation rules

## src/
- `main.js`: bootstraps game
- `game.js`: runtime owner, loop, input routing, panel rendering
- `spawn.js`: target generation and spawn pacing
- `collision.js`: laser-target interaction
- `upgrades.js`: laser upgrades
- `targetUpgrades.js`: economy upgrades
- `laser.js`: laser entity update/draw
- `target.js`: target entity update/draw
- `floatingText.js`: reward text entity
- `laserTypes.js`: laser tier definitions
- `constants.js`: all balance/config constants
- `economy.js`: placeholder (currently unused)
- `ui.js`: placeholder (currently unused)

## Coding Conventions

- Use ES modules and named exports.
- Keep balance numbers in `constants.js`.
- Keep laser tier base identities in `laserTypes.js`.
- Keep rendering in draw methods (`drawPanel`, `Laser.draw`, `Target.draw`, etc.).
- Keep systems modular; avoid growing `game.js` with algorithm-heavy logic.
- Keep grid and panel coordinate spaces explicit.

## Guidelines for Adding New Systems

## Adding a New Target Type
1. Add constants in `constants.js` (chance/value/health/radius).
2. Extend spawn selection in `spawn.js`.
3. Add visuals/feedback in `target.js`.
4. Confirm collision behavior in `collision.js`.
5. Update docs.

## Adding a New Upgrade
1. Choose owner:
   - laser combat upgrade -> `upgrades.js`
   - economy/spawn upgrade -> `targetUpgrades.js`
2. Add cost/effect constants.
3. Add buy/getCost methods in the owning system.
4. Wire button + click behavior in `game.js`.
5. Verify scaling and affordability feedback.

## Adding a New Laser Type
1. Add entry in `laserTypes.js` with base stats/colors/multipliers.
2. Ensure `game.js` unlock/switch flow includes it.
3. Ensure per-type stat container is initialized in `createLaserTypeStats()`.
4. Validate rendering identity in `laser.js`.

## Adding UI Elements to the Panel
1. Add geometry config in `Game` constructor.
2. Add draw call in `drawPanel()`.
3. Add click handling in `handlePanelClick()`.
4. Ensure header placement uses button-relative anchors.
5. Ensure scroll behavior remains correct:
   - panel clip + translate
   - click Y adjusted by `panelScroll`

## File Size / Maintainability

- Keep `game.js` focused on orchestration.
- Push math-heavy/selection-heavy logic into dedicated system files.
- Prefer new modules over large monolithic additions.

## Manual Verification Checklist

- Panel vs grid click routing still correct.
- Panel scroll wheel works only over left panel.
- Scrolled panel click hitboxes still align.
- Spawn pacing remains smooth and capped.
- Collision behaves correctly for all target types.
- Laser type switching and upgrade effects remain consistent.
