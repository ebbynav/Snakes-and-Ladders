// game.js

let players = [];
let currentPlayer = 0;
let playerPositions = [];
const maxTiles = 100;

// Snake and ladder positions (10 each for more interaction)
const snakes = { 
    16: 6,   // Early game snake
    24: 5,   // Another early snake  
    47: 26,  // Mid game snake
    49: 11,  // Mid game snake
    56: 53,  // Small snake
    62: 19,  // Original snake (kept)
    64: 60,  // Small snake
    87: 24,  // Late game snake
    93: 73,  // Late game snake
    98: 79   // Original final snake (kept)
};

const ladders = { 
    1: 38,   // Big starting ladder
    4: 14,   // Early ladder
    9: 21,   // Early ladder
    15: 26,  // Early ladder (fixed conflict)
    21: 42,  // Mid game ladder
    28: 84,  // Big mid-game ladder
    36: 44,  // Small ladder
    51: 67,  // Mid-late ladder
    71: 91,  // Late game ladder
    80: 100  // Winning ladder
};

// Initialize game board
function initBoard() {
    const board = document.getElementById('board');
    board.innerHTML = ''; // Clear existing board
    
    // Create board in proper snakes and ladders order (bottom to top, zigzag)
    // We need to create tiles in the correct visual order for CSS Grid
    const tiles = [];
    
    // Generate tile numbers in correct snakes and ladders pattern
    for (let row = 0; row < 10; row++) {
        const rowTiles = [];
        const baseNumber = (9 - row) * 10; // Start from 90, 80, 70... down to 0
        
        if ((9 - row) % 2 === 1) { // Odd rows (from bottom): left to right (1-10, 21-30, etc.)
            for (let col = 0; col < 10; col++) {
                rowTiles.push(baseNumber + col + 1);
            }
        } else { // Even rows: right to left (11-20, 31-40, etc.)
            for (let col = 9; col >= 0; col--) {
                rowTiles.push(baseNumber + col + 1);
            }
        }
        tiles.push(rowTiles);
    }
    
    // Create DOM elements in the correct order for CSS Grid
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            const tileNumber = tiles[row][col];
            
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.id = `tile-${tileNumber}`;
            tile.innerText = tileNumber;
            
            // Add snake and ladder images with destination info
            if (snakes[tileNumber]) {
                tile.classList.add('snake');
                tile.setAttribute('data-destination', snakes[tileNumber]);
                tile.title = `Snake! Answer wrong to slide down to ${snakes[tileNumber]}`;
            }
            if (ladders[tileNumber]) {
                tile.classList.add('ladder');
                tile.setAttribute('data-destination', ladders[tileNumber]);
                tile.title = `Ladder! Answer right to climb up to ${ladders[tileNumber]}`;
            }
            
            board.appendChild(tile);
        }
    }
    
    // Mark destination tiles
    markDestinationTiles();
}

// Mark snake and ladder destination tiles
function markDestinationTiles() {
    // Mark snake destinations
    Object.values(snakes).forEach(destination => {
        const tile = document.getElementById(`tile-${destination}`);
        if (tile) {
            tile.classList.add('snake-end');
            tile.title = `Snake destination from ${getSnakeOrigin(destination)}`;
        }
    });
    
    // Mark ladder destinations
    Object.values(ladders).forEach(destination => {
        const tile = document.getElementById(`tile-${destination}`);
        if (tile) {
            tile.classList.add('ladder-end');
            tile.title = `Ladder destination from ${getLadderOrigin(destination)}`;
        }
    });
}

// Helper functions to find origins
function getSnakeOrigin(destination) {
    for (let [origin, dest] of Object.entries(snakes)) {
        if (dest == destination) return origin;
    }
    return '';
}

function getLadderOrigin(destination) {
    for (let [origin, dest] of Object.entries(ladders)) {
        if (dest == destination) return origin;
    }
    return '';
}

// Initialize players
function initPlayers(playerNames) {
    console.log('Initializing players:', playerNames);
    players = playerNames;
    currentPlayer = 0; // Make sure current player is reset
    playerPositions = new Array(players.length).fill(0); // Start from position 0
    updatePawns();
    
    // Update current turn display with color indicator
    updateCurrentTurnDisplay();
}

// Update current turn display with color indicator
function updateCurrentTurnDisplay() {
    const currentTurnElement = document.getElementById('currentTurn');
    if (currentTurnElement && players.length > 0) {
        currentTurnElement.innerHTML = `
            <span class="player-indicator p${currentPlayer + 1}"></span>
            ${players[currentPlayer]}'s Turn
        `;
    }
}

// Roll dice
function rollDice() {
    console.log('Roll dice function called');
    
    const diceDisplay = document.getElementById('diceDisplay');
    const rollBtn = document.getElementById('rollBtn');
    
    if (!diceDisplay || !rollBtn) {
        console.error('Dice display or roll button not found');
        return;
    }
    
    if (!players || players.length === 0) {
        console.error('No players initialized');
        alert('Please refresh the page and start a new game');
        return;
    }
    
    // Disable button during roll
    rollBtn.disabled = true;
    rollBtn.textContent = 'Rolling...';
    
    // Add rolling animation
    diceDisplay.classList.add('rolling');
    
    // Show random numbers during animation
    const animationInterval = setInterval(() => {
        const randomNum = Math.floor(Math.random() * 6) + 1;
        diceDisplay.textContent = getDiceSymbol(randomNum);
    }, 100);
    
    // After 1 second, show final result
    setTimeout(() => {
        clearInterval(animationInterval);
        const roll = Math.floor(Math.random() * 6) + 1;
        
        diceDisplay.textContent = getDiceSymbol(roll);
        diceDisplay.classList.remove('rolling');
        
        document.getElementById('dice-result').innerText = `${players[currentPlayer]} rolled: ${roll}`;
        
        // Re-enable button
        rollBtn.disabled = false;
        rollBtn.textContent = 'Roll Dice';
        
        // Move player after a short delay
        setTimeout(() => {
            movePlayer(currentPlayer, roll);
        }, 500);
    }, 1000);
}

// Get dice symbol for number
function getDiceSymbol(num) {
    const diceSymbols = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return diceSymbols[num - 1];
}

// Move player
function movePlayer(playerIndex, steps) {
    let position = playerPositions[playerIndex];
    let newPosition = position + steps;

    if (newPosition > maxTiles) newPosition = position;

    const triggerSnake = snakes[newPosition];
    const triggerLadder = ladders[newPosition];

    // Store the next tile we might go to
    playerPositions[playerIndex] = newPosition;
    updatePawns();

    if (triggerSnake) {
        askQuestion(false, triggerSnake);
    } else if (triggerLadder) {
        askQuestion(true, triggerLadder);
    } else {
        finalizeMove();
    }
}

// Show question modal
async function askQuestion(isLadder, newPos) {
    try {
        const response = await fetch('/get_question');
        const q = await response.json();
        
        const currentPos = playerPositions[currentPlayer];
        const playerName = players[currentPlayer];
        
        // Create header information
        let headerInfo = '';
        const questionHeaderElement = document.getElementById('questionHeader');
        
        if (isLadder) {
            questionHeaderElement.className = 'ladder-header';
            headerInfo = `🪜 LADDER QUESTION for ${playerName}<br>
                         <span style="color: #28a745; font-weight: bold;">
                         Answer CORRECTLY to climb from position ${currentPos} → ${newPos} (+${newPos - currentPos})
                         </span><br>
                         <span style="color: #666; font-size: 14px;">
                         Answer wrong to stay at position ${currentPos}
                         </span>`;
        } else {
            questionHeaderElement.className = 'snake-header';
            headerInfo = `🐍 SNAKE QUESTION for ${playerName}<br>
                         <span style="color: #28a745; font-weight: bold;">
                         Answer CORRECTLY to stay at position ${currentPos}
                         </span><br>
                         <span style="color: #dc3545; font-size: 14px;">
                         Answer wrong to slide down from position ${currentPos} → ${newPos} (-${currentPos - newPos})
                         </span>`;
        }
        
        // Set header and question
        questionHeaderElement.innerHTML = headerInfo;
        document.getElementById('questionText').innerText = q.question;
        
        const optsDiv = document.getElementById('questionOptions');
        optsDiv.innerHTML = '';
        
        // Clear any existing feedback
        const existingFeedback = document.querySelector('.answer-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }
        
        q.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.classList.add('option');
            btn.innerText = opt;
            btn.onclick = () => handleAnswerSelection(btn, opt, q.answer, isLadder, newPos);
            optsDiv.appendChild(btn);
        });

        document.getElementById('questionModal').style.display = 'block';
    } catch (error) {
        console.error('Error fetching question:', error);
        // Fallback to basic behavior if question fetch fails
        finalizeMove();
    }
}

// Handle answer selection with visual feedback
function handleAnswerSelection(selectedBtn, selectedAnswer, correctAnswer, isLadder, newPos) {
    const allOptions = document.querySelectorAll('.option');
    
    // Disable all buttons
    allOptions.forEach(btn => {
        btn.disabled = true;
        btn.style.cursor = 'not-allowed';
        
        // Show correct answer
        if (btn.innerText === correctAnswer) {
            btn.classList.add('correct');
        } else {
            btn.classList.add('incorrect');
        }
    });
    
    // Highlight selected answer
    if (selectedAnswer === correctAnswer) {
        selectedBtn.classList.remove('correct');
        selectedBtn.classList.add('selected-correct');
    } else {
        selectedBtn.classList.remove('incorrect');
        selectedBtn.classList.add('selected-incorrect');
    }
    
    // Add feedback message
    const feedbackDiv = document.createElement('div');
    feedbackDiv.classList.add('answer-feedback');
    
    if (selectedAnswer === correctAnswer) {
        feedbackDiv.classList.add('correct');
        if (isLadder) {
            feedbackDiv.innerHTML = `✓ Correct! You climb the ladder from ${playerPositions[currentPlayer]} to ${newPos}!`;
            playerPositions[currentPlayer] = newPos;
        } else {
            feedbackDiv.innerHTML = `✓ Correct! You avoided the snake and stay at position ${playerPositions[currentPlayer]}!`;
        }
    } else {
        feedbackDiv.classList.add('incorrect');
        if (isLadder) {
            feedbackDiv.innerHTML = `✗ Wrong! The correct answer is: "${correctAnswer}"<br>You miss the ladder and stay at position ${playerPositions[currentPlayer]}.`;
        } else {
            feedbackDiv.innerHTML = `✗ Wrong! The correct answer is: "${correctAnswer}"<br>You slide down the snake from ${playerPositions[currentPlayer]} to ${newPos}!`;
            playerPositions[currentPlayer] = newPos;
        }
    }
    
    document.getElementById('questionContent').appendChild(feedbackDiv);
    
    // Auto-close modal after 3 seconds
    setTimeout(() => {
        document.getElementById('questionModal').style.display = 'none';
        updatePawns();
        finalizeMove();
    }, 3000);
}

// Update pawn positions on board
function updatePawns() {
    document.querySelectorAll('.pawn').forEach(p => p.remove());
    
    // Group players by position to handle overlapping
    const playersByPosition = {};
    players.forEach((_, idx) => {
        const pos = playerPositions[idx];
        if (!playersByPosition[pos]) {
            playersByPosition[pos] = [];
        }
        playersByPosition[pos].push(idx);
    });
    
    // Place pawns for each position
    Object.entries(playersByPosition).forEach(([pos, playerIndices]) => {
        const position = parseInt(pos);
        let targetTile;
        
        if (position === 0) {
            // Handle starting position (position 0) - create a special start area
            targetTile = getOrCreateStartTile();
        } else {
            targetTile = document.getElementById(`tile-${position}`);
        }
        
        if (targetTile) {
            playerIndices.forEach((playerIdx, offset) => {
                const pawn = document.createElement('div');
                pawn.classList.add('pawn', `p${playerIdx + 1}`);
                
                // Position multiple pawns side by side or in a grid
                if (playerIndices.length > 1) {
                    const totalPawns = playerIndices.length;
                    if (totalPawns === 2) {
                        // Side by side
                        pawn.style.left = offset === 0 ? '2px' : '22px';
                        pawn.style.bottom = '2px';
                    } else if (totalPawns === 3) {
                        // Triangle formation
                        if (offset === 0) {
                            pawn.style.left = '12px';
                            pawn.style.bottom = '25px';
                        } else if (offset === 1) {
                            pawn.style.left = '2px';
                            pawn.style.bottom = '2px';
                        } else {
                            pawn.style.left = '22px';
                            pawn.style.bottom = '2px';
                        }
                    } else if (totalPawns === 4) {
                        // 2x2 grid
                        const row = Math.floor(offset / 2);
                        const col = offset % 2;
                        pawn.style.left = (col * 20 + 2) + 'px';
                        pawn.style.bottom = (row * 20 + 2) + 'px';
                    }
                }
                
                targetTile.appendChild(pawn);
            });
        }
    });
}

// Get or create starting position tile
function getOrCreateStartTile() {
    let startTile = document.getElementById('start-tile');
    if (!startTile) {
        startTile = document.createElement('div');
        startTile.id = 'start-tile';
        startTile.classList.add('tile', 'start-tile');
        startTile.innerText = 'START';
        startTile.title = 'Starting position - roll dice to begin!';
        
        // Insert before the board
        const board = document.getElementById('board');
        board.parentNode.insertBefore(startTile, board);
    }
    return startTile;
}

// Next player's turn
function finalizeMove() {
    if (playerPositions[currentPlayer] === 100) {
        alert(`${players[currentPlayer]} wins the game!`);
        return;
    }
    currentPlayer = (currentPlayer + 1) % players.length;
    updateCurrentTurnDisplay();
}
