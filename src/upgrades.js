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
        this.frequencyLevel = 0
        this.amplitudeLevel = 0
        this.fireRateLevel = 0
        this.strengthLevel = 0

    }

    getScaledCost(baseCost, level) {

        return Math.floor(baseCost * Math.pow(UPGRADE_GROWTH, level))

    }

    getFrequencyCost() {

        return this.getScaledCost(FREQUENCY_UPGRADE_BASE, this.frequencyLevel)

    }

    getAmplitudeCost() {

        return this.getScaledCost(AMPLITUDE_UPGRADE_BASE, this.amplitudeLevel)

    }

    getFireRateCost() {

        return this.getScaledCost(FIRERATE_UPGRADE_BASE, this.fireRateLevel)

    }

    getStrengthCost() {

        return this.getScaledCost(LASER_STRENGTH_UPGRADE_BASE, this.strengthLevel)

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

        return this.game.laserTypeStats[this.game.currentLaserType]

    }

    buyFrequency() {

        const cost = this.getFrequencyCost()

        if (this.game.points < cost) return false

        const stats = this.getActiveLaserStats()

        this.game.points -= cost
        this.frequencyLevel += 1

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
        this.amplitudeLevel += 1
        stats.amplitude += AMPLITUDE_UPGRADE_STEP

        return true

    }

    buyFireRate() {

        const cost = this.getFireRateCost()

        if (this.game.points < cost) return false

        const stats = this.getActiveLaserStats()

        this.game.points -= cost
        this.fireRateLevel += 1
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
        this.strengthLevel += 1
        stats.strength += LASER_STRENGTH_UPGRADE_STEP
        stats.strength = Math.min(stats.strength, MAX_LASER_STRENGTH)

        return true

    }

}
