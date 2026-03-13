export class Target {

    constructor(x, y, direction, speed, value, options = {}) {

        this.x = x
        this.y = y

        this.direction = direction
        this.speed = speed
        this.game = options.game ?? null

        this.type = options.type || "basic"
        this.value = value
        this.maxHealth = options.maxHealth ?? 1
        this.isHealer = options.isHealer ?? this.type === "healer"
        this.isExploder = options.isExploder ?? this.type === "exploder"
        this.isCrystal = options.isCrystal ?? this.type === "crystal"
        this.isElite = options.isElite ?? this.type === "elite"
        this.healPulseCooldown = options.healPulseCooldown ?? 1.6
        this.healPulseTimer = options.healPulseTimer ?? (Math.random() * this.healPulseCooldown)
        this.healRadius = options.healRadius ?? 120
        this.healAmount = options.healAmount ?? 1
        this.crystalDamageMultiplier = options.crystalDamageMultiplier ?? 0.55
        this.exploderBurstRadius = options.exploderBurstRadius ?? 120
        this.exploderBurstDamage = options.exploderBurstDamage ?? 2
        this.phaseTimer = options.phaseTimer ?? 0
        this.phaseDuration = options.phaseDuration ?? 2.2
        this.isPhased = options.isPhased ?? false
        this.chargeTimer = options.chargeTimer ?? 0
        this.chargeCooldown = options.chargeCooldown ?? 2.8
        this.chargeBurstDuration = options.chargeBurstDuration ?? 0.45
        this.chargeBurstTime = options.chargeBurstTime ?? 0
        this.chargeSpeedMultiplier = options.chargeSpeedMultiplier ?? 3
        this.hasShield = options.hasShield ?? false
        const defaultRadiusByType = {
            golden: 16,
            phantom: 17,
            ancient: 30,
            armored: 18,
            reinforced: 22,
            heavy: 26,
            healer: 14,
            exploder: 16,
            crystal: 20,
            elite: 18,
            shielded: 15,
            reflector: 18,
            splitter: 20,
            swarm: 6,
            boss: 48,
            fast: 10,
            phase: 16,
            charger: 19
        }
        const defaultRadius = defaultRadiusByType[this.type] ?? 14
        this.radius = options.radius ?? defaultRadius
        this.gridLeftBoundary = options.gridLeftBoundary ?? 300
        this.shouldRemove = false
        this._health = options.health ?? this.maxHealth
        Object.defineProperty(this, "health", {
            get: () => this._health,
            set: (value) => {
                const previousHealth = this._health
                let nextHealth = Math.max(0, value)

                if (this.type === "phase" && this.isPhased && nextHealth < previousHealth) {
                    return
                }

                if (this.isCrystal && nextHealth < previousHealth) {
                    const incomingDamage = previousHealth - nextHealth
                    const reducedDamage = incomingDamage * this.crystalDamageMultiplier
                    nextHealth = Math.max(0, previousHealth - reducedDamage)
                }

                this._health = nextHealth

                if (this.isExploder && previousHealth > 0 && nextHealth <= 0) {
                    this.triggerExploderBurst()
                }
            }
        })
        this.hitFlashDuration = 0.12
        this.hitFlashTime = 0
        this.pulseTime = Math.random() * Math.PI * 2
        this.phantomDriftTimer = options.phantomDriftTimer ?? (Math.random() * 2.5)
        this.phantomDriftInterval = options.phantomDriftInterval ?? (1.8 + (Math.random() * 1.6))
    }

    update(delta) {

        this.pulseTime += delta * 3

        if (!this.game && typeof window !== "undefined") {
            this.game = window.game || window.__frequencyLaserClickerGame || null
        }

        let moveSpeed = this.speed

        if (this.isHealer && this.game) {
            this.healPulseTimer += delta
            if (this.healPulseTimer >= this.healPulseCooldown) {
                this.healPulseTimer -= this.healPulseCooldown
                this.healNearbyTargets()
            }
        }

        if (this.type === "phase") {
            this.phaseTimer += delta
            if (this.phaseTimer >= this.phaseDuration) {
                this.phaseTimer -= this.phaseDuration
                this.isPhased = !this.isPhased
            }
        } else if (this.type === "charger") {
            this.chargeTimer += delta
            if (this.chargeTimer >= this.chargeCooldown) {
                this.chargeTimer -= this.chargeCooldown
                this.chargeBurstTime = this.chargeBurstDuration
            }

            if (this.chargeBurstTime > 0) {
                this.chargeBurstTime = Math.max(0, this.chargeBurstTime - delta)
                moveSpeed *= this.chargeSpeedMultiplier
            }
        } else if (this.type === "phantom") {
            this.phantomDriftTimer += delta
            if (this.phantomDriftTimer >= this.phantomDriftInterval) {
                this.phantomDriftTimer -= this.phantomDriftInterval
                this.phantomDriftInterval = 1.8 + (Math.random() * 1.6)

                const driftDistance = 22
                this.x += (Math.random() - 0.5) * driftDistance
                this.y += (Math.random() - 0.5) * driftDistance

                if (this.game) {
                    const minX = this.gridLeftBoundary + this.radius
                    const maxX = this.game.canvas.width - this.radius
                    const minY = this.radius
                    const maxY = this.game.canvas.height - this.radius
                    this.x = Math.max(minX, Math.min(maxX, this.x))
                    this.y = Math.max(minY, Math.min(maxY, this.y))
                }
            }
        }

        this.x += moveSpeed * this.direction * delta
        const hasMagneticTargets =
            this.game &&
            this.game.activeWorldModifiers &&
            this.game.activeWorldModifiers.includes("magneticTargets")

        if (hasMagneticTargets) {
            const emitterX = this.game.gridX + 20
            const emitterY = this.game.canvas.height / 2
            const dx = emitterX - this.x
            const dy = emitterY - this.y
            const dist = Math.sqrt(dx * dx + dy * dy)

            if (dist > 0) {
                this.x += (dx / dist) * 15 * delta
                this.y += (dy / dist) * 15 * delta
            }

            if (this.x < emitterX + 10) {
                this.x = emitterX + 10
            }
        }

        if (this.direction < 0 && this.x + this.radius < this.gridLeftBoundary) {
            this.shouldRemove = true
        }

        if (this.hitFlashTime > 0) {
            this.hitFlashTime = Math.max(0, this.hitFlashTime - delta)
        }

    }

    draw(ctx) {

        let fillColor = "#00ffff"
        let strokeColor = "#127f7f"
        let strokeWidth = 2
        let coreColor = "#b7ffff"
        let healthBarBackground = "#273127"
        let healthBarFill = "#8fff8f"
        let drawStroke = false
        let baseAlpha = 1
        const chargerWarningWindow = 0.4
        const isChargerWarning =
            this.type === "charger" &&
            this.chargeBurstTime <= 0 &&
            this.chargeTimer > Math.max(0, this.chargeCooldown - chargerWarningWindow)

        if (this.type === "golden") {
            fillColor = "#ffd700"
            strokeColor = "#b8860b"
            strokeWidth = 3
            coreColor = "#fff2a8"
            healthBarBackground = "#3a2c0f"
            healthBarFill = "#ffe37a"
            drawStroke = true
        } else if (this.type === "phantom") {
            fillColor = "#9b5cff"
            strokeColor = "#9b5cff"
            strokeWidth = 3
            coreColor = "#e3ccff"
            healthBarBackground = "#2a1a3f"
            healthBarFill = "#c6a0ff"
            drawStroke = true
            baseAlpha = 0.8 + (Math.sin(this.pulseTime * 3) * 0.08)
        } else if (this.type === "ancient") {
            fillColor = "#ff4a4a"
            strokeColor = "#5b1111"
            strokeWidth = 4
            coreColor = "#ff9c9c"
            healthBarBackground = "#3a1414"
            healthBarFill = "#ff6f6f"
            drawStroke = true
        } else if (this.type === "armored") {
            fillColor = "#56d17e"
            strokeColor = "#1d6a34"
            strokeWidth = 3
            coreColor = "#d9ffe6"
            drawStroke = true
        } else if (this.type === "reinforced") {
            fillColor = "#d14cff"
            strokeColor = "#6a1b9a"
            strokeWidth = 4
            coreColor = "#ffcbff"
            healthBarBackground = "#2d163b"
            healthBarFill = "#f08bff"
            drawStroke = true
        } else if (this.type === "heavy") {
            fillColor = "#8d2626"
            strokeColor = "#1a0e0e"
            strokeWidth = 4
            coreColor = "#ff9e9e"
            healthBarBackground = "#2f1a1a"
            healthBarFill = "#ff7a7a"
            drawStroke = true
        } else if (this.type === "healer") {
            fillColor = "#4ae486"
            strokeColor = "#1f6d3a"
            strokeWidth = 3
            coreColor = "#d8ffe8"
            healthBarBackground = "#1b3326"
            healthBarFill = "#93ffbc"
            drawStroke = true
        } else if (this.type === "exploder") {
            fillColor = "#ff7a3d"
            strokeColor = "#73240d"
            strokeWidth = 3
            coreColor = "#ffd2b3"
            healthBarBackground = "#3a1f16"
            healthBarFill = "#ffad7f"
            drawStroke = true
        } else if (this.type === "crystal") {
            fillColor = "#52c8ff"
            strokeColor = "#1e4f92"
            strokeWidth = 4
            coreColor = "#dbf3ff"
            healthBarBackground = "#182b46"
            healthBarFill = "#8ed8ff"
            drawStroke = true
        } else if (this.type === "elite") {
            fillColor = "#a86cff"
            strokeColor = "#4f2a8c"
            strokeWidth = 3
            coreColor = "#e6d3ff"
            healthBarBackground = "#24173b"
            healthBarFill = "#c9a5ff"
            drawStroke = true
        } else if (this.type === "shielded") {
            fillColor = this.hasShield ? "#4aa0ff" : "#2f6fd6"
            strokeColor = "#1c4f9e"
            strokeWidth = 3
            coreColor = "#c4e4ff"
            healthBarBackground = "#18273a"
            healthBarFill = "#8bc7ff"
            drawStroke = true
        } else if (this.type === "reflector") {
            fillColor = "#ffffff"
            strokeColor = "#2db8d1"
            strokeWidth = 3
            coreColor = "#ffffff"
            healthBarBackground = "#1b2d33"
            healthBarFill = "#8cefff"
            drawStroke = true
        } else if (this.type === "splitter") {
            fillColor = "#f4ad2e"
            strokeColor = "#5a2f00"
            strokeWidth = 3
            coreColor = "#ffe3a6"
            healthBarBackground = "#36230f"
            healthBarFill = "#ffd085"
            drawStroke = true
        } else if (this.type === "swarm") {
            fillColor = "#ffb45f"
            strokeColor = "#7a3b00"
            strokeWidth = 1.5
            coreColor = "#ffd8a8"
            drawStroke = true
        } else if (this.type === "boss") {
            fillColor = "#5c0d18"
            strokeColor = "#0b0b0b"
            strokeWidth = 7
            coreColor = "#ff7d8f"
            healthBarBackground = "#2d0d14"
            healthBarFill = "#ff5a6f"
            drawStroke = true
        } else if (this.type === "fast") {
            fillColor = "#ff8a2a"
            strokeColor = "#9e4a08"
            strokeWidth = 2
            coreColor = "#ffd0a1"
            drawStroke = true
        } else if (this.type === "phase") {
            fillColor = "#9868ff"
            strokeColor = "#3d268a"
            strokeWidth = 3
            coreColor = "#d9c8ff"
            healthBarBackground = "#211835"
            healthBarFill = "#b99eff"
            drawStroke = true
            if (this.isPhased) {
                const flicker = 0.35 + Math.sin(this.pulseTime * 24) * 0.1
                baseAlpha = Math.max(0.25, Math.min(0.45, flicker))
            }
        } else if (this.type === "charger") {
            fillColor = this.chargeBurstTime > 0
                ? "#ff9e57"
                : isChargerWarning
                    ? "#ffd47a"
                    : "#ff6942"
            strokeColor = isChargerWarning ? "#8a6431" : "#6e2314"
            strokeWidth = 3
            coreColor = isChargerWarning ? "#fff0c6" : "#ffd6b5"
            healthBarBackground = "#311710"
            healthBarFill = "#ff9e74"
            drawStroke = true
        } else if (this.type === "highValue") {
            fillColor = "#ffd24a"
            strokeColor = "#a68726"
            coreColor = "#fff0a8"
        }

        if (this.hitFlashTime > 0 && this.type === "golden") {
            fillColor = "#fff1a3"
        } else if (this.hitFlashTime > 0 && this.type === "phantom") {
            fillColor = "#cfb4ff"
        } else if (this.hitFlashTime > 0 && this.type === "ancient") {
            fillColor = "#ff8585"
        } else if (this.hitFlashTime > 0 && this.type === "armored") {
            fillColor = "#b9ffce"
        } else if (this.hitFlashTime > 0 && this.type === "reinforced") {
            fillColor = "#f0a3ff"
        } else if (this.hitFlashTime > 0 && this.type === "heavy") {
            fillColor = "#d97171"
        } else if (this.hitFlashTime > 0 && this.type === "healer") {
            fillColor = "#a8ffd1"
        } else if (this.hitFlashTime > 0 && this.type === "exploder") {
            fillColor = "#ffc39f"
        } else if (this.hitFlashTime > 0 && this.type === "crystal") {
            fillColor = "#bde7ff"
        } else if (this.hitFlashTime > 0 && this.type === "elite") {
            fillColor = "#d9baff"
        } else if (this.hitFlashTime > 0 && this.type === "shielded") {
            fillColor = this.hasShield ? "#9cd1ff" : "#7bb0ff"
        } else if (this.hitFlashTime > 0 && this.type === "reflector") {
            fillColor = "#d7fdff"
        } else if (this.hitFlashTime > 0 && this.type === "splitter") {
            fillColor = "#ffd37a"
        } else if (this.hitFlashTime > 0 && this.type === "swarm") {
            fillColor = "#ffd8a8"
        } else if (this.hitFlashTime > 0 && this.type === "boss") {
            fillColor = "#a81e2f"
        } else if (this.hitFlashTime > 0 && this.type === "fast") {
            fillColor = "#ffbd85"
        } else if (this.hitFlashTime > 0 && this.type === "phase") {
            fillColor = "#c0a6ff"
        } else if (this.hitFlashTime > 0 && this.type === "charger") {
            fillColor = "#ffc28f"
        }

        const pulse = 1 + Math.sin(this.pulseTime) * 0.05
        const warningPulse = isChargerWarning
            ? 1 + Math.sin(this.pulseTime * 20) * 0.04
            : 1
        const radius = this.radius * pulse * warningPulse

        ctx.save()
        ctx.globalAlpha = 0.15 * baseAlpha
        ctx.strokeStyle = strokeColor
        ctx.lineWidth = radius * 1.8
        ctx.beginPath()
        ctx.arc(this.x, this.y, radius * 1.02, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()

        ctx.save()
        ctx.globalAlpha = baseAlpha
        ctx.beginPath()

        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2)

        ctx.fillStyle = fillColor

        ctx.fill()

        if (drawStroke) {

            ctx.strokeStyle = strokeColor
            ctx.lineWidth = strokeWidth
            ctx.stroke()
        }

        ctx.globalAlpha = 0.6 * baseAlpha
        ctx.fillStyle = coreColor
        ctx.beginPath()
        ctx.arc(this.x, this.y, radius * 0.35, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        if (this.type === "shielded" && this.hasShield) {
            ctx.beginPath()
            ctx.strokeStyle = "#b7e1ff"
            ctx.lineWidth = 3
            ctx.arc(this.x, this.y, radius + 4, 0, Math.PI * 2)
            ctx.stroke()
        }

        if (this.type === "reflector") {
            ctx.beginPath()
            ctx.strokeStyle = "#8cefff"
            ctx.lineWidth = 2
            ctx.arc(this.x, this.y, radius + 4, 0, Math.PI * 2)
            ctx.stroke()
        }

        if (this.type === "phantom") {
            ctx.save()
            ctx.globalAlpha = 0.4 * baseAlpha
            ctx.strokeStyle = "#9b5cff"
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.arc(this.x, this.y, radius + 5, 0, Math.PI * 2)
            ctx.stroke()
            ctx.restore()
        }

        if (this.type === "splitter") {
            ctx.strokeStyle = "#6b3909"
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(this.x - radius * 0.45, this.y - radius * 0.2)
            ctx.lineTo(this.x - radius * 0.05, this.y + radius * 0.15)
            ctx.lineTo(this.x + radius * 0.35, this.y - radius * 0.25)
            ctx.stroke()
        }

        if (this.type === "phase" && this.isPhased) {
            ctx.save()
            ctx.globalAlpha = 0.35
            ctx.strokeStyle = "#d8d0ff"
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.arc(this.x, this.y, radius + 5, 0, Math.PI * 2)
            ctx.stroke()
            ctx.restore()
        }

        if (this.type === "charger" && this.chargeBurstTime > 0) {
            ctx.save()
            ctx.globalAlpha = 0.6
            ctx.strokeStyle = "#ffd0ad"
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(this.x - (this.direction * radius * 1.2), this.y)
            ctx.lineTo(this.x - (this.direction * radius * 2.2), this.y)
            ctx.stroke()
            ctx.restore()
        }

        if (isChargerWarning) {
            ctx.save()
            ctx.globalAlpha = 0.45 + Math.sin(this.pulseTime * 16) * 0.15
            ctx.strokeStyle = "#ffd47a"
            ctx.lineWidth = 2.5
            ctx.beginPath()
            ctx.arc(this.x, this.y, radius + 7, 0, Math.PI * 2)
            ctx.stroke()
            ctx.restore()
        }

        if (this.maxHealth > 1) {

            const isBoss = this.type === "boss"
            const barWidth = isBoss ? radius * 2.6 : radius * 2
            const barHeight = isBoss ? 10 : 4
            const barX = this.x - (barWidth / 2)
            const barY = isBoss ? this.y - radius - 22 : this.y - radius - 10
            const healthRatio = this.health / this.maxHealth

            ctx.fillStyle = healthBarBackground
            ctx.fillRect(barX, barY, barWidth, barHeight)

            ctx.fillStyle = healthBarFill
            ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight)

        }

    }

    healNearbyTargets() {

        if (!this.game || !Array.isArray(this.game.targets)) return

        for (const target of this.game.targets) {
            if (!target || target === this || target.health <= 0) continue
            if (target.health >= target.maxHealth) continue

            const dx = target.x - this.x
            const dy = target.y - this.y
            const distance = Math.sqrt((dx * dx) + (dy * dy))
            if (distance > this.healRadius) continue

            target.health = Math.min(target.maxHealth, target.health + this.healAmount)
            if (target.hitFlashDuration) {
                target.hitFlashTime = Math.max(target.hitFlashTime || 0, target.hitFlashDuration * 0.5)
            }
        }

    }

    triggerExploderBurst() {

        if (!this.game || !Array.isArray(this.game.targets)) return

        for (const target of this.game.targets) {
            if (!target || target === this || target.health <= 0) continue

            const dx = target.x - this.x
            const dy = target.y - this.y
            const distance = Math.sqrt((dx * dx) + (dy * dy))
            if (distance > this.exploderBurstRadius) continue

            target.health = Math.max(0, target.health - this.exploderBurstDamage)
            if (target.hitFlashDuration) {
                target.hitFlashTime = target.hitFlashDuration
            }
        }

    }

}
