# Zombie Defense Game

## Overview

Zombie Defense is a 2D game where you are the lone survivor in a zombie apocalypse. Your objective is to fend off zombie attacks and survive as long as possible. The game features various gameplay mechanics, including shooting zombies, deploying blocks, using a jetpack, and managing resources.

## Features

- **Player Controls:**
  - Move Left: `a` key
  - Move Right: `d` key
  - Jump: `w` key
  - Shoot: `s` key
  - Deploy Blocks: `b` key
  - Use Jetpack: `Jet Pack` button
  - Increase Fire Rate: `Increase Fire Rate` button

- **Gameplay Mechanics:**
  - Shoot zombies to prevent them from reaching the player.
  - Deploy blocks to obstruct zombies and create barriers.
  - Use the jetpack to hover above zombies temporarily.
  - Manage resources to buy power-ups like the jetpack and increased fire rate.

- **Game States:**
  - Play: The game is running.
  - Pause: The game is paused.
  - Game Over: The player’s health reaches 0, and the game ends.

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Yumnam-L/zombie-defense.git
   ```
   
2. **Navigate to the project directory:**
   ```bash
   cd zombie-defense
   ```
   
3. **Open the `index.html` file in your web browser.**

## Usage

1. **Starting the Game:**
   - Click the `Start` button on the intro screen to begin the game.

2. **In-Game Controls:**
   - Use `a` and `d` to move the player left and right.
   - Press `w` to jump.
   - Press `s` to shoot at zombies.
   - Press `b` to deploy blocks.
   - Click `Jet Pack` to use the jetpack (requires resources).
   - Click `Increase Fire Rate` to temporarily increase the shooting rate (requires resources).

3. **Pause and Resume:**
   - Click `Pause` to pause the game.
   - Click `Resume` to continue playing from where you left off.

## Development

- **Technologies Used:**
  - HTML5
  - CSS3
  - JavaScript (ES6)
  - Canvas API

- **Folder Structure:**
  - `index.html`: The main HTML file.
  - `styles.css`: The stylesheet for the game.
  - `game.js`: The JavaScript file containing the game logic.
  - `img/`: Directory containing sprite images and background images.
