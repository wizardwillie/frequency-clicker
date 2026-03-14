# Technical Reference (Current)

This file summarizes current technical behavior and points to the canonical root docs.

- Architecture detail: `ARCHITECTURE.md`
- Gameplay detail: `GAMEPLAY.md`
- Developer guidance: `DEVELOPMENT.md`

## Current Runtime Summary

- Engine: HTML5 Canvas + ES modules
- Loop: `update(delta)` + `render()` in `src/game.js`
- Core systems:
  - `SpawnSystem` (`src/spawn.js`)
  - `CollisionSystem` (`src/collision.js`)
  - `UpgradeSystem` (`src/upgrades.js`)
  - `TargetUpgradeSystem` (`src/targetUpgrades.js`)
- Entities:
  - `Laser` (`src/laser.js`)
  - `Target` (`src/target.js`)
  - `FloatingText` (`src/floatingText.js`)

## Key Implementation Notes

- Grid and panel use separate coordinate spaces.
- Panel is scrollable and clipped in `drawPanel()`.
- Clicks in panel account for `panelScroll` offset.
- Spawn uses interval catch-up and `MAX_ACTIVE_TARGETS` cap.
- Collision includes vertical reach early-out before sine sampling.
- Boss fights currently keep mutation and boss-reaction state in `src/game.js`, with style dispatch keyed off the active world boss config.
- `src/game.js` also owns lightweight dev-only balance telemetry for unlock timing, gate timing, prep spend, boss outcome, and boss shot accuracy.
- Recent run summaries are buffered in browser local storage under `frequencyLaserClickerRunSummaries` so 3-5 fresh-save playtests can be compared after the fact.
