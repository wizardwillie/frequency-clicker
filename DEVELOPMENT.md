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
- `game.js`: runtime owner, loop, gameplay routing, panel rendering
- `spawn.js`: target generation and spawn pacing
- `collision.js`: laser-target interaction
- `upgrades.js`: laser upgrades
- `targetUpgrades.js`: economy upgrades
- `laser.js`: laser entity update/draw
- `target.js`: target entity update/draw
- `floatingText.js`: reward text entity
- `laserTypes.js`: laser tier definitions
- `constants.js`: all balance/config constants
- `economy.js`: explicit point reward/spend system
- `overlayController.js`: overlay/menu state and routing
- `worldSystem.js`: authored world behavior hooks and world combat identity
- `ui.js`: placeholder (currently unused)

## Coding Conventions

- Use ES modules and named exports.
- Keep balance numbers in `constants.js`.
- Keep laser tier base identities in `laserTypes.js`.
- Keep rendering in draw methods (`drawPanel`, `Laser.draw`, `Target.draw`, etc.).
- Keep systems modular; avoid growing `game.js` with algorithm-heavy logic.
- Keep grid and panel coordinate spaces explicit.
- Do not hide economy rules in property setters; use `EconomySystem.award()` and `EconomySystem.spend()`.
- Route overlay input through `OverlayController` instead of open-coded booleans in `game.js`.
- Route persistent world behavior through `WorldSystem` instead of scattering `if (world === X)` across gameplay files.

## Guidelines for Adding New Systems

## Adding a New Target Type
1. Add constants in `constants.js` (chance/value/health/radius).
2. Decide whether the target needs world-specific weighting or authored world hooks in `worldSystem.js`.
3. Extend spawn selection in `spawn.js`.
4. Add visuals/feedback in `target.js`.
5. Confirm collision behavior in `collision.js`.
6. Update docs.

## Adding or Changing a World Rule
1. Extend `WORLD_DATA` in `constants.js` with readable field summaries and signal hints.
2. Put authored mechanical behavior in `worldSystem.js`.
3. Keep spawn hooks in `spawn.js`, per-target visuals in `target.js`, and damage math hooks in `collision.js`.
4. Surface the rule in the WORLD panel so the player can read it.
5. Validate that the rule changes gameplay questions instead of just adding noise.

## Adding a New Upgrade
1. Choose owner:
   - laser combat upgrade -> `upgrades.js`
   - economy/spawn upgrade -> `targetUpgrades.js`
2. Add cost/effect constants.
3. Add buy/getCost methods in the owning system.
4. If it is a core waveform stat, decide whether it belongs in the shared oscillator layer instead of weapon-specific mastery.
5. Wire button + click behavior in `game.js`.
6. Verify scaling and affordability feedback.

## Adding or Changing a Boss Phase Mutation
1. Keep it temporary to the boss runtime.
2. Add it to the boss phase mutation registry in `game.js`.
3. Prefer effect hooks in the boss shot profile / hit-resolution helpers instead of one-off conditionals.
4. Make sure it has visible combat feedback:
   - beam flash
   - HUD status
   - floating text
5. Ensure the mutation changes how the player fights, not just the numbers underneath.

## Adding or Changing Boss Reaction Logic
1. Treat reactions as boss-fight-scoped runtime state only.
2. Prefer reacting to mutation categories such as burst, coverage, sustain, phase, or defense instead of single upgrade IDs.
3. Route style-specific responses through helper dispatch in `game.js`.
4. Make the reaction readable through cadence, hazards, shell states, mirrored shots, HUD text, or other visible combat feedback.
5. Do not use reactions to hard-counter the player continuously; the goal is tension and adaptation, not invalidation.

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
- `F8` balance overlay updates unlock, gate, prep, boss timing, and boss shot-accuracy telemetry correctly.
- Recent run summaries are appended to `localStorage["frequencyLaserClickerRunSummaries"]` on world advance and menu exit.

## Guided Balance Playtests

- Use `F8` during fresh-save runs to monitor:
  - unlock timings
  - gate-loop timings
  - prep spend
  - boss result
  - weapon usage lead
  - boss weapon accuracy lead
- After each run, inspect `localStorage["frequencyLaserClickerRunSummaries"]` to compare the last 3-5 runs without manually copying overlay values.
- Prefer per-world run summaries over a single marathon session; world advance resets run telemetry by design.
