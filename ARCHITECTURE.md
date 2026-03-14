# Architecture

## Overview

Frequency Laser Clicker uses a modular, file-per-system structure around a single `Game` orchestrator.

- Runtime owner: `src/game.js`
- Rendering: Canvas draw methods in entities + panel rendering in `game.js`
- Configuration: `src/constants.js` and `src/laserTypes.js`

## Game Loop

`src/main.js` creates canvas + `Game`, then calls `game.start()`.

`Game.loop(time)` computes `delta` and executes:
- `update(delta)`
- `render()`

### `game.js` Responsibilities

- Own global state (`points`, unlock flags, arrays of entities)
- Maintain playfield geometry (`panelWidth`, `gridX`, `gridWidth`)
- Route core gameplay input:
  - panel click handling
  - grid click handling
- Coordinate systems:
  - `SpawnSystem`
  - `CollisionSystem`
  - `UpgradeSystem`
  - `TargetUpgradeSystem`
- Compose support modules:
  - `EconomySystem`
  - `OverlayController`
- Manage laser-type stat containers and active type switching

### Update Cycle

`Game.update(delta)` currently does:
1. `spawnSystem.update(delta)`
2. `updateAutoFire()`
3. Laser updates + inactive laser cull
4. Target updates
5. `collisionSystem.check()`
6. Floating text updates + expiration cull

### Render Cycle

`Game.render()` currently does:
1. Clear canvas
2. Draw left panel (`drawPanel()`)
3. Draw grid (`drawGrid()`)
4. Draw targets
5. Draw lasers
6. Draw floating texts

## Core Systems

## EconomySystem (`src/economy.js`)

Responsibilities:
- Owns `game.points` bindings
- Normalizes point values
- Applies explicit reward scaling through `award()`
- Applies explicit spending through `spend()`
- Keeps reward/spend rules out of the `points` setter

## OverlayController (`src/overlayController.js`)

Responsibilities:
- Owns overlay visibility state for archives/info/target index/progress matrix
- Centralizes overlay click routing
- Centralizes overlay wheel routing
- Centralizes overlay cursor routing
- Centralizes overlay draw dispatch

## SpawnSystem (`src/spawn.js`)

Responsibilities:
- Maintains spawn timer
- Reads spawn multiplier from `TargetUpgradeSystem`
- Uses interval-based while-loop spawning
- Enforces `MAX_ACTIVE_TARGETS`
- Spawns target types by weighted probabilities
- Applies value multiplier from target value upgrades
- Biases Y positions toward center wave band

Inputs:
- `game.targetUpgradeSystem`
- constants from `constants.js`

Outputs:
- pushes `Target` entities into `game.targets`

## CollisionSystem (`src/collision.js`)

Responsibilities:
- Iterates active lasers vs targets
- Converts target X into grid-local space
- Early-outs by vertical reach before sine math
- Applies hit threshold test against wave Y
- Handles multi-hit damage logic
- Resolves target damage/destruction
- Awards points through `EconomySystem`
- Spawns colored floating text on destroy

## UpgradeSystem (`src/upgrades.js`)

Responsibilities:
- Tracks shared oscillator upgrade levels
- Computes exponential costs
- Recomputes derived stats for every laser type from shared oscillator progress
- Recomputes `game.fireInterval` for fire-rate upgrades
- Preserves weapon-specific mastery as a separate layer

## TargetUpgradeSystem (`src/targetUpgrades.js`)

Responsibilities:
- Tracks economy upgrade levels
- Computes exponential costs
- Provides `valueMultiplier`
- Provides `spawnRateMultiplier`
- Provides diversity level for reinforced target unlock

## Entity Systems

## Laser (`src/laser.js`)

Responsibilities:
- Stores per-shot wave parameters and visual parameters
- Progresses beam across playfield over time
- Draws:
  - glow pass
  - core pass
  - muzzle flash

Per-shot visual identity is copied from active `LASER_TYPES` entry (`glowMultiplier`, `flashMultiplier`).

## Target (`src/target.js`)

Responsibilities:
- Moves horizontally each frame
- Tracks type/value/health/radius
- Tracks hit flash timer for damage feedback
- Draws type-specific style
- Draws health bars for armored/reinforced targets

## FloatingText (`src/floatingText.js`)

Responsibilities:
- Stores text + color + lifetime
- Animates upward movement and alpha fade
- Draws transient reward feedback

## Configuration

## constants.js (`src/constants.js`)

Single source for:
- costs
- growth factors
- base stats
- upgrade steps
- spawn probabilities
- health/value multipliers
- caps/dev settings

## laserTypes.js (`src/laserTypes.js`)

Defines each laser type’s:
- id and name
- base frequency/amplitude/width/fireRate
- color palette
- visual intensity multipliers (glow/flash)

## Module Interaction

High-level flow:
1. `Game` owns shared state.
2. Systems receive `game` reference in constructors.
3. `SpawnSystem` creates `Target` instances from constants + target economy multipliers.
4. `Game` creates `Laser` instances from active laser stats + laser type visuals.
5. `CollisionSystem` resolves interactions and delegates rewards to `EconomySystem`.
6. `OverlayController` routes non-gameplay overlay input and draw flow.
7. Upgrade systems mutate progression values consumed by spawn and firing systems.
8. `drawPanel()` renders progression UI in a scrollable clipped region.
