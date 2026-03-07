export class Laser {

    constructor(game, phase, color) {

        this.game = game

        this.x = 0
        this.speed = 600

        this.frequency = 0.008
        this.amplitude = 60

        this.phase = phase
        this.color = color

        this.active = false

    }

    fire() {

        this.x = 0

        this.active = true

    }

    update(delta) {

        if (!this.active) return

        this.x += this.speed * delta

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

        ctx.strokeStyle = this.color
        ctx.lineWidth = 4

        ctx.stroke()

    }

}
