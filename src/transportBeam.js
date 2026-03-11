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
        const baseWidth = 86
        const animationWidthBonus = this.game.transportAnimating ? 14 : 0
        const width = baseWidth + (chargeRatio * 20) + animationWidthBonus
        const top = 56
        const height = this.game.canvas.height - 112

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
        const particleRate = 10 + (intensity * 40) + (this.game.transportAnimating ? 35 : 0)

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
        const intensity = Math.min(
            1,
            chargeRatio + (this.game.transportReady ? 0.2 : 0) + (animationProgress * 0.8)
        )
        const gradient = ctx.createLinearGradient(centerX, beam.y, centerX, beam.y + beam.height)
        gradient.addColorStop(0, "#7df9ff")
        gradient.addColorStop(1, "#b16dff")

        ctx.save()
        ctx.beginPath()
        ctx.rect(this.game.gridX, 0, this.game.gridWidth, this.game.canvas.height)
        ctx.clip()

        // Wide bloom
        ctx.globalCompositeOperation = "lighter"
        ctx.globalAlpha = 0.1 + (intensity * 0.24)
        ctx.fillStyle = gradient
        ctx.fillRect(
            centerX - (beam.width * 0.95),
            beam.y,
            beam.width * 1.9,
            beam.height
        )

        // Mid glow
        ctx.globalAlpha = 0.2 + (intensity * 0.28)
        ctx.fillRect(
            centerX - (beam.width * 0.45),
            beam.y,
            beam.width * 0.9,
            beam.height
        )

        // Core beam
        ctx.globalCompositeOperation = "source-over"
        ctx.globalAlpha = 0.35 + (intensity * 0.55)
        ctx.fillRect(
            centerX - (beam.width * 0.16),
            beam.y,
            beam.width * 0.32,
            beam.height
        )

        if (chargeRatio >= 1 || this.game.transportReady) {
            ctx.globalCompositeOperation = "lighter"
            ctx.globalAlpha = 0.5 + (animationProgress * 0.3)
            ctx.fillStyle = "#ffffff"
            ctx.fillRect(
                centerX - (beam.width * 0.08),
                beam.y,
                beam.width * 0.16,
                beam.height
            )
        }

        // Beam particles
        ctx.globalCompositeOperation = "lighter"
        for (const particle of this.particles) {
            const lifeRatio = particle.maxLife > 0 ? particle.life / particle.maxLife : 0
            ctx.globalAlpha = Math.max(0, lifeRatio) * 0.85
            ctx.fillStyle = particle.color
            ctx.beginPath()
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
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
