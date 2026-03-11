import {
    CLICK_UPGRADE_STEP,
    DEV_STARTING_POINTS,
    TARGET_BASE_SPAWN_RATE,
    WORLD_START_LEVEL,
    WORLD_POINT_MULTIPLIER_BASE,
    WORLD_SPAWN_RATE_GROWTH,
    TRANSPORT_INITIAL_CHARGE_REQUIRED
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

        const activeStats = this.game.laserTypeStats[this.game.currentLaserType]

        const saveData = {
            version: SAVE_VERSION,
            points: this.game.points,
            hasLaser: this.game.hasLaser,
            plasmaUnlocked: this.game.plasmaUnlocked,
            pulseUnlocked: this.game.pulseUnlocked,
            scatterUnlocked: this.game.scatterUnlocked,
            heavyUnlocked: this.game.heavyUnlocked,
            currentLaserType: this.game.currentLaserType,
            worldLevel: this.game.worldLevel,
            worldPointMultiplier: this.game.worldPointMultiplier,
            transportCharge: this.game.transportCharge,
            transportChargeRequired: this.game.transportChargeRequired,
            autoFire: {
                unlocked: this.game.autoFireUnlocked,
                enabled: this.game.autoFireEnabled
            },
            click: {
                damage: this.game.clickDamage,
                upgradeLevel: this.game.clickUpgradeLevel
            },
            upgrades: {
                frequencyLevel: activeStats.frequencyLevel ?? 0,
                amplitudeLevel: activeStats.amplitudeLevel ?? 0,
                fireRateLevel: activeStats.fireRateLevel ?? 0,
                strengthLevel: activeStats.strengthLevel ?? 0
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

            if (typeof this.game.setPointsRaw === "function") {
                this.game.setPointsRaw(this.readNumber(saveData.points, DEV_STARTING_POINTS))
            } else {
                this.game.points = this.readNumber(saveData.points, DEV_STARTING_POINTS)
            }

            this.game.clickUpgradeLevel = this.readNumber(saveData.click?.upgradeLevel, 0)
            this.game.clickDamage = this.readNumber(
                saveData.click?.damage,
                1 + (this.game.clickUpgradeLevel * CLICK_UPGRADE_STEP)
            )

            this.game.targetUpgradeSystem.valueLevel = this.readNumber(saveData.targetUpgrades?.valueLevel, 0)
            this.game.targetUpgradeSystem.spawnRateLevel = this.readNumber(saveData.targetUpgrades?.spawnRateLevel, 0)
            this.game.targetUpgradeSystem.diversityLevel = this.readNumber(saveData.targetUpgrades?.diversityLevel, 0)

            this.game.hasLaser = Boolean(saveData.hasLaser ?? false)
            this.game.plasmaUnlocked = Boolean(saveData.plasmaUnlocked ?? false)
            this.game.pulseUnlocked = Boolean(saveData.pulseUnlocked ?? this.game.plasmaUnlocked)
            this.game.scatterUnlocked = Boolean(saveData.scatterUnlocked ?? this.game.plasmaUnlocked)
            this.game.heavyUnlocked = Boolean(saveData.heavyUnlocked ?? this.game.plasmaUnlocked)
            this.game.autoFireUnlocked = Boolean(saveData.autoFire?.unlocked ?? false)
            this.game.autoFireEnabled = Boolean(saveData.autoFire?.enabled ?? false)
            this.game.worldLevel = Math.max(
                WORLD_START_LEVEL,
                this.readNumber(saveData.worldLevel, WORLD_START_LEVEL)
            )
            this.game.worldPointMultiplier = Math.max(
                WORLD_POINT_MULTIPLIER_BASE,
                this.readNumber(saveData.worldPointMultiplier, WORLD_POINT_MULTIPLIER_BASE)
            )
            this.game.transportChargeRequired = Math.max(
                1,
                this.readNumber(saveData.transportChargeRequired, TRANSPORT_INITIAL_CHARGE_REQUIRED)
            )
            this.game.transportCharge = Math.max(
                0,
                this.readNumber(saveData.transportCharge, 0)
            )
            this.game.transportCharge = Math.min(
                this.game.transportCharge,
                this.game.transportChargeRequired
            )
            this.game.transportReady = this.game.transportCharge >= this.game.transportChargeRequired
            this.game.transportAnimating = false
            this.game.transportAnimationTime = 0
            this.game.spawnSystem.baseSpawnRate =
                TARGET_BASE_SPAWN_RATE *
                Math.pow(
                    WORLD_SPAWN_RATE_GROWTH,
                    Math.max(0, this.game.worldLevel - WORLD_START_LEVEL)
                )

            if (
                LASER_TYPES[saveData.currentLaserType] &&
                this.game.isLaserUnlocked(saveData.currentLaserType)
            ) {
                this.game.currentLaserType = saveData.currentLaserType
            } else {
                this.game.currentLaserType = "simple"
            }

            const legacyUpgradeLevels = {
                frequencyLevel: this.readNumber(saveData.upgrades?.frequencyLevel, 0),
                amplitudeLevel: this.readNumber(saveData.upgrades?.amplitudeLevel, 0),
                fireRateLevel: this.readNumber(saveData.upgrades?.fireRateLevel, 0),
                strengthLevel: this.readNumber(saveData.upgrades?.strengthLevel, 0)
            }

            this.applyLaserTypeStats(saveData.laserTypeStats, legacyUpgradeLevels)
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

            if (typeof this.game.setPointsRaw === "function") {
                this.game.setPointsRaw(DEV_STARTING_POINTS)
            } else {
                this.game.points = DEV_STARTING_POINTS
            }
            this.game.clickDamage = 1
            this.game.clickUpgradeLevel = 0

            this.game.targetUpgradeSystem.valueLevel = 0
            this.game.targetUpgradeSystem.spawnRateLevel = 0
            this.game.targetUpgradeSystem.diversityLevel = 0

            this.game.hasLaser = false
            this.game.plasmaUnlocked = false
            this.game.pulseUnlocked = false
            this.game.scatterUnlocked = false
            this.game.heavyUnlocked = false
            this.game.currentLaserType = "simple"
            this.game.worldLevel = WORLD_START_LEVEL
            this.game.worldPointMultiplier = WORLD_POINT_MULTIPLIER_BASE
            this.game.transportCharge = 0
            this.game.transportChargeRequired = TRANSPORT_INITIAL_CHARGE_REQUIRED
            this.game.transportReady = false
            this.game.transportAnimating = false
            this.game.transportAnimationTime = 0
            this.game.spawnSystem.baseSpawnRate = TARGET_BASE_SPAWN_RATE

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
                strength: stats.strength,
                frequencyLevel: stats.frequencyLevel ?? 0,
                amplitudeLevel: stats.amplitudeLevel ?? 0,
                fireRateLevel: stats.fireRateLevel ?? 0,
                strengthLevel: stats.strengthLevel ?? 0
            }
        }

        return clonedStats

    }

    applyLaserTypeStats(savedStats, legacyLevels) {
        const savedLaserStats = (savedStats && typeof savedStats === "object")
            ? savedStats
            : {}

        for (const [typeId, baseStats] of Object.entries(this.game.laserTypeStats)) {
            const typeSave = savedLaserStats[typeId]

            baseStats.frequency = this.readNumber(typeSave?.frequency, baseStats.frequency)
            baseStats.amplitude = this.readNumber(typeSave?.amplitude, baseStats.amplitude)
            baseStats.width = this.readNumber(typeSave?.width, baseStats.width)
            baseStats.fireRate = this.readNumber(typeSave?.fireRate, baseStats.fireRate)
            baseStats.strength = this.readNumber(typeSave?.strength, baseStats.strength)
            baseStats.frequencyLevel = this.readNumber(typeSave?.frequencyLevel, legacyLevels.frequencyLevel)
            baseStats.amplitudeLevel = this.readNumber(typeSave?.amplitudeLevel, legacyLevels.amplitudeLevel)
            baseStats.fireRateLevel = this.readNumber(typeSave?.fireRateLevel, legacyLevels.fireRateLevel)
            baseStats.strengthLevel = this.readNumber(typeSave?.strengthLevel, legacyLevels.strengthLevel)
        }

    }

    readNumber(value, fallback) {

        return Number.isFinite(value) ? value : fallback

    }

}
