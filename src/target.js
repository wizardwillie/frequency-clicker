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
            reflector: 18,
            splitter: 20,
            swarm: 6,
            boss: 48,
            fast: 10
        }
        const defaultRadius = defaultRadiusByType[this.type] ?? 14
        this.radius = options.radius ?? defaultRadius
        this.hitFlashDuration = 0.12
        this.hitFlashTime = 0
        this.pulseTime = Math.random() * Math.PI * 2
    }

    update(delta) {

        this.x += this.speed * this.direction * delta
        this.pulseTime += delta * 3

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

        if (this.type === "armored") {
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
        } else if (this.type === "highValue") {
            fillColor = "#ffd24a"
            strokeColor = "#a68726"
            coreColor = "#fff0a8"
        }

        if (this.hitFlashTime > 0 && this.type === "armored") {
            fillColor = "#b9ffce"
        } else if (this.hitFlashTime > 0 && this.type === "reinforced") {
            fillColor = "#f0a3ff"
        } else if (this.hitFlashTime > 0 && this.type === "heavy") {
            fillColor = "#d97171"
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
        }

        const pulse = 1 + Math.sin(this.pulseTime) * 0.05
        const radius = this.radius * pulse

        ctx.save()
        ctx.globalAlpha = 0.15
        ctx.strokeStyle = strokeColor
        ctx.lineWidth = radius * 1.8
        ctx.beginPath()
        ctx.arc(this.x, this.y, radius * 1.02, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()

        ctx.beginPath()

        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2)

        ctx.fillStyle = fillColor

        ctx.fill()

        if (drawStroke) {

            ctx.strokeStyle = strokeColor
            ctx.lineWidth = strokeWidth
            ctx.stroke()
        }

        ctx.save()
        ctx.globalAlpha = 0.6
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

        if (this.type === "splitter") {
            ctx.strokeStyle = "#6b3909"
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(this.x - radius * 0.45, this.y - radius * 0.2)
            ctx.lineTo(this.x - radius * 0.05, this.y + radius * 0.15)
            ctx.lineTo(this.x + radius * 0.35, this.y - radius * 0.25)
            ctx.stroke()
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

}
