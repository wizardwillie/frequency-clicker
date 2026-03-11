export const SIMPLE_LASER_COST = 10
export const AUTO_FIRE_COST = 250
export const AUTO_FIRE_SPEED_MULTIPLIER = 1.6
export const BASE_MANUAL_FIRE_COOLDOWN = 0.15
export const DEV_STARTING_POINTS = 1000000
export const GAME_STATE_TITLE = "title"
export const GAME_STATE_PLAYING = "playing"
export const WORLD_START_LEVEL = 1
export const WORLD_POINT_MULTIPLIER_BASE = 1
export const WORLD_POINT_MULTIPLIER_GROWTH = 1.5
export const TRANSPORT_INITIAL_CHARGE_REQUIRED = 200
export const TRANSPORT_CHARGE_PER_KILL = 1
export const TRANSPORT_BOSS_CHARGE_BONUS = 20
export const TRANSPORT_CHARGE_GROWTH = 2
export const WORLD_SPAWN_RATE_GROWTH = 1.35
export const WORLD_DATA = {
    1: {
        name: "Neon Grid",
        gridColor: "#2a5fff",
        particleColor: "#00aaff",
        targets: ["basic", "armored", "shielded", "heavy"]
    },
    2: {
        name: "Plasma Storm",
        gridColor: "#a03bff",
        particleColor: "#ff66ff",
        targets: ["phase", "charger", "reflector", "splitter"]
    }
}
export const WORLD_UPGRADE_TREES = {
    1: ["frequency", "amplitude", "fireRate", "strength"],
    2: ["frequency", "amplitude", "fireRate", "strength"],
    3: ["frequency", "amplitude", "fireRate", "strength"]
}
export const WORLD_MODIFIERS = [
    "doubleTargets",
    "laserChain",
    "fastOvercharge",
    "magneticTargets",
    "splitOnDeath"
]

export const LASER_BASE_FREQUENCY = 0.005
export const LASER_BASE_AMPLITUDE = 50
export const LASER_BASE_WIDTH = 3
export const LASER_BASE_STRENGTH = 1
export const MAX_LASER_WIDTH = 12
export const LASER_BASE_FIRE_RATE = 4
export const PLASMA_UNLOCK_POINTS = 1000
export const PLASMA_FREQUENCY_MULTIPLIER = 1.4
export const PLASMA_AMPLITUDE_MULTIPLIER = 1.25
export const PLASMA_WIDTH_MULTIPLIER = 1.6
export const PLASMA_FIRE_RATE_MULTIPLIER = 1.1

export const TARGET_BASE_SPAWN_RATE = 1
export const TARGET_VALUE_BASE = 1
export const TARGET_VALUE_GROWTH = 1.15
export const TARGET_ARMORED_CHANCE = 0.06
export const TARGET_HIGH_VALUE_CHANCE = 0.10
export const TARGET_HEAVY_CHANCE = 0.03
export const TARGET_SHIELDED_CHANCE = 0.04
export const TARGET_REFLECTOR_CHANCE = 0.03
export const TARGET_SPLITTER_CHANCE = 0.05
export const TARGET_SWARM_CHANCE = 0.08
export const TARGET_BOSS_CHANCE = 0.005
export const TARGET_FAST_CHANCE = 0.06
export const TARGET_ARMORED_VALUE_MULTIPLIER = 3
export const TARGET_HIGH_VALUE_VALUE_MULTIPLIER = 4
export const TARGET_HEAVY_VALUE_MULTIPLIER = 10
export const TARGET_SHIELDED_VALUE_MULTIPLIER = 8
export const TARGET_REFLECTOR_VALUE_MULTIPLIER = 9
export const TARGET_SPLITTER_VALUE_MULTIPLIER = 6
export const TARGET_SWARM_VALUE_MULTIPLIER = 2
export const TARGET_BOSS_VALUE_MULTIPLIER = 50
export const TARGET_FAST_VALUE_MULTIPLIER = 5
export const TARGET_ARMORED_HEALTH = 3
export const TARGET_HEAVY_HEALTH = 30
export const TARGET_SHIELDED_HEALTH = 12
export const TARGET_REFLECTOR_HEALTH = 16
export const TARGET_SPLITTER_HEALTH = 14
export const TARGET_SWARM_HEALTH = 1
export const TARGET_BOSS_HEALTH = 500
export const TARGET_FAST_HEALTH = 1
export const TARGET_REINFORCED_UNLOCK_LEVEL = 1
export const TARGET_FAST_UNLOCK_LEVEL = 2
export const TARGET_SHIELDED_UNLOCK_LEVEL = 3
export const TARGET_HEAVY_UNLOCK_LEVEL = 4
export const TARGET_SPLITTER_UNLOCK_LEVEL = 5
export const TARGET_SWARM_UNLOCK_LEVEL = 5
export const TARGET_REFLECTOR_UNLOCK_LEVEL = 6
export const TARGET_BOSS_UNLOCK_LEVEL = 6
export const TARGET_REINFORCED_CHANCE = 0.04
export const TARGET_REINFORCED_VALUE_MULTIPLIER = 7
export const TARGET_REINFORCED_HEALTH = 16
export const TARGET_REINFORCED_RADIUS = 22
export const TARGET_HEAVY_RADIUS = 26
export const TARGET_REFLECTOR_RADIUS = 18
export const TARGET_SPLITTER_RADIUS = 20
export const TARGET_SWARM_RADIUS = 6
export const TARGET_BOSS_RADIUS = 48
export const TARGET_FAST_RADIUS = 10
export const TARGET_HEAVY_SPEED_MULTIPLIER = 0.55
export const TARGET_SWARM_SPEED_MULTIPLIER = 2.4
export const TARGET_BOSS_SPEED_MULTIPLIER = 0.35
export const TARGET_FAST_SPEED_MULTIPLIER = 2
export const TARGET_SWARM_GROUP_SIZE = 6
export const TARGET_VALUE_HEALTH_SCALE_STEP = 0.05
export const TARGET_SPAWN_RATE_HEALTH_SCALE_STEP = 0.08
export const MAX_ACTIVE_TARGETS = 250
export const MAX_REFLECTED_LASERS_PER_FRAME = 12

export const UPGRADE_GROWTH = 1.35

export const FREQUENCY_UPGRADE_BASE = 10
export const AMPLITUDE_UPGRADE_BASE = 15
export const FIRERATE_UPGRADE_BASE = 20
export const LASER_STRENGTH_UPGRADE_BASE = 40
export const TARGET_VALUE_UPGRADE_BASE = 35
export const TARGET_SPAWN_RATE_UPGRADE_BASE = 45
export const TARGET_DIVERSITY_UPGRADE_BASE = 60
export const CLICK_UPGRADE_BASE = 25
export const PULSE_MASTERY_UPGRADE_BASE = 120
export const SCATTER_MASTERY_UPGRADE_BASE = 140
export const HEAVY_MASTERY_UPGRADE_BASE = 160

export const FREQUENCY_UPGRADE_STEP = 0.0006
export const FREQUENCY_UPGRADE_AMPLITUDE_BONUS = 2
export const FREQUENCY_UPGRADE_WIDTH_BONUS = 0.15
export const AMPLITUDE_UPGRADE_STEP = 8
export const FIRERATE_UPGRADE_STEP = 0.5
export const LASER_STRENGTH_UPGRADE_STEP = 1
export const CLICK_UPGRADE_STEP = 2
export const SCATTER_BASE_BEAM_COUNT = 3
export const SCATTER_MASTERY_BEAM_STEP = 2
export const HEAVY_BASE_PIERCE_COUNT = 3
export const HEAVY_MASTERY_PIERCE_STEP = 1
export const PULSE_SHOCKWAVE_BASE_RADIUS = 80
export const PULSE_MASTERY_RADIUS_STEP = 10
export const MAX_LASER_STRENGTH = 10
export const TARGET_VALUE_UPGRADE_STEP = 0.10
export const TARGET_SPAWN_RATE_UPGRADE_STEP = 0.15
