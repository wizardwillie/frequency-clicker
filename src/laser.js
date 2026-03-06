export class Laser {

    constructor(game) {

        this.game = game

        this.x = 0

        this.speed = 600

        this.frequency = 0.02

        this.amplitude = 80

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

        for (let i = 0; i < this.x; i += 5) {

            const y = centerY + Math.sin(i * this.frequency) * this.amplitude

            ctx.lineTo(i, y)

        }

        ctx.strokeStyle = "#3a5cff"
        ctx.lineWidth = 3

        ctx.stroke()

    }

}
