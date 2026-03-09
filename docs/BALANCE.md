# Balance Reference (Current)

All authoritative values are in `src/constants.js`.

## Key Current Values

- `SIMPLE_LASER_COST = 10`
- `PLASMA_UNLOCK_POINTS = 1000`
- `AUTO_FIRE_COST = 250`
- `AUTO_FIRE_SPEED_MULTIPLIER = 1.6`
- `BASE_MANUAL_FIRE_COOLDOWN = 0.15`

Laser bases:
- `LASER_BASE_FREQUENCY = 0.005`
- `LASER_BASE_AMPLITUDE = 50`
- `LASER_BASE_WIDTH = 3`
- `LASER_BASE_FIRE_RATE = 4`

Target economy:
- `TARGET_BASE_SPAWN_RATE = 1`
- `TARGET_VALUE_BASE = 1`
- `MAX_ACTIVE_TARGETS = 120`

Upgrade growth:
- `UPGRADE_GROWTH = 1.35`

## Notes

- Costs generally scale with `floor(baseCost * growth^level)`.
- Spawn and reward outputs are further modified by target economy upgrades.
- Keep this file synced when constants change.
