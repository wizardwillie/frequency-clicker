import { Target } from "./target.js"
import {
    TARGET_BASE_SPAWN_RATE,
    TARGET_VALUE_BASE,
    TARGET_HEAVY_CHANCE,
    TARGET_SHIELDED_CHANCE,
    TARGET_ARMORED_CHANCE,
    TARGET_HIGH_VALUE_CHANCE,
    TARGET_FAST_CHANCE,
    TARGET_HEAVY_VALUE_MULTIPLIER,
    TARGET_SHIELDED_VALUE_MULTIPLIER,
    TARGET_ARMORED_VALUE_MULTIPLIER,
    TARGET_HIGH_VALUE_VALUE_MULTIPLIER,
    TARGET_FAST_VALUE_MULTIPLIER,
    TARGET_HEAVY_HEALTH,
    TARGET_SHIELDED_HEALTH,
    TARGET_FAST_HEALTH,
    TARGET_ARMORED_HEALTH,
    TARGET_REINFORCED_UNLOCK_LEVEL,
    TARGET_REINFORCED_CHANCE,
    TARGET_REINFORCED_VALUE_MULTIPLIER,
    TARGET_REINFORCED_HEALTH,
    TARGET_REINFORCED_RADIUS,
    TARGET_HEAVY_RADIUS,
    TARGET_FAST_RADIUS,
    TARGET_HEAVY_SPEED_MULTIPLIER,
    TARGET_FAST_SPEED_MULTIPLIER,
    TARGET_VALUE_HEALTH_SCALE_STEP,
    MAX_ACTIVE_TARGETS
} from "./constants.js"

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

            this.spawnTarget()
            this.spawnTimer -= spawnInterval
        }

    }

    spawnTarget() {

        const canvas = this.game.canvas

        const direction = Math.random() < 0.5 ? 1 : -1

        const baseSpeed = 100 + Math.random() * 100

        const roll = Math.random()
        const baseValue = TARGET_VALUE_BASE
        const diversityLevel = this.game.targetUpgradeSystem
            ? this.game.targetUpgradeSystem.diversityLevel
            : 0
        const reinforcedChance = diversityLevel >= TARGET_REINFORCED_UNLOCK_LEVEL
            ? TARGET_REINFORCED_CHANCE
            : 0
        const heavyThreshold = TARGET_HEAVY_CHANCE
        const shieldedThreshold = heavyThreshold + TARGET_SHIELDED_CHANCE
        const reinforcedThreshold = shieldedThreshold + reinforcedChance
        const armoredThreshold = reinforcedThreshold + TARGET_ARMORED_CHANCE
        const highValueThreshold = armoredThreshold + TARGET_HIGH_VALUE_CHANCE
        const fastThreshold = highValueThreshold + TARGET_FAST_CHANCE
        let type = "basic"
        let valueMultiplier = 1
        let maxHealth = 1
        let speed = baseSpeed
        let radius
        let hasShield = false

        if (roll < heavyThreshold) {
            type = "heavy"
            valueMultiplier = TARGET_HEAVY_VALUE_MULTIPLIER
            maxHealth = TARGET_HEAVY_HEALTH
            radius = TARGET_HEAVY_RADIUS
            speed = baseSpeed * TARGET_HEAVY_SPEED_MULTIPLIER
        } else if (roll < shieldedThreshold) {
            type = "shielded"
            valueMultiplier = TARGET_SHIELDED_VALUE_MULTIPLIER
            maxHealth = TARGET_SHIELDED_HEALTH
            hasShield = true
        } else if (roll < reinforcedThreshold) {
            type = "reinforced"
            valueMultiplier = TARGET_REINFORCED_VALUE_MULTIPLIER
            maxHealth = TARGET_REINFORCED_HEALTH
            radius = TARGET_REINFORCED_RADIUS
        } else if (roll < armoredThreshold) {
            type = "armored"
            valueMultiplier = TARGET_ARMORED_VALUE_MULTIPLIER
            maxHealth = TARGET_ARMORED_HEALTH
        } else if (roll < highValueThreshold) {
            type = "highValue"
            valueMultiplier = TARGET_HIGH_VALUE_VALUE_MULTIPLIER
        } else if (roll < fastThreshold) {
            type = "fast"
            valueMultiplier = TARGET_FAST_VALUE_MULTIPLIER
            maxHealth = TARGET_FAST_HEALTH
            radius = TARGET_FAST_RADIUS
            speed = baseSpeed * TARGET_FAST_SPEED_MULTIPLIER
        }

        const valueMultiplierFromUpgrades = this.game.targetUpgradeSystem
            ? this.game.targetUpgradeSystem.getValueMultiplier()
            : 1
        const healthMultiplier = this.game.targetUpgradeSystem
            ? 1 + (this.game.targetUpgradeSystem.valueLevel * TARGET_VALUE_HEALTH_SCALE_STEP)
            : 1
        maxHealth = Math.max(1, Math.round(maxHealth * healthMultiplier))
        const value = Math.max(
            1,
            Math.round(baseValue * valueMultiplier * valueMultiplierFromUpgrades)
        )

        const target = new Target(0, 0, direction, speed, value, {
            type,
            maxHealth,
            radius,
            hasShield
        })

        const centerY = canvas.height / 2
        const middleBandHalfHeight = this.game.laserAmplitude * 1.4
        const middleBandMin = Math.max(target.radius, centerY - middleBandHalfHeight)
        const middleBandMax = Math.min(canvas.height - target.radius, centerY + middleBandHalfHeight)

        if (Math.random() < 0.6 && middleBandMax > middleBandMin) {
            target.y = middleBandMin + Math.random() * (middleBandMax - middleBandMin)
        } else {
            target.y = target.radius + Math.random() * (canvas.height - target.radius * 2)
        }

        target.x = direction === 1
            ? this.game.gridX + target.radius
            : canvas.width - target.radius

        this.game.targets.push(target)

    }

}
