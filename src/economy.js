export class EconomySystem {

    constructor(game) {

        this.game = game

    }

    installBindings() {

        Object.defineProperty(this.game, "points", {
            configurable: true,
            enumerable: true,
            get: () => this.game._points,
            set: (value) => {
                this.game._points = this.normalize(value, this.game._points)
            }
        })

    }

    normalize(value, fallback = 0) {

        const numericValue = Number.isFinite(value) ? value : fallback
        return Math.max(0, Math.floor(numericValue))

    }

    setRaw(value) {

        this.game._points = this.normalize(value)

    }

    getRewardMultiplier() {

        return Math.max(0, Number(this.game.worldPointMultiplier) || 0)

    }

    canAfford(amount) {

        return this.game.points >= this.normalize(amount)

    }

    spend(amount) {

        const cost = this.normalize(amount)

        if (!this.canAfford(cost)) {
            return false
        }

        this.game._points = Math.max(0, this.game._points - cost)
        return true

    }

    award(amount, options = {}) {

        const baseAmount = this.normalize(amount)
        const applyWorldMultiplier = options.applyWorldMultiplier !== false
        const countTowardRun = options.countTowardRun !== false
        const multiplier = applyWorldMultiplier ? this.getRewardMultiplier() : 1
        const awardedAmount = Math.max(0, Math.floor(baseAmount * multiplier))

        this.game._points += awardedAmount

        if (countTowardRun) {
            this.game.runPointsEarned += awardedAmount
        }

        return awardedAmount

    }

}
