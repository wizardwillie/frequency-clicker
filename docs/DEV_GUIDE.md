# Frequency Laser Clicker – Development Guide
Last Updated: 2026-03-07

This document explains how the project is organized and how new features should be implemented.
The goal is to keep the project scalable and easy to modify.

---

## Core Philosophy

This game is built around **incremental progression and satisfying feedback loops**.

Early Game:
- Manual clicking of targets
- Slow progression

Mid Game:
- Laser automation
- Upgrade stacking

Late Game:
- Multiple laser tiers
- Automation systems
- Advanced targets

---

## Project Structure

index.html
style.css

src/
    main.js
    game.js
    laser.js
    target.js
    spawn.js
    collision.js
    floatingText.js
    economy.js (future)
    upgrades.js (future)
    ui.js (future)

docs/
    GDD
    TECHNICAL.md
    BALANCE.md
    DEV_GUIDE.md

---

## Game Loop

The game runs a standard loop:

update(deltaTime)
render()

Update handles:
- spawning
- movement
- collisions
- economy updates

Render handles:
- drawing targets
- drawing lasers
- floating numbers
- UI elements

---

## Current Systems Implemented

✔ Canvas engine  
✔ Target spawning and movement  
✔ Multi-laser firing  
✔ Sine-wave laser rendering  
✔ Collision detection  
✔ Click-to-collect targets  
✔ Floating point rewards  

---

## Planned Systems

Next features to implement:

1. Laser ownership system
2. Shop system
3. First laser purchase (Simple Laser)
4. Upgrade system
5. Target tiers
6. Automation systems

---

## Laser Tier Design

Each laser tier has its **own upgrade tree**.

Example:

Simple Laser
- Frequency
- Amplitude
- Fire Rate

Plasma Laser
- Plasma Spread
- Chain Lightning
- Overcharge

Upgrades apply only to the **current laser tier**.

---

## Target Interaction

Targets can be destroyed by:

1. Laser collision
2. Manual mouse click

Manual clicking ensures early game progression even when the laser is weak.

---

## Code Guidelines

When adding new systems:

• Keep files modular  
• Avoid adding large logic blocks to game.js  
• Create a new system file if needed  

Example:

economy.js → handles currency logic  
upgrades.js → handles upgrade calculations  

---

## Performance Notes

Avoid:

• Large loops every frame
• Creating unnecessary objects

Clean arrays regularly (remove inactive lasers, texts, etc).
