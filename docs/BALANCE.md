# Balance Reference (Current)

All authoritative values are in `src/constants.js`.

## Key Current Values

- `SIMPLE_LASER_COST = 10`
- `PLASMA_UNLOCK_POINTS = 500`
- `PULSE_UNLOCK_POINTS = 1000`
- `SCATTER_UNLOCK_POINTS = 2500`
- `HEAVY_UNLOCK_POINTS = 5000`
- `AUTO_FIRE_COST = 250`
- `AUTO_FIRE_SPEED_MULTIPLIER = 1.6`
- `BASE_MANUAL_FIRE_COOLDOWN = 0.15`
- `WORLD_GATE_BASE_COST = 3200`
- `WORLD_GATE_COST_GROWTH = 2.15`
- `BOSS_PREP_SHIELD_COST = 1600`
- `BOSS_PREP_OVERCHARGER_COST = 2200`
- `BOSS_PREP_STABILIZER_COST = 1800`
- `TRANSPORT_INITIAL_CHARGE_REQUIRED = 28`
- `TRANSPORT_CHARGE_GROWTH = 1.9`
- `STARTING_POINTS = 0`

Laser bases:
- `LASER_BASE_FREQUENCY = 0.005`
- `LASER_BASE_AMPLITUDE = 50`
- `LASER_BASE_WIDTH = 3`
- `LASER_BASE_FIRE_RATE = 4`
- `Pulse Laser baseAmplitude = 34`
- `Pulse Laser baseFireRate = 1.25`

Target economy:
- `TARGET_BASE_SPAWN_RATE = 1`
- `TARGET_VALUE_BASE = 1`
- `MAX_ACTIVE_TARGETS = 250`

Upgrade growth:
- `UPGRADE_GROWTH = 1.35`

## Notes

- Costs generally scale with `floor(baseCost * growth^level)`.
- Spawn and reward outputs are further modified by target economy upgrades.
- The `Shift + B` balance overlay now groups run, weapon-flow, gate-loop, boss, meta, and recent-run metrics.
- Recent playtest summaries are stored in `localStorage["frequencyLaserClickerRunSummaries"]`.
- Run summaries now include weapon usage, boss shot accuracy by weapon type, and boss fail reasons such as `timeout`, `projectile`, or `hazard`.
- Keep this file synced when constants change.
