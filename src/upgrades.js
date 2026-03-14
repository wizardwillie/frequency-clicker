import {
    UPGRADE_GROWTH,
    FREQUENCY_UPGRADE_BASE,
    AMPLITUDE_UPGRADE_BASE,
    FIRERATE_UPGRADE_BASE,
    LASER_STRENGTH_UPGRADE_BASE,
    PULSE_MASTERY_UPGRADE_BASE,
    SCATTER_MASTERY_UPGRADE_BASE,
    HEAVY_MASTERY_UPGRADE_BASE,
    MAX_LASER_STRENGTH,
    SCATTER_BASE_BEAM_COUNT,
    SCATTER_MASTERY_BEAM_STEP,
    HEAVY_BASE_PIERCE_COUNT,
    HEAVY_MASTERY_PIERCE_STEP,
    PULSE_SHOCKWAVE_BASE_RADIUS,
    PULSE_MASTERY_RADIUS_STEP
} from "./constants.js"
import { LASER_TYPES } from "./laserTypes.js"

export class UpgradeSystem {

    constructor(game) {

        this.game = game

    }

    getScaledCost(baseCost, level) {

        return Math.floor(baseCost * Math.pow(UPGRADE_GROWTH, level))

    }

    getFrequencyCost() {

        const levels = this.getSharedOscillatorLevels()

        return this.getScaledCost(FREQUENCY_UPGRADE_BASE, levels.frequencyLevel ?? 0)

    }

    getAmplitudeCost() {

        const levels = this.getSharedOscillatorLevels()

        return this.getScaledCost(AMPLITUDE_UPGRADE_BASE, levels.amplitudeLevel ?? 0)

    }

    getFireRateCost() {

        const levels = this.getSharedOscillatorLevels()

        return this.getScaledCost(FIRERATE_UPGRADE_BASE, levels.fireRateLevel ?? 0)

    }

    getStrengthCost() {

        const levels = this.getSharedOscillatorLevels()

        return this.getScaledCost(LASER_STRENGTH_UPGRADE_BASE, levels.strengthLevel ?? 0)

    }

    getPulseMasteryCost() {

        return this.getScaledCost(PULSE_MASTERY_UPGRADE_BASE, this.game.pulseMasteryLevel ?? 0)

    }

    getScatterMasteryCost() {

        return this.getScaledCost(SCATTER_MASTERY_UPGRADE_BASE, this.game.scatterMasteryLevel ?? 0)

    }

    getHeavyMasteryCost() {

        return this.getScaledCost(HEAVY_MASTERY_UPGRADE_BASE, this.game.heavyMasteryLevel ?? 0)

    }

    buy(type) {

        if (type === "frequency") {
            return this.buyFrequency()
        }

        if (type === "amplitude") {
            return this.buyAmplitude()
        }

        if (type === "fireRate") {
            return this.buyFireRate()
        }

        if (type === "strength") {
            return this.buyStrength()
        }

        if (type === "pulseMastery") {
            return this.buyPulseMastery()
        }

        if (type === "scatterMastery") {
            return this.buyScatterMastery()
        }

        if (type === "heavyMastery") {
            return this.buyHeavyMastery()
        }

        return false

    }

    getSharedOscillatorLevels() {

        const levels = this.game.getSharedOscillatorLevels()

        if (!Number.isFinite(levels.frequencyLevel)) levels.frequencyLevel = 0
        if (!Number.isFinite(levels.amplitudeLevel)) levels.amplitudeLevel = 0
        if (!Number.isFinite(levels.fireRateLevel)) levels.fireRateLevel = 0
        if (!Number.isFinite(levels.strengthLevel)) levels.strengthLevel = 0

        return levels

    }

    getMaxSharedStrengthLevel() {

        const minimumBaseStrength = Object.values(LASER_TYPES).reduce((lowestValue, laserType) => {
            const baseStrength = laserType.baseStrength ?? laserType.strength ?? 1
            return Math.min(lowestValue, baseStrength)
        }, Infinity)

        return Math.max(0, Math.ceil(MAX_LASER_STRENGTH - minimumBaseStrength))

    }

    buyFrequency() {

        const cost = this.getFrequencyCost()

        if (!this.game.economy.spend(cost)) return false

        const levels = this.getSharedOscillatorLevels()
        levels.frequencyLevel += 1
        this.game.recalculateLaserTypeStats()

        return true

    }

    buyAmplitude() {

        const cost = this.getAmplitudeCost()

        if (!this.game.economy.spend(cost)) return false

        const levels = this.getSharedOscillatorLevels()
        levels.amplitudeLevel += 1
        this.game.recalculateLaserTypeStats()

        return true

    }

    buyFireRate() {

        const cost = this.getFireRateCost()

        if (!this.game.economy.spend(cost)) return false

        const levels = this.getSharedOscillatorLevels()
        levels.fireRateLevel += 1
        this.game.recalculateLaserTypeStats()

        return true

    }

    buyStrength() {

        const levels = this.getSharedOscillatorLevels()
        if (levels.strengthLevel >= this.getMaxSharedStrengthLevel()) return false

        const cost = this.getStrengthCost()

        if (!this.game.economy.spend(cost)) return false

        levels.strengthLevel += 1
        this.game.recalculateLaserTypeStats()

        return true

    }

    refreshMasteryEffects() {

        this.game.scatterBeamCount =
            SCATTER_BASE_BEAM_COUNT +
            ((this.game.scatterMasteryLevel ?? 0) * SCATTER_MASTERY_BEAM_STEP)
        this.game.heavyPierceCount =
            HEAVY_BASE_PIERCE_COUNT +
            ((this.game.heavyMasteryLevel ?? 0) * HEAVY_MASTERY_PIERCE_STEP)
        this.game.pulseShockwaveRadius =
            PULSE_SHOCKWAVE_BASE_RADIUS +
            ((this.game.pulseMasteryLevel ?? 0) * PULSE_MASTERY_RADIUS_STEP)

    }

    buyPulseMastery() {

        if (!this.game.pulseUnlocked) return false

        const cost = this.getPulseMasteryCost()

        if (!this.game.economy.spend(cost)) return false

        this.game.pulseMasteryLevel += 1
        this.refreshMasteryEffects()

        return true

    }

    buyScatterMastery() {

        if (!this.game.scatterUnlocked) return false

        const cost = this.getScatterMasteryCost()

        if (!this.game.economy.spend(cost)) return false

        this.game.scatterMasteryLevel += 1
        this.refreshMasteryEffects()

        return true

    }

    buyHeavyMastery() {

        if (!this.game.heavyUnlocked) return false

        const cost = this.getHeavyMasteryCost()

        if (!this.game.economy.spend(cost)) return false

        this.game.heavyMasteryLevel += 1
        this.refreshMasteryEffects()

        return true

    }

}
