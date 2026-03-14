# Gameplay

## Core Loop

1. Targets spawn and cross the playfield.
2. Player clicks targets for early points.
3. Player unlocks laser combat.
4. Player fires sine-wave lasers to clear targets.
5. Player upgrades combat and economy systems.
6. Player unlocks auto-fire and continues scaling.
7. Player unlocks/switches laser tiers for stronger visuals/stats.
8. Player fills transport charge, buys the world gate, optionally buys boss prep, and enters the boss fight.
9. Boss wins grant Core Fragments for long-term Progress Matrix upgrades.

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

Each tier keeps its own derived stat profile in `game.laserTypeStats`, but the core oscillator layer is shared across lasers. Unlocking a new weapon now inherits your waveform development instead of starting nearly from zero.

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
- Strength

These oscillator upgrades are shared across the whole laser arsenal and apply on top of each laser type’s base identity. Mastery remains weapon-specific.

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

## World Identity

Worlds are no longer only target-pool swaps. Each world now applies an authored combat rule set.

- Neon Grid
  - Stable reference world
  - Centered, readable traffic
  - Best for learning beam spacing and baseline waveform behavior
- Plasma Storm
  - Adds storm drift to normal targets
  - Emphasizes volatile enemy mixes and unstable trajectories
  - Makes amplitude and dense waveform coverage more valuable
- Cryo Circuit
  - Uses fixed lattice lanes
  - Fortified targets can spawn with cryo shells that blunt weak hits
  - Makes strength and heavy fire more valuable
- Void Pulse
  - Special targets cycle through resonance windows
  - Non-exposed targets resist damage unless the player uses dense waveforms or pulse timing well
  - Makes frequency and pulse weapon timing more valuable

These authored world rules are implemented in `src/worldSystem.js` and surfaced through the WORLD panel.

## Boss Phase Mutations

Boss fights still pause at phase thresholds, but the choices are now temporary waveform mutations instead of mostly flat stat buffs.

Current mutation behaviors include:
- Burst Capacitor
  - every 4th shot becomes a larger burst beam
- Echo Lattice
  - successful hits schedule a delayed echo beam
- Prism Splitter
  - shots gain side-band lanes and wider coverage
- Resonance Fracture
  - consecutive hits stack damage-amplifying cracks on the boss core
- Surge Feedback
  - repeated hits arm surge shots with stronger output and faster cadence
- Phase Anchor
  - near misses graze the core and expose it for follow-up fire
- Counterphase Guard
  - taking a hit arms the next shot into a counter-surge

These mutations are temporary to the current boss fight and are intended to change how the player fights immediately.

## Boss Reactions To Signal Mutations

Bosses now interpret those temporary signal mutations instead of passively eating the effects.

- Calibration Core
  - reacts in a readable way with tracking-lock responses after repeated clean pressure
- Storm Reactor
  - escalates into faster retaliation bursts when the player leans into burst or wide-coverage mutations
- Cryo Lattice Heart
  - refreshes a defensive cryo shell and reinforces lane denial when the player forces sustained openings
- Void Pulse Engine
  - distorts into mirrored or phantom pressure when the player leans on graze/phase-oriented mutations

The intent is not to invalidate the player’s choice. The intent is to make the fight feel like an adaptive duel where mutation categories matter differently against different bosses.

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
