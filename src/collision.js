export class CollisionSystem {

    constructor(game) {

        this.game = game

        this.hitThreshold = 15

    }

    check() {

        const laser = this.game.laser
        const targets = this.game.targets

        if (!laser.active) return

        const centerY = this.game.canvas.height / 2

        for (let i = targets.length - 1; i >= 0; i--) {

            const target = targets[i]

            if (target.x > laser.x) continue

            const waveY =
                centerY +
                Math.sin(target.x * laser.frequency) * laser.amplitude

            const distance = Math.abs(target.y - waveY)

            if (distance < this.hitThreshold) {

                targets.splice(i, 1)

            }

        }

    }

}
