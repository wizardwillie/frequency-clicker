# Gameplay

## Core Loop
1. Targets enter from left/right edges.
2. Player clicks targets for points.
3. Laser unlocks and can be fired manually.
4. Laser kills produce rewards and accelerate progression.
5. Upgrades increase combat and economy output.
6. Auto-fire adds automation and steady scaling.

## Laser Mechanics

### Sine Wave Behavior
Laser vertical path follows:
`y = centerY + sin(frequency * x + phase) * amplitude`

Key variables:
- **Frequency**: wave density
- **Amplitude**: wave vertical reach
- **Width**: beam thickness
- **Fire rate**: shots per second

### Manual Firing
- Triggered by grid click (if not clicking a target first).
- Uses a manual cooldown derived from base manual cooldown and current fire-rate progression.

### Auto Fire
- Unlock/purchase in panel.
- Fires automatically with a slower interval than baseline manual cadence.
- Uses its own timer, separate from manual shots.

### Laser Tiers
- **Simple** and **Plasma** currently implemented.
- Each tier has independent mutable stats in `game.laserTypeStats`.
- Switching tier swaps which stat container upgrades apply to.

## Target Mechanics

### Types
- **Basic**: single-hit, baseline reward.
- **High-value**: single-hit, larger reward.
- **Armored**: multi-hit with health bar and hit flash.
- **Reinforced**: tougher armored variant with distinct visuals and larger radius.

### Health and Damage
- Collision checks reduce health for multi-hit targets.
- Target is removed only when health reaches 0.

### Hit Detection
- Uses grid-local X alignment with the laser wave.
- Uses `hitThreshold` distance from wave path.
- Includes vertical early-out bounds to avoid unnecessary sine math.

## Economy

### Points
- Primary currency.
- Earned by clicking targets and laser kills.

### Laser Upgrades
- Frequency, amplitude, fire rate.
- Exponential cost scaling.
- Fire-rate upgrade availability is gated behind auto-fire unlock in panel UI.

### Target Economy Upgrades
- **Target Value**: multiplies spawned target rewards.
- **Spawn Rate**: increases spawn frequency multiplier.
- **Target Diversity**: unlocks reinforced target spawn tier.

### Scaling and Caps
- Spawn timer supports multi-spawn catch-up.
- `MAX_ACTIVE_TARGETS` prevents runaway entity counts.

## Automation

### Auto Fire System
- Purchased once, then enabled.
- Uses interval scaling based on current active laser fire rate and auto-fire multiplier.

### Fire Rate Interaction
- Fire-rate progression affects both manual and automated firing cadence through shared fire-rate stat progression.

## UI/Feedback
- Floating reward text color varies by target type.
- Armored/reinforced targets flash when damaged.
- Beam glow and muzzle flash improve shot readability.
- Scrollable panel supports larger upgrade stacks.
