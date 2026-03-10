import {
    CLICK_UPGRADE_STEP,
    DEV_STARTING_POINTS
} from "./constants.js"
import { LASER_TYPES } from "./laserTypes.js"

const SAVE_VERSION = 1
const SAVE_KEY = "frequencyLaserClickerSave"

export class SaveSystem {

    constructor(game) {

        this.game = game
        this.saveKey = SAVE_KEY

    }

    save() {

        const saveData = {
            version: SAVE_VERSION,
            points: this.game.points,
            hasLaser: this.game.hasLaser,
            plasmaUnlocked: this.game.plasmaUnlocked,
            currentLaserType: this.game.currentLaserType,
            autoFire: {
                unlocked: this.game.autoFireUnlocked,
                enabled: this.game.autoFireEnabled
            },
            click: {
                damage: this.game.clickDamage,
                upgradeLevel: this.game.clickUpgradeLevel
            },
            upgrades: {
                frequencyLevel: this.game.upgradeSystem.frequencyLevel,
                amplitudeLevel: this.game.upgradeSystem.amplitudeLevel,
                fireRateLevel: this.game.upgradeSystem.fireRateLevel,
                strengthLevel: this.game.upgradeSystem.strengthLevel
            },
            targetUpgrades: {
                valueLevel: this.game.targetUpgradeSystem.valueLevel,
                spawnRateLevel: this.game.targetUpgradeSystem.spawnRateLevel,
                diversityLevel: this.game.targetUpgradeSystem.diversityLevel
            },
            laserTypeStats: this.cloneLaserTypeStats()
        }

        try {
            localStorage.setItem(this.saveKey, JSON.stringify(saveData))
            return true
        } catch (error) {
            console.error("Save failed:", error)
            return false
        }

    }

    load() {

        try {
            const rawSaveData = localStorage.getItem(this.saveKey)

            if (!rawSaveData) return false

            const saveData = JSON.parse(rawSaveData)

            if (!saveData || typeof saveData !== "object") return false
            if (saveData.version !== SAVE_VERSION) return false

            this.game.points = this.readNumber(saveData.points, DEV_STARTING_POINTS)

            this.game.clickUpgradeLevel = this.readNumber(saveData.click?.upgradeLevel, 0)
            this.game.clickDamage = this.readNumber(
                saveData.click?.damage,
                1 + (this.game.clickUpgradeLevel * CLICK_UPGRADE_STEP)
            )

            this.game.upgradeSystem.frequencyLevel = this.readNumber(saveData.upgrades?.frequencyLevel, 0)
            this.game.upgradeSystem.amplitudeLevel = this.readNumber(saveData.upgrades?.amplitudeLevel, 0)
            this.game.upgradeSystem.fireRateLevel = this.readNumber(saveData.upgrades?.fireRateLevel, 0)
            this.game.upgradeSystem.strengthLevel = this.readNumber(saveData.upgrades?.strengthLevel, 0)

            this.game.targetUpgradeSystem.valueLevel = this.readNumber(saveData.targetUpgrades?.valueLevel, 0)
            this.game.targetUpgradeSystem.spawnRateLevel = this.readNumber(saveData.targetUpgrades?.spawnRateLevel, 0)
            this.game.targetUpgradeSystem.diversityLevel = this.readNumber(saveData.targetUpgrades?.diversityLevel, 0)

            this.game.hasLaser = Boolean(saveData.hasLaser ?? false)
            this.game.plasmaUnlocked = Boolean(saveData.plasmaUnlocked ?? false)
            this.game.autoFireUnlocked = Boolean(saveData.autoFire?.unlocked ?? false)
            this.game.autoFireEnabled = Boolean(saveData.autoFire?.enabled ?? false)

            if (LASER_TYPES[saveData.currentLaserType]) {
                this.game.currentLaserType = saveData.currentLaserType
            }

            this.applyLaserTypeStats(saveData.laserTypeStats)
            this.game.fireInterval = 1 / this.game.laserFireRate
            this.game.lastAutoShotTime = -Infinity
            this.game.lastManualShotTime = -Infinity

            return true
        } catch (error) {
            console.error("Load failed:", error)
            return false
        }

    }

    reset() {

        try {
            localStorage.removeItem(this.saveKey)

            this.game.points = DEV_STARTING_POINTS
            this.game.clickDamage = 1
            this.game.clickUpgradeLevel = 0

            this.game.upgradeSystem.frequencyLevel = 0
            this.game.upgradeSystem.amplitudeLevel = 0
            this.game.upgradeSystem.fireRateLevel = 0
            this.game.upgradeSystem.strengthLevel = 0

            this.game.targetUpgradeSystem.valueLevel = 0
            this.game.targetUpgradeSystem.spawnRateLevel = 0
            this.game.targetUpgradeSystem.diversityLevel = 0

            this.game.hasLaser = false
            this.game.plasmaUnlocked = false
            this.game.currentLaserType = "simple"

            this.game.autoFireUnlocked = false
            this.game.autoFireEnabled = false
            this.game.lastAutoShotTime = -Infinity
            this.game.lastManualShotTime = -Infinity

            this.game.laserOvercharge = 0
            this.game.laserTypeStats = this.game.createLaserTypeStats()
            this.game.fireInterval = 1 / this.game.laserFireRate

            return true
        } catch (error) {
            console.error("Reset failed:", error)
            return false
        }

    }

    cloneLaserTypeStats() {

        const clonedStats = {}

        for (const [typeId, stats] of Object.entries(this.game.laserTypeStats)) {
            clonedStats[typeId] = {
                frequency: stats.frequency,
                amplitude: stats.amplitude,
                width: stats.width,
                fireRate: stats.fireRate,
                strength: stats.strength
            }
        }

        return clonedStats

    }

    applyLaserTypeStats(savedStats) {

        if (!savedStats || typeof savedStats !== "object") return

        for (const [typeId, baseStats] of Object.entries(this.game.laserTypeStats)) {
            const typeSave = savedStats[typeId]

            if (!typeSave || typeof typeSave !== "object") continue

            baseStats.frequency = this.readNumber(typeSave.frequency, baseStats.frequency)
            baseStats.amplitude = this.readNumber(typeSave.amplitude, baseStats.amplitude)
            baseStats.width = this.readNumber(typeSave.width, baseStats.width)
            baseStats.fireRate = this.readNumber(typeSave.fireRate, baseStats.fireRate)
            baseStats.strength = this.readNumber(typeSave.strength, baseStats.strength)
        }

    }

    readNumber(value, fallback) {

        return Number.isFinite(value) ? value : fallback

    }

}
