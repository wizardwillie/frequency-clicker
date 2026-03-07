import { Target } from "./target.js"

export class SpawnSystem {

    constructor(game) {

        this.game = game

        this.spawnTimer = 0
        this.spawnRate = 1

    }

    update(delta) {

        this.spawnTimer += delta

        if (this.spawnTimer >= 1 / this.spawnRate) {

            this.spawnTarget()

            this.spawnTimer = 0
        }

    }

    spawnTarget() {

        const canvas = this.game.canvas

        const direction = Math.random() < 0.5 ? 1 : -1

        const speed = 100 + Math.random() * 100

        const roll = Math.random()
        const baseValue = 1
        let type = "basic"
        let valueMultiplier = 1
        let maxHealth = 1

        if (roll < 0.1) {
            type = "armored"
            valueMultiplier = 3
            maxHealth = 3
        } else if (roll < 0.2) {
            type = "highValue"
            valueMultiplier = 4
        }

        const value = baseValue * valueMultiplier

        const target = new Target(0, 0, direction, speed, value, {
            type,
            maxHealth
        })

        target.y = target.radius + Math.random() * (canvas.height - target.radius * 2)
        target.x = direction === 1
            ? this.game.gridX + target.radius
            : canvas.width - target.radius

        this.game.targets.push(target)

    }

}
