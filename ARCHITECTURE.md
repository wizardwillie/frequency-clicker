# Architecture

## Overview
Frequency Laser Clicker is a modular HTML/CSS/JavaScript canvas game. `game.js` owns runtime state and coordinates system modules in `/src`.

## Game Loop
`main.js` creates the canvas and `Game` instance, then calls `game.start()`.

### Update Cycle (`game.js`)
Per frame, `Game.update(delta)` runs:
1. `spawnSystem.update(delta)`
2. `updateAutoFire()`
3. Update active lasers and cull inactive ones
4. Update targets
5. `collisionSystem.check()`
6. Update floating texts and cull expired ones

### Render Cycle (`game.js`)
Per frame, `Game.render()` runs:
1. Clear canvas
2. Draw panel (left)
3. Draw grid (right playfield)
4. Draw targets
5. Draw lasers
6. Draw floating texts

## Core Systems

### Game (`game.js`)
Responsibilities:
- Own global state (`points`, entities, unlocks, active laser type)
- Route panel vs grid input
- Maintain panel scrolling state and clipping
- Own per-laser-type mutable stat containers (`laserTypeStats`)
- Instantiate and coordinate all systems

### SpawnSystem (`spawn.js`)
Responsibilities:
- Maintain spawn timer
- Apply spawn rate multipliers from `TargetUpgradeSystem`
- Enforce `MAX_ACTIVE_TARGETS`
- Spawn weighted target types (basic/high-value/armored/reinforced)
- Apply value multipliers and diversity unlock rules
- Bias Y spawn distribution toward center wave band

### CollisionSystem (`collision.js`)
Responsibilities:
- Laser-vs-target checks in grid-local X space
- Early-out by wave vertical reach
- Health reduction for multi-hit targets
- Reward awarding and colored floating text on kill

### UpgradeSystem (`upgrades.js`)
Responsibilities:
- Track laser upgrade levels
- Exponential laser upgrade costs
- Apply upgrades to active laser-type stat object
- Clamp max laser width

### TargetUpgradeSystem (`targetUpgrades.js`)
Responsibilities:
- Track economy upgrade levels
- Exponential economy upgrade costs
- Provide value and spawn rate multipliers
- Unlock reinforced target tier via diversity level

## Entity Systems

### Laser (`laser.js`)
Entity fields include:
- Position progress (`x`), speed
- Wave parameters (`frequency`, `amplitude`, `width`)
- Visual settings (`color`, glow/flash multipliers)
- Active state and muzzle flash timer

Draw behavior:
- Wave polyline through the playfield
- Glow stroke + core stroke
- Muzzle flash at playfield origin

### Target (`target.js`)
Entity fields include:
- Position, speed, direction
- Type (`basic`, `highValue`, `armored`, `reinforced`)
- Value, health/maxHealth, radius
- Hit flash timing

Draw behavior varies by type and includes health bars for armored/reinforced.

### FloatingText (`floatingText.js`)
Simple UI entity for transient reward labels with upward drift + fade-out.

## Configuration

### constants.js
Single source of gameplay/balance values:
- Costs and growth factors
- Base laser stats
- Target spawn/value/health probabilities
- Upgrade step values
- Caps and dev toggles (e.g., `MAX_ACTIVE_TARGETS`, `DEV_STARTING_POINTS`)

### laserTypes.js
Defines laser tiers and base identity:
- Base stat set for each tier
- Color palettes
- Glow/flash intensity multipliers

## Module Interaction
High-level data flow:
1. `Game` holds shared runtime state.
2. Systems read/write through `game` reference.
3. `SpawnSystem` creates `Target` entities using constants + target upgrade multipliers.
4. `Game` creates `Laser` entities using active laser-type stats.
5. `CollisionSystem` consumes active lasers/targets and updates points + floating text.
6. Panel actions call `UpgradeSystem` / `TargetUpgradeSystem` to mutate progression values.
