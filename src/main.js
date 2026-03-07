import { Game } from "./game.js"

const canvas = document.getElementById("gameCanvas")

canvas.width = 1200
canvas.height = 700

const game = new Game(canvas)

game.start()
