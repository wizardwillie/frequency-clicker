export class CollisionSystem {

    constructor(game) {

        this.game = game
        this.hitThreshold = 20

    }

    check() {

        const lasers = this.game.lasers
        const targets = this.game.targets

        const centerY = this.game.canvas.height / 2

        for (let laser of lasers) {

            if (!laser.active) continue

            for (let i = targets.length - 1; i >= 0; i--) {

                const target = targets[i]

                if (target.x > laser.x) continue

                const waveX = Math.floor(target.x / 5) * 5

                const waveY =
                centerY +
                Math.sin((waveX * laser.frequency) + laser.phase) * laser.amplitude

                const distance = Math.abs(target.y - waveY)

                if (distance < this.hitThreshold) {

                    targets.splice(i, 1)

                }

            }

        }

    }

}