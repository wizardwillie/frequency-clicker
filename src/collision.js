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
            const maxReach = laser.amplitude + this.hitThreshold

            for (let i = targets.length - 1; i >= 0; i--) {

                const target = targets[i]
                const targetGridX = target.x - this.game.gridX

                if (targetGridX < 0 || targetGridX > laser.x) continue
                if (target.y < centerY - maxReach || target.y > centerY + maxReach) continue

                const waveX = Math.floor(targetGridX / 5) * 5

                const waveY =
                centerY +
                Math.sin((waveX * laser.frequency) + laser.phase) * laser.amplitude

                const distance = Math.abs(target.y - waveY)

                if (distance < this.hitThreshold) {

                    if (target.hasShield) {
                        target.hasShield = false
                        target.hitFlashTime = target.hitFlashDuration
                        this.game.floatingTexts.push(
                            new FloatingText(
                                target.x + (Math.random() - 0.5) * 12,
                                target.y + (Math.random() - 0.5) * 12,
                                "Shield!",
                                "#9cd1ff"
                            )
                        )
                        continue
                    }

                    const damage = Math.max(1, laser.strength || 1)
                    target.hitFlashTime = target.hitFlashDuration
                    target.health -= damage

                    if (target.health > 0) {
                        continue
                    }

                    this.game.points += target.value
                    const rewardColor =
                        target.type === "armored"
                            ? "#8fff8f"
                            : target.type === "reinforced"
                                ? "#f08bff"
                                : target.type === "heavy"
                                    ? "#ff7a7a"
                                    : target.type === "shielded"
                                        ? "#8bc7ff"
                                        : target.type === "highValue"
                                            ? "#ffd24a"
                                            : target.type === "fast"
                                                ? "#ffad66"
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
