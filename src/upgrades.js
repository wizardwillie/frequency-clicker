import {
    UPGRADE_GROWTH,
    FREQUENCY_UPGRADE_BASE,
    AMPLITUDE_UPGRADE_BASE,
    FIRERATE_UPGRADE_BASE,
    FREQUENCY_UPGRADE_STEP,
    FREQUENCY_UPGRADE_AMPLITUDE_BONUS,
    FREQUENCY_UPGRADE_WIDTH_BONUS,
    MAX_LASER_WIDTH,
    AMPLITUDE_UPGRADE_STEP,
    FIRERATE_UPGRADE_STEP
} from "./constants.js"

export class UpgradeSystem {

    constructor(game) {

        this.game = game
        this.frequencyLevel = 0
        this.amplitudeLevel = 0
        this.fireRateLevel = 0

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

        return false

    }

    buyFrequency() {

        const cost = this.getFrequencyCost()

        if (this.game.points < cost) return false

        this.game.points -= cost
        this.frequencyLevel += 1

        this.game.laserFrequency += FREQUENCY_UPGRADE_STEP
        this.game.laserAmplitude += FREQUENCY_UPGRADE_AMPLITUDE_BONUS
        this.game.laserWidth += FREQUENCY_UPGRADE_WIDTH_BONUS
        this.game.laserWidth = Math.min(this.game.laserWidth, MAX_LASER_WIDTH)

        return true

    }

    buyAmplitude() {

        const cost = this.getAmplitudeCost()

        if (this.game.points < cost) return false

        this.game.points -= cost
        this.amplitudeLevel += 1
        this.game.laserAmplitude += AMPLITUDE_UPGRADE_STEP

        return true

    }

    buyFireRate() {

        const cost = this.getFireRateCost()

        if (this.game.points < cost) return false

        this.game.points -= cost
        this.fireRateLevel += 1
        this.game.laserFireRate += FIRERATE_UPGRADE_STEP
        this.game.fireInterval = 1 / this.game.laserFireRate

        return true

    }

}
