export class FloatingText {

    constructor(x, y, text) {

        this.x = x
        this.y = y

        this.text = text

        this.life = 1
        this.speed = 40

    }

    update(delta) {

        this.y -= this.speed * delta

        this.life -= delta

    }

    draw(ctx) {

        ctx.globalAlpha = Math.max(this.life, 0)

        ctx.fillStyle = "#222"
        ctx.font = "16px Arial"

        ctx.fillText(this.text, this.x, this.y)

        ctx.globalAlpha = 1

    }

}