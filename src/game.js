import { SpawnSystem } from "./spawn.js"
import { Laser } from "./laser.js"
import { CollisionSystem } from "./collision.js"

export class Game {

    constructor(canvas) {

        this.canvas = canvas
        this.ctx = canvas.getContext("2d")

        this.lastTime = 0
        this.targets = []
        this.laser = new Laser(this)

        this.spawnSystem = new SpawnSystem(this)
        this.collisionSystem = new CollisionSystem(this)
        window.addEventListener("click", () => {

            this.laser.fire()
        }
    )

    }

    start() {

        requestAnimationFrame(this.loop.bind(this))

    }

    loop(time) {

        const delta = (time - this.lastTime) / 1000
        this.lastTime = time

        this.update(delta)
        this.render()

        requestAnimationFrame(this.loop.bind(this))

    }

    update(delta) {

        this.spawnSystem.update(delta)
        this.laser.update(delta)

        for (let target of this.targets) {

            target.update(delta) 
        }
        this.collisionSystem.check()

    }

    render() {

    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)

    this.drawGrid()

    for (let target of this.targets) {
        target.draw(this.ctx)
    }

    this.laser.draw(this.ctx)

    }

    drawGrid() {

        const ctx = this.ctx
        const gridSize = 40

        ctx.strokeStyle = "#e6e6e6"
        ctx.lineWidth = 1

        for (let x = 0; x < this.canvas.width; x += gridSize) {

            ctx.beginPath()
            ctx.moveTo(x, 0)
            ctx.lineTo(x, this.canvas.height)
            ctx.stroke()

        }

        for (let y = 0; y < this.canvas.height; y += gridSize) {

            ctx.beginPath()
            ctx.moveTo(0, y)
            ctx.lineTo(this.canvas.width, y)
            ctx.stroke()

        }

    }
}
