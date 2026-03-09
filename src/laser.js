export class Laser {

    constructor(game, phase, color) {

        this.game = game

        this.x = 0
        this.speed = 600

        this.frequency = this.game.laserFrequency
        this.amplitude = this.game.laserAmplitude
        this.width = this.game.laserWidth

        this.phase = phase
        this.color = color

        this.active = false
        this.flashDuration = 0.05
        this.flashTime = 0

    }

    fire() {

        this.x = 0

        this.active = true
        this.flashTime = this.flashDuration

    }

    update(delta) {

        if (!this.active) return

        this.x += this.speed * delta

        if (this.flashTime > 0) {
            this.flashTime = Math.max(0, this.flashTime - delta)
        }

        if (this.x > this.game.gridWidth) {

            this.active = false

        }

    }

    draw(ctx) {

        if (!this.active) return

        ctx.beginPath()

        const centerY = this.game.canvas.height / 2
        const gridStartX = this.game.gridX
        const maxX = Math.min(this.x, this.game.gridWidth)

        ctx.moveTo(gridStartX, centerY)

        for (let i = 0; i < maxX; i += 5) {

            const y = centerY + Math.sin((i * this.frequency) + this.phase) * this.amplitude

            ctx.lineTo(gridStartX + i, y)

        }

        ctx.save()
        ctx.globalAlpha = 0.15
        ctx.strokeStyle = this.color
        ctx.lineWidth = this.width * 2.5
        ctx.lineCap = "round"
        ctx.stroke()
        ctx.restore()

        ctx.strokeStyle = this.color
        ctx.lineWidth = this.width
        ctx.lineCap = "round"

        ctx.stroke()

        if (this.flashTime > 0) {

            const flashAlpha = this.flashTime / this.flashDuration
            const flashRadius = this.width * 1.8

            ctx.save()
            ctx.globalAlpha = flashAlpha * 0.9
            ctx.fillStyle = this.color
            ctx.beginPath()
            ctx.arc(gridStartX, centerY, flashRadius, 0, Math.PI * 2)
            ctx.fill()

            ctx.globalAlpha = flashAlpha
            ctx.fillStyle = "#ffffff"
            ctx.beginPath()
            ctx.arc(gridStartX, centerY, this.width * 0.7, 0, Math.PI * 2)
            ctx.fill()
            ctx.restore()

        }

    }

}
