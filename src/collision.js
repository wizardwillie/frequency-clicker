import { FloatingText } from "./floatingText.js"

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
                const targetGridX = target.x - this.game.gridX

                if (targetGridX < 0 || targetGridX > laser.x) continue

                const waveX = Math.floor(targetGridX / 5) * 5

                const waveY =
                centerY +
                Math.sin((waveX * laser.frequency) + laser.phase) * laser.amplitude

                const distance = Math.abs(target.y - waveY)

                if (distance < this.hitThreshold) {

                    if (target.health > 1) {
                        target.hitFlashTime = target.hitFlashDuration
                        target.health -= 1
                        continue
                    }

                    this.game.points += target.value
                    const rewardColor =
                        target.type === "armored"
                            ? "#8fff8f"
                            : target.type === "highValue"
                                ? "#ffd24a"
                                : "#ffffff"

                    this.game.floatingTexts.push(
                        new FloatingText(
                        target.x + (Math.random() - 0.5) * 12,
                        target.y + (Math.random() - 0.5) * 12,
                        "+" + target.value,
                        rewardColor
                        )
                    )    
                    targets.splice(i, 1)

                }

            }

        }

    }

}
