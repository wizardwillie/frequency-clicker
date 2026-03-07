export class Target {

    constructor(x, y, direction, speed, value, options = {}) {

        this.x = x
        this.y = y

        this.direction = direction
        this.speed = speed

        this.type = options.type || "basic"
        this.value = value
        this.maxHealth = options.maxHealth ?? 1
        this.health = options.health ?? this.maxHealth

        this.radius = options.radius ?? (this.type === "armored" ? 18 : 14)
        this.hitFlashDuration = 0.12
        this.hitFlashTime = 0
    }

    update(delta) {

        this.x += this.speed * this.direction * delta

        if (this.hitFlashTime > 0) {
            this.hitFlashTime = Math.max(0, this.hitFlashTime - delta)
        }

    }

    draw(ctx) {

        let fillColor = "#00ffff"

        if (this.type === "armored") {
            fillColor = "#56d17e"
        } else if (this.type === "highValue") {
            fillColor = "#ffd24a"
        }

        if (this.hitFlashTime > 0 && this.type === "armored") {
            fillColor = "#b9ffce"
        }

        ctx.beginPath()

        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)

        ctx.fillStyle = fillColor

        ctx.fill()

        if (this.type === "armored") {

            ctx.strokeStyle = "#1d6a34"
            ctx.lineWidth = 3
            ctx.stroke()

            const barWidth = this.radius * 2
            const barHeight = 4
            const barX = this.x - this.radius
            const barY = this.y - this.radius - 10
            const healthRatio = this.health / this.maxHealth

            ctx.fillStyle = "#273127"
            ctx.fillRect(barX, barY, barWidth, barHeight)

            ctx.fillStyle = "#8fff8f"
            ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight)

        }

    }

}
