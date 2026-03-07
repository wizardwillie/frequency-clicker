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

        const value = 1

        const target = new Target(0, 0, direction, speed, value)
        target.y = target.radius + Math.random() * (canvas.height - target.radius * 2)
        target.x = direction === 1
            ? this.game.gridX + target.radius
            : canvas.width - target.radius

        this.game.targets.push(target)

    }

}
