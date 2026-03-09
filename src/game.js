import { SpawnSystem } from "./spawn.js"
import { Laser } from "./laser.js"
import { CollisionSystem } from "./collision.js"
import { FloatingText } from "./floatingText.js"
import { UpgradeSystem } from "./upgrades.js"
import { TargetUpgradeSystem } from "./targetUpgrades.js"
import { LASER_TYPES } from "./laserTypes.js"
import {
    SIMPLE_LASER_COST,
    PLASMA_UNLOCK_POINTS,
    AUTO_FIRE_COST,
    AUTO_FIRE_SPEED_MULTIPLIER,
    BASE_MANUAL_FIRE_COOLDOWN,
    DEV_STARTING_POINTS,
    LASER_BASE_STRENGTH,
    MAX_LASER_STRENGTH
} from "./constants.js"

export class Game {

    constructor(canvas) {

        this.canvas = canvas
        this.ctx = canvas.getContext("2d")

        this.lastTime = 0
        this.points = DEV_STARTING_POINTS
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
        this.currentLaserType = "simple"
        this.laserTypeStats = this.createLaserTypeStats()
        this.defineLaserStatAccessors()
        this.lastAutoShotTime = -Infinity
        this.lastManualShotTime = -Infinity
        this.fireInterval = 1 / this.laserFireRate
        this.panelWidth = 300
        this.gridX = this.panelWidth
        this.gridWidth = this.canvas.width - this.panelWidth
        this.panelScroll = 0
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
        this.frequencyButton = {
            x: 20,
            y: 210,
            width: this.panelWidth - 40,
            height: 72
        }
        this.amplitudeButton = {
            x: 20,
            y: 290,
            width: this.panelWidth - 40,
            height: 72
        }
        this.fireRateButton = {
            x: 20,
            y: 370,
            width: this.panelWidth - 40,
            height: 72
        }
        this.strengthButton = {
            x: 20,
            y: 450,
            width: this.panelWidth - 40,
            height: 72
        }
        this.targetValueButton = {
            x: 20,
            y: 560,
            width: this.panelWidth - 40,
            height: 60
        }
        this.targetSpawnRateButton = {
            x: 20,
            y: 630,
            width: this.panelWidth - 40,
            height: 60
        }
        this.targetDiversityButton = {
            x: 20,
            y: 700,
            width: this.panelWidth - 40,
            height: 60
        }
        this.autoFireButton = {
            x: 20,
            y: 790,
            width: this.panelWidth - 40,
            height: 30
        }

        this.spawnSystem = new SpawnSystem(this)
        this.collisionSystem = new CollisionSystem(this)
        this.upgradeSystem = new UpgradeSystem(this)
        this.targetUpgradeSystem = new TargetUpgradeSystem(this)
        this.canvas.addEventListener("click", (event) => {
            this.handleClick(event)
        })
        this.canvas.addEventListener("wheel", (event) => {
            this.handleWheel(event)
        }, { passive: false })
    }

    createLaserTypeStats() {

        const stats = {}

        for (const [typeId, laserType] of Object.entries(LASER_TYPES)) {
            stats[typeId] = {
                frequency: laserType.baseFrequency,
                amplitude: laserType.baseAmplitude,
                width: laserType.baseWidth,
                fireRate: laserType.baseFireRate,
                strength: LASER_BASE_STRENGTH
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
        if (typeId === "plasma" && !this.plasmaUnlocked) return
        if (!LASER_TYPES[typeId]) return

        this.currentLaserType = typeId
        this.fireInterval = 1 / this.laserFireRate
        this.lastAutoShotTime = -Infinity
        this.lastManualShotTime = -Infinity

    }

    handleClick(event) {

        const rect = this.canvas.getBoundingClientRect()
        const mouseX = event.clientX - rect.left
        const mouseY = event.clientY - rect.top

        if (mouseX < 0 || mouseX > this.canvas.width || mouseY < 0 || mouseY > this.canvas.height) {
            return
        }

        if (mouseX < this.panelWidth) {
            this.handlePanelClick(mouseX, mouseY + this.panelScroll)
            return
        }

        this.handleGridClick(mouseX, mouseY)

    }

    getPanelContentHeight() {

        return this.autoFireButton.y + this.autoFireButton.height + 40

    }

    getMaxPanelScroll() {

        return Math.max(0, this.getPanelContentHeight() - this.canvas.height)

    }

    clampPanelScroll() {

        this.panelScroll = Math.max(0, Math.min(this.panelScroll, this.getMaxPanelScroll()))

    }

    handleWheel(event) {

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

    }

    handlePanelClick(mouseX, mouseY) {

        if (!this.hasLaser) {

            if (!this.isInsideButton(mouseX, mouseY, this.unlockButton)) return
            if (this.points < this.simpleLaserCost) return

            this.points -= this.simpleLaserCost
            this.hasLaser = true

            this.floatingTexts.push(
                new FloatingText(
                    this.gridX + this.gridWidth / 2,
                    this.canvas.height / 2,
                    "Laser Unlocked"
                )
            )

            return
        }

        if (!this.plasmaUnlocked) {

            if (this.isInsideButton(mouseX, mouseY, this.plasmaUnlockButton)) {

                if (this.points < this.plasmaUnlockPoints) return

                this.plasmaUnlocked = true
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
        }

        if (this.isInsideButton(mouseX, mouseY, this.frequencyButton)) {
            this.upgradeSystem.buy("frequency")
            return
        }

        if (this.isInsideButton(mouseX, mouseY, this.amplitudeButton)) {
            this.upgradeSystem.buy("amplitude")
            return
        }

        if (this.autoFireUnlocked && this.isInsideButton(mouseX, mouseY, this.fireRateButton)) {
            this.upgradeSystem.buy("fireRate")
            return
        }

        if (this.isInsideButton(mouseX, mouseY, this.strengthButton)) {
            this.upgradeSystem.buy("strength")
            return
        }

        if (this.isInsideButton(mouseX, mouseY, this.targetValueButton)) {
            this.targetUpgradeSystem.buy("value")
            return
        }

        if (this.isInsideButton(mouseX, mouseY, this.targetSpawnRateButton)) {
            this.targetUpgradeSystem.buy("spawnRate")
            return
        }

        if (this.isInsideButton(mouseX, mouseY, this.targetDiversityButton)) {
            this.targetUpgradeSystem.buy("diversity")
            return
        }

        if (this.isInsideButton(mouseX, mouseY, this.autoFireButton)) {

            if (this.autoFireUnlocked) return
            if (this.points < this.autoFireCost) return

            this.points -= this.autoFireCost
            this.autoFireUnlocked = true
            this.autoFireEnabled = true
            this.lastAutoShotTime = -Infinity

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

    fireLaser() {

        if (!this.hasLaser) return

        const phase = Math.random() * Math.PI * 2
        const laserType = LASER_TYPES[this.currentLaserType]
        const colors = laserType.colors
        const color = colors[Math.floor(Math.random() * colors.length)]

        const laser = new Laser(this, phase, color)
        laser.fire()
        this.lasers.push(laser)

    }

    getManualFireInterval() {

        const baseFireRate = LASER_TYPES[this.currentLaserType].baseFireRate
        const fireRateMultiplier = this.laserFireRate / baseFireRate

        return this.baseManualFireCooldown / fireRateMultiplier

    }

    handleGridClick(mouseX, mouseY) {

        // 1. Check if clicking a target
        for (let i = this.targets.length - 1; i >= 0; i--) {

            const target = this.targets[i]

            const dx = mouseX - target.x
            const dy = mouseY - target.y

            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < target.radius) {

                this.floatingTexts.push(
                    new FloatingText(target.x, target.y, "+" + target.value)
                )

                this.points += target.value
                this.targets.splice(i, 1)

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

        this.spawnSystem.update(delta)
        this.updateAutoFire()

        for (let laser of this.lasers) {
            laser.update(delta)
        }
        this.lasers = this.lasers.filter(laser => laser.active)

        for (let target of this.targets) {

            target.update(delta) 
        }
        this.collisionSystem.check()

        for (let text of this.floatingTexts) {
            text.update(delta)
        }
        this.floatingTexts = this.floatingTexts.filter(t => t.life > 0)

    }

    updateAutoFire() {

        if (!this.hasLaser) return
        if (!this.autoFireEnabled) return

        const now = performance.now() / 1000
        const autoFireInterval = this.fireInterval * this.autoFireSpeedMultiplier

        if (now - this.lastAutoShotTime < autoFireInterval) {
            return
        }

        this.lastAutoShotTime = now
        this.fireLaser()

    }

    render() {

        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)
        this.drawPanel()
        this.drawGrid(100)

        for (let target of this.targets) {
            target.draw(this.ctx)
        }

        for (let laser of this.lasers) {
            laser.draw(this.ctx)
        }   

        for (let text of this.floatingTexts) {
            text.draw(this.ctx)
        }
    }

    drawGrid(offsetY) {

        const ctx = this.ctx
        const gridSize = 40

        ctx.strokeStyle = "#e6e6e6"
        ctx.lineWidth = 1

        for (let x = 0; x < this.canvas.width; x += gridSize) {

            ctx.beginPath()
            ctx.moveTo(x + this.gridX, 0)
            ctx.lineTo(x + this.gridX, this.canvas.height)
            ctx.stroke()

        }

        for (let y = 0; y < this.canvas.height; y += gridSize) {

            ctx.beginPath()
            ctx.moveTo(this.gridX, y)
            ctx.lineTo(this.canvas.width, y)
            ctx.stroke()

        }

    
    
    }

    drawPanel() {

        const ctx = this.ctx

        ctx.fillStyle = "#e2e2db"
        ctx.fillRect(0, 0, this.panelWidth, this.canvas.height)

        ctx.strokeStyle = "#222"
        ctx.lineWidth = 2
        ctx.strokeRect(0, 0, this.panelWidth, this.canvas.height)
        this.clampPanelScroll()

        ctx.save()
        ctx.beginPath()
        ctx.rect(0, 0, this.panelWidth, this.canvas.height)
        ctx.clip()
        ctx.translate(0, -this.panelScroll)

        ctx.fillStyle = "#111"
        ctx.font = "20px Arial"

        ctx.fillText("Points: " + this.points, 20, 40)
        this.drawPanelSectionHeader("LASERS", 20, this.unlockButton.y - 44)

        if (!this.hasLaser) {

            const button = this.unlockButton

            ctx.fillStyle = "#e2e2db"
            ctx.fillRect(button.x, button.y, button.width, button.height)

            ctx.strokeStyle = "#222"
            ctx.lineWidth = 2
            ctx.strokeRect(button.x, button.y, button.width, button.height)

            ctx.fillStyle = "#111"
            ctx.font = "18px Arial"
            ctx.fillText("Unlock Simple Laser", button.x + 12, button.y + 32)
            ctx.font = "16px Arial"
            ctx.fillText("Cost: " + this.simpleLaserCost, button.x + 12, button.y + 58)
        } else {

            ctx.fillStyle = "#333"
            ctx.font = "16px Arial"
            ctx.fillText("Active: " + LASER_TYPES[this.currentLaserType].name, 20, 76)

            if (!this.plasmaUnlocked) {

                this.drawPanelActionButton(
                    this.plasmaUnlockButton,
                    "Unlock Plasma Laser",
                    "Milestone: " + this.plasmaUnlockPoints,
                    this.points >= this.plasmaUnlockPoints
                )

            } else {

                this.drawPanelActionButton(
                    this.simpleLaserButton,
                    "Simple Laser",
                    this.currentLaserType === "simple" ? "Active" : "Switch",
                    true,
                    this.currentLaserType === "simple"
                )

                this.drawPanelActionButton(
                    this.plasmaLaserButton,
                    "Plasma Laser",
                    this.currentLaserType === "plasma" ? "Active" : "Switch",
                    true,
                    this.currentLaserType === "plasma"
                )

            }

            const frequencyCost = this.upgradeSystem.getFrequencyCost()
            const amplitudeCost = this.upgradeSystem.getAmplitudeCost()
            const fireRateCost = this.upgradeSystem.getFireRateCost()
            const strengthCost = this.upgradeSystem.getStrengthCost()
            const strengthMaxed = this.laserStrength >= MAX_LASER_STRENGTH
            const targetValueCost = this.targetUpgradeSystem.getValueCost()
            const targetSpawnRateCost = this.targetUpgradeSystem.getSpawnRateCost()
            const targetDiversityCost = this.targetUpgradeSystem.getDiversityCost()
            this.drawPanelSectionHeader("LASER UPGRADES", 20, this.frequencyButton.y - 44)

            this.drawPanelButton(
                this.frequencyButton,
                "Increase Frequency",
                frequencyCost,
                this.upgradeSystem.frequencyLevel,
                this.points >= frequencyCost
            )

            this.drawPanelButton(
                this.amplitudeButton,
                "Increase Amplitude",
                amplitudeCost,
                this.upgradeSystem.amplitudeLevel,
                this.points >= amplitudeCost
            )

            if (this.autoFireUnlocked) {
                this.drawPanelButton(
                    this.fireRateButton,
                    "Increase Fire Rate",
                    fireRateCost,
                    this.upgradeSystem.fireRateLevel,
                    this.points >= fireRateCost
                )
            }

            this.drawPanelButton(
                this.strengthButton,
                "Increase Laser Strength",
                strengthCost,
                this.upgradeSystem.strengthLevel,
                !strengthMaxed && this.points >= strengthCost
            )

            this.drawPanelSectionHeader("TARGET ECONOMY", 20, this.targetValueButton.y - 44)
            this.drawPanelButton(
                this.targetValueButton,
                "Increase Target Value",
                targetValueCost,
                this.targetUpgradeSystem.valueLevel,
                this.points >= targetValueCost
            )

            this.drawPanelButton(
                this.targetSpawnRateButton,
                "Increase Spawn Rate",
                targetSpawnRateCost,
                this.targetUpgradeSystem.spawnRateLevel,
                this.points >= targetSpawnRateCost
            )

            this.drawPanelButton(
                this.targetDiversityButton,
                "Increase Target Diversity",
                targetDiversityCost,
                this.targetUpgradeSystem.diversityLevel,
                this.points >= targetDiversityCost
            )

            this.drawPanelSectionHeader("AUTOMATION", 20, this.autoFireButton.y - 44)
            if (!this.autoFireUnlocked) {
                this.drawPanelActionButton(
                    this.autoFireButton,
                    "Enable Auto Fire",
                    "Cost: " + this.autoFireCost,
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

        ctx.restore()

    }

    drawPanelSectionHeader(label, x, y) {

        const ctx = this.ctx

        ctx.fillStyle = "#2f2f2f"
        ctx.font = "bold 16px Arial"
        ctx.fillText(label, x, y)
        this.drawPanelDivider(y + 6)

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

    drawPanelActionButton(button, title, subtitle, enabled, active = false) {

        const ctx = this.ctx

        ctx.fillStyle = active
            ? "#bfd7ff"
            : enabled
                ? "#d7d7cf"
                : "#c2c2bc"
        ctx.fillRect(button.x, button.y, button.width, button.height)

        ctx.strokeStyle = active
            ? "#2f5ea8"
            : enabled
                ? "#222"
                : "#555"
        ctx.lineWidth = 2
        ctx.strokeRect(button.x, button.y, button.width, button.height)

        ctx.fillStyle = active
            ? "#1f3560"
            : enabled
                ? "#111"
                : "#5a5a5a"

        const useTwoLines = Boolean(subtitle) && button.height >= 60

        if (useTwoLines) {
            ctx.font = "18px Arial"
            ctx.fillText(title, button.x + 12, button.y + 32)
            ctx.font = "15px Arial"
            ctx.fillText(subtitle, button.x + 12, button.y + 58)
        } else {
            ctx.font = "17px Arial"
            const singleLineText = subtitle ? title + " - " + subtitle : title
            const singleLineY = button.y + (button.height / 2) + 6
            ctx.fillText(singleLineText, button.x + 12, singleLineY)
        }

    }

    drawPanelButton(button, label, cost, level, affordable) {

        const ctx = this.ctx

        ctx.fillStyle = affordable ? "#d7d7cf" : "#c2c2bc"
        ctx.fillRect(button.x, button.y, button.width, button.height)

        ctx.strokeStyle = affordable ? "#222" : "#555"
        ctx.lineWidth = 2
        ctx.strokeRect(button.x, button.y, button.width, button.height)

        ctx.fillStyle = affordable ? "#111" : "#5a5a5a"
        ctx.font = "17px Arial"
        ctx.fillText(label, button.x + 12, button.y + 28)
        ctx.font = "15px Arial"
        ctx.fillText("Cost: " + cost, button.x + 12, button.y + 52)

        ctx.textAlign = "right"
        ctx.fillText("Lv " + level, button.x + button.width - 12, button.y + 52)
        ctx.textAlign = "left"

    }


}
