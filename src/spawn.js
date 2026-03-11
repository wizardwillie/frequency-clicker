import { Target } from "./target.js"
import {
    TARGET_BASE_SPAWN_RATE,
    TARGET_VALUE_BASE,
    TARGET_HEAVY_CHANCE,
    TARGET_SHIELDED_CHANCE,
    TARGET_REFLECTOR_CHANCE,
    TARGET_SPLITTER_CHANCE,
    TARGET_SWARM_CHANCE,
    TARGET_BOSS_CHANCE,
    TARGET_ARMORED_CHANCE,
    TARGET_HIGH_VALUE_CHANCE,
    TARGET_FAST_CHANCE,
    TARGET_HEAVY_VALUE_MULTIPLIER,
    TARGET_SHIELDED_VALUE_MULTIPLIER,
    TARGET_REFLECTOR_VALUE_MULTIPLIER,
    TARGET_SPLITTER_VALUE_MULTIPLIER,
    TARGET_SWARM_VALUE_MULTIPLIER,
    TARGET_BOSS_VALUE_MULTIPLIER,
    TARGET_ARMORED_VALUE_MULTIPLIER,
    TARGET_HIGH_VALUE_VALUE_MULTIPLIER,
    TARGET_FAST_VALUE_MULTIPLIER,
    TARGET_HEAVY_HEALTH,
    TARGET_SHIELDED_HEALTH,
    TARGET_REFLECTOR_HEALTH,
    TARGET_SPLITTER_HEALTH,
    TARGET_SWARM_HEALTH,
    TARGET_BOSS_HEALTH,
    TARGET_FAST_HEALTH,
    TARGET_ARMORED_HEALTH,
    TARGET_REINFORCED_UNLOCK_LEVEL,
    TARGET_FAST_UNLOCK_LEVEL,
    TARGET_SHIELDED_UNLOCK_LEVEL,
    TARGET_HEAVY_UNLOCK_LEVEL,
    TARGET_SPLITTER_UNLOCK_LEVEL,
    TARGET_SWARM_UNLOCK_LEVEL,
    TARGET_REFLECTOR_UNLOCK_LEVEL,
    TARGET_BOSS_UNLOCK_LEVEL,
    TARGET_REINFORCED_CHANCE,
    TARGET_REINFORCED_VALUE_MULTIPLIER,
    TARGET_REINFORCED_HEALTH,
    TARGET_REINFORCED_RADIUS,
    TARGET_HEAVY_RADIUS,
    TARGET_REFLECTOR_RADIUS,
    TARGET_SPLITTER_RADIUS,
    TARGET_SWARM_RADIUS,
    TARGET_BOSS_RADIUS,
    TARGET_FAST_RADIUS,
    TARGET_HEAVY_SPEED_MULTIPLIER,
    TARGET_SWARM_SPEED_MULTIPLIER,
    TARGET_BOSS_SPEED_MULTIPLIER,
    TARGET_FAST_SPEED_MULTIPLIER,
    TARGET_SWARM_GROUP_SIZE,
    MAX_ACTIVE_TARGETS,
    WORLD_DATA
} from "./constants.js"

const TARGET_PHASE_CHANCE = 0.04
const TARGET_CHARGER_CHANCE = 0.05
const TARGET_PHASE_HEALTH = 18
const TARGET_CHARGER_HEALTH = 20
const TARGET_PHASE_RADIUS = 16
const TARGET_CHARGER_RADIUS = 19
const TARGET_PHASE_VALUE_MULTIPLIER = 11
const TARGET_CHARGER_VALUE_MULTIPLIER = 12
const TARGET_CHARGER_BASE_SPEED_MULTIPLIER = 0.7
const TARGET_PHASE_DURATION = 2.2
const TARGET_CHARGER_COOLDOWN = 2.8
const TARGET_CHARGER_BURST_DURATION = 0.48
const TARGET_CHARGER_BURST_MULTIPLIER = 3.1

export class SpawnSystem {

    constructor(game) {

        this.game = game

        this.spawnTimer = 0
        this.baseSpawnRate = TARGET_BASE_SPAWN_RATE

    }

    update(delta) {

        this.spawnTimer += delta
        const spawnRateMultiplier = this.game.targetUpgradeSystem
            ? this.game.targetUpgradeSystem.getSpawnRateMultiplier()
            : 1
        const spawnRate = this.baseSpawnRate * spawnRateMultiplier
        const spawnInterval = 1 / spawnRate

        while (this.spawnTimer >= spawnInterval) {

            if (this.game.targets.length >= MAX_ACTIVE_TARGETS) {
                break
            }

            const result = this.spawnTarget()
            this.spawnTimer -= spawnInterval

            if (result.spawnedBoss) {
                break
            }
        }

    }

    getSpawnY(radius) {

        const canvas = this.game.canvas
        const centerY = canvas.height / 2
        const middleBandHalfHeight = this.game.laserAmplitude * 1.4
        const middleBandMin = Math.max(radius, centerY - middleBandHalfHeight)
        const middleBandMax = Math.min(canvas.height - radius, centerY + middleBandHalfHeight)

        if (Math.random() < 0.6 && middleBandMax > middleBandMin) {
            return middleBandMin + Math.random() * (middleBandMax - middleBandMin)
        }

        return radius + Math.random() * (canvas.height - radius * 2)

    }

    getSpawnX(direction, radius) {

        return direction === 1
            ? this.game.gridX + radius
            : this.game.canvas.width - radius

    }

    spawnSwarmGroup(direction, baseSpeed, value, maxHealth, radius) {

        const minX = this.game.gridX + radius
        const maxX = this.game.canvas.width - radius
        const minY = radius
        const maxY = this.game.canvas.height - radius
        const anchorX = this.getSpawnX(direction, radius)
        const anchorY = this.getSpawnY(radius)

        for (let i = 0; i < TARGET_SWARM_GROUP_SIZE; i++) {

            if (this.game.targets.length >= MAX_ACTIVE_TARGETS) break

            const offsetX = (Math.random() - 0.5) * 24
            const offsetY = (Math.random() - 0.5) * 24
            const speed = baseSpeed * TARGET_SWARM_SPEED_MULTIPLIER * (0.85 + Math.random() * 0.3)

            const target = new Target(0, 0, direction, speed, value, {
                type: "swarm",
                maxHealth,
                radius
            })

            target.x = Math.max(minX, Math.min(maxX, anchorX + offsetX))
            target.y = Math.max(minY, Math.min(maxY, anchorY + offsetY))

            this.game.targets.push(target)

        }

    }

    spawnTarget(options = {}) {

        if (this.game.targets.length >= MAX_ACTIVE_TARGETS) {
            return { spawned: false, spawnedBoss: false }
        }

        const forceType = options.forceType || null
        const allowBoss = options.allowBoss !== false
        const direction = Math.random() < 0.5 ? 1 : -1
        const baseSpeed = 100 + Math.random() * 100
        const baseValue = TARGET_VALUE_BASE
        const worldLevel = this.game.worldLevel ?? 1
        const worldHealthMultiplier = 1 + (worldLevel * 0.4)
        const worldSpeedMultiplier = 1 + (worldLevel * 0.1)
        const worldValueMultiplier = 1 + (worldLevel * 0.3)
        const worldConfig = typeof this.game.getCurrentWorldConfig === "function"
            ? this.game.getCurrentWorldConfig()
            : WORLD_DATA[1]
        const allowedTargets = Array.isArray(worldConfig?.targets) && worldConfig.targets.length > 0
            ? worldConfig.targets
            : WORLD_DATA[1].targets
        const isTargetAllowed = (targetType) => allowedTargets.includes(targetType)
        const basicAllowed = isTargetAllowed("basic")
        const targetUpgrades = this.game.targetUpgradeSystem
        const diversityLevel = targetUpgrades ? targetUpgrades.diversityLevel : 0
        const weightedTypes = [
            {
                type: "boss",
                chance: TARGET_BOSS_CHANCE,
                unlocked: isTargetAllowed("boss") && allowBoss && diversityLevel >= TARGET_BOSS_UNLOCK_LEVEL
            },
            {
                type: "heavy",
                chance: TARGET_HEAVY_CHANCE,
                unlocked: isTargetAllowed("heavy") && diversityLevel >= TARGET_HEAVY_UNLOCK_LEVEL
            },
            {
                type: "phase",
                chance: TARGET_PHASE_CHANCE,
                unlocked: isTargetAllowed("phase")
            },
            {
                type: "charger",
                chance: TARGET_CHARGER_CHANCE,
                unlocked: isTargetAllowed("charger")
            },
            {
                type: "shielded",
                chance: TARGET_SHIELDED_CHANCE,
                unlocked: isTargetAllowed("shielded") && diversityLevel >= TARGET_SHIELDED_UNLOCK_LEVEL
            },
            {
                type: "reflector",
                chance: TARGET_REFLECTOR_CHANCE,
                unlocked: isTargetAllowed("reflector") && diversityLevel >= TARGET_REFLECTOR_UNLOCK_LEVEL
            },
            {
                type: "reinforced",
                chance: TARGET_REINFORCED_CHANCE,
                unlocked: isTargetAllowed("reinforced") && diversityLevel >= TARGET_REINFORCED_UNLOCK_LEVEL
            },
            {
                type: "splitter",
                chance: TARGET_SPLITTER_CHANCE,
                unlocked: isTargetAllowed("splitter") && diversityLevel >= TARGET_SPLITTER_UNLOCK_LEVEL
            },
            {
                type: "swarm",
                chance: TARGET_SWARM_CHANCE,
                unlocked: isTargetAllowed("swarm") && diversityLevel >= TARGET_SWARM_UNLOCK_LEVEL
            },
            {
                type: "armored",
                chance: TARGET_ARMORED_CHANCE,
                unlocked: isTargetAllowed("armored")
            },
            {
                type: "highValue",
                chance: TARGET_HIGH_VALUE_CHANCE,
                unlocked: isTargetAllowed("highValue")
            },
            {
                type: "fast",
                chance: TARGET_FAST_CHANCE,
                unlocked: isTargetAllowed("fast") && diversityLevel >= TARGET_FAST_UNLOCK_LEVEL
            }
        ]
        let type = null

        if (forceType && isTargetAllowed(forceType)) {
            type = forceType
        }

        if (!type) {
            const availableTypes = weightedTypes.filter(entry => entry.unlocked).map(entry => ({ ...entry }))

            if (basicAllowed) {
                const nonBasicTotalWeight = availableTypes.reduce((sum, entry) => sum + entry.chance, 0)
                const basicChance = Math.max(0.01, 1 - nonBasicTotalWeight)
                availableTypes.push({
                    type: "basic",
                    chance: basicChance,
                    unlocked: true
                })
            }

            const totalWeight = availableTypes.reduce((sum, entry) => sum + entry.chance, 0)

            if (totalWeight > 0) {
                let roll = Math.random() * totalWeight
                for (const entry of availableTypes) {
                    roll -= entry.chance
                    if (roll <= 0) {
                        type = entry.type
                        break
                    }
                }
            }
        }

        if (!type) {
            type = basicAllowed ? "basic" : (allowedTargets[0] || "basic")
        }

        let valueMultiplier = 1
        let maxHealth = 1
        let speed = baseSpeed
        let radius
        let hasShield = false
        let phaseDuration = TARGET_PHASE_DURATION
        let phaseTimer = 0
        let isPhased = false
        let chargeCooldown = TARGET_CHARGER_COOLDOWN
        let chargeTimer = 0
        let chargeBurstDuration = TARGET_CHARGER_BURST_DURATION
        let chargeBurstTime = 0
        let chargeSpeedMultiplier = TARGET_CHARGER_BURST_MULTIPLIER

        if (type === "boss") {
            valueMultiplier = TARGET_BOSS_VALUE_MULTIPLIER
            maxHealth = TARGET_BOSS_HEALTH
            radius = TARGET_BOSS_RADIUS
            speed = baseSpeed * TARGET_BOSS_SPEED_MULTIPLIER
        } else if (type === "heavy") {
            valueMultiplier = TARGET_HEAVY_VALUE_MULTIPLIER
            maxHealth = TARGET_HEAVY_HEALTH
            radius = TARGET_HEAVY_RADIUS
            speed = baseSpeed * TARGET_HEAVY_SPEED_MULTIPLIER
        } else if (type === "phase") {
            valueMultiplier = TARGET_PHASE_VALUE_MULTIPLIER
            maxHealth = TARGET_PHASE_HEALTH
            radius = TARGET_PHASE_RADIUS
            phaseDuration = TARGET_PHASE_DURATION * (0.9 + Math.random() * 0.2)
            phaseTimer = Math.random() * phaseDuration
            isPhased = Math.random() < 0.3
        } else if (type === "charger") {
            valueMultiplier = TARGET_CHARGER_VALUE_MULTIPLIER
            maxHealth = TARGET_CHARGER_HEALTH
            radius = TARGET_CHARGER_RADIUS
            speed = baseSpeed * TARGET_CHARGER_BASE_SPEED_MULTIPLIER
            chargeCooldown = TARGET_CHARGER_COOLDOWN * (0.85 + Math.random() * 0.3)
            chargeTimer = Math.random() * chargeCooldown
            chargeBurstDuration = TARGET_CHARGER_BURST_DURATION
            chargeBurstTime = 0
            chargeSpeedMultiplier = TARGET_CHARGER_BURST_MULTIPLIER
        } else if (type === "shielded") {
            valueMultiplier = TARGET_SHIELDED_VALUE_MULTIPLIER
            maxHealth = TARGET_SHIELDED_HEALTH
            hasShield = true
        } else if (type === "reflector") {
            valueMultiplier = TARGET_REFLECTOR_VALUE_MULTIPLIER
            maxHealth = TARGET_REFLECTOR_HEALTH
            radius = TARGET_REFLECTOR_RADIUS
        } else if (type === "reinforced") {
            valueMultiplier = TARGET_REINFORCED_VALUE_MULTIPLIER
            maxHealth = TARGET_REINFORCED_HEALTH
            radius = TARGET_REINFORCED_RADIUS
        } else if (type === "splitter") {
            valueMultiplier = TARGET_SPLITTER_VALUE_MULTIPLIER
            maxHealth = TARGET_SPLITTER_HEALTH
            radius = TARGET_SPLITTER_RADIUS
        } else if (type === "swarm") {
            valueMultiplier = TARGET_SWARM_VALUE_MULTIPLIER
            maxHealth = TARGET_SWARM_HEALTH
            radius = TARGET_SWARM_RADIUS
            speed = baseSpeed * TARGET_SWARM_SPEED_MULTIPLIER
        } else if (type === "armored") {
            valueMultiplier = TARGET_ARMORED_VALUE_MULTIPLIER
            maxHealth = TARGET_ARMORED_HEALTH
        } else if (type === "highValue") {
            valueMultiplier = TARGET_HIGH_VALUE_VALUE_MULTIPLIER
        } else if (type === "fast") {
            valueMultiplier = TARGET_FAST_VALUE_MULTIPLIER
            maxHealth = TARGET_FAST_HEALTH
            radius = TARGET_FAST_RADIUS
            speed = baseSpeed * TARGET_FAST_SPEED_MULTIPLIER
        }

        const valueMultiplierFromUpgrades = targetUpgrades
            ? targetUpgrades.getValueMultiplier()
            : 1
        const valueLevel = targetUpgrades ? targetUpgrades.valueLevel : 0
        const spawnRateLevel = targetUpgrades ? targetUpgrades.spawnRateLevel : 0
        const healthMultiplier =
            1 +
            (valueLevel * 0.15) +
            (spawnRateLevel * 0.25)
        maxHealth = Math.max(1, Math.round(maxHealth * healthMultiplier * worldHealthMultiplier))
        const value = Math.max(
            1,
            Math.round(baseValue * valueMultiplier * valueMultiplierFromUpgrades * worldValueMultiplier)
        )

        if (type === "swarm") {
            this.spawnSwarmGroup(direction, baseSpeed * worldSpeedMultiplier, value, maxHealth, radius)
            return { spawned: true, spawnedBoss: false }
        }

        speed *= worldSpeedMultiplier

        const target = new Target(0, 0, direction, speed, value, {
            type,
            maxHealth,
            radius,
            hasShield,
            phaseDuration,
            phaseTimer,
            isPhased,
            chargeCooldown,
            chargeTimer,
            chargeBurstDuration,
            chargeBurstTime,
            chargeSpeedMultiplier
        })

        target.y = this.getSpawnY(target.radius)
        target.x = this.getSpawnX(direction, target.radius)

        this.game.targets.push(target)

        return { spawned: true, spawnedBoss: type === "boss" }

    }

}
