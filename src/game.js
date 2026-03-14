import { SpawnSystem } from "./spawn.js"
import { Laser } from "./laser.js"
import { CollisionSystem } from "./collision.js"
import { FloatingText } from "./floatingText.js"
import { ParticleSystem } from "./particles.js"
import { TransportBeam } from "./transportBeam.js"
import { UpgradeSystem } from "./upgrades.js"
import { TargetUpgradeSystem } from "./targetUpgrades.js"
import { ClickUpgradeSystem } from "./clickUpgrades.js"
import { EconomySystem } from "./economy.js"
import { OverlayController } from "./overlayController.js"
import { WorldSystem } from "./worldSystem.js"
import { LASER_TYPES } from "./laserTypes.js"
import { SaveSystem } from "./saveSystem.js"
import {
    SIMPLE_LASER_COST,
    PLASMA_UNLOCK_POINTS,
    AUTO_FIRE_COST,
    AUTO_FIRE_SPEED_MULTIPLIER,
    BASE_MANUAL_FIRE_COOLDOWN,
    DEV_STARTING_POINTS,
    LASER_BASE_STRENGTH,
    MAX_LASER_WIDTH,
    MAX_LASER_STRENGTH,
    GAME_STATE_TITLE,
    GAME_STATE_PLAYING,
    GAME_STATE_BOSS,
    WORLD_START_LEVEL,
    WORLD_POINT_MULTIPLIER_BASE,
    WORLD_POINT_MULTIPLIER_GROWTH,
    WORLD_GATE_BASE_COST,
    WORLD_GATE_COST_GROWTH,
    BOSS_PREP_SHIELD_COST,
    BOSS_PREP_OVERCHARGER_COST,
    BOSS_PREP_STABILIZER_COST,
    TRANSPORT_INITIAL_CHARGE_REQUIRED,
    TRANSPORT_CHARGE_GROWTH,
    WORLD_SPAWN_RATE_GROWTH,
    WORLD_DATA,
    WORLD_BOSS_DATA,
    WORLD_UPGRADE_TREES,
    WORLD_MODIFIERS,
    PROGRESS_MATRIX_NODES,
    SCATTER_BASE_BEAM_COUNT,
    HEAVY_BASE_PIERCE_COUNT,
    PULSE_SHOCKWAVE_BASE_RADIUS,
    FREQUENCY_UPGRADE_STEP,
    FREQUENCY_UPGRADE_AMPLITUDE_BONUS,
    FREQUENCY_UPGRADE_WIDTH_BONUS,
    AMPLITUDE_UPGRADE_STEP,
    FIRERATE_UPGRADE_STEP,
    LASER_STRENGTH_UPGRADE_STEP
} from "./constants.js"

const UPGRADE_ICONS = {
    frequency: new Path2D("M2 12 L8 6 L12 10 L16 4 L22 8"),
    amplitude: new Path2D("M2 12 Q6 4 10 12 T18 12 T22 12"),
    fireRate: new Path2D("M4 20 L12 4 L20 20"),
    strength: new Path2D("M12 2 L15 9 L22 9 L17 14 L19 22 L12 18 L5 22 L7 14 L2 9 L9 9 Z"),
    targetValue: new Path2D("M4 12 H20 M12 4 V20"),
    spawnRate: new Path2D("M4 12 L10 6 L16 12 L22 6"),
    diversity: new Path2D("M4 18 L12 6 L20 18"),
    autoFire: new Path2D("M6 18 L18 6 M6 6 L18 18"),
    simpleLaser: new Path2D("M4 12 H20"),
    plasmaLaser: new Path2D("M4 12 Q10 6 16 12 T22 12")
}

export class Game {

    constructor(canvas) {

        this.canvas = canvas
        this.ctx = canvas.getContext("2d")
        this.gameState = GAME_STATE_TITLE
        this.isPaused = false
        this.showPauseMenu = false
        this.overlayController = new OverlayController(this)
        this.overlayController.installBindings()
        this.titleLasers = []
        this.titleTargets = []
        this.titleTimer = 0
        this.musicTracks = [
            "assets/audio/meadow music 7.wav",
            "assets/audio/meadow music 1.wav",
            "assets/audio/meadow techno.wav",
            "assets/audio/anothaone.wav",
            "assets/audio/LILI.wav",
            "assets/audio/meadowmusic.wav",
            "assets/audio/CastleGatesV2.wav",
            "assets/audio/meadow music 8.wav",
            "assets/audio/gnomeforest.wav"
        ]
        this.musicQueue = []
        this.currentMusic = null
        this.isMuted = false
        this.audioUnlocked = false
        this.audioContext = null
        this.worldLevel = WORLD_START_LEVEL
        this.transportCharge = 0
        this.transportChargeRequired = TRANSPORT_INITIAL_CHARGE_REQUIRED
        this.transportReady = false
        this.worldGatePurchased = false
        this.bossPrepShield = false
        this.bossPrepOvercharger = false
        this.bossPrepStabilizer = false
        this.transportAnimating = false
        this.transportAnimationTime = 0
        this.transportAnimationDuration = 1.2
        this.pendingWorldLevel = null
        this.bossFightActive = false
        this.bossHealth = 0
        this.bossMaxHealth = 0
        this.bossFightTimer = 0
        this.bossFightTimeLimit = 20
        this.bossTargetWorld = null
        this.activeBossConfig = null
        this.bossLaserY = this.canvas.height / 2
        this.bossLaserMinY = 60
        this.bossLaserMaxY = this.canvas.height - 60
        this.bossLaserCooldown = 0.18
        this.bossLaserCooldownTimer = 0
        this.bossShotFlashTime = 0
        this.bossWeaponType = "simple"
        this.bossWeaponDamage = 1
        this.bossWeaponCooldownBase = 0.18
        this.bossWeaponHitWindow = 80
        this.bossWeaponColor = "#3a86ff"
        this.bossBeamVisualWidth = 3
        this.bossBeamVisualGlow = 1
        this.bossBeamVisualPhase = 0
        this.bossBeamVisualAmplitude = 0
        this.bossBeamVisualFrequency = 0
        this.bossBeamVisualScatterCount = 1
        this.bossBeamVisualColorPrimary = "#3a86ff"
        this.bossBeamVisualColorSecondary = "#d9f6ff"
        this.bossBeamFlashEvents = []
        this.bossProjectiles = []
        this.bossAttackTimer = 0
        this.bossAttackCooldown = 1.25
        this.bossPlayerHits = 0
        this.bossMaxPlayerHits = 3
        this.bossHitFlashTime = 0
        this.bossHazardLanes = []
        this.bossHazardTimer = 0
        this.bossPhase = 1
        this.bossPhaseChoiceActive = false
        this.bossPhaseTwoChoiceGiven = false
        this.bossPhaseThreeChoiceGiven = false
        this.bossPhaseChoices = []
        this.bossPhaseBuffDamage = 0
        this.bossPhaseBuffHitWindow = 0
        this.bossPhaseBuffCooldownMultiplier = 1
        this.bossPhaseBuffExtraLives = 0
        this.bossPhaseUpgradeState = this.createBossPhaseUpgradeState()
        this.activeWorldModifiers = []
        this.gravityWells = []
        this.gravityWellTimer = 0

        this.lastTime = 0
        this.worldPointMultiplier = WORLD_POINT_MULTIPLIER_BASE
        this.coreFragments = 0
        this.progressMatrixPurchased = new Set()
        this.showBalanceOverlay = false
        this.runTime = 0
        this.runPointsEarned = 0
        this.runKills = 0
        this.runBossAttempts = 0
        this.runBossWins = 0
        this.runBossLosses = 0
        this.runCoreFragmentsEarned = 0
        this.firstLaserUnlockTime = null
        this.transportReadyTime = null
        this.worldGateAffordableTime = null
        this.lastBalanceSampleTime = 0
        this.recentDamageDealt = 0
        this.recentDamageWindow = 0
        this._points = 0
        this.economy = new EconomySystem(this)
        this.economy.installBindings()
        this.economy.setRaw(DEV_STARTING_POINTS)
        this.clickDamage = 1
        this.clickUpgradeLevel = 0
        this.hasLaser = false
        this.targets = []
        this.lasers = []
        this.floatingTexts = []
        this._titleLaserSpawnAccumulator = 0
        this._titleTargetSpawnAccumulator = 0
        this.titleHeroLaser = {
            phase: 0,
            frequency: 0.006,
            amplitude: 34,
            width: 4,
            colorA: "#3a86ff",
            colorB: "#9b5cff",
            centerY: 305
        }
        this.discoveredTargets = new Set()
        this.simpleLaserCost = SIMPLE_LASER_COST
        this.autoFireCost = AUTO_FIRE_COST
        this.autoFireSpeedMultiplier = AUTO_FIRE_SPEED_MULTIPLIER
        this.baseManualFireCooldown = BASE_MANUAL_FIRE_COOLDOWN
        this.autoFireUnlocked = false
        this.autoFireEnabled = false
        this.plasmaUnlockPoints = PLASMA_UNLOCK_POINTS
        this.pulseUnlockPoints = Math.floor(this.plasmaUnlockPoints * 2)
        this.scatterUnlockPoints = Math.floor(this.plasmaUnlockPoints * 5)
        this.heavyUnlockPoints = Math.floor(this.plasmaUnlockPoints * 10)
        this.plasmaUnlocked = false
        this.pulseUnlocked = false
        this.scatterUnlocked = false
        this.heavyUnlocked = false
        this.currentLaserType = "simple"
        this.sharedOscillatorLevels = this.createSharedOscillatorLevels()
        this.laserTypeStats = this.createLaserTypeStats()
        this.defineLaserStatAccessors()
        this.recalculateLaserTypeStats()
        this.lastAutoShotTime = -Infinity
        this.lastManualShotTime = -Infinity
        this.fireInterval = 1 / this.laserFireRate
        this.laserOvercharge = 0
        this.maxLaserOvercharge = 50
        this.overchargeDecayRate = 6
        this.pulseMasteryLevel = 0
        this.scatterMasteryLevel = 0
        this.heavyMasteryLevel = 0
        this.scatterBeamCount = SCATTER_BASE_BEAM_COUNT
        this.heavyPierceCount = HEAVY_BASE_PIERCE_COUNT
        this.pulseShockwaveRadius = PULSE_SHOCKWAVE_BASE_RADIUS
        this.pulseShockwaves = []
        this.autoSaveInterval = 15
        this.autoSaveTimer = 0
        this.panelWidth = 320
        this.gridX = this.panelWidth
        this.gridWidth = this.canvas.width - this.panelWidth
        this.pauseButton = {
            x: this.canvas.width - 120,
            y: 18,
            width: 92,
            height: 40
        }
        this.muteButton = {
            x: this.pauseButton.x - 52,
            y: 18,
            width: 40,
            height: 40
        }
        this.gridOffset = 0
        this.emitterRecoil = 0
        this.panelScroll = 0
        this.mouseX = -1
        this.mouseY = -1
        this.upgradeFlashEffects = []
        this.panelSections = {
            lasers: true,
            mastery: true,
            laserUpgrades: true,
            targetEconomy: true,
            automation: true,
            world: true
        }
        this.unlockButton = {
            x: 20,
            y: 90,
            width: this.panelWidth - 40,
            height: 80
        }
        this.plasmaUnlockButton = {
            x: 20,
            y: 90,
            width: this.panelWidth - 40,
            height: 80
        }
        this.simpleLaserButton = {
            x: 20,
            y: 90,
            width: this.panelWidth - 40,
            height: 42
        }
        this.plasmaLaserButton = {
            x: 20,
            y: 140,
            width: this.panelWidth - 40,
            height: 42
        }
        this.pulseLaserButton = {
            x: 20,
            y: 190,
            width: this.panelWidth - 40,
            height: 42
        }
        this.scatterLaserButton = {
            x: 20,
            y: 240,
            width: this.panelWidth - 40,
            height: 42
        }
        this.heavyLaserButton = {
            x: 20,
            y: 290,
            width: this.panelWidth - 40,
            height: 42
        }
        this.pulseMasteryButton = {
            x: 20,
            y: 380,
            width: this.panelWidth - 40,
            height: 60
        }
        this.scatterMasteryButton = {
            x: 20,
            y: 450,
            width: this.panelWidth - 40,
            height: 60
        }
        this.heavyMasteryButton = {
            x: 20,
            y: 520,
            width: this.panelWidth - 40,
            height: 60
        }
        this.frequencyButton = {
            x: 20,
            y: 630,
            width: this.panelWidth - 40,
            height: 72
        }
        this.amplitudeButton = {
            x: 20,
            y: 710,
            width: this.panelWidth - 40,
            height: 72
        }
        this.fireRateButton = {
            x: 20,
            y: 790,
            width: this.panelWidth - 40,
            height: 72
        }
        this.strengthButton = {
            x: 20,
            y: 870,
            width: this.panelWidth - 40,
            height: 72
        }
        this.targetValueButton = {
            x: 20,
            y: 980,
            width: this.panelWidth - 40,
            height: 60
        }
        this.targetSpawnRateButton = {
            x: 20,
            y: 1050,
            width: this.panelWidth - 40,
            height: 60
        }
        this.targetDiversityButton = {
            x: 20,
            y: 1120,
            width: this.panelWidth - 40,
            height: 60
        }
        this.clickDamageButton = {
            x: 20,
            y: 1190,
            width: this.panelWidth - 40,
            height: 60
        }
        this.autoFireButton = {
            x: 20,
            y: 1310,
            width: this.panelWidth - 40,
            height: 60
        }
        this.worldGatePurchaseButton = {
            x: 20,
            y: this.autoFireButton.y + 92,
            width: this.panelWidth - 40,
            height: 26
        }
        this.bossPrepShieldButton = {
            x: 20,
            y: this.worldGatePurchaseButton.y + 36,
            width: this.panelWidth - 40,
            height: 30
        }
        this.bossPrepOverchargerButton = {
            x: 20,
            y: this.bossPrepShieldButton.y + 38,
            width: this.panelWidth - 40,
            height: 30
        }
        this.bossPrepStabilizerButton = {
            x: 20,
            y: this.bossPrepOverchargerButton.y + 38,
            width: this.panelWidth - 40,
            height: 30
        }
        this.worldSectionY = this.autoFireButton.y + 76
        this.panelHeaderButtons = []
        this.panelContentHeight = this.canvas.height

        this.worldSystem = new WorldSystem(this)
        this.spawnSystem = new SpawnSystem(this)
        this.collisionSystem = new CollisionSystem(this)
        this.particleSystem = new ParticleSystem(this)
        this.transportBeam = new TransportBeam(this)
        this.upgradeSystem = new UpgradeSystem(this)
        this.targetUpgradeSystem = new TargetUpgradeSystem(this)
        this.clickUpgradeSystem = new ClickUpgradeSystem(this)
        this.saveSystemLoaded = false
        this.saveSystem = new SaveSystem(this)
        this.saveSystem.load()
        this.saveSystemLoaded = true
        this.hasSaveGame = false
        try {
            const save = localStorage.getItem("frequencyClickerSave") || localStorage.getItem("frequencyLaserClickerSave")
            this.hasSaveGame = !!save
        } catch {
            this.hasSaveGame = false
        }
        this.canvas.addEventListener("click", (event) => {
            if (!this.audioUnlocked) {
                this.unlockAudio()
            }
            this.handleClick(event)
        })
        this.canvas.addEventListener("mousemove", (event) => {
            this.handleMouseMove(event)
        })
        this.canvas.addEventListener("mouseleave", () => {
            this.mouseX = -1
            this.mouseY = -1
            this.canvas.style.cursor = "default"
        })
        this.canvas.addEventListener("wheel", (event) => {
            this.handleWheel(event)
        }, { passive: false })
        window.addEventListener("keydown", (event) => {
            if (event.key === "F8") {
                this.showBalanceOverlay = !this.showBalanceOverlay
                return
            }
            if (event.key !== "Escape") return
            if (event.repeat) return
            if (this.overlayController.handleEscape()) {
                return
            }
            if (this.gameState !== GAME_STATE_PLAYING) return
            this.togglePauseMenu()
        })
    }

    playRandomMusic() {

        if (this.isMuted) return

        if (this.musicQueue.length === 0) {
            this.musicQueue = [...this.musicTracks]
        }

        const index = Math.floor(Math.random() * this.musicQueue.length)
        const track = this.musicQueue.splice(index, 1)[0]

        if (this.currentMusic) {
            this.currentMusic.pause()
            this.currentMusic = null
        }

        const audio = new Audio(track)
        audio.volume = 0.4
        audio.loop = false

        audio.addEventListener("ended", () => {
            this.playRandomMusic()
        })

        audio.play().catch(() => {
            setTimeout(() => {
                if (!this.isMuted && this.audioUnlocked) {
                    audio.play().catch(() => {})
                }
            }, 100)
        })

        this.currentMusic = audio
    }

    unlockAudio() {

        if (this.audioUnlocked) return

        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext
            if (AudioContextClass) {
                if (!this.audioContext) {
                    this.audioContext = new AudioContextClass()
                }
                if (this.audioContext.state === "suspended") {
                    this.audioContext.resume().catch(() => {})
                }
            }
        } catch {
            // no-op
        }

        this.audioUnlocked = true

    }

    resetRunTelemetry() {

        this.runTime = 0
        this.runPointsEarned = 0
        this.runKills = 0
        this.runBossAttempts = 0
        this.runBossWins = 0
        this.runBossLosses = 0
        this.runCoreFragmentsEarned = 0
        this.firstLaserUnlockTime = null
        this.transportReadyTime = null
        this.worldGateAffordableTime = null
        this.lastBalanceSampleTime = 0
        this.recentDamageDealt = 0
        this.recentDamageWindow = 0

    }

    recordDamageDealt(amount) {

        if (!Number.isFinite(amount) || amount <= 0) return
        this.recentDamageDealt += amount
        this.lastBalanceSampleTime = this.runTime

    }

    getRecentDpsEstimate() {

        if (!Number.isFinite(this.recentDamageWindow) || this.recentDamageWindow <= 0) {
            return 0
        }

        return this.recentDamageDealt / this.recentDamageWindow

    }

    formatBalanceOverlayTime(timeValue) {

        if (!Number.isFinite(timeValue)) return "--"

        const totalSeconds = Math.max(0, timeValue)
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60

        if (minutes <= 0) {
            return totalSeconds.toFixed(1) + "s"
        }

        return `${minutes}m ${seconds.toFixed(1)}s`

    }

    createLaserTypeStats() {

        const stats = {}

        for (const [typeId, laserType] of Object.entries(LASER_TYPES)) {
            stats[typeId] = {
                frequency: laserType.baseFrequency,
                amplitude: laserType.baseAmplitude,
                width: laserType.baseWidth,
                fireRate: laserType.baseFireRate,
                strength: laserType.baseStrength ?? laserType.strength ?? LASER_BASE_STRENGTH,
                frequencyLevel: 0,
                amplitudeLevel: 0,
                fireRateLevel: 0,
                strengthLevel: 0
            }
        }

        return stats

    }

    createSharedOscillatorLevels(source = {}) {

        const normalizeLevel = (value) => Math.max(0, Math.floor(Number.isFinite(value) ? value : 0))
        const maxSharedStrengthLevel = this.getMaxSharedStrengthLevel()

        return {
            frequencyLevel: normalizeLevel(source.frequencyLevel),
            amplitudeLevel: normalizeLevel(source.amplitudeLevel),
            fireRateLevel: normalizeLevel(source.fireRateLevel),
            strengthLevel: Math.min(normalizeLevel(source.strengthLevel), maxSharedStrengthLevel)
        }

    }

    getSharedOscillatorLevels() {

        if (!this.sharedOscillatorLevels) {
            this.sharedOscillatorLevels = this.createSharedOscillatorLevels()
        }

        return this.sharedOscillatorLevels

    }

    getSharedOscillatorSaveData() {

        const levels = this.getSharedOscillatorLevels()

        return {
            frequencyLevel: levels.frequencyLevel,
            amplitudeLevel: levels.amplitudeLevel,
            fireRateLevel: levels.fireRateLevel,
            strengthLevel: levels.strengthLevel
        }

    }

    getMaxSharedStrengthLevel() {

        const minimumBaseStrength = Object.values(LASER_TYPES).reduce((lowestValue, laserType) => {
            const baseStrength = laserType.baseStrength ?? laserType.strength ?? LASER_BASE_STRENGTH
            return Math.min(lowestValue, baseStrength)
        }, Infinity)

        const normalizedMinimum = Number.isFinite(minimumBaseStrength)
            ? minimumBaseStrength
            : LASER_BASE_STRENGTH

        return Math.max(0, Math.ceil(MAX_LASER_STRENGTH - normalizedMinimum))

    }

    recalculateLaserTypeStats() {

        const sharedLevels = this.getSharedOscillatorLevels()

        for (const [typeId, laserType] of Object.entries(LASER_TYPES)) {
            const stats = this.laserTypeStats[typeId]
            if (!stats) continue

            const baseStrength = laserType.baseStrength ?? laserType.strength ?? LASER_BASE_STRENGTH

            stats.frequencyLevel = sharedLevels.frequencyLevel
            stats.amplitudeLevel = sharedLevels.amplitudeLevel
            stats.fireRateLevel = sharedLevels.fireRateLevel
            stats.strengthLevel = sharedLevels.strengthLevel

            stats.frequency = laserType.baseFrequency + (sharedLevels.frequencyLevel * FREQUENCY_UPGRADE_STEP)
            stats.amplitude =
                laserType.baseAmplitude +
                (sharedLevels.frequencyLevel * FREQUENCY_UPGRADE_AMPLITUDE_BONUS) +
                (sharedLevels.amplitudeLevel * AMPLITUDE_UPGRADE_STEP)
            stats.width = Math.min(
                MAX_LASER_WIDTH,
                laserType.baseWidth + (sharedLevels.frequencyLevel * FREQUENCY_UPGRADE_WIDTH_BONUS)
            )
            stats.fireRate = laserType.baseFireRate + (sharedLevels.fireRateLevel * FIRERATE_UPGRADE_STEP)
            stats.strength = Math.min(
                MAX_LASER_STRENGTH,
                baseStrength + (sharedLevels.strengthLevel * LASER_STRENGTH_UPGRADE_STEP)
            )
        }

        if (this.laserTypeStats[this.currentLaserType]) {
            this.fireInterval = 1 / this.laserFireRate
        }

    }

    setSharedOscillatorLevels(levels = {}) {

        this.sharedOscillatorLevels = this.createSharedOscillatorLevels(levels)
        this.recalculateLaserTypeStats()

    }

    defineLaserStatAccessors() {

        Object.defineProperties(this, {
            laserFrequency: {
                get: () => this.laserTypeStats[this.currentLaserType].frequency,
                set: (value) => {
                    this.laserTypeStats[this.currentLaserType].frequency = value
                }
            },
            laserAmplitude: {
                get: () => this.laserTypeStats[this.currentLaserType].amplitude,
                set: (value) => {
                    this.laserTypeStats[this.currentLaserType].amplitude = value
                }
            },
            laserWidth: {
                get: () => this.laserTypeStats[this.currentLaserType].width,
                set: (value) => {
                    this.laserTypeStats[this.currentLaserType].width = value
                }
            },
            laserFireRate: {
                get: () => this.laserTypeStats[this.currentLaserType].fireRate,
                set: (value) => {
                    this.laserTypeStats[this.currentLaserType].fireRate = value
                }
            },
            laserStrength: {
                get: () => this.laserTypeStats[this.currentLaserType].strength,
                set: (value) => {
                    this.laserTypeStats[this.currentLaserType].strength = value
                }
            }
        })

    }

    switchLaserType(typeId) {

        if (!this.hasLaser) return
        if (!LASER_TYPES[typeId]) return
        if (!this.isLaserUnlocked(typeId)) return

        this.currentLaserType = typeId
        this.fireInterval = 1 / this.laserFireRate
        this.lastAutoShotTime = -Infinity
        this.lastManualShotTime = -Infinity

    }

    isLaserUnlocked(typeId) {

        if (typeId === "simple") return true
        if (typeId === "plasma") return this.plasmaUnlocked
        if (typeId === "pulse") return this.pulseUnlocked
        if (typeId === "scatter") return this.scatterUnlocked
        if (typeId === "heavy") return this.heavyUnlocked
        return false

    }

    getLaserProgressionOrder() {

        return [
            "simple",
            "plasma",
            "pulse",
            "scatter",
            "heavy"
        ]

    }

    getVisibleLaserTypes() {

        const progressionOrder = this.getLaserProgressionOrder()
        const visibleLaserTypes = []

        for (const typeId of progressionOrder) {
            if (this.isLaserUnlocked(typeId)) {
                visibleLaserTypes.push(typeId)
            }
        }

        const nextType = progressionOrder.find(typeId => !this.isLaserUnlocked(typeId))
        if (nextType && !visibleLaserTypes.includes(nextType)) {
            visibleLaserTypes.push(nextType)
        }

        if (visibleLaserTypes.length === 0 && progressionOrder.length > 0) {
            visibleLaserTypes.push(progressionOrder[0])
        }

        return visibleLaserTypes

    }

    getLaserButton(typeId) {

        if (typeId === "simple") return this.simpleLaserButton
        if (typeId === "plasma") return this.plasmaLaserButton
        if (typeId === "pulse") return this.pulseLaserButton
        if (typeId === "scatter") return this.scatterLaserButton
        if (typeId === "heavy") return this.heavyLaserButton
        return null

    }

    getLaserUnlockCost(typeId) {

        if (typeId === "plasma") return this.plasmaUnlockPoints
        if (typeId === "pulse") return this.pulseUnlockPoints
        if (typeId === "scatter") return this.scatterUnlockPoints
        if (typeId === "heavy") return this.heavyUnlockPoints
        return 0

    }

    getNextProgressionLaserType() {

        return this.getLaserProgressionOrder().find(typeId => !this.isLaserUnlocked(typeId)) || null

    }

    isNextPurchasableLaser(typeId) {

        if (!typeId || typeId === "simple") return false
        return this.getNextProgressionLaserType() === typeId

    }

    buyPlasmaLaser() {

        if (this.plasmaUnlocked) return true
        if (!this.isNextPurchasableLaser("plasma")) return false

        const cost = this.getLaserUnlockCost("plasma")
        if (!this.economy.spend(cost)) return false

        this.plasmaUnlocked = true
        return true

    }

    buyPulseLaser() {

        if (this.pulseUnlocked) return true
        if (!this.isNextPurchasableLaser("pulse")) return false

        const cost = this.getLaserUnlockCost("pulse")
        if (!this.economy.spend(cost)) return false

        this.pulseUnlocked = true
        return true

    }

    buyScatterLaser() {

        if (this.scatterUnlocked) return true
        if (!this.isNextPurchasableLaser("scatter")) return false

        const cost = this.getLaserUnlockCost("scatter")
        if (!this.economy.spend(cost)) return false

        this.scatterUnlocked = true
        return true

    }

    buyHeavyLaser() {

        if (this.heavyUnlocked) return true
        if (!this.isNextPurchasableLaser("heavy")) return false

        const cost = this.getLaserUnlockCost("heavy")
        if (!this.economy.spend(cost)) return false

        this.heavyUnlocked = true
        return true

    }

    tryPurchaseLaser(typeId) {

        if (typeId === "plasma") return this.buyPlasmaLaser()
        if (typeId === "pulse") return this.buyPulseLaser()
        if (typeId === "scatter") return this.buyScatterLaser()
        if (typeId === "heavy") return this.buyHeavyLaser()
        return false

    }

    hasAnyLaserMasteryUnlocked() {

        return (
            this.isLaserUnlocked("pulse") ||
            this.isLaserUnlocked("scatter") ||
            this.isLaserUnlocked("heavy")
        )

    }

    getCurrentWorldConfig() {

        if (this.worldSystem && typeof this.worldSystem.getConfig === "function") {
            return this.worldSystem.getConfig()
        }

        const exactConfig = WORLD_DATA[this.worldLevel]
        if (exactConfig) return exactConfig

        const worldIds = Object.keys(WORLD_DATA)
            .map(Number)
            .filter(Number.isFinite)
            .sort((a, b) => a - b)
        const highestWorldId = worldIds.length > 0 ? worldIds[worldIds.length - 1] : 1

        return WORLD_DATA[highestWorldId] || WORLD_DATA[1]

    }

    getCurrentWorldName() {

        return this.getCurrentWorldConfig().name || "Unknown World"

    }

    getCurrentWorldSubtitle() {

        return this.getCurrentWorldConfig().subtitle || "Uncharted Sector"

    }

    getCurrentWorldDescription() {

        return this.getCurrentWorldConfig().description || ""

    }

    getWorldBossTargetLevel() {

        if (Number.isFinite(this.bossTargetWorld)) return this.bossTargetWorld
        if (Number.isFinite(this.pendingWorldLevel)) return this.pendingWorldLevel
        return this.worldLevel + 1

    }

    getCurrentWorldBossConfig() {

        const targetLevel = this.getWorldBossTargetLevel()
        const exactConfig = WORLD_BOSS_DATA[targetLevel]
        if (exactConfig) return exactConfig

        const worldIds = Object.keys(WORLD_BOSS_DATA)
            .map(Number)
            .filter(Number.isFinite)
            .sort((a, b) => a - b)
        const highestWorldId = worldIds.length > 0 ? worldIds[worldIds.length - 1] : 1

        return WORLD_BOSS_DATA[highestWorldId] || WORLD_BOSS_DATA[1]

    }

    getWorldBossName() {

        return this.getCurrentWorldBossConfig().name || "World Gate Boss"

    }

    getWorldBossSubtitle() {

        return this.getCurrentWorldBossConfig().subtitle || "Dimensional Hostile Signature"

    }

    getProgressMatrixNodes() {

        return PROGRESS_MATRIX_NODES

    }

    hasProgressNode(nodeId) {

        return this.progressMatrixPurchased.has(nodeId)

    }

    isProgressNodePurchased(nodeId) {

        return this.hasProgressNode(nodeId)

    }

    canPurchaseProgressNode(node) {

        if (!node || !node.id) return false
        if (this.isProgressNodePurchased(node.id)) return false

        if (node.prerequisite && !this.hasProgressNode(node.prerequisite)) {
            return false
        }

        return this.coreFragments >= (node.cost || 0)

    }

    purchaseProgressNode(nodeId) {

        const node = this.getProgressMatrixNodes().find(entry => entry.id === nodeId)
        if (!node) return false
        if (!this.canPurchaseProgressNode(node)) return false

        this.coreFragments -= node.cost || 0
        this.progressMatrixPurchased.add(node.id)

        this.floatingTexts.push(
            new FloatingText(
                this.gridX + (this.gridWidth * 0.5),
                this.canvas.height * 0.4,
                node.title + " Unlocked",
                "#cda7ff"
            )
        )

        return true

    }

    getBossPrepCost(baseCost) {

        if (!Number.isFinite(baseCost)) return 0

        let costMultiplier = 1
        if (this.hasProgressNode("prepLogistics")) {
            costMultiplier *= 0.9
        }

        return Math.max(1, Math.floor(baseCost * costMultiplier))

    }

    getBossFragmentReward() {

        const currentWorld = Math.max(1, Math.floor(this.worldLevel || 1))
        let reward = 1

        if (currentWorld === 2) {
            reward = 2
        } else if (currentWorld === 3) {
            reward = 3
        } else if (currentWorld >= 4) {
            reward = 5
        }

        if (this.hasProgressNode("salvageProtocol")) {
            reward += 1
        }

        return reward

    }

    getWorldGateCost() {

        let cost = Math.floor(
            WORLD_GATE_BASE_COST *
            Math.pow(WORLD_GATE_COST_GROWTH, Math.max(0, this.worldLevel - 1))
        )

        let gateCostMultiplier = 1
        if (this.hasProgressNode("gateCalibration1")) {
            gateCostMultiplier -= 0.1
        }
        if (this.hasProgressNode("gateCalibration2")) {
            gateCostMultiplier -= 0.15
        }

        cost = Math.floor(cost * Math.max(0.2, gateCostMultiplier))
        return Math.max(1, cost)

    }

    isBossPrepPhase() {

        return (
            this.gameState === GAME_STATE_PLAYING &&
            this.transportReady &&
            this.worldGatePurchased &&
            !this.transportAnimating &&
            !this.bossFightActive
        )

    }

    getWorldUpgrades() {

        return WORLD_UPGRADE_TREES[this.worldLevel] || WORLD_UPGRADE_TREES[1]

    }

    generateWorldModifiers() {

        const modifierCount = 2
        const pool = [...WORLD_MODIFIERS]

        this.activeWorldModifiers = []

        for (let i = 0; i < modifierCount; i++) {
            if (pool.length === 0) break
            const index = Math.floor(Math.random() * pool.length)
            this.activeWorldModifiers.push(pool.splice(index, 1)[0])
        }

    }

    getRenderableLaserUpgradeEntries() {

        const upgrades = this.getWorldUpgrades()
        const sharedLevels = this.getSharedOscillatorLevels()
        const strengthMaxed = sharedLevels.strengthLevel >= this.getMaxSharedStrengthLevel()
        const entries = []

        for (const upgradeId of upgrades) {
            if (
                typeof this.upgradeSystem.hasUpgrade === "function" &&
                !this.upgradeSystem.hasUpgrade(upgradeId)
            ) {
                continue
            }

            if (upgradeId === "frequency") {
                const cost = this.upgradeSystem.getFrequencyCost()
                entries.push({
                    id: "frequency",
                    button: this.frequencyButton,
                    label: "Shared Frequency",
                    cost,
                    level: sharedLevels.frequencyLevel || 0,
                    affordable: this.economy.canAfford(cost)
                })
                continue
            }

            if (upgradeId === "amplitude") {
                const cost = this.upgradeSystem.getAmplitudeCost()
                entries.push({
                    id: "amplitude",
                    button: this.amplitudeButton,
                    label: "Shared Amplitude",
                    cost,
                    level: sharedLevels.amplitudeLevel || 0,
                    affordable: this.economy.canAfford(cost)
                })
                continue
            }

            if (upgradeId === "fireRate") {
                if (!this.autoFireUnlocked) {
                    continue
                }
                const cost = this.upgradeSystem.getFireRateCost()
                entries.push({
                    id: "fireRate",
                    button: this.fireRateButton,
                    label: "Shared Fire Rate",
                    cost,
                    level: sharedLevels.fireRateLevel || 0,
                    affordable: this.economy.canAfford(cost)
                })
                continue
            }

            if (upgradeId === "strength") {
                const cost = this.upgradeSystem.getStrengthCost()
                entries.push({
                    id: "strength",
                    button: this.strengthButton,
                    label: "Shared Laser Strength",
                    cost,
                    level: sharedLevels.strengthLevel || 0,
                    affordable: !strengthMaxed && this.economy.canAfford(cost)
                })
                continue
            }
        }

        return entries

    }

    registerTargetDiscovery(type) {

        const targetType = String(type || "")
        if (!targetType) return

        if (!this.discoveredTargets.has(targetType)) {
            this.discoveredTargets.add(targetType)

            this.floatingTexts.push(
                new FloatingText(
                    this.gridX + this.gridWidth / 2,
                    this.canvas.height * 0.35,
                    "NEW TARGET DISCOVERED",
                    "#ffd24a"
                )
            )
        }

    }

    handleClick(event) {

        const rect = this.canvas.getBoundingClientRect()
        const mouseX = event.clientX - rect.left
        const mouseY = event.clientY - rect.top

        if (mouseX < 0 || mouseX > this.canvas.width || mouseY < 0 || mouseY > this.canvas.height) {
            return
        }

        if (this.overlayController.handleClick(mouseX, mouseY)) return

        if (this.gameState === GAME_STATE_TITLE) {
            this.handleTitleClick(mouseX, mouseY)
            return
        }

        if (this.showPauseMenu) {
            this.handlePauseMenuClick(mouseX, mouseY)
            return
        }

        if (this.gameState === GAME_STATE_BOSS) {
            this.handleBossFightClick(mouseX, mouseY)
            return
        }

        if (this.isHoveringMuteButton(mouseX, mouseY)) {
            this.isMuted = !this.isMuted

            if (this.isMuted) {
                if (this.currentMusic) this.currentMusic.pause()
            } else {
                if (this.currentMusic) {
                    this.currentMusic.play().catch(() => {})
                } else {
                    this.playRandomMusic()
                }
            }
            return
        }

        if (this.isHoveringPauseButton(mouseX, mouseY)) {
            this.togglePauseMenu()
            return
        }

        if (mouseX < this.panelWidth) {
            this.handlePanelClick(mouseX, mouseY + this.panelScroll)
            return
        }

        this.handleGridClick(mouseX, mouseY)

    }

    getPanelContentHeight() {

        this.preparePanelLayout(true)
        return this.panelContentHeight

    }

    getMaxPanelScroll() {

        return Math.max(0, this.getPanelContentHeight() - this.canvas.height)

    }

    clampPanelScroll() {

        this.panelScroll = Math.max(0, Math.min(this.panelScroll, this.getMaxPanelScroll()))

    }

    handleWheel(event) {

        if (this.overlayController.handleWheel(event)) return

        if (this.gameState !== GAME_STATE_PLAYING) {
            return
        }

        if (this.showPauseMenu) {
            event.preventDefault()
            return
        }

        const rect = this.canvas.getBoundingClientRect()
        const mouseX = event.clientX - rect.left
        const mouseY = event.clientY - rect.top

        if (mouseX < 0 || mouseX > this.canvas.width || mouseY < 0 || mouseY > this.canvas.height) {
            return
        }

        if (mouseX >= this.panelWidth) {
            return
        }

        event.preventDefault()
        this.panelScroll += event.deltaY
        this.clampPanelScroll()

        const panelMouseY = this.getPanelMouseY()
        const hoveringInteractiveCard = this.isHoveringInteractivePanelCard(this.mouseX, panelMouseY)
        this.canvas.style.cursor = hoveringInteractiveCard ? "pointer" : "default"

    }

    getPanelMouseY() {

        return this.mouseY + this.panelScroll

    }

    getPanelLayoutMetrics() {

        const panelX = 0
        const panelWidth = this.panelWidth
        const padding = 16
        const contentX = panelX + padding
        const contentWidth = panelWidth - (padding * 2)

        return {
            panelX,
            panelWidth,
            padding,
            contentX,
            contentWidth
        }

    }

    isCardHovered(button) {

        if (this.gameState !== GAME_STATE_PLAYING) return false
        if (this.mouseX < 0 || this.mouseX > this.canvas.width || this.mouseY < 0 || this.mouseY > this.canvas.height) {
            return false
        }
        if (this.mouseX >= this.panelWidth) return false

        return this.isInsideButton(this.mouseX, this.getPanelMouseY(), button)

    }

    getInteractivePanelButtons() {

        if (!this.hasLaser) {
            return this.isPanelSectionExpanded("lasers")
                ? [this.unlockButton]
                : []
        }

        const buttons = []

        if (this.isPanelSectionExpanded("lasers")) {
            const visibleLaserTypes = this.getVisibleLaserTypes()
            for (const typeId of visibleLaserTypes) {
                const button = this.getLaserButton(typeId)
                if (button) {
                    buttons.push(button)
                }
            }
        }

        if (this.hasAnyLaserMasteryUnlocked() && this.isPanelSectionExpanded("mastery")) {
            if (this.isLaserUnlocked("pulse")) {
                buttons.push(this.pulseMasteryButton)
            }
            if (this.isLaserUnlocked("scatter")) {
                buttons.push(this.scatterMasteryButton)
            }
            if (this.isLaserUnlocked("heavy")) {
                buttons.push(this.heavyMasteryButton)
            }
        }

        if (this.isPanelSectionExpanded("laserUpgrades")) {
            const laserUpgradeEntries = this.getRenderableLaserUpgradeEntries()
            for (const entry of laserUpgradeEntries) {
                buttons.push(entry.button)
            }
        }

        if (this.isPanelSectionExpanded("targetEconomy")) {
            buttons.push(
                this.targetValueButton,
                this.targetSpawnRateButton,
                this.targetDiversityButton,
                this.clickDamageButton
            )
        }

        if (this.isPanelSectionExpanded("automation")) {
            buttons.push(this.autoFireButton)
        }

        if (
            this.isPanelSectionExpanded("world")
        ) {
            if (this.transportReady && !this.worldGatePurchased) {
                buttons.push(this.worldGatePurchaseButton)
            }

            if (this.isBossPrepPhase()) {
                if (!this.bossPrepShield) {
                    buttons.push(this.bossPrepShieldButton)
                }
                if (!this.bossPrepOvercharger) {
                    buttons.push(this.bossPrepOverchargerButton)
                }
                if (!this.bossPrepStabilizer) {
                    buttons.push(this.bossPrepStabilizerButton)
                }
            }
        }

        return buttons

    }

    isHoveringInteractivePanelCard(mouseX, panelMouseY) {

        if (mouseX < 0 || mouseX >= this.panelWidth) return false

        const headerButtons = this.getVisiblePanelHeaderButtons()
        for (const headerButton of headerButtons) {
            if (this.isInsideButton(mouseX, panelMouseY, headerButton)) {
                return true
            }
        }

        const buttons = this.getInteractivePanelButtons()
        for (const button of buttons) {
            if (this.isInsideButton(mouseX, panelMouseY, button)) {
                return true
            }
        }

        return false

    }

    isHoveringPauseButton(mouseX, mouseY) {

        if (this.gameState !== GAME_STATE_PLAYING) return false
        if (this.showPauseMenu) return false
        if (this.showInfoScreen) return false
        if (this.showTargetIndex) return false
        if (this.showProgressMatrix) return false
        if (this.showArchivesMenu) return false

        return this.isInsideButton(mouseX, mouseY, this.pauseButton)

    }

    isHoveringMuteButton(mouseX, mouseY) {

        if (this.gameState !== GAME_STATE_PLAYING) return false
        if (this.showPauseMenu) return false
        if (this.showInfoScreen) return false
        if (this.showTargetIndex) return false
        if (this.showProgressMatrix) return false
        if (this.showArchivesMenu) return false

        return this.isInsideButton(mouseX, mouseY, this.muteButton)

    }

    handleMouseMove(event) {

        const rect = this.canvas.getBoundingClientRect()
        this.mouseX = event.clientX - rect.left
        this.mouseY = event.clientY - rect.top

        if (this.mouseX < 0 || this.mouseX > this.canvas.width || this.mouseY < 0 || this.mouseY > this.canvas.height) {
            this.canvas.style.cursor = "default"
            return
        }

        if (this.overlayController.updateCursor(this.mouseX, this.mouseY)) return

        if (this.gameState === GAME_STATE_TITLE) {
            const titleButtons = this.getTitleButtons()
            const hoveringTitleButton = titleButtons.some(
                button => this.isInsideButton(this.mouseX, this.mouseY, button)
            )
            this.canvas.style.cursor = hoveringTitleButton ? "pointer" : "default"
            return
        }

        if (this.gameState !== GAME_STATE_PLAYING) {
            this.canvas.style.cursor = "default"
            return
        }

        if (this.showPauseMenu) {
            const hoveringPauseButton = this.isHoveringPauseMenuButton(this.mouseX, this.mouseY)
            this.canvas.style.cursor = hoveringPauseButton ? "pointer" : "default"
            return
        }

        if (this.isHoveringMuteButton(this.mouseX, this.mouseY)) {
            this.canvas.style.cursor = "pointer"
            return
        }

        if (this.isHoveringPauseButton(this.mouseX, this.mouseY)) {
            this.canvas.style.cursor = "pointer"
            return
        }

        if (this.mouseX >= this.panelWidth) {
            this.canvas.style.cursor = "default"
            return
        }

        const panelMouseY = this.getPanelMouseY()
        const hoveringInteractiveCard = this.isHoveringInteractivePanelCard(this.mouseX, panelMouseY)
        this.canvas.style.cursor = hoveringInteractiveCard ? "pointer" : "default"

    }

    togglePanelSection(sectionId) {

        if (!(sectionId in this.panelSections)) return
        this.panelSections[sectionId] = !this.panelSections[sectionId]

    }

    isPanelSectionExpanded(sectionId) {

        return this.panelSections[sectionId] !== false

    }

    getVisiblePanelHeaderButtons() {

        this.preparePanelLayout(true)
        return this.panelHeaderButtons

    }

    getTitleButtons() {

        const buttonWidth = 280
        const buttonHeight = 56
        const buttonGap = 18
        const x = (this.canvas.width / 2) - (buttonWidth / 2)
        const startY = (this.canvas.height / 2) + 16
        const buttons = []
        let hasSave = null
        try {
            hasSave = localStorage.getItem("frequencyLaserClickerSave")
        } catch {
            hasSave = null
        }

        if (hasSave) {
            buttons.push({
                id: "continue",
                label: "Continue Game",
                iconId: "simpleLaser",
                x,
                y: startY,
                width: buttonWidth,
                height: buttonHeight
            })
            buttons.push({
                id: "newGame",
                label: "New Game",
                iconId: "plasmaLaser",
                x,
                y: startY + buttonHeight + buttonGap,
                width: buttonWidth,
                height: buttonHeight
            })
            buttons.push({
                id: "archives",
                label: "Archives",
                iconId: "diversity",
                x,
                y: startY + (buttonHeight + buttonGap) * 2,
                width: buttonWidth,
                height: buttonHeight
            })
            return buttons
        }

        buttons.push({
            id: "start",
            label: "Start Game",
            iconId: "simpleLaser",
            x,
            y: startY,
            width: buttonWidth,
            height: buttonHeight
        })
        buttons.push({
            id: "archives",
            label: "Archives",
            iconId: "diversity",
            x,
            y: startY + buttonHeight + buttonGap,
            width: buttonWidth,
            height: buttonHeight
        })

        return buttons

    }

    handleTitleClick(mouseX, mouseY) {

        const buttons = this.getTitleButtons()
        const clickedButton = buttons.find(button => this.isInsideButton(mouseX, mouseY, button))
        if (!clickedButton) return

        if (clickedButton.id === "continue") {
            this.saveSystem.load()
            this.hasSaveGame = true
            this.gameState = GAME_STATE_PLAYING
            this.overlayController.closeAll()
            return
        }

        if (clickedButton.id === "newGame") {
            const shouldReset = confirm("Start a new game? This will reset saved progress.")
            if (!shouldReset) return
            this.saveSystem.reset()
            this.resetRunTelemetry()
            this.hasSaveGame = false
            this.gameState = GAME_STATE_PLAYING
            this.overlayController.closeAll()
            return
        }

        if (clickedButton.id === "start") {
            this.resetRunTelemetry()
            this.gameState = GAME_STATE_PLAYING
            this.musicQueue = []
            this.overlayController.closeAll()
            if (!this.audioUnlocked) {
                this.unlockAudio()
            }
            if (this.currentMusic) {
                try {
                    this.currentMusic.pause()
                } catch {}
                this.currentMusic = null
            }
            this.playRandomMusic()
            return
        }

        if (clickedButton.id === "archives") {
            this.overlayController.open("archives")
        }

    }

    togglePauseMenu() {

        this.showPauseMenu = !this.showPauseMenu
        this.isPaused = this.showPauseMenu
        if (!this.showPauseMenu) {
            this.overlayController.closeAll()
        }
        this.canvas.style.cursor = "default"

    }

    getPauseMenuButtons() {

        const buttonWidth = 300
        const buttonHeight = 54
        const buttonGap = 12
        const labels = [
            { id: "resume", label: "Resume" },
            { id: "save", label: "Save Game" },
            { id: "mute", label: this.isMuted ? "Unmute Audio" : "Mute Audio" },
            { id: "skipSong", label: "Skip Song" },
            { id: "archives", label: "Archives" },
            { id: "menu", label: "Main Menu" }
        ]
        const totalHeight = (labels.length * buttonHeight) + ((labels.length - 1) * buttonGap)
        const startX = (this.canvas.width / 2) - (buttonWidth / 2)
        const startY = (this.canvas.height / 2) - (totalHeight / 2) + 24

        return labels.map((entry, index) => ({
            id: entry.id,
            label: entry.label,
            x: startX,
            y: startY + (index * (buttonHeight + buttonGap)),
            width: buttonWidth,
            height: buttonHeight
        }))

    }

    isHoveringPauseMenuButton(mouseX, mouseY) {

        const buttons = this.getPauseMenuButtons()
        return buttons.some(button => this.isInsideButton(mouseX, mouseY, button))

    }

    handlePauseMenuClick(mouseX, mouseY) {

        const buttons = this.getPauseMenuButtons()
        const clickedButton = buttons.find(button => this.isInsideButton(mouseX, mouseY, button))
        if (!clickedButton) return

        if (clickedButton.id === "resume") {
            this.togglePauseMenu()
            return
        }

        if (clickedButton.id === "save") {
            this.saveSystem.save()
            return
        }

        if (clickedButton.id === "mute") {
            this.isMuted = !this.isMuted

            if (this.isMuted) {

                if (this.currentMusic) {
                    this.currentMusic.pause()
                }

            } else {

                if (this.currentMusic) {
                    this.currentMusic.play().catch(() => {})
                } else {
                    this.playRandomMusic()
                }

            }
            return
        }

        if (clickedButton.id === "skipSong") {
            if (this.currentMusic) {
                this.currentMusic.pause()
            }

            this.playRandomMusic()
            return
        }

        if (clickedButton.id === "archives") {
            this.overlayController.open("archives")
            return
        }

        if (clickedButton.id === "menu") {
            this.showPauseMenu = false
            this.isPaused = false
            this.gameState = GAME_STATE_TITLE
            if (this.currentMusic) {
                this.currentMusic.pause()
            }
            this.isPaused = false
            this.currentMusic = null
            this.overlayController.closeAll()
        }

    }

    getArchivesMenuLayout() {

        const panelWidth = Math.min(540, this.canvas.width - 96)
        const panelHeight = Math.min(440, this.canvas.height - 96)
        const panelX = (this.canvas.width - panelWidth) / 2
        const panelY = (this.canvas.height - panelHeight) / 2

        return {
            panel: {
                x: panelX,
                y: panelY,
                width: panelWidth,
                height: panelHeight
            },
            titleY: panelY + 48
        }

    }

    getArchivesMenuButtons() {

        const layout = this.getArchivesMenuLayout()
        const buttonWidth = Math.min(320, layout.panel.width - 80)
        const buttonHeight = 54
        const buttonGap = 14
        const startX = layout.panel.x + ((layout.panel.width - buttonWidth) / 2)
        const startY = layout.panel.y + 98

        return [
            {
                id: "info",
                label: "Info",
                iconId: "targetValue",
                x: startX,
                y: startY,
                width: buttonWidth,
                height: buttonHeight
            },
            {
                id: "targetIndex",
                label: "Target Index",
                iconId: "diversity",
                x: startX,
                y: startY + (buttonHeight + buttonGap),
                width: buttonWidth,
                height: buttonHeight
            },
            {
                id: "progressMatrix",
                label: "Progress Matrix",
                iconId: "strength",
                x: startX,
                y: startY + ((buttonHeight + buttonGap) * 2),
                width: buttonWidth,
                height: buttonHeight
            },
            {
                id: "back",
                label: "Back",
                iconId: "simpleLaser",
                x: startX,
                y: startY + ((buttonHeight + buttonGap) * 3),
                width: buttonWidth,
                height: buttonHeight
            }
        ]

    }

    isHoveringArchivesMenuButton(mouseX, mouseY) {

        const buttons = this.getArchivesMenuButtons()
        return buttons.some(button => this.isInsideButton(mouseX, mouseY, button))

    }

    handleArchivesMenuClick(mouseX, mouseY) {

        const buttons = this.getArchivesMenuButtons()
        const clickedButton = buttons.find(button => this.isInsideButton(mouseX, mouseY, button))
        if (!clickedButton) return

        if (clickedButton.id === "info") {
            this.overlayController.open("info")
            return
        }

        if (clickedButton.id === "targetIndex") {
            this.overlayController.open("targetIndex")
            return
        }

        if (clickedButton.id === "progressMatrix") {
            this.overlayController.open("progressMatrix")
            return
        }

        this.overlayController.closeAll()

    }

    drawArchivesMenu(ctx) {

        const layout = this.getArchivesMenuLayout()
        const buttons = this.getArchivesMenuButtons()

        ctx.save()
        ctx.fillStyle = "rgba(0,0,0,0.75)"
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        const panelGradient = ctx.createLinearGradient(
            layout.panel.x,
            layout.panel.y,
            layout.panel.x,
            layout.panel.y + layout.panel.height
        )
        panelGradient.addColorStop(0, "rgba(20,27,46,0.95)")
        panelGradient.addColorStop(1, "rgba(11,16,29,0.95)")

        this.drawRoundedRectPath(
            ctx,
            layout.panel.x,
            layout.panel.y,
            layout.panel.width,
            layout.panel.height,
            16
        )
        ctx.fillStyle = panelGradient
        ctx.fill()

        ctx.shadowColor = "#3a86ff"
        ctx.shadowBlur = 16
        this.drawRoundedRectPath(
            ctx,
            layout.panel.x,
            layout.panel.y,
            layout.panel.width,
            layout.panel.height,
            16
        )
        ctx.strokeStyle = "rgba(58,134,255,0.55)"
        ctx.lineWidth = 1.3
        ctx.stroke()
        ctx.shadowBlur = 0

        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillStyle = "#e8f3ff"
        ctx.font = "bold 34px Arial"
        ctx.fillText("ARCHIVES", this.canvas.width / 2, layout.titleY)

        ctx.fillStyle = "rgba(210,224,245,0.88)"
        ctx.font = "14px Arial"
        ctx.fillText("Access records, codex data, and matrix planning", this.canvas.width / 2, layout.titleY + 26)

        for (const button of buttons) {
            const hovered = this.isInsideButton(this.mouseX, this.mouseY, button)
            this.drawUpgradeCard(
                ctx,
                button.x,
                button.y,
                button.width,
                button.height,
                {
                    title: button.label,
                    cost: "",
                    level: 0,
                    canAfford: true,
                    selected: false,
                    unlocked: true,
                    hovered,
                    iconId: button.iconId
                }
            )
        }

        ctx.restore()

    }

    getInfoScreenLayout() {

        const panelWidth = Math.min(760, this.canvas.width - 96)
        const panelHeight = Math.min(560, this.canvas.height - 96)
        const panelX = (this.canvas.width - panelWidth) / 2
        const panelY = (this.canvas.height - panelHeight) / 2
        const contentX = panelX + 28
        const contentY = panelY + 92
        const contentWidth = panelWidth - 56
        const contentHeight = panelHeight - 128

        return {
            panel: {
                x: panelX,
                y: panelY,
                width: panelWidth,
                height: panelHeight
            },
            content: {
                x: contentX,
                y: contentY,
                width: contentWidth,
                height: contentHeight
            },
            backButton: {
                x: panelX + 18,
                y: panelY + 18,
                width: 94,
                height: 36
            },
            titleY: panelY + 42
        }

    }

    getInfoSections() {

        return [
            {
                title: "GAME OVERVIEW",
                body: "Frequency Clicker is an arcade-incremental game where you destroy drifting targets, earn energy points, unlock new laser types, and evolve your build across multiple worlds. Each run starts simple, but quickly expands into faster fire rates, stronger beams, rare targets, mastery upgrades, and world-based modifiers."
            },
            {
                title: "CORE LOOP",
                body: "Destroy targets to earn Energy Points. Spend Energy Points on new lasers, shared oscillator upgrades, target economy upgrades, automation systems, and mastery upgrades. As you grow stronger, you charge the Transport Beam and travel to new worlds, where progression resets but your long-term world scaling continues."
            },
            {
                title: "CONTROLS",
                body: "Click targets to damage them directly. Click the grid to fire your equipped laser. Use the mouse wheel over the panel to scroll upgrades. Press Escape to open the pause menu."
            },
            {
                title: "ENERGY POINTS",
                body: "Energy Points are the main currency used for progression. You earn them by destroying targets. Stronger and rarer targets reward more points. As you advance worlds, your permanent world multiplier increases, making future runs more rewarding."
            },
            {
                title: "LASERS",
                body: "Simple Laser is your balanced starter beam. Plasma Laser offers stronger output. Pulse Laser specializes in pulse-based effects. Scatter Laser spreads damage across multiple beams. Heavy Laser is slower but far more destructive."
            },
            {
                title: "LASER UPGRADES",
                body: "Core laser upgrades now improve your shared oscillator engineering across the whole arsenal. Frequency changes wave density and adds some width and coverage. Amplitude increases wave height. Fire Rate increases how often lasers can fire. Laser Strength increases damage per hit. New lasers inherit this shared waveform progress immediately, while mastery remains weapon-specific."
            },
            {
                title: "LASER MASTERY",
                body: "Mastery upgrades unlock deeper specialization for advanced lasers. Pulse Mastery improves pulse shockwave radius. Scatter Mastery increases scatter beam count. Heavy Mastery increases heavy laser piercing power. Mastery upgrades are tied to their specific weapon types and appear only after unlocking those lasers."
            },
            {
                title: "TARGET ECONOMY",
                body: "Target Value increases point income. Spawn Rate increases target pressure and earning potential. Target Diversity unlocks additional enemy types and more complex encounters. Click Damage improves your direct click damage against targets."
            },
            {
                title: "AUTOMATION",
                body: "Auto Fire automatically fires your laser over time. Fire Rate upgrades make automation more effective. Automation becomes especially valuable during longer runs and faster world progression."
            },
            {
                title: "TARGET TYPES",
                body: "The battlefield contains many enemy classes, including basic, armored, reinforced, heavy, shielded, reflector, splitter, fragment, phase, charger, boss, and rare targets such as Golden, Phantom, and Ancient. Use the Target Index to track what you have discovered."
            },
            {
                title: "WORLDS",
                body: "Worlds act like progression layers beyond a single build. When you advance to a new world, your short-term progression resets, new pacing and challenge rules can appear, and your permanent world scaling improves. This creates a prestige-style loop where each new world becomes faster, richer, and more varied."
            },
            {
                title: "TRANSPORT BEAM",
                body: "Defeated enemies charge the Transport Beam. Once fully charged, the beam becomes available for world travel. Activating it moves you into the next world and begins the next phase of progression."
            },
            {
                title: "WORLD MODIFIERS",
                body: "World modifiers alter the feel of a run and add variety. Some increase target pressure, some add chain effects, some change movement behavior, and others create more chaotic encounters. Modifiers help each world feel distinct."
            },
            {
                title: "STARTER STRATEGY",
                body: "A strong early path is to unlock your first laser quickly, improve target value and frequency, build toward fire rate and automation, unlock stronger lasers as soon as possible, and then use mastery upgrades to specialize your preferred weapon."
            },
            {
                title: "LORE",
                body: "Humanity discovered that certain waveforms could destabilize hostile dimensional matter. What began as signal research became weapon science. Now the grid is a battlefield, lasers are tuned like instruments, and each world you breach reveals a deeper, stranger layer of the frequency war."
            }
        ]

    }

    wrapInfoText(ctx, text, maxWidth) {

        const wrappedLines = []
        const rawLines = String(text || "").split("\n")

        for (const rawLine of rawLines) {
            const words = rawLine.split(/\s+/).filter(Boolean)
            if (words.length === 0) {
                wrappedLines.push("")
                continue
            }

            let currentLine = words[0]
            for (let i = 1; i < words.length; i++) {
                const nextLine = currentLine + " " + words[i]
                if (ctx.measureText(nextLine).width <= maxWidth) {
                    currentLine = nextLine
                } else {
                    wrappedLines.push(currentLine)
                    currentLine = words[i]
                }
            }
            wrappedLines.push(currentLine)
        }

        return wrappedLines

    }

    getInfoContentHeight() {

        const layout = this.getInfoScreenLayout()
        const sections = this.getInfoSections()
        const lineHeight = 20
        let y = 0

        this.ctx.save()
        this.ctx.font = "16px Arial"
        for (const section of sections) {
            y += 22
            const wrappedBody = this.wrapInfoText(this.ctx, section.body, layout.content.width)
            y += wrappedBody.length * lineHeight
            y += 16
        }
        this.ctx.restore()

        return Math.max(layout.content.height, y)

    }

    getMaxInfoScroll() {

        const layout = this.getInfoScreenLayout()
        return Math.max(0, this.getInfoContentHeight() - layout.content.height)

    }

    clampInfoScroll() {

        const maxInfoScroll = this.getMaxInfoScroll()
        this.infoScroll = Math.max(0, Math.min(this.infoScroll, maxInfoScroll))

    }

    isHoveringInfoBackButton(mouseX, mouseY) {

        const { backButton } = this.getInfoScreenLayout()
        return this.isInsideButton(mouseX, mouseY, backButton)

    }

    handleInfoScreenClick(mouseX, mouseY) {

        const { backButton } = this.getInfoScreenLayout()
        if (this.isInsideButton(mouseX, mouseY, backButton)) {
            this.overlayController.closeAll()
            this.canvas.style.cursor = "default"
        }

    }

    getTargetIndexLayout() {

        const panelWidth = Math.min(700, this.canvas.width - 120)
        const panelHeight = Math.min(560, this.canvas.height - 96)
        const panelX = (this.canvas.width - panelWidth) / 2
        const panelY = (this.canvas.height - panelHeight) / 2
        const contentX = panelX + 28
        const contentY = panelY + 92
        const contentWidth = panelWidth - 56
        const contentHeight = panelHeight - 128

        return {
            panel: {
                x: panelX,
                y: panelY,
                width: panelWidth,
                height: panelHeight
            },
            content: {
                x: contentX,
                y: contentY,
                width: contentWidth,
                height: contentHeight
            },
            backButton: {
                x: panelX + 18,
                y: panelY + 18,
                width: 94,
                height: 36
            },
            titleY: panelY + 42
        }

    }

    getTargetIndexEntries() {

        return [
            { id: "basic", label: "Basic" },
            { id: "highValue", label: "High Value" },
            { id: "fast", label: "Fast" },
            { id: "armored", label: "Armored" },
            { id: "reinforced", label: "Reinforced" },
            { id: "shielded", label: "Shielded" },
            { id: "heavy", label: "Heavy" },
            { id: "splitter", label: "Splitter" },
            { id: "reflector", label: "Reflector" },
            { id: "swarm", label: "Swarm" },
            { id: "phase", label: "Phase" },
            { id: "charger", label: "Charger" },
            { id: "healer", label: "Healer" },
            { id: "exploder", label: "Exploder" },
            { id: "crystal", label: "Crystal" },
            { id: "elite", label: "Elite" },
            { id: "fragment", label: "Fragment" },
            { id: "boss", label: "Boss" },
            { id: "golden", label: "Golden" },
            { id: "phantom", label: "Phantom" },
            { id: "ancient", label: "Ancient" }
        ]

    }

    getTargetDescription(targetId) {

        const descriptions = {
            basic: "Standard target with no special behavior.",
            highValue: "Worth extra Energy Points when destroyed.",
            fast: "Moves quickly and is harder to hit.",
            armored: "Has increased durability.",
            reinforced: "A tougher upgraded target with higher health.",
            shielded: "Its shield must break before normal damage applies.",
            heavy: "Slow, durable, and built to absorb punishment.",
            splitter: "Breaks apart into smaller threats on destruction.",
            reflector: "Can create reflected laser behavior.",
            swarm: "Small, fast targets that appear in groups.",
            phase: "Can partially phase out and avoid damage.",
            charger: "Builds momentum and bursts forward aggressively.",
            healer: "Repairs nearby targets over time.",
            exploder: "Damages nearby targets when destroyed.",
            crystal: "Highly resistant to laser damage.",
            elite: "A stronger upgraded target.",
            fragment: "A smaller leftover target created by splitting effects.",
            boss: "A major high-value threat with extreme durability.",
            golden: "A rare premium target worth a huge reward.",
            phantom: "A rare drifting target with unstable movement.",
            ancient: "A rare elite target with high durability and value."
        }

        return descriptions[targetId] || "Unknown target profile."

    }

    getTargetIndexContentHeight() {

        const entries = this.getTargetIndexEntries()
        const rowHeight = 54
        const topPadding = 8
        const bottomPadding = 8

        return topPadding + (entries.length * rowHeight) + bottomPadding

    }

    getMaxTargetIndexScroll() {

        const layout = this.getTargetIndexLayout()
        return Math.max(0, this.getTargetIndexContentHeight() - layout.content.height)

    }

    clampTargetIndexScroll() {

        const maxTargetIndexScroll = this.getMaxTargetIndexScroll()
        this.targetIndexScroll = Math.max(0, Math.min(this.targetIndexScroll, maxTargetIndexScroll))

    }

    isHoveringTargetIndexBackButton(mouseX, mouseY) {

        const { backButton } = this.getTargetIndexLayout()
        return this.isInsideButton(mouseX, mouseY, backButton)

    }

    handleTargetIndexClick(mouseX, mouseY) {

        const { backButton } = this.getTargetIndexLayout()
        if (this.isInsideButton(mouseX, mouseY, backButton)) {
            this.overlayController.closeAll()
            this.canvas.style.cursor = "default"
        }

    }

    getProgressMatrixLayout() {

        const panelWidth = Math.min(1060, this.canvas.width - 84)
        const panelHeight = Math.min(720, this.canvas.height - 72)
        const panelX = (this.canvas.width - panelWidth) / 2
        const panelY = (this.canvas.height - panelHeight) / 2
        const contentX = panelX + 24
        const contentY = panelY + 112
        const contentWidth = panelWidth - 48
        const contentHeight = panelHeight - 148
        const branchGap = 18
        const branchWidth = (contentWidth - branchGap) / 2

        return {
            panel: {
                x: panelX,
                y: panelY,
                width: panelWidth,
                height: panelHeight
            },
            content: {
                x: contentX,
                y: contentY,
                width: contentWidth,
                height: contentHeight
            },
            branches: {
                worldResonance: {
                    x: contentX,
                    y: contentY,
                    width: branchWidth
                },
                bossMastery: {
                    x: contentX + branchWidth + branchGap,
                    y: contentY,
                    width: branchWidth
                }
            },
            backButton: {
                x: panelX + 18,
                y: panelY + 18,
                width: 94,
                height: 36
            },
            titleY: panelY + 46
        }

    }

    getProgressMatrixCards() {

        const layout = this.getProgressMatrixLayout()
        const cards = []
        const cardGap = 10
        const branchNodeCount = 6
        const availableHeight = Math.max(320, layout.content.height - 26)
        const calculatedHeight = Math.floor(
            (availableHeight - (cardGap * (branchNodeCount - 1))) / branchNodeCount
        )
        const cardHeight = Math.max(58, Math.min(78, calculatedHeight))
        const branches = [
            { key: "worldResonance" },
            { key: "bossMastery" }
        ]

        for (const branch of branches) {
            const branchLayout = layout.branches[branch.key]
            const nodes = this.getProgressMatrixNodes().filter(node => node.branch === branch.key)

            for (let index = 0; index < nodes.length; index++) {
                const node = nodes[index]
                cards.push({
                    node,
                    branch: branch.key,
                    x: branchLayout.x,
                    y: branchLayout.y + 26 + (index * (cardHeight + cardGap)),
                    width: branchLayout.width,
                    height: cardHeight
                })
            }
        }

        return cards

    }

    getProgressMatrixHoveredCard(mouseX, mouseY) {

        const cards = this.getProgressMatrixCards()
        return cards.find(card => this.isInsideButton(mouseX, mouseY, card)) || null

    }

    isHoveringProgressMatrixBackButton(mouseX, mouseY) {

        const { backButton } = this.getProgressMatrixLayout()
        return this.isInsideButton(mouseX, mouseY, backButton)

    }

    handleProgressMatrixClick(mouseX, mouseY) {

        const { backButton } = this.getProgressMatrixLayout()
        if (this.isInsideButton(mouseX, mouseY, backButton)) {
            this.overlayController.closeAll()
            this.canvas.style.cursor = "default"
            return
        }

        const hoveredCard = this.getProgressMatrixHoveredCard(mouseX, mouseY)
        if (!hoveredCard) return

        const purchased = this.purchaseProgressNode(hoveredCard.node.id)
        if (!purchased) return

        this.canvas.style.cursor = "pointer"

    }

    resolveProgressMatrixIconId(nodeId) {

        switch (nodeId) {
            case "transportEfficiency1":
            case "transportEfficiency2":
                return "spawnRate"
            case "gateCalibration1":
            case "gateCalibration2":
                return "diversity"
            case "modifierInsight":
                return "targetValue"
            case "resonanceBuffer":
                return "amplitude"
            case "coreBreaker":
            case "phaseBurst":
                return "strength"
            case "adaptiveCoolant":
                return "fireRate"
            case "emergencyPlating":
                return "amplitude"
            case "phaseAnalysis":
                return "frequency"
            case "prepLogistics":
                return "targetValue"
            case "salvageProtocol":
                return "autoFire"
            default:
                return "strength"
        }

    }

    drawProgressMatrix(ctx) {

        const layout = this.getProgressMatrixLayout()
        const cards = this.getProgressMatrixCards()
        const hoveredCard = this.getProgressMatrixHoveredCard(this.mouseX, this.mouseY)
        const backHovered = this.isHoveringProgressMatrixBackButton(this.mouseX, this.mouseY)

        ctx.save()
        ctx.fillStyle = "rgba(0,0,0,0.75)"
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        const panelGradient = ctx.createLinearGradient(
            layout.panel.x,
            layout.panel.y,
            layout.panel.x,
            layout.panel.y + layout.panel.height
        )
        panelGradient.addColorStop(0, "rgba(20,27,46,0.95)")
        panelGradient.addColorStop(1, "rgba(11,16,29,0.95)")

        this.drawRoundedRectPath(
            ctx,
            layout.panel.x,
            layout.panel.y,
            layout.panel.width,
            layout.panel.height,
            16
        )
        ctx.fillStyle = panelGradient
        ctx.fill()

        ctx.shadowColor = "#9b5cff"
        ctx.shadowBlur = 18
        this.drawRoundedRectPath(
            ctx,
            layout.panel.x,
            layout.panel.y,
            layout.panel.width,
            layout.panel.height,
            16
        )
        ctx.strokeStyle = "rgba(155,92,255,0.6)"
        ctx.lineWidth = 1.5
        ctx.stroke()
        ctx.shadowBlur = 0

        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillStyle = "#f0e6ff"
        ctx.font = "bold 34px Arial"
        ctx.fillText("PROGRESS MATRIX", this.canvas.width / 2, layout.titleY)

        ctx.fillStyle = "#ffd87a"
        ctx.font = "bold 16px Arial"
        ctx.fillText(
            "Core Fragments: " + this.coreFragments,
            this.canvas.width / 2,
            layout.titleY + 30
        )

        this.drawRoundedRectPath(
            ctx,
            layout.backButton.x,
            layout.backButton.y,
            layout.backButton.width,
            layout.backButton.height,
            10
        )
        ctx.fillStyle = backHovered ? "rgba(155,92,255,0.30)" : "rgba(58,134,255,0.2)"
        ctx.fill()
        this.drawRoundedRectPath(
            ctx,
            layout.backButton.x,
            layout.backButton.y,
            layout.backButton.width,
            layout.backButton.height,
            10
        )
        ctx.strokeStyle = backHovered ? "rgba(155,92,255,0.88)" : "rgba(58,134,255,0.65)"
        ctx.lineWidth = 1.2
        ctx.stroke()
        ctx.fillStyle = "#eaf3ff"
        ctx.font = "bold 14px Arial"
        ctx.fillText(
            "BACK",
            layout.backButton.x + (layout.backButton.width / 2),
            layout.backButton.y + (layout.backButton.height / 2)
        )

        ctx.textAlign = "left"
        ctx.textBaseline = "alphabetic"
        ctx.fillStyle = "#8fd3ff"
        ctx.font = "bold 14px Arial"
        ctx.fillText("WORLD RESONANCE", layout.branches.worldResonance.x, layout.branches.worldResonance.y + 10)
        ctx.fillStyle = "#d2a7ff"
        ctx.fillText("BOSS MASTERY", layout.branches.bossMastery.x, layout.branches.bossMastery.y + 10)

        for (const card of cards) {
            const node = card.node
            const isPurchased = this.isProgressNodePurchased(node.id)
            const prerequisiteMet = !node.prerequisite || this.hasProgressNode(node.prerequisite)
            const isPurchasable = this.canPurchaseProgressNode(node)
            const isHovered = hoveredCard ? hoveredCard.node.id === node.id : false
            const iconId = this.resolveProgressMatrixIconId(node.id)

            this.drawUpgradeCard(
                ctx,
                card.x,
                card.y,
                card.width,
                card.height,
                {
                    title: node.title,
                    cost: node.description,
                    canAfford: isPurchasable,
                    selected: isPurchased,
                    unlocked: prerequisiteMet || isPurchased,
                    hovered: isHovered,
                    iconId,
                    stackSubtitle: true
                }
            )

            ctx.save()
            ctx.beginPath()
            this.drawRoundedRectPath(
                ctx,
                card.x,
                card.y,
                card.width,
                card.height,
                12
            )
            ctx.clip()

            const statusText = isPurchased
                ? "BOUGHT"
                : prerequisiteMet
                    ? "Cost: " + node.cost + " CF"
                    : "LOCKED"
            ctx.textAlign = "right"
            ctx.textBaseline = "bottom"
            ctx.font = "bold 12px Arial"
            ctx.fillStyle = isPurchased
                ? "#b7f3d1"
                : prerequisiteMet
                    ? (isPurchasable ? "#9ad3ff" : "rgba(255,255,255,0.65)")
                    : "rgba(255,255,255,0.42)"
            ctx.fillText(statusText, card.x + card.width - 12, card.y + card.height - 10)

            if (!isPurchased && node.prerequisite && !prerequisiteMet) {
                const prerequisiteNode = this.getProgressMatrixNodes().find(entry => entry.id === node.prerequisite)
                const prerequisiteTitle = prerequisiteNode ? prerequisiteNode.title : node.prerequisite
                ctx.textAlign = "left"
                ctx.font = "11px Arial"
                ctx.fillStyle = "rgba(255,255,255,0.42)"
                ctx.fillText(
                    "Requires: " + prerequisiteTitle,
                    card.x + 12,
                    card.y + card.height - 10
                )
            }
            ctx.restore()
        }

        ctx.restore()

    }

    handlePanelClick(mouseX, mouseY) {

        const headerButtons = this.getVisiblePanelHeaderButtons()
        for (const headerButton of headerButtons) {
            if (this.isInsideButton(mouseX, mouseY, headerButton)) {
                this.togglePanelSection(headerButton.sectionId)
                return
            }
        }

        if (!this.hasLaser) {

            if (!this.isPanelSectionExpanded("lasers")) return
            if (!this.isInsideButton(mouseX, mouseY, this.unlockButton)) return
            if (!this.economy.spend(this.simpleLaserCost)) return

            this.hasLaser = true
            this.triggerUpgradeFlash(this.unlockButton)

            this.floatingTexts.push(
                new FloatingText(
                    this.gridX + this.gridWidth / 2,
                    this.canvas.height / 2,
                    "Laser Unlocked"
                )
            )

            return
        }

        if (this.isPanelSectionExpanded("lasers")) {
            const visibleLaserTypes = this.getVisibleLaserTypes()
            for (const typeId of visibleLaserTypes) {
                const button = this.getLaserButton(typeId)
                if (!button || !this.isInsideButton(mouseX, mouseY, button)) {
                    continue
                }

                if (this.isLaserUnlocked(typeId)) {
                    this.switchLaserType(typeId)
                    return
                }

                if (this.isNextPurchasableLaser(typeId)) {
                    const purchased = this.tryPurchaseLaser(typeId)
                    if (!purchased) return

                    const laserName = LASER_TYPES[typeId]?.name || "Laser"
                    this.switchLaserType(typeId)
                    this.triggerUpgradeFlash(button)
                    this.floatingTexts.push(
                        new FloatingText(
                            this.gridX + this.gridWidth / 2,
                            this.canvas.height / 2 - 28,
                            laserName + " Unlocked"
                        )
                    )
                    return
                }
            }
        }

        if (this.isPanelSectionExpanded("mastery") && this.hasAnyLaserMasteryUnlocked()) {
            if (this.isLaserUnlocked("pulse") && this.isInsideButton(mouseX, mouseY, this.pulseMasteryButton)) {
                const purchased = this.upgradeSystem.buy("pulseMastery")
                if (purchased) this.triggerUpgradeFlash(this.pulseMasteryButton)
                return
            }

            if (this.isLaserUnlocked("scatter") && this.isInsideButton(mouseX, mouseY, this.scatterMasteryButton)) {
                const purchased = this.upgradeSystem.buy("scatterMastery")
                if (purchased) this.triggerUpgradeFlash(this.scatterMasteryButton)
                return
            }

            if (this.isLaserUnlocked("heavy") && this.isInsideButton(mouseX, mouseY, this.heavyMasteryButton)) {
                const purchased = this.upgradeSystem.buy("heavyMastery")
                if (purchased) this.triggerUpgradeFlash(this.heavyMasteryButton)
                return
            }
        }

        if (this.isPanelSectionExpanded("laserUpgrades")) {
            const laserUpgradeEntries = this.getRenderableLaserUpgradeEntries()
            for (const entry of laserUpgradeEntries) {
                if (!this.isInsideButton(mouseX, mouseY, entry.button)) {
                    continue
                }

                const purchased = this.upgradeSystem.buy(entry.id)
                if (purchased) this.triggerUpgradeFlash(entry.button)
                return
            }
        }

        if (this.isPanelSectionExpanded("targetEconomy")) {
            if (this.isInsideButton(mouseX, mouseY, this.targetValueButton)) {
                const purchased = this.targetUpgradeSystem.buy("value")
                if (purchased) this.triggerUpgradeFlash(this.targetValueButton)
                return
            }

            if (this.isInsideButton(mouseX, mouseY, this.targetSpawnRateButton)) {
                const purchased = this.targetUpgradeSystem.buy("spawnRate")
                if (purchased) this.triggerUpgradeFlash(this.targetSpawnRateButton)
                return
            }

            if (this.isInsideButton(mouseX, mouseY, this.targetDiversityButton)) {
                const purchased = this.targetUpgradeSystem.buy("diversity")
                if (purchased) this.triggerUpgradeFlash(this.targetDiversityButton)
                return
            }

            if (this.isInsideButton(mouseX, mouseY, this.clickDamageButton)) {
                const purchased = this.clickUpgradeSystem.buyClickUpgrade()
                if (purchased) this.triggerUpgradeFlash(this.clickDamageButton)
                return
            }
        }

        if (this.isPanelSectionExpanded("automation") && this.isInsideButton(mouseX, mouseY, this.autoFireButton)) {

            if (this.autoFireUnlocked) return
            if (!this.economy.spend(this.autoFireCost)) return

            this.autoFireUnlocked = true
            this.autoFireEnabled = true
            this.lastAutoShotTime = -Infinity
            this.triggerUpgradeFlash(this.autoFireButton)

            this.floatingTexts.push(
                new FloatingText(
                    this.gridX + this.gridWidth / 2,
                    this.canvas.height / 2 + 28,
                    "Auto Fire Online"
                )
            )

            return
        }

        if (
            this.isPanelSectionExpanded("world") &&
            this.transportReady &&
            !this.worldGatePurchased &&
            this.isInsideButton(mouseX, mouseY, this.worldGatePurchaseButton)
        ) {
            const worldGateCost = this.getWorldGateCost()
            if (!this.economy.spend(worldGateCost)) return

            this.worldGatePurchased = true
            this.triggerUpgradeFlash(this.worldGatePurchaseButton)

            this.floatingTexts.push(
                new FloatingText(
                    this.gridX + this.gridWidth / 2,
                    this.canvas.height / 2 + 14,
                    "World Gate Purchased",
                    "#9bf3ff"
                )
            )
            return
        }

        if (this.isPanelSectionExpanded("world") && this.isBossPrepPhase()) {
            if (!this.bossPrepShield && this.isInsideButton(mouseX, mouseY, this.bossPrepShieldButton)) {
                const shieldCost = this.getBossPrepCost(BOSS_PREP_SHIELD_COST)
                if (!this.economy.spend(shieldCost)) return
                this.bossPrepShield = true
                this.triggerUpgradeFlash(this.bossPrepShieldButton)
                this.floatingTexts.push(
                    new FloatingText(
                        this.gridX + this.gridWidth / 2,
                        this.canvas.height / 2 + 40,
                        "Shield Prepared",
                        "#9bf3ff"
                    )
                )
                return
            }

            if (!this.bossPrepOvercharger && this.isInsideButton(mouseX, mouseY, this.bossPrepOverchargerButton)) {
                const overchargerCost = this.getBossPrepCost(BOSS_PREP_OVERCHARGER_COST)
                if (!this.economy.spend(overchargerCost)) return
                this.bossPrepOvercharger = true
                this.triggerUpgradeFlash(this.bossPrepOverchargerButton)
                this.floatingTexts.push(
                    new FloatingText(
                        this.gridX + this.gridWidth / 2,
                        this.canvas.height / 2 + 40,
                        "Overcharger Primed",
                        "#ffb58f"
                    )
                )
                return
            }

            if (!this.bossPrepStabilizer && this.isInsideButton(mouseX, mouseY, this.bossPrepStabilizerButton)) {
                const stabilizerCost = this.getBossPrepCost(BOSS_PREP_STABILIZER_COST)
                if (!this.economy.spend(stabilizerCost)) return
                this.bossPrepStabilizer = true
                this.triggerUpgradeFlash(this.bossPrepStabilizerButton)
                this.floatingTexts.push(
                    new FloatingText(
                        this.gridX + this.gridWidth / 2,
                        this.canvas.height / 2 + 40,
                        "Stabilizer Tuned",
                        "#b2ccff"
                    )
                )
                return
            }
        }

    }

    isInsideButton(mouseX, mouseY, button) {

        return (
            mouseX >= button.x &&
            mouseX <= button.x + button.width &&
            mouseY >= button.y &&
            mouseY <= button.y + button.height
        )

    }

    triggerUpgradeFlash(button) {

        if (!button) return

        this.upgradeFlashEffects.push({
            x: button.x,
            y: button.y,
            width: button.width,
            height: button.height,
            life: 0.35,
            maxLife: 0.35
        })

    }

    getCardFlashIntensity(button) {

        if (!button || this.upgradeFlashEffects.length === 0) return 0

        let strongestRatio = 0

        for (const effect of this.upgradeFlashEffects) {
            if (
                effect.x === button.x &&
                effect.y === button.y &&
                effect.width === button.width &&
                effect.height === button.height
            ) {
                const ratio = effect.maxLife > 0 ? effect.life / effect.maxLife : 0
                if (ratio > strongestRatio) {
                    strongestRatio = ratio
                }
            }
        }

        return Math.max(0, Math.min(1, strongestRatio))

    }

    updateUpgradeFlashes(delta) {

        if (this.upgradeFlashEffects.length === 0) return

        for (const effect of this.upgradeFlashEffects) {
            effect.life -= delta
        }

        this.upgradeFlashEffects = this.upgradeFlashEffects.filter(effect => effect.life > 0)

    }

    drawUpgradeFlashes(ctx) {

        if (this.upgradeFlashEffects.length === 0) return

        for (const effect of this.upgradeFlashEffects) {
            const lifeRatio = effect.maxLife > 0 ? effect.life / effect.maxLife : 0
            const progress = 1 - lifeRatio
            const centerX = effect.x + (effect.width / 2)
            const centerY = effect.y + (effect.height / 2)
            const maxRadius = Math.max(effect.width, effect.height) * 0.9
            const radius = 16 + (maxRadius * progress)

            ctx.save()
            ctx.globalAlpha = Math.max(0, lifeRatio)
            ctx.globalCompositeOperation = "lighter"
            ctx.shadowColor = "rgba(155,92,255,0.35)"
            ctx.shadowBlur = 18 + (lifeRatio * 10)

            const burstGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
            burstGradient.addColorStop(0, "rgba(155,92,255,0.35)")
            burstGradient.addColorStop(0.55, "rgba(155,92,255,0.16)")
            burstGradient.addColorStop(1, "rgba(155,92,255,0)")

            ctx.fillStyle = burstGradient
            ctx.beginPath()
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
            ctx.fill()

            ctx.strokeStyle = "rgba(155,92,255,0.35)"
            ctx.lineWidth = 1 + (lifeRatio * 1.5)
            ctx.beginPath()
            ctx.arc(centerX, centerY, radius * 0.72, 0, Math.PI * 2)
            ctx.stroke()
            ctx.restore()
        }

    }

    fireLaser() {

        if (!this.hasLaser) return
        if (this.transportAnimating) return
        this.emitterRecoil = 6

        const laserType = LASER_TYPES[this.currentLaserType]
        const colors = laserType.colors ?? [laserType.color ?? "#3a5cff"]
        const basePhase = Math.random() * Math.PI * 2
        const createLaser = (phaseOffset = 0) => {
            const color = colors[Math.floor(Math.random() * colors.length)]
            const laser = new Laser(this, basePhase + phaseOffset, color)
            if (this.currentLaserType === "heavy") {
                const pierceCount = Math.max(1, Math.floor(this.heavyPierceCount || HEAVY_BASE_PIERCE_COUNT))
                laser.pierce = pierceCount
                laser.remainingPierce = pierceCount
                laser.piercedTargets = new WeakSet()
            }
            laser.fire()
            this.lasers.push(laser)
        }

        if (this.currentLaserType === "scatter") {
            const spacing = 8
            const beamCount = Math.max(1, Math.floor(this.scatterBeamCount || 1))
            const amplitude = Math.max(1, this.laserAmplitude)
            const centerIndex = (beamCount - 1) / 2

            for (let beamIndex = 0; beamIndex < beamCount; beamIndex++) {
                const offset = (beamIndex - centerIndex) * spacing
                const normalized = Math.max(-1, Math.min(1, offset / amplitude))
                const phaseOffset = Math.asin(normalized)
                createLaser(phaseOffset)
            }
            return
        }

        createLaser()

    }

    spawnPulseShockwave(x, y, radius = 80) {

        const baseRadius = Math.max(0, radius)
        const expandedRadius = Math.max(baseRadius, this.pulseShockwaveRadius || PULSE_SHOCKWAVE_BASE_RADIUS)

        this.pulseShockwaves.push({
            x,
            y,
            radius: expandedRadius,
            life: 0.25,
            maxLife: 0.25
        })

        if (expandedRadius <= baseRadius) {
            return
        }

        const baseRadiusSquared = baseRadius * baseRadius
        const expandedRadiusSquared = expandedRadius * expandedRadius
        const shockwaveDamage = 1

        for (let i = this.targets.length - 1; i >= 0; i--) {
            const target = this.targets[i]
            const dx = target.x - x
            const dy = target.y - y
            const distanceSquared = (dx * dx) + (dy * dy)

            if (distanceSquared <= baseRadiusSquared || distanceSquared > expandedRadiusSquared) {
                continue
            }

            if (!this.collisionSystem) continue

            this.collisionSystem.applyDamageToTarget(
                this.targets,
                i,
                shockwaveDamage,
                null,
                {
                    hitParticleCount: 2,
                    hitParticleColor: "#8be8ff",
                    destroyOptions: { allowPulseShockwave: false }
                }
            )
        }

    }

    updatePulseShockwaves(delta) {

        for (const shockwave of this.pulseShockwaves) {
            shockwave.life -= delta
        }
        this.pulseShockwaves = this.pulseShockwaves.filter(shockwave => shockwave.life > 0)

    }

    drawPulseShockwaves(ctx) {

        if (this.pulseShockwaves.length === 0) return

        ctx.save()
        ctx.beginPath()
        ctx.rect(this.gridX, 0, this.gridWidth, this.canvas.height)
        ctx.clip()

        for (const shockwave of this.pulseShockwaves) {
            const lifeRatio = Math.max(0, shockwave.life / shockwave.maxLife)
            const progress = 1 - lifeRatio
            const currentRadius = 10 + (shockwave.radius * progress)
            const alpha = lifeRatio * 0.28

            ctx.save()
            ctx.globalAlpha = alpha
            ctx.strokeStyle = "#8be8ff"
            ctx.lineWidth = 2 + (lifeRatio * 2)
            ctx.beginPath()
            ctx.arc(shockwave.x, shockwave.y, currentRadius, 0, Math.PI * 2)
            ctx.stroke()
            ctx.restore()
        }

        ctx.restore()

    }

    addTransportCharge(amount) {

        if (!Number.isFinite(amount) || amount <= 0) return
        if (this.transportReady) return

        let gainMultiplier = 1
        if (this.hasProgressNode("transportEfficiency1")) {
            gainMultiplier += 0.1
        }
        if (this.hasProgressNode("transportEfficiency2")) {
            gainMultiplier += 0.15
        }

        this.transportCharge += amount * gainMultiplier

        if (this.transportCharge >= this.transportChargeRequired) {
            this.transportCharge = this.transportChargeRequired
            this.transportReady = true
            if (this.transportReadyTime == null) {
                this.transportReadyTime = this.runTime
            }

            this.floatingTexts.push(
                new FloatingText(
                    this.gridX + this.gridWidth / 2,
                    this.canvas.height / 2,
                    "TRANSPORT READY",
                    "#9bf3ff"
                )
            )
        }

    }

    startTransportAnimation() {

        if (!this.transportReady) return
        if (!this.worldGatePurchased) return
        if (this.transportAnimating) return

        this.transportAnimating = true
        this.transportAnimationTime = 0

        this.floatingTexts.push(
            new FloatingText(
                this.gridX + this.gridWidth / 2,
                this.canvas.height / 2 + 26,
                "TRANSPORT ENGAGED",
                "#d9f8ff"
            )
        )

    }

    configureBossWeaponFromCurrentLaser() {

        const laserType = this.currentLaserType || "simple"
        const laserStrength = Math.max(1, this.laserStrength || 1)
        const laserFireRate = Math.max(0.5, this.laserFireRate || 1)

        let damage = laserStrength
        let cooldownBase = Math.max(0.08, 0.22 / laserFireRate)
        let hitWindow = 80
        let color = "#3a86ff"

        if (laserType === "plasma") {
            damage = laserStrength * 1.2
            cooldownBase = Math.max(0.09, 0.24 / laserFireRate)
            hitWindow = 84
            color = "#9b5cff"
        } else if (laserType === "pulse") {
            damage = laserStrength
            cooldownBase = Math.max(0.08, 0.2 / laserFireRate)
            hitWindow = 90 + (this.pulseMasteryLevel * 6)
            color = "#8be8ff"
        } else if (laserType === "scatter") {
            damage = laserStrength * 0.72
            cooldownBase = Math.max(0.06, 0.16 / laserFireRate)
            hitWindow = 105 + (this.scatterMasteryLevel * 4)
            color = "#c38bff"
        } else if (laserType === "heavy") {
            damage = laserStrength * (1.8 + (this.heavyMasteryLevel * 0.15))
            cooldownBase = Math.max(0.16, 0.34 / laserFireRate)
            hitWindow = 72
            color = "#ff8a8a"
        }

        if (this.hasProgressNode("coreBreaker")) {
            damage *= 1.1
        }

        if (this.hasProgressNode("adaptiveCoolant")) {
            cooldownBase *= 0.92
        }

        this.bossWeaponType = laserType
        this.bossWeaponDamage = Math.max(1, Math.round(damage))
        this.bossWeaponCooldownBase = cooldownBase
        this.bossWeaponHitWindow = hitWindow
        this.bossWeaponColor = color

    }

    configureBossBeamVisualFromCurrentLaser() {

        const laserType = this.currentLaserType || "simple"
        const baseWidth = Math.max(2, this.laserWidth || 3)
        const strength = Math.max(1, this.laserStrength || 1)

        this.bossBeamVisualWidth = baseWidth
        this.bossBeamVisualGlow = 1 + (strength * 0.03)
        this.bossBeamVisualAmplitude = 4.5
        this.bossBeamVisualFrequency = 0.018
        this.bossBeamVisualScatterCount = 1
        this.bossBeamVisualColorPrimary = "#5caeff"
        this.bossBeamVisualColorSecondary = "#d9f6ff"

        if (laserType === "plasma") {
            this.bossBeamVisualWidth = baseWidth * 1.15
            this.bossBeamVisualGlow = 1.45 + (strength * 0.05)
            this.bossBeamVisualAmplitude = 6.5
            this.bossBeamVisualFrequency = 0.021
            this.bossBeamVisualColorPrimary = "#b074ff"
            this.bossBeamVisualColorSecondary = "#f0d9ff"
            return
        }

        if (laserType === "pulse") {
            this.bossBeamVisualWidth = baseWidth * 1.05
            this.bossBeamVisualGlow = 1.2 + (strength * 0.04)
            this.bossBeamVisualAmplitude = 9 + (this.pulseMasteryLevel * 1.2)
            this.bossBeamVisualFrequency = 0.025
            this.bossBeamVisualColorPrimary = "#8be8ff"
            this.bossBeamVisualColorSecondary = "#e7feff"
            return
        }

        if (laserType === "scatter") {
            this.bossBeamVisualWidth = Math.max(1.5, baseWidth * 0.82)
            this.bossBeamVisualGlow = 1.08 + (strength * 0.03)
            this.bossBeamVisualAmplitude = 6
            this.bossBeamVisualFrequency = 0.022
            this.bossBeamVisualScatterCount = Math.max(3, Math.min(7, 3 + this.scatterMasteryLevel))
            this.bossBeamVisualColorPrimary = "#c38bff"
            this.bossBeamVisualColorSecondary = "#f6e5ff"
            return
        }

        if (laserType === "heavy") {
            this.bossBeamVisualWidth = (baseWidth * 1.6) + (this.heavyMasteryLevel * 0.35)
            this.bossBeamVisualGlow = 1.7 + (strength * 0.04) + (this.heavyMasteryLevel * 0.08)
            this.bossBeamVisualAmplitude = 2.2
            this.bossBeamVisualFrequency = 0.013
            this.bossBeamVisualColorPrimary = "#ff8a8a"
            this.bossBeamVisualColorSecondary = "#ffd6e0"
        }

    }

    drawBossFightBeam(ctx, emitterX, emitterY, beamStartX, beamEndX, flashRatio, options = {}) {

        const weaponType = this.bossWeaponType || "simple"
        const beamWidth = Math.max(1.4, (this.bossBeamVisualWidth || 3) * (options.widthMultiplier || 1))
        const beamGlow = Math.max(1, (this.bossBeamVisualGlow || 1) * (options.glowMultiplier || 1))
        const waveAmplitude = this.bossBeamVisualAmplitude || 0
        const waveFrequency = this.bossBeamVisualFrequency || 0.014
        const beamPhase = this.bossBeamVisualPhase || 0
        const primaryColor = options.primaryColor || this.bossBeamVisualColorPrimary || this.bossWeaponColor || "#3a86ff"
        const secondaryColor = options.secondaryColor || this.bossBeamVisualColorSecondary || "#d9f6ff"
        const explicitLaneOffsets = Array.isArray(options.laneOffsets) && options.laneOffsets.length > 0
            ? options.laneOffsets
            : null
        const laneCount = explicitLaneOffsets
            ? explicitLaneOffsets.length
            : weaponType === "scatter"
                ? Math.max(1, Math.floor(this.bossBeamVisualScatterCount || 1))
                : 1
        const laneSpacing = explicitLaneOffsets ? 0 : weaponType === "scatter" ? 4.5 : 0
        const segmentCount = 28

        const drawLanePath = (laneIndex) => {
            const laneCenter = laneIndex - ((laneCount - 1) / 2)
            const laneOffset = explicitLaneOffsets
                ? explicitLaneOffsets[laneIndex] || 0
                : laneCenter * laneSpacing

            ctx.beginPath()
            for (let segment = 0; segment <= segmentCount; segment++) {
                const t = segment / segmentCount
                const x = beamStartX + ((beamEndX - beamStartX) * t)
                let wobble = 0

                if (weaponType === "pulse") {
                    wobble = Math.sin((x * waveFrequency) + (beamPhase * 10) + (laneIndex * 0.7))
                        * waveAmplitude * (0.7 + (flashRatio * 0.3))
                } else if (weaponType === "scatter") {
                    wobble = Math.sin((x * waveFrequency) + (beamPhase * 8) + (laneIndex * 1.2))
                        * Math.max(0.8, waveAmplitude * 0.5)
                } else if (weaponType === "plasma") {
                    wobble = Math.sin((x * waveFrequency) + (beamPhase * 7))
                        * Math.max(0.4, waveAmplitude * 0.35)
                } else if (weaponType === "heavy") {
                    wobble = Math.sin((x * waveFrequency) + (beamPhase * 5))
                        * Math.min(1.1, waveAmplitude * 0.25)
                }

                const y = emitterY + laneOffset + wobble
                if (segment === 0) {
                    ctx.moveTo(x, y)
                } else {
                    ctx.lineTo(x, y)
                }
            }
        }

        ctx.save()
        ctx.globalCompositeOperation = "lighter"
        ctx.lineCap = "round"
        ctx.lineJoin = "round"

        ctx.globalAlpha = (0.16 + (weaponType === "heavy" ? 0.04 : 0)) * flashRatio
        ctx.strokeStyle = primaryColor
        ctx.lineWidth = beamWidth * (weaponType === "heavy" ? 5.4 : 4.2) * beamGlow
        for (let lane = 0; lane < laneCount; lane++) {
            drawLanePath(lane)
            ctx.stroke()
        }

        ctx.globalAlpha = (0.26 + (weaponType === "plasma" ? 0.04 : 0)) * flashRatio
        ctx.strokeStyle = secondaryColor
        ctx.lineWidth = beamWidth * (weaponType === "heavy" ? 3 : 2.4) * beamGlow
        for (let lane = 0; lane < laneCount; lane++) {
            drawLanePath(lane)
            ctx.stroke()
        }

        ctx.globalCompositeOperation = "source-over"
        ctx.globalAlpha = 0.25 + (flashRatio * 0.75)
        ctx.strokeStyle = weaponType === "heavy" ? "#ffe8ef" : secondaryColor
        ctx.lineWidth = beamWidth * (weaponType === "heavy" ? 1.2 : 1)
        for (let lane = 0; lane < laneCount; lane++) {
            drawLanePath(lane)
            ctx.stroke()
        }

        if (weaponType === "heavy") {
            ctx.globalAlpha = 0.22 + (flashRatio * 0.6)
            ctx.strokeStyle = "#ffffff"
            ctx.lineWidth = Math.max(1, beamWidth * 0.6)
            drawLanePath(0)
            ctx.stroke()
        }

        ctx.restore()

    }

    createBossPhaseUpgradeState() {

        return {
            activeIds: new Set(),
            shotCounter: 0,
            fractureStacks: 0,
            fractureTimer: 0,
            surgeCharge: 0,
            surgeReady: false,
            anchorLockTime: 0,
            counterphaseReady: false,
            pendingEchoShots: []
        }

    }

    resetBossPhaseUpgradeState() {

        this.bossPhaseUpgradeState = this.createBossPhaseUpgradeState()
        this.bossBeamFlashEvents = []

    }

    hasBossPhaseUpgrade(upgradeId) {

        return Boolean(this.bossPhaseUpgradeState?.activeIds?.has(upgradeId))

    }

    getBossPhaseUpgradePool() {

        return [
            {
                id: "burstCapacitor",
                title: "Burst Capacitor",
                description: "Every 4th shot becomes a high-energy burst beam.",
                iconId: "fireRate",
                impactIds: ["heavy", "plasma"]
            },
            {
                id: "echoLattice",
                title: "Echo Lattice",
                description: "Hits schedule a delayed echo beam for follow-up damage.",
                iconId: "frequency",
                impactIds: ["pulse", "heavy"]
            },
            {
                id: "prismSplitter",
                title: "Prism Splitter",
                description: "Shots project side-band lanes that widen your coverage.",
                iconId: "amplitude",
                impactIds: ["scatter", "plasma"]
            },
            {
                id: "resonanceFracture",
                title: "Resonance Fracture",
                description: "Consecutive hits crack the core and ramp your damage.",
                iconId: "strength",
                impactIds: ["heavy", "simple"]
            },
            {
                id: "surgeFeedback",
                title: "Surge Feedback",
                description: "Successful hits arm periodic surge shots with extra force.",
                iconId: "fireRate",
                impactIds: ["plasma", "pulse"]
            },
            {
                id: "phaseAnchor",
                title: "Phase Anchor",
                description: "Near misses graze the core and expose it to follow-up fire.",
                iconId: "frequency",
                impactIds: ["pulse", "simple"]
            },
            {
                id: "counterphaseGuard",
                title: "Counterphase Guard",
                description: "Taking a hit charges your next shot into a counter-surge.",
                iconId: "targetValue",
                impactIds: ["heavy", "scatter"]
            }
        ]

    }

    getBossPhaseChoiceWeight(choice) {

        if (!choice) return 0

        let weight = 1
        const weaponType = this.bossWeaponType || this.currentLaserType || "simple"
        const bossStyle = (this.activeBossConfig?.attackStyle) || "calibration"

        if (Array.isArray(choice.impactIds) && choice.impactIds.includes(weaponType)) {
            weight += 0.8
        }

        if (choice.id === "phaseAnchor" && bossStyle === "void") {
            weight += 0.7
        }
        if (choice.id === "prismSplitter" && bossStyle === "storm") {
            weight += 0.6
        }
        if (choice.id === "resonanceFracture" && bossStyle === "cryo") {
            weight += 0.65
        }
        if (choice.id === "surgeFeedback" && bossStyle === "storm") {
            weight += 0.45
        }
        if (choice.id === "counterphaseGuard" && this.bossPhase >= 2) {
            weight += 0.3
        }

        return weight

    }

    pickWeightedBossPhaseChoice(pool) {

        const totalWeight = pool.reduce((sum, choice) => sum + Math.max(0.05, this.getBossPhaseChoiceWeight(choice)), 0)
        if (totalWeight <= 0) {
            return pool.splice(Math.floor(Math.random() * pool.length), 1)[0]
        }

        let roll = Math.random() * totalWeight
        for (let i = 0; i < pool.length; i++) {
            roll -= Math.max(0.05, this.getBossPhaseChoiceWeight(pool[i]))
            if (roll <= 0) {
                return pool.splice(i, 1)[0]
            }
        }

        return pool.pop()

    }

    generateBossPhaseChoices() {

        const choicePool = this.getBossPhaseUpgradePool()
        const pool = [...choicePool]
        this.bossPhaseChoices = []

        for (let i = 0; i < 3 && pool.length > 0; i++) {
            this.bossPhaseChoices.push(this.pickWeightedBossPhaseChoice(pool))
        }

        if (this.hasProgressNode("phaseAnalysis")) {
            const highImpactIds = ["echoLattice", "prismSplitter", "surgeFeedback", "phaseAnchor"]
            const hasHighImpactChoice = this.bossPhaseChoices.some(choice => highImpactIds.includes(choice.id))

            if (!hasHighImpactChoice) {
                const candidate = choicePool.find(
                    choice => highImpactIds.includes(choice.id) &&
                        !this.bossPhaseChoices.some(existing => existing.id === choice.id)
                )

                if (candidate && this.bossPhaseChoices.length > 0) {
                    this.bossPhaseChoices[this.bossPhaseChoices.length - 1] = candidate
                }
            }
        }

    }

    applyBossPhaseChoice(choiceId) {

        if (!choiceId) return

        const upgradeState = this.bossPhaseUpgradeState || this.createBossPhaseUpgradeState()
        upgradeState.activeIds.add(choiceId)

        if (choiceId === "resonanceFracture") {
            upgradeState.fractureStacks = 0
            upgradeState.fractureTimer = 0
        } else if (choiceId === "surgeFeedback") {
            upgradeState.surgeCharge = 0
            upgradeState.surgeReady = false
        } else if (choiceId === "phaseAnchor") {
            upgradeState.anchorLockTime = 0
        } else if (choiceId === "counterphaseGuard") {
            upgradeState.counterphaseReady = false
        }

        this.bossAttackTimer = this.getBossPhaseAttackCooldown()
        this.bossPhaseChoiceActive = false
        this.bossPhaseChoices = []

    }

    openBossPhaseChoice() {

        this.bossPhaseChoiceActive = true
        this.generateBossPhaseChoices()

    }

    getBossPhaseChoiceCards() {

        if (!Array.isArray(this.bossPhaseChoices) || this.bossPhaseChoices.length === 0) {
            return []
        }

        const cardWidth = Math.min(460, this.canvas.width - 220)
        const cardHeight = 84
        const cardGap = 16
        const totalHeight = (cardHeight * this.bossPhaseChoices.length) + (cardGap * Math.max(0, this.bossPhaseChoices.length - 1))
        const startY = (this.canvas.height / 2) - (totalHeight / 2) + 30
        const cardX = (this.canvas.width / 2) - (cardWidth / 2)

        return this.bossPhaseChoices.map((choice, index) => ({
            choice,
            x: cardX,
            y: startY + (index * (cardHeight + cardGap)),
            width: cardWidth,
            height: cardHeight
        }))

    }

    getActiveBossPhaseUpgradeTitles() {

        const activeIds = this.bossPhaseUpgradeState?.activeIds
        if (!(activeIds instanceof Set) || activeIds.size === 0) {
            return []
        }

        const pool = this.getBossPhaseUpgradePool()
        return [...activeIds]
            .map(id => pool.find(choice => choice.id === id)?.title)
            .filter(Boolean)

    }

    getBossPhaseSignalStatus() {

        const upgradeState = this.bossPhaseUpgradeState || this.createBossPhaseUpgradeState()
        const parts = []

        if (upgradeState.fractureStacks > 0) {
            parts.push("Fracture x" + upgradeState.fractureStacks)
        }
        if (upgradeState.surgeReady) {
            parts.push("Surge Armed")
        } else if (upgradeState.surgeCharge > 0) {
            parts.push("Surge " + upgradeState.surgeCharge + "/3")
        }
        if (upgradeState.anchorLockTime > 0) {
            parts.push("Core Lock")
        }
        if (upgradeState.counterphaseReady) {
            parts.push("Counter Armed")
        }

        return parts.length > 0 ? parts.join(" | ") : "Stable"

    }

    getBossPhaseAttackCooldown() {

        const bossConfig = this.activeBossConfig || this.getCurrentWorldBossConfig()
        const configuredCooldowns = Array.isArray(bossConfig.phaseAttackCooldowns)
            ? bossConfig.phaseAttackCooldowns
            : null

        if (configuredCooldowns && configuredCooldowns.length >= 3) {
            if (this.bossPhase >= 3) return Math.max(0.2, configuredCooldowns[2] || 0.72)
            if (this.bossPhase >= 2) return Math.max(0.25, configuredCooldowns[1] || 0.95)
            return Math.max(0.3, configuredCooldowns[0] || 1.25)
        }

        if (this.bossPhase >= 3) return 0.72
        if (this.bossPhase >= 2) return 0.95
        return 1.25

    }

    spawnBossHazardLane(style = "cryo", targetY = null) {

        const minY = this.bossLaserMinY + 14
        const maxY = this.bossLaserMaxY - 14
        const laneY = Number.isFinite(targetY)
            ? Math.max(minY, Math.min(maxY, targetY))
            : minY + (Math.random() * (maxY - minY))
        const isCryo = style === "cryo"
        const laneHeight = isCryo
            ? 40 + (Math.random() * 18)
            : 32 + (Math.random() * 22)
        const laneLife = isCryo
            ? 1.5 + (Math.random() * 0.7)
            : 1.1 + (Math.random() * 0.9)

        this.bossHazardLanes.push({
            y: laneY,
            height: laneHeight,
            life: laneLife,
            maxLife: laneLife,
            style,
            grace: isCryo ? 0.35 : 0.24,
            hitCooldown: 0
        })

    }

    spawnBossPhaseAttack() {

        const bossConfig = this.activeBossConfig || this.getCurrentWorldBossConfig()
        const attackStyle = (bossConfig && bossConfig.attackStyle) || "calibration"
        const speedMultiplier = Number.isFinite(bossConfig.projectileSpeedMultiplier)
            ? bossConfig.projectileSpeedMultiplier
            : 1
        const radiusMultiplier = Number.isFinite(bossConfig.projectileRadiusMultiplier)
            ? bossConfig.projectileRadiusMultiplier
            : 1
        const spawnX = (this.canvas.width / 2) - 70
        const minY = this.bossLaserMinY
        const maxY = this.bossLaserMaxY
        const playerY = Math.max(minY, Math.min(maxY, this.bossLaserY))
        const clampY = (value) => Math.max(minY, Math.min(maxY, value))

        const pushProjectile = ({
            y,
            radius,
            speed,
            life = 4,
            alpha = 1
        }) => {
            this.bossProjectiles.push({
                x: spawnX,
                y: clampY(y),
                radius: radius * radiusMultiplier,
                speed: speed * speedMultiplier,
                life,
                alpha
            })
        }

        if (attackStyle === "storm") {
            const burstCount = this.bossPhase >= 3
                ? (Math.random() < 0.62 ? 3 : 2)
                : this.bossPhase >= 2
                    ? (Math.random() < 0.55 ? 2 : 1)
                    : (Math.random() < 0.3 ? 2 : 1)
            const spread = this.bossPhase >= 3 ? 130 : this.bossPhase >= 2 ? 100 : 78

            for (let i = 0; i < burstCount; i++) {
                const targetY = playerY + ((Math.random() - 0.5) * spread)
                pushProjectile({
                    y: targetY,
                    radius: 9 + (Math.random() * 4),
                    speed: 360 + (Math.random() * 110)
                })
            }

            if (Math.random() < (this.bossPhase >= 3 ? 0.4 : this.bossPhase >= 2 ? 0.26 : 0.12)) {
                return 0.18 + (Math.random() * 0.16)
            }
            return
        }

        if (attackStyle === "cryo") {
            const burstCount = this.bossPhase >= 3 ? 2 : 1
            const spread = this.bossPhase >= 3 ? 90 : 64
            const baseY = playerY + ((Math.random() - 0.5) * spread)

            for (let i = 0; i < burstCount; i++) {
                const offset = (i - ((burstCount - 1) / 2)) * (30 + (Math.random() * 16))
                pushProjectile({
                    y: baseY + offset,
                    radius: 13 + (Math.random() * 5),
                    speed: 250 + (Math.random() * 70)
                })
            }

            if (Math.random() < (this.bossPhase >= 2 ? 0.28 : 0.16)) {
                this.spawnBossHazardLane("cryo", baseY + ((Math.random() - 0.5) * 80))
            }
            return
        }

        if (attackStyle === "void") {
            const mirroredBurst = Math.random() < (this.bossPhase >= 2 ? 0.5 : 0.28)
            if (mirroredBurst) {
                const offset = 34 + (Math.random() * (this.bossPhase >= 3 ? 66 : 46))
                pushProjectile({
                    y: playerY - offset,
                    radius: 10 + (Math.random() * 5),
                    speed: 340 + (Math.random() * 120)
                })
                pushProjectile({
                    y: playerY + offset,
                    radius: 10 + (Math.random() * 5),
                    speed: 340 + (Math.random() * 120)
                })
                if (this.bossPhase >= 3 && Math.random() < 0.55) {
                    pushProjectile({
                        y: playerY + ((Math.random() - 0.5) * 30),
                        radius: 9 + (Math.random() * 4),
                        speed: 360 + (Math.random() * 120),
                        alpha: 0.55
                    })
                }
            } else {
                const burstCount = this.bossPhase >= 3 ? 3 : this.bossPhase >= 2 ? 2 : 1
                const spread = this.bossPhase >= 3 ? 170 : this.bossPhase >= 2 ? 130 : 92
                for (let i = 0; i < burstCount; i++) {
                    pushProjectile({
                        y: playerY + ((Math.random() - 0.5) * spread),
                        radius: 10 + (Math.random() * 4),
                        speed: 330 + (Math.random() * 120),
                        alpha: Math.random() < 0.25 ? 0.45 : 1
                    })
                }
            }

            if (Math.random() < (this.bossPhase >= 3 ? 0.45 : this.bossPhase >= 2 ? 0.3 : 0.16)) {
                this.spawnBossHazardLane("void", playerY + ((Math.random() - 0.5) * 130))
            }
            if (Math.random() < (this.bossPhase >= 3 ? 0.44 : 0.24)) {
                return 0.16 + (Math.random() * 0.16)
            }
            return
        }

        if (this.bossPhase >= 3) {
            const burstCount = Math.random() < 0.55 ? 3 : 2
            const baseY = clampY(playerY + ((Math.random() - 0.5) * 70))
            const spread = 34 + (Math.random() * 12)

            for (let i = 0; i < burstCount; i++) {
                const offset = (i - ((burstCount - 1) / 2)) * spread
                pushProjectile({
                    y: baseY + offset,
                    radius: 12 + (Math.random() * 4),
                    speed: 340 + (Math.random() * 90)
                })
            }
            return
        }

        if (this.bossPhase >= 2) {
            const baseY = clampY(playerY + ((Math.random() - 0.5) * 120))
            pushProjectile({
                y: baseY,
                radius: 10 + (Math.random() * 4),
                speed: 310 + (Math.random() * 85)
            })

            if (Math.random() < 0.35) {
                const offset = (22 + (Math.random() * 20)) * (Math.random() < 0.5 ? -1 : 1)
                pushProjectile({
                    y: baseY + offset,
                    radius: 10 + (Math.random() * 4),
                    speed: 310 + (Math.random() * 85)
                })
            }
            return
        }

        pushProjectile({
            y: minY + (Math.random() * (maxY - minY)),
            radius: 10 + (Math.random() * 4),
            speed: 280 + (Math.random() * 80)
        })

    }

    startBossFight() {

        this.runBossAttempts += 1
        this.gameState = GAME_STATE_BOSS
        this.bossFightActive = true
        this.pendingWorldLevel = this.worldLevel + 1
        this.bossTargetWorld = this.pendingWorldLevel
        this.activeBossConfig = this.getCurrentWorldBossConfig()
        const healthMultiplier = Number.isFinite(this.activeBossConfig.maxHealthMultiplier)
            ? this.activeBossConfig.maxHealthMultiplier
            : 1
        this.bossMaxHealth = Math.max(1, Math.round(300 * healthMultiplier))
        this.bossHealth = this.bossMaxHealth
        this.bossFightTimer = this.bossFightTimeLimit
        this.configureBossWeaponFromCurrentLaser()
        this.configureBossBeamVisualFromCurrentLaser()
        this.bossBeamVisualPhase = 0
        if (this.bossPrepOvercharger) {
            this.bossWeaponDamage = Math.max(1, Math.round(this.bossWeaponDamage * 1.25))
        }
        if (this.bossPrepStabilizer) {
            this.bossWeaponHitWindow += 18
        }
        this.bossLaserY = this.canvas.height / 2
        this.bossLaserCooldown = this.bossWeaponCooldownBase
        this.bossLaserCooldownTimer = 0
        this.bossShotFlashTime = 0
        this.resetBossPhaseUpgradeState()
        this.bossProjectiles = []
        this.bossHazardLanes = []
        this.bossHazardTimer = 0
        this.bossAttackTimer = this.getBossPhaseAttackCooldown()
        this.bossPlayerHits = 0
        this.bossMaxPlayerHits = 3 + (this.hasProgressNode("emergencyPlating") ? 1 : 0)
        this.bossHitFlashTime = 0
        this.bossPhase = 1
        this.bossPhaseChoiceActive = false
        this.bossPhaseTwoChoiceGiven = false
        this.bossPhaseThreeChoiceGiven = false
        this.bossPhaseChoices = []
        this.bossPhaseBuffDamage = 0
        this.bossPhaseBuffHitWindow = 0
        this.bossPhaseBuffCooldownMultiplier = 1
        this.bossPhaseBuffExtraLives = 0
        this.targets = []
        this.lasers = []
        this.pulseShockwaves = []

        this.floatingTexts.push(
            new FloatingText(
                this.gridX + this.gridWidth / 2,
                this.canvas.height * 0.28,
                this.getWorldBossName().toUpperCase(),
                "#ff9ca8"
            )
        )

    }

    applyBossPlayerHit(label = "HIT", color = "#ff8c8c") {

        const playerX = 70
        const playerY = this.bossLaserY

        if (this.bossPrepShield) {
            this.bossPrepShield = false
            this.bossHitFlashTime = 0.16

            this.floatingTexts.push(
                new FloatingText(
                    playerX + 30 + ((Math.random() - 0.5) * 12),
                    playerY + ((Math.random() - 0.5) * 14),
                    "SHIELD",
                    "#9bf3ff"
                )
            )
            return false
        }

        this.bossPlayerHits += 1
        this.bossHitFlashTime = 0.2

        this.floatingTexts.push(
            new FloatingText(
                playerX + 30 + ((Math.random() - 0.5) * 12),
                playerY + ((Math.random() - 0.5) * 14),
                label,
                color
            )
        )

        if (this.hasBossPhaseUpgrade("counterphaseGuard")) {
            this.bossPhaseUpgradeState.counterphaseReady = true
            this.floatingTexts.push(
                new FloatingText(
                    playerX + 56,
                    playerY - 20,
                    "COUNTER ARMED",
                    "#ffb8d6"
                )
            )
        }

        if (this.bossPlayerHits >= this.bossMaxPlayerHits) {
            this.failBossFight()
            return true
        }

        return false

    }

    updateBossFight(delta) {

        if (!this.bossFightActive) return

        const bossConfig = this.activeBossConfig || this.getCurrentWorldBossConfig()
        const attackStyle = (bossConfig && bossConfig.attackStyle) || "calibration"
        const healthRatio = this.bossMaxHealth > 0 ? this.bossHealth / this.bossMaxHealth : 0
        if (!this.bossPhaseChoiceActive) {
            if (!this.bossPhaseTwoChoiceGiven && healthRatio <= 0.66) {
                this.bossPhase = 2
                this.bossPhaseTwoChoiceGiven = true
                this.openBossPhaseChoice()
            } else if (!this.bossPhaseThreeChoiceGiven && healthRatio <= 0.33) {
                this.bossPhase = 3
                this.bossPhaseThreeChoiceGiven = true
                this.openBossPhaseChoice()
            }
        }

        this.bossShotFlashTime = Math.max(0, this.bossShotFlashTime - delta)
        this.bossHitFlashTime = Math.max(0, this.bossHitFlashTime - delta)
        this.updateBossBeamFlashEvents(delta)
        this.bossLaserY = Math.max(
            this.bossLaserMinY,
            Math.min(this.bossLaserMaxY, this.mouseY)
        )
        const phaseSpeedBase = this.bossWeaponType === "heavy"
            ? 2.4
            : this.bossWeaponType === "pulse"
                ? 5.4
                : this.bossWeaponType === "scatter"
                    ? 4.8
                    : this.bossWeaponType === "plasma"
                        ? 4.2
                        : 3.4
        this.bossBeamVisualPhase += delta * (phaseSpeedBase + (this.laserFireRate * 0.2))

        for (const text of this.floatingTexts) {
            text.update(delta)
        }
        this.floatingTexts = this.floatingTexts.filter(t => t.life > 0)

        if (this.bossPhaseChoiceActive) {
            return
        }

        const upgradeState = this.bossPhaseUpgradeState || this.createBossPhaseUpgradeState()
        upgradeState.fractureTimer = Math.max(0, upgradeState.fractureTimer - delta)
        if (upgradeState.fractureTimer <= 0) {
            upgradeState.fractureStacks = 0
        }
        upgradeState.anchorLockTime = Math.max(0, upgradeState.anchorLockTime - delta)

        for (const echoShot of upgradeState.pendingEchoShots) {
            echoShot.timer -= delta
        }
        this.firePendingBossEchoShots()
        if (!this.bossFightActive) {
            return
        }

        this.bossFightTimer = Math.max(0, this.bossFightTimer - delta)
        this.bossLaserCooldownTimer = Math.max(0, this.bossLaserCooldownTimer - delta)

        if (this.autoFireUnlocked && this.autoFireEnabled && !this.bossPhaseChoiceActive) {
            this.tryFireBossWeapon()
            if (!this.bossFightActive) {
                return
            }
        }

        const playerY = this.bossLaserY
        if (attackStyle === "cryo" || attackStyle === "void") {
            this.bossHazardTimer -= delta
            if (this.bossHazardTimer <= 0) {
                if (attackStyle === "cryo") {
                    this.spawnBossHazardLane("cryo", playerY + ((Math.random() - 0.5) * 110))
                    this.bossHazardTimer = 1.5 + (Math.random() * 0.7)
                } else {
                    const laneCount = this.bossPhase >= 3 && Math.random() < 0.4 ? 2 : 1
                    for (let i = 0; i < laneCount; i++) {
                        this.spawnBossHazardLane("void", playerY + ((Math.random() - 0.5) * 160))
                    }
                    this.bossHazardTimer = 1.2 + (Math.random() * 1.0)
                }
            }
        } else {
            this.bossHazardLanes = []
            this.bossHazardTimer = 0
        }

        for (let i = this.bossHazardLanes.length - 1; i >= 0; i--) {
            const lane = this.bossHazardLanes[i]
            lane.life -= delta
            lane.grace = Math.max(0, lane.grace - delta)
            lane.hitCooldown = Math.max(0, lane.hitCooldown - delta)

            if (lane.life <= 0) {
                this.bossHazardLanes.splice(i, 1)
                continue
            }

            const inLane = Math.abs(playerY - lane.y) <= (lane.height / 2)
            if (inLane && lane.grace <= 0 && lane.hitCooldown <= 0) {
                lane.hitCooldown = 0.9
                lane.life = 0

                const laneLabel = lane.style === "cryo" ? "FROST" : "RIFT"
                const laneColor = lane.style === "cryo" ? "#8be8ff" : "#ff92ff"
                if (this.applyBossPlayerHit(laneLabel, laneColor)) {
                    return
                }
            }
        }

        this.bossAttackTimer -= delta
        if (this.bossAttackTimer <= 0) {
            const followupDelay = this.spawnBossPhaseAttack()
            this.bossAttackTimer = Number.isFinite(followupDelay)
                ? followupDelay
                : this.getBossPhaseAttackCooldown()
        }

        const playerX = 70
        const playerRadius = 16

        for (let i = this.bossProjectiles.length - 1; i >= 0; i--) {
            const projectile = this.bossProjectiles[i]
            projectile.x -= projectile.speed * delta
            projectile.life -= delta

            if (projectile.life <= 0 || projectile.x + projectile.radius < 0) {
                this.bossProjectiles.splice(i, 1)
                continue
            }

            const dx = projectile.x - playerX
            const dy = projectile.y - playerY
            const hitDistance = projectile.radius + playerRadius
            if ((dx * dx) + (dy * dy) <= (hitDistance * hitDistance)) {
                this.bossProjectiles.splice(i, 1)
                if (this.applyBossPlayerHit("HIT", "#ff8c8c")) {
                    return
                }
            }
        }

        if (this.bossFightTimer <= 0) {
            this.failBossFight()
        }

    }

    resetBossCombatState(options = {}) {

        const clearPrep = options.clearPrep !== false

        this.pendingWorldLevel = null
        this.bossTargetWorld = null
        this.activeBossConfig = null
        this.bossHealth = 0
        this.bossMaxHealth = 0
        this.bossFightTimer = 0
        this.bossLaserCooldownTimer = 0
        this.bossShotFlashTime = 0
        this.bossBeamVisualPhase = 0
        this.bossProjectiles = []
        this.bossHazardLanes = []
        this.bossHazardTimer = 0
        this.bossAttackTimer = 0
        this.bossPlayerHits = 0
        this.bossMaxPlayerHits = 3
        this.bossHitFlashTime = 0
        this.bossPhase = 1
        this.bossPhaseChoiceActive = false
        this.bossPhaseTwoChoiceGiven = false
        this.bossPhaseThreeChoiceGiven = false
        this.bossPhaseChoices = []
        this.bossPhaseBuffDamage = 0
        this.bossPhaseBuffHitWindow = 0
        this.bossPhaseBuffCooldownMultiplier = 1
        this.bossPhaseBuffExtraLives = 0
        this.resetBossPhaseUpgradeState()

        if (clearPrep) {
            this.bossPrepShield = false
            this.bossPrepOvercharger = false
            this.bossPrepStabilizer = false
        }

    }

    winBossFight() {

        this.bossFightActive = false
        this.gameState = GAME_STATE_PLAYING
        this.runBossWins += 1
        const fragmentReward = this.getBossFragmentReward()
        this.coreFragments += fragmentReward
        this.runCoreFragmentsEarned += fragmentReward
        this.resetBossCombatState({ clearPrep: true })

        this.advanceWorld()

        this.floatingTexts.push(
            new FloatingText(
                this.gridX + (this.gridWidth * 0.5),
                this.canvas.height * 0.58,
                "+" + fragmentReward + " CORE FRAGMENT" + (fragmentReward === 1 ? "" : "S"),
                "#ffd87a"
            )
        )

    }

    failBossFight() {

        this.bossFightActive = false
        this.gameState = GAME_STATE_PLAYING
        this.runBossLosses += 1
        const transportChargeRetained = this.hasProgressNode("resonanceBuffer") ? 0.65 : 0.5
        this.transportCharge = Math.floor(this.transportCharge * transportChargeRetained)
        this.transportReady = this.transportCharge >= this.transportChargeRequired
        this.worldGatePurchased = false
        this.resetBossCombatState({ clearPrep: true })
        this.transportAnimating = false
        this.transportAnimationTime = 0

    }

    resetProgression() {

        this.economy.setRaw(0)
        this.resetRunTelemetry()

        this.clickDamage = 1
        this.clickUpgradeLevel = 0

        this.hasLaser = false
        this.plasmaUnlocked = false
        this.pulseUnlocked = false
        this.scatterUnlocked = false
        this.heavyUnlocked = false
        this.currentLaserType = "simple"

        this.autoFireUnlocked = false
        this.autoFireEnabled = false
        this.lastAutoShotTime = -Infinity
        this.lastManualShotTime = -Infinity

        this.sharedOscillatorLevels = this.createSharedOscillatorLevels()
        this.laserTypeStats = this.createLaserTypeStats()
        this.recalculateLaserTypeStats()

        this.targetUpgradeSystem.valueLevel = 0
        this.targetUpgradeSystem.spawnRateLevel = 0
        this.targetUpgradeSystem.diversityLevel = 0

        this.pulseMasteryLevel = 0
        this.scatterMasteryLevel = 0
        this.heavyMasteryLevel = 0

        if (this.upgradeSystem && typeof this.upgradeSystem.refreshMasteryEffects === "function") {
            this.upgradeSystem.refreshMasteryEffects()
        } else {
            this.scatterBeamCount = SCATTER_BASE_BEAM_COUNT
            this.heavyPierceCount = HEAVY_BASE_PIERCE_COUNT
            this.pulseShockwaveRadius = PULSE_SHOCKWAVE_BASE_RADIUS
        }

        this.laserOvercharge = 0
        this.worldGatePurchased = false
        this.bossPrepShield = false
        this.bossPrepOvercharger = false
        this.bossPrepStabilizer = false
        this.bossFightActive = false
        this.resetBossCombatState({ clearPrep: true })
        this.targets = []
        this.lasers = []
        this.floatingTexts = []
        this.pulseShockwaves = []

    }

    giveStarterLoadout(worldLevel) {

        if (!Number.isFinite(worldLevel)) return

        this.hasLaser = true

        if (worldLevel === 1) {
            this.currentLaserType = "simple"
            this.lastAutoShotTime = -Infinity
            this.lastManualShotTime = -Infinity
            this.fireInterval = 1 / this.laserFireRate
            return
        }

        if (worldLevel === 2) {
            this.pulseUnlocked = true
            this.currentLaserType = "pulse"
            this.lastAutoShotTime = -Infinity
            this.lastManualShotTime = -Infinity
            this.fireInterval = 1 / this.laserFireRate
            return
        }

        if (worldLevel >= 3) {
            this.plasmaUnlocked = true
            this.currentLaserType = "plasma"
            this.lastAutoShotTime = -Infinity
            this.lastManualShotTime = -Infinity
            this.fireInterval = 1 / this.laserFireRate
        }

    }

    advanceWorld() {

        this.worldLevel += 1
        this.worldPointMultiplier *= WORLD_POINT_MULTIPLIER_GROWTH
        this.resetProgression()
        this.giveStarterLoadout(this.worldLevel)
        this.generateWorldModifiers()
        this.transportCharge = 0
        this.transportReady = false
        this.worldGatePurchased = false
        this.transportChargeRequired = Math.floor(this.transportChargeRequired * TRANSPORT_CHARGE_GROWTH)
        this.transportBeam.particles = []
        this.spawnSystem.baseSpawnRate *= WORLD_SPAWN_RATE_GROWTH

        this.floatingTexts.push(
            {
                x: this.gridX + this.gridWidth / 2,
                y: this.canvas.height / 2,
                text: "ENTERING " + this.getCurrentWorldName().toUpperCase(),
                life: 1.2,
                duration: 1.2,
                driftSpeed: 18,
                update(delta) {
                    this.y -= this.driftSpeed * delta
                    this.life -= delta
                },
                draw(ctx) {
                    const alpha = Math.max(0, this.life / this.duration)

                    ctx.save()
                    ctx.globalAlpha = alpha
                    ctx.textAlign = "center"
                    ctx.textBaseline = "middle"
                    ctx.font = "bold 52px Arial"
                    ctx.shadowColor = "#8fdcff"
                    ctx.shadowBlur = 26
                    ctx.fillStyle = "#e8fbff"
                    ctx.fillText(this.text, this.x, this.y)

                    ctx.shadowBlur = 0
                    ctx.strokeStyle = "#5eb7ff"
                    ctx.lineWidth = 2
                    ctx.strokeText(this.text, this.x, this.y)
                    ctx.restore()
                }
            }
        )

    }

    getManualFireInterval() {

        const baseFireRate = LASER_TYPES[this.currentLaserType].baseFireRate
        const fireRateMultiplier = this.laserFireRate / baseFireRate

        return this.baseManualFireCooldown / fireRateMultiplier

    }

    handleGridClick(mouseX, mouseY) {

        if (this.transportReady && this.transportBeam.isPointInside(mouseX, mouseY)) {
            this.startTransportAnimation()
            return
        }

        if (this.transportAnimating) return

        // 1. Check if clicking a target
        for (let i = this.targets.length - 1; i >= 0; i--) {

            const target = this.targets[i]

            const dx = mouseX - target.x
            const dy = mouseY - target.y

            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < target.radius) {

                this.particleSystem.spawnExplosion(target.x, target.y, 4, "#ff7a4d")

                if (this.collisionSystem) {
                    const damageResult = this.collisionSystem.applyDamageToTarget(
                        this.targets,
                        i,
                        this.clickDamage,
                        null,
                        {
                            spawnHitParticles: false,
                            destroyOptions: { allowPulseShockwave: false }
                        }
                    )

                    if (damageResult.dealt > 0) {
                        const displayedDamage = Number.isInteger(damageResult.dealt)
                            ? damageResult.dealt
                            : damageResult.dealt.toFixed(1)

                        this.floatingTexts.push(
                            new FloatingText(
                                target.x + (Math.random() - 0.5) * 10,
                                target.y + (Math.random() - 0.5) * 10,
                                "-" + displayedDamage,
                                "#ff9a66"
                            )
                        )
                    }
                } else {
                    this.floatingTexts.push(
                        new FloatingText(
                            target.x + (Math.random() - 0.5) * 10,
                            target.y + (Math.random() - 0.5) * 10,
                            "-" + this.clickDamage,
                            "#ff9a66"
                        )
                    )
                }

                return
            }
        }

        // 2. Fire laser if owned
        if (this.hasLaser) {
            const now = performance.now() / 1000
            const manualFireInterval = this.getManualFireInterval()

            if (now - this.lastManualShotTime < manualFireInterval) {
                return
            }

            this.lastManualShotTime = now
            this.fireLaser()
        }
    }

    queueBossBeamFlash(options = {}) {

        const duration = Number.isFinite(options.duration) ? options.duration : 0.08

        this.bossBeamFlashEvents.push({
            y: Number.isFinite(options.y) ? options.y : this.bossLaserY,
            laneOffsets: Array.isArray(options.laneOffsets) ? [...options.laneOffsets] : null,
            widthMultiplier: Number.isFinite(options.widthMultiplier) ? options.widthMultiplier : 1,
            glowMultiplier: Number.isFinite(options.glowMultiplier) ? options.glowMultiplier : 1,
            primaryColor: options.primaryColor || null,
            secondaryColor: options.secondaryColor || null,
            life: duration,
            maxLife: duration
        })

    }

    updateBossBeamFlashEvents(delta) {

        if (!Array.isArray(this.bossBeamFlashEvents)) {
            this.bossBeamFlashEvents = []
            return
        }

        for (let i = this.bossBeamFlashEvents.length - 1; i >= 0; i--) {
            const event = this.bossBeamFlashEvents[i]
            event.life -= delta

            if (event.life <= 0) {
                this.bossBeamFlashEvents.splice(i, 1)
            }
        }

    }

    getBossPrismLaneOffsets(isEcho = false) {

        if (this.bossWeaponType === "scatter") {
            return isEcho
                ? [-18, -6, 6, 18]
                : [-24, -10, 0, 10, 24]
        }

        if (this.bossWeaponType === "heavy") {
            return isEcho ? [-12, 0, 12] : [-16, 0, 16]
        }

        if (this.bossWeaponType === "pulse") {
            return isEcho ? [-16, 0, 16] : [-20, 0, 20]
        }

        return isEcho ? [-14, 0, 14] : [-18, 0, 18]

    }

    getBossEchoDamageMultiplier() {

        if (this.bossWeaponType === "pulse") return 0.55
        if (this.bossWeaponType === "heavy") return 0.5
        if (this.bossWeaponType === "plasma") return 0.48
        if (this.bossWeaponType === "scatter") return 0.42
        return 0.45

    }

    createBossShotProfile(options = {}) {

        const upgradeState = this.bossPhaseUpgradeState || this.createBossPhaseUpgradeState()
        const isEcho = Boolean(options.isEcho)
        const emitterY = Number.isFinite(options.emitterY) ? options.emitterY : this.bossLaserY
        const tags = []
        const profile = {
            emitterY,
            isEcho,
            baseDamage: this.bossWeaponDamage || this.clickDamage || 1,
            damageMultiplier: 1 + (this.bossPhaseBuffDamage || 0),
            damageFlat: 0,
            hitWindow: (this.bossWeaponHitWindow || 80) + (this.bossPhaseBuffHitWindow || 0),
            cooldownMultiplier: this.bossPhaseBuffCooldownMultiplier || 1,
            laneOffsets: null,
            widthMultiplier: 1,
            glowMultiplier: 1,
            primaryColor: null,
            secondaryColor: null,
            grazeWindow: 0,
            tags,
            canQueueEcho: !isEcho
        }

        if (!isEcho) {
            upgradeState.shotCounter += 1
        }

        if (this.hasBossPhaseUpgrade("prismSplitter")) {
            profile.laneOffsets = this.getBossPrismLaneOffsets(isEcho)
            profile.hitWindow += this.bossWeaponType === "scatter" ? 10 : 6
            profile.widthMultiplier *= this.bossWeaponType === "heavy" ? 1.05 : 1.02
        }

        if (this.hasBossPhaseUpgrade("resonanceFracture") && upgradeState.fractureStacks > 0) {
            profile.damageMultiplier += upgradeState.fractureStacks * 0.1
            profile.hitWindow += upgradeState.fractureStacks * 3
        }

        if (upgradeState.anchorLockTime > 0) {
            profile.damageMultiplier += 0.18
            profile.hitWindow += 18
            profile.primaryColor = "#ff9ef4"
            profile.secondaryColor = "#ffe3fb"
            tags.push("LOCK")
        }

        if (this.hasBossPhaseUpgrade("phaseAnchor") && !isEcho) {
            profile.grazeWindow = 34
        }

        if (this.hasBossPhaseUpgrade("surgeFeedback") && upgradeState.surgeReady && !isEcho) {
            profile.damageMultiplier += 0.55
            profile.hitWindow += 12
            profile.cooldownMultiplier *= 0.72
            profile.widthMultiplier *= 1.16
            profile.glowMultiplier *= 1.18
            profile.primaryColor = "#ffd27a"
            profile.secondaryColor = "#fff3cf"
            tags.push("SURGE")
            upgradeState.surgeReady = false
        }

        if (this.hasBossPhaseUpgrade("burstCapacitor") && !isEcho && upgradeState.shotCounter % 4 === 0) {
            profile.damageMultiplier += 0.7
            profile.hitWindow += 16
            profile.widthMultiplier *= 1.2
            profile.glowMultiplier *= 1.22
            profile.primaryColor = "#ff9b55"
            profile.secondaryColor = "#ffe1bd"
            tags.push("BURST")
        }

        if (this.hasBossPhaseUpgrade("counterphaseGuard") && upgradeState.counterphaseReady && !isEcho) {
            profile.damageMultiplier += 0.45
            profile.hitWindow += 22
            profile.widthMultiplier *= 1.16
            profile.glowMultiplier *= 1.18
            profile.primaryColor = "#ff79ac"
            profile.secondaryColor = "#ffd7ea"
            tags.push("COUNTER")
            upgradeState.counterphaseReady = false
        }

        if (isEcho) {
            profile.damageMultiplier *= this.getBossEchoDamageMultiplier()
            profile.hitWindow += 8
            profile.widthMultiplier *= 0.92
            profile.glowMultiplier *= 0.96
            profile.primaryColor = profile.primaryColor || "#9fdfff"
            profile.secondaryColor = profile.secondaryColor || "#effcff"
            tags.push("ECHO")
        }

        return profile

    }

    applyBossShotHitEffects(profile, damage) {

        const upgradeState = this.bossPhaseUpgradeState || this.createBossPhaseUpgradeState()
        const bossX = this.canvas.width / 2
        const bossY = this.canvas.height / 2

        if (this.hasBossPhaseUpgrade("echoLattice") && profile.canQueueEcho) {
            upgradeState.pendingEchoShots.push({
                timer: 0.13,
                emitterY: profile.emitterY
            })
        }

        if (this.hasBossPhaseUpgrade("resonanceFracture")) {
            upgradeState.fractureStacks = Math.min(4, upgradeState.fractureStacks + 1)
            upgradeState.fractureTimer = 2.4

            this.floatingTexts.push(
                new FloatingText(
                    bossX + ((Math.random() - 0.5) * 36),
                    bossY - 26 + ((Math.random() - 0.5) * 12),
                    "FRACTURE " + upgradeState.fractureStacks,
                    "#ffd4f5"
                )
            )
        }

        if (this.hasBossPhaseUpgrade("surgeFeedback") && !profile.isEcho) {
            upgradeState.surgeCharge += 1
            if (upgradeState.surgeCharge >= 3) {
                upgradeState.surgeCharge = 0
                upgradeState.surgeReady = true

                this.floatingTexts.push(
                    new FloatingText(
                        bossX,
                        bossY - 42,
                        "SURGE ARMED",
                        "#ffe085"
                    )
                )
            }
        }

        if (profile.tags.length > 0) {
            this.floatingTexts.push(
                new FloatingText(
                    bossX + ((Math.random() - 0.5) * 28),
                    bossY - 46 + ((Math.random() - 0.5) * 10),
                    profile.tags.join(" "),
                    profile.primaryColor || "#d9e7ff"
                )
            )
        }

        if (this.bossHealth <= 0) {
            this.winBossFight()
        }

    }

    resolveBossShot(profile) {

        const bossX = this.canvas.width / 2
        const bossY = this.canvas.height / 2
        const laneOffsets = Array.isArray(profile.laneOffsets) && profile.laneOffsets.length > 0
            ? profile.laneOffsets
            : [0]
        let bestDistance = Infinity
        let hit = false

        for (const laneOffset of laneOffsets) {
            const laneDistance = Math.abs((profile.emitterY + laneOffset) - bossY)
            if (laneDistance < bestDistance) {
                bestDistance = laneDistance
            }
            if (laneDistance <= profile.hitWindow) {
                hit = true
            }
        }

        if (hit) {
            const damage = Math.max(
                1,
                Math.round((profile.baseDamage * profile.damageMultiplier) + profile.damageFlat)
            )
            this.bossHealth = Math.max(0, this.bossHealth - damage)
            this.recordDamageDealt(damage)

            this.floatingTexts.push(
                new FloatingText(
                    bossX + ((Math.random() - 0.5) * 40),
                    bossY + ((Math.random() - 0.5) * 30),
                    "-" + damage,
                    profile.primaryColor || "#ff8c8c"
                )
            )

            this.applyBossShotHitEffects(profile, damage)
            return true
        }

        if (profile.grazeWindow > 0 && bestDistance <= (profile.hitWindow + profile.grazeWindow)) {
            const grazeDamage = Math.max(
                1,
                Math.round((profile.baseDamage * 0.3) + Math.max(0, profile.damageFlat * 0.5))
            )

            this.bossHealth = Math.max(0, this.bossHealth - grazeDamage)
            this.recordDamageDealt(grazeDamage)
            this.bossPhaseUpgradeState.anchorLockTime = 1.35

            this.floatingTexts.push(
                new FloatingText(
                    bossX + ((Math.random() - 0.5) * 36),
                    bossY - 8 + ((Math.random() - 0.5) * 18),
                    "GRAZE",
                    "#ffc1ff"
                )
            )
            this.floatingTexts.push(
                new FloatingText(
                    bossX + ((Math.random() - 0.5) * 36),
                    bossY + 22 + ((Math.random() - 0.5) * 18),
                    "-" + grazeDamage,
                    "#ffb2ff"
                )
            )

            if (this.bossHealth <= 0) {
                this.winBossFight()
            }
            return true
        }

        if (this.hasBossPhaseUpgrade("resonanceFracture") && !profile.isEcho) {
            this.bossPhaseUpgradeState.fractureStacks = Math.max(0, this.bossPhaseUpgradeState.fractureStacks - 1)
            if (this.bossPhaseUpgradeState.fractureStacks <= 0) {
                this.bossPhaseUpgradeState.fractureTimer = 0
            }
        }

        this.floatingTexts.push(
            new FloatingText(
                this.canvas.width - 160 + ((Math.random() - 0.5) * 20),
                profile.emitterY + ((Math.random() - 0.5) * 16),
                "MISS",
                "#b8c7ff"
            )
        )

        return false

    }

    firePendingBossEchoShots() {

        const upgradeState = this.bossPhaseUpgradeState || this.createBossPhaseUpgradeState()
        if (!Array.isArray(upgradeState.pendingEchoShots) || upgradeState.pendingEchoShots.length === 0) {
            return
        }

        for (let i = upgradeState.pendingEchoShots.length - 1; i >= 0; i--) {
            const echoShot = upgradeState.pendingEchoShots[i]
            if (echoShot.timer > 0) continue

            const profile = this.createBossShotProfile({
                emitterY: echoShot.emitterY,
                isEcho: true
            })
            this.queueBossBeamFlash({
                y: profile.emitterY,
                laneOffsets: profile.laneOffsets,
                widthMultiplier: profile.widthMultiplier,
                glowMultiplier: profile.glowMultiplier,
                primaryColor: profile.primaryColor,
                secondaryColor: profile.secondaryColor,
                duration: 0.07
            })
            this.resolveBossShot(profile)
            upgradeState.pendingEchoShots.splice(i, 1)
        }

    }

    tryFireBossWeapon() {

        if (!this.bossFightActive) return false
        if (this.transportAnimating) return false
        if (this.bossPhaseChoiceActive) return false
        if (this.bossLaserCooldownTimer > 0) return false

        const profile = this.createBossShotProfile({ emitterY: this.bossLaserY, isEcho: false })
        const effectiveCooldown = Math.max(
            0.04,
            (this.bossWeaponCooldownBase || this.bossLaserCooldown || 0.18) * profile.cooldownMultiplier
        )

        this.bossLaserCooldown = effectiveCooldown
        this.bossLaserCooldownTimer = effectiveCooldown
        this.bossShotFlashTime = 0.08
        this.queueBossBeamFlash({
            y: profile.emitterY,
            laneOffsets: profile.laneOffsets,
            widthMultiplier: profile.widthMultiplier,
            glowMultiplier: profile.glowMultiplier,
            primaryColor: profile.primaryColor,
            secondaryColor: profile.secondaryColor
        })

        this.resolveBossShot(profile)

        return true

    }

    handleBossFightClick(mouseX = this.mouseX, mouseY = this.mouseY) {

        if (!this.bossFightActive) return
        if (this.transportAnimating) return
        if (this.bossPhaseChoiceActive) {
            const choiceCards = this.getBossPhaseChoiceCards()
            for (const card of choiceCards) {
                if (!this.isInsideButton(mouseX, mouseY, card)) {
                    continue
                }

                this.applyBossPhaseChoice(card.choice.id)
                this.floatingTexts.push(
                    new FloatingText(
                        this.canvas.width / 2,
                        this.canvas.height / 2 - 34,
                        card.choice.title + " Applied",
                        "#b8c7ff"
                    )
                )
                return
            }
            return
        }
        this.tryFireBossWeapon()

    }

    start() {

        requestAnimationFrame(this.loop.bind(this))

    }

    loop(time) {

        const delta = (time - this.lastTime) / 1000
        this.lastTime = time

        this.update(delta)
        this.render()

        requestAnimationFrame(this.loop.bind(this))

    }

    update(delta) {

        if (this.gameState === GAME_STATE_PLAYING || this.gameState === GAME_STATE_BOSS) {
            this.runTime += delta
            this.recentDamageWindow += delta

            if (this.recentDamageWindow > 3) {
                const normalization = 3 / this.recentDamageWindow
                this.recentDamageDealt *= normalization
                this.recentDamageWindow = 3
            }

            if (this.firstLaserUnlockTime == null && this.hasLaser) {
                this.firstLaserUnlockTime = this.runTime
            }
            if (this.transportReadyTime == null && this.transportReady) {
                this.transportReadyTime = this.runTime
            }
            if (
                this.worldGateAffordableTime == null &&
                this.economy.canAfford(this.getWorldGateCost())
            ) {
                this.worldGateAffordableTime = this.runTime
            }
        }

        if (this.gameState === GAME_STATE_TITLE) {
            this.updateTitleScene(delta)
            return
        }

        if (this.gameState === GAME_STATE_BOSS) {
            this.updateBossFight(delta)
            return
        }

        if (this.gameState !== GAME_STATE_PLAYING) {
            return
        }

        if (
            this.gameState === GAME_STATE_PLAYING &&
            !this.isMuted &&
            !this.currentMusic
        ) {
            this.playRandomMusic()
        }

        if (this.overlayController.getActiveOverlayName()) {
            return
        }

        if (this.isPaused) {
            return
        }

        const hasTimeWarp =
            this.activeWorldModifiers &&
            this.activeWorldModifiers.includes("timeWarp")
        let timeScale = 1
        if (hasTimeWarp) {
            timeScale = 0.65
        }
        const scaledDelta = delta * timeScale
        if (this.worldSystem && typeof this.worldSystem.update === "function") {
            this.worldSystem.update(scaledDelta)
        }
        this.updateGravityWells(scaledDelta)

        this.gridOffset += delta * 10
        if (this.gridOffset > 40) {
            this.gridOffset = 0
        }
        this.emitterRecoil *= Math.pow(0.85, scaledDelta * 60)
        if (this.emitterRecoil < 0.05) {
            this.emitterRecoil = 0
        }
        this.updateUpgradeFlashes(delta)
        this.transportBeam.update(delta)
        this.updatePulseShockwaves(scaledDelta)

        if (this.transportAnimating) {
            this.transportAnimationTime += delta

            for (const text of this.floatingTexts) {
                text.update(delta)
            }
            this.floatingTexts = this.floatingTexts.filter(t => t.life > 0)

            if (this.transportAnimationTime >= this.transportAnimationDuration) {
                this.transportAnimating = false
                this.transportAnimationTime = 0
                this.startBossFight()
            }

            return
        }

        this.laserOvercharge = Math.max(
            0,
            this.laserOvercharge - this.overchargeDecayRate * delta
        )

        this.spawnSystem.update(delta)
        this.updateAutoFire()

        for (let laser of this.lasers) {
            laser.update(scaledDelta)
        }
        this.lasers = this.lasers.filter(laser => laser.active)

        for (let target of this.targets) {
            target.gridLeftBoundary = this.gridX
            target.update(scaledDelta)
            this.applyGravityWellsToTarget(target, scaledDelta)
        }

        this.targets = this.targets.filter(target => !target.shouldRemove)
        this.collisionSystem.check()

        this.particleSystem.update(scaledDelta)

        for (let text of this.floatingTexts) {
            text.update(delta)
        }
        this.floatingTexts = this.floatingTexts.filter(t => t.life > 0)

        if (!this.saveSystemLoaded) {
            return
        }

        this.autoSaveTimer += delta

        while (this.autoSaveTimer >= this.autoSaveInterval) {
            this.autoSaveTimer -= this.autoSaveInterval
            this.saveSystem.save()
        }

    }

    updateAutoFire() {

        if (!this.hasLaser) return
        if (!this.autoFireEnabled) return
        if (this.transportAnimating) return

        const now = performance.now() / 1000
        const autoFireInterval = this.fireInterval * this.autoFireSpeedMultiplier

        if (now - this.lastAutoShotTime < autoFireInterval) {
            return
        }

        this.lastAutoShotTime = now
        this.fireLaser()

    }

    render() {

        if (this.gameState === GAME_STATE_TITLE) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

            const titleBgGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height)
            titleBgGradient.addColorStop(0, "#050914")
            titleBgGradient.addColorStop(1, "#0b1020")
            this.ctx.fillStyle = titleBgGradient
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

            this.ctx.save()
            this.ctx.strokeStyle = "rgba(58,134,255,0.12)"
            this.ctx.lineWidth = 1
            const titleGridSpacing = 42
            for (let x = 0; x <= this.canvas.width; x += titleGridSpacing) {
                this.ctx.beginPath()
                this.ctx.moveTo(x + 0.5, 0)
                this.ctx.lineTo(x + 0.5, this.canvas.height)
                this.ctx.stroke()
            }
            for (let y = 0; y <= this.canvas.height; y += titleGridSpacing) {
                this.ctx.beginPath()
                this.ctx.moveTo(0, y + 0.5)
                this.ctx.lineTo(this.canvas.width, y + 0.5)
                this.ctx.stroke()
            }
            this.ctx.restore()

            this.drawTitleScene(this.ctx)
            this.drawTitleScreen(this.ctx)
            this.overlayController.draw(this.ctx)
            if (this.showBalanceOverlay) {
                this.drawBalanceOverlay(this.ctx)
            }
            return
        }

        if (this.gameState === GAME_STATE_BOSS) {
            this.drawBossFightScreen(this.ctx)
            this.overlayController.draw(this.ctx)
            if (this.showBalanceOverlay) {
                this.drawBalanceOverlay(this.ctx)
            }
            return
        }

        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height)
        gradient.addColorStop(0, "#040712")
        gradient.addColorStop(1, "#0b1020")
        this.ctx.fillStyle = gradient
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        this.drawPanel()
        this.drawGrid()
        this.transportBeam.draw(this.ctx)
        this.drawGravityWells(this.ctx)

        this.ctx.save()
        this.ctx.beginPath()
        this.ctx.rect(this.gridX, 0, this.gridWidth, this.canvas.height)
        this.ctx.clip()
        for (let target of this.targets) {
            target.draw(this.ctx)
        }
        this.ctx.restore()

        this.ctx.save()
        this.ctx.beginPath()
        this.ctx.rect(this.gridX, 0, this.gridWidth, this.canvas.height)
        this.ctx.clip()

        this.drawLaserEmitter(this.ctx)
        for (let laser of this.lasers) {
            laser.draw(this.ctx)
        }
        this.drawPulseShockwaves(this.ctx)
        this.particleSystem.draw(this.ctx)

        this.ctx.restore()

        for (let text of this.floatingTexts) {
            text.draw(this.ctx)
        }

        this.drawMuteButton(this.ctx)
        this.drawPauseButton(this.ctx)

        if (this.showPauseMenu) {
            this.drawPauseMenu(this.ctx)
        }

        this.overlayController.draw(this.ctx)
        if (this.showBalanceOverlay) {
            this.drawBalanceOverlay(this.ctx)
        }
    }

    drawBalanceOverlay(ctx) {

        const panelX = this.gridX + 14
        const panelY = 14
        const panelWidth = Math.min(380, this.canvas.width - panelX - 14)
        const lineHeight = 15
        const gateCost = this.getWorldGateCost()
        const prepTotalCost =
            this.getBossPrepCost(BOSS_PREP_SHIELD_COST) +
            this.getBossPrepCost(BOSS_PREP_OVERCHARGER_COST) +
            this.getBossPrepCost(BOSS_PREP_STABILIZER_COST)
        const transportEfficiency = (this.hasProgressNode("transportEfficiency1") ? 10 : 0) +
            (this.hasProgressNode("transportEfficiency2") ? 15 : 0)
        const gateReduction = (this.hasProgressNode("gateCalibration1") ? 10 : 0) +
            (this.hasProgressNode("gateCalibration2") ? 15 : 0)
        const bossDamageBonus = this.hasProgressNode("coreBreaker") ? 10 : 0
        const prepDiscount = this.hasProgressNode("prepLogistics") ? 10 : 0
        const dpsEstimate = this.getRecentDpsEstimate()
        const bossCooldown = this.bossFightActive
            ? Math.max(
                0.04,
                (this.bossWeaponCooldownBase || this.bossLaserCooldown || 0.18) * this.bossPhaseBuffCooldownMultiplier
            )
            : (this.bossWeaponCooldownBase || 0.18)
        const lines = [
            "BALANCE OVERLAY",
            "Run Time: " + this.formatBalanceOverlayTime(this.runTime),
            "Points Earned: " + Math.floor(this.runPointsEarned),
            "Kills: " + this.runKills,
            "Recent DPS: " + dpsEstimate.toFixed(1),
            "First Laser: " + this.formatBalanceOverlayTime(this.firstLaserUnlockTime),
            "Transport Ready: " + this.formatBalanceOverlayTime(this.transportReadyTime),
            "Gate Affordable: " + this.formatBalanceOverlayTime(this.worldGateAffordableTime),
            "Gate Cost: " + gateCost,
            "Boss Attempts: " + this.runBossAttempts,
            "Boss Wins: " + this.runBossWins,
            "Boss Losses: " + this.runBossLosses,
            "Prep Total Cost: " + prepTotalCost,
            "Boss Weapon Damage: " + Math.max(1, Math.round(this.bossWeaponDamage || this.laserStrength || 1)),
            "Boss Weapon Cooldown: " + bossCooldown.toFixed(3) + "s",
            "Fragments Earned: " + this.runCoreFragmentsEarned,
            "Core Fragments Total: " + Math.floor(this.coreFragments),
            "Matrix Transport Eff: +" + transportEfficiency + "%",
            "Matrix Gate Reduction: -" + gateReduction + "%",
            "Matrix Boss Damage: +" + bossDamageBonus + "%",
            "Matrix Prep Discount: -" + prepDiscount + "%"
        ]
        const panelHeight = 16 + (lines.length * lineHeight) + 12

        ctx.save()
        this.drawRoundedRectPath(ctx, panelX, panelY, panelWidth, panelHeight, 10)
        ctx.fillStyle = "rgba(6,10,20,0.78)"
        ctx.fill()
        this.drawRoundedRectPath(ctx, panelX, panelY, panelWidth, panelHeight, 10)
        ctx.strokeStyle = "rgba(108,186,255,0.45)"
        ctx.lineWidth = 1
        ctx.stroke()

        ctx.textAlign = "left"
        ctx.textBaseline = "top"
        ctx.font = "12px monospace"

        for (let i = 0; i < lines.length; i++) {
            ctx.fillStyle = i === 0 ? "#9dd6ff" : "rgba(228,240,255,0.92)"
            ctx.fillText(lines[i], panelX + 12, panelY + 10 + (i * lineHeight))
        }

        ctx.restore()

    }

    drawBossFightScreen(ctx) {

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        const bossGradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height)
        bossGradient.addColorStop(0, "#12070d")
        bossGradient.addColorStop(1, "#06080f")
        ctx.fillStyle = bossGradient
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        const centerX = this.canvas.width / 2
        const centerY = this.canvas.height / 2
        const bossConfig = this.activeBossConfig || this.getCurrentWorldBossConfig()
        const attackStyle = (bossConfig && bossConfig.attackStyle) || "calibration"
        const phase = this.bossPhase || 1
        const phaseTime = performance.now() * 0.001
        const phasePulse = 0.5 + Math.sin(phaseTime * (phase >= 3 ? 6.2 : phase >= 2 ? 4.8 : 3.6)) * 0.5

        const phaseVisuals = {
            coreColor: bossConfig.bossCoreColor || "#8f1d34",
            haloColor: bossConfig.bossHaloColor || "#ff4d6d",
            centerColor: bossConfig.bossCenterColor || "#ffd7de",
            screenTint: bossConfig.arenaTint || "rgba(78,12,28,0.1)",
            outerGlowAlpha: phase >= 3 ? 0.3 : phase >= 2 ? 0.24 : 0.18,
            projectileGlowMultiplier: phase >= 3 ? 1.55 : phase >= 2 ? 1.25 : 1,
            projectileRadiusMultiplier: phase >= 3 ? 1.2 : phase >= 2 ? 1.08 : 1
        }
        const styleProjectileVisuals = attackStyle === "storm"
            ? {
                haloColor: "#ff78b5",
                coreColor: "#ffd6f4",
                centerColor: "#fff3ff",
                glowBoost: 1.18
            }
            : attackStyle === "cryo"
                ? {
                    haloColor: "#66dfff",
                    coreColor: "#9cecff",
                    centerColor: "#eaffff",
                    glowBoost: 1.08
                }
                : attackStyle === "void"
                    ? {
                        haloColor: "#ff6bda",
                        coreColor: "#ff9bf0",
                        centerColor: "#ffe8ff",
                        glowBoost: 1.28
                    }
                    : {
                        haloColor: phaseVisuals.haloColor,
                        coreColor: phaseVisuals.coreColor,
                        centerColor: phaseVisuals.centerColor,
                        glowBoost: 1
                    }

        ctx.save()
        const tintIntensity = phase >= 3 ? 1.75 : phase >= 2 ? 1.35 : 1
        ctx.globalAlpha = tintIntensity
        ctx.fillStyle = phaseVisuals.screenTint
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        const vignetteGradient = ctx.createRadialGradient(
            centerX,
            centerY,
            Math.min(this.canvas.width, this.canvas.height) * 0.14,
            centerX,
            centerY,
            Math.max(this.canvas.width, this.canvas.height) * 0.58
        )
        vignetteGradient.addColorStop(0, "rgba(255,255,255,0)")
        vignetteGradient.addColorStop(1, phase >= 3 ? "rgba(65,0,25,0.3)" : phase >= 2 ? "rgba(45,0,20,0.2)" : "rgba(28,0,14,0.14)")
        ctx.fillStyle = vignetteGradient
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        ctx.restore()

        ctx.save()
        const outerAuraRadius = 120 + ((phase - 1) * 20) + (phasePulse * (phase >= 3 ? 20 : phase >= 2 ? 12 : 8))
        ctx.globalAlpha = phaseVisuals.outerGlowAlpha + (phasePulse * 0.08)
        ctx.fillStyle = phaseVisuals.haloColor
        ctx.beginPath()
        ctx.arc(centerX, centerY, outerAuraRadius, 0, Math.PI * 2)
        ctx.fill()

        if (phase >= 2) {
            ctx.globalAlpha = (phase >= 3 ? 0.2 : 0.14) + (phasePulse * 0.06)
            ctx.fillStyle = phaseVisuals.haloColor
            ctx.beginPath()
            ctx.arc(centerX, centerY, outerAuraRadius + (phase >= 3 ? 34 : 22), 0, Math.PI * 2)
            ctx.fill()
        }

        ctx.globalAlpha = 0.95
        ctx.fillStyle = phaseVisuals.coreColor
        const shellRadius = 72 + ((phase - 1) * 6) + (phasePulse * (phase >= 3 ? 8 : 4))
        ctx.beginPath()
        ctx.arc(centerX, centerY, shellRadius, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = phaseVisuals.haloColor
        ctx.lineWidth = 4
        ctx.stroke()

        ctx.fillStyle = phaseVisuals.centerColor
        const coreRadius = 26 + (phase >= 3 ? 4 : phase >= 2 ? 2 : 0) + (phasePulse * (phase >= 3 ? 2.5 : 1.2))
        ctx.beginPath()
        ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        const upgradeState = this.bossPhaseUpgradeState || this.createBossPhaseUpgradeState()
        if (upgradeState.fractureStacks > 0 || upgradeState.anchorLockTime > 0) {
            ctx.save()

            if (upgradeState.fractureStacks > 0) {
                ctx.globalAlpha = 0.18 + (upgradeState.fractureStacks * 0.06)
                ctx.strokeStyle = "#ffd1ef"
                ctx.lineWidth = 2 + (upgradeState.fractureStacks * 0.35)
                ctx.beginPath()
                ctx.arc(centerX, centerY, shellRadius + 12 + (upgradeState.fractureStacks * 3), 0, Math.PI * 2)
                ctx.stroke()
            }

            if (upgradeState.anchorLockTime > 0) {
                const lockPulse = 0.45 + Math.sin(phaseTime * 12) * 0.2
                ctx.globalAlpha = 0.22 + lockPulse
                ctx.strokeStyle = "#ff9ef4"
                ctx.lineWidth = 2.2
                ctx.beginPath()
                ctx.arc(centerX, centerY, shellRadius + 24, 0, Math.PI * 2)
                ctx.stroke()
            }

            ctx.restore()
        }

        if (this.bossHazardLanes.length > 0) {
            ctx.save()
            const laneX = 24
            const laneWidth = this.canvas.width - 48

            for (const lane of this.bossHazardLanes) {
                const lifeRatio = lane.maxLife > 0
                    ? Math.max(0, Math.min(1, lane.life / lane.maxLife))
                    : 0
                const laneTop = lane.y - (lane.height / 2)
                const laneBottom = laneTop + lane.height
                const laneGradient = ctx.createLinearGradient(0, laneTop, 0, laneBottom)
                const isCryo = lane.style === "cryo"

                if (isCryo) {
                    laneGradient.addColorStop(0, "rgba(0,0,0,0)")
                    laneGradient.addColorStop(0.5, "rgba(120,236,255,0.55)")
                    laneGradient.addColorStop(1, "rgba(0,0,0,0)")
                } else {
                    laneGradient.addColorStop(0, "rgba(0,0,0,0)")
                    laneGradient.addColorStop(0.5, "rgba(255,120,240,0.5)")
                    laneGradient.addColorStop(1, "rgba(0,0,0,0)")
                }

                ctx.globalAlpha = (0.34 + ((phase - 1) * 0.08)) * Math.max(0.25, lifeRatio)
                if (lane.grace > 0) {
                    ctx.globalAlpha *= 0.72
                }
                ctx.fillStyle = laneGradient
                ctx.fillRect(laneX, laneTop, laneWidth, lane.height)

                ctx.globalAlpha = (0.42 + ((phase - 1) * 0.07)) * Math.max(0.22, lifeRatio)
                ctx.strokeStyle = isCryo ? "rgba(166,245,255,0.8)" : "rgba(255,158,255,0.78)"
                ctx.lineWidth = 1.2
                ctx.strokeRect(laneX, laneTop + 1, laneWidth, Math.max(2, lane.height - 2))
            }

            ctx.restore()
        }

        const emitterX = 70
        const emitterY = this.bossLaserY
        const emitterPulse = 0.5 + Math.sin(performance.now() * 0.006) * 0.5

        ctx.save()
        ctx.shadowColor = "#3a86ff"
        ctx.shadowBlur = 10 + (emitterPulse * 10)
        ctx.fillStyle = "rgba(58,134,255,0.25)"
        ctx.beginPath()
        ctx.arc(emitterX, emitterY, 16, 0, Math.PI * 2)
        ctx.fill()

        ctx.shadowBlur = 18
        ctx.fillStyle = "#3a86ff"
        ctx.beginPath()
        ctx.arc(emitterX, emitterY, 7, 0, Math.PI * 2)
        ctx.fill()

        ctx.shadowBlur = 0
        ctx.fillStyle = "rgba(58,134,255,0.22)"
        ctx.strokeStyle = "rgba(58,134,255,0.45)"
        ctx.lineWidth = 1
        ctx.fillRect(emitterX + 8, emitterY - 6, 18, 12)
        ctx.strokeRect(emitterX + 8, emitterY - 6, 18, 12)
        ctx.restore()

        if (this.bossHitFlashTime > 0) {
            const hitFlashRatio = this.bossHitFlashTime / 0.2
            ctx.save()
            ctx.globalAlpha = Math.max(0, Math.min(1, hitFlashRatio)) * 0.45
            ctx.fillStyle = "#ff4f6d"
            ctx.beginPath()
            ctx.arc(emitterX, emitterY, 28, 0, Math.PI * 2)
            ctx.fill()
            ctx.restore()
        }

        for (const beamFlash of this.bossBeamFlashEvents) {
            const flashRatio = beamFlash.maxLife > 0 ? beamFlash.life / beamFlash.maxLife : 0
            const beamStartX = emitterX + 24
            const beamEndX = this.canvas.width - 80
            this.drawBossFightBeam(
                ctx,
                emitterX,
                beamFlash.y,
                beamStartX,
                beamEndX,
                flashRatio,
                {
                    laneOffsets: beamFlash.laneOffsets,
                    widthMultiplier: beamFlash.widthMultiplier,
                    glowMultiplier: beamFlash.glowMultiplier,
                    primaryColor: beamFlash.primaryColor,
                    secondaryColor: beamFlash.secondaryColor
                }
            )
        }

        for (const projectile of this.bossProjectiles) {
            ctx.save()
            ctx.globalCompositeOperation = "lighter"

            const drawRadius = projectile.radius * phaseVisuals.projectileRadiusMultiplier
            const styleFlicker = attackStyle === "void"
                ? 0.82 + (Math.sin((phaseTime * 9) + (projectile.x * 0.02)) * 0.18)
                : 1
            const projectileAlpha = Number.isFinite(projectile.alpha) ? projectile.alpha : 1
            const glowRadius = drawRadius * 2.1 * phaseVisuals.projectileGlowMultiplier * styleProjectileVisuals.glowBoost
            ctx.globalAlpha = (0.26 + ((phase - 1) * 0.07)) * projectileAlpha * styleFlicker
            ctx.fillStyle = styleProjectileVisuals.haloColor
            ctx.beginPath()
            ctx.arc(projectile.x, projectile.y, glowRadius, 0, Math.PI * 2)
            ctx.fill()

            ctx.globalAlpha = 0.94 * projectileAlpha * styleFlicker
            ctx.fillStyle = styleProjectileVisuals.coreColor
            ctx.beginPath()
            ctx.arc(projectile.x, projectile.y, drawRadius, 0, Math.PI * 2)
            ctx.fill()

            ctx.globalAlpha = 0.95 * projectileAlpha
            ctx.fillStyle = styleProjectileVisuals.centerColor
            ctx.beginPath()
            ctx.arc(projectile.x, projectile.y, drawRadius * 0.45, 0, Math.PI * 2)
            ctx.fill()
            ctx.restore()
        }

        const barWidth = Math.min(520, this.canvas.width - 180)
        const barHeight = 20
        const barX = (this.canvas.width - barWidth) / 2
        const barY = 84
        const healthRatio = this.bossMaxHealth > 0
            ? Math.max(0, Math.min(1, this.bossHealth / this.bossMaxHealth))
            : 0

        ctx.fillStyle = "rgba(255,255,255,0.15)"
        ctx.fillRect(barX, barY, barWidth, barHeight)
        ctx.fillStyle = "#ff5d76"
        ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight)
        ctx.strokeStyle = "rgba(255,255,255,0.4)"
        ctx.lineWidth = 1
        ctx.strokeRect(barX, barY, barWidth, barHeight)

        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillStyle = "#f4eaff"
        ctx.font = "bold 34px Arial"
        ctx.fillText(this.getWorldBossName(), centerX, 46)

        ctx.fillStyle = "rgba(235,227,255,0.9)"
        ctx.font = "bold 15px Arial"
        ctx.fillText(this.getWorldBossSubtitle(), centerX, 68)

        ctx.fillStyle = "rgba(255,255,255,0.9)"
        ctx.font = "bold 16px Arial"
        ctx.fillText(
            "Time: " + Math.max(0, Math.ceil(this.bossFightTimer)) + "s",
            centerX,
            barY + barHeight + 24
        )
        ctx.fillText(
            "Health: " + Math.max(0, Math.ceil(this.bossHealth)) + " / " + Math.max(0, Math.ceil(this.bossMaxHealth)),
            centerX,
            barY + barHeight + 46
        )
        ctx.fillText(
            "Hits: " + this.bossPlayerHits + " / " + this.bossMaxPlayerHits,
            centerX,
            barY + barHeight + 68
        )
        ctx.fillText(
            "Phase: " + this.bossPhase,
            centerX,
            barY + barHeight + 90
        )
        const phaseStatus = this.bossPhase >= 3
            ? "Overload"
            : this.bossPhase >= 2
                ? "Destabilized"
                : "Calibration"
        ctx.fillText(
            "Status: " + phaseStatus,
            centerX,
            barY + barHeight + 112
        )
        const bossWeaponLabel = this.bossWeaponType === "plasma"
            ? "Plasma Laser"
            : this.bossWeaponType === "pulse"
                ? "Pulse Laser"
                : this.bossWeaponType === "scatter"
                    ? "Scatter Laser"
                    : this.bossWeaponType === "heavy"
                        ? "Heavy Laser"
                        : "Simple Laser"
        ctx.fillText(
            "Weapon: " + bossWeaponLabel,
            centerX,
            barY + barHeight + 134
        )
        ctx.font = "13px Arial"
        ctx.fillStyle = "rgba(232,239,255,0.82)"
        ctx.fillText(
            "Signal: " + this.getBossPhaseSignalStatus(),
            centerX,
            barY + barHeight + 154
        )

        const activeMutationTitles = this.getActiveBossPhaseUpgradeTitles()
        if (activeMutationTitles.length > 0) {
            ctx.fillStyle = "rgba(255,224,187,0.9)"
            ctx.fillText(
                "Mutations: " + activeMutationTitles.join(", "),
                centerX,
                barY + barHeight + 172
            )
        }

        ctx.font = "14px Arial"
        ctx.fillStyle = "rgba(230,240,255,0.85)"
        ctx.fillText(
            "Move your cursor vertically and click to fire at the boss core.",
            centerX,
            this.canvas.height - 42
        )

        if (this.bossPhaseChoiceActive) {
            const choiceCards = this.getBossPhaseChoiceCards()
            const panelWidth = Math.min(620, this.canvas.width - 140)
            const panelHeight = Math.min(440, this.canvas.height - 120)
            const panelX = (this.canvas.width - panelWidth) / 2
            const panelY = (this.canvas.height - panelHeight) / 2

            ctx.save()
            ctx.fillStyle = "rgba(6,10,18,0.76)"
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

            const overlayGradient = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelHeight)
            overlayGradient.addColorStop(0, "rgba(18,28,50,0.95)")
            overlayGradient.addColorStop(1, "rgba(10,16,32,0.95)")
            this.drawRoundedRectPath(ctx, panelX, panelY, panelWidth, panelHeight, 16)
            ctx.fillStyle = overlayGradient
            ctx.fill()

            this.drawRoundedRectPath(ctx, panelX, panelY, panelWidth, panelHeight, 16)
            ctx.strokeStyle = "rgba(155,92,255,0.45)"
            ctx.lineWidth = 1.2
            ctx.stroke()

            ctx.fillStyle = "#e8f3ff"
            ctx.font = "bold 24px Arial"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.fillText("PHASE " + this.bossPhase + " SIGNAL MUTATION", centerX, panelY + 48)

            ctx.fillStyle = "rgba(216,228,255,0.9)"
            ctx.font = "14px Arial"
            ctx.fillText(
                "Choose one temporary waveform rewrite before the fight continues",
                centerX,
                panelY + 76
            )

            for (const card of choiceCards) {
                const hovered = this.isInsideButton(this.mouseX, this.mouseY, card)
                this.drawUpgradeCard(
                    ctx,
                    card.x,
                    card.y,
                    card.width,
                    card.height,
                    {
                        title: card.choice.title,
                        cost: card.choice.description,
                        level: 0,
                        canAfford: true,
                        selected: false,
                        unlocked: true,
                        hovered,
                        flashIntensity: 0,
                        iconId: card.choice.iconId || "strength",
                        stackSubtitle: true
                    }
                )
            }
            ctx.restore()
        }

        for (const text of this.floatingTexts) {
            text.draw(ctx)
        }

    }

    drawLaserEmitter(ctx) {

        const baseX = this.gridX + 20
        const x = baseX - this.emitterRecoil
        const y = this.canvas.height / 2
        const pulse = 0.5 + Math.sin(performance.now() * 0.005) * 0.5
        const outerRadius = 18
        const innerRadius = 8
        const barrelLength = 18
        const barrelWidth = 14

        ctx.save()
        ctx.beginPath()
        ctx.rect(this.gridX, 0, this.gridWidth, this.canvas.height)
        ctx.clip()

        // Barrel extending into the playfield.
        ctx.fillStyle = "rgba(58,134,255,0.22)"
        ctx.strokeStyle = "rgba(58,134,255,0.45)"
        ctx.lineWidth = 1
        ctx.fillRect(x + 10, y - (barrelWidth / 2), barrelLength, barrelWidth)
        ctx.strokeRect(x + 10, y - (barrelWidth / 2), barrelLength, barrelWidth)

        // Outer emitter shell.
        ctx.shadowColor = "#3a86ff"
        ctx.shadowBlur = 10 + (pulse * 10)
        ctx.fillStyle = "rgba(58,134,255,0.25)"
        ctx.beginPath()
        ctx.arc(x, y, outerRadius, 0, Math.PI * 2)
        ctx.fill()

        // Inner energy core.
        ctx.shadowBlur = 18 + (pulse * 18)
        ctx.fillStyle = "#3a86ff"
        ctx.beginPath()
        ctx.arc(x, y, innerRadius, 0, Math.PI * 2)
        ctx.fill()

        ctx.restore()

    }

    updateGravityWells(delta) {

        const hasGravityWell =
            this.activeWorldModifiers &&
            this.activeWorldModifiers.includes("gravityWell")

        if (!hasGravityWell) {
            this.gravityWells = []
            this.gravityWellTimer = 0
            return
        }

        this.gravityWellTimer -= delta

        if (this.gravityWellTimer <= 0) {
            this.gravityWells.push({
                x: this.gridX + Math.random() * this.gridWidth,
                y: Math.random() * this.canvas.height,
                radius: 160,
                life: 6
            })

            this.gravityWellTimer = 7 + (Math.random() * 4)
        }

        for (const well of this.gravityWells) {
            well.life -= delta
        }
        this.gravityWells = this.gravityWells.filter(well => well.life > 0)

    }

    applyGravityWellsToTarget(target, delta) {

        if (!target || this.gravityWells.length === 0) return

        for (const well of this.gravityWells) {
            const dx = well.x - target.x
            const dy = well.y - target.y
            const dist = Math.sqrt((dx * dx) + (dy * dy))

            if (dist <= 0 || dist >= well.radius) continue

            const strength = (1 - (dist / well.radius)) * 60
            target.x += (dx / dist) * strength * delta
            target.y += (dy / dist) * strength * delta
        }

    }

    drawGravityWells(ctx) {

        if (this.gravityWells.length === 0) return

        ctx.save()
        ctx.beginPath()
        ctx.rect(this.gridX, 0, this.gridWidth, this.canvas.height)
        ctx.clip()

        for (const well of this.gravityWells) {
            const lifeRatio = Math.max(0, Math.min(1, well.life / 6))
            const coreRadius = well.radius * 0.5

            ctx.globalAlpha = 0.25 * lifeRatio
            ctx.strokeStyle = "#9b5cff"
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.arc(well.x, well.y, coreRadius, 0, Math.PI * 2)
            ctx.stroke()

            ctx.globalAlpha = 0.12 * lifeRatio
            ctx.beginPath()
            ctx.arc(well.x, well.y, coreRadius * 0.62, 0, Math.PI * 2)
            ctx.stroke()
        }

        ctx.restore()

    }

    updateTitleScene(delta) {

        this.titleTimer += delta

        if (!this.titleHeroLaser) {
            this.titleHeroLaser = {
                phase: 0,
                frequency: 0.006,
                amplitude: 34,
                width: 4,
                colorA: "#3a86ff",
                colorB: "#9b5cff",
                centerY: 305
            }
        }

        this.titleHeroLaser.phase += delta * 2.4
        this.titleHeroLaser._animatedAmplitude =
            this.titleHeroLaser.amplitude * (1 + (Math.sin(this.titleTimer * 1.35) * 0.18))
        this.titleHeroLaser._animatedWidth =
            this.titleHeroLaser.width * (1 + (Math.sin((this.titleTimer * 1.05) + 1.2) * 0.2))
        this.titleTargets = []

    }

    drawTitleScene(ctx) {

        ctx.save()

        const hero = this.titleHeroLaser
        if (hero) {
            const startX = 24
            const endX = this.canvas.width - 24
            const amplitude = hero._animatedAmplitude ?? hero.amplitude
            const beamWidth = hero._animatedWidth ?? hero.width

            ctx.beginPath()
            const startY = hero.centerY + Math.sin((startX * hero.frequency) + hero.phase) * amplitude
            ctx.moveTo(startX, startY)
            for (let x = startX; x <= endX; x += 5) {
                const y = hero.centerY + Math.sin((x * hero.frequency) + hero.phase) * amplitude
                ctx.lineTo(x, y)
            }

            const beamGradient = ctx.createLinearGradient(startX, 0, endX, 0)
            beamGradient.addColorStop(0, hero.colorA)
            beamGradient.addColorStop(1, hero.colorB)

            ctx.save()
            ctx.lineCap = "round"
            ctx.globalCompositeOperation = "lighter"

            ctx.globalAlpha = 0.08
            ctx.strokeStyle = hero.colorB
            ctx.lineWidth = beamWidth * 8
            ctx.stroke()

            ctx.globalAlpha = 0.2
            ctx.strokeStyle = hero.colorA
            ctx.lineWidth = beamWidth * 3.2
            ctx.stroke()

            ctx.globalCompositeOperation = "source-over"
            ctx.globalAlpha = 0.96
            ctx.strokeStyle = beamGradient
            ctx.lineWidth = beamWidth
            ctx.stroke()
            ctx.restore()
        }

        ctx.restore()

    }

    drawTitleButton(button, label, isDanger = false) {

        const ctx = this.ctx

        ctx.fillStyle = isDanger ? "#f0cdcd" : "#d7d7cf"
        ctx.fillRect(button.x, button.y, button.width, button.height)

        ctx.strokeStyle = isDanger ? "#8a2a2a" : "#222"
        ctx.lineWidth = 2
        ctx.strokeRect(button.x, button.y, button.width, button.height)

        ctx.fillStyle = isDanger ? "#6b1f1f" : "#111"
        ctx.font = "22px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(label, button.x + (button.width / 2), button.y + (button.height / 2))
        ctx.textAlign = "left"
        ctx.textBaseline = "alphabetic"

    }

    drawTitleScreen(ctx) {

        const buttons = this.getTitleButtons()
        const centerX = this.canvas.width / 2
        const pulse = 0.5 + Math.sin(performance.now() * 0.002) * 0.5

        ctx.save()
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.font = "bold 48px Arial"
        const logoGradient = ctx.createLinearGradient(centerX - 260, 0, centerX + 260, 0)
        logoGradient.addColorStop(0, "#3a86ff")
        logoGradient.addColorStop(1, "#9b5cff")
        ctx.fillStyle = logoGradient
        ctx.shadowColor = "#6ea6ff"
        ctx.shadowBlur = 16 + (pulse * 20)
        ctx.fillText("FREQUENCY CLICKER", centerX, 188)
        ctx.restore()

        ctx.fillStyle = "rgba(220,230,255,0.85)"
        ctx.font = "16px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText("Arcade Incremental Sinewave Combat", centerX, 236)

        const drawTitleCard = (button, title, iconId) => {
            const hovered = this.isInsideButton(this.mouseX, this.mouseY, button)
            this.drawUpgradeCard(
                ctx,
                button.x,
                button.y,
                button.width,
                button.height,
                {
                    title,
                    cost: "",
                    level: 0,
                    canAfford: true,
                    selected: false,
                    unlocked: true,
                    hovered,
                    flashIntensity: 0,
                    iconId
                }
            )
        }

        for (const button of buttons) {
            drawTitleCard(button, button.label, button.iconId)
        }

    }

    drawPauseButton(ctx) {

        if (this.gameState !== GAME_STATE_PLAYING) return
        if (this.showPauseMenu) return

        const button = this.pauseButton
        const hovered = this.isHoveringPauseButton(this.mouseX, this.mouseY)
        const gradient = ctx.createLinearGradient(button.x, button.y, button.x, button.y + button.height)
        gradient.addColorStop(0, hovered ? "rgba(255,255,255,0.13)" : "rgba(255,255,255,0.09)")
        gradient.addColorStop(1, hovered ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)")

        ctx.save()
        this.drawRoundedRectPath(ctx, button.x, button.y, button.width, button.height, 10)
        ctx.fillStyle = gradient
        ctx.fill()

        ctx.shadowColor = hovered ? "#9b5cff" : "#3a86ff"
        ctx.shadowBlur = hovered ? 16 : 12
        this.drawRoundedRectPath(ctx, button.x, button.y, button.width, button.height, 10)
        ctx.strokeStyle = hovered ? "rgba(155,92,255,0.85)" : "rgba(58,134,255,0.72)"
        ctx.lineWidth = 1.4
        ctx.stroke()

        ctx.shadowBlur = 0
        ctx.fillStyle = "#eaf3ff"
        ctx.font = "700 14px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText("PAUSE", button.x + (button.width / 2), button.y + (button.height / 2))
        ctx.restore()

    }

    drawMuteButton(ctx) {

        if (this.gameState !== GAME_STATE_PLAYING) return
        if (this.showPauseMenu) return

        const button = this.muteButton
        const hovered = this.isHoveringMuteButton(this.mouseX, this.mouseY)
        const gradient = ctx.createLinearGradient(button.x, button.y, button.x, button.y + button.height)
        gradient.addColorStop(0, hovered ? "rgba(255,255,255,0.13)" : "rgba(255,255,255,0.09)")
        gradient.addColorStop(1, hovered ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)")

        ctx.save()
        this.drawRoundedRectPath(ctx, button.x, button.y, button.width, button.height, 10)
        ctx.fillStyle = gradient
        ctx.fill()

        ctx.shadowColor = hovered ? "#9b5cff" : "#3a86ff"
        ctx.shadowBlur = hovered ? 16 : 12
        this.drawRoundedRectPath(ctx, button.x, button.y, button.width, button.height, 10)
        ctx.strokeStyle = hovered ? "rgba(155,92,255,0.85)" : "rgba(58,134,255,0.72)"
        ctx.lineWidth = 1.4
        ctx.stroke()

        ctx.shadowBlur = 0
        ctx.fillStyle = "#eaf3ff"
        ctx.font = "700 18px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(this.isMuted ? "X" : "♪", button.x + (button.width / 2), button.y + (button.height / 2))
        ctx.restore()

    }

    drawPauseMenuButton(ctx, button, hovered = false) {

        const radius = 12
        const gradient = ctx.createLinearGradient(button.x, button.y, button.x, button.y + button.height)
        gradient.addColorStop(0, hovered ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.07)")
        gradient.addColorStop(1, hovered ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)")

        ctx.save()
        this.drawRoundedRectPath(ctx, button.x, button.y, button.width, button.height, radius)
        ctx.fillStyle = gradient
        ctx.fill()

        ctx.shadowColor = hovered ? "#9b5cff" : "#3a86ff"
        ctx.shadowBlur = hovered ? 18 : 12
        this.drawRoundedRectPath(ctx, button.x, button.y, button.width, button.height, radius)
        ctx.strokeStyle = hovered ? "rgba(155,92,255,0.85)" : "rgba(58,134,255,0.65)"
        ctx.lineWidth = 1.4
        ctx.stroke()

        ctx.shadowBlur = 0
        ctx.fillStyle = "#eaf3ff"
        ctx.font = "700 15px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(button.label.toUpperCase(), button.x + (button.width / 2), button.y + (button.height / 2))
        ctx.restore()

    }

    drawPauseMenu(ctx) {

        ctx.save()
        ctx.fillStyle = "rgba(0,0,0,0.6)"
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        ctx.fillStyle = "#f0f6ff"
        ctx.font = "bold 54px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.shadowColor = "#3a86ff"
        ctx.shadowBlur = 24
        const centerY = this.canvas.height / 2
        const titleY = centerY - 250
        ctx.fillText("PAUSED", this.canvas.width / 2, titleY)
        ctx.shadowBlur = 0

        const buttons = this.getPauseMenuButtons()
        for (const button of buttons) {
            const hovered = this.isInsideButton(this.mouseX, this.mouseY, button)
            this.drawPauseMenuButton(ctx, button, hovered)
        }

        ctx.restore()

    }

    drawInfoScreen(ctx) {

        const layout = this.getInfoScreenLayout()
        const sections = this.getInfoSections()
        this.clampInfoScroll()

        ctx.save()
        ctx.fillStyle = "rgba(0,0,0,0.75)"
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        const panelGradient = ctx.createLinearGradient(
            layout.panel.x,
            layout.panel.y,
            layout.panel.x,
            layout.panel.y + layout.panel.height
        )
        panelGradient.addColorStop(0, "rgba(20,27,46,0.94)")
        panelGradient.addColorStop(1, "rgba(12,17,30,0.94)")

        this.drawRoundedRectPath(
            ctx,
            layout.panel.x,
            layout.panel.y,
            layout.panel.width,
            layout.panel.height,
            16
        )
        ctx.fillStyle = panelGradient
        ctx.fill()

        ctx.shadowColor = "#3a86ff"
        ctx.shadowBlur = 18
        this.drawRoundedRectPath(
            ctx,
            layout.panel.x,
            layout.panel.y,
            layout.panel.width,
            layout.panel.height,
            16
        )
        ctx.strokeStyle = "rgba(58,134,255,0.55)"
        ctx.lineWidth = 1.5
        ctx.stroke()
        ctx.shadowBlur = 0

        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillStyle = "#e9f3ff"
        ctx.font = "bold 34px Arial"
        ctx.fillText("INFO", this.canvas.width / 2, layout.titleY)

        const backHovered = this.isHoveringInfoBackButton(this.mouseX, this.mouseY)
        this.drawRoundedRectPath(
            ctx,
            layout.backButton.x,
            layout.backButton.y,
            layout.backButton.width,
            layout.backButton.height,
            10
        )
        ctx.fillStyle = backHovered ? "rgba(155,92,255,0.26)" : "rgba(58,134,255,0.20)"
        ctx.fill()
        this.drawRoundedRectPath(
            ctx,
            layout.backButton.x,
            layout.backButton.y,
            layout.backButton.width,
            layout.backButton.height,
            10
        )
        ctx.strokeStyle = backHovered ? "rgba(155,92,255,0.88)" : "rgba(58,134,255,0.65)"
        ctx.lineWidth = 1.2
        ctx.stroke()
        ctx.fillStyle = "#eaf3ff"
        ctx.font = "bold 14px Arial"
        ctx.fillText(
            "BACK",
            layout.backButton.x + (layout.backButton.width / 2),
            layout.backButton.y + (layout.backButton.height / 2)
        )

        ctx.save()
        ctx.beginPath()
        this.drawRoundedRectPath(
            ctx,
            layout.content.x - 10,
            layout.content.y - 10,
            layout.content.width + 20,
            layout.content.height + 20,
            12
        )
        ctx.clip()

        ctx.textAlign = "left"
        ctx.textBaseline = "top"
        let cursorY = layout.content.y - this.infoScroll
        const lineHeight = 20

        for (const section of sections) {
            ctx.fillStyle = "#9b5cff"
            ctx.font = "bold 15px Arial"
            ctx.fillText(section.title, layout.content.x, cursorY)
            cursorY += 22

            ctx.fillStyle = "rgba(230,240,255,0.9)"
            ctx.font = "16px Arial"
            const wrappedBody = this.wrapInfoText(ctx, section.body, layout.content.width)
            for (const line of wrappedBody) {
                ctx.fillText(line, layout.content.x, cursorY)
                cursorY += lineHeight
            }
            cursorY += 16
        }

        ctx.restore()

        const maxInfoScroll = this.getMaxInfoScroll()
        if (maxInfoScroll > 0) {
            const trackX = layout.content.x + layout.content.width + 10
            const trackY = layout.content.y
            const trackHeight = layout.content.height
            const thumbHeight = Math.max(40, (trackHeight * trackHeight) / this.getInfoContentHeight())
            const scrollRatio = this.infoScroll / maxInfoScroll
            const thumbY = trackY + (trackHeight - thumbHeight) * scrollRatio

            ctx.fillStyle = "rgba(255,255,255,0.12)"
            this.drawRoundedRectPath(ctx, trackX, trackY, 6, trackHeight, 3)
            ctx.fill()

            ctx.fillStyle = "rgba(155,92,255,0.75)"
            this.drawRoundedRectPath(ctx, trackX, thumbY, 6, thumbHeight, 3)
            ctx.fill()
        }

        ctx.restore()

    }

    drawTargetIndex(ctx) {

        const layout = this.getTargetIndexLayout()
        const entries = this.getTargetIndexEntries()
        this.clampTargetIndexScroll()

        ctx.save()
        ctx.fillStyle = "rgba(0,0,0,0.75)"
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        const panelGradient = ctx.createLinearGradient(
            layout.panel.x,
            layout.panel.y,
            layout.panel.x,
            layout.panel.y + layout.panel.height
        )
        panelGradient.addColorStop(0, "rgba(20,27,46,0.94)")
        panelGradient.addColorStop(1, "rgba(12,17,30,0.94)")

        this.drawRoundedRectPath(
            ctx,
            layout.panel.x,
            layout.panel.y,
            layout.panel.width,
            layout.panel.height,
            16
        )
        ctx.fillStyle = panelGradient
        ctx.fill()

        ctx.shadowColor = "#9b5cff"
        ctx.shadowBlur = 18
        this.drawRoundedRectPath(
            ctx,
            layout.panel.x,
            layout.panel.y,
            layout.panel.width,
            layout.panel.height,
            16
        )
        ctx.strokeStyle = "rgba(155,92,255,0.55)"
        ctx.lineWidth = 1.5
        ctx.stroke()
        ctx.shadowBlur = 0

        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillStyle = "#f0e6ff"
        ctx.font = "bold 34px Arial"
        ctx.fillText("TARGET INDEX", this.canvas.width / 2, layout.titleY)

        const backHovered = this.isHoveringTargetIndexBackButton(this.mouseX, this.mouseY)
        this.drawRoundedRectPath(
            ctx,
            layout.backButton.x,
            layout.backButton.y,
            layout.backButton.width,
            layout.backButton.height,
            10
        )
        ctx.fillStyle = backHovered ? "rgba(155,92,255,0.30)" : "rgba(58,134,255,0.20)"
        ctx.fill()
        this.drawRoundedRectPath(
            ctx,
            layout.backButton.x,
            layout.backButton.y,
            layout.backButton.width,
            layout.backButton.height,
            10
        )
        ctx.strokeStyle = backHovered ? "rgba(155,92,255,0.9)" : "rgba(58,134,255,0.65)"
        ctx.lineWidth = 1.2
        ctx.stroke()
        ctx.fillStyle = "#eaf3ff"
        ctx.font = "bold 14px Arial"
        ctx.fillText(
            "BACK",
            layout.backButton.x + (layout.backButton.width / 2),
            layout.backButton.y + (layout.backButton.height / 2)
        )

        ctx.save()
        ctx.beginPath()
        this.drawRoundedRectPath(
            ctx,
            layout.content.x - 10,
            layout.content.y - 10,
            layout.content.width + 20,
            layout.content.height + 20,
            12
        )
        ctx.clip()

        ctx.textAlign = "left"
        ctx.textBaseline = "middle"

        const rowHeight = 54
        let rowY = layout.content.y + 8 - this.targetIndexScroll

        for (const entry of entries) {
            const discovered = this.discoveredTargets.has(entry.id)

            if (rowY + rowHeight >= layout.content.y && rowY <= layout.content.y + layout.content.height) {
                this.drawRoundedRectPath(
                    ctx,
                    layout.content.x,
                    rowY,
                    layout.content.width,
                    rowHeight - 4,
                    8
                )
                ctx.fillStyle = discovered
                    ? "rgba(58,134,255,0.16)"
                    : "rgba(255,255,255,0.05)"
                ctx.fill()

                this.drawRoundedRectPath(
                    ctx,
                    layout.content.x,
                    rowY,
                    layout.content.width,
                    rowHeight - 4,
                    8
                )
                ctx.strokeStyle = discovered
                    ? "rgba(58,134,255,0.45)"
                    : "rgba(255,255,255,0.15)"
                ctx.lineWidth = 1
                ctx.stroke()

                const previewSize = 24
                const previewX = layout.content.x + 8
                const previewY = rowY + (((rowHeight - 4) - previewSize) / 2)
                this.drawTargetIndexPreview(
                    ctx,
                    entry.id,
                    previewX,
                    previewY,
                    previewSize,
                    discovered
                )

                if (discovered) {
                    const textX = layout.content.x + 42
                    ctx.font = "bold 15px Arial"
                    ctx.fillStyle = "#7dd3ff"
                    ctx.fillText("✔ " + entry.label, textX, rowY + 16)

                    ctx.font = "12px Arial"
                    ctx.fillStyle = "rgba(230,240,255,0.72)"
                    ctx.fillText(this.getTargetDescription(entry.id), textX, rowY + 34)
                } else {
                    ctx.font = "bold 15px Arial"
                    ctx.fillStyle = "rgba(255,255,255,0.65)"
                    ctx.fillText("❓ Unknown", layout.content.x + 42, rowY + ((rowHeight - 4) / 2))
                }
            }

            rowY += rowHeight
        }

        ctx.restore()

        const maxTargetIndexScroll = this.getMaxTargetIndexScroll()
        if (maxTargetIndexScroll > 0) {
            const trackX = layout.content.x + layout.content.width + 10
            const trackY = layout.content.y
            const trackHeight = layout.content.height
            const thumbHeight = Math.max(40, (trackHeight * trackHeight) / this.getTargetIndexContentHeight())
            const scrollRatio = this.targetIndexScroll / maxTargetIndexScroll
            const thumbY = trackY + (trackHeight - thumbHeight) * scrollRatio

            ctx.fillStyle = "rgba(255,255,255,0.12)"
            this.drawRoundedRectPath(ctx, trackX, trackY, 6, trackHeight, 3)
            ctx.fill()

            ctx.fillStyle = "rgba(155,92,255,0.75)"
            this.drawRoundedRectPath(ctx, trackX, thumbY, 6, thumbHeight, 3)
            ctx.fill()
        }

        ctx.restore()

    }

    drawTargetIndexPreview(ctx, targetId, x, y, size, discovered) {

        const centerX = x + (size / 2)
        const centerY = y + (size / 2)
        const ringRadius = Math.max(2, size * 0.42)
        let radius = Math.max(2, size * 0.31)
        let fillColor = "#52e3ff"
        let strokeColor = "rgba(160,235,255,0.9)"
        let lineWidth = 2
        let ringColor = null
        let alpha = 1

        ctx.save()

        this.drawRoundedRectPath(ctx, x, y, size, size, 6)
        ctx.fillStyle = discovered ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.025)"
        ctx.fill()
        ctx.strokeStyle = discovered ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.1)"
        ctx.lineWidth = 1
        ctx.stroke()

        if (!discovered) {
            ctx.fillStyle = "rgba(165,175,205,0.4)"
            ctx.beginPath()
            ctx.arc(centerX, centerY, size * 0.28, 0, Math.PI * 2)
            ctx.fill()
            ctx.strokeStyle = "rgba(210,220,245,0.38)"
            ctx.lineWidth = 1.5
            ctx.stroke()
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.font = "bold 11px Arial"
            ctx.fillStyle = "rgba(255,255,255,0.8)"
            ctx.fillText("?", centerX, centerY + 0.5)
            ctx.restore()
            return
        }

        switch (targetId) {
            case "basic":
                fillColor = "#53e6ff"
                strokeColor = "rgba(190,245,255,0.9)"
                break
            case "highValue":
                fillColor = "#ffd54a"
                strokeColor = "#ffe79b"
                break
            case "armored":
                fillColor = "#2fd86d"
                strokeColor = "#a8ffd0"
                lineWidth = 2.5
                break
            case "reinforced":
                fillColor = "#c04dff"
                strokeColor = "#e0a2ff"
                lineWidth = 2.5
                break
            case "heavy":
                fillColor = "#8e1f1f"
                strokeColor = "#2a0a0a"
                lineWidth = 3
                radius = size * 0.34
                break
            case "shielded":
                fillColor = "#3a86ff"
                strokeColor = "#9cc6ff"
                ringColor = "rgba(120,195,255,0.9)"
                break
            case "reflector":
                fillColor = "#ffffff"
                strokeColor = "#d7ecff"
                ringColor = "#77e7ff"
                break
            case "splitter":
                fillColor = "#ff9a3c"
                strokeColor = "#ffd39d"
                break
            case "swarm":
                fillColor = "#ff8d2f"
                strokeColor = "#ffc78f"
                radius = size * 0.2
                break
            case "phase":
                fillColor = "#9b5cff"
                strokeColor = "#ccb0ff"
                alpha = 0.42
                break
            case "charger":
                fillColor = "#ff6d3b"
                strokeColor = "#ffc48e"
                break
            case "fragment":
                fillColor = "#d6e2ff"
                strokeColor = "#eff4ff"
                radius = size * 0.2
                break
            case "boss":
                fillColor = "#9f1f2f"
                strokeColor = "#1f0507"
                lineWidth = 3
                radius = size * 0.36
                break
            case "golden":
                fillColor = "#ffd700"
                strokeColor = "#fff3a3"
                break
            case "phantom":
                fillColor = "#9b5cff"
                strokeColor = "#c8a6ff"
                alpha = 0.5
                break
            case "ancient":
                fillColor = "#ff4a4a"
                strokeColor = "#641c1c"
                lineWidth = 3
                radius = size * 0.34
                break
        }

        ctx.globalAlpha = alpha
        ctx.shadowColor = fillColor
        ctx.shadowBlur = 8
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        ctx.fillStyle = fillColor
        ctx.fill()
        ctx.shadowBlur = 0

        if (ringColor) {
            ctx.beginPath()
            ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2)
            ctx.strokeStyle = ringColor
            ctx.lineWidth = 1.5
            ctx.stroke()
        }

        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        ctx.strokeStyle = strokeColor
        ctx.lineWidth = lineWidth
        ctx.stroke()

        ctx.globalAlpha = 0.5 * alpha
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius * 0.4, 0, Math.PI * 2)
        ctx.fillStyle = "#ffffff"
        ctx.fill()

        ctx.restore()

    }

    drawGrid() {

        const ctx = this.ctx
        const spacing = 40
        const startX = this.gridX - this.gridOffset

        ctx.save()
        ctx.beginPath()
        ctx.rect(this.gridX, 0, this.gridWidth, this.canvas.height)
        ctx.clip()

        const hasTimeWarp =
            this.activeWorldModifiers &&
            this.activeWorldModifiers.includes("timeWarp")
        if (hasTimeWarp) {
            ctx.globalAlpha = 0.05
            ctx.fillStyle = "#9b5cff"
            ctx.fillRect(this.gridX, 0, this.gridWidth, this.canvas.height)
            ctx.globalAlpha = 1
        }

        if (this.worldSystem && typeof this.worldSystem.drawFieldEffects === "function") {
            this.worldSystem.drawFieldEffects(ctx)
        }

        const gridColor = this.getCurrentWorldConfig().gridColor
        ctx.strokeStyle = gridColor

        // Glow pass
        ctx.globalAlpha = 0.05
        ctx.lineWidth = 6
        for (let x = startX; x <= this.canvas.width + spacing; x += spacing) {
            ctx.beginPath()
            ctx.moveTo(x, 0)
            ctx.lineTo(x, this.canvas.height)
            ctx.stroke()
        }

        // Line pass
        ctx.globalAlpha = 0.2
        ctx.lineWidth = 1
        for (let x = startX; x <= this.canvas.width + spacing; x += spacing) {
            ctx.beginPath()
            ctx.moveTo(x, 0)
            ctx.lineTo(x, this.canvas.height)
            ctx.stroke()
        }

        ctx.restore()

    }

    preparePanelLayout(layoutOnly = false) {

        const previousLayoutMode = this._panelLayoutOnly
        this._panelLayoutOnly = layoutOnly
        this.panelHeaderButtons = []

        let y = 90

        y = this.drawPanelSection("lasers", "LASERS", y)

        if (this.hasLaser && this.hasAnyLaserMasteryUnlocked()) {
            y = this.drawPanelSection("mastery", "LASER MASTERY", y)
        }

        if (this.hasLaser) {
            y = this.drawPanelSection("laserUpgrades", "LASER UPGRADES", y)
            y = this.drawPanelSection("targetEconomy", "TARGET ECONOMY", y)
            y = this.drawPanelSection("automation", "AUTOMATION", y)
        }

        y = this.drawPanelSection("world", "WORLD", y)

        this.panelContentHeight = y + 16
        this._panelLayoutOnly = previousLayoutMode

        return y

    }

    drawPanelSection(sectionId, label, y) {

        const headerSpacing = 28
        const cardSpacing = 10
        const sectionX = 20
        const { contentX, contentWidth } = this.getPanelLayoutMetrics()
        const isLayoutOnly = Boolean(this._panelLayoutOnly)

        this.panelHeaderButtons.push({
            x: 12,
            y,
            width: this.panelWidth - 24,
            height: 26,
            sectionId
        })

        if (!isLayoutOnly) {
            this.drawPanelSectionHeader(sectionId, label, sectionX, y)
        }

        let contentY = y + headerSpacing

        if (!this.isPanelSectionExpanded(sectionId)) {
            return contentY + cardSpacing
        }

        if (sectionId === "lasers") {
            if (!this.hasLaser) {
                this.unlockButton.y = contentY

                if (!isLayoutOnly) {
                    const button = this.unlockButton

                    this.ctx.fillStyle = "#e2e2db"
                    this.ctx.fillRect(button.x, button.y, button.width, button.height)

                    this.ctx.strokeStyle = "#222"
                    this.ctx.lineWidth = 2
                    this.ctx.strokeRect(button.x, button.y, button.width, button.height)

                    this.ctx.fillStyle = "#111"
                    this.ctx.font = "18px Arial"
                    this.ctx.fillText("Unlock Simple Laser", button.x + 12, button.y + 32)
                    this.ctx.font = "16px Arial"
                    this.ctx.fillText("Cost: " + this.simpleLaserCost, button.x + 12, button.y + 58)
                }

                return contentY + this.unlockButton.height + cardSpacing
            }

            const visibleLaserTypes = this.getVisibleLaserTypes()
            for (const typeId of visibleLaserTypes) {
                const button = this.getLaserButton(typeId)
                if (!button) continue

                const isUnlocked = this.isLaserUnlocked(typeId)
                const isActive = isUnlocked && this.currentLaserType === typeId
                const title = LASER_TYPES[typeId]?.name || typeId
                const canPurchase = !isUnlocked && this.isNextPurchasableLaser(typeId)
                const unlockCost = canPurchase ? this.getLaserUnlockCost(typeId) : 0
                const subtitle = canPurchase ? unlockCost : ""
                const enabled = isUnlocked || (canPurchase && this.economy.canAfford(unlockCost))

                button.y = contentY

                if (!isLayoutOnly) {
                    this.drawPanelActionButton(
                        button,
                        title,
                        subtitle,
                        enabled,
                        isActive
                    )
                }

                contentY += button.height + cardSpacing
            }

            return contentY
        }

        if (sectionId === "mastery") {
            if (this.isLaserUnlocked("pulse")) {
                this.pulseMasteryButton.y = contentY
                if (!isLayoutOnly) {
                    this.drawPanelButton(
                        this.pulseMasteryButton,
                        "Pulse Mastery",
                        this.upgradeSystem.getPulseMasteryCost(),
                        this.pulseMasteryLevel,
                        this.economy.canAfford(this.upgradeSystem.getPulseMasteryCost())
                    )
                }
                contentY += this.pulseMasteryButton.height + cardSpacing
            }

            if (this.isLaserUnlocked("scatter")) {
                this.scatterMasteryButton.y = contentY
                if (!isLayoutOnly) {
                    this.drawPanelButton(
                        this.scatterMasteryButton,
                        "Scatter Mastery",
                        this.upgradeSystem.getScatterMasteryCost(),
                        this.scatterMasteryLevel,
                        this.economy.canAfford(this.upgradeSystem.getScatterMasteryCost())
                    )
                }
                contentY += this.scatterMasteryButton.height + cardSpacing
            }

            if (this.isLaserUnlocked("heavy")) {
                this.heavyMasteryButton.y = contentY
                if (!isLayoutOnly) {
                    this.drawPanelButton(
                        this.heavyMasteryButton,
                        "Heavy Mastery",
                        this.upgradeSystem.getHeavyMasteryCost(),
                        this.heavyMasteryLevel,
                        this.economy.canAfford(this.upgradeSystem.getHeavyMasteryCost())
                    )
                }
                contentY += this.heavyMasteryButton.height + cardSpacing
            }

            return contentY
        }

        if (sectionId === "laserUpgrades") {
            const laserUpgradeEntries = this.getRenderableLaserUpgradeEntries()

            for (const entry of laserUpgradeEntries) {
                entry.button.y = contentY

                if (!isLayoutOnly) {
                    this.drawPanelButton(
                        entry.button,
                        entry.label,
                        entry.cost,
                        entry.level,
                        entry.affordable
                    )
                }

                contentY += entry.button.height + cardSpacing
            }

            return contentY
        }

        if (sectionId === "targetEconomy") {
            this.targetValueButton.y = contentY
            if (!isLayoutOnly) {
                const targetValueCost = this.targetUpgradeSystem.getValueCost()
                this.drawPanelButton(
                    this.targetValueButton,
                    "Increase Target Value",
                    targetValueCost,
                    this.targetUpgradeSystem.valueLevel,
                    this.economy.canAfford(targetValueCost)
                )
            }
            contentY += this.targetValueButton.height + cardSpacing

            this.targetSpawnRateButton.y = contentY
            if (!isLayoutOnly) {
                const targetSpawnRateCost = this.targetUpgradeSystem.getSpawnRateCost()
                this.drawPanelButton(
                    this.targetSpawnRateButton,
                    "Increase Spawn Rate",
                    targetSpawnRateCost,
                    this.targetUpgradeSystem.spawnRateLevel,
                    this.economy.canAfford(targetSpawnRateCost)
                )
            }
            contentY += this.targetSpawnRateButton.height + cardSpacing

            this.targetDiversityButton.y = contentY
            if (!isLayoutOnly) {
                const targetDiversityCost = this.targetUpgradeSystem.getDiversityCost()
                this.drawPanelButton(
                    this.targetDiversityButton,
                    "Increase Target Diversity",
                    targetDiversityCost,
                    this.targetUpgradeSystem.diversityLevel,
                    this.economy.canAfford(targetDiversityCost)
                )
            }
            contentY += this.targetDiversityButton.height + cardSpacing

            this.clickDamageButton.y = contentY
            if (!isLayoutOnly) {
                const clickDamageCost = this.clickUpgradeSystem.getClickCost()
                this.drawPanelButton(
                    this.clickDamageButton,
                    "Increase Click DMG (" + this.clickDamage + ")",
                    clickDamageCost,
                    this.clickUpgradeLevel,
                    this.economy.canAfford(clickDamageCost)
                )
            }
            contentY += this.clickDamageButton.height + cardSpacing

            return contentY
        }

        if (sectionId === "automation") {
            this.autoFireButton.y = contentY

            if (!isLayoutOnly) {
                if (!this.autoFireUnlocked) {
                    this.drawPanelActionButton(
                        this.autoFireButton,
                        "ENABLE AUTO FIRE",
                        this.autoFireCost,
                        this.economy.canAfford(this.autoFireCost)
                    )
                } else {
                    this.drawPanelActionButton(
                        this.autoFireButton,
                        "Auto Fire: ON",
                        "",
                        true,
                        true
                    )
                }
            }
            contentY += this.autoFireButton.height + cardSpacing

            return contentY
        }

        if (sectionId === "world") {
            this.worldSectionY = y
            const worldNameY = contentY + 16
            const worldSubtitleY = contentY + 34
            const worldIntelEntries = this.worldSystem
                ? this.worldSystem.getWorldIntelLines()
                : []
            const worldIntelLineHeight = 16
            const worldIntelStartY = contentY + 52
            const transportY = worldIntelStartY + (worldIntelEntries.length * worldIntelLineHeight) + 8
            const statusY = transportY + 22
            const showGatePurchaseButton = this.transportReady && !this.worldGatePurchased && !this.transportAnimating
            const showBossPrep = this.transportReady && this.worldGatePurchased && !this.transportAnimating && !this.bossFightActive
            const showModifierInsight = this.hasProgressNode("modifierInsight")
            const shieldCost = this.getBossPrepCost(BOSS_PREP_SHIELD_COST)
            const overchargerCost = this.getBossPrepCost(BOSS_PREP_OVERCHARGER_COST)
            const stabilizerCost = this.getBossPrepCost(BOSS_PREP_STABILIZER_COST)
            const bossInfoLineHeight = 18
            const bossPrepEntries = [
                {
                    title: "Emergency Shield",
                    cost: shieldCost,
                    purchased: this.bossPrepShield,
                    button: this.bossPrepShieldButton
                },
                {
                    title: "Overcharger",
                    cost: overchargerCost,
                    purchased: this.bossPrepOvercharger,
                    button: this.bossPrepOverchargerButton
                },
                {
                    title: "Stabilizer",
                    cost: stabilizerCost,
                    purchased: this.bossPrepStabilizer,
                    button: this.bossPrepStabilizerButton
                }
            ]
            const bossPrepButtonHeight = 30
            const bossPrepGap = 8
            const modifierLineHeight = 18
            const worldGateCost = this.getWorldGateCost()
            const transportChargeDisplay = Number.isInteger(this.transportCharge)
                ? this.transportCharge
                : this.transportCharge.toFixed(1)
            this.worldGatePurchaseButton.x = contentX
            this.worldGatePurchaseButton.y = statusY - 10
            this.worldGatePurchaseButton.width = contentWidth
            this.worldGatePurchaseButton.height = 30
            const bossInfoY = showGatePurchaseButton
                ? this.worldGatePurchaseButton.y + this.worldGatePurchaseButton.height + 18
                : statusY + 24
            const bossPrepHeaderY = showModifierInsight ? bossInfoY + (bossInfoLineHeight * 2) + 8 : bossInfoY + 4
            let prepContentY = bossPrepHeaderY + 14
            if (showBossPrep) {
                for (const entry of bossPrepEntries) {
                    entry.button.x = contentX
                    entry.button.y = prepContentY
                    entry.button.width = contentWidth
                    entry.button.height = bossPrepButtonHeight
                    prepContentY += bossPrepButtonHeight + bossPrepGap
                }
            }
            const modifierEntries = this.activeWorldModifiers.length > 0
                ? this.activeWorldModifiers
                : ["none"]
            const modifiersLabelY = showBossPrep
                ? prepContentY + 8
                : showModifierInsight
                    ? bossInfoY + (bossInfoLineHeight * 2) + 8
                    : bossInfoY + 24
            const modifiersStartY = modifiersLabelY + 20
            const sectionTop = contentY
            const sectionBottom = modifiersStartY + (modifierEntries.length * modifierLineHeight) + 6
            const sectionHeight = Math.max(1, sectionBottom - sectionTop)

            if (!isLayoutOnly) {
                this.ctx.save()
                this.ctx.beginPath()
                this.ctx.rect(contentX, sectionTop, contentWidth, sectionHeight)
                this.ctx.clip()

                this.ctx.fillStyle = "rgba(255,255,255,0.75)"
                this.ctx.font = "16px Arial"
                this.ctx.fillText("World: " + this.getCurrentWorldName(), contentX, worldNameY, contentWidth)
                this.ctx.fillText(
                    "Zone: " + this.getCurrentWorldSubtitle(),
                    contentX,
                    worldSubtitleY,
                    contentWidth
                )
                this.ctx.font = "13px Arial"
                for (let i = 0; i < worldIntelEntries.length; i++) {
                    const entry = worldIntelEntries[i]
                    this.ctx.fillText(
                        entry.label + ": " + entry.text,
                        contentX,
                        worldIntelStartY + (i * worldIntelLineHeight),
                        contentWidth
                    )
                }

                this.ctx.font = "15px Arial"
                this.ctx.fillText(
                    "Transport Charge: " + transportChargeDisplay + " / " + this.transportChargeRequired,
                    contentX,
                    transportY,
                    contentWidth
                )

                if (this.transportAnimating) {
                    this.ctx.fillStyle = "#6d5fbf"
                    this.ctx.font = "bold 16px Arial"
                    this.ctx.fillText("TRANSPORTING...", contentX, statusY, contentWidth)
                } else if (showGatePurchaseButton) {
                    this.drawPanelActionButton(
                        this.worldGatePurchaseButton,
                        "PURCHASE WORLD GATE",
                        worldGateCost,
                        this.economy.canAfford(worldGateCost)
                    )
                } else if (this.transportReady && this.worldGatePurchased) {
                    this.ctx.fillStyle = "#0f6a7a"
                    this.ctx.font = "bold 16px Arial"
                    this.ctx.fillText("ACTIVATE TRANSPORT BEAM", contentX, statusY, contentWidth)
                }

                if (showModifierInsight) {
                    this.ctx.fillStyle = "rgba(220,235,255,0.78)"
                    this.ctx.font = "13px Arial"
                    this.ctx.fillText(
                        "Next Boss: " + this.getWorldBossName(),
                        contentX,
                        bossInfoY,
                        contentWidth
                    )
                    this.ctx.fillText(
                        "Profile: " + this.getCurrentWorldBossConfig().attackStyle,
                        contentX,
                        bossInfoY + bossInfoLineHeight,
                        contentWidth
                    )
                }

                if (showBossPrep) {
                    this.ctx.fillStyle = "rgba(255,255,255,0.82)"
                    this.ctx.font = "bold 13px Arial"
                    this.ctx.fillText("BOSS PREP", contentX, bossPrepHeaderY, contentWidth)

                    for (const entry of bossPrepEntries) {
                        if (entry.purchased) {
                            this.drawPanelActionButton(
                                entry.button,
                                entry.title,
                                "BOUGHT",
                                true,
                                true
                            )
                        } else {
                            this.drawPanelActionButton(
                                entry.button,
                                entry.title,
                                entry.cost,
                                this.economy.canAfford(entry.cost)
                            )
                        }
                    }
                }

                this.ctx.fillStyle = "rgba(255,255,255,0.75)"
                this.ctx.font = "14px Arial"
                this.ctx.fillText("Modifiers:", contentX, modifiersLabelY, contentWidth)

                this.ctx.font = "13px Arial"
                for (let i = 0; i < modifierEntries.length; i++) {
                    this.ctx.fillText(
                        modifierEntries[i],
                        contentX + 10,
                        modifiersStartY + (i * modifierLineHeight),
                        contentWidth - 10
                    )
                }

                this.ctx.restore()
            }

            return modifiersStartY + (modifierEntries.length * modifierLineHeight) + cardSpacing
        }

        return contentY + cardSpacing

    }

    drawPanel() {

        const ctx = this.ctx
        const panelX = 0
        const panelWidth = this.panelWidth
        const padding = 16
        const contentX = panelX + padding
        const contentWidth = panelWidth - (padding * 2)
        this._panelLayoutMetrics = {
            panelX,
            panelWidth,
            padding,
            contentX,
            contentWidth
        }

        // Futuristic glass panel base.
        ctx.fillStyle = "#0f1118"
        ctx.fillRect(panelX, 0, panelWidth, this.canvas.height)

        // Subtle panel grid overlay.
        ctx.save()
        ctx.beginPath()
        ctx.rect(panelX, 0, panelWidth, this.canvas.height)
        ctx.clip()
        ctx.strokeStyle = "rgba(58,134,255,0.12)"
        ctx.lineWidth = 1

        const gridSpacing = 30
        for (let x = panelX; x <= panelX + panelWidth; x += gridSpacing) {
            ctx.beginPath()
            ctx.moveTo(x + 0.5, 0)
            ctx.lineTo(x + 0.5, this.canvas.height)
            ctx.stroke()
        }
        for (let y = 0; y <= this.canvas.height; y += gridSpacing) {
            ctx.beginPath()
            ctx.moveTo(panelX, y + 0.5)
            ctx.lineTo(panelX + panelWidth, y + 0.5)
            ctx.stroke()
        }
        ctx.restore()

        // Thin glow frame.
        ctx.save()
        ctx.shadowColor = "#3a86ff"
        ctx.shadowBlur = 20
        ctx.strokeStyle = "rgba(58,134,255,0.65)"
        ctx.lineWidth = 1
        ctx.strokeRect(panelX + 0.5, 0.5, panelWidth - 1, this.canvas.height - 1)
        ctx.restore()
        this.preparePanelLayout(true)
        this.clampPanelScroll()

        ctx.save()
        ctx.beginPath()
        ctx.rect(panelX, 0, panelWidth, this.canvas.height)
        ctx.clip()
        ctx.translate(0, -this.panelScroll)
        ctx.textAlign = "left"

        const layout = this._panelLayoutMetrics || this.getPanelLayoutMetrics()
        const headerY = 14
        const headerHeight = 44
        const headerGap = 8
        const pointsWidth = Math.floor(layout.contentWidth * 0.6)
        const overchargeWidth = layout.contentWidth - pointsWidth - headerGap
        const pointsX = layout.contentX
        const overchargeX = pointsX + pointsWidth + headerGap

        this.drawPointsHeader(ctx, pointsX, headerY, pointsWidth, headerHeight)
        this.drawOverchargeMeter(ctx, overchargeX, headerY, overchargeWidth, headerHeight)
        this.preparePanelLayout(false)

        this.drawUpgradeFlashes(ctx)

        ctx.restore()

    }

    drawPointsHeader(ctx, x, y, width, height) {

        const cardGradient = ctx.createLinearGradient(x, y, x, y + height)
        cardGradient.addColorStop(0, "rgba(58,134,255,0.20)")
        cardGradient.addColorStop(1, "rgba(58,134,255,0)")

        ctx.save()
        this.drawRoundedRectPath(ctx, x, y, width, height, 14)
        ctx.fillStyle = cardGradient
        ctx.fill()

        ctx.shadowColor = "#3a86ff"
        ctx.shadowBlur = 25
        this.drawRoundedRectPath(ctx, x, y, width, height, 14)
        ctx.lineWidth = 1.2
        ctx.strokeStyle = "rgba(58,134,255,0.35)"
        ctx.stroke()

        ctx.shadowBlur = 0
        ctx.fillStyle = "rgba(202,227,255,0.9)"
        ctx.font = "bold 9px Arial"
        ctx.textBaseline = "alphabetic"
        ctx.fillText("ENERGY POINTS", x + 12, y + 13, width - 24)

        ctx.fillStyle = "#e8f3ff"
        ctx.font = "28px monospace"
        ctx.fillText(String(this.points), x + 12, y + 39, width - 24)
        ctx.restore()

    }

    drawOverchargeMeter(ctx, x, y, width, height) {

        ctx.save()
        const cardX = x
        const cardY = y
        const cardWidth = width
        const cardHeight = height
        const ratio = this.maxLaserOvercharge > 0
            ? Math.max(0, Math.min(1, this.laserOvercharge / this.maxLaserOvercharge))
            : 0
        const percentText = Math.floor(ratio * 100) + "%"

        const cardGradient = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardHeight)
        cardGradient.addColorStop(0, "rgba(155,92,255,0.20)")
        cardGradient.addColorStop(1, "rgba(155,92,255,0)")

        ctx.save()
        this.drawRoundedRectPath(ctx, cardX, cardY, cardWidth, cardHeight, 14)
        ctx.fillStyle = cardGradient
        ctx.fill()

        ctx.shadowColor = "#9b5cff"
        ctx.shadowBlur = 22
        this.drawRoundedRectPath(ctx, cardX, cardY, cardWidth, cardHeight, 14)
        ctx.lineWidth = 1.2
        ctx.strokeStyle = "rgba(155,92,255,0.35)"
        ctx.stroke()

        ctx.shadowBlur = 0
        ctx.fillStyle = "rgba(238,223,255,0.95)"
        ctx.font = "bold 9px Arial"
        ctx.textAlign = "left"
        ctx.fillText("OVERCHARGE", cardX + 12, cardY + 13)

        ctx.textAlign = "right"
        ctx.fillStyle = "#f5ebff"
        ctx.font = "bold 11px Arial"
        ctx.fillText(percentText, cardX + cardWidth - 8, cardY + 13)
        ctx.textAlign = "left"

        const barX = cardX + 10
        const barY = cardY + 28
        const barWidth = cardWidth - 20
        const barHeight = 8
        const fillWidth = barWidth * ratio

        this.drawRoundedRectPath(ctx, barX, barY, barWidth, barHeight, barHeight / 2)
        ctx.fillStyle = "rgba(255,255,255,0.08)"
        ctx.fill()

        if (fillWidth > 0.5) {
            const fillGradient = ctx.createLinearGradient(barX, 0, barX + barWidth, 0)
            fillGradient.addColorStop(0, "#3a86ff")
            fillGradient.addColorStop(1, "#9b5cff")
            this.drawRoundedRectPath(ctx, barX, barY, fillWidth, barHeight, barHeight / 2)
            ctx.fillStyle = fillGradient
            ctx.fill()
        }

        ctx.restore()
        ctx.restore()

    }

    drawPanelSectionHeader(sectionId, label, x, y) {

        const ctx = this.ctx
        const expanded = this.isPanelSectionExpanded(sectionId)
        const arrow = expanded ? "▼" : "▶"
        const headerText = String(label || "").toUpperCase()
        const isLaserSection = headerText.includes("LASER")
        const headerColor = isLaserSection ? "#3a86ff" : "#9b5cff"
        const topPadding = 16
        const letterSpacing = 2
        const leftLineWidth = 32
        const arrowX = x + leftLineWidth + 2
        const textX = arrowX + 14
        const textY = y + topPadding
        const lineY = textY - 3

        ctx.save()
        ctx.shadowColor = headerColor
        ctx.shadowBlur = 8

        // Left short neon line.
        ctx.strokeStyle = headerColor
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x, lineY)
        ctx.lineTo(x + leftLineWidth, lineY)
        ctx.stroke()

        // Header text with manual letter spacing for a sci-fi label style.
        ctx.fillStyle = headerColor
        ctx.font = "bold 11px Arial"
        ctx.textAlign = "left"
        ctx.textBaseline = "alphabetic"
        ctx.fillText(arrow, arrowX, textY)

        let cursorX = textX
        for (const char of headerText) {
            ctx.fillText(char, cursorX, textY)
            cursorX += ctx.measureText(char).width + letterSpacing
        }

        // Right divider line with color fade.
        const rightLineStartX = cursorX + 10
        const rightLineEndX = this.panelWidth - 16

        if (rightLineEndX > rightLineStartX) {
            const rightGradient = ctx.createLinearGradient(rightLineStartX, 0, rightLineEndX, 0)
            rightGradient.addColorStop(0, headerColor)
            rightGradient.addColorStop(
                1,
                isLaserSection ? "rgba(58,134,255,0)" : "rgba(155,92,255,0)"
            )
            ctx.strokeStyle = rightGradient
            ctx.beginPath()
            ctx.moveTo(rightLineStartX, lineY)
            ctx.lineTo(rightLineEndX, lineY)
            ctx.stroke()
        }

        ctx.restore()

    }

    drawPanelDivider(y) {

        const ctx = this.ctx

        ctx.strokeStyle = "#b5b5b0"
        ctx.lineWidth = 1

        ctx.beginPath()
        ctx.moveTo(16, y)
        ctx.lineTo(this.panelWidth - 16, y)
        ctx.stroke()

    }

    drawRoundedRectPath(ctx, x, y, width, height, radius = 12) {

        const safeRadius = Math.max(0, Math.min(radius, width / 2, height / 2))

        ctx.beginPath()
        ctx.moveTo(x + safeRadius, y)
        ctx.lineTo(x + width - safeRadius, y)
        ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius)
        ctx.lineTo(x + width, y + height - safeRadius)
        ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height)
        ctx.lineTo(x + safeRadius, y + height)
        ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius)
        ctx.lineTo(x, y + safeRadius)
        ctx.quadraticCurveTo(x, y, x + safeRadius, y)
        ctx.closePath()

    }

    drawUpgradeCard(ctx, x, y, width, height, state) {

        const {
            title = "",
            cost = "",
            level = 0,
            canAfford = false,
            selected = false,
            unlocked = true,
            hovered = false,
            flashIntensity = 0,
            iconId = null,
            stackSubtitle = false
        } = state

        const radius = 12
        const pulseIntensity = Math.max(0, Math.min(1, flashIntensity))
        let borderColor = "rgba(255,255,255,0.1)"
        let glowColor = "transparent"
        let glowBlur = 0
        const hasAffordablePulse = canAfford && !unlocked && !selected

        if (selected) {
            borderColor = "#9b5cff"
            glowColor = "#9b5cff"
            glowBlur = 18
        } else if (unlocked) {
            borderColor = "#3a86ff"
            glowColor = "#3a86ff"
            glowBlur = 10
        } else if (canAfford) {
            borderColor = "rgba(58,134,255,0.45)"
            glowColor = "#3a86ff"
            glowBlur = 4
        }

        if (hasAffordablePulse) {
            const pulse = 0.5 + Math.sin(performance.now() * 0.003) * 0.5
            borderColor = "rgba(58,134,255,0.5)"
            glowColor = "#3a86ff"
            glowBlur = Math.max(glowBlur, 10 + (pulse * 8))
        }

        if (hovered) {
            glowBlur = Math.max(glowBlur, 28)
        }
        if (pulseIntensity > 0) {
            glowColor = "#9b5cff"
            glowBlur = Math.max(glowBlur, 16 + (pulseIntensity * 18))
        }

        const fillGradient = ctx.createLinearGradient(x, y, x, y + height)
        fillGradient.addColorStop(0, "rgba(255,255,255,0.05)")
        fillGradient.addColorStop(1, "rgba(255,255,255,0.02)")

        ctx.save()

        this.drawRoundedRectPath(ctx, x, y, width, height, radius)
        ctx.fillStyle = fillGradient
        ctx.fill()

        if (hovered) {
            this.drawRoundedRectPath(ctx, x, y, width, height, radius)
            ctx.fillStyle = "rgba(58,134,255,0.08)"
            ctx.fill()

            const leftHighlightGradient = ctx.createLinearGradient(x, 0, x + 24, 0)
            leftHighlightGradient.addColorStop(0, "rgba(58,134,255,0.30)")
            leftHighlightGradient.addColorStop(1, "rgba(58,134,255,0)")

            ctx.save()
            this.drawRoundedRectPath(ctx, x, y, width, height, radius)
            ctx.clip()
            ctx.fillStyle = leftHighlightGradient
            ctx.fillRect(x + 1, y + 1, 24, height - 2)
            ctx.restore()
        }

        if (pulseIntensity > 0) {
            this.drawRoundedRectPath(ctx, x, y, width, height, radius)
            ctx.fillStyle = `rgba(155,92,255,${0.16 * pulseIntensity})`
            ctx.fill()
        }

        const isInteractiveCard = hovered || canAfford || unlocked || selected
        if (isInteractiveCard) {
            const sweepTime = performance.now() * 0.001
            const sweep = (Math.sin(sweepTime) + 1) * 0.5
            const sweepGradient = ctx.createLinearGradient(
                x - width,
                y,
                x + width,
                y + height
            )

            sweepGradient.addColorStop(0, "rgba(255,255,255,0)")
            sweepGradient.addColorStop(sweep, "rgba(255,255,255,0.08)")
            sweepGradient.addColorStop(1, "rgba(255,255,255,0)")

            ctx.save()
            this.drawRoundedRectPath(ctx, x, y, width, height, radius)
            ctx.clip()
            this.drawRoundedRectPath(ctx, x, y, width, height, radius)
            ctx.fillStyle = sweepGradient
            ctx.globalCompositeOperation = "lighter"
            ctx.fill()
            ctx.globalCompositeOperation = "source-over"
            ctx.restore()
        }

        ctx.shadowColor = glowColor
        ctx.shadowBlur = glowBlur
        this.drawRoundedRectPath(ctx, x, y, width, height, radius)
        ctx.lineWidth = 1.5
        ctx.strokeStyle = borderColor
        ctx.stroke()

        this.drawRoundedRectPath(ctx, x + 1, y + 1, width - 2, height - 2, radius - 1)
        ctx.lineWidth = 1
        ctx.strokeStyle = "rgba(255,255,255,0.05)"
        ctx.stroke()

        const padding = 6
        const iconSize = height - (padding * 2)
        const iconX = x + padding
        const iconY = y + padding
        let iconContainerFill = "rgba(255,255,255,0.03)"
        let iconContainerShadowColor = "transparent"
        let iconContainerShadowBlur = 0

        if (selected) {
            iconContainerFill = "rgba(155,92,255,0.20)"
            iconContainerShadowColor = "#9b5cff"
            iconContainerShadowBlur = 15
        } else if (unlocked) {
            iconContainerFill = "rgba(58,134,255,0.20)"
            iconContainerShadowColor = "#3a86ff"
            iconContainerShadowBlur = 12
        } else if (canAfford) {
            iconContainerFill = "rgba(255,255,255,0.05)"
        }

        ctx.shadowColor = iconContainerShadowColor
        ctx.shadowBlur = iconContainerShadowBlur
        this.drawRoundedRectPath(ctx, iconX, iconY, iconSize, iconSize, 8)
        ctx.fillStyle = iconContainerFill
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.lineWidth = 1
        ctx.strokeStyle = "rgba(255,255,255,0.18)"
        ctx.stroke()

        const icon = iconId ? UPGRADE_ICONS[iconId] : null
        const iconColor = selected
            ? "#9b5cff"
            : unlocked
                ? "#3a86ff"
                : canAfford
                    ? "rgba(255,255,255,0.85)"
                    : "rgba(255,255,255,0.25)"

        if (icon) {
            const iconCenterX = iconX + (iconSize / 2)
            const iconCenterY = iconY + (iconSize / 2)

            ctx.save()
            ctx.translate(iconCenterX, iconCenterY)
            ctx.scale(1, 1)
            ctx.translate(-12, -12)
            ctx.strokeStyle = iconColor
            ctx.lineWidth = 2
            ctx.lineCap = "round"
            ctx.lineJoin = "round"
            ctx.stroke(icon)
            ctx.restore()
        } else {
            ctx.beginPath()
            ctx.strokeStyle = selected ? "#c9a6ff" : "#86b7ff"
            ctx.lineWidth = 2
            ctx.moveTo(iconX + 10, iconY + (iconSize / 2))
            ctx.lineTo(iconX + 20, iconY + 18)
            ctx.lineTo(iconX + 28, iconY + 30)
            ctx.lineTo(iconX + 38, iconY + 16)
            ctx.stroke()
        }

        const textX = iconX + iconSize + 12
        const titleY = stackSubtitle ? y + 10 : y + 20
        const subtitleY = titleY + 16
        const costY = y + height - 12
        const titleText = String(title).toUpperCase()
        const costText = String(cost || "")
        const textRightPadding = level > 0 ? 72 : 12
        const maxTextWidth = Math.max(0, width - (textX - x) - textRightPadding)
        const titleColor = selected
            ? "#9b5cff"
            : unlocked
                ? "#3a86ff"
                : "rgba(255,255,255,0.9)"

        ctx.fillStyle = titleColor
        ctx.font = "700 12px Arial"
        ctx.textAlign = "left"
        ctx.textBaseline = "top"
        ctx.save()
        ctx.beginPath()
        ctx.rect(textX, titleY, maxTextWidth, 14)
        ctx.clip()
        ctx.fillText(titleText, textX, titleY, maxTextWidth)
        ctx.restore()

        if (costText) {
            ctx.fillStyle = canAfford ? "#a6d1ff" : "rgba(255,255,255,0.6)"
            ctx.font = "12px monospace"
            if (stackSubtitle) {
                ctx.textBaseline = "top"
                ctx.fillText(costText, textX, subtitleY, maxTextWidth)
            } else {
                ctx.textBaseline = "alphabetic"
                ctx.fillText(costText, textX, costY, maxTextWidth)
            }
        }

        if (level > 0) {
            const badgeText = "LV " + level
            ctx.font = "700 11px Arial"
            const badgeWidth = Math.max(44, ctx.measureText(badgeText).width + 16)
            const badgeHeight = 20
            const badgeX = x + width - badgeWidth - 12
            const badgeY = y + 10

            this.drawRoundedRectPath(ctx, badgeX, badgeY, badgeWidth, badgeHeight, 10)
            ctx.fillStyle = selected
                ? "rgba(155,92,255,0.35)"
                : "rgba(58,134,255,0.25)"
            ctx.fill()

            this.drawRoundedRectPath(ctx, badgeX, badgeY, badgeWidth, badgeHeight, 10)
            ctx.strokeStyle = selected
                ? "rgba(155,92,255,0.75)"
                : "rgba(58,134,255,0.55)"
            ctx.lineWidth = 1
            ctx.stroke()

            ctx.fillStyle = "#eaf3ff"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.fillText(badgeText, badgeX + (badgeWidth / 2), badgeY + (badgeHeight / 2) + 0.5)
            ctx.textAlign = "left"
            ctx.textBaseline = "alphabetic"
        }

        ctx.restore()

    }

    drawPanelActionButton(button, title, subtitle, enabled, active = false) {

        const ctx = this.ctx
        const normalizedTitle = String(title || "").toLowerCase()
        const isLaserCard = normalizedTitle.includes("laser")
        const subtitleText = String(subtitle || "").trim().toLowerCase()
        const isSwitchCard = subtitleText === "switch" || subtitleText === "active"
        const hovered = this.isCardHovered(button)
        const flashIntensity = this.getCardFlashIntensity(button)
        const iconId = this.resolveActionCardIconId(title)
        const hasNumericSubtitle = typeof subtitle === "number"

        let costText = ""
        if (isLaserCard) {
            costText = hasNumericSubtitle ? "Cost: " + subtitle : ""
        } else {
            costText = isSwitchCard
                ? ""
                : hasNumericSubtitle
                    ? "Cost: " + subtitle
                    : subtitle || (active ? "ONLINE" : "")
        }
        const state = {
            title,
            cost: costText,
            level: 0,
            canAfford: enabled,
            selected: active,
            unlocked: isLaserCard ? (active || !hasNumericSubtitle) : (active || isSwitchCard),
            hovered,
            flashIntensity,
            iconId,
            stackSubtitle: isLaserCard
        }

        this.drawUpgradeCard(ctx, button.x, button.y, button.width, button.height, state)

    }

    drawPanelButton(button, label, cost, level, affordable) {

        const ctx = this.ctx
        const hovered = this.isCardHovered(button)
        const flashIntensity = this.getCardFlashIntensity(button)
        const iconId = this.resolveUpgradeCardIconId(label)
        const state = {
            title: label,
            cost: "Cost: " + cost,
            level,
            canAfford: affordable,
            selected: false,
            unlocked: level > 0,
            hovered,
            flashIntensity,
            iconId
        }

        this.drawUpgradeCard(ctx, button.x, button.y, button.width, button.height, state)

    }

    resolveActionCardIconId(title) {

        const normalizedTitle = String(title || "").toLowerCase()

        if (normalizedTitle.includes("simple laser")) return "simpleLaser"
        if (normalizedTitle.includes("plasma laser")) return "plasmaLaser"
        if (normalizedTitle.includes("pulse laser")) return "plasmaLaser"
        if (normalizedTitle.includes("scatter laser")) return "fireRate"
        if (normalizedTitle.includes("heavy laser")) return "strength"
        if (normalizedTitle.includes("auto fire")) return "autoFire"

        return "simpleLaser"

    }

    resolveUpgradeCardIconId(label) {

        const normalizedLabel = String(label || "").toLowerCase()

        if (normalizedLabel.includes("frequency")) return "frequency"
        if (normalizedLabel.includes("amplitude")) return "amplitude"
        if (normalizedLabel.includes("fire rate")) return "fireRate"
        if (normalizedLabel.includes("laser strength")) return "strength"
        if (normalizedLabel.includes("target value")) return "targetValue"
        if (normalizedLabel.includes("spawn rate")) return "spawnRate"
        if (normalizedLabel.includes("target diversity")) return "diversity"
        if (normalizedLabel.includes("click")) return "strength"
        if (normalizedLabel.includes("pulse mastery")) return "plasmaLaser"
        if (normalizedLabel.includes("scatter mastery")) return "fireRate"
        if (normalizedLabel.includes("heavy mastery")) return "strength"

        return "simpleLaser"

    }


}
