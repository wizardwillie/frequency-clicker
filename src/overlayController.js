export class OverlayController {

    constructor(game) {

        this.game = game
        this.state = {
            showInfoScreen: false,
            infoScroll: 0,
            showTargetIndex: false,
            targetIndexScroll: 0,
            showProgressMatrix: false,
            showArchivesMenu: false
        }

    }

    installBindings() {

        const bindStateProperty = (propertyName) => {
            Object.defineProperty(this.game, propertyName, {
                configurable: true,
                enumerable: true,
                get: () => this.state[propertyName],
                set: (value) => {
                    this.state[propertyName] = value
                }
            })
        }

        bindStateProperty("showInfoScreen")
        bindStateProperty("infoScroll")
        bindStateProperty("showTargetIndex")
        bindStateProperty("targetIndexScroll")
        bindStateProperty("showProgressMatrix")
        bindStateProperty("showArchivesMenu")

    }

    getActiveOverlayName() {

        if (this.state.showArchivesMenu) return "archives"
        if (this.state.showProgressMatrix) return "progressMatrix"
        if (this.state.showTargetIndex) return "targetIndex"
        if (this.state.showInfoScreen) return "info"
        return null

    }

    closeAll() {

        this.state.showArchivesMenu = false
        this.state.showProgressMatrix = false
        this.state.showTargetIndex = false
        this.state.showInfoScreen = false

    }

    open(name) {

        this.closeAll()

        if (name === "archives") {
            this.state.showArchivesMenu = true
            return true
        }

        if (name === "progressMatrix") {
            this.state.showProgressMatrix = true
            return true
        }

        if (name === "targetIndex") {
            this.state.showTargetIndex = true
            this.state.targetIndexScroll = 0
            return true
        }

        if (name === "info") {
            this.state.showInfoScreen = true
            this.state.infoScroll = 0
            return true
        }

        return false

    }

    handleEscape() {

        if (!this.getActiveOverlayName()) {
            return false
        }

        this.closeAll()
        return true

    }

    handleClick(mouseX, mouseY) {

        const activeOverlay = this.getActiveOverlayName()

        if (activeOverlay === "archives") {
            this.game.handleArchivesMenuClick(mouseX, mouseY)
            return true
        }

        if (activeOverlay === "progressMatrix") {
            this.game.handleProgressMatrixClick(mouseX, mouseY)
            return true
        }

        if (activeOverlay === "targetIndex") {
            this.game.handleTargetIndexClick(mouseX, mouseY)
            return true
        }

        if (activeOverlay === "info") {
            this.game.handleInfoScreenClick(mouseX, mouseY)
            return true
        }

        return false

    }

    handleWheel(event) {

        const activeOverlay = this.getActiveOverlayName()
        if (!activeOverlay) return false

        event.preventDefault()

        if (activeOverlay === "targetIndex") {
            this.state.targetIndexScroll += event.deltaY
            this.game.clampTargetIndexScroll()
            return true
        }

        if (activeOverlay === "info") {
            this.state.infoScroll += event.deltaY
            this.game.clampInfoScroll()
            return true
        }

        return true

    }

    updateCursor(mouseX, mouseY) {

        const activeOverlay = this.getActiveOverlayName()
        if (!activeOverlay) return false

        if (activeOverlay === "archives") {
            this.game.canvas.style.cursor = this.game.isHoveringArchivesMenuButton(mouseX, mouseY)
                ? "pointer"
                : "default"
            return true
        }

        if (activeOverlay === "progressMatrix") {
            const hoveringMatrixCard = this.game.getProgressMatrixHoveredCard(mouseX, mouseY)
            const canBuyHoveredNode = Boolean(
                hoveringMatrixCard && this.game.canPurchaseProgressNode(hoveringMatrixCard.node)
            )
            this.game.canvas.style.cursor = (
                this.game.isHoveringProgressMatrixBackButton(mouseX, mouseY) ||
                canBuyHoveredNode
            ) ? "pointer" : "default"
            return true
        }

        if (activeOverlay === "targetIndex") {
            this.game.canvas.style.cursor = this.game.isHoveringTargetIndexBackButton(mouseX, mouseY)
                ? "pointer"
                : "default"
            return true
        }

        this.game.canvas.style.cursor = this.game.isHoveringInfoBackButton(mouseX, mouseY)
            ? "pointer"
            : "default"
        return true

    }

    draw(ctx) {

        const activeOverlay = this.getActiveOverlayName()

        if (activeOverlay === "archives") {
            this.game.drawArchivesMenu(ctx)
            return true
        }

        if (activeOverlay === "progressMatrix") {
            this.game.drawProgressMatrix(ctx)
            return true
        }

        if (activeOverlay === "targetIndex") {
            this.game.drawTargetIndex(ctx)
            return true
        }

        if (activeOverlay === "info") {
            this.game.drawInfoScreen(ctx)
            return true
        }

        return false

    }

}
