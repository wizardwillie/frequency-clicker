# AGENTS

## Project Purpose

Frequency Laser Clicker is a modular browser incremental game with:
- sine-wave laser combat
- multi-tier laser progression
- target-economy progression
- panel-driven progression UI

## Architecture Rules

- `game.js` owns runtime state and system orchestration.
- Rendering should stay in draw functions.
- Configuration values belong in `constants.js`.
- Laser-tier base definitions belong in `laserTypes.js`.
- New gameplay systems should be modular and file-scoped.

## File Responsibility Guardrails

- Keep `game.js` from becoming algorithm-heavy.
- Keep point reward/spend rules in `economy.js`.
- Keep overlay/menu state and routing in `overlayController.js`.
- Keep persistent world behavior and authored world rules in `worldSystem.js`.
- Keep collision math in `collision.js`.
- Keep spawn rules in `spawn.js`.
- Keep laser upgrade logic in `upgrades.js`.
- Keep target-economy upgrade logic in `targetUpgrades.js`.
- Keep target visuals and per-type rendering in `target.js`.
- Keep laser visuals in `laser.js`.

## State and Data Ownership

- Global runtime state: `game.js`
- Explicit point reward/spend API: `economy.js`
- Overlay visibility/routing state: `overlayController.js`
- Authored world behavior: `worldSystem.js`
- Boss fight temporary mutation/reaction runtime: `game.js`
- Dev balance telemetry and pacing overlay: `game.js`
- Recent-run playtest summary buffer: `game.js` + browser localStorage
- Entities:
  - lasers in `game.lasers`
  - targets in `game.targets`
  - floating texts in `game.floatingTexts`
- Per-laser-type mutable stats: `game.laserTypeStats`

## Rules for Adding New Systems

1. Add/extend constants first.
2. Implement behavior in a dedicated module.
3. Wire module through `game.js`.
4. Add UI controls in panel draw + panel click routes.
5. Verify panel scroll and click coordinate alignment.
6. Update docs in root and `docs/` as needed.

## Performance Rules

- Prefer early-outs before expensive math.
- Keep active-entity caps where needed.
- Avoid unnecessary per-frame allocations in hot paths.

## Documentation Rule

When gameplay/architecture changes, update:
- `README.md`
- `ARCHITECTURE.md`
- `GAMEPLAY.md`
- `DEVELOPMENT.md`
- `AGENTS.md`
- any affected files in `docs/`
