# Frequency Laser Clicker

Frequency Laser Clicker is a browser-based incremental/clicker arcade game built with HTML, CSS, JavaScript, and Canvas.

You destroy moving targets with a sine-wave laser, buy upgrades, unlock stronger laser tiers, and scale into a high-activity loop with automation.

## Project Overview

The game is split into two regions:
- Left panel: progression UI (points, unlocks, upgrades, automation)
- Right grid: active playfield (targets, lasers, effects)

Core progression has two axes:
- Combat progression: stronger lasers and better fire cadence
- Economy progression: richer/faster/more diverse target generation

## Core Gameplay Loop

1. Targets spawn and move horizontally across the grid.
2. Player clicks targets for early points.
3. Player unlocks the first laser tier.
4. Grid clicks fire a sine-wave laser.
5. Laser collisions destroy targets and award points.
6. Player buys laser upgrades and target-economy upgrades.
7. Player unlocks auto-fire and continues scaling output.
8. Player unlocks/switches to stronger laser tiers (currently Plasma).

## How to Run

No build step is required.

### Option A (recommended)

```bash
cd /path/to/frequency-clicker
python3 -m http.server 8000
```

Open <http://localhost:8000>.

### Option B

Open `index.html` directly in a modern browser.

## Gameplay Systems

### Laser System
- Laser path uses a sine equation:
  - `y = centerY + sin(frequency * x + phase) * amplitude`
- Beam rendering includes:
  - core stroke
  - glow stroke
  - muzzle flash
- Laser visuals are clipped to the game grid (not the left panel).

### Laser Upgrades
Managed by `UpgradeSystem` (`src/upgrades.js`):
- Upgrades now advance a shared oscillator layer across the whole laser arsenal.
- Frequency upgrade
  - Increases frequency
  - Adds small amplitude and width bonuses
  - Helps newly unlocked lasers feel immediately viable
- Amplitude upgrade
  - Increases wave vertical range across all lasers
- Fire rate upgrade
  - Increases shots/second across all lasers
  - Displayed/purchasable only after auto-fire is unlocked
- Strength upgrade
  - Raises base damage across all lasers while preserving laser-specific identities

### Laser Types (Simple vs Plasma)
Defined in `src/laserTypes.js`.

Current tiers:
- Simple Laser
  - Baseline stats
  - Cool palette
  - Standard glow/flash intensity
- Plasma Laser
  - Higher base stats
  - Warm palette
  - Stronger glow/flash multipliers

Each type keeps its own derived stat container in `game.laserTypeStats`, but core oscillator progression is now shared across lasers while mastery stays weapon-specific.

### Manual Firing
- Triggered by grid click when not clicking a target.
- Uses a manual cooldown (`BASE_MANUAL_FIRE_COOLDOWN`) scaled by current laser fire-rate progression.

### Auto Fire
- Purchased from the panel (`AUTO_FIRE_COST`).
- Fires automatically with interval:
  - `fireInterval * AUTO_FIRE_SPEED_MULTIPLIER`
- Uses a separate timer from manual fire.

## Target System

Targets are spawned by `SpawnSystem` with weighted probabilities and upgrade-driven scaling.

- Basic targets
  - Single hit
  - Baseline reward
- High-value targets
  - Single hit
  - Higher reward
- Armored targets
  - Multi-hit (`health > 1`)
  - Health bar and hit flash
- Reinforced targets
  - Tougher than armored
  - Larger radius
  - Distinct color/outline/health bar theme

## Economy Systems

### Points
- Main currency (`game.points`)
- Earned by:
  - clicking targets
  - laser kills

### Target Economy Upgrades
Managed by `TargetUpgradeSystem` (`src/targetUpgrades.js`):
- Target Value upgrade
  - Increases reward multiplier for spawned targets
- Spawn Rate upgrade
  - Increases target spawn frequency multiplier
- Target Diversity upgrade
  - Unlocks reinforced target tier

### Cost Scaling
Most upgrade costs use:
- `floor(baseCost * growth^level)`

## UI System

### Left Panel UI
Handled in `src/game.js`.

Shows:
- points
- laser unlock/switch actions
- laser upgrades
- target economy upgrades
- automation controls

### Scrollable Upgrade Panel
- Panel content is clipped to panel bounds.
- Wheel scrolling applies only when cursor is inside panel.
- Click detection converts screen Y to panel-content Y using panel scroll offset.
- Grid/playfield remains fixed.

### Upgrade Categories
The panel is grouped into sections:
- LASERS
- LASER UPGRADES
- TARGET ECONOMY
- AUTOMATION

## Architecture Overview

Major modules in `src/`:
- `main.js`: bootstrap and startup
- `game.js`: game loop, runtime orchestration, panel rendering
- `spawn.js`: target timing/probability generation, spawn cap
- `collision.js`: laser-target intersection and payouts
- `upgrades.js`: laser upgrade logic
- `targetUpgrades.js`: economy upgrade logic
- `laser.js`: laser entity update/draw
- `target.js`: target entity update/draw
- `floatingText.js`: transient reward text entity
- `laserTypes.js`: laser type definitions and visual multipliers
- `constants.js`: gameplay and balance constants
- `economy.js`: explicit point spending/reward API and point bindings
- `overlayController.js`: overlay state, click routing, wheel routing, cursor routing
- `ui.js`: placeholder (unused)

For deeper docs:
- `ARCHITECTURE.md`
- `GAMEPLAY.md`
- `DEVELOPMENT.md`
- `AGENTS.md`
