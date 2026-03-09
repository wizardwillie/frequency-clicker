# Gameplay

## Core Loop

1. Targets spawn and cross the playfield.
2. Player clicks targets for early points.
3. Player unlocks laser combat.
4. Player fires sine-wave lasers to clear targets.
5. Player upgrades combat and economy systems.
6. Player unlocks auto-fire and continues scaling.
7. Player unlocks/switches laser tiers for stronger visuals/stats.

## Laser Mechanics

## Sine Wave Laser

Laser Y is sampled by:
- `y = centerY + sin(frequency * x + phase) * amplitude`

Main parameters:
- frequency: controls oscillation density
- amplitude: controls vertical reach
- width: controls beam thickness
- fire rate: controls shot cadence

## Manual Firing

- Triggered from grid clicks.
- Uses manual cooldown:
  - base from `BASE_MANUAL_FIRE_COOLDOWN`
  - reduced by fire-rate progression relative to current laser type base stat.
- Clicking a target directly still grants points and consumes the click first.

## Auto Fire

- Purchased once from panel.
- Fires repeatedly while enabled.
- Auto interval uses:
  - `game.fireInterval * AUTO_FIRE_SPEED_MULTIPLIER`

## Laser Types

Current tiers:
- Simple Laser
  - baseline combat profile
  - cooler color palette
- Plasma Laser
  - stronger base combat profile
  - stronger glow/flash intensity
  - warmer color palette

Each tier keeps independent mutable stats in `game.laserTypeStats`.

## Target Mechanics

## Target Types

- Basic
  - one hit, baseline value
- High-value
  - one hit, higher value
- Armored
  - multiple hits, health bar, hit flash
- Reinforced
  - stronger armored variant (more health/value, larger radius, distinct visuals)

## Health and Damage

- If `health > 1`, collision reduces health and triggers hit flash.
- Target is removed only when health reaches 0.

## Hit Detection

Per laser/target pair:
1. Grid-local X bound check
2. Vertical reach early-out
3. Sine sample at target-aligned X step
4. Distance check using `hitThreshold`

## Economy

## Points

Primary currency used for unlocks and upgrades.

Earned by:
- clicking targets
- laser kills

## Laser Upgrade Economy

`UpgradeSystem` upgrades:
- Frequency
- Amplitude
- Fire Rate

Cost model:
- `floor(baseCost * UPGRADE_GROWTH^level)`

## Target Economy

`TargetUpgradeSystem` upgrades:
- Target Value
  - increases target reward multiplier
- Spawn Rate
  - increases spawn frequency multiplier
- Target Diversity
  - unlocks reinforced target spawns

## Scaling and Limits

- Spawn uses interval catch-up for smooth pacing.
- `MAX_ACTIVE_TARGETS` caps concurrent targets for stability.

## Automation and Fire-Rate Coupling

- Fire-rate upgrades are panel-gated until auto-fire unlock.
- Fire-rate progression affects both:
  - manual cadence
  - automated cadence

## Feedback and Clarity

- Floating reward text is colored by target category.
- Armored/reinforced targets flash on non-lethal hit.
- Lasers include glow + muzzle flash for shot readability.
- Scrollable panel keeps large upgrade stacks usable.
