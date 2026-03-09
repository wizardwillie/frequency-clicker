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
- Route input:
  - panel click handling
  - grid click handling
  - panel wheel scrolling
- Coordinate systems:
  - `SpawnSystem`
  - `CollisionSystem`
  - `UpgradeSystem`
  - `TargetUpgradeSystem`
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
- Awards points + colored floating text on destroy

## UpgradeSystem (`src/upgrades.js`)

Responsibilities:
- Tracks laser upgrade levels
- Computes exponential costs
- Applies effects to active laser-type stat object
- Recomputes `game.fireInterval` for fire-rate upgrades
- Clamps laser width

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
5. `CollisionSystem` resolves interactions and updates `game.points` / `game.floatingTexts`.
6. Upgrade systems mutate progression values consumed by spawn and firing systems.
7. `drawPanel()` renders progression UI in a scrollable clipped region.
