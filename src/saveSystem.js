import {
    CLICK_UPGRADE_STEP,
    DEV_STARTING_POINTS,
    TARGET_BASE_SPAWN_RATE,
    WORLD_START_LEVEL,
    WORLD_POINT_MULTIPLIER_BASE,
    WORLD_SPAWN_RATE_GROWTH,
    TRANSPORT_INITIAL_CHARGE_REQUIRED,
    UPGRADE_GROWTH,
    FREQUENCY_UPGRADE_BASE,
    AMPLITUDE_UPGRADE_BASE,
    FIRERATE_UPGRADE_BASE,
    LASER_STRENGTH_UPGRADE_BASE
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

        const sharedOscillatorLevels = this.game.getSharedOscillatorSaveData
            ? this.game.getSharedOscillatorSaveData()
            : {
                frequencyLevel: 0,
                amplitudeLevel: 0,
                fireRateLevel: 0,
                strengthLevel: 0
            }

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
            coreFragments: this.game.coreFragments ?? 0,
            progressMatrixPurchased: [...(this.game.progressMatrixPurchased || new Set())],
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
            mastery: {
                pulseLevel: this.game.pulseMasteryLevel ?? 0,
                scatterLevel: this.game.scatterMasteryLevel ?? 0,
                heavyLevel: this.game.heavyMasteryLevel ?? 0
            },
            discoveredTargets: [...this.game.discoveredTargets],
            sharedOscillatorLevels,
            upgrades: {
                frequencyLevel: sharedOscillatorLevels.frequencyLevel ?? 0,
                amplitudeLevel: sharedOscillatorLevels.amplitudeLevel ?? 0,
                fireRateLevel: sharedOscillatorLevels.fireRateLevel ?? 0,
                strengthLevel: sharedOscillatorLevels.strengthLevel ?? 0
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

            if (this.game.economy && typeof this.game.economy.setRaw === "function") {
                this.game.economy.setRaw(this.readNumber(saveData.points, DEV_STARTING_POINTS))
            } else {
                this.game.points = this.readNumber(saveData.points, DEV_STARTING_POINTS)
            }

            this.game.clickUpgradeLevel = this.readNumber(saveData.click?.upgradeLevel, 0)
            this.game.clickDamage = this.readNumber(
                saveData.click?.damage,
                1 + (this.game.clickUpgradeLevel * CLICK_UPGRADE_STEP)
            )
            this.game.pulseMasteryLevel = this.readNumber(saveData.mastery?.pulseLevel, 0)
            this.game.scatterMasteryLevel = this.readNumber(saveData.mastery?.scatterLevel, 0)
            this.game.heavyMasteryLevel = this.readNumber(saveData.mastery?.heavyLevel, 0)
            this.game.discoveredTargets = new Set(
                Array.isArray(saveData.discoveredTargets) ? saveData.discoveredTargets : []
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
            this.game.coreFragments = Math.max(
                0,
                this.readNumber(saveData.coreFragments, 0)
            )
            this.game.progressMatrixPurchased = new Set(
                Array.isArray(saveData.progressMatrixPurchased)
                    ? saveData.progressMatrixPurchased
                    : []
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

            const sharedOscillatorLevels = this.readSharedOscillatorLevels(saveData, legacyUpgradeLevels)
            this.applyLaserTypeStats(saveData.laserTypeStats, sharedOscillatorLevels)
            this.game.fireInterval = 1 / this.game.laserFireRate
            this.game.lastAutoShotTime = -Infinity
            this.game.lastManualShotTime = -Infinity
            if (this.game.upgradeSystem && typeof this.game.upgradeSystem.refreshMasteryEffects === "function") {
                this.game.upgradeSystem.refreshMasteryEffects()
            }

            return true
        } catch (error) {
            console.error("Load failed:", error)
            return false
        }

    }

    reset() {

        try {
            const preservedCoreFragments = Math.max(0, this.readNumber(this.game.coreFragments, 0))
            const preservedProgressMatrix = new Set(
                this.game.progressMatrixPurchased instanceof Set
                    ? [...this.game.progressMatrixPurchased]
                    : []
            )

            localStorage.removeItem(this.saveKey)

            if (this.game.economy && typeof this.game.economy.setRaw === "function") {
                this.game.economy.setRaw(DEV_STARTING_POINTS)
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
            this.game.pulseMasteryLevel = 0
            this.game.scatterMasteryLevel = 0
            this.game.heavyMasteryLevel = 0
            this.game.discoveredTargets = new Set()
            this.game.coreFragments = preservedCoreFragments
            this.game.progressMatrixPurchased = preservedProgressMatrix

            this.game.laserOvercharge = 0
            this.game.sharedOscillatorLevels = this.game.createSharedOscillatorLevels()
            this.game.laserTypeStats = this.game.createLaserTypeStats()
            if (typeof this.game.recalculateLaserTypeStats === "function") {
                this.game.recalculateLaserTypeStats()
            } else {
                this.game.fireInterval = 1 / this.game.laserFireRate
            }
            if (this.game.upgradeSystem && typeof this.game.upgradeSystem.refreshMasteryEffects === "function") {
                this.game.upgradeSystem.refreshMasteryEffects()
            }

            this.save()

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

        if (typeof this.game.setSharedOscillatorLevels === "function") {
            this.game.setSharedOscillatorLevels(legacyLevels)
            return
        }

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

    readSharedOscillatorLevels(saveData, legacyLevels) {

        const explicitSharedLevels = saveData?.sharedOscillatorLevels
        if (explicitSharedLevels && typeof explicitSharedLevels === "object") {
            return {
                frequencyLevel: this.readNumber(explicitSharedLevels.frequencyLevel, legacyLevels.frequencyLevel),
                amplitudeLevel: this.readNumber(explicitSharedLevels.amplitudeLevel, legacyLevels.amplitudeLevel),
                fireRateLevel: this.readNumber(explicitSharedLevels.fireRateLevel, legacyLevels.fireRateLevel),
                strengthLevel: this.readNumber(explicitSharedLevels.strengthLevel, legacyLevels.strengthLevel)
            }
        }

        const savedLaserStats = (saveData?.laserTypeStats && typeof saveData.laserTypeStats === "object")
            ? saveData.laserTypeStats
            : {}

        return {
            frequencyLevel: this.migrateLegacySharedLevel(
                savedLaserStats,
                "frequencyLevel",
                legacyLevels.frequencyLevel,
                FREQUENCY_UPGRADE_BASE
            ),
            amplitudeLevel: this.migrateLegacySharedLevel(
                savedLaserStats,
                "amplitudeLevel",
                legacyLevels.amplitudeLevel,
                AMPLITUDE_UPGRADE_BASE
            ),
            fireRateLevel: this.migrateLegacySharedLevel(
                savedLaserStats,
                "fireRateLevel",
                legacyLevels.fireRateLevel,
                FIRERATE_UPGRADE_BASE
            ),
            strengthLevel: this.migrateLegacySharedLevel(
                savedLaserStats,
                "strengthLevel",
                legacyLevels.strengthLevel,
                LASER_STRENGTH_UPGRADE_BASE
            )
        }

    }

    migrateLegacySharedLevel(savedLaserStats, levelKey, fallbackLevel, baseCost) {

        let totalSpend = 0
        let foundSavedLevel = false

        for (const stats of Object.values(savedLaserStats)) {
            const level = stats && Number.isFinite(stats[levelKey]) ? stats[levelKey] : null
            if (!Number.isFinite(level) || level <= 0) continue

            foundSavedLevel = true
            totalSpend += this.getTotalSpendForLevel(level, baseCost)
        }

        if (!foundSavedLevel && Number.isFinite(fallbackLevel) && fallbackLevel > 0) {
            totalSpend = this.getTotalSpendForLevel(fallbackLevel, baseCost)
        }

        return this.getEquivalentSharedLevel(totalSpend, baseCost)

    }

    getTotalSpendForLevel(level, baseCost) {

        let totalSpend = 0
        const normalizedLevel = Math.max(0, Math.floor(Number.isFinite(level) ? level : 0))

        for (let i = 0; i < normalizedLevel; i++) {
            totalSpend += Math.floor(baseCost * Math.pow(UPGRADE_GROWTH, i))
        }

        return totalSpend

    }

    getEquivalentSharedLevel(totalSpend, baseCost) {

        let remainingSpend = Math.max(0, Math.floor(Number.isFinite(totalSpend) ? totalSpend : 0))
        let level = 0

        while (remainingSpend >= Math.floor(baseCost * Math.pow(UPGRADE_GROWTH, level))) {
            remainingSpend -= Math.floor(baseCost * Math.pow(UPGRADE_GROWTH, level))
            level += 1
        }

        return level

    }

    readNumber(value, fallback) {

        return Number.isFinite(value) ? value : fallback

    }

}
