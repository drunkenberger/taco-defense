// Game state variables
let gameState = 'menu';       // Current state: 'menu', 'playing', 'gameover'
let score = 0;                // Player's score
let chef;                     // Chef object
let chupacabras = [];         // Array to hold chupacabras (formerly zombies)
let tacos = [];               // Array to hold thrown tacos
let lastTacoTime = 0;         // Timestamp of the last taco throw
let tacoCooldown = 500;       // Cooldown between taco throws (ms)
let regularTacoCooldown = 150; // Shorter cooldown for regular tacos (ms)
let heldRegularTacoCooldown = 300; // Slower cooldown when space is held down (ms)
let lastRegularTacoTime = 0;  // Separate timestamp for regular tacos
let spaceBarWasPressed = false; // Track if space bar was already pressed
let spaceBarHoldStartTime = 0; // Track when space bar was first held down
let chupacabraSpawnInterval = 2000; // Initial chupacabra spawn interval (ms)
let lastChupacabraSpawnTime = 0;  // Timestamp of the last chupacabra spawn
let spicyTacoCount = 5;       // Limited ammo for spicy tacos
let superTacoCooldown = 30000; // 30 seconds cooldown for super tacos
let lastSuperTacoTime = 0;    // Track when the last super taco was thrown
let currentTacoType = 'regular'; // Track which taco type is selected
let powerups = [];            // Array to hold powerups
let lastPowerupTime = 0;      // Timestamp of the last powerup spawn
let powerupInterval = 10000;  // 10 seconds between powerups
let difficultyLevel = 1;      // Current difficulty level
let scoreThreshold = 10;      // Increase difficulty every 10 points
let fedEffects = [];          // Array to hold visual effects when chupacabras are fed
let pixelSize = 6;            // Size of each "pixel" for retro look
let retroColors;              // Color palette for retro look
let soundEnabled = false;     // Default to false, will be set to true if sound library is available
let lives = 3;                // Player lives
let wave = 1;                 // Current wave
let highScore = 0;            // High score
let lastWaveScore = 0;        // Score at the start of the current wave
let chupacabraSpeed = 1;      // Speed of chupacabras
let newHighScore = false;     // Flag for new high score
let playerName = '';          // Player's name for leaderboard
let playerEmail = '';         // Player's email for leaderboard
let inputField = 'name';      // 'name' or 'email'
let leaderboardData = [];     // Leaderboard data
let showLeaderboard = false;  // Flag to show/hide leaderboard
let scoreSubmitted = false;   // Flag to track if score has been submitted

// Check if p5.sound is available
let soundLibraryAvailable = false;

// Image variables
let chefImg;                  // Chef sprite image
let tacoImg1;                 // Regular taco image
let tacoImg2;                 // Spicy taco image
let tacoImg3;                 // Super taco image
let chupacabrasImgs = [];     // Array to hold Chupacabras images
let backgroundImg;            // Background image for the main game

// Sound variables
let soundMenuSelect;          // Menu selection sound
let soundGameStart;           // Game start sound
let soundTacoThrow;           // Regular taco throw sound
let soundSpicyTacoThrow;      // Spicy taco throw sound
let soundSuperTacoThrow;      // Super taco throw sound
let soundChupacabraFed;       // Chupacabra fed sound
let soundPowerup;             // Powerup collection sound
let soundGameOver;            // Game over sound
let soundHighScore;           // High score sound
let bgMusic;                  // Background music
let introMusic;               // Intro/menu music
let gameoverMusic;            // Game over music

// Add a variable to track the last toggle time
let lastLeaderboardToggleTime = 0;

// Check if DOM is loaded, if not add event listener
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeLeaderboard);
} else {
  // DOM is already loaded, initialize immediately
  initializeLeaderboard();
}

// Function to initialize leaderboard elements
function initializeLeaderboard() {
  console.log("Initializing leaderboard elements");
  const leaderboardContainer = document.getElementById('leaderboard-container');
  const htmlLeaderboardButton = document.getElementById('html-leaderboard-button');
  const closeLeaderboardButton = document.getElementById('close-leaderboard');
  
  if (!leaderboardContainer) {
    console.error("Leaderboard container not found in the DOM");
  } else {
    console.log("Leaderboard container found:", leaderboardContainer);
  }
  
  if (!htmlLeaderboardButton) {
    console.error("HTML leaderboard button not found in the DOM");
  } else {
    console.log("HTML leaderboard button found:", htmlLeaderboardButton);
  }
  
  if (!closeLeaderboardButton) {
    console.error("Close leaderboard button not found in the DOM");
  } else {
    console.log("Close leaderboard button found:", closeLeaderboardButton);
  }
}

// Preload function to load images before setup
function preload() {
  console.log("Starting preload function");
  
  // Load chupacabra images with better error handling
  chupacabrasImgs = [];
  for (let i = 1; i <= 7; i++) {
    try {
      loadImage(`assets/chupacabras_${i}.png`, 
        img => {
          chupacabrasImgs.push(img);
          console.log(`Loaded chupacabras_${i}.png successfully`);
        },
        () => {
          console.error(`Failed to load chupacabras_${i}.png`);
          // Push a placeholder to maintain array order
          let fallbackImg = createGraphics(64, 64);
          fallbackImg.background(255, 0, 0);
          fallbackImg.fill(0);
          fallbackImg.textSize(10);
          fallbackImg.textAlign(CENTER, CENTER);
          fallbackImg.text("CHUP", 32, 32);
          chupacabrasImgs.push(fallbackImg);
        }
      );
    } catch (e) {
      console.error(`Error loading chupacabras_${i}.png:`, e);
    }
  }
  
  // Load background image with better error handling
  try {
    loadImage('assets/background_2.jpg', 
      img => {
        backgroundImg = img;
        console.log("Background image (background_2.jpg) loaded successfully");
      },
      () => {
        console.error("Failed to load background image");
        // Create a fallback background
        backgroundImg = createGraphics(800, 600);
        backgroundImg.background(0, 0, 128);
        backgroundImg.fill(255);
        backgroundImg.textSize(20);
        backgroundImg.textAlign(CENTER, CENTER);
        backgroundImg.text("BACKGROUND", 400, 300);
      }
    );
  } catch (e) {
    console.error("Error loading background image:", e);
  }
  
  // Load chef image with better error handling
  try {
    loadImage('assets/taco_chef.png',
      img => {
        chefImg = img;
        console.log("Chef image (taco_chef.png) loaded successfully");
      },
      () => {
        console.error("Failed to load chef image");
        // Create a fallback chef image
        chefImg = createGraphics(64, 64);
        chefImg.background(0, 255, 0);
        chefImg.fill(0);
        chefImg.textSize(10);
        chefImg.textAlign(CENTER, CENTER);
        chefImg.text("CHEF", 32, 32);
      }
    );
  } catch (e) {
    console.error("Error loading chef image:", e);
  }
  
  // Load taco images with better error handling
  try {
    loadImage('assets/taco1.png',
      img => {
        tacoImg1 = img;
        console.log("Taco1 image loaded successfully");
      },
      () => {
        console.error("Failed to load taco1.png");
        // Create a fallback taco image
        tacoImg1 = createGraphics(32, 32);
        tacoImg1.background(255, 255, 0);
        tacoImg1.fill(0);
        tacoImg1.textSize(8);
        tacoImg1.textAlign(CENTER, CENTER);
        tacoImg1.text("TACO", 16, 16);
      }
    );
  } catch (e) {
    console.error("Error loading taco1.png:", e);
  }
  
  try {
    loadImage('assets/taco2.png',
      img => {
        tacoImg2 = img;
        console.log("Taco2 image loaded successfully");
      },
      () => {
        console.error("Failed to load taco2.png");
        // Create a fallback spicy taco image
        tacoImg2 = createGraphics(32, 32);
        tacoImg2.background(255, 128, 0);
        tacoImg2.fill(0);
        tacoImg2.textSize(8);
        tacoImg2.textAlign(CENTER, CENTER);
        tacoImg2.text("SPICY", 16, 16);
      }
    );
  } catch (e) {
    console.error("Error loading taco2.png:", e);
  }
  
  try {
    loadImage('assets/taco3.png',
      img => {
        tacoImg3 = img;
        console.log("Taco3 image loaded successfully");
      },
      () => {
        console.error("Failed to load taco3.png");
        // Create a fallback super taco image
        tacoImg3 = createGraphics(48, 48);
        tacoImg3.background(255, 0, 255);
        tacoImg3.fill(0);
        tacoImg3.textSize(8);
        tacoImg3.textAlign(CENTER, CENTER);
        tacoImg3.text("SUPER", 24, 24);
      }
    );
  } catch (e) {
    console.error("Error loading taco3.png:", e);
  }
  
  // Load sound effects if p5.sound is available
  if (typeof loadSound === 'function') {
    console.log("p5.sound library available, loading sounds");
    soundLibraryAvailable = true;
    
    try {
      console.log("Loading menu_select.mp3");
      soundMenuSelect = loadSound('assets/sounds/menu_select.mp3',
        () => console.log("menu_select.mp3 loaded successfully"),
        (err) => console.error("Error loading menu_select.mp3:", err)
      );
      
      console.log("Loading game_start.mp3");
      soundGameStart = loadSound('assets/sounds/game_start.mp3',
        () => console.log("game_start.mp3 loaded successfully"),
        (err) => console.error("Error loading game_start.mp3:", err)
      );
      
      console.log("Loading taco_throw.mp3");
      soundTacoThrow = loadSound('assets/sounds/taco_throw.mp3',
        () => console.log("taco_throw.mp3 loaded successfully"),
        (err) => console.error("Error loading taco_throw.mp3:", err)
      );
      
      console.log("Loading spicy_taco_throw.mp3");
      soundSpicyTacoThrow = loadSound('assets/sounds/spicy_taco_throw.mp3',
        () => console.log("spicy_taco_throw.mp3 loaded successfully"),
        (err) => console.error("Error loading spicy_taco_throw.mp3:", err)
      );
      
      console.log("Loading super_taco_throw.mp3");
      soundSuperTacoThrow = loadSound('assets/sounds/super_taco_throw.mp3',
        () => console.log("super_taco_throw.mp3 loaded successfully"),
        (err) => console.error("Error loading super_taco_throw.mp3:", err)
      );
      
      console.log("Loading chupacabra_fed.mp3");
      soundChupacabraFed = loadSound('assets/sounds/chupacabra_fed.mp3',
        () => console.log("chupacabra_fed.mp3 loaded successfully"),
        (err) => console.error("Error loading chupacabra_fed.mp3:", err)
      );
      
      console.log("Loading powerup.mp3");
      soundPowerup = loadSound('assets/sounds/powerup.mp3',
        () => console.log("powerup.mp3 loaded successfully"),
        (err) => console.error("Error loading powerup.mp3:", err)
      );
      
      console.log("Loading game_over.mp3");
      soundGameOver = loadSound('assets/sounds/game_over.mp3',
        () => console.log("game_over.mp3 loaded successfully"),
        (err) => console.error("Error loading game_over.mp3:", err)
      );
      
      console.log("Loading high_score.mp3");
      soundHighScore = loadSound('assets/sounds/high_score.mp3',
        () => console.log("high_score.mp3 loaded successfully"),
        (err) => console.error("Error loading high_score.mp3:", err)
      );
      
      // Load music
      console.log("Loading background_music.mp3");
      bgMusic = loadSound('assets/sounds/background_music.mp3',
        () => console.log("background_music.mp3 loaded successfully"),
        (err) => console.error("Error loading background_music.mp3:", err)
      );
      
      console.log("Loading intro_music.mp3");
      introMusic = loadSound('assets/sounds/intro_music.mp3',
        () => console.log("intro_music.mp3 loaded successfully"),
        (err) => console.error("Error loading intro_music.mp3:", err)
      );
      
      console.log("Loading gameover_music.mp3");
      gameoverMusic = loadSound('assets/sounds/gameover_music.mp3',
        () => console.log("gameover_music.mp3 loaded successfully"),
        (err) => console.error("Error loading gameover_music.mp3:", err)
      );
    } catch (e) {
      console.error("Error loading sounds:", e);
      soundLibraryAvailable = false;
      soundEnabled = false;
    }
  } else {
    console.log("p5.sound library is NOT available");
    soundLibraryAvailable = false;
    soundEnabled = false;
  }
  
  console.log("Preload function completed");
}

// Setup function to initialize the game
function setup() {
  console.log("Setting up game...");
  
  // Create canvas with responsive dimensions
  let gameContainer = document.getElementById('game-container');
  let canvasWidth = min(windowWidth * 0.9, windowHeight * 0.9 * (4/3));
  let canvasHeight = min(windowHeight * 0.9, windowWidth * 0.9 * (3/4));
  
  canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('game-container');
  
  // Set up pixel density and smooth settings
  pixelDensity(1);
  noSmooth();
  
  // Initialize game state variables
  gameState = 'menu';
  showLeaderboard = false;
  scoreSubmitted = false;
  submitAttempted = false;
  playerName = '';
  playerEmail = '';
  inputField = 'name';
  
  // Check and fix any missing assets
  checkAndFixAssets();
  
  // Ensure leaderboard container is properly initialized
  const leaderboardContainer = document.getElementById('leaderboard-container');
  if (leaderboardContainer) {
    console.log("Leaderboard container found in setup");
    // Ensure it's hidden initially
    leaderboardContainer.style.display = 'none';
    leaderboardContainer.style.visibility = 'hidden';
    // Set a high z-index to ensure it appears above the canvas
    leaderboardContainer.style.zIndex = '1000';
  } else {
    console.error("Leaderboard container not found in the DOM during setup");
  }
  
  console.log("Defining color palette");
  // Define authentic NES-style color palette
  retroColors = {
    black: color(0, 0, 0),
    darkBlue: color(0, 0, 128),
    darkPurple: color(128, 0, 128),
    darkGreen: color(0, 128, 0),
    brown: color(128, 64, 0),
    darkGray: color(84, 84, 84),
    lightGray: color(168, 168, 168),
    white: color(255, 255, 255),
    red: color(240, 0, 0),
    orange: color(255, 136, 0),
    yellow: color(240, 240, 0),
    green: color(0, 240, 0),
    cyan: color(0, 240, 240),
    blue: color(0, 0, 240),
    pink: color(240, 0, 240),
    gold: color(255, 215, 0),
    darkRed: color(128, 0, 0)
  };
  
  // Initialize sound settings
  initializeSoundLibrary();
  
  // Add sound toggle button with better styling
  let soundButton = createButton(soundEnabled ? 'Sound: ON' : 'Sound: OFF');
  
  // Position directly below the leaderboard button
  soundButton.position(10, 50);
  soundButton.parent('game-container');
  
  // Match the styling of the leaderboard button for consistency
  soundButton.style('width', '120px');
  soundButton.style('background-color', soundEnabled ? '#4CAF50' : '#f44336');
  soundButton.style('color', 'white');
  soundButton.style('border', '2px solid ' + (soundEnabled ? '#5FD35F' : '#FF5555'));
  soundButton.style('padding', '8px 15px');
  soundButton.style('text-align', 'center');
  soundButton.style('text-decoration', 'none');
  soundButton.style('display', 'inline-block');
  soundButton.style('font-size', '12px');
  soundButton.style('font-family', 'Courier New, monospace');
  soundButton.style('text-transform', 'uppercase');
  soundButton.style('font-weight', 'bold');
  soundButton.style('z-index', '100');
  soundButton.style('box-shadow', '0 0 10px rgba(' + (soundEnabled ? '76, 175, 80' : '244, 67, 54') + ', 0.5)');
  soundButton.style('transition', 'all 0.3s ease');
  soundButton.style('border-radius', '4px');
  soundButton.style('cursor', 'pointer');
  
  // Add hover effect
  soundButton.mouseOver(() => {
    soundButton.style('transform', 'scale(1.05)');
    soundButton.style('box-shadow', '0 0 15px rgba(' + (soundEnabled ? '76, 175, 80' : '244, 67, 54') + ', 0.8)');
  });
  
  soundButton.mouseOut(() => {
    soundButton.style('transform', 'scale(1.0)');
    soundButton.style('box-shadow', '0 0 10px rgba(' + (soundEnabled ? '76, 175, 80' : '244, 67, 54') + ', 0.5)');
  });
  
  soundButton.mousePressed(() => {
    soundEnabled = !soundEnabled;
    console.log("Sound toggled:", soundEnabled ? "ON" : "OFF");
    
    // Update button text and styling
    soundButton.html(soundEnabled ? 'Sound: ON' : 'Sound: OFF');
    soundButton.style('background-color', soundEnabled ? '#4CAF50' : '#f44336');
    soundButton.style('border', '2px solid ' + (soundEnabled ? '#5FD35F' : '#FF5555'));
    soundButton.style('box-shadow', '0 0 10px rgba(' + (soundEnabled ? '76, 175, 80' : '244, 67, 54') + ', 0.5)');
    
    // Handle music playback based on sound toggle state
    if (soundEnabled) {
      if (gameState === 'playing' && bgMusic && !bgMusic.isPlaying()) {
        bgMusic.play();
      } else if (gameState === 'menu' && introMusic && !introMusic.isPlaying()) {
        introMusic.play();
      } else if (gameState === 'gameover' && gameoverMusic && !gameoverMusic.isPlaying()) {
        gameoverMusic.play();
      }
      
      // Play a toggle sound effect
      if (soundLibrary.blip) {
        playSound(soundLibrary.blip, 1.0);
      }
    } else {
      if (bgMusic && bgMusic.isPlaying()) {
        bgMusic.pause();
      }
      if (introMusic && introMusic.isPlaying()) {
        introMusic.pause();
      }
      if (gameoverMusic && gameoverMusic.isPlaying()) {
        gameoverMusic.pause();
      }
    }
  });
  
  // Increase pixel size for more chunky 8-bit look
  pixelSize = 6;
  
  console.log("Creating chef object");
  chef = {
    x: width / 2,            // Center of the screen horizontally
    y: height - 50,          // Near the bottom
    size: 48,                // Size of the chef sprite (multiple of pixelSize)
    speed: 8                 // Movement speed (reduced for retro feel)
  };
  
  // Initialize game variables
  lives = 3;
  wave = 1;
  highScore = localStorage.getItem('tacoDefenseHighScore') || 0;
  lastWaveScore = 0;
  chupacabraSpeed = 1;
  
  // Load leaderboard data
  loadLeaderboard();
  
  // Initialize HTML leaderboard button
  const htmlLeaderboardButton = document.getElementById('html-leaderboard-button');
  if (htmlLeaderboardButton) {
    console.log("Found HTML leaderboard button, adding event listener");
    htmlLeaderboardButton.addEventListener('click', toggleLeaderboard);
  } else {
    console.error("HTML leaderboard button not found");
  }
  
  // Initialize close leaderboard button
  const closeLeaderboardButton = document.getElementById('close-leaderboard');
  if (closeLeaderboardButton) {
    console.log("Found close leaderboard button, adding event listener");
    // Use a custom handler instead of directly calling toggleLeaderboard
    closeLeaderboardButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      
      // Only toggle the leaderboard visibility without changing game state
      if (showLeaderboard) {
        toggleLeaderboard();
      }
    });
  } else {
    console.error("Close leaderboard button not found");
  }
  
  // Initialize last toggle time for debouncing
  lastLeaderboardToggleTime = 0;
  
  console.log("Setup complete");
}

// Main draw function - called every frame
function draw() {
  background(retroColors.darkBlue);  // Dark blue background
  
  // Game state machine
  if (gameState === 'menu') {
    drawMenu();
    
    // Play intro music if not already playing
    if (soundLibraryAvailable && soundEnabled && introMusic && !introMusic.isPlaying()) {
      // Stop other music if playing
      if (bgMusic && bgMusic.isPlaying()) bgMusic.pause();
      if (gameoverMusic && gameoverMusic.isPlaying()) gameoverMusic.pause();
      introMusic.play();
      console.log("Playing intro music");
    }
  } else if (gameState === 'playing') {
    // Play background music if not already playing
    if (soundLibraryAvailable && soundEnabled && bgMusic && !bgMusic.isPlaying()) {
      // Stop other music if playing
      if (introMusic && introMusic.isPlaying()) introMusic.pause();
      if (gameoverMusic && gameoverMusic.isPlaying()) gameoverMusic.pause();
      bgMusic.play();
      console.log("Playing background music");
    }
    
    drawGame();
  } else if (gameState === 'gameover') {
    // Play game over music if not already playing
    if (soundLibraryAvailable && soundEnabled && gameoverMusic && !gameoverMusic.isPlaying()) {
      // Stop other music if playing
      if (bgMusic && bgMusic.isPlaying()) bgMusic.pause();
      if (introMusic && introMusic.isPlaying()) introMusic.pause();
      gameoverMusic.play();
      console.log("Playing gameover music");
    }
    
    drawGameOver();
  }
  
  // Add CRT screen effect
  drawCRTEffect();
}

// Draw the menu screen
function drawMenu() {
  // Background with pixel pattern (like Contra title screen)
  background(retroColors.black);
  
  // Animated background grid
  for (let x = 0; x < width; x += pixelSize * 8) {
    for (let y = 0; y < height; y += pixelSize * 8) {
      let color1 = retroColors.darkBlue;
      let color2 = color(0, 0, 80);
      let gridColor = ((x/pixelSize/8 + y/pixelSize/8 + floor(frameCount/10)) % 2 === 0) ? color1 : color2;
      fill(gridColor);
      rect(x, y, pixelSize * 8, pixelSize * 8);
    }
  }
  
  // Title with retro styling and shadow effect
  let titleY = height / 4;
  drawPixelText('TACO DEFENSE', width / 2 + 4, titleY + 4, 5, retroColors.black);
  drawPixelText('TACO DEFENSE', width / 2, titleY, 5, retroColors.red);
  
  // Animated subtitle
  let subtitleColor = lerpColor(retroColors.yellow, retroColors.white, sin(frameCount * 0.05) * 0.5 + 0.5);
  drawPixelText('CHUPACABRA EDITION', width / 2, height / 3, 2, subtitleColor);
  
  // Instructions panel (like NES game manual style)
  drawPixelRect(width/2 - 250, height/2 - 30, 500, 150, retroColors.darkBlue);
  drawPixelRect(width/2 - 245, height/2 - 25, 490, 140, retroColors.black);
  
  // Instructions with NES-style formatting
  drawPixelText('CONTROLS:', width / 2, height / 2 - 10, 2, retroColors.cyan);
  drawPixelText('← → TO MOVE', width / 2, height / 2 + 20, 1.5, retroColors.white);
  drawPixelText('SPACE TO THROW TACOS', width / 2, height / 2 + 45, 1.5, retroColors.white);
  drawPixelText('1-2-3 TO SWITCH WEAPONS', width / 2, height / 2 + 70, 1.5, retroColors.white);
  
  // Start button with NES-style blinking
  let buttonY = height/2 + 150;
  let buttonVisible = frameCount % 60 < 45; // Blink effect
  
  if (buttonVisible) {
    drawPixelRect(width/2 - 100, buttonY - 25, 200, 50, retroColors.blue);
    drawPixelRect(width/2 - 95, buttonY - 20, 190, 40, retroColors.darkBlue);
    drawPixelText('PRESS START', width/2, buttonY + 5, 2, retroColors.white);
  }
  
  // Copyright text like old NES games
  drawPixelText('© 2023 TACO CHUPACABRA CORP.', width/2, height - 30, 1, retroColors.lightGray);
  
  // Add "Powered by tocesnearme.net" footer
  drawPixelText('POWERED BY TOCESNEARME.NET', width/2, height - 10, 1, retroColors.cyan);
  
  // Animated chef and chupacabra at the bottom
  drawRetroChefForMenu(width/3, height - 100);
  drawChupacabraForMenu(width*2/3, height - 100);
  
  // Add flickering scanlines
  for (let y = 0; y < height; y += 3) {
    if ((y + frameCount) % 7 !== 0) {
      stroke(0, 0, 0, 15);
      strokeWeight(1);
      line(0, y, width, y);
    }
  }
  noStroke();
}

// Draw pixelated background
function drawPixelatedBackground() {
  // Draw a grid pattern
  noStroke();
  for (let x = 0; x < width; x += pixelSize * 8) {
    for (let y = 0; y < height; y += pixelSize * 8) {
      if ((x/pixelSize/8 + y/pixelSize/8) % 2 === 0) {
        fill(retroColors.darkBlue);
      } else {
        fill(color(0, 0, 150));
      }
      rect(x, y, pixelSize * 8, pixelSize * 8);
    }
  }
}

// Draw pixelated text
function drawPixelText(txt, x, y, size, color) {
  push();
  textAlign(CENTER, CENTER);
  textSize(size * 12);
  fill(color);
  noStroke();
  text(txt, x, y);
  pop();
}

// Draw pixelated rectangle
function drawPixelRect(x, y, w, h, color) {
  push();
  fill(color);
  noStroke();
  rect(x, y, w, h);
  pop();
}

// Draw a pixelated taco (now using loaded images)
function drawPixelTaco(x, y, size, type) {
  push();
  translate(x, y);
  imageMode(CENTER);
  
  if (type === 'regular') {
    // Regular taco
    image(tacoImg1, 0, 0, size, size);
    
  } else if (type === 'spicy') {
    // Spicy taco with animation effect
    image(tacoImg2, 0, 0, size, size);
    
    // Fire effect animation
    if (frameCount % 10 < 5) {
      noFill();
      stroke(retroColors.yellow);
      strokeWeight(2);
      rect(-size/2 - 2, -size/2 - 2, size + 4, size + 4);
    } else {
      noFill();
      stroke(retroColors.orange);
      strokeWeight(2);
      rect(-size/2 - 2, -size/2 - 2, size + 4, size + 4);
    }
    
  } else if (type === 'super') {
    // Super taco (trompo de pastor) with increased size and enhanced animation
    let superSize = size * 1.5; // Make the super taco 50% larger
    image(tacoImg3, 0, 0, superSize, superSize);
    
    // Enhanced glowing effect with rotating border
    let angle = frameCount * 0.1;
    let points = 8;
    
    // Outer glow
    stroke(retroColors.orange);
    strokeWeight(2);
    noFill();
    beginShape();
    for (let i = 0; i < points; i++) {
      let a = angle + TWO_PI * i / points;
      let glowSize = superSize/2 + 10 + sin(frameCount * 0.2) * 3;
      let px = cos(a) * glowSize;
      let py = sin(a) * glowSize;
      vertex(px, py);
    }
    endShape(CLOSE);
    
    // Inner glow
    stroke(retroColors.yellow);
    strokeWeight(2);
    beginShape();
    for (let i = 0; i < points; i++) {
      let a = -angle + TWO_PI * i / points;
      let glowSize = superSize/2 + 5;
      let px = cos(a) * glowSize;
      let py = sin(a) * glowSize;
      vertex(px, py);
    }
    endShape(CLOSE);
  }
  
  pop();
}

// Draw retro chef for menu
function drawRetroChefForMenu(x, y) {
  push();
  translate(x, y);
  
  // Draw the chef image with transparency
  imageMode(CENTER);
  let menuChefSize = 64;
  image(chefImg, 0, 0, menuChefSize, menuChefSize);
  
  // Animated taco throwing
  let tacoX = 30 + sin(frameCount * 0.1) * 20;
  let tacoY = -30 + cos(frameCount * 0.1) * 10;
  
  // Draw taco using the image with transparency
  drawPixelTaco(tacoX, tacoY, 16, 'regular');
  
  pop();
}

// Draw Chupacabra for menu (formerly drawRetroZombieForMenu)
function drawChupacabraForMenu(x, y) {
  push();
  translate(x, y);
  
  // Draw a Chupacabra for the menu
  imageMode(CENTER);
  let menuChupacabraSize = 64;
  
  // Check if the image exists before trying to display it
  if (chupacabrasImgs[0] && chupacabrasImgs[0].width > 0) {
    // For PNG images with transparency
    image(chupacabrasImgs[0], 0, 0, menuChupacabraSize, menuChupacabraSize);
  } else {
    // Fallback if image isn't loaded - draw a simple placeholder
    fill(retroColors.red);
    rect(-menuChupacabraSize/2, -menuChupacabraSize/2, menuChupacabraSize, menuChupacabraSize);
    fill(retroColors.white);
    textSize(16);
    textAlign(CENTER, CENTER);
    text("?", 0, 0);
  }
  
  // Add a speech bubble with "TACOS!" text
  fill(retroColors.white);
  noStroke();
  ellipse(20, -40, 60, 40);
  triangle(0, -30, 10, -20, 20, -30);
  
  fill(retroColors.black);
  textSize(10);
  textAlign(CENTER, CENTER);
  text("TACOS!", 20, -40);
  
  pop();
}

// Draw the gameplay screen
function drawGame() {
  // Draw retro background
  drawRetroBackground();
  
  // Handle taco type selection
  if (keyIsDown(49)) { // Key '1'
    currentTacoType = 'regular';
  } else if (keyIsDown(50)) { // Key '2'
    currentTacoType = 'spicy';
  } else if (keyIsDown(51)) { // Key '3'
    currentTacoType = 'super';
  }
  
  // Handle chef movement
  if (keyIsDown(LEFT_ARROW)) {
    chef.x -= chef.speed;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    chef.x += chef.speed;
  }
  chef.x = constrain(chef.x, chef.size / 2, width - chef.size / 2);

  // Handle taco throwing with mouse or space bar
  if (mouseIsPressed) {
    // Mouse press always uses the standard cooldown
    if (currentTacoType === 'spicy' && spicyTacoCount > 0 && millis() - lastTacoTime > tacoCooldown) {
      tacos.push(new RetroTaco(chef.x, chef.y - chef.size/2, 'spicy'));
      spicyTacoCount--;
      lastTacoTime = millis();
    } else if (currentTacoType === 'super' && millis() - lastSuperTacoTime > superTacoCooldown && millis() - lastTacoTime > tacoCooldown) {
      tacos.push(new RetroTaco(chef.x, chef.y - chef.size/2, 'super'));
      lastSuperTacoTime = millis();
      lastTacoTime = millis();
    } else if (currentTacoType === 'regular' && millis() - lastRegularTacoTime > regularTacoCooldown) {
      tacos.push(new RetroTaco(chef.x, chef.y - chef.size/2, 'regular'));
      lastRegularTacoTime = millis();
    }
  } else if (keyIsDown(32)) { // Space bar is being held down
    // If space bar wasn't pressed before, this is a new press
    if (!spaceBarWasPressed) {
      spaceBarWasPressed = true;
      spaceBarHoldStartTime = millis();
      
      // For a new press, immediately fire regardless of cooldown (for responsiveness)
      if (currentTacoType === 'spicy' && spicyTacoCount > 0) {
        tacos.push(new RetroTaco(chef.x, chef.y - chef.size/2, 'spicy'));
        spicyTacoCount--;
        lastTacoTime = millis();
      } else if (currentTacoType === 'super' && millis() - lastSuperTacoTime > superTacoCooldown) {
        tacos.push(new RetroTaco(chef.x, chef.y - chef.size/2, 'super'));
        lastSuperTacoTime = millis();
        lastTacoTime = millis();
      } else if (currentTacoType === 'regular') {
        tacos.push(new RetroTaco(chef.x, chef.y - chef.size/2, 'regular'));
        lastRegularTacoTime = millis();
      }
    } else {
      // Space bar is being held down, use slower cooldown for regular tacos
      if (currentTacoType === 'spicy' && spicyTacoCount > 0 && millis() - lastTacoTime > tacoCooldown) {
        tacos.push(new RetroTaco(chef.x, chef.y - chef.size/2, 'spicy'));
        spicyTacoCount--;
        lastTacoTime = millis();
      } else if (currentTacoType === 'super' && millis() - lastSuperTacoTime > superTacoCooldown && millis() - lastTacoTime > tacoCooldown) {
        tacos.push(new RetroTaco(chef.x, chef.y - chef.size/2, 'super'));
        lastSuperTacoTime = millis();
        lastTacoTime = millis();
      } else if (currentTacoType === 'regular' && millis() - lastRegularTacoTime > heldRegularTacoCooldown) {
        tacos.push(new RetroTaco(chef.x, chef.y - chef.size/2, 'regular'));
        lastRegularTacoTime = millis();
      }
    }
  } else {
    // Space bar is not pressed, reset the flag
    spaceBarWasPressed = false;
  }

  // Draw the chef sprite
  drawRetroChef();

  // Update and draw chupacabras
  updateRetroChupacabras();

  // Update and draw tacos
  updateRetroTacos();
  
  // Update and draw powerups
  updateRetroPowerups();
  
  // Update and draw fed effects
  updateRetroFedEffects();

  // Spawn new chupacabras based on interval
  if (millis() - lastChupacabraSpawnTime > chupacabraSpawnInterval) {
    // Generate a random chupacabra type instead of using random(1, 3) as the third parameter
    let chupacabraTypes = ['regular', 'fast', 'big'];
    let randomType = chupacabraTypes[floor(random(chupacabraTypes.length))];
    chupacabras.push(new Chupacabra(random(width), 0, random(1, 2), randomType));
    lastChupacabraSpawnTime = millis();
  }
  
  // Spawn powerups
  if (millis() - lastPowerupTime > powerupInterval) {
    powerups.push(new RetroPowerup(random(width), 0));
    lastPowerupTime = millis();
  }

  // Display the game UI
  drawRetroGameUI();
  
  // Increase difficulty based on score
  if (score >= difficultyLevel * scoreThreshold) {
    difficultyLevel++;
    chupacabraSpawnInterval = max(500, chupacabraSpawnInterval - 200);
  }
}

// Draw retro background for gameplay
function drawRetroBackground() {
  // Use the background image instead of drawing elements manually
  if (backgroundImg && backgroundImg.width > 0) {
    // Draw the background image to fill the canvas
    image(backgroundImg, 0, 0, width, height);
  } else {
    // Fallback to the original background if image fails to load
    // Dark sky background (like Ninja Gaiden night levels)
    background(retroColors.black);
    
    // Distant mountains (like in Contra)
    fill(retroColors.darkBlue);
    for (let i = 0; i < 5; i++) {
      let mountainWidth = width / 3;
      let mountainHeight = 100 + i * 20;
      let mountainX = (i * width/2) % (width + mountainWidth) - mountainWidth/2;
      
      // Draw pixelated mountain
      beginShape();
      for (let x = 0; x < mountainWidth; x += pixelSize) {
        let y = mountainHeight * (1 - pow(2 * (x / mountainWidth - 0.5), 2));
        vertex(mountainX + x, height - 100 - y);
      }
      vertex(mountainX + mountainWidth, height - 100);
      vertex(mountainX, height - 100);
      endShape(CLOSE);
    }
    
    // Stars in the background (twinkling)
    fill(retroColors.white);
    for (let i = 0; i < 30; i++) {
      let x = (i * 37 + frameCount/2) % width;
      let y = (i * 23) % (height - 200);
      let twinkle = sin(frameCount * 0.1 + i) > 0;
      if (twinkle) {
        drawPixelRect(x, y, pixelSize, pixelSize, retroColors.white);
      }
    }
    
    // Ground (like classic platformers)
    fill(retroColors.darkGreen);
    rect(0, height - 20, width, 20);
    
    // Brick pattern on ground
    fill(retroColors.brown);
    for (let x = 0; x < width; x += pixelSize * 4) {
      drawPixelRect(x, height - 20, pixelSize * 2, pixelSize, retroColors.brown);
      drawPixelRect(x + pixelSize * 2, height - 20 + pixelSize, pixelSize * 2, pixelSize, retroColors.brown);
    }
  }
  
  // Always draw the taco stand on top of the background
  // Taco stand (more like an NES building)
  drawPixelRect(width/2 - 150, height - 100, 300, 80, retroColors.darkGray);
  
  // Windows
  for (let x = width/2 - 130; x < width/2 + 130; x += 40) {
    drawPixelRect(x, height - 90, 20, 20, retroColors.blue);
    drawPixelRect(x, height - 60, 20, 20, retroColors.blue);
  }
  
  // Sign
  drawPixelRect(width/2 - 100, height - 130, 200, 30, retroColors.red);
  drawPixelText("TACO CHUPACABRA", width/2, height - 115, 1.5, retroColors.white);
  
  // Add scanlines for CRT effect
  for (let y = 0; y < height; y += pixelSize) {
    stroke(0, 0, 0, 20);
    strokeWeight(1);
    line(0, y, width, y);
  }
  noStroke();
}

// Update and draw retro chupacabras
function updateRetroChupacabras() {
  for (let i = chupacabras.length - 1; i >= 0; i--) {
    chupacabras[i].update();
    chupacabras[i].display();
    
    // Check if chupacabra reached the chef
    if (chupacabras[i].y > chef.y - chef.size/2) {
      gameState = 'gameover';
      // Play game over sound
      if (soundLibraryAvailable && soundEnabled && soundGameOver) {
        playSound(soundGameOver);
      }
      return;
    }
    
    // Check collisions with tacos
    for (let j = tacos.length - 1; j >= 0; j--) {
      let distance = dist(chupacabras[i].x, chupacabras[i].y, tacos[j].x, tacos[j].y);
      
      if (tacos[j].type === 'regular' && distance < chupacabras[i].size/2 + tacos[j].size/2) {
        // Regular taco hits one chupacabra
        score++;
        fedEffects.push({
          x: chupacabras[i].x,
          y: chupacabras[i].y,
          timer: 30
        });
        // Play chupacabra fed sound
        if (soundLibraryAvailable && soundEnabled && soundChupacabraFed) {
          playSound(soundChupacabraFed);
        }
        chupacabras.splice(i, 1);
        tacos.splice(j, 1);
        break;
      } else if (tacos[j].type === 'spicy' && distance < tacos[j].radius) {
        // Spicy taco hits chupacabras in radius
        score += 2;
        fedEffects.push({
          x: chupacabras[i].x,
          y: chupacabras[i].y,
          timer: 30,
          type: 'spicy'
        });
        // Play chupacabra fed sound with higher pitch
        if (soundLibraryAvailable && soundEnabled && soundChupacabraFed) {
          playSound(soundChupacabraFed, 1.2);
        }
        chupacabras.splice(i, 1);
        break;
      } else if (tacos[j].type === 'super' && distance < tacos[j].radius) {
        // Super taco hits chupacabras in radius
        score += 5;
        fedEffects.push({
          x: chupacabras[i].x,
          y: chupacabras[i].y,
          timer: 30,
          type: 'super'
        });
        // Play chupacabra fed sound with even higher pitch
        if (soundLibraryAvailable && soundEnabled && soundChupacabraFed) {
          playSound(soundChupacabraFed, 1.5);
        }
        chupacabras.splice(i, 1);
        break;
      }
    }
    
    // If we removed a chupacabra, we need to adjust the loop
    if (i >= chupacabras.length) {
      i = chupacabras.length;
    }
  }
}

// Update and draw retro tacos
function updateRetroTacos() {
  for (let i = tacos.length - 1; i >= 0; i--) {
    tacos[i].update();
    tacos[i].display();
    
    // Remove tacos that go off-screen
    if (tacos[i].y < 0) {
      tacos.splice(i, 1);
    }
  }
}

// Update and draw retro powerups
function updateRetroPowerups() {
  for (let i = powerups.length - 1; i >= 0; i--) {
    powerups[i].update();
    powerups[i].display();
    
    // Check if chef collects powerup
    let distance = dist(chef.x, chef.y, powerups[i].x, powerups[i].y);
    if (distance < chef.size/2 + powerups[i].size/2) {
      // Apply powerup effect
      if (powerups[i].type === 'spicyAmmo') {
        spicyTacoCount += 3;
        fedEffects.push({
          x: chef.x,
          y: chef.y - chef.size/2,
          timer: 30,
          text: '+3 SPICY'
        });
      } else if (powerups[i].type === 'speedBoost') {
        chef.speed = 16;
        setTimeout(() => { chef.speed = 8; }, 5000);
        fedEffects.push({
          x: chef.x,
          y: chef.y - chef.size/2,
          timer: 30,
          text: 'SPEED UP'
        });
      } else if (powerups[i].type === 'tacoCooldown') {
        tacoCooldown = 250;
        setTimeout(() => { tacoCooldown = 500; }, 5000);
        fedEffects.push({
          x: chef.x,
          y: chef.y - chef.size/2,
          timer: 30,
          text: 'RAPID FIRE'
        });
      }
      
      // Play powerup sound
      if (soundLibraryAvailable && soundEnabled && soundPowerup) {
        playSound(soundPowerup);
      }
      
      powerups.splice(i, 1);
    }
    
    // Remove powerups that go off-screen
    if (powerups[i] && powerups[i].y > height) {
      powerups.splice(i, 1);
    }
  }
}

// Update and draw retro fed effects
function updateRetroFedEffects() {
  for (let i = fedEffects.length - 1; i >= 0; i--) {
    // Display effect
    push();
    translate(fedEffects[i].x, fedEffects[i].y);
    
    if (fedEffects[i].text) {
      // Text effect
      drawPixelText(fedEffects[i].text, 0, 0, 1.5, retroColors.yellow);
    } else if (fedEffects[i].type === 'spicy') {
      // Spicy effect
      for (let j = 0; j < 8; j++) {
        let angle = j * PI/4;
        let x = cos(angle) * 20;
        let y = sin(angle) * 20;
        drawPixelRect(x-4, y-4, 8, 8, retroColors.red);
      }
      drawPixelText("YUM x2", 0, -20, 1.5, retroColors.yellow);
    } else if (fedEffects[i].type === 'super') {
      // Super effect
      for (let j = 0; j < 12; j++) {
        let angle = j * PI/6;
        let x = cos(angle) * 30;
        let y = sin(angle) * 30;
        drawPixelRect(x-4, y-4, 8, 8, retroColors.yellow);
      }
      drawPixelText("YUM x5", 0, -20, 1.5, retroColors.yellow);
    } else {
      // Regular effect
      drawPixelText("YUM!", 0, -20, 1.5, retroColors.yellow);
    }
    
    pop();
    
    // Decrease timer
    fedEffects[i].timer--;
    
    // Remove expired effects
    if (fedEffects[i].timer <= 0) {
      fedEffects.splice(i, 1);
    }
  }
}

// Draw retro game UI
function drawRetroGameUI() {
  // Score display
  drawPixelRect(10, 10, 150, 30, retroColors.darkPurple);
  drawPixelRect(12, 12, 146, 26, retroColors.black);
  drawPixelText(`SCORE:${score}`, 85, 25, 1.5, retroColors.lightGray);
  
  // Taco type indicator
  drawPixelRect(10, 50, 200, 30, retroColors.darkPurple);
  drawPixelRect(12, 52, 196, 26, retroColors.black);
  
  // Make the super taco text more prominent when selected
  if (currentTacoType === 'super') {
    // Animated text for super taco
    let superColor = lerpColor(retroColors.orange, retroColors.yellow, sin(frameCount * 0.1) * 0.5 + 0.5);
    drawPixelText(`TACO:${currentTacoType.toUpperCase()}`, 110, 65, 1.8, superColor);
    
    // Add "STRONGEST" indicator
    drawPixelText("★ STRONGEST ★", 110, 85, 1.2, retroColors.yellow);
  } else {
    drawPixelText(`TACO:${currentTacoType.toUpperCase()}`, 110, 65, 1.5, retroColors.lightGray);
  }
  
  // Taco ammo/cooldown indicators
  if (currentTacoType === 'spicy') {
    drawPixelRect(10, 90, 200, 30, retroColors.darkPurple);
    drawPixelRect(12, 92, 196, 26, retroColors.black);
    drawPixelText(`SPICY:${spicyTacoCount}`, 110, 105, 1.5, retroColors.lightGray);
  } else if (currentTacoType === 'super') {
    drawPixelRect(10, 90, 200, 30, retroColors.darkPurple);
    drawPixelRect(12, 92, 196, 26, retroColors.black);
    let cooldownRemaining = (superTacoCooldown - (millis() - lastSuperTacoTime)) / 1000;
    if (cooldownRemaining < 0) cooldownRemaining = 0;
    
    // Enhanced cooldown display for super taco
    if (cooldownRemaining === 0) {
      // Ready to use
      drawPixelText(`SUPER: READY!`, 110, 105, 1.5, retroColors.green);
    } else {
      // Cooldown in progress
      drawPixelText(`SUPER:${cooldownRemaining.toFixed(0)}s`, 110, 105, 1.5, retroColors.orange);
    }
  }
  
  // Controls reminder
  drawPixelRect(width - 310, 10, 300, 30, retroColors.darkPurple);
  drawPixelRect(width - 308, 12, 296, 26, retroColors.black);
  drawPixelText("1:REG 2:SPICY 3:SUPER", width - 160, 25, 1.2, retroColors.lightGray);
}

// Draw the game over screen
function drawGameOver() {
  // Background
  background(retroColors.darkBlue);
  
  // Game Over text
  drawPixelText('GAME OVER', width/2, height/4, 5, retroColors.red);
  
  // Score display
  drawPixelRect(width/2 - 300, height/2 - 120, 600, 60, retroColors.black);
  drawPixelText(`YOU FED ${score} CHUPACABRAS!`, width/2, height/2 - 90, 2, retroColors.white);
  
  // High score display
  drawPixelRect(width/2 - 200, height/2 - 50, 400, 60, retroColors.black);
  drawPixelText(`HIGH SCORE: ${highScore}`, width/2, height/2 - 20, 2, retroColors.cyan);
  
  // Weekly prize text
  drawPixelText('$25 WEEKLY PRIZE FOR TOP SCORE!', width/2, height/2 + 30, 2, retroColors.yellow);
  
  // Show leaderboard submission if not yet submitted
  if (!scoreSubmitted) {
    console.log("Should show leaderboard form - not submitted yet");
    
    // Instructions
    drawPixelText('ENTER YOUR NAME AND EMAIL', width/2, height/2 + 60, 1.5, retroColors.yellow);
    drawPixelText('PRESS ESC TO SKIP', width/2, height/2 + 85, 1.5, retroColors.yellow);
    
    // Email explanation text
    drawPixelRect(width/2 - 300, height/2 + 100, 600, 30, retroColors.darkRed);
    drawPixelRect(width/2 - 295, height/2 + 102, 590, 26, retroColors.black);
    drawPixelText('EMAIL REQUIRED TO CLAIM WEEKLY PRIZE!', width/2, height/2 + 115, 1.5, retroColors.orange);
    
    // Name input field
    drawPixelRect(width/2 - 200, height/2 + 140, 400, 40, retroColors.darkGreen);
    drawPixelRect(width/2 - 195, height/2 + 145, 390, 30, retroColors.black);
    
    if (inputField === 'name') {
      // Highlight name field when selected
      drawPixelRect(width/2 - 200, height/2 + 140, 400, 40, retroColors.green);
      drawPixelRect(width/2 - 195, height/2 + 145, 390, 30, retroColors.black);
    }
    
    drawPixelText(`NAME: ${playerName}${inputField === 'name' && frameCount % 60 < 30 ? '_' : ''}`, width/2, height/2 + 160, 1.5, retroColors.white);
    
    // Email input field
    drawPixelRect(width/2 - 200, height/2 + 195, 400, 40, retroColors.darkBlue);
    drawPixelRect(width/2 - 195, height/2 + 200, 390, 30, retroColors.black);
    
    if (inputField === 'email') {
      // Highlight email field when selected
      drawPixelRect(width/2 - 200, height/2 + 195, 400, 40, retroColors.blue);
      drawPixelRect(width/2 - 195, height/2 + 200, 390, 30, retroColors.black);
    }
    
    drawPixelText(`EMAIL: ${playerEmail}${inputField === 'email' && frameCount % 60 < 30 ? '_' : ''}`, width/2, height/2 + 215, 1.5, retroColors.white);
    
    // Submit button
    drawPixelRect(width/2 - 60, height/2 + 250, 120, 30, retroColors.darkGreen);
    drawPixelRect(width/2 - 55, height/2 + 255, 110, 20, retroColors.green);
    drawPixelText("SUBMIT", width/2, height/2 + 265, 1.5, retroColors.white);
    
    // Skip button (enhanced)
    drawPixelRect(width/2 - 60, height/2 + 290, 120, 30, retroColors.darkGray);
    drawPixelRect(width/2 - 55, height/2 + 295, 110, 20, retroColors.lightGray);
    drawPixelText("SKIP", width/2, height/2 + 305, 1.5, retroColors.black);
    
    // Error message if submit was attempted without name
    if (submitAttempted && playerName.trim() === '') {
      drawPixelText("NAME IS REQUIRED!", width/2, height/2 + 335, 1.2, retroColors.red);
    }
  } else if (scoreSubmitted) {
    // Thank you message
    drawPixelRect(width/2 - 200, height/2 + 70, 400, 60, retroColors.darkGreen);
    drawPixelRect(width/2 - 195, height/2 + 75, 390, 50, retroColors.black);
    drawPixelText("THANKS FOR PLAYING!", width/2, height/2 + 100, 2, retroColors.green);
    
    // Play again prompt
    drawPixelText("PLAY AGAIN?", width/2, height/2 + 170, 2, retroColors.white);
    
    // Yes/No buttons
    drawPixelRect(width/2 - 100, height/2 + 200, 80, 40, retroColors.darkGreen);
    drawPixelRect(width/2 - 95, height/2 + 205, 70, 30, retroColors.green);
    drawPixelText("YES", width/2 - 60, height/2 + 220, 2, retroColors.white);
    
    drawPixelRect(width/2 + 20, height/2 + 200, 80, 40, retroColors.darkRed);
    drawPixelRect(width/2 + 25, height/2 + 205, 70, 30, retroColors.red);
    drawPixelText("NO", width/2 + 60, height/2 + 220, 2, retroColors.white);
  }
}

// Handle keyboard input for player name
function keyPressed() {
  console.log("Key pressed:", keyCode);
  
  // Handle ESC key to skip leaderboard form
  if (gameState === 'gameover' && !scoreSubmitted && (keyCode === 27 || key === 'Escape')) {
    console.log("ESC key pressed - skipping leaderboard form");
    scoreSubmitted = true;
    
    // Play a sound
    if (soundLibraryAvailable && soundEnabled && soundMenuSelect) {
      playSound(soundMenuSelect);
    }
    
    return false;
  }
  
  // Handle menu navigation
  if (gameState === 'menu') {
    if (keyCode === ENTER || keyCode === RETURN) {
      console.log("Enter key pressed in menu");
      gameState = 'playing';
      resetGame();
      
      // Play game start sound
      if (soundLibraryAvailable && soundEnabled && soundGameStart) {
        playSound(soundGameStart);
      }
      
      return false;
    }
  }
  
  // Handle game over screen
  if (gameState === 'gameover') {
    if (scoreSubmitted) {
      if (key === 'y' || key === 'Y') {
        console.log("Y key pressed - restarting game");
        // Hide social sharing buttons
        hideSocialSharing();
        resetGame();
        gameState = 'playing';
        
        // Play game start sound
        if (soundLibraryAvailable && soundEnabled && soundGameStart) {
          playSound(soundGameStart);
        }
        
        return false;
      } else if (key === 'n' || key === 'N') {
        console.log("N key pressed - returning to menu");
        // Hide social sharing buttons
        hideSocialSharing();
        gameState = 'menu';
        
        // Play menu select sound
        if (soundLibraryAvailable && soundEnabled && soundMenuSelect) {
          playSound(soundMenuSelect);
        }
        
        return false;
      }
    }
  }
  
  // Handle game controls
  if (gameState === 'playing') {
    if (keyCode === 32) { // Space bar
      // We'll handle the actual taco throwing in the draw loop
      // This ensures we don't fire multiple tacos on a single press
      // Just play the sound here if needed
      if (currentTacoType === 'spicy' && spicyTacoCount > 0) {
        if (soundLibraryAvailable && soundEnabled && soundSpicyTacoThrow) {
          playSound(soundSpicyTacoThrow);
        }
      } else if (currentTacoType === 'super' && millis() - lastSuperTacoTime > superTacoCooldown) {
        if (soundLibraryAvailable && soundEnabled && soundSuperTacoThrow) {
          playSound(soundSuperTacoThrow);
        }
      } else if (currentTacoType === 'regular') {
        if (soundLibraryAvailable && soundEnabled && soundTacoThrow) {
          playSound(soundTacoThrow);
        }
      }
      
      return false;
    }
  }
  
  return true;
}

function keyTyped() {
  // Handle name input in game over screen
  if (gameState === 'gameover' && !scoreSubmitted) {
    console.log("Key typed:", key, "keyCode:", keyCode);
    
    // Enter key to submit
    if (key === 'Enter' || key === '\n') {
      submitAttempted = true;
      if (playerName.trim() !== '') {
        // Submit score to leaderboard with just the name if email is missing
        submitScore(playerName, score, playerEmail);
        scoreSubmitted = true;
        
        // Play high score sound
        if (soundLibraryAvailable && soundEnabled && soundHighScore) {
          playSound(soundHighScore);
        }
        
        // Show social sharing options
        showSocialSharing();
      } else {
        // Show error message if name is missing
        console.log("Name is required");
        inputField = 'name';
      }
    } else if (key === 'Tab') {
      // Switch between name and email fields
      inputField = inputField === 'name' ? 'email' : 'name';
    } else if (key === 'Backspace') {
      // Handle backspace
      if (inputField === 'name' && playerName.length > 0) {
        playerName = playerName.slice(0, -1);
      } else if (inputField === 'email' && playerEmail.length > 0) {
        playerEmail = playerEmail.slice(0, -1);
      }
    } else if (key.length === 1) { // Only add single characters
      // Add character to name or email
      if (inputField === 'name' && playerName.length < 20) {
        playerName += key;
      } else if (inputField === 'email' && playerEmail.length < 30) {
        playerEmail += key;
      }
    }
    return false; // Prevent default behavior
  }
  return true;
}

// Show social sharing options
function showSocialSharing() {
  const shareContainer = document.getElementById('share-container');
  if (shareContainer) {
    shareContainer.style.display = 'flex';
    shareContainer.style.position = 'absolute';
    shareContainer.style.bottom = '120px';
    shareContainer.style.left = '50%';
    shareContainer.style.transform = 'translateX(-50%)';
    shareContainer.style.zIndex = '900';
  }
}

// Handle mouse clicks
function mousePressed() {
  console.log("Mouse pressed at:", mouseX, mouseY);
  
  // Handle start button in menu state
  if (gameState === 'menu') {
    // Start button area
    let buttonY = height/2 + 150;
    if (mouseX > width/2 - 100 && mouseX < width/2 + 100 && 
        mouseY > buttonY - 25 && mouseY < buttonY + 25) {
      console.log("Start button clicked");
      gameState = 'playing';
      resetGame();
      // Play game start sound
      if (soundLibraryAvailable && soundEnabled && soundGameStart) {
        playSound(soundGameStart);
      }
      return false;
    }
  }
  
  // Handle game over screen buttons
  if (gameState === 'gameover') {
    // Submit button for leaderboard
    if (!scoreSubmitted) {
      // Check if clicked on name field
      if (mouseX > width/2 - 150 && mouseX < width/2 + 150 && 
          mouseY > height/2 + 140 && mouseY < height/2 + 180) {
        inputField = 'name';
        return false;
      }
      
      // Check if clicked on email field
      if (mouseX > width/2 - 150 && mouseX < width/2 + 150 && 
          mouseY > height/2 + 195 && mouseY < height/2 + 235) {
        inputField = 'email';
        return false;
      }
      
      // Check if clicked on submit button
      if (mouseX > width/2 - 60 && mouseX < width/2 + 60 && 
          mouseY > height/2 + 250 && mouseY < height/2 + 280) {
        submitAttempted = true;
        if (playerName.trim() !== '') {
          // Submit score to leaderboard with just the name if email is missing
          submitScore(playerName, score, playerEmail);
          scoreSubmitted = true;
          
          // Play high score sound
          if (soundLibraryAvailable && soundEnabled && soundHighScore) {
            playSound(soundHighScore);
          }
          
          // Show social sharing options
          showSocialSharing();
        } else {
          // Show error message if name is missing
          console.log("Name is required");
          inputField = 'name';
        }
        return false;
      }
      
      // Check if clicked on skip button
      if (mouseX > width/2 - 60 && mouseX < width/2 + 60 && 
          mouseY > height/2 + 290 && mouseY < height/2 + 320) {
        console.log("Skip button clicked");
        // Mark as submitted without actually submitting
        scoreSubmitted = true;
        
        // Play a sound - use menu_select sound instead of the missing click sound
        if (soundLibraryAvailable && soundEnabled && soundMenuSelect) {
          playSound(soundMenuSelect);
        }
        
        return false;
      }
    }
    
    // Yes button (restart game)
    if (scoreSubmitted) {
      if (mouseX > width/2 - 100 && mouseX < width/2 - 20 && 
          mouseY > height/2 + 200 && mouseY < height/2 + 240) {
        console.log("Yes button clicked");
        // Hide social sharing buttons
        hideSocialSharing();
        resetGame();
        gameState = 'playing';
        
        // Play game start sound
        if (soundLibraryAvailable && soundEnabled && soundGameStart) {
          playSound(soundGameStart);
        }
        return false;
      }
      
      // No button (return to menu)
      if (mouseX > width/2 + 20 && mouseX < width/2 + 100 && 
          mouseY > height/2 + 200 && mouseY < height/2 + 240) {
        console.log("No button clicked");
        // Hide social sharing buttons
        hideSocialSharing();
        gameState = 'menu';
        
        // Play menu select sound
        if (soundLibraryAvailable && soundEnabled && soundMenuSelect) {
          playSound(soundMenuSelect);
        }
        return false;
      }
    }
  }
  
  return true;
}

// Reset game state
function resetGame() {
  score = 0;
  chupacabras = [];
  tacos = [];
  powerups = [];
  fedEffects = [];
  lastTacoTime = 0;
  lastRegularTacoTime = 0;
  lastChupacabraSpawnTime = 0;
  lastPowerupTime = 0;
  spicyTacoCount = 3;
  lastSuperTacoTime = 0;
  currentTacoType = 'regular';
  spaceBarWasPressed = false;
  spaceBarHoldStartTime = 0;
  lives = 3;
  wave = 1;
  chupacabraSpeed = 1;
  gameOver = false;
  scoreSubmitted = false;
  submitAttempted = false;
  playerName = '';
  playerEmail = '';
  inputField = 'name';
  
  // Hide social sharing buttons when resetting the game
  hideSocialSharing();
}

// RetroTaco class
class RetroTaco {
  constructor(x, y, type = 'regular') {
    this.x = x;
    this.y = y;
    this.speed = -5;
    this.type = type;
    
    if (this.type === 'regular') {
      this.size = 24;
      this.color = retroColors.yellow;
      // Play regular taco throw sound
      if (soundLibraryAvailable && soundEnabled && soundTacoThrow) {
        playSound(soundTacoThrow);
      }
    } else if (this.type === 'spicy') {
      this.size = 32;
      this.color = retroColors.red;
      this.radius = 50;
      // Play spicy taco throw sound
      if (soundLibraryAvailable && soundEnabled && soundSpicyTacoThrow) {
        playSound(soundSpicyTacoThrow);
      }
    } else if (this.type === 'super') {
      this.size = 40; // Base size (will be drawn 50% larger in drawPixelTaco)
      this.color = retroColors.orange;
      this.radius = 120; // Increased radius for super taco effect
      // Play super taco throw sound
      if (soundLibraryAvailable && soundEnabled && soundSuperTacoThrow) {
        playSound(soundSuperTacoThrow);
      }
    }
  }

  update() {
    this.y += this.speed;
  }

  display() {
    drawPixelTaco(this.x, this.y, this.size, this.type);
  }
}

// Chupacabra class (formerly RetroZombie)
class Chupacabra {
  constructor(x, y, speed = 1, type = 'regular') {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.type = type;
    
    // Set properties based on Chupacabra type
    if (this.type === 'regular') {
      this.size = 50;
      // Use chupacabras_1.jpg or chupacabras_2.jpg for regular
      this.imageIndex = Math.floor(random(0, 2)); 
      this.speed = speed;
    } else if (this.type === 'fast') {
      this.size = 45;
      // Use chupacabras_3.jpg or chupacabras_4.jpg for fast
      this.imageIndex = Math.floor(random(2, 4)); 
      this.speed = speed * 1.5;
    } else if (this.type === 'big') {
      this.size = 65;
      // Use chupacabras_5.jpg, chupacabras_6.jpg, or chupacabras_7.jpg for big
      this.imageIndex = Math.floor(random(4, 7)); 
      this.speed = speed * 0.7;
    }
    
    // Random walk parameters
    this.walkOffset = random(0, 1000);
    this.walkAmplitude = 1.5;
    
    // Add animation parameters
    this.animationOffset = random(0, 100);
    this.scale = 1.0;
  }
  
  update() {
    // Move down
    this.y += this.speed;
    
    // Add slight left-right movement for more interesting behavior
    this.x += sin((frameCount + this.walkOffset) * 0.05) * this.walkAmplitude;
    
    // Keep within screen bounds
    this.x = constrain(this.x, this.size/2, width - this.size/2);
    
    // Animate scale for a "breathing" effect
    this.scale = 1.0 + sin((frameCount + this.animationOffset) * 0.1) * 0.05;
  }
  
  display() {
    push();
    translate(this.x, this.y);
    scale(this.scale);
    
    // Draw the Chupacabra using the loaded image
    imageMode(CENTER);
    
    // Check if the image exists before trying to display it
    if (chupacabrasImgs[this.imageIndex] && chupacabrasImgs[this.imageIndex].width > 0) {
      // For PNG images with transparency
      image(chupacabrasImgs[this.imageIndex], 0, 0, this.size, this.size);
    } else {
      // Fallback if image isn't loaded - draw a simple placeholder
      fill(retroColors.red);
      rect(-this.size/2, -this.size/2, this.size, this.size);
      fill(retroColors.white);
      textSize(12);
      textAlign(CENTER, CENTER);
      text("?", 0, 0);
    }
    
    // Add scanline effect for retro CRT look but preserve transparency
    noFill();
    for (let i = -this.size/2; i < this.size/2; i += pixelSize) {
      stroke(0, 0, 0, 15);
      strokeWeight(1);
      line(-this.size/2, i, this.size/2, i);
    }
    
    pop();
  }
}

// RetroPowerup class
class RetroPowerup {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 2;
    this.size = 24;
    
    // Randomly select powerup type
    const types = ['spicyAmmo', 'speedBoost', 'tacoCooldown'];
    this.type = types[floor(random(types.length))];
    
    // Animation parameters
    this.pulse = 0;
    this.rotation = 0;
  }
  
  update() {
    // Move down
    this.y += this.speed;
    
    // Update animation
    this.pulse = sin(frameCount * 0.1) * 5;
    this.rotation += 0.05;
  }
  
  display() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    
    // Base powerup shape
    if (this.type === 'spicyAmmo') {
      // Spicy ammo powerup (red chili)
      drawPixelRect(-this.size/2, -this.size/2, this.size, this.size, retroColors.red);
      
      // Stem
      drawPixelRect(-2, -this.size/2 - 4, 4, 6, retroColors.green);
      
    } else if (this.type === 'speedBoost') {
      // Speed boost powerup (blue lightning)
      drawPixelRect(-this.size/2, -this.size/2, this.size, this.size, retroColors.blue);
      
      // Lightning bolt
      fill(retroColors.yellow);
      for (let i = -2; i <= 2; i++) {
        drawPixelRect(i*3, -this.size/3, 3, this.size*2/3, retroColors.yellow);
      }
      
    } else if (this.type === 'tacoCooldown') {
      // Taco cooldown powerup (green clock)
      drawPixelRect(-this.size/2, -this.size/2, this.size, this.size, retroColors.green);
      
      // Clock hands
      drawPixelRect(-1, 0, 2, this.size/4, retroColors.lightGray);
      drawPixelRect(0, -1, this.size/4, 2, retroColors.lightGray);
    }
    
    // Glow effect
    let glowSize = this.size + this.pulse;
    noFill();
    stroke(255, 255, 255, 100);
    strokeWeight(2);
    rect(-glowSize/2, -glowSize/2, glowSize, glowSize);
    
    pop();
  }
}

// Draw CRT screen effect
function drawCRTEffect() {
  // Slight vignette effect
  noFill();
  for (let i = 0; i < 100; i++) {
    let alpha = i / 2;
    stroke(0, 0, 0, alpha);
    strokeWeight(1);
    rect(i, i, width - i * 2, height - i * 2);
  }
  
  // Occasional screen glitch
  if (random(100) < 2) {
    noStroke();
    fill(255, 255, 255, 30);
    rect(0, random(height), width, 2);
  }
  
  // Scanlines
  strokeWeight(1);
  stroke(0, 0, 0, 10);
  for (let y = 0; y < height; y += 3) {
    line(0, y, width, y);
  }
  noStroke();
}

// Draw retro chef
function drawRetroChef() {
  push();
  translate(chef.x, chef.y);
  
  // Draw the chef image with proper scaling and transparency
  imageMode(CENTER);
  let imgWidth = chef.size * 1.5;
  let imgHeight = chef.size * 1.5;
  image(chefImg, 0, 0, imgWidth, imgHeight);
  
  // Add subtle scanline effect for retro CRT look while preserving transparency
  noFill();
  for (let i = -chef.size; i < chef.size; i += pixelSize) {
    stroke(0, 0, 0, 10);
    strokeWeight(1);
    line(-chef.size, i, chef.size, i);
  }
  
  pop();
}

// Play sound with error handling and fallback
function playSound(sound, rate = 1.0) {
  if (!soundLibraryAvailable || !soundEnabled) {
    console.log("Sound is disabled or library not available");
    return;
  }
  
  try {
    if (sound && sound.isLoaded()) {
      sound.rate(rate);
      sound.play();
      console.log("Playing sound successfully");
    } else {
      console.warn("Sound not loaded, cannot play");
      // Try to play a fallback sound if available
      if (soundMenuSelect && soundMenuSelect.isLoaded() && sound !== soundMenuSelect) {
        console.log("Playing fallback sound (menu select)");
        soundMenuSelect.rate(1.0);
        soundMenuSelect.play();
      }
    }
  } catch (error) {
    console.error("Error playing sound:", error);
  }
}

// Function to check and log the dimensions of the leaderboard container
function checkLeaderboardDimensions() {
  const leaderboardContainer = document.getElementById('leaderboard-container');
  if (leaderboardContainer) {
    const rect = leaderboardContainer.getBoundingClientRect();
    console.log("Leaderboard container dimensions:", {
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom,
      visible: leaderboardContainer.style.display !== 'none'
    });
    
    // Check if the container has zero dimensions
    if (rect.width === 0 || rect.height === 0) {
      console.error("Leaderboard container has zero dimensions!");
    }
    
    // Check if the container is outside the viewport
    if (rect.right < 0 || rect.bottom < 0 || 
        rect.left > window.innerWidth || rect.top > window.innerHeight) {
      console.error("Leaderboard container is outside the viewport!");
    }
  } else {
    console.error("Cannot check dimensions - leaderboard container not found");
  }
}

// Function to check and log the dimensions of the canvas
function checkCanvasDimensions() {
  // In p5.js, we can get the canvas element from the current instance
  const canvasElement = document.querySelector('canvas');
  
  if (canvasElement) {
    const rect = canvasElement.getBoundingClientRect();
    console.log("Canvas dimensions:", {
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom,
      zIndex: window.getComputedStyle(canvasElement).zIndex
    });
    
    // Check if the canvas might be overlapping the leaderboard
    const leaderboardContainer = document.getElementById('leaderboard-container');
    if (leaderboardContainer && leaderboardContainer.style.display !== 'none') {
      const leaderboardRect = leaderboardContainer.getBoundingClientRect();
      const canvasZIndex = parseInt(window.getComputedStyle(canvasElement).zIndex) || 0;
      const leaderboardZIndex = parseInt(window.getComputedStyle(leaderboardContainer).zIndex) || 0;
      
      console.log("Z-index comparison - Canvas:", canvasZIndex, "Leaderboard:", leaderboardZIndex);
      
      if (canvasZIndex >= leaderboardZIndex) {
        console.error("Canvas z-index is greater than or equal to leaderboard z-index!");
        console.log("Setting leaderboard z-index higher");
        leaderboardContainer.style.zIndex = (canvasZIndex + 10).toString();
      }
    }
  } else {
    console.error("Cannot check dimensions - canvas element not found");
  }
}

// Update toggleLeaderboard to also check canvas dimensions
function toggleLeaderboard() {
  console.log("toggleLeaderboard called, current state:", showLeaderboard);
  
  // Don't toggle leaderboard during gameplay
  if (gameState === 'playing') {
    console.log("Ignoring leaderboard toggle during gameplay");
    return;
  }
  
  // Debounce mechanism - prevent toggling more than once per second
  const currentTime = Date.now();
  if (currentTime - lastLeaderboardToggleTime < 1000) {
    console.log("Ignoring rapid toggle, wait a moment before toggling again");
    return;
  }
  lastLeaderboardToggleTime = currentTime;
  
  // Toggle the flag
  showLeaderboard = !showLeaderboard;
  console.log("New showLeaderboard state:", showLeaderboard);
  
  // Get the leaderboard container
  const leaderboardContainer = document.getElementById('leaderboard-container');
  console.log("Leaderboard container element:", leaderboardContainer);
  
  if (!leaderboardContainer) {
    console.error('Leaderboard container not found in the DOM');
    return;
  }
  
  // Update the display based on the flag
  if (showLeaderboard) {
    // Show the leaderboard - apply multiple style properties to ensure visibility
    console.log("Showing leaderboard");
    leaderboardContainer.style.display = 'flex';
    leaderboardContainer.style.visibility = 'visible';
    leaderboardContainer.style.opacity = '1';
    leaderboardContainer.style.zIndex = '1000';
    console.log("Set display styles, current style:", 
      "display:", leaderboardContainer.style.display,
      "visibility:", leaderboardContainer.style.visibility,
      "opacity:", leaderboardContainer.style.opacity,
      "zIndex:", leaderboardContainer.style.zIndex
    );
    
    // Check dimensions after showing
    setTimeout(() => {
      checkLeaderboardDimensions();
      try {
        checkCanvasDimensions();
      } catch (error) {
        console.error("Error checking canvas dimensions:", error);
      }
    }, 100);
    
    // Load leaderboard data
    console.log("Calling loadLeaderboard()");
    loadLeaderboard();
    console.log("loadLeaderboard() called");
  } else {
    // Hide the leaderboard - make sure all visibility properties are set
    console.log("Hiding leaderboard");
    leaderboardContainer.style.display = 'none';
    leaderboardContainer.style.visibility = 'hidden';
    leaderboardContainer.style.opacity = '0';
    leaderboardContainer.style.zIndex = '-1';
    console.log("Set display styles, current style:", 
      "display:", leaderboardContainer.style.display,
      "visibility:", leaderboardContainer.style.visibility,
      "opacity:", leaderboardContainer.style.opacity,
      "zIndex:", leaderboardContainer.style.zIndex
    );
  }
}

// Load leaderboard data from Supabase
async function loadLeaderboard() {
  try {
    console.log("Loading leaderboard data...");
    // Call the fetchLeaderboard function from supabase-config.js
    const leaderboardData = await fetchLeaderboard();
    console.log("Leaderboard data received:", leaderboardData);
    
    // Update the leaderboard display
    updateLeaderboardDisplay(leaderboardData);
  } catch (error) {
    console.error('Error loading leaderboard:', error);
  }
}

// Update the leaderboard display with the provided data
function updateLeaderboardDisplay(leaderboardData) {
  const leaderboardBody = document.getElementById('leaderboard-body');
  
  if (!leaderboardBody) {
    console.error('Leaderboard body element not found');
    return;
  }
  
  console.log("Updating leaderboard display with data:", leaderboardData);
  
  // Clear existing entries
  leaderboardBody.innerHTML = '';
  
  // Add new entries
  if (leaderboardData && leaderboardData.length > 0) {
    leaderboardData.forEach((entry, index) => {
      const row = document.createElement('tr');
      
      // Format date
      let dateStr = 'Unknown';
      if (entry.date_submitted) {
        const date = new Date(entry.date_submitted);
        dateStr = date.toLocaleDateString();
      }
      
      // Create row content
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${entry.player_name || 'Anonymous'}</td>
        <td>${entry.score}</td>
        <td>${dateStr}</td>
      `;
      
      // Highlight the current player's score
      if (entry.player_name === playerName && entry.score === score) {
        row.classList.add('current-player');
      }
      
      leaderboardBody.appendChild(row);
    });
  } else {
    // No entries
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="4">No scores yet. Be the first!</td>';
    leaderboardBody.appendChild(row);
  }
}

// Setup close button for leaderboard
document.addEventListener('DOMContentLoaded', () => {
  console.log("Setting up leaderboard close button");
  const closeButton = document.getElementById('close-leaderboard');
  if (closeButton) {
    console.log("Close leaderboard button found, setting up click listener");
    
    // Remove any existing event listeners to avoid duplicates
    closeButton.replaceWith(closeButton.cloneNode(true));
    
    // Get the fresh reference after replacement
    const freshCloseButton = document.getElementById('close-leaderboard');
    
    // Add the event listener
    freshCloseButton.addEventListener('click', (event) => {
      console.log("Close leaderboard button clicked");
      event.preventDefault();
      event.stopPropagation();
      
      // Make sure we're just toggling the leaderboard visibility without changing game state
      console.log("Current showLeaderboard state:", showLeaderboard);
      
      // Ensure the leaderboard is hidden without starting the game
      if (showLeaderboard) {
        // Get the leaderboard container directly
        const leaderboardContainer = document.getElementById('leaderboard-container');
        if (leaderboardContainer) {
          // Hide the leaderboard directly
          leaderboardContainer.style.display = 'none';
          leaderboardContainer.style.visibility = 'hidden';
          leaderboardContainer.style.opacity = '0';
          leaderboardContainer.style.zIndex = '-1';
          
          // Update the flag
          showLeaderboard = false;
          console.log("Leaderboard hidden, new showLeaderboard state:", showLeaderboard);
        }
      }
    });
  } else {
    console.error("Close leaderboard button not found in the DOM");
  }
  
  // Setup HTML leaderboard button
  const htmlLeaderboardButton = document.getElementById('html-leaderboard-button');
  if (htmlLeaderboardButton) {
    console.log("Found HTML leaderboard button, adding event listener");
    
    // Remove any existing event listeners to avoid duplicates
    htmlLeaderboardButton.replaceWith(htmlLeaderboardButton.cloneNode(true));
    
    // Get the fresh reference after replacement
    const freshHtmlLeaderboardButton = document.getElementById('html-leaderboard-button');
    
    // Add the event listener
    freshHtmlLeaderboardButton.addEventListener('click', (event) => {
      console.log("HTML Leaderboard button clicked");
      event.preventDefault();
      event.stopPropagation();
      console.log("Current showLeaderboard state:", showLeaderboard);
      console.log("Calling toggleLeaderboard()");
      toggleLeaderboard();
      console.log("toggleLeaderboard() called, new showLeaderboard state:", showLeaderboard);
    });
  } else {
    console.error("HTML leaderboard button not found in the DOM");
  }
  
  // Setup social sharing buttons
  const twitterButton = document.getElementById('twitter-share');
  if (twitterButton) {
    twitterButton.addEventListener('click', () => {
      shareOnTwitter(playerName, score);
    });
  }
  
  const facebookButton = document.getElementById('facebook-share');
  if (facebookButton) {
    facebookButton.addEventListener('click', () => {
      shareOnFacebook(playerName, score);
    });
  }
});

// Hide social sharing options
function hideSocialSharing() {
  const shareContainer = document.getElementById('share-container');
  if (shareContainer) {
    shareContainer.style.display = 'none';
  }
}

function windowResized() {
  // Resize canvas when window is resized
  let canvasWidth = min(windowWidth * 0.9, windowHeight * 0.9 * (4/3));
  let canvasHeight = min(windowHeight * 0.9, windowWidth * 0.9 * (3/4));
  resizeCanvas(canvasWidth, canvasHeight);
  
  // Recalculate game dimensions
  if (gameState === 'game') {
    // Adjust game elements based on new canvas size
    chefX = width / 2;
    chefY = height - 50;
  }
}

// Function to validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Check if assets are loaded correctly and provide fallbacks
function checkAndFixAssets() {
  console.log("Checking and fixing assets...");
  
  // Check and fix images
  let missingImages = 0;
  
  // Check chupacabra images
  if (chupacabrasImgs.length === 0 || !chupacabrasImgs.some(img => img && img.width > 0)) {
    console.warn("No chupacabra images loaded, creating fallback");
    chupacabrasImgs = [];
    // Create a simple fallback image
    let fallbackImg = createGraphics(64, 64);
    fallbackImg.background(255, 0, 0);
    fallbackImg.fill(0);
    fallbackImg.textSize(10);
    fallbackImg.textAlign(CENTER, CENTER);
    fallbackImg.text("CHUP", 32, 32);
    for (let i = 0; i < 7; i++) {
      chupacabrasImgs.push(fallbackImg);
    }
    missingImages++;
  }
  
  // Check chef image
  if (!chefImg || chefImg.width === 0) {
    console.warn("Chef image not loaded, creating fallback");
    let fallbackImg = createGraphics(64, 64);
    fallbackImg.background(0, 255, 0);
    fallbackImg.fill(0);
    fallbackImg.textSize(10);
    fallbackImg.textAlign(CENTER, CENTER);
    fallbackImg.text("CHEF", 32, 32);
    chefImg = fallbackImg;
    missingImages++;
  }
  
  // Check taco images
  if (!tacoImg1 || tacoImg1.width === 0) {
    console.warn("Taco1 image not loaded, creating fallback");
    let fallbackImg = createGraphics(32, 32);
    fallbackImg.background(255, 255, 0);
    fallbackImg.fill(0);
    fallbackImg.textSize(8);
    fallbackImg.textAlign(CENTER, CENTER);
    fallbackImg.text("TACO", 16, 16);
    tacoImg1 = fallbackImg;
    missingImages++;
  }
  
  if (!tacoImg2 || tacoImg2.width === 0) {
    console.warn("Taco2 image not loaded, creating fallback");
    let fallbackImg = createGraphics(32, 32);
    fallbackImg.background(255, 128, 0);
    fallbackImg.fill(0);
    fallbackImg.textSize(8);
    fallbackImg.textAlign(CENTER, CENTER);
    fallbackImg.text("SPICY", 16, 16);
    tacoImg2 = fallbackImg;
    missingImages++;
  }
  
  if (!tacoImg3 || tacoImg3.width === 0) {
    console.warn("Taco3 image not loaded, creating fallback");
    let fallbackImg = createGraphics(48, 48);
    fallbackImg.background(255, 0, 255);
    fallbackImg.fill(0);
    fallbackImg.textSize(8);
    fallbackImg.textAlign(CENTER, CENTER);
    fallbackImg.text("SUPER", 24, 24);
    tacoImg3 = fallbackImg;
    missingImages++;
  }
  
  // Check background image
  if (!backgroundImg || backgroundImg.width === 0) {
    console.warn("Background image not loaded, creating fallback");
    let fallbackImg = createGraphics(width, height);
    fallbackImg.background(0, 0, 128);
    fallbackImg.fill(255);
    fallbackImg.textSize(20);
    fallbackImg.textAlign(CENTER, CENTER);
    fallbackImg.text("BACKGROUND", width/2, height/2);
    backgroundImg = fallbackImg;
    missingImages++;
  }
  
  if (missingImages > 0) {
    console.warn(`Created fallbacks for ${missingImages} missing images`);
  } else {
    console.log("All images loaded successfully");
  }
  
  // Check sounds
  if (soundLibraryAvailable) {
    let missingSounds = 0;
    
    // Create a simple beep sound as fallback if needed
    let createFallbackSound = () => {
      try {
        let osc = new p5.Oscillator();
        osc.setType('sine');
        osc.freq(440);
        osc.amp(0.5);
        osc.start();
        osc.stop(0.1);
        return osc;
      } catch (e) {
        console.error("Failed to create fallback sound:", e);
        return null;
      }
    };
    
    // Check each sound and create fallbacks if needed
    if (!soundMenuSelect || !soundMenuSelect.isLoaded()) {
      console.warn("Menu select sound not loaded");
      missingSounds++;
    }
    
    if (!soundGameStart || !soundGameStart.isLoaded()) {
      console.warn("Game start sound not loaded");
      missingSounds++;
    }
    
    if (!soundTacoThrow || !soundTacoThrow.isLoaded()) {
      console.warn("Taco throw sound not loaded");
      missingSounds++;
    }
    
    if (missingSounds > 0) {
      console.warn(`${missingSounds} sounds failed to load`);
      // Disable sound if too many are missing
      if (missingSounds > 3) {
        console.warn("Too many sounds missing, disabling sound");
        soundEnabled = false;
      }
    } else {
      console.log("All sounds loaded successfully");
    }
  }
}

// Initialize sound library and retry if needed
function initializeSoundLibrary() {
  console.log("Initializing sound library...");
  
  // Check if p5.sound is available
  if (typeof loadSound === 'function') {
    console.log("p5.sound library detected");
    soundLibraryAvailable = true;
    
    // Initialize sound settings
    try {
      // Set volume for all sounds if they're loaded
      if (soundMenuSelect) soundMenuSelect.setVolume(0.5);
      if (soundGameStart) soundGameStart.setVolume(0.7);
      if (soundTacoThrow) soundTacoThrow.setVolume(0.6);
      if (soundSpicyTacoThrow) soundSpicyTacoThrow.setVolume(0.6);
      if (soundSuperTacoThrow) soundSuperTacoThrow.setVolume(0.7);
      if (soundChupacabraFed) soundChupacabraFed.setVolume(0.3);
      if (soundPowerup) soundPowerup.setVolume(0.7);
      if (soundGameOver) soundGameOver.setVolume(0.7);
      if (soundHighScore) soundHighScore.setVolume(0.7);
      
      // Set up music tracks with loop settings
      if (bgMusic) {
        console.log("Setting up background music");
        bgMusic.setVolume(0.3);
        bgMusic.setLoop(true);
      }
      if (introMusic) {
        console.log("Setting up intro music");
        introMusic.setVolume(0.3);
        introMusic.setLoop(true);
        // Start playing intro music since we're starting at the menu
        if (gameState === 'menu' && soundEnabled) {
          introMusic.play();
          console.log("Starting intro music");
        }
      }
      if (gameoverMusic) {
        console.log("Setting up gameover music");
        gameoverMusic.setVolume(0.3);
        gameoverMusic.setLoop(true);
      }
      
      console.log("Sound initialization successful");
    } catch (e) {
      console.error("Error initializing sound settings:", e);
      soundEnabled = false;
      console.log("Sound disabled due to initialization error");
    }
  } else {
    console.log("p5.sound library is NOT available");
    soundLibraryAvailable = false;
    soundEnabled = false;
  }
}

// Register callback for sound library fallback
window.soundLoadedCallback = function() {
  console.log("Sound library loaded via fallback, reinitializing...");
  soundLibraryAvailable = true;
  soundEnabled = true;
  
  // Reload sounds
  if (typeof loadSound === 'function') {
    try {
      console.log("Reloading sounds...");
      
      // Load sound effects
      soundMenuSelect = loadSound('assets/sounds/menu_select.mp3',
        () => console.log("menu_select.mp3 loaded successfully via fallback"),
        (err) => console.error("Error loading menu_select.mp3 via fallback:", err)
      );
      
      soundGameStart = loadSound('assets/sounds/game_start.mp3',
        () => console.log("game_start.mp3 loaded successfully via fallback"),
        (err) => console.error("Error loading game_start.mp3 via fallback:", err)
      );
      
      soundTacoThrow = loadSound('assets/sounds/taco_throw.mp3',
        () => console.log("taco_throw.mp3 loaded successfully via fallback"),
        (err) => console.error("Error loading taco_throw.mp3 via fallback:", err)
      );
      
      soundSpicyTacoThrow = loadSound('assets/sounds/spicy_taco_throw.mp3',
        () => console.log("spicy_taco_throw.mp3 loaded successfully via fallback"),
        (err) => console.error("Error loading spicy_taco_throw.mp3 via fallback:", err)
      );
      
      soundSuperTacoThrow = loadSound('assets/sounds/super_taco_throw.mp3',
        () => console.log("super_taco_throw.mp3 loaded successfully via fallback"),
        (err) => console.error("Error loading super_taco_throw.mp3 via fallback:", err)
      );
      
      soundChupacabraFed = loadSound('assets/sounds/chupacabra_fed.mp3',
        () => console.log("chupacabra_fed.mp3 loaded successfully via fallback"),
        (err) => console.error("Error loading chupacabra_fed.mp3 via fallback:", err)
      );
      
      soundPowerup = loadSound('assets/sounds/powerup.mp3',
        () => console.log("powerup.mp3 loaded successfully via fallback"),
        (err) => console.error("Error loading powerup.mp3 via fallback:", err)
      );
      
      soundGameOver = loadSound('assets/sounds/game_over.mp3',
        () => console.log("game_over.mp3 loaded successfully via fallback"),
        (err) => console.error("Error loading game_over.mp3 via fallback:", err)
      );
      
      soundHighScore = loadSound('assets/sounds/high_score.mp3',
        () => console.log("high_score.mp3 loaded successfully via fallback"),
        (err) => console.error("Error loading high_score.mp3 via fallback:", err)
      );
      
      // Load music
      bgMusic = loadSound('assets/sounds/background_music.mp3',
        () => console.log("background_music.mp3 loaded successfully via fallback"),
        (err) => console.error("Error loading background_music.mp3 via fallback:", err)
      );
      
      introMusic = loadSound('assets/sounds/intro_music.mp3',
        () => console.log("intro_music.mp3 loaded successfully via fallback"),
        (err) => console.error("Error loading intro_music.mp3 via fallback:", err)
      );
      
      gameoverMusic = loadSound('assets/sounds/gameover_music.mp3',
        () => console.log("gameover_music.mp3 loaded successfully via fallback"),
        (err) => console.error("Error loading gameover_music.mp3 via fallback:", err)
      );
      
      // Initialize sound settings after a short delay to ensure loading
      setTimeout(initializeSoundLibrary, 1000);
    } catch (e) {
      console.error("Error reloading sounds via fallback:", e);
      soundEnabled = false;
    }
  }
};
