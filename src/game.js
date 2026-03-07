import { SpawnSystem } from "./spawn.js"
import { Laser } from "./laser.js"
import { CollisionSystem } from "./collision.js"
import { FloatingText } from "./floatingText.js"

export class Game {

    constructor(canvas) {

        this.canvas = canvas
        this.ctx = canvas.getContext("2d")

        this.lastTime = 0
        this.points = 0
        this.targets = []
        this.lasers = []
        this.floatingTexts = []

        this.spawnSystem = new SpawnSystem(this)
        this.collisionSystem = new CollisionSystem(this)
        window.addEventListener("click", (event) => {

            const rect = this.canvas.getBoundingClientRect()

            const mouseX = event.clientX - rect.left
            const mouseY = event.clientY - rect.top

            for (let i = this.targets.length - 1; i >= 0; i--) {

                const target = this.targets[i]

                const dx = mouseX - target.x
                const dy = mouseY - target.y

                const distance = Math.sqrt(dx * dx + dy * dy)

                if (distance < target.radius) {

                    this.targets.splice(i, 1)

                    this.points += target.value
                    this.floatingTexts.push(
                    new FloatingText(target.x, target.y, "+" + target.value)
                    )

                    return

                }

            }

            // If no target clicked, fire laser

            const phase = Math.random() * Math.PI * 2

            const colors = [
            "#3a5cff",
            "#7b3aff",
            "#00aaff",
            "#6a00ff"
            ]

        const color = colors[Math.floor(Math.random() * colors.length)]

        const laser = new Laser(this, phase, color)

        laser.fire()

        this.lasers.push(laser)

        })

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
        for (let laser of this.lasers) {
            laser.update(delta)
        }
        this.lasers = this.lasers.filter(laser => laser.active)

        for (let target of this.targets) {

            target.update(delta) 
        }
        this.collisionSystem.check()

        for (let text of this.floatingTexts) {
            text.update(delta)
        }
        this.floatingTexts = this.floatingTexts.filter(t => t.life > 0)

    }

    render() {

    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)

    this.drawGrid()

    for (let target of this.targets) {
        target.draw(this.ctx)
    }

    for (let laser of this.lasers) {
        laser.draw(this.ctx)
    }   

    for (let text of this.floatingTexts) {
        text.draw(this.ctx)
    }

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

    
    this.ctx.fillStyle = "#111"
    this.ctx.font = "20px Arial"

    this.ctx.fillText("Points: " + this.points, 20, 30)
    }
}
