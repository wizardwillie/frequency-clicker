import {
    UPGRADE_GROWTH,
    TARGET_VALUE_UPGRADE_BASE,
    TARGET_SPAWN_RATE_UPGRADE_BASE,
    TARGET_DIVERSITY_UPGRADE_BASE,
    TARGET_VALUE_UPGRADE_STEP,
    TARGET_SPAWN_RATE_UPGRADE_STEP
} from "./constants.js"

export class TargetUpgradeSystem {

    constructor(game) {

        this.game = game
        this.valueLevel = 0
        this.spawnRateLevel = 0
        this.diversityLevel = 0

    }

    getScaledCost(baseCost, level) {

        return Math.floor(baseCost * Math.pow(UPGRADE_GROWTH, level))

    }

    getValueCost() {

        return this.getScaledCost(TARGET_VALUE_UPGRADE_BASE, this.valueLevel)

    }

    getSpawnRateCost() {

        return this.getScaledCost(TARGET_SPAWN_RATE_UPGRADE_BASE, this.spawnRateLevel)

    }

    getDiversityCost() {

        return this.getScaledCost(TARGET_DIVERSITY_UPGRADE_BASE, this.diversityLevel)

    }

    getValueMultiplier() {

        return 1 + (this.valueLevel * TARGET_VALUE_UPGRADE_STEP)

    }

    getSpawnRateMultiplier() {

        return 1 + (this.spawnRateLevel * TARGET_SPAWN_RATE_UPGRADE_STEP)

    }

    buy(type) {

        if (type === "value") {
            return this.buyValue()
        }

        if (type === "spawnRate") {
            return this.buySpawnRate()
        }

        if (type === "diversity") {
            return this.buyDiversity()
        }

        return false

    }

    buyValue() {

        const cost = this.getValueCost()

        if (!this.game.economy.spend(cost)) return false

        this.valueLevel += 1

        return true

    }

    buySpawnRate() {

        const cost = this.getSpawnRateCost()

        if (!this.game.economy.spend(cost)) return false

        this.spawnRateLevel += 1

        return true

    }

    buyDiversity() {

        const cost = this.getDiversityCost()

        if (!this.game.economy.spend(cost)) return false

        this.diversityLevel += 1

        return true

    }

}
