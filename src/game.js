import { SpawnSystem } from "./spawn.js"
import { Laser } from "./laser.js"
import { CollisionSystem } from "./collision.js"
import { FloatingText } from "./floatingText.js"
import { ParticleSystem } from "./particles.js"
import { TransportBeam } from "./transportBeam.js"
import { UpgradeSystem } from "./upgrades.js"
import { TargetUpgradeSystem } from "./targetUpgrades.js"
import { ClickUpgradeSystem } from "./clickUpgrades.js"
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
    MAX_LASER_STRENGTH,
    GAME_STATE_TITLE,
    GAME_STATE_PLAYING,
    WORLD_START_LEVEL,
    WORLD_POINT_MULTIPLIER_BASE,
    WORLD_POINT_MULTIPLIER_GROWTH,
    TRANSPORT_INITIAL_CHARGE_REQUIRED,
    TRANSPORT_CHARGE_GROWTH,
    WORLD_SPAWN_RATE_GROWTH,
    WORLD_DATA,
    WORLD_UPGRADE_TREES,
    WORLD_MODIFIERS,
    SCATTER_BASE_BEAM_COUNT,
    HEAVY_BASE_PIERCE_COUNT,
    PULSE_SHOCKWAVE_BASE_RADIUS
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
        this.showInfoScreen = false
        this.infoScroll = 0
        this.showTargetIndex = false
        this.targetIndexScroll = 0
        this.worldLevel = WORLD_START_LEVEL
        this.transportCharge = 0
        this.transportChargeRequired = TRANSPORT_INITIAL_CHARGE_REQUIRED
        this.transportReady = false
        this.transportAnimating = false
        this.transportAnimationTime = 0
        this.transportAnimationDuration = 1.2
        this.activeWorldModifiers = []
        this.gravityWells = []
        this.gravityWellTimer = 0

        this.lastTime = 0
        this.worldPointMultiplier = WORLD_POINT_MULTIPLIER_BASE
        this._points = 0
        this.configurePointAccessors()
        this.setPointsRaw(DEV_STARTING_POINTS)
        this.clickDamage = 1
        this.clickUpgradeLevel = 0
        this.hasLaser = false
        this.targets = []
        this.lasers = []
        this.floatingTexts = []
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
        this.laserTypeStats = this.createLaserTypeStats()
        this.defineLaserStatAccessors()
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
        this.worldSectionY = this.autoFireButton.y + 76
        this.panelHeaderButtons = []
        this.panelContentHeight = this.canvas.height

        this.spawnSystem = new SpawnSystem(this)
        this.collisionSystem = new CollisionSystem(this)
        this.particleSystem = new ParticleSystem(this)
        this.transportBeam = new TransportBeam(this)
        this.upgradeSystem = new UpgradeSystem(this)
        this.targetUpgradeSystem = new TargetUpgradeSystem(this)
        this.clickUpgradeSystem = new ClickUpgradeSystem(this)
        this.saveSystem = new SaveSystem(this)
        this.saveSystem.load()
        this.canvas.addEventListener("click", (event) => {
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
            if (event.key !== "Escape") return
            if (event.repeat) return
            if (this.gameState !== GAME_STATE_PLAYING) return
            if (this.showTargetIndex) {
                this.showTargetIndex = false
                return
            }
            if (this.showInfoScreen) {
                this.showInfoScreen = false
                return
            }
            this.togglePauseMenu()
        })
    }

    configurePointAccessors() {

        Object.defineProperty(this, "points", {
            configurable: true,
            enumerable: true,
            get: () => this._points,
            set: (value) => {
                const numericValue = Number.isFinite(value) ? value : this._points

                if (numericValue > this._points) {
                    const rawGain = numericValue - this._points
                    const scaledGain = Math.floor(rawGain * this.worldPointMultiplier)
                    this._points += Math.max(0, scaledGain)
                    return
                }

                this._points = Math.max(0, numericValue)
            }
        })

    }

    setPointsRaw(value) {

        const numericValue = Number.isFinite(value) ? value : 0
        this._points = Math.max(0, Math.floor(numericValue))

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
        if (this.points < cost) return false

        this.points -= cost
        this.plasmaUnlocked = true
        return true

    }

    buyPulseLaser() {

        if (this.pulseUnlocked) return true
        if (!this.isNextPurchasableLaser("pulse")) return false

        const cost = this.getLaserUnlockCost("pulse")
        if (this.points < cost) return false

        this.points -= cost
        this.pulseUnlocked = true
        return true

    }

    buyScatterLaser() {

        if (this.scatterUnlocked) return true
        if (!this.isNextPurchasableLaser("scatter")) return false

        const cost = this.getLaserUnlockCost("scatter")
        if (this.points < cost) return false

        this.points -= cost
        this.scatterUnlocked = true
        return true

    }

    buyHeavyLaser() {

        if (this.heavyUnlocked) return true
        if (!this.isNextPurchasableLaser("heavy")) return false

        const cost = this.getLaserUnlockCost("heavy")
        if (this.points < cost) return false

        this.points -= cost
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

        return WORLD_DATA[this.worldLevel] || WORLD_DATA[1]

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
        const activeLaserStats = this.laserTypeStats[this.currentLaserType] || {}
        const strengthMaxed = this.laserStrength >= MAX_LASER_STRENGTH
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
                    label: "Increase Frequency",
                    cost,
                    level: activeLaserStats.frequencyLevel || 0,
                    affordable: this.points >= cost
                })
                continue
            }

            if (upgradeId === "amplitude") {
                const cost = this.upgradeSystem.getAmplitudeCost()
                entries.push({
                    id: "amplitude",
                    button: this.amplitudeButton,
                    label: "Increase Amplitude",
                    cost,
                    level: activeLaserStats.amplitudeLevel || 0,
                    affordable: this.points >= cost
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
                    label: "Increase Fire Rate",
                    cost,
                    level: activeLaserStats.fireRateLevel || 0,
                    affordable: this.points >= cost
                })
                continue
            }

            if (upgradeId === "strength") {
                const cost = this.upgradeSystem.getStrengthCost()
                entries.push({
                    id: "strength",
                    button: this.strengthButton,
                    label: "Increase Laser Strength",
                    cost,
                    level: activeLaserStats.strengthLevel || 0,
                    affordable: !strengthMaxed && this.points >= cost
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

        if (this.gameState === GAME_STATE_TITLE) {
            if (this.showTargetIndex) {
                this.handleTargetIndexClick(mouseX, mouseY)
                return
            }
            if (this.showInfoScreen) {
                this.handleInfoScreenClick(mouseX, mouseY)
                return
            }
            this.handleTitleClick(mouseX, mouseY)
            return
        }

        if (this.showTargetIndex) {
            this.handleTargetIndexClick(mouseX, mouseY)
            return
        }

        if (this.showInfoScreen) {
            this.handleInfoScreenClick(mouseX, mouseY)
            return
        }

        if (this.showPauseMenu) {
            this.handlePauseMenuClick(mouseX, mouseY)
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

        if (this.showTargetIndex) {
            event.preventDefault()
            this.targetIndexScroll += event.deltaY
            this.clampTargetIndexScroll()
            return
        }

        if (this.showInfoScreen) {
            event.preventDefault()
            this.infoScroll += event.deltaY
            this.clampInfoScroll()
            return
        }

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

    handleMouseMove(event) {

        const rect = this.canvas.getBoundingClientRect()
        this.mouseX = event.clientX - rect.left
        this.mouseY = event.clientY - rect.top

        if (this.mouseX < 0 || this.mouseX > this.canvas.width || this.mouseY < 0 || this.mouseY > this.canvas.height) {
            this.canvas.style.cursor = "default"
            return
        }

        if (this.gameState === GAME_STATE_TITLE) {
            if (this.showTargetIndex) {
                this.canvas.style.cursor = this.isHoveringTargetIndexBackButton(this.mouseX, this.mouseY)
                    ? "pointer"
                    : "default"
                return
            }

            if (this.showInfoScreen) {
                this.canvas.style.cursor = this.isHoveringInfoBackButton(this.mouseX, this.mouseY)
                    ? "pointer"
                    : "default"
                return
            }

            const titleButtons = this.getTitleButtons()
            const hoveringTitleButton = Object.values(titleButtons).some(
                button => this.isInsideButton(this.mouseX, this.mouseY, button)
            )
            this.canvas.style.cursor = hoveringTitleButton ? "pointer" : "default"
            return
        }

        if (this.gameState !== GAME_STATE_PLAYING) {
            this.canvas.style.cursor = "default"
            return
        }

        if (this.showTargetIndex) {
            this.canvas.style.cursor = this.isHoveringTargetIndexBackButton(this.mouseX, this.mouseY)
                ? "pointer"
                : "default"
            return
        }

        if (this.showInfoScreen) {
            this.canvas.style.cursor = this.isHoveringInfoBackButton(this.mouseX, this.mouseY)
                ? "pointer"
                : "default"
            return
        }

        if (this.showPauseMenu) {
            const hoveringPauseButton = this.isHoveringPauseMenuButton(this.mouseX, this.mouseY)
            this.canvas.style.cursor = hoveringPauseButton ? "pointer" : "default"
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

        return {
            startButton: {
                x,
                y: startY,
                width: buttonWidth,
                height: buttonHeight
            },
            infoButton: {
                x,
                y: startY + buttonHeight + buttonGap,
                width: buttonWidth,
                height: buttonHeight
            },
            targetIndexButton: {
                x,
                y: startY + (buttonHeight + buttonGap) * 2,
                width: buttonWidth,
                height: buttonHeight
            }
        }

    }

    handleTitleClick(mouseX, mouseY) {

        const buttons = this.getTitleButtons()

        if (this.isInsideButton(mouseX, mouseY, buttons.startButton)) {
            this.gameState = GAME_STATE_PLAYING
            this.showInfoScreen = false
            this.showTargetIndex = false
            return
        }

        if (this.isInsideButton(mouseX, mouseY, buttons.infoButton)) {
            this.showInfoScreen = true
            this.infoScroll = 0
            this.showTargetIndex = false
            return
        }

        if (this.isInsideButton(mouseX, mouseY, buttons.targetIndexButton)) {
            this.showTargetIndex = true
            this.targetIndexScroll = 0
            this.showInfoScreen = false
        }

    }

    togglePauseMenu() {

        this.showPauseMenu = !this.showPauseMenu
        this.isPaused = this.showPauseMenu
        if (!this.showPauseMenu) {
            this.showInfoScreen = false
            this.infoScroll = 0
            this.showTargetIndex = false
            this.targetIndexScroll = 0
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
            { id: "mute", label: "Mute Audio" },
            { id: "info", label: "Info" },
            { id: "targetIndex", label: "Target Index" },
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
            if (this.audio && typeof this.audio.toggleMute === "function") {
                this.audio.toggleMute()
            } else if (this.audio && "muted" in this.audio) {
                this.audio.muted = !this.audio.muted
            }
            return
        }

        if (clickedButton.id === "info") {
            this.showInfoScreen = true
            this.infoScroll = 0
            this.showTargetIndex = false
            return
        }

        if (clickedButton.id === "targetIndex") {
            this.showTargetIndex = true
            this.targetIndexScroll = 0
            this.showInfoScreen = false
            return
        }

        if (clickedButton.id === "menu") {
            this.showPauseMenu = false
            this.isPaused = false
            this.gameState = GAME_STATE_TITLE
        }

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
                title: "GAMEPLAY",
                body: "Click targets to earn energy points."
            },
            {
                title: "LASERS",
                body: "Each laser type behaves differently."
            },
            {
                title: "UPGRADES",
                body: "Improve laser stats and economy systems."
            },
            {
                title: "TARGETS",
                body: "Different enemies require different strategies."
            },
            {
                title: "WORLDS",
                body: "Transport beams allow travel to new worlds."
            },
            {
                title: "TRANSPORT BEAM",
                body: "Charge the beam by defeating enemies."
            },
            {
                title: "LORE",
                body: "In the distant future, scientists weaponized energy frequencies to defend humanity from dimensional swarms."
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
            this.showInfoScreen = false
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
            { id: "fragment", label: "Fragment" },
            { id: "boss", label: "Boss" }
        ]

    }

    getTargetIndexContentHeight() {

        const entries = this.getTargetIndexEntries()
        const rowHeight = 34
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
            this.showTargetIndex = false
            this.canvas.style.cursor = "default"
        }

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
            if (this.points < this.simpleLaserCost) return

            this.points -= this.simpleLaserCost
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
            if (this.points < this.autoFireCost) return

            this.points -= this.autoFireCost
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

            target.hitFlashTime = target.hitFlashDuration
            target.health -= shockwaveDamage

            if (this.particleSystem) {
                this.particleSystem.spawnExplosion(target.x, target.y, 2, "#8be8ff")
            }

            if (target.health <= 0 && this.collisionSystem) {
                this.collisionSystem.destroyTarget(
                    this.targets,
                    i,
                    null,
                    { allowPulseShockwave: false }
                )
            }
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

        this.transportCharge += amount

        if (this.transportCharge >= this.transportChargeRequired) {
            this.transportCharge = this.transportChargeRequired
            this.transportReady = true

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

    resetProgression() {

        this.setPointsRaw(0)

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

        this.laserTypeStats = this.createLaserTypeStats()
        this.fireInterval = 1 / this.laserFireRate

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
        this.transportChargeRequired = Math.floor(this.transportChargeRequired * TRANSPORT_CHARGE_GROWTH)
        this.transportBeam.particles = []
        this.spawnSystem.baseSpawnRate *= WORLD_SPAWN_RATE_GROWTH

        this.floatingTexts.push(
            {
                x: this.gridX + this.gridWidth / 2,
                y: this.canvas.height / 2,
                text: "WORLD " + this.worldLevel,
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

                this.floatingTexts.push(
                    new FloatingText(
                        target.x + (Math.random() - 0.5) * 10,
                        target.y + (Math.random() - 0.5) * 10,
                        "-" + this.clickDamage,
                        "#ff9a66"
                    )
                )

                target.hitFlashTime = target.hitFlashDuration
                target.health -= this.clickDamage

                if (target.health <= 0) {
                    this.particleSystem.spawnExplosion(target.x, target.y, 12, "#ffb84d")
                    this.points += target.value
                    this.floatingTexts.push(
                        new FloatingText(
                            target.x + (Math.random() - 0.5) * 10,
                            target.y + (Math.random() - 0.5) * 10,
                            "+" + target.value,
                            "#ffffff"
                        )
                    )
                    this.targets.splice(i, 1)
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

        if (this.gameState !== GAME_STATE_PLAYING) {
            return
        }

        if (this.showTargetIndex) {
            return
        }

        if (this.showInfoScreen) {
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
                this.advanceWorld()
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
            this.drawTitleScreen(this.ctx)
            if (this.showInfoScreen) {
                this.drawInfoScreen(this.ctx)
            }
            if (this.showTargetIndex) {
                this.drawTargetIndex(this.ctx)
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

        this.drawLaserEmitter(this.ctx)
        for (let laser of this.lasers) {
            laser.draw(this.ctx)
        }   
        this.drawPulseShockwaves(this.ctx)

        this.particleSystem.draw(this.ctx)

        for (let text of this.floatingTexts) {
            text.draw(this.ctx)
        }

        if (this.showPauseMenu) {
            this.drawPauseMenu(this.ctx)
        }

        if (this.showInfoScreen) {
            this.drawInfoScreen(this.ctx)
        }

        if (this.showTargetIndex) {
            this.drawTargetIndex(this.ctx)
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

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        const bgGradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height)
        bgGradient.addColorStop(0, "#050914")
        bgGradient.addColorStop(1, "#0b1020")
        ctx.fillStyle = bgGradient
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        ctx.save()
        ctx.strokeStyle = "rgba(58,134,255,0.12)"
        ctx.lineWidth = 1
        const spacing = 42
        for (let x = 0; x <= this.canvas.width; x += spacing) {
            ctx.beginPath()
            ctx.moveTo(x + 0.5, 0)
            ctx.lineTo(x + 0.5, this.canvas.height)
            ctx.stroke()
        }
        for (let y = 0; y <= this.canvas.height; y += spacing) {
            ctx.beginPath()
            ctx.moveTo(0, y + 0.5)
            ctx.lineTo(this.canvas.width, y + 0.5)
            ctx.stroke()
        }
        ctx.restore()

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

        drawTitleCard(buttons.startButton, "Start Game", "simpleLaser")
        drawTitleCard(buttons.infoButton, "Info", "targetValue")
        drawTitleCard(buttons.targetIndexButton, "Target Index", "diversity")

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
        ctx.fillText("PAUSED", this.canvas.width / 2, (this.canvas.height / 2) - 170)
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

        const rowHeight = 34
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

                ctx.font = "bold 15px Arial"
                ctx.fillStyle = discovered ? "#7dd3ff" : "rgba(255,255,255,0.65)"
                ctx.fillText(
                    discovered ? "✔ " + entry.label : "❓ Unknown",
                    layout.content.x + 14,
                    rowY + ((rowHeight - 4) / 2)
                )
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
                const enabled = isUnlocked || (canPurchase && this.points >= unlockCost)

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
                        this.points >= this.upgradeSystem.getPulseMasteryCost()
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
                        this.points >= this.upgradeSystem.getScatterMasteryCost()
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
                        this.points >= this.upgradeSystem.getHeavyMasteryCost()
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
                    this.points >= targetValueCost
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
                    this.points >= targetSpawnRateCost
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
                    this.points >= targetDiversityCost
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
                    this.points >= clickDamageCost
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
                        this.points >= this.autoFireCost
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
            const statusY = contentY + 62
            const modifiersLabelY = contentY + 88
            const modifierLineHeight = 18
            const modifierEntries = this.activeWorldModifiers.length > 0
                ? this.activeWorldModifiers
                : ["none"]
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
                this.ctx.fillText("World Level: " + this.worldLevel, contentX, contentY + 16, contentWidth)
                this.ctx.fillText(
                    "Transport Charge: " + this.transportCharge + " / " + this.transportChargeRequired,
                    contentX,
                    contentY + 38,
                    contentWidth
                )

                if (this.transportAnimating) {
                    this.ctx.fillStyle = "#6d5fbf"
                    this.ctx.font = "bold 16px Arial"
                    this.ctx.fillText("TRANSPORTING...", contentX, statusY, contentWidth)
                } else if (this.transportReady) {
                    this.ctx.fillStyle = "#0f6a7a"
                    this.ctx.font = "bold 16px Arial"
                    this.ctx.fillText("ACTIVATE TRANSPORT BEAM", contentX, statusY, contentWidth)
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

        const iconSize = 48
        const iconX = x + 12
        const iconY = y + ((height - iconSize) / 2)
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
