export const SIMPLE_LASER_COST = 10
export const AUTO_FIRE_COST = 250
export const AUTO_FIRE_SPEED_MULTIPLIER = 1.6
export const BASE_MANUAL_FIRE_COOLDOWN = 0.15
export const DEV_STARTING_POINTS = 1000000
export const GAME_STATE_TITLE = "title"
export const GAME_STATE_PLAYING = "playing"
export const GAME_STATE_BOSS = "boss"
export const WORLD_START_LEVEL = 1
export const WORLD_POINT_MULTIPLIER_BASE = 1
export const WORLD_POINT_MULTIPLIER_GROWTH = 1.5
export const WORLD_GATE_BASE_COST = 10
export const WORLD_GATE_COST_GROWTH = 2.25
export const BOSS_PREP_SHIELD_COST = 8000
export const BOSS_PREP_OVERCHARGER_COST = 10000
export const BOSS_PREP_STABILIZER_COST = 9000
export const TRANSPORT_INITIAL_CHARGE_REQUIRED = 10
export const TRANSPORT_CHARGE_PER_KILL = 1
export const TRANSPORT_BOSS_CHARGE_BONUS = 20
export const TRANSPORT_CHARGE_GROWTH = 2
export const WORLD_SPAWN_RATE_GROWTH = 1.35
export const WORLD_DATA = {
    1: {
        name: "Neon Grid",
        subtitle: "Signal Calibration Zone",
        gridColor: "#2a5fff",
        particleColor: "#00aaff",
        targets: ["basic", "highValue", "fast", "armored", "reinforced", "shielded"],
        description: "The baseline simulation where wave control first stabilizes under pressure."
    },
    2: {
        name: "Plasma Storm",
        subtitle: "Unstable Charge Fields",
        gridColor: "#a03bff",
        particleColor: "#ff66ff",
        targets: ["phase", "charger", "reflector", "splitter", "healer", "exploder"],
        description: "Erratic plasma surges distort trajectories and reward reactive play."
    },
    3: {
        name: "Cryo Circuit",
        subtitle: "Frozen Signal Lattice",
        gridColor: "#66c7ff",
        particleColor: "#9ee6ff",
        targets: ["crystal", "shielded", "armored", "elite", "healer"],
        description: "Frozen conduits harden enemy shells, forcing sustained precision fire."
    },
    4: {
        name: "Void Pulse",
        subtitle: "Dimensional Frequency Collapse",
        gridColor: "#7b4dff",
        particleColor: "#c38bff",
        targets: ["phantom", "ancient", "elite", "phase", "heavy", "boss"],
        description: "Collapsed dimensions leak elite signatures and catastrophic pulse events."
    }
}
export const WORLD_BOSS_DATA = {
    1: {
        name: "Calibration Core",
        subtitle: "Signal Stability Sentinel",
        maxHealthMultiplier: 1,
        phaseAttackCooldowns: [1.25, 0.95, 0.72],
        projectileSpeedMultiplier: 1,
        projectileRadiusMultiplier: 1,
        bossCoreColor: "#8f1d34",
        bossHaloColor: "#ff4d6d",
        bossCenterColor: "#ffd7de",
        arenaTint: "rgba(78,12,28,0.1)",
        attackStyle: "calibration"
    },
    2: {
        name: "Storm Reactor",
        subtitle: "Unstable Plasma Intelligence",
        maxHealthMultiplier: 1.5,
        phaseAttackCooldowns: [1.12, 0.86, 0.64],
        projectileSpeedMultiplier: 1.22,
        projectileRadiusMultiplier: 1.08,
        bossCoreColor: "#5a1d78",
        bossHaloColor: "#c05aff",
        bossCenterColor: "#f1ddff",
        arenaTint: "rgba(64,18,92,0.16)",
        attackStyle: "storm"
    },
    3: {
        name: "Cryo Lattice Heart",
        subtitle: "Frozen Defensive Matrix",
        maxHealthMultiplier: 2.2,
        phaseAttackCooldowns: [1.03, 0.78, 0.58],
        projectileSpeedMultiplier: 1.34,
        projectileRadiusMultiplier: 1.18,
        bossCoreColor: "#1b4f8f",
        bossHaloColor: "#5fd8ff",
        bossCenterColor: "#e3fbff",
        arenaTint: "rgba(16,54,88,0.16)",
        attackStyle: "cryo"
    },
    4: {
        name: "Void Pulse Engine",
        subtitle: "Collapsed Dimensional Entity",
        maxHealthMultiplier: 3.1,
        phaseAttackCooldowns: [0.95, 0.72, 0.52],
        projectileSpeedMultiplier: 1.5,
        projectileRadiusMultiplier: 1.28,
        bossCoreColor: "#5e1642",
        bossHaloColor: "#ff4fb5",
        bossCenterColor: "#ffe9f8",
        arenaTint: "rgba(82,12,56,0.2)",
        attackStyle: "void"
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
export const PROGRESS_MATRIX_NODES = [
    {
        id: "transportEfficiency1",
        branch: "worldResonance",
        title: "Transport Efficiency I",
        description: "+10% transport charge gain",
        cost: 1,
        prerequisite: null
    },
    {
        id: "gateCalibration1",
        branch: "worldResonance",
        title: "Gate Calibration I",
        description: "-10% world gate cost",
        cost: 1,
        prerequisite: "transportEfficiency1"
    },
    {
        id: "modifierInsight",
        branch: "worldResonance",
        title: "Modifier Insight",
        description: "Preview more world and boss information",
        cost: 2,
        prerequisite: "gateCalibration1"
    },
    {
        id: "transportEfficiency2",
        branch: "worldResonance",
        title: "Transport Efficiency II",
        description: "+15% transport charge gain",
        cost: 2,
        prerequisite: "modifierInsight"
    },
    {
        id: "gateCalibration2",
        branch: "worldResonance",
        title: "Gate Calibration II",
        description: "-15% world gate cost",
        cost: 3,
        prerequisite: "transportEfficiency2"
    },
    {
        id: "resonanceBuffer",
        branch: "worldResonance",
        title: "Resonance Buffer",
        description: "Lose less transport charge on boss failure",
        cost: 3,
        prerequisite: "gateCalibration2"
    },
    {
        id: "coreBreaker",
        branch: "bossMastery",
        title: "Core Breaker",
        description: "+10% boss weapon damage",
        cost: 1,
        prerequisite: null
    },
    {
        id: "adaptiveCoolant",
        branch: "bossMastery",
        title: "Adaptive Coolant",
        description: "Slightly faster boss weapon cooldown",
        cost: 1,
        prerequisite: "coreBreaker"
    },
    {
        id: "emergencyPlating",
        branch: "bossMastery",
        title: "Emergency Plating",
        description: "+1 max hit during boss fights",
        cost: 2,
        prerequisite: "adaptiveCoolant"
    },
    {
        id: "phaseAnalysis",
        branch: "bossMastery",
        title: "Phase Analysis",
        description: "Better boss phase upgrade consistency",
        cost: 2,
        prerequisite: "emergencyPlating"
    },
    {
        id: "prepLogistics",
        branch: "bossMastery",
        title: "Prep Logistics",
        description: "-10% boss prep item costs",
        cost: 3,
        prerequisite: "phaseAnalysis"
    },
    {
        id: "salvageProtocol",
        branch: "bossMastery",
        title: "Salvage Protocol",
        description: "Boss wins grant more core fragments",
        cost: 3,
        prerequisite: "prepLogistics"
    }
]
export const RARE_TARGET_TYPES = [
    "golden",
    "phantom",
    "ancient"
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
export const TARGET_GOLDEN_CHANCE = 0.003
export const TARGET_PHANTOM_CHANCE = 0.001
export const TARGET_ANCIENT_CHANCE = 0.0005
export const TARGET_ARMORED_VALUE_MULTIPLIER = 3
export const TARGET_HIGH_VALUE_VALUE_MULTIPLIER = 4
export const TARGET_HEAVY_VALUE_MULTIPLIER = 10
export const TARGET_SHIELDED_VALUE_MULTIPLIER = 8
export const TARGET_REFLECTOR_VALUE_MULTIPLIER = 9
export const TARGET_SPLITTER_VALUE_MULTIPLIER = 6
export const TARGET_SWARM_VALUE_MULTIPLIER = 2
export const TARGET_BOSS_VALUE_MULTIPLIER = 50
export const TARGET_FAST_VALUE_MULTIPLIER = 5
export const TARGET_GOLDEN_VALUE_MULTIPLIER = 500
export const TARGET_PHANTOM_VALUE_MULTIPLIER = 300
export const TARGET_ANCIENT_VALUE_MULTIPLIER = 1000
export const TARGET_ARMORED_HEALTH = 3
export const TARGET_HEAVY_HEALTH = 30
export const TARGET_SHIELDED_HEALTH = 12
export const TARGET_REFLECTOR_HEALTH = 16
export const TARGET_SPLITTER_HEALTH = 14
export const TARGET_SWARM_HEALTH = 1
export const TARGET_BOSS_HEALTH = 500
export const TARGET_FAST_HEALTH = 1
export const TARGET_GOLDEN_HEALTH = 2
export const TARGET_PHANTOM_HEALTH = 4
export const TARGET_ANCIENT_HEALTH = 12
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
export const TARGET_GOLDEN_RADIUS = 16
export const TARGET_PHANTOM_RADIUS = 17
export const TARGET_ANCIENT_RADIUS = 30
export const TARGET_HEAVY_SPEED_MULTIPLIER = 0.55
export const TARGET_SWARM_SPEED_MULTIPLIER = 2.4
export const TARGET_BOSS_SPEED_MULTIPLIER = 0.35
export const TARGET_FAST_SPEED_MULTIPLIER = 2
export const TARGET_GOLDEN_SPEED_MULTIPLIER = 0.5
export const TARGET_PHANTOM_SPEED_MULTIPLIER = 1
export const TARGET_ANCIENT_SPEED_MULTIPLIER = 0.4
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
