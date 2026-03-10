import { FloatingText } from "./floatingText.js"
import { Target } from "./target.js"
import {
    TARGET_VALUE_BASE,
    TARGET_FAST_VALUE_MULTIPLIER,
    TARGET_FAST_HEALTH,
    TARGET_FAST_RADIUS,
    TARGET_FAST_SPEED_MULTIPLIER,
    MAX_ACTIVE_TARGETS,
    MAX_REFLECTED_LASERS_PER_FRAME
} from "./constants.js"

export class CollisionSystem {

    constructor(game) {

        this.game = game
        this.hitThreshold = 20

    }

    spawnSplitterFragments(sourceTarget) {

        const fragmentsToSpawn = 3
        const valueMultiplierFromUpgrades = this.game.targetUpgradeSystem
            ? this.game.targetUpgradeSystem.getValueMultiplier()
            : 1
        const value = Math.max(
            1,
            Math.round(TARGET_VALUE_BASE * TARGET_FAST_VALUE_MULTIPLIER * valueMultiplierFromUpgrades)
        )

        for (let i = 0; i < fragmentsToSpawn; i++) {
            if (this.game.targets.length >= MAX_ACTIVE_TARGETS) break

            const direction = Math.random() < 0.5 ? 1 : -1
            const speed = (100 + Math.random() * 100) * TARGET_FAST_SPEED_MULTIPLIER
            const offsetX = (Math.random() - 0.5) * 28
            const offsetY = (Math.random() - 0.5) * 28
            const radius = TARGET_FAST_RADIUS
            const minX = this.game.gridX + radius
            const maxX = this.game.canvas.width - radius
            const minY = radius
            const maxY = this.game.canvas.height - radius

            const fragment = new Target(
                Math.max(minX, Math.min(maxX, sourceTarget.x + offsetX)),
                Math.max(minY, Math.min(maxY, sourceTarget.y + offsetY)),
                direction,
                speed,
                value,
                {
                    type: "fast",
                    maxHealth: TARGET_FAST_HEALTH,
                    radius
                }
            )

            this.game.targets.push(fragment)
        }

    }

    createReflectedLaser(sourceTarget, sourceLaser) {

        const startGridX = Math.max(0, Math.min(this.game.gridWidth, sourceTarget.x - this.game.gridX))
        const reflectedLaser = {
            game: this.game,
            active: true,
            x: startGridX,
            startGridX,
            speed: sourceLaser.speed,
            frequency: sourceLaser.frequency,
            amplitude: sourceLaser.amplitude,
            width: Math.max(1.5, sourceLaser.width * 0.9),
            strength: sourceLaser.strength,
            phase: sourceLaser.phase + ((Math.random() - 0.5) * Math.PI),
            color: "#9df4ff",
            update(delta) {
                if (!this.active) return
                this.x += this.speed * delta
                if (this.x > this.game.gridWidth) {
                    this.active = false
                }
            },
            draw(ctx) {
                if (!this.active) return

                const centerY = this.game.canvas.height / 2
                const gridStartX = this.game.gridX
                const maxX = Math.min(this.x, this.game.gridWidth)

                if (maxX <= this.startGridX) return

                const startY =
                    centerY +
                    Math.sin((this.startGridX * this.frequency) + this.phase) * this.amplitude

                ctx.beginPath()
                ctx.moveTo(gridStartX + this.startGridX, startY)

                for (let i = this.startGridX; i < maxX; i += 5) {
                    const y = centerY + Math.sin((i * this.frequency) + this.phase) * this.amplitude
                    ctx.lineTo(gridStartX + i, y)
                }

                ctx.save()
                ctx.globalAlpha = 0.2
                ctx.strokeStyle = this.color
                ctx.lineWidth = this.width * 2
                ctx.lineCap = "round"
                ctx.stroke()
                ctx.restore()

                ctx.strokeStyle = this.color
                ctx.lineWidth = this.width
                ctx.lineCap = "round"
                ctx.stroke()
            }
        }

        return reflectedLaser

    }

    spawnExplosionParticles(x, y, particleCount, color) {

        if (!this.game.particleSystem) return
        this.game.particleSystem.spawnExplosion(x, y, particleCount, color)

    }

    spawnBossDeathBurst(sourceTarget) {

        const spawnSystem = this.game.spawnSystem

        for (let i = 0; i < 10; i++) {
            spawnSystem.spawnTarget({ allowBoss: false })
        }

        spawnSystem.spawnTarget({ forceType: "splitter", allowBoss: false })
        spawnSystem.spawnTarget({ forceType: "swarm", allowBoss: false })

        this.spawnExplosionParticles(sourceTarget.x, sourceTarget.y, 40, "#ff4a4a")

        this.game.floatingTexts.push({
            x: sourceTarget.x - 72,
            y: sourceTarget.y - 12,
            life: 1.1,
            speed: 36,
            update(delta) {
                this.y -= this.speed * delta
                this.life -= delta
            },
            draw(ctx) {
                ctx.save()
                ctx.globalAlpha = Math.max(this.life, 0)
                ctx.fillStyle = "#ff4a4a"
                ctx.font = "bold 32px Arial"
                ctx.fillText("MEGA KILL", this.x, this.y)
                ctx.restore()
            }
        })

    }

    check() {

        const lasers = this.game.lasers
        const targets = this.game.targets
        const pendingReflectedLasers = []

        const centerY = this.game.canvas.height / 2

        for (let laser of lasers) {

            if (!laser.active) continue
            const maxReach = laser.amplitude + this.hitThreshold

            for (let i = targets.length - 1; i >= 0; i--) {

                const target = targets[i]
                const targetGridX = target.x - this.game.gridX
                const laserStartX = laser.startGridX ?? 0

                if (targetGridX < laserStartX || targetGridX > laser.x) continue
                if (target.y < centerY - maxReach || target.y > centerY + maxReach) continue

                const waveX = Math.floor(targetGridX / 5) * 5

                const waveY =
                centerY +
                Math.sin((waveX * laser.frequency) + laser.phase) * laser.amplitude

                const distance = Math.abs(target.y - waveY)

                if (distance < this.hitThreshold) {

                    if (target.type === "reflector") {
                        const reflectionRoll = Math.random()
                        let reflectionCount = 1

                        if (reflectionRoll < 0.10) {
                            reflectionCount = 3
                        } else if (reflectionRoll < 0.40) {
                            reflectionCount = 2
                        }

                        const remainingSlots = MAX_REFLECTED_LASERS_PER_FRAME - pendingReflectedLasers.length
                        const spawnCount = Math.max(0, Math.min(reflectionCount, remainingSlots))

                        for (let j = 0; j < spawnCount; j++) {
                            pendingReflectedLasers.push(this.createReflectedLaser(target, laser))
                        }
                    }

                    if (target.hasShield) {
                        target.hasShield = false
                        target.hitFlashTime = target.hitFlashDuration
                        this.game.floatingTexts.push(
                            new FloatingText(
                                target.x + (Math.random() - 0.5) * 12,
                                target.y + (Math.random() - 0.5) * 12,
                                "Shield!",
                                "#9cd1ff"
                            )
                        )
                        continue
                    }

                    const overchargeBonus = 1 + (this.game.laserOvercharge * 0.015)
                    const damage = Math.max(1, (laser.strength || 1) * overchargeBonus)
                    target.hitFlashTime = target.hitFlashDuration
                    target.health -= damage
                    this.spawnExplosionParticles(target.x, target.y, 3, "#ffb84d")

                    if (target.health > 0) {
                        continue
                    }

                    if (target.type === "splitter") {
                        this.spawnSplitterFragments(target)
                    }

                    if (target.type === "boss") {
                        this.spawnBossDeathBurst(target)
                    } else {
                        this.spawnExplosionParticles(target.x, target.y, 12, "#ffb84d")
                    }

                    this.game.points += target.value
                    const overchargeGain = target.type === "boss" ? 10 : 2
                    this.game.laserOvercharge = Math.min(
                        this.game.maxLaserOvercharge,
                        this.game.laserOvercharge + overchargeGain
                    )
                    const rewardColor =
                        target.type === "armored"
                            ? "#8fff8f"
                            : target.type === "reinforced"
                                ? "#f08bff"
                                : target.type === "heavy"
                                    ? "#ff7a7a"
                                    : target.type === "shielded"
                                        ? "#8bc7ff"
                                        : target.type === "reflector"
                                            ? "#8cefff"
                                            : target.type === "splitter"
                                                ? "#ffd085"
                                                : target.type === "swarm"
                                                    ? "#ffc284"
                                                    : target.type === "boss"
                                                        ? "#ff4a4a"
                                        : target.type === "highValue"
                                            ? "#ffd24a"
                                            : target.type === "fast"
                                                ? "#ffad66"
                                                : "#ffffff"

                    this.game.floatingTexts.push(
                        new FloatingText(
                        target.x + (Math.random() - 0.5) * 12,
                        target.y + (Math.random() - 0.5) * 12,
                        "+" + target.value,
                        rewardColor
                        )
                    )    
                    targets.splice(i, 1)

                }

            }

        }

        if (pendingReflectedLasers.length > 0) {
            this.game.lasers.push(...pendingReflectedLasers)
        }

    }

}
