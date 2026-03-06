export class Game {

    constructor(canvas) {

        this.canvas = canvas
        this.ctx = canvas.getContext("2d")

        this.lastTime = 0

    }

    start() {

        requestAnimationFrame(this.loop.bind(this))

    }

    loop(time) {

        const delta = (time - this.lastTime) / 1000
        this.lastTime = time

        this.update(delta)
        this.render()

        requestAnimationFrame(this.loop.bind(this))

    }

    update(delta) {

    }

    render() {

        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)

    }

}
