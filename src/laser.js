export class Laser {

    constructor(game, phase, color) {

        this.game = game

        this.x = 0
        this.speed = 600

        this.frequency = 0.015
        this.amplitude = 200

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

        if (this.x > this.game.canvas.width) {

            this.active = false

        }

    }

    draw(ctx) {

        if (!this.active) return

        ctx.beginPath()

        const centerY = this.game.canvas.height / 2

        ctx.moveTo(0, centerY)

        for (let i = 0; i < this.x; i += 5) {

            const y = centerY + Math.sin((i * this.frequency) + this.phase) * this.amplitude

            ctx.lineTo(i, y)

        }

        ctx.strokeStyle = this.color
        ctx.lineWidth = 3

        ctx.stroke()

    }

}
