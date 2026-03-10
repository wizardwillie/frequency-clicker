export class ParticleSystem {

    constructor(game) {

        this.game = game
        this.particles = []

    }

    spawnExplosion(x, y, count, color) {

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2
            const speed = 60 + Math.random() * 120
            const maxLife = 0.18 + Math.random() * 0.24

            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 1.5 + Math.random() * 3,
                life: maxLife,
                maxLife,
                color
            })
        }

    }

    update(delta) {

        for (const particle of this.particles) {
            particle.x += particle.vx * delta
            particle.y += particle.vy * delta
            particle.life -= delta
        }

        this.particles = this.particles.filter((particle) => particle.life > 0)

    }

    draw(ctx) {

        for (const particle of this.particles) {
            const lifeRatio = Math.max(0, particle.life / particle.maxLife)

            ctx.save()
            ctx.globalAlpha = lifeRatio
            ctx.fillStyle = particle.color
            ctx.shadowColor = particle.color
            ctx.shadowBlur = 8
            ctx.beginPath()
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
            ctx.fill()
            ctx.restore()
        }

    }

}
