export class FloatingText {

    constructor(x, y, text, color = "#222") {

        this.x = x
        this.y = y

        this.text = text
        this.color = color
        this.game = null

        this.life = 1
        this.speed = 40

    }

    update(delta) {

        this.y -= this.speed * delta

        this.life -= delta

    }

    draw(ctx) {

        if (!this.game && typeof window !== "undefined") {
            this.game = window.game || window.__frequencyLaserClickerGame || null
        }

        const gridX = this.game?.gridX ?? 320
        if (this.x < gridX) return

        ctx.globalAlpha = Math.max(this.life, 0)

        ctx.fillStyle = this.color
        ctx.font = "16px Arial"

        ctx.fillText(this.text, this.x, this.y)

        ctx.globalAlpha = 1

    }

}
