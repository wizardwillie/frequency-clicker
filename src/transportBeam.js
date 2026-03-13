export class TransportBeam {

    constructor(game) {

        this.game = game
        this.particles = []
        this.spawnTimer = 0

    }

    getChargeRatio() {

        if (this.game.transportChargeRequired <= 0) return 0
        return Math.max(0, Math.min(1, this.game.transportCharge / this.game.transportChargeRequired))

    }

    getBeamBounds(chargeRatio = this.getChargeRatio()) {

        const centerX = this.game.gridX + (this.game.gridWidth / 2)
        const baseWidth = 24
        const animationWidthBonus = this.game.transportAnimating ? 18 : 0
        const readyWidthBonus = this.game.transportReady ? 10 : 0
        const width = baseWidth + (chargeRatio * 82) + animationWidthBonus + readyWidthBonus
        const top = 0
        const height = this.game.canvas.height

        return {
            x: centerX - (width / 2),
            y: top,
            width,
            height
        }

    }

    isPointInside(x, y) {

        if (!this.game.transportReady) return false

        const beam = this.getBeamBounds()

        return (
            x >= beam.x &&
            x <= beam.x + beam.width &&
            y >= beam.y &&
            y <= beam.y + beam.height
        )

    }

    spawnParticle(chargeRatio) {

        const beam = this.getBeamBounds(chargeRatio)
        const x = beam.x + (Math.random() * beam.width)
        const y = beam.y + beam.height

        this.particles.push({
            x,
            y,
            speed: 120 + Math.random() * 220,
            size: 1 + Math.random() * 3.2,
            life: 0.55 + Math.random() * 0.45,
            maxLife: 0.55 + Math.random() * 0.45,
            drift: (Math.random() - 0.5) * (10 + (chargeRatio * 16)),
            color: Math.random() < 0.5 ? "#7df9ff" : "#c88bff"
        })

    }

    update(delta) {

        const chargeRatio = this.getChargeRatio()
        const intensity = this.game.transportReady ? 1 : chargeRatio
        const particleRate = 4 + (intensity * 38) + (this.game.transportAnimating ? 35 : 0)

        if (particleRate > 0 && (intensity > 0 || this.game.transportAnimating)) {
            this.spawnTimer += delta * particleRate
        }

        while (this.spawnTimer >= 1) {
            this.spawnTimer -= 1
            this.spawnParticle(chargeRatio)
        }

        for (const particle of this.particles) {
            particle.y -= particle.speed * delta
            particle.x += particle.drift * delta
            particle.life -= delta
        }

        this.particles = this.particles.filter((particle) => particle.life > 0)

    }

    draw(ctx) {

        const chargeRatio = this.getChargeRatio()
        if (chargeRatio <= 0 && !this.game.transportReady && !this.game.transportAnimating) return

        const animationProgress = this.game.transportAnimating
            ? Math.max(
                0,
                Math.min(
                    1,
                    this.game.transportAnimationTime / Math.max(0.001, this.game.transportAnimationDuration)
                )
            )
            : 0
        const beam = this.getBeamBounds(chargeRatio)
        const centerX = beam.x + (beam.width / 2)
        const isReady = chargeRatio >= 1 || this.game.transportReady
        const gradient = ctx.createLinearGradient(centerX, beam.y, centerX, beam.y + beam.height)
        gradient.addColorStop(0, "#7df9ff")
        gradient.addColorStop(1, "#b16dff")

        ctx.save()
        ctx.beginPath()
        ctx.rect(this.game.gridX, 0, this.game.gridWidth, this.game.canvas.height)
        ctx.clip()

        const outerWidth = beam.width * (1.4 + (chargeRatio * 0.7))
        const midWidth = beam.width * (0.74 + (chargeRatio * 0.22))
        const coreWidth = beam.width * (0.24 + (chargeRatio * 0.16))

        // Wide bloom
        ctx.globalCompositeOperation = "lighter"
        ctx.globalAlpha = 0.03 + (chargeRatio * 0.17) + (animationProgress * 0.12)
        ctx.fillStyle = gradient
        ctx.fillRect(
            centerX - (outerWidth / 2),
            beam.y,
            outerWidth,
            beam.height
        )

        // Mid glow
        ctx.globalAlpha = 0.08 + (chargeRatio * 0.32) + (animationProgress * 0.1)
        ctx.fillRect(
            centerX - (midWidth / 2),
            beam.y,
            midWidth,
            beam.height
        )

        // Core beam
        ctx.globalCompositeOperation = "source-over"
        ctx.globalAlpha = 0.12 + (chargeRatio * 0.72) + (animationProgress * 0.1)
        ctx.fillRect(
            centerX - (coreWidth / 2),
            beam.y,
            coreWidth,
            beam.height
        )

        if (isReady) {
            ctx.globalCompositeOperation = "lighter"
            ctx.globalAlpha = 0.5 + (animationProgress * 0.3)
            ctx.fillStyle = "#ffffff"
            ctx.fillRect(
                centerX - (coreWidth * 0.22),
                beam.y,
                coreWidth * 0.44,
                beam.height
            )
        }

        // Beam particles
        ctx.globalCompositeOperation = "lighter"
        for (const particle of this.particles) {
            const lifeRatio = particle.maxLife > 0 ? particle.life / particle.maxLife : 0
            const particleIntensity = (0.18 + (chargeRatio * 0.82) + (isReady ? 0.12 : 0))
            ctx.globalAlpha = Math.max(0, lifeRatio) * particleIntensity
            ctx.fillStyle = particle.color
            ctx.beginPath()
            ctx.arc(particle.x, particle.y, particle.size * (0.85 + (chargeRatio * 0.35)), 0, Math.PI * 2)
            ctx.fill()
        }

        if (this.game.transportReady || this.game.transportAnimating) {
            const pulse = 1 + Math.sin(performance.now() * 0.008) * 0.08
            ctx.globalAlpha = 0.85
            ctx.strokeStyle = chargeRatio >= 1 ? "#ffffff" : "#e0d4ff"
            ctx.lineWidth = 2 + (animationProgress * 1.5)
            ctx.beginPath()
            ctx.arc(centerX, this.game.canvas.height / 2, beam.width * 0.55 * pulse, 0, Math.PI * 2)
            ctx.stroke()
        }

        ctx.restore()

    }

}
