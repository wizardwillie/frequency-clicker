import {
    LASER_BASE_FREQUENCY,
    LASER_BASE_AMPLITUDE,
    LASER_BASE_WIDTH,
    LASER_BASE_FIRE_RATE,
    PLASMA_FREQUENCY_MULTIPLIER,
    PLASMA_AMPLITUDE_MULTIPLIER,
    PLASMA_WIDTH_MULTIPLIER,
    PLASMA_FIRE_RATE_MULTIPLIER
} from "./constants.js"

export const LASER_TYPES = {
    simple: {
        id: "simple",
        name: "Simple Laser",
        baseFrequency: LASER_BASE_FREQUENCY,
        baseAmplitude: LASER_BASE_AMPLITUDE,
        baseWidth: LASER_BASE_WIDTH,
        baseFireRate: LASER_BASE_FIRE_RATE,
        colors: ["#3a5cff", "#7b3aff", "#00aaff", "#6a00ff"]
    },
    plasma: {
        id: "plasma",
        name: "Plasma Laser",
        baseFrequency: LASER_BASE_FREQUENCY * PLASMA_FREQUENCY_MULTIPLIER,
        baseAmplitude: LASER_BASE_AMPLITUDE * PLASMA_AMPLITUDE_MULTIPLIER,
        baseWidth: LASER_BASE_WIDTH * PLASMA_WIDTH_MULTIPLIER,
        baseFireRate: LASER_BASE_FIRE_RATE * PLASMA_FIRE_RATE_MULTIPLIER,
        colors: ["#ff7a00", "#ffb347", "#ff4d4d", "#ffcc33"]
    }
}
