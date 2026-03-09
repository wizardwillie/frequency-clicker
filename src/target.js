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
        this.hasShield = options.hasShield ?? false
        const defaultRadiusByType = {
            armored: 18,
            reinforced: 22,
            heavy: 26,
            shielded: 15,
            fast: 10
        }
        const defaultRadius = defaultRadiusByType[this.type] ?? 14
        this.radius = options.radius ?? defaultRadius
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
        let strokeColor = "#127f7f"
        let strokeWidth = 2
        let healthBarBackground = "#273127"
        let healthBarFill = "#8fff8f"
        let drawStroke = false

        if (this.type === "armored") {
            fillColor = "#56d17e"
            strokeColor = "#1d6a34"
            strokeWidth = 3
            drawStroke = true
        } else if (this.type === "reinforced") {
            fillColor = "#d14cff"
            strokeColor = "#6a1b9a"
            strokeWidth = 4
            healthBarBackground = "#2d163b"
            healthBarFill = "#f08bff"
            drawStroke = true
        } else if (this.type === "heavy") {
            fillColor = "#8d2626"
            strokeColor = "#1a0e0e"
            strokeWidth = 4
            healthBarBackground = "#2f1a1a"
            healthBarFill = "#ff7a7a"
            drawStroke = true
        } else if (this.type === "shielded") {
            fillColor = this.hasShield ? "#4aa0ff" : "#2f6fd6"
            strokeColor = "#1c4f9e"
            strokeWidth = 3
            healthBarBackground = "#18273a"
            healthBarFill = "#8bc7ff"
            drawStroke = true
        } else if (this.type === "fast") {
            fillColor = "#ff8a2a"
            strokeColor = "#9e4a08"
            strokeWidth = 2
            drawStroke = true
        } else if (this.type === "highValue") {
            fillColor = "#ffd24a"
        }

        if (this.hitFlashTime > 0 && this.type === "armored") {
            fillColor = "#b9ffce"
        } else if (this.hitFlashTime > 0 && this.type === "reinforced") {
            fillColor = "#f0a3ff"
        } else if (this.hitFlashTime > 0 && this.type === "heavy") {
            fillColor = "#d97171"
        } else if (this.hitFlashTime > 0 && this.type === "shielded") {
            fillColor = this.hasShield ? "#9cd1ff" : "#7bb0ff"
        } else if (this.hitFlashTime > 0 && this.type === "fast") {
            fillColor = "#ffbd85"
        }

        ctx.beginPath()

        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)

        ctx.fillStyle = fillColor

        ctx.fill()

        if (drawStroke) {

            ctx.strokeStyle = strokeColor
            ctx.lineWidth = strokeWidth
            ctx.stroke()
        }

        if (this.type === "shielded" && this.hasShield) {
            ctx.beginPath()
            ctx.strokeStyle = "#b7e1ff"
            ctx.lineWidth = 3
            ctx.arc(this.x, this.y, this.radius + 4, 0, Math.PI * 2)
            ctx.stroke()
        }

        if (this.maxHealth > 1) {

            const barWidth = this.radius * 2
            const barHeight = 4
            const barX = this.x - this.radius
            const barY = this.y - this.radius - 10
            const healthRatio = this.health / this.maxHealth

            ctx.fillStyle = healthBarBackground
            ctx.fillRect(barX, barY, barWidth, barHeight)

            ctx.fillStyle = healthBarFill
            ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight)

        }

    }

}
