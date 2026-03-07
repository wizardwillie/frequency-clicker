export class Target {

    constructor(x, y, direction, speed, value) {

        this.x = x
        this.y = y

        this.direction = direction
        this.speed = speed

        this.value = value

        this.radius = 14
    }

    update(delta) {

        this.x += this.speed * this.direction * delta

    }

    draw(ctx) {

        ctx.beginPath()

        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)

        ctx.fillStyle = "#00ffff"

        ctx.fill()

    }

}
