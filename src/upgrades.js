import {
    UPGRADE_GROWTH,
    FREQUENCY_UPGRADE_BASE,
    AMPLITUDE_UPGRADE_BASE,
    FIRERATE_UPGRADE_BASE,
    LASER_STRENGTH_UPGRADE_BASE,
    FREQUENCY_UPGRADE_STEP,
    FREQUENCY_UPGRADE_AMPLITUDE_BONUS,
    FREQUENCY_UPGRADE_WIDTH_BONUS,
    MAX_LASER_WIDTH,
    AMPLITUDE_UPGRADE_STEP,
    FIRERATE_UPGRADE_STEP,
    LASER_STRENGTH_UPGRADE_STEP,
    MAX_LASER_STRENGTH
} from "./constants.js"

export class UpgradeSystem {

    constructor(game) {

        this.game = game

    }

    getScaledCost(baseCost, level) {

        return Math.floor(baseCost * Math.pow(UPGRADE_GROWTH, level))

    }

    getFrequencyCost() {

        const stats = this.getActiveLaserStats()

        return this.getScaledCost(FREQUENCY_UPGRADE_BASE, stats.frequencyLevel ?? 0)

    }

    getAmplitudeCost() {

        const stats = this.getActiveLaserStats()

        return this.getScaledCost(AMPLITUDE_UPGRADE_BASE, stats.amplitudeLevel ?? 0)

    }

    getFireRateCost() {

        const stats = this.getActiveLaserStats()

        return this.getScaledCost(FIRERATE_UPGRADE_BASE, stats.fireRateLevel ?? 0)

    }

    getStrengthCost() {

        const stats = this.getActiveLaserStats()

        return this.getScaledCost(LASER_STRENGTH_UPGRADE_BASE, stats.strengthLevel ?? 0)

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

        return false

    }

    getActiveLaserStats() {

        const stats = this.game.laserTypeStats[this.game.currentLaserType]

        if (!Number.isFinite(stats.frequencyLevel)) stats.frequencyLevel = 0
        if (!Number.isFinite(stats.amplitudeLevel)) stats.amplitudeLevel = 0
        if (!Number.isFinite(stats.fireRateLevel)) stats.fireRateLevel = 0
        if (!Number.isFinite(stats.strengthLevel)) stats.strengthLevel = 0

        return stats

    }

    buyFrequency() {

        const cost = this.getFrequencyCost()

        if (this.game.points < cost) return false

        const stats = this.getActiveLaserStats()

        this.game.points -= cost
        stats.frequencyLevel += 1

        stats.frequency += FREQUENCY_UPGRADE_STEP
        stats.amplitude += FREQUENCY_UPGRADE_AMPLITUDE_BONUS
        stats.width += FREQUENCY_UPGRADE_WIDTH_BONUS
        stats.width = Math.min(stats.width, MAX_LASER_WIDTH)

        return true

    }

    buyAmplitude() {

        const cost = this.getAmplitudeCost()

        if (this.game.points < cost) return false

        const stats = this.getActiveLaserStats()

        this.game.points -= cost
        stats.amplitudeLevel += 1
        stats.amplitude += AMPLITUDE_UPGRADE_STEP

        return true

    }

    buyFireRate() {

        const cost = this.getFireRateCost()

        if (this.game.points < cost) return false

        const stats = this.getActiveLaserStats()

        this.game.points -= cost
        stats.fireRateLevel += 1
        stats.fireRate += FIRERATE_UPGRADE_STEP
        this.game.fireInterval = 1 / stats.fireRate

        return true

    }

    buyStrength() {

        const stats = this.getActiveLaserStats()

        if (stats.strength >= MAX_LASER_STRENGTH) return false

        const cost = this.getStrengthCost()

        if (this.game.points < cost) return false

        this.game.points -= cost
        stats.strengthLevel += 1
        stats.strength += LASER_STRENGTH_UPGRADE_STEP
        stats.strength = Math.min(stats.strength, MAX_LASER_STRENGTH)

        return true

    }

}
