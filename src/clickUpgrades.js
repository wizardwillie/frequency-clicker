import {
    UPGRADE_GROWTH,
    CLICK_UPGRADE_BASE,
    CLICK_UPGRADE_STEP
} from "./constants.js"

export class ClickUpgradeSystem {

    constructor(game) {

        this.game = game

    }

    getClickCost() {

        return Math.floor(CLICK_UPGRADE_BASE * Math.pow(UPGRADE_GROWTH, this.game.clickUpgradeLevel))

    }

    buyClickUpgrade() {

        const cost = this.getClickCost()

        if (!this.game.economy.spend(cost)) return false

        this.game.clickUpgradeLevel += 1
        this.game.clickDamage = 1 + (this.game.clickUpgradeLevel * CLICK_UPGRADE_STEP)

        return true

    }

}
