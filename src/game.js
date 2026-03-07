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
        this.hasLaser = false
        this.targets = []
        this.lasers = []
        this.floatingTexts = []
        this.simpleLaserCost = 10
        this.panelWidth = 300
        this.gridX = this.panelWidth
        this.gridWidth = this.canvas.width - this.panelWidth
        this.unlockButton = {
            x: 20,
            y: 90,
            width: this.panelWidth - 40,
            height: 80
        }

        this.spawnSystem = new SpawnSystem(this)
        this.collisionSystem = new CollisionSystem(this)
        this.canvas.addEventListener("click", (event) => {
            this.handleClick(event)
        })
    }

    handleClick(event) {

        const rect = this.canvas.getBoundingClientRect()
        const mouseX = event.clientX - rect.left
        const mouseY = event.clientY - rect.top

        if (mouseX < 0 || mouseX > this.canvas.width || mouseY < 0 || mouseY > this.canvas.height) {
            return
        }

        if (mouseX < this.panelWidth) {
            this.handlePanelClick(mouseX, mouseY)
            return
        }

        this.handleGridClick(mouseX, mouseY)

    }

    handlePanelClick(mouseX, mouseY) {

        if (this.hasLaser) return

        const button = this.unlockButton
        const insideButton =
            mouseX >= button.x &&
            mouseX <= button.x + button.width &&
            mouseY >= button.y &&
            mouseY <= button.y + button.height

        if (!insideButton) return
        if (this.points < this.simpleLaserCost) return

        this.points -= this.simpleLaserCost
        this.hasLaser = true

        this.floatingTexts.push(
            new FloatingText(
                this.gridX + this.gridWidth / 2,
                this.canvas.height / 2,
                "Laser Unlocked"
            )
        )

    }

    handleGridClick(mouseX, mouseY) {

        // 1. Check if clicking a target
        for (let i = this.targets.length - 1; i >= 0; i--) {

            const target = this.targets[i]

            const dx = mouseX - target.x
            const dy = mouseY - target.y

            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < target.radius) {

                this.floatingTexts.push(
                    new FloatingText(target.x, target.y, "+" + target.value)
                )

                this.points += target.value
                this.targets.splice(i, 1)

                return
            }
        }

        // 2. Fire laser if owned
        if (this.hasLaser) {

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
        }
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
        this.drawPanel()
        this.drawGrid(100)

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

    drawGrid(offsetY) {

        const ctx = this.ctx
        const gridSize = 40

        ctx.strokeStyle = "#e6e6e6"
        ctx.lineWidth = 1

        for (let x = 0; x < this.canvas.width; x += gridSize) {

            ctx.beginPath()
            ctx.moveTo(x + this.gridX, 0)
            ctx.lineTo(x + this.gridX, this.canvas.height)
            ctx.stroke()

        }

        for (let y = 0; y < this.canvas.height; y += gridSize) {

            ctx.beginPath()
            ctx.moveTo(this.gridX, y)
            ctx.lineTo(this.canvas.width, y)
            ctx.stroke()

        }

    
    
    }

    drawPanel() {

        const ctx = this.ctx

        ctx.fillStyle = "#e9e9e2"
        ctx.fillRect(0, 0, this.panelWidth, this.canvas.height)

        ctx.strokeStyle = "#222"
        ctx.lineWidth = 2
        ctx.strokeRect(0, 0, this.panelWidth, this.canvas.height)

        ctx.fillStyle = "#111"
        ctx.font = "20px Arial"

        ctx.fillText("Points: " + this.points, 20, 40)

        if (!this.hasLaser) {

            const button = this.unlockButton

            ctx.fillStyle = "#d7d7cf"
            ctx.fillRect(button.x, button.y, button.width, button.height)

            ctx.strokeStyle = "#222"
            ctx.lineWidth = 2
            ctx.strokeRect(button.x, button.y, button.width, button.height)

            ctx.fillStyle = "#111"
            ctx.font = "18px Arial"
            ctx.fillText("Unlock Simple Laser", button.x + 12, button.y + 32)
            ctx.font = "16px Arial"
            ctx.fillText("Cost: " + this.simpleLaserCost, button.x + 12, button.y + 58)

        }

    }


}
