// Import React from 'react'
import React from 'react';

// Import ReactDOM from 'react-dom'
import ReactDOM from 'react-dom';

// Import Button from '@mui/material/Button'
import Button from '@mui/material/Button';

// Define some constants for the game settings
const GAME_WIDTH = 800; // The width of the game screen in pixels
const GAME_HEIGHT = 600; // The height of the game screen in pixels
const PLAYER_SPEED = 10; // The speed of the player ship in pixels per frame
const PLAYER_FIRE_RATE = 10; // The rate of the player laser fire in frames per laser
const ENEMY_SPAWN_RATE = 60; // The rate of the enemy spawn in frames per enemy
const ENEMY_SPEED = 5; // The speed of the enemy ships in pixels per frame
const ENEMY_FIRE_RATE = 120; // The rate of the enemy laser fire in frames per laser
const OBSTACLE_SPAWN_RATE = 120; // The rate of the obstacle spawn in frames per obstacle
const OBSTACLE_SPEED = 10; // The speed of the obstacles in pixels per frame
const LASER_SPEED = 15; // The speed of the lasers in pixels per frame
const LASER_DAMAGE = 10; // The damage of the lasers in percentage points
const ITEM_SPAWN_RATE = 180; // The rate of the item spawn in frames per item
const ITEM_SPEED = 10; // The speed of the items in pixels per frame
const ITEM_VALUE = 10; // The value of the items in score points
const HEALTH_RECOVERY = 20; // The amount of health recovery in percentage points

// Get the HTML elements by their id
let container = document.getElementById("container");
let titleScreen = document.getElementById("title-screen");
let title = document.getElementById("title");
let logo = document.getElementById("logo");
let buttonsContainer = document.getElementById("buttons-container");
let startButton = document.getElementById("start-button");
let instructionsButton = document.getElementById("instructions-button");
let instructionsScreen = document.getElementById("instructions-screen");
let instructionsTitle = document.getElementById("instructions-title");
let instructionsText = document.getElementById("instructions-text");
let instructionsList = document.getElementById("instructions-list");
let backButton = document.getElementById("back-button");
let gameScreen = document.getElementById("game-screen");
let uiScreen = document.getElementById("ui-screen");
let scoreSpan = document.getElementById("score");
let healthSpan = document.getElementById("health");

// Create a canvas context for drawing the game graphics
let ctx = gameScreen.getContext("2d");

// Define some variables for the game state
let frameCount = 0; // The number of frames since the game started
let score = 0; // The current score of the player
let health = 100; // The current health of the player
let gameOver = false; // A flag to indicate if the game is over
let paused = false; // A flag to indicate if the game is paused

// Define some arrays for storing the game objects
let playerLasers = []; // An array to store the player lasers
let enemies = []; // An array to store the enemies
let enemyLasers = []; // An array to store the enemy lasers
let obstacles = []; // An array to store the obstacles
let items = []; // An array to store the items

// Define a class for creating a game object
class GameObject {
    constructor(x, y, width, height, image) {
        this.x = x; // The x coordinate of the object in pixels
        this.y = y; // The y coordinate of the object in pixels
        this.width = width; // The width of the object in pixels
        this.height = height; // The height of the object in pixels
        this.image = image; // The image of the object 
    }

    // A method to draw the object on the canvas
    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    // A method to check if the object is out of bounds
    isOutOfBounds() {
        return this.x < -this.width || this.x > GAME_WIDTH || this.y < -this.height || this.y > GAME_HEIGHT;
    }

    // A method to check if the object is colliding with another object
    isCollidingWith(other) {
        return this.x < other.x + other.width && this.x + this.width > other.x && this.y < other.y + other.height && this.y + this.height > other.y;
    }
}

// Define a class for creating a player object that inherits from GameObject class
class Player extends GameObject {
    constructor(x, y) {
        super(x, y, 50, 50, document.getElementById("player-image")); // Call the constructor of GameObject class with predefined parameters 
        this.fireCounter = 0; // A counter to keep track of the player fire rate
    }

    // A method to update the player position and fire
    update() {
        // Check if the left arrow key or the mouse is pressed and the player is not at the left edge of the screen
        if ((keys[37] || mouseX < this.x) && this.x > 0) {
            // Move the player to the left by the player speed
            this.x -= PLAYER_SPEED;
        }
        // Check if the right arrow key or the mouse is pressed and the player is not at the right edge of the screen
        if ((keys[39] || mouseX > this.x + this.width) && this.x < GAME_WIDTH - this.width) {
            // Move the player to the right by the player speed
            this.x += PLAYER_SPEED;
        }
        // Check if the spacebar key or the mouse is pressed and the fire counter is zero
        if ((keys[32] || mouseDown) && this.fireCounter === 0) {
            // Create a new player laser object at the center of the player ship
            let laser = new PlayerLaser(this.x + this.width / 2, this.y);
            // Add the laser object to the player lasers array
            playerLasers.push(laser);
            // Play the laser sound
            document.getElementById("laser-sound").play();
            // Reset the fire counter to the player fire rate
            this.fireCounter = PLAYER_FIRE_RATE;
        }
        // Check if the fire counter is greater than zero
        if (this.fireCounter > 0) {
            // Decrease the fire counter by one
            this.fireCounter--;
        }
    }
}

// Define a class for creating a player laser object that inherits from GameObject class
class PlayerLaser extends GameObject {
    constructor(x, y) {
        super(x, y, 5, 20, document.getElementById("player-laser-image")); // Call the constructor of GameObject class with predefined parameters 
    }

    // A method to update the player laser position
    update() {
        // Move the laser up by the laser speed
        this.y -= LASER_SPEED;
    }
}

// Define a class for creating an enemy object that inherits from GameObject class
class Enemy extends GameObject {
    constructor(x, y, type) {
        super(x, y, 50, 50, document.getElementById("enemy-" + type + "-image")); // Call the constructor of GameObject class with predefined parameters 
        this.type = type; // The type of the enemy (1, 2, or 3)
        this.fireCounter = Math.floor(Math.random() * ENEMY_FIRE_RATE); // A counter to keep track of the enemy fire rate with a random initial value
    }

    // A method to update the enemy position and fire
    update() {
        // Move the enemy down by the enemy speed
        this.y += ENEMY_SPEED;
        // Check if the fire counter is zero
        if (this.fireCounter === 0) {
            // Create a new enemy laser object at the center of the enemy ship
            let laser = new EnemyLaser(this.x + this.width / 2, this.y + this.height);
            // Add the laser object to the enemy lasers array
            enemyLasers.push(laser);
            // Play the laser sound
            document.getElementById("laser-sound").play();
            // Reset the fire counter to the enemy fire rate
            this.fireCounter = ENEMY_FIRE_RATE;
        }
        // Check if the fire counter is greater than zero
        if (this.fireCounter > 0) {
            // Decrease the fire counter by one
            this.fireCounter--;
        }
    }
}

// Define a class for creating an enemy laser object that inherits from GameObject class
class EnemyLaser extends GameObject {
    constructor(x, y) {
        super(x, y, 5, 20, document.getElementById("enemy-laser-image")); // Call the constructor of GameObject class with predefined parameters 
    }

    // A method to update the enemy laser position
    update() {
        // Move the laser down by the laser speed
        this.y += LASER_SPEED;
    }
}

// Define a class for creating an obstacle object that inherits from GameObject class
class Obstacle extends GameObject {
    constructor(x, y, type) {
        super(x, y, 50, 50, document.getElementById("obstacle-" + type + "-image")); // Call the constructor of GameObject class with predefined parameters 
        this.type = type; // The type of the obstacle (1 or 2)
    }

    // A method to update the obstacle position
    update() {
        // Move the obstacle down by the obstacle speed
        this.y += OBSTACLE_SPEED;
    }
}

// Define a class for creating an item object that inherits from GameObject class
class Item extends GameObject {
    constructor(x, y) {
        super(x, y, 20, 20, document.getElementById("item-image")); // Call the constructor of GameObject class with predefined parameters 
    }

    // A method to update the item position
    update() {
        // Move the item down by the item speed
        this.y += ITEM_SPEED;
    }
}

// Create a new player object at the center bottom of the game screen
let player = new Player(GAME_WIDTH / 2 - 25, GAME_HEIGHT - 75);

// Define an object to store the state of the keyboard keys
let keys = {};

// Define an object to store the state of the mouse
let mouseDown = false; // A flag to indicate if the mouse is pressed
let mouseX = 0; // The x coordinate of the mouse in pixels

// Add an event listener for the keydown event
window.addEventListener("keydown", function (event) {
    // Set the value of the key code to true in the keys object
    keys[event.keyCode] = true;
});

// Add an event listener for the keyup event
window.addEventListener("keyup", function (event) {
    // Set the value of the key code to false in the keys object
    keys[event.keyCode] = false;
});

// Add an event listener for the mousedown event
window.addEventListener("mousedown", function (event) {
    // Set the mouseDown flag to true
    mouseDown = true;
});

// Add an event listener for the mouseup event
window.addEventListener("mouseup", function (event) {
    // Set the mouseDown flag to false
    mouseDown = false;
});

// Add an event listener for the mousemove event
window.addEventListener("mousemove", function (event) {
    // Get the mouse x coordinate relative to the container element
    mouseX = event.clientX - container.offsetLeft;
});

// Define a function for spawning a new enemy
function spawnEnemy() {
    // Generate a random x coordinate between 0 and game width minus enemy width
    let x = Math.floor(Math.random() * (GAME_WIDTH - 50));
    // Set y coordinate to negative enemy height
    let y = -50;
    // Generate a random type between 1 and 3
    let type = Math.floor(Math.random() * 3) + 1;
    // Create a new enemy object with x, y, and type parameters
    let enemy = new Enemy(x, y, type);
    // Add the enemy object to the enemies array
    enemies.push(enemy);
}

// Define a function for spawning a new obstacle
function spawnObstacle() {
    // Generate a random x coordinate between 0 and game width minus obstacle width
    let x = Math.floor(Math.random() * (GAME_WIDTH - 50));
    // Set y coordinate to negative obstacle height
    let y = -50;
    // Generate a random type between 1 and 2
    let type = Math.floor(Math.random() * 2) + 1;
    // Create a new obstacle object with x, y, and type parameters
    let obstacle = new Obstacle(x, y, type);
    // Add the obstacle object to the obstacles array
    obstacles.push(obstacle);
}

// Define a function for spawning a new item
function spawnItem() {
     // Generate a random x coordinate between 0 and game width minus item width 
     let x = Math.floor(Math.random() * (GAME_WIDTH - 20)); 
     // Set y coordinate to negative item height 
     let y = -20; 
     // Create a new item object with x and y parameters 
     let item = new Item(x, y); 
     // Add the item object to the items array 
     items.push(item); 
}

// Define a function for updating the game state
function update() {
    // Check if the game is over or paused
    if (gameOver || paused) {
        // Return from the function without updating
        return;
    }
    // Increase the frame count by one
    frameCount++;
    // Update the player object
    player.update();
    // Loop through the player lasers array
    for (let i = 0; i < playerLasers.length; i++) {
        // Update the player laser object at index i
        playerLasers[i].update();
        // Check if the player laser object at index i is out of bounds
        if (playerLasers[i].isOutOfBounds()) {
            // Remove the player laser object at index i from the array
            playerLasers.splice(i, 1);
            // Decrease i by one to avoid skipping the next element
            i--;
        }
    }
    // Loop through the enemies array
    for (let i = 0; i < enemies.length; i++) {
        // Update the enemy object at index i
        enemies[i].update();
        // Check if the enemy object at index i is out of bounds
        if (enemies[i].isOutOfBounds()) {
            // Remove the enemy object at index i from the array
            enemies.splice(i, 1);
            // Decrease i by one to avoid skipping the next element
            i--;
        }
    }
    // Loop through the enemy lasers array
    for (let i = 0; i < enemyLasers.length; i++) {
        // Update the enemy laser object at index i
        enemyLasers[i].update();
        // Check if the enemy laser object at index i is out of bounds
        if (enemyLasers[i].isOutOfBounds()) {
            // Remove the enemy laser object at index i from the array
            enemyLasers.splice(i, 1);
            // Decrease i by one to avoid skipping the next element
            i--;
        }
    }
    // Loop through the obstacles array
    for (let i = 0; i < obstacles.length; i++) {
        // Update the obstacle object at index i
        obstacles[i].update();
        // Check if the obstacle object at index i is out of bounds
        if (obstacles[i].isOutOfBounds()) {
            // Remove the obstacle object at index i from the array
            obstacles.splice(i, 1);
            // Decrease i by one to avoid skipping the next element
            i--;
        }
    }
     // Loop through the items array 
     for (let i = 0; i < items.length; i++) { 
         // Update the item object at index i 
         items[i].update(); 
         // Check if the item object at index i is out of bounds 
         if (items[i].isOutOfBounds()) { 
             // Remove the item object at index i from the array 
             items.splice(i, 1); 
             // Decrease i by one to avoid skipping the next element 
             i--; 
         } 
     } 

    // Check for collisions between player lasers and enemies
    for (let i = 0; i < playerLasers.length; i++) {
        for (let j = 0; j < enemies.length; j++) {
            // Check if the player laser object at index i is colliding with the enemy object at index j
            if (playerLasers[i].isCollidingWith(enemies[j])) {
                // Remove both objects from their respective arrays
                playerLasers.splice(i, 1);
                enemies.splice(j, 1);
                // Decrease both indexes by one to avoid skipping the next elements
                i--;
                j--;
                // Increase the score by one
                score++;
                // Play the explosion sound
                document.getElementById("explosion-sound").play();
                break;
            }
        }
    }

    // Check for collisions between enemy lasers and player
    for (let i = 0; i < enemyLasers.length; i++) {
        // Check if the enemy laser object at index i is colliding with the player object
        if (enemyLasers[i].isCollidingWith(player)) {
            // Remove the enemy laser object from its array
            enemyLasers.splice(i, 1);
            // Decrease index by one to avoid skipping the next element
            i--;
            // Decrease health by laser damage amount
            health -= LASER_DAMAGE;
            break;
        }
    }

    // Check for collisions between obstacles and player or player lasers
for (let i = 0; i < obstacles.length; i++) {
    // Check if the obstacle object at index i is colliding with the player object
    if (obstacles[i].isCollidingWith(player)) {
        // Remove the obstacle object from its array
        obstacles.splice(i, 1);
        // Decrease index by one to avoid skipping the next element
        i--;
        // Decrease health by laser damage amount
        health -= LASER_DAMAGE;
        break;
    }
    // Loop through the player lasers array
    for (let j = 0; j < playerLasers.length; j++) {
        // Check if the obstacle object at index i is colliding with the player laser object at index j
        if (obstacles[i].isCollidingWith(playerLasers[j])) {
            // Remove both objects from their respective arrays
            obstacles.splice(i, 1);
            playerLasers.splice(j, 1);
            // Decrease both indexes by one to avoid skipping the next elements
            i--;
            j--;
            break;
        }
    }
}

// Check for collisions between items and player
for (let i = 0; i < items.length; i++) {
    // Check if the item object at index i is colliding with the player object
    if (items[i].isCollidingWith(player)) {
        // Remove the item object from its array
        items.splice(i, 1);
        // Decrease index by one to avoid skipping the next element
        i--;
        // Increase score by item value amount
        score += ITEM_VALUE;
        // Increase health by health recovery amount
        health += HEALTH_RECOVERY;
        // Play the item sound
        document.getElementById("item-sound").play();
        break;
    }
}

// Check if the frame count is divisible by the enemy spawn rate
if (frameCount % ENEMY_SPAWN_RATE === 0) {
    // Spawn a new enemy
    spawnEnemy();
}

// Check if the frame count is divisible by the obstacle spawn rate
if (frameCount % OBSTACLE_SPAWN_RATE === 0) {
    // Spawn a new obstacle
    spawnObstacle();
}

// Check if the frame count is divisible by the item spawn rate 
if (frameCount % ITEM_SPAWN_RATE === 0) { 
    // Spawn a new item 
    spawnItem(); 
}

// Check if health is less than or equal to zero
if (health <= 0) {
    // Set health to zero
    health = 0;
    // Set game over flag to true
    gameOver = true;
}

// Check if health is greater than 100 
if (health > 100) { 
    // Set health to 100 
    health = 100; 
}
}

// Define a function for drawing the game graphics
function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // Draw the background image
    ctx.drawImage(document.getElementById("background-image"), 0, 0, GAME_WIDTH, GAME_HEIGHT);
    // Draw the player object
    player.draw();
    // Loop through the player lasers array
    for (let laser of playerLasers) {
        // Draw the player laser object
        laser.draw();
    }
    // Loop through the enemies array
    for (let enemy of enemies) {
        // Draw the enemy object
        enemy.draw();
    }
     // Loop through the enemy lasers array 
     for (let laser of enemyLasers) { 
         // Draw the enemy laser object 
         laser.draw(); 
     } 
     // Loop through the obstacles array 
     for (let obstacle of obstacles) { 
         // Draw the obstacle object 
         obstacle.draw(); 
     } 
     // Loop through the items array 
     for (let item of items) { 
         // Draw the item object 
         item.draw(); 
     } 

    // Check if game over flag is true
    if (gameOver) {
        // Set font to 48 pixels Arial and color to white
        ctx.font = "48px Arial";
        ctx.fillStyle = "white";
        // Draw game over text at center of screen
        ctx.fillText("Game Over", GAME_WIDTH / 2 - 120, GAME_HEIGHT / 2 - 24);
    }

    // Check if paused flag is true
    if (paused) {
        // Set font to 48 pixels Arial and color to white
        ctx.font = "48px Arial";
        ctx.fillStyle = "white";
        // Draw paused text at center of screen
        ctx.fillText("Paused", GAME_WIDTH / 2 - 80, GAME_HEIGHT / 2 - 24);
    }
}

// Define a function for updating the user interface
function updateUI() {
    // Update the score span text with the current score
    scoreSpan.textContent = "Score: " + score;
    // Update the health span text with the current health
    healthSpan.textContent = "Health: " + health + "%";
}

// Define a function for the game loop
function gameLoop() {
    // Update the game state
    update();
    // Draw the game graphics
    draw();
    // Update the user interface
    updateUI();
    // Request the next animation frame
    requestAnimationFrame(gameLoop);
}

// Add an event listener for the keypress event
window.addEventListener("keypress", function (event) {
    // Check if the key code is 112 (p)
    if (event.keyCode === 112) {
        // Toggle the paused flag
        paused = !paused;
    }
});

// Define a function component that renders a start button
function StartButton() {
  // Return a JSX element that uses the Button component from Material UI
  return (
    <Button variant="contained" color="primary" onClick={startGame}>
      Start Game
    </Button>
  );
}

// Define a function component that renders an instructions button
function InstructionsButton() {
  // Return a JSX element that uses the Button component from Material UI
  return (
    <Button variant="contained" color="secondary" onClick={showInstructions}>
      Instructions
    </Button>
  );
}

// Define a function component that renders a back button
function BackButton() {
  // Return a JSX element that uses the Button component from Material UI
  return (
    <Button variant="contained" color="secondary" onClick={goBack}>
      Back
    </Button>
  );
}

// Define a function that handles the start button click
function startGame() {
    // Hide the title screen and show the game screen and ui screen
    titleScreen.style.display = "none";
    gameScreen.style.display = "block";
    uiScreen.style.display = "block";
    // Start the game loop
    requestAnimationFrame(gameLoop);
}

// Define a function that handles the instructions button click
function showInstructions() {
    // Hide the title screen and show the instructions screen
    titleScreen.style.display = "none";
    instructionsScreen.style.display = "flex";
}

// Define a function that handles the back button click
function goBack() {
    // Hide the instructions screen and show the title screen
    instructionsScreen.style.display = "none";
    titleScreen.style.display = "flex";
}

// Render the start button component in the start button element
ReactDOM.render(<StartButton />, startButton);

// Render the instructions button component in the instructions button element
ReactDOM.render(<InstructionsButton />, instructionsButton);

// Render the back button component in the back button element
ReactDOM.render(<BackButton />, backButton);

