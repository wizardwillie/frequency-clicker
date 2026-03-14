# Development Guide (Current)

For active development rules, use:
- `DEVELOPMENT.md` (root)
- `AGENTS.md` (root)

## Current Guidance Snapshot

- Keep systems modular by responsibility.
- Keep constants centralized in `src/constants.js`.
- Keep rendering in draw methods.
- Avoid expanding `src/game.js` with system-specific algorithms.
- Update docs whenever behavior changes.

## Current Support Modules

- `src/economy.js` owns explicit point reward/spend rules.
- `src/overlayController.js` owns overlay/menu state and routing.
- `src/worldSystem.js` owns authored world behavior and world combat hooks.
- `src/game.js` still owns boss-fight temporary mutation and reaction runtime.
- `src/ui.js` remains unused.
