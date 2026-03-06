# Frequency Laser Clicker – Technical Design Document

## Engine Architecture

The game runs on a fixed game loop using HTML5 Canvas.

Loop structure:

update(deltaTime)
render()

Target framerate: 60 FPS

---

## Core Systems

Game
Responsible for:

* game loop
* timing
* global state
* initializing systems

Laser
Responsible for:

* sine wave generation
* propagation across screen
* hit detection input

Targets
Responsible for:

* target object behavior
* movement across board

Spawn System
Responsible for:

* spawning targets
* spawn rate scaling

Collision System
Responsible for:

* detecting intersections between laser and targets

Economy
Responsible for:

* points
* upgrade cost calculations
* point rewards

Upgrades
Responsible for:

* upgrade levels
* upgrade effects

UI
Responsible for:

* rendering points
* rendering upgrade buttons
* shoot button

---

## Game Loop

1. Update timer
2. Spawn targets
3. Move targets
4. Update laser
5. Check collisions
6. Update economy
7. Render everything

---

## Laser Math

Laser path equation:

y(x) = centerY + amplitude * sin(frequency * x + phase)

Variables:

frequency → upgradeable
amplitude → upgradeable
speed → constant

---

## Target Movement

Targets spawn at either edge of the screen.

Movement:

x += velocity * direction

direction = -1 or 1

Targets are removed if they leave the screen.

---

## Collision Detection

For each target:

distance = abs(target_y - laser_y(x))

If distance < hit_threshold

Target destroyed.

---

## Economy Scaling

Upgrade cost formula:

cost = baseCost * (growth ^ level)

Example:

Frequency
baseCost = 10
growth = 1.25

---

## Canvas

Board size:

width = 1000
height = 600

Origin:

(0,0) top-left

Laser origin:

(0, centerY)

