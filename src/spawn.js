import { Target } from "./target.js"
import {
    TARGET_BASE_SPAWN_RATE,
    TARGET_VALUE_BASE,
    TARGET_ARMORED_CHANCE,
    TARGET_HIGH_VALUE_CHANCE,
    TARGET_ARMORED_VALUE_MULTIPLIER,
    TARGET_HIGH_VALUE_VALUE_MULTIPLIER,
    TARGET_ARMORED_HEALTH,
    TARGET_REINFORCED_UNLOCK_LEVEL,
    TARGET_REINFORCED_CHANCE,
    TARGET_REINFORCED_VALUE_MULTIPLIER,
    TARGET_REINFORCED_HEALTH,
    TARGET_REINFORCED_RADIUS,
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

        const speed = 100 + Math.random() * 100

        const roll = Math.random()
        const baseValue = TARGET_VALUE_BASE
        const diversityLevel = this.game.targetUpgradeSystem
            ? this.game.targetUpgradeSystem.diversityLevel
            : 0
        const reinforcedChance = diversityLevel >= TARGET_REINFORCED_UNLOCK_LEVEL
            ? TARGET_REINFORCED_CHANCE
            : 0
        const armoredThreshold = reinforcedChance + TARGET_ARMORED_CHANCE
        const highValueThreshold = armoredThreshold + TARGET_HIGH_VALUE_CHANCE
        let type = "basic"
        let valueMultiplier = 1
        let maxHealth = 1
        let radius

        if (roll < reinforcedChance) {
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
        }

        const valueMultiplierFromUpgrades = this.game.targetUpgradeSystem
            ? this.game.targetUpgradeSystem.getValueMultiplier()
            : 1
        const value = Math.max(
            1,
            Math.round(baseValue * valueMultiplier * valueMultiplierFromUpgrades)
        )

        const target = new Target(0, 0, direction, speed, value, {
            type,
            maxHealth,
            radius
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
