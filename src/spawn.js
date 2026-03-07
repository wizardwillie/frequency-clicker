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

        const centerY = canvas.height / 2
        const spread = 220

        const y = centerY + (Math.random() - 0.5) * spread

        const direction = Math.random() < 0.5 ? 1 : -1

        const x = direction === 1 ? 0 : canvas.width

        const speed = 100 + Math.random() * 100

        const value = 1

        const target = new Target(x, y, direction, speed, value)

        this.game.targets.push(target)

    }

}
