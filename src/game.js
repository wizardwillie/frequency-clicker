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
        this.worldLevel = WORLD_START_LEVEL
        this.transportCharge = 0
        this.transportChargeRequired = TRANSPORT_INITIAL_CHARGE_REQUIRED
        this.transportReady = false
        this.transportAnimating = false
        this.transportAnimationTime = 0
        this.transportAnimationDuration = 1.2

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
        this.simpleLaserCost = SIMPLE_LASER_COST
        this.autoFireCost = AUTO_FIRE_COST
        this.autoFireSpeedMultiplier = AUTO_FIRE_SPEED_MULTIPLIER
        this.baseManualFireCooldown = BASE_MANUAL_FIRE_COOLDOWN
        this.autoFireUnlocked = false
        this.autoFireEnabled = false
        this.plasmaUnlockPoints = PLASMA_UNLOCK_POINTS
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

    getCurrentWorldConfig() {

        return WORLD_DATA[this.worldLevel] || WORLD_DATA[1]

    }

    handleClick(event) {

        const rect = this.canvas.getBoundingClientRect()
        const mouseX = event.clientX - rect.left
        const mouseY = event.clientY - rect.top

        if (mouseX < 0 || mouseX > this.canvas.width || mouseY < 0 || mouseY > this.canvas.height) {
            return
        }

        if (this.gameState === GAME_STATE_TITLE) {
            this.handleTitleClick(mouseX, mouseY)
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

        if (this.gameState !== GAME_STATE_PLAYING) {
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
            if (!this.plasmaUnlocked) {
                buttons.push(this.plasmaUnlockButton)
            } else {
                buttons.push(
                    this.simpleLaserButton,
                    this.plasmaLaserButton,
                    this.pulseLaserButton,
                    this.scatterLaserButton,
                    this.heavyLaserButton
                )
            }
        }

        if (this.plasmaUnlocked && this.isPanelSectionExpanded("mastery")) {
            buttons.push(
                this.pulseMasteryButton,
                this.scatterMasteryButton,
                this.heavyMasteryButton
            )
        }

        if (this.isPanelSectionExpanded("laserUpgrades")) {
            buttons.push(this.frequencyButton, this.amplitudeButton)

            if (this.autoFireUnlocked) {
                buttons.push(this.fireRateButton)
            }

            buttons.push(this.strengthButton)
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

        if (this.gameState !== GAME_STATE_PLAYING) {
            this.canvas.style.cursor = "default"
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
        const startY = (this.canvas.height / 2) - 24

        return {
            continueButton: {
                x,
                y: startY,
                width: buttonWidth,
                height: buttonHeight
            },
            newGameButton: {
                x,
                y: startY + buttonHeight + buttonGap,
                width: buttonWidth,
                height: buttonHeight
            },
            resetButton: {
                x,
                y: startY + (buttonHeight + buttonGap) * 2,
                width: buttonWidth,
                height: buttonHeight
            }
        }

    }

    handleTitleClick(mouseX, mouseY) {

        const buttons = this.getTitleButtons()

        if (this.isInsideButton(mouseX, mouseY, buttons.continueButton)) {
            this.gameState = GAME_STATE_PLAYING
            return
        }

        if (this.isInsideButton(mouseX, mouseY, buttons.newGameButton)) {
            this.saveSystem.reset()
            this.gameState = GAME_STATE_PLAYING
            return
        }

        if (this.isInsideButton(mouseX, mouseY, buttons.resetButton)) {
            this.saveSystem.reset()
            location.reload()
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
            if (!this.plasmaUnlocked) {

                if (this.isInsideButton(mouseX, mouseY, this.plasmaUnlockButton)) {

                    if (this.points < this.plasmaUnlockPoints) return

                    this.plasmaUnlocked = true
                    this.pulseUnlocked = true
                    this.scatterUnlocked = true
                    this.heavyUnlocked = true
                    this.triggerUpgradeFlash(this.plasmaUnlockButton)
                    this.floatingTexts.push(
                        new FloatingText(
                            this.gridX + this.gridWidth / 2,
                            this.canvas.height / 2 - 28,
                            "Plasma Laser Unlocked"
                        )
                    )

                    return
                }
            } else {

                if (this.isInsideButton(mouseX, mouseY, this.simpleLaserButton)) {
                    this.switchLaserType("simple")
                    return
                }

                if (this.isInsideButton(mouseX, mouseY, this.plasmaLaserButton)) {
                    this.switchLaserType("plasma")
                    return
                }

                if (this.isInsideButton(mouseX, mouseY, this.pulseLaserButton)) {
                    this.switchLaserType("pulse")
                    return
                }

                if (this.isInsideButton(mouseX, mouseY, this.scatterLaserButton)) {
                    this.switchLaserType("scatter")
                    return
                }

                if (this.isInsideButton(mouseX, mouseY, this.heavyLaserButton)) {
                    this.switchLaserType("heavy")
                    return
                }
            }
        }

        if (this.isPanelSectionExpanded("mastery") && this.plasmaUnlocked) {
            if (this.isInsideButton(mouseX, mouseY, this.pulseMasteryButton)) {
                const purchased = this.upgradeSystem.buy("pulseMastery")
                if (purchased) this.triggerUpgradeFlash(this.pulseMasteryButton)
                return
            }

            if (this.isInsideButton(mouseX, mouseY, this.scatterMasteryButton)) {
                const purchased = this.upgradeSystem.buy("scatterMastery")
                if (purchased) this.triggerUpgradeFlash(this.scatterMasteryButton)
                return
            }

            if (this.isInsideButton(mouseX, mouseY, this.heavyMasteryButton)) {
                const purchased = this.upgradeSystem.buy("heavyMastery")
                if (purchased) this.triggerUpgradeFlash(this.heavyMasteryButton)
                return
            }
        }

        if (this.isPanelSectionExpanded("laserUpgrades")) {
            if (this.isInsideButton(mouseX, mouseY, this.frequencyButton)) {
                const purchased = this.upgradeSystem.buy("frequency")
                if (purchased) this.triggerUpgradeFlash(this.frequencyButton)
                return
            }

            if (this.isInsideButton(mouseX, mouseY, this.amplitudeButton)) {
                const purchased = this.upgradeSystem.buy("amplitude")
                if (purchased) this.triggerUpgradeFlash(this.amplitudeButton)
                return
            }

            if (this.autoFireUnlocked && this.isInsideButton(mouseX, mouseY, this.fireRateButton)) {
                const purchased = this.upgradeSystem.buy("fireRate")
                if (purchased) this.triggerUpgradeFlash(this.fireRateButton)
                return
            }

            if (this.isInsideButton(mouseX, mouseY, this.strengthButton)) {
                const purchased = this.upgradeSystem.buy("strength")
                if (purchased) this.triggerUpgradeFlash(this.strengthButton)
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

        this.gridOffset += delta * 10
        if (this.gridOffset > 40) {
            this.gridOffset = 0
        }
        this.updateUpgradeFlashes(delta)
        this.transportBeam.update(delta)
        this.updatePulseShockwaves(delta)

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
            laser.update(delta)
        }
        this.lasers = this.lasers.filter(laser => laser.active)

        for (let target of this.targets) {
            target.gridLeftBoundary = this.gridX
            target.update(delta) 
        }
        this.targets = this.targets.filter(target => !target.shouldRemove)
        this.collisionSystem.check()
        this.particleSystem.update(delta)

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
    }

    drawLaserEmitter(ctx) {

        const x = this.gridX + 20
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

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        ctx.fillStyle = "#101214"
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        ctx.fillStyle = "#f4f4ee"
        ctx.font = "bold 58px Arial"
        ctx.textAlign = "center"
        ctx.fillText("Frequency Laser Clicker", centerX, 180)

        ctx.fillStyle = "#c8c8c0"
        ctx.font = "20px Arial"
        ctx.fillText("Choose an option to begin", centerX, 228)
        ctx.textAlign = "left"

        this.drawTitleButton(buttons.continueButton, "Continue")
        this.drawTitleButton(buttons.newGameButton, "New Game")
        this.drawTitleButton(buttons.resetButton, "Reset Progress", true)

    }

    drawGrid() {

        const ctx = this.ctx
        const spacing = 40
        const startX = this.gridX - this.gridOffset

        ctx.save()
        ctx.beginPath()
        ctx.rect(this.gridX, 0, this.gridWidth, this.canvas.height)
        ctx.clip()

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

        if (this.hasLaser && this.plasmaUnlocked) {
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

            if (!isLayoutOnly) {
                this.ctx.fillStyle = "#333"
                this.ctx.font = "16px Arial"
                this.ctx.fillText("Active: " + LASER_TYPES[this.currentLaserType].name, sectionX, contentY + 14)
            }
            contentY += 24

            if (!this.plasmaUnlocked) {
                this.plasmaUnlockButton.y = contentY

                if (!isLayoutOnly) {
                    this.drawPanelActionButton(
                        this.plasmaUnlockButton,
                        "Unlock Plasma Laser",
                        "Milestone: " + this.plasmaUnlockPoints,
                        this.points >= this.plasmaUnlockPoints
                    )
                }

                return contentY + this.plasmaUnlockButton.height + cardSpacing
            }

            const laserButtons = [
                [this.simpleLaserButton, "Simple Laser", this.currentLaserType === "simple"],
                [this.plasmaLaserButton, "Plasma Laser", this.currentLaserType === "plasma"],
                [this.pulseLaserButton, "Pulse Laser", this.currentLaserType === "pulse"],
                [this.scatterLaserButton, "Scatter Laser", this.currentLaserType === "scatter"],
                [this.heavyLaserButton, "Heavy Laser", this.currentLaserType === "heavy"]
            ]

            for (const [button, title, isActive] of laserButtons) {
                button.y = contentY

                if (!isLayoutOnly) {
                    this.drawPanelActionButton(
                        button,
                        title,
                        isActive ? "Active" : "Switch",
                        true,
                        isActive
                    )
                }

                contentY += button.height + cardSpacing
            }

            return contentY
        }

        if (sectionId === "mastery") {
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

            return contentY
        }

        if (sectionId === "laserUpgrades") {
            const activeLaserStats = this.laserTypeStats[this.currentLaserType]
            const strengthMaxed = this.laserStrength >= MAX_LASER_STRENGTH

            this.frequencyButton.y = contentY
            if (!isLayoutOnly) {
                const frequencyCost = this.upgradeSystem.getFrequencyCost()
                this.drawPanelButton(
                    this.frequencyButton,
                    "Increase Frequency",
                    frequencyCost,
                    activeLaserStats.frequencyLevel,
                    this.points >= frequencyCost
                )
            }
            contentY += this.frequencyButton.height + cardSpacing

            this.amplitudeButton.y = contentY
            if (!isLayoutOnly) {
                const amplitudeCost = this.upgradeSystem.getAmplitudeCost()
                this.drawPanelButton(
                    this.amplitudeButton,
                    "Increase Amplitude",
                    amplitudeCost,
                    activeLaserStats.amplitudeLevel,
                    this.points >= amplitudeCost
                )
            }
            contentY += this.amplitudeButton.height + cardSpacing

            if (this.autoFireUnlocked) {
                this.fireRateButton.y = contentY
                if (!isLayoutOnly) {
                    const fireRateCost = this.upgradeSystem.getFireRateCost()
                    this.drawPanelButton(
                        this.fireRateButton,
                        "Increase Fire Rate",
                        fireRateCost,
                        activeLaserStats.fireRateLevel,
                        this.points >= fireRateCost
                    )
                }
                contentY += this.fireRateButton.height + cardSpacing
            } else {
                this.fireRateButton.y = contentY
            }

            this.strengthButton.y = contentY
            if (!isLayoutOnly) {
                const strengthCost = this.upgradeSystem.getStrengthCost()
                this.drawPanelButton(
                    this.strengthButton,
                    "Increase Laser Strength",
                    strengthCost,
                    activeLaserStats.strengthLevel,
                    !strengthMaxed && this.points >= strengthCost
                )
            }
            contentY += this.strengthButton.height + cardSpacing

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

            if (!isLayoutOnly) {
                this.ctx.fillStyle = "#1f1f1f"
                this.ctx.font = "16px Arial"
                this.ctx.fillText("World Level: " + this.worldLevel, sectionX, contentY + 16)
                this.ctx.fillText(
                    "Transport Charge: " + this.transportCharge + " / " + this.transportChargeRequired,
                    sectionX,
                    contentY + 38
                )

                if (this.transportAnimating) {
                    this.ctx.fillStyle = "#6d5fbf"
                    this.ctx.font = "bold 16px Arial"
                    this.ctx.fillText("TRANSPORTING...", sectionX, contentY + 62)
                } else if (this.transportReady) {
                    this.ctx.fillStyle = "#0f6a7a"
                    this.ctx.font = "bold 16px Arial"
                    this.ctx.fillText("ACTIVATE TRANSPORT BEAM", sectionX, contentY + 62)
                }
            }

            return contentY + 80 + cardSpacing
        }

        return contentY + cardSpacing

    }

    drawPanel() {

        const ctx = this.ctx

        // Futuristic glass panel base.
        ctx.fillStyle = "#0f1118"
        ctx.fillRect(0, 0, this.panelWidth, this.canvas.height)

        // Subtle panel grid overlay.
        ctx.save()
        ctx.beginPath()
        ctx.rect(0, 0, this.panelWidth, this.canvas.height)
        ctx.clip()
        ctx.strokeStyle = "rgba(58,134,255,0.12)"
        ctx.lineWidth = 1

        const gridSpacing = 30
        for (let x = 0; x <= this.panelWidth; x += gridSpacing) {
            ctx.beginPath()
            ctx.moveTo(x + 0.5, 0)
            ctx.lineTo(x + 0.5, this.canvas.height)
            ctx.stroke()
        }
        for (let y = 0; y <= this.canvas.height; y += gridSpacing) {
            ctx.beginPath()
            ctx.moveTo(0, y + 0.5)
            ctx.lineTo(this.panelWidth, y + 0.5)
            ctx.stroke()
        }
        ctx.restore()

        // Thin glow frame.
        ctx.save()
        ctx.shadowColor = "#3a86ff"
        ctx.shadowBlur = 20
        ctx.strokeStyle = "rgba(58,134,255,0.65)"
        ctx.lineWidth = 1
        ctx.strokeRect(0.5, 0.5, this.panelWidth - 1, this.canvas.height - 1)
        ctx.restore()
        this.preparePanelLayout(true)
        this.clampPanelScroll()

        ctx.save()
        ctx.beginPath()
        ctx.rect(0, 0, this.panelWidth, this.canvas.height)
        ctx.clip()
        ctx.translate(0, -this.panelScroll)

        this.drawPointsHeader(ctx)
        this.drawOverchargeMeter(ctx)
        this.preparePanelLayout(false)

        this.drawUpgradeFlashes(ctx)

        ctx.restore()

    }

    drawPointsHeader(ctx) {

        const outerX = 20
        const outerY = 14
        const outerHeight = 44
        const innerWidth = this.panelWidth - 40
        const overchargeCardWidth = 104
        const cardGap = 8
        const pointsWidth = innerWidth - overchargeCardWidth - cardGap

        const cardGradient = ctx.createLinearGradient(outerX, outerY, outerX, outerY + outerHeight)
        cardGradient.addColorStop(0, "rgba(58,134,255,0.20)")
        cardGradient.addColorStop(1, "rgba(58,134,255,0)")

        ctx.save()
        this.drawRoundedRectPath(ctx, outerX, outerY, pointsWidth, outerHeight, 14)
        ctx.fillStyle = cardGradient
        ctx.fill()

        ctx.shadowColor = "#3a86ff"
        ctx.shadowBlur = 25
        this.drawRoundedRectPath(ctx, outerX, outerY, pointsWidth, outerHeight, 14)
        ctx.lineWidth = 1.2
        ctx.strokeStyle = "rgba(58,134,255,0.35)"
        ctx.stroke()

        ctx.shadowBlur = 0
        ctx.fillStyle = "rgba(202,227,255,0.9)"
        ctx.font = "bold 9px Arial"
        ctx.textBaseline = "alphabetic"
        ctx.fillText("ENERGY POINTS", outerX + 12, outerY + 13)

        ctx.fillStyle = "#e8f3ff"
        ctx.font = "28px monospace"
        ctx.fillText(String(this.points), outerX + 12, outerY + 39)
        ctx.restore()

    }

    drawOverchargeMeter(ctx) {

        const cardHeight = 44
        const cardWidth = 104
        const cardX = this.panelWidth - 20 - cardWidth
        const cardY = 14
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
        ctx.fillText("OVERCHARGE", cardX + 10, cardY + 13)

        ctx.textAlign = "right"
        ctx.fillStyle = "#f5ebff"
        ctx.font = "bold 12px monospace"
        ctx.fillText(percentText, cardX + cardWidth - 10, cardY + 13)
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
            iconId = null
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
        const titleY = y + 20
        const costY = y + height - 12
        const titleText = String(title).toUpperCase()
        const costText = String(cost || "")

        ctx.fillStyle = "#ffffff"
        ctx.font = "700 12px Arial"
        ctx.textAlign = "left"
        ctx.textBaseline = "top"
        ctx.fillText(titleText, textX, titleY)

        ctx.fillStyle = canAfford ? "#a6d1ff" : "rgba(255,255,255,0.6)"
        ctx.font = "12px monospace"
        ctx.textBaseline = "alphabetic"
        ctx.fillText(costText, textX, costY)

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
        const subtitleText = String(subtitle || "").trim().toLowerCase()
        const isSwitchCard = subtitleText === "switch" || subtitleText === "active"
        const hovered = this.isCardHovered(button)
        const flashIntensity = this.getCardFlashIntensity(button)
        const iconId = this.resolveActionCardIconId(title)
        const costText = typeof subtitle === "number"
            ? "Cost: " + subtitle
            : subtitle || (active ? "ONLINE" : "")
        const state = {
            title,
            cost: costText,
            level: 0,
            canAfford: enabled,
            selected: active,
            unlocked: active || isSwitchCard,
            hovered,
            flashIntensity,
            iconId
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
