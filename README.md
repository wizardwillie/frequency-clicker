# Frequency Laser Clicker

**Frequency Laser Clicker** is a browser-based incremental game where players fire sinusoidal laser waves to destroy moving targets and earn points. Players progressively upgrade their laser properties, unlock new laser technologies, automate firing, and enhance the target economy to scale their income.

The game combines **visual wave physics**, **incremental progression mechanics**, and **modular system architecture** designed for extensibility.

---

# Overview

In Frequency Laser Clicker, the player controls a device that emits a **sinusoidal laser beam** across a grid. Targets move across the grid, and if the laser wave intersects them, they are destroyed and award points.

The player improves their performance through upgrades that affect:

* Laser **frequency**
* Laser **amplitude**
* Laser **fire rate**
* Target **spawn rate**
* Target **value**
* Target **diversity**

As progression continues, stronger target types appear and new laser technologies unlock.

---

# Core Gameplay Loop

1. Targets spawn and move across the grid.
2. The player fires a laser across the field.
3. The sinusoidal wave intersects targets and destroys them.
4. Points are earned from destroyed targets.
5. Points are spent on upgrades.
6. Upgrades increase efficiency and income.
7. More complex targets appear as the game progresses.

The loop repeats with increasing scale.

---

# Key Gameplay Systems

## Laser System

The player’s weapon is a **sinusoidal laser beam** rendered across the grid.

Laser properties include:

* **Frequency**
  Controls how tightly the sine wave oscillates.

* **Amplitude**
  Controls the vertical reach of the wave.

* **Width**
  Controls the visual and collision thickness of the beam.

* **Fire Rate**
  Controls how frequently lasers can be fired.

Each fired laser instance travels horizontally across the grid while oscillating vertically.

---

## Laser Types

Different laser technologies modify the base laser stats.

### Simple Laser

The starting laser type.

Balanced stats and moderate visual glow.

### Plasma Laser

Unlocked later in the game.

Characteristics:

* Higher frequency
* Increased amplitude
* Wider beam
* Faster firing potential
* Stronger glow and flash effects

Players can switch between laser types once unlocked.

---

## Manual Firing

Players can click on the grid to fire a laser manually.

Manual firing has a **short cooldown** that scales with fire-rate upgrades.

---

## Auto Fire

Players can unlock **Auto Fire**, which automatically fires lasers at regular intervals.

Features:

* Slightly slower than manual firing
* Scales with fire-rate upgrades
* Continues generating points without player input

---

# Target System

Targets move horizontally across the grid and are destroyed when intersected by the laser wave.

## Target Types

### Basic Targets

* Single hit
* Low value
* Most common

### Armored Targets

* Multiple health points
* Require several wave intersections
* Display a health bar

### Reinforced Targets

* High durability
* Larger radius
* High point reward

### High Value Targets

* Rare targets
* Destroyed in one hit
* Large point payout

---

# Target Economy

Players can invest in upgrades that modify the target ecosystem.

## Target Value

Increases the point reward of all targets.

## Spawn Rate

Increases how frequently targets appear.

## Target Diversity

Introduces stronger target types into the spawn pool.

These upgrades significantly increase long-term income scaling.

---

# User Interface

The UI is divided into two sections.

### Game Grid

The main gameplay area where:

* lasers fire
* targets move
* collisions occur

### Upgrade Panel

The left panel contains upgrade systems organized into categories:

* **Lasers**
* **Laser Upgrades**
* **Target Economy**
* **Automation**

The panel supports **scrolling** to handle large numbers of upgrades.

---

# Visual Feedback Systems

The game includes multiple feedback systems to improve clarity and responsiveness.

### Laser Effects

* glow rendering
* firing flash
* color variation

### Target Feedback

* hit flash
* health bars for armored targets

### Floating Text

* points gained appear as floating numbers
* colors reflect target types

---

# Technical Architecture

The project is structured around modular gameplay systems.

Key modules include:

| File                | Responsibility                            |
| ------------------- | ----------------------------------------- |
| `game.js`           | Main game loop, rendering, input handling |
| `laser.js`          | Laser entity behavior and rendering       |
| `laserTypes.js`     | Laser type definitions and stats          |
| `spawn.js`          | Target spawning system                    |
| `collision.js`      | Laser-target collision detection          |
| `target.js`         | Target entity behavior and rendering      |
| `upgrades.js`       | Laser upgrade system                      |
| `targetUpgrades.js` | Target economy upgrades                   |
| `floatingText.js`   | Floating score indicators                 |
| `constants.js`      | Global configuration values               |

The architecture is intentionally modular to allow new gameplay systems to be added without modifying core systems.

---

# Running the Game

The game runs entirely in the browser.

## Steps

1. Start a local web server.

Example using Python:

```bash
python -m http.server
```

2. Open a browser and navigate to:

```
http://127.0.0.1:8000
```

3. The game should load automatically.

---

# Development Philosophy

This project emphasizes:

* modular systems
* clear separation of gameplay logic
* scalable incremental mechanics
* clean upgrade architecture

The goal is to allow future additions such as:

* new laser technologies
* additional target classes
* multi-world progression systems
* prestige mechanics

---

# Future Features

Planned expansion ideas include:

* transport beam world progression
* multiple game grids
* persistent passive income worlds
* additional laser types
* new enemy behaviors
* visual polish and UI animations

---

# License

This project is currently developed as a learning and experimental game project.
