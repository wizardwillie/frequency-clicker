import { FloatingText } from "./floatingText.js"
import {
    LASER_BASE_FREQUENCY,
    WORLD_DATA
} from "./constants.js"

export class WorldSystem {

    constructor(game) {

        this.game = game
        this.fieldTime = 0

    }

    update(delta) {

        if (!Number.isFinite(delta) || delta <= 0) return
        this.fieldTime += delta

    }

    getConfig(worldLevel = this.game.worldLevel) {

        const exactConfig = WORLD_DATA[worldLevel]
        if (exactConfig) return exactConfig

        const worldIds = Object.keys(WORLD_DATA)
            .map(Number)
            .filter(Number.isFinite)
            .sort((a, b) => a - b)
        const highestWorldId = worldIds.length > 0 ? worldIds[worldIds.length - 1] : 1

        return WORLD_DATA[highestWorldId] || WORLD_DATA[1]

    }

    getBehaviorId() {

        return this.getConfig().behaviorId || "neonGrid"

    }

    getWorldIntelLines() {

        const config = this.getConfig()

        return [
            {
                label: "Field",
                text: config.fieldSummary || config.description || ""
            },
            {
                label: "Pressure",
                text: config.pressureSummary || ""
            },
            {
                label: "Signal",
                text: config.signalHint || ""
            }
        ].filter(entry => entry.text)

    }

    getTargetWeightMultiplier(type) {

        const config = this.getConfig()
        const multiplier = config.targetWeightBoosts?.[type]

        return Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1

    }

    getSpawnY(radius, fallbackSpawnY) {

        const behaviorId = this.getBehaviorId()

        if (behaviorId === "plasmaStorm") {
            return this.pickLaneY(radius, [0.14, 0.28, 0.5, 0.72, 0.86], 36, [1.2, 1.1, 0.85, 1.1, 1.2])
        }

        if (behaviorId === "cryoCircuit") {
            return this.pickLaneY(radius, [0.18, 0.34, 0.5, 0.66, 0.82], 12)
        }

        if (behaviorId === "voidPulse") {
            return this.pickLaneY(radius, [0.16, 0.3, 0.5, 0.7, 0.84], 18, [1.15, 0.95, 0.7, 0.95, 1.15])
        }

        if (typeof fallbackSpawnY === "function") {
            return fallbackSpawnY(radius)
        }

        return this.pickLaneY(radius, [0.24, 0.5, 0.76], 24)

    }

    pickLaneY(radius, laneRatios, jitter = 0, laneWeights = null) {

        const lanes = Array.isArray(laneRatios) && laneRatios.length > 0
            ? laneRatios
            : [0.5]
        const weights = Array.isArray(laneWeights) && laneWeights.length === lanes.length
            ? laneWeights
            : lanes.map(() => 1)
        const totalWeight = weights.reduce((sum, weight) => sum + Math.max(0, weight), 0)
        const normalizedRadius = Math.max(0, radius || 0)
        const minY = normalizedRadius
        const maxY = this.game.canvas.height - normalizedRadius

        let laneIndex = 0
        if (totalWeight > 0) {
            let roll = Math.random() * totalWeight
            for (let i = 0; i < weights.length; i++) {
                roll -= Math.max(0, weights[i])
                if (roll <= 0) {
                    laneIndex = i
                    break
                }
            }
        } else {
            laneIndex = Math.floor(Math.random() * lanes.length)
        }

        const laneY = this.game.canvas.height * lanes[laneIndex]
        const y = laneY + ((Math.random() - 0.5) * jitter * 2)

        return Math.max(minY, Math.min(maxY, y))

    }

    applySpawnModifiers(target) {

        if (!target) return

        target.worldFeedbackCooldown = 0

        const behaviorId = this.getBehaviorId()

        if (behaviorId === "plasmaStorm") {
            target.worldStormDriftPhase = Math.random() * Math.PI * 2
            target.worldStormDriftSpeed = 1.1 + (Math.random() * 1.5)
            target.worldStormDriftAmplitude = 10 + (Math.random() * 18)
            target.worldStormSurgeTimer = 0.75 + (Math.random() * 1.1)
            target.worldStormSurgeVelocity = 0
            target.worldStormVisual = 0

            if (target.type === "charger" || target.type === "splitter") {
                target.worldStormDriftAmplitude *= 1.15
            }
            if (target.type === "exploder" || target.type === "reflector") {
                target.worldStormDriftSpeed *= 1.12
            }
            return
        }

        if (behaviorId === "cryoCircuit") {
            target.worldCryoLaneY = target.y
            target.speed *= 0.92

            if (target.type === "armored" || target.type === "shielded" || target.type === "elite") {
                target.cryoShellActive = true
                target.cryoShellMultiplier = target.type === "elite" ? 0.58 : 0.5
                target.cryoBreakThreshold = target.type === "elite" ? 4 : 3
            }
            return
        }

        if (behaviorId === "voidPulse") {
            if (
                target.type === "phase" ||
                target.type === "phantom" ||
                target.type === "elite" ||
                target.type === "ancient"
            ) {
                target.isVoidAttuned = true
                target.voidCycleDuration = 1.55 + (Math.random() * 0.45)
                target.voidExposureDuration = 0.52 + (Math.random() * 0.24)
                target.voidCycleTime = Math.random() * target.voidCycleDuration
                target.isVoidExposed = target.voidCycleTime >= (target.voidCycleDuration - target.voidExposureDuration)
                target.worldVoidDriftPhase = Math.random() * Math.PI * 2
                target.worldVoidDriftAmplitude = 6 + (Math.random() * 9)
                target.worldVoidDriftSpeed = 0.8 + (Math.random() * 0.8)
            }
        }

    }

    updateTarget(target, delta) {

        if (!target || !Number.isFinite(delta) || delta <= 0) return

        if (target.worldFeedbackCooldown > 0) {
            target.worldFeedbackCooldown = Math.max(0, target.worldFeedbackCooldown - delta)
        }

        const behaviorId = this.getBehaviorId()

        if (behaviorId === "plasmaStorm") {
            if (!Number.isFinite(target.worldStormDriftPhase)) return

            target.worldStormDriftPhase += delta * target.worldStormDriftSpeed
            target.y += Math.sin(target.worldStormDriftPhase) * target.worldStormDriftAmplitude * delta

            target.worldStormSurgeTimer -= delta
            if (target.worldStormSurgeTimer <= 0) {
                target.worldStormSurgeTimer = 0.9 + (Math.random() * 1.25)
                target.worldStormSurgeVelocity = (Math.random() - 0.5) * 140
            }

            if (Math.abs(target.worldStormSurgeVelocity) > 0.1) {
                target.y += target.worldStormSurgeVelocity * delta
                target.worldStormSurgeVelocity *= Math.pow(0.14, delta)
            }

            target.worldStormVisual = Math.min(1, Math.abs(target.worldStormSurgeVelocity || 0) / 90)
            this.clampTargetToPlayfield(target)
            return
        }

        if (behaviorId === "cryoCircuit") {
            if (Number.isFinite(target.worldCryoLaneY)) {
                target.y += (target.worldCryoLaneY - target.y) * Math.min(1, delta * 4.5)
                this.clampTargetToPlayfield(target)
            }
            return
        }

        if (behaviorId === "voidPulse") {
            if (!target.isVoidAttuned) return

            target.voidCycleTime += delta
            if (target.voidCycleTime >= target.voidCycleDuration) {
                target.voidCycleTime -= target.voidCycleDuration
            }
            target.isVoidExposed = target.voidCycleTime >= (target.voidCycleDuration - target.voidExposureDuration)

            if (Number.isFinite(target.worldVoidDriftPhase)) {
                target.worldVoidDriftPhase += delta * target.worldVoidDriftSpeed
                target.y += Math.sin(target.worldVoidDriftPhase) * target.worldVoidDriftAmplitude * delta
                this.clampTargetToPlayfield(target)
            }
        }

    }

    modifyIncomingDamage(target, damage, sourceLaser = null) {

        if (!target || !Number.isFinite(damage) || damage <= 0) {
            return { damage }
        }

        const behaviorId = this.getBehaviorId()

        if (behaviorId === "cryoCircuit" && target.cryoShellActive) {
            const sourceStrength = Number.isFinite(sourceLaser?.strength) ? sourceLaser.strength : damage
            const isHeavy = sourceLaser?.laserTypeId === "heavy"
            const breakThreshold = target.cryoBreakThreshold || 3

            if (isHeavy || sourceStrength >= breakThreshold) {
                target.cryoShellActive = false
                this.showTargetFeedback(target, "SHATTER", "#b8efff")
                return {
                    damage: damage * (isHeavy ? 1.18 : 1.08)
                }
            }

            this.showTargetFeedback(target, "SHELL", "#95dcff")
            return {
                damage: damage * (target.cryoShellMultiplier || 0.55)
            }
        }

        if (behaviorId === "voidPulse" && target.isVoidAttuned) {
            const signalDensity = this.getSignalDensity(sourceLaser)
            const pulseBonus = sourceLaser?.laserTypeId === "pulse" ? 0.18 : 0

            if (target.isVoidExposed) {
                this.showTargetFeedback(target, "LOCK", "#ffbcff")
                return {
                    damage: damage * (1.08 + (sourceLaser?.laserTypeId === "pulse" ? 0.12 : 0.04))
                }
            }

            const densityMitigation = Math.min(0.26, Math.max(0, signalDensity - 1) * 0.24)
            const reductionMultiplier = Math.min(0.92, 0.46 + densityMitigation + pulseBonus)

            this.showTargetFeedback(target, "PHASED", "#d9adff")
            return {
                damage: damage * reductionMultiplier
            }
        }

        return { damage }

    }

    getSignalDensity(sourceLaser = null) {

        const frequency = Number.isFinite(sourceLaser?.frequency)
            ? sourceLaser.frequency
            : this.game.laserFrequency

        return Math.max(0.5, frequency / LASER_BASE_FREQUENCY)

    }

    showTargetFeedback(target, text, color) {

        if (!target || !text) return
        if (target.worldFeedbackCooldown > 0) return

        this.game.floatingTexts.push(
            new FloatingText(
                target.x + ((Math.random() - 0.5) * 12),
                target.y - (target.radius || 12) - 8,
                text,
                color
            )
        )
        target.worldFeedbackCooldown = 0.18

    }

    clampTargetToPlayfield(target) {

        if (!target) return

        const radius = target.radius || 0
        target.y = Math.max(radius, Math.min(this.game.canvas.height - radius, target.y))

    }

    drawFieldEffects(ctx) {

        const behaviorId = this.getBehaviorId()

        if (behaviorId === "neonGrid") {
            this.drawNeonGridField(ctx)
            return
        }

        if (behaviorId === "plasmaStorm") {
            this.drawPlasmaStormField(ctx)
            return
        }

        if (behaviorId === "cryoCircuit") {
            this.drawCryoCircuitField(ctx)
            return
        }

        if (behaviorId === "voidPulse") {
            this.drawVoidPulseField(ctx)
        }

    }

    drawNeonGridField(ctx) {

        const centerY = this.game.canvas.height / 2

        ctx.save()
        ctx.globalAlpha = 0.06
        ctx.fillStyle = "rgba(58,134,255,0.22)"
        ctx.fillRect(this.game.gridX, centerY - 28, this.game.gridWidth, 56)

        ctx.globalAlpha = 0.14
        ctx.strokeStyle = "#6fb6ff"
        ctx.lineWidth = 1
        for (const offset of [-96, 0, 96]) {
            ctx.beginPath()
            ctx.moveTo(this.game.gridX, centerY + offset)
            ctx.lineTo(this.game.canvas.width, centerY + offset)
            ctx.stroke()
        }
        ctx.restore()

    }

    drawPlasmaStormField(ctx) {

        const offset = (this.fieldTime * 120) % 180

        ctx.save()
        ctx.globalAlpha = 0.1
        ctx.strokeStyle = "#ff72ff"
        ctx.lineWidth = 2
        for (let i = -2; i < 5; i++) {
            const startX = this.game.gridX + (i * 140) + offset
            ctx.beginPath()
            ctx.moveTo(startX, 0)
            ctx.lineTo(startX + 110, this.game.canvas.height)
            ctx.stroke()
        }

        ctx.globalAlpha = 0.04
        ctx.fillStyle = "rgba(255,100,255,0.35)"
        for (let i = 0; i < 3; i++) {
            const bandY = (this.game.canvas.height * (0.2 + (i * 0.28))) + Math.sin(this.fieldTime * 1.7 + i) * 18
            ctx.fillRect(this.game.gridX, bandY - 14, this.game.gridWidth, 28)
        }
        ctx.restore()

    }

    drawCryoCircuitField(ctx) {

        const laneRatios = [0.18, 0.34, 0.5, 0.66, 0.82]

        ctx.save()
        ctx.globalAlpha = 0.08
        ctx.fillStyle = "rgba(102,199,255,0.18)"
        for (const ratio of laneRatios) {
            const y = this.game.canvas.height * ratio
            ctx.fillRect(this.game.gridX, y - 12, this.game.gridWidth, 24)
        }

        ctx.globalAlpha = 0.18
        ctx.strokeStyle = "#a9ebff"
        ctx.lineWidth = 1
        for (const ratio of laneRatios) {
            const y = this.game.canvas.height * ratio
            ctx.beginPath()
            ctx.moveTo(this.game.gridX, y)
            ctx.lineTo(this.game.canvas.width, y)
            ctx.stroke()
        }
        ctx.restore()

    }

    drawVoidPulseField(ctx) {

        const pulse = 0.5 + (Math.sin(this.fieldTime * 2.6) * 0.5)
        const laneRatios = [0.18, 0.5, 0.82]

        ctx.save()
        ctx.globalAlpha = 0.05 + (pulse * 0.04)
        ctx.fillStyle = "rgba(195,139,255,0.28)"
        for (const ratio of laneRatios) {
            const y = this.game.canvas.height * ratio
            ctx.fillRect(this.game.gridX, y - 18, this.game.gridWidth, 36)
        }

        ctx.globalAlpha = 0.15 + (pulse * 0.08)
        ctx.strokeStyle = "#ff7adf"
        ctx.lineWidth = 1.2
        for (let i = 0; i < laneRatios.length; i++) {
            const y = this.game.canvas.height * laneRatios[i]
            ctx.beginPath()
            for (let x = this.game.gridX; x <= this.game.canvas.width; x += 24) {
                const distortion = Math.sin((x * 0.02) + (this.fieldTime * 5) + i) * 6
                if (x === this.game.gridX) {
                    ctx.moveTo(x, y + distortion)
                } else {
                    ctx.lineTo(x, y + distortion)
                }
            }
            ctx.stroke()
        }
        ctx.restore()

    }

}
