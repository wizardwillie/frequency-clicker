import { Game } from "./game.js"

const canvas = document.getElementById("gameCanvas")

canvas.width = 1000
canvas.height = 600

const game = new Game(canvas)

game.start()
