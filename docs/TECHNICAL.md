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
