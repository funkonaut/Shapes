const gameBoard = document.querySelector('.game-board');
let currentPlayer = 'white'; // Start with white's turn
let selectedPiece = null;
const boardState = Array.from({ length: 6 }, () => Array(6).fill(null)); // 6x6 grid

// Initialize the board on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log("Initializing board...");
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 6; col++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            gameBoard.appendChild(cell);

            const dot = document.createElement('div');
            dot.classList.add('dot');
            cell.appendChild(dot);
        }
    }

    initializePieces();
    console.log("Board initialized on page load.");
});

// Function to initialize the pieces on the board
function initializePieces() {
    const pieces = [
        { shape: 'triangle', row: 0, col: 1, color: 'white' },
        { shape: 'triangle', row: 0, col: 4, color: 'white' },
        { shape: 'circle', row: 1, col: 1, color: 'white' },
        { shape: 'circle', row: 1, col: 4, color: 'white' },
        { shape: 'square', row: 1, col: 0, color: 'white' },
        { shape: 'square', row: 1, col: 5, color: 'white' },
        { shape: 'pentagon', row: 3, col: 3, color: 'white' },
        { shape: 'triangle', row: 5, col: 1, color: 'black' },
        { shape: 'triangle', row: 5, col: 4, color: 'black' },
        { shape: 'circle', row: 4, col: 1, color: 'black' },
        { shape: 'circle', row: 4, col: 4, color: 'black' },
        { shape: 'square', row: 4, col: 0, color: 'black' },
        { shape: 'square', row: 4, col: 5, color: 'black' },
        { shape: 'pentagon', row: 2, col: 2, color: 'black' },
    ];

    pieces.forEach(piece => {
        boardState[piece.row][piece.col] = { shape: piece.shape, color: piece.color };
    });

    updateBoard();
}

function updateBoard() {
    console.log("Updating board...");

    let whiteCapturable = 0;
    let blackCapturable = 0;

    // Clear all existing pieces in the game board
    Array.from(gameBoard.children).forEach((cell, index) => {
        const pieces = cell.querySelectorAll('.piece');
        if (pieces.length > 1) {
            console.warn(`Duplicate pieces found in cell ${index}. Removing duplicates.`);
        }
        pieces.forEach(piece => piece.remove());
    });

    // Render pieces from the board state and count capturable pieces for each player
    boardState.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            if (cell) {
                // Count capturable pieces for each player (ignore shields/pentagons)
                if (cell.shape !== 'pentagon') {
                    if (cell.color === 'white') {
                        whiteCapturable++;
                    } else if (cell.color === 'black') {
                        blackCapturable++;
                    }
                }

                const cellElement = gameBoard.children[rowIndex * 6 + colIndex];
                const shapeElement = document.createElement('div');
                shapeElement.classList.add('piece', cell.shape, cell.color);
                cellElement.appendChild(shapeElement);

                // Attach click handler for selecting a piece
                shapeElement.addEventListener('click', () => selectPiece(shapeElement, rowIndex, colIndex));
            }
        });
    });

    console.log("Board updated. Current state:", JSON.stringify(boardState, null, 2));
    console.log(`White capturable pieces: ${whiteCapturable}`);
    console.log(`Black capturable pieces: ${blackCapturable}`);

    // Check for game end condition
    if (whiteCapturable === 1) {
        console.log("Game over! Black wins!");
        alert("BLACK wins the game!");
    } else if (blackCapturable === 1) {
        console.log("Game over! White wins!");
        alert("WHITE wins the game!");
    }
}


function selectPiece(piece, row, col) {
    console.log(`Selected piece at (${row}, ${col}). Current player: ${currentPlayer}`);
    if (piece.classList.contains(currentPlayer)) {
        clearHighlights();
        selectedPiece = { piece, row, col };

        if (piece.classList.contains('triangle')) {
            piece.style.borderBottomColor = 'yellow';
        } else {
            piece.style.backgroundColor = 'yellow';
        }

        highlightMoves(piece, row, col);
    } else {
        console.log(boardState);

        console.log("Cannot select this piece. It's not the current player's turn.");
    }
}

function highlightMoves(piece, row, col) {
    console.log(`Highlighting moves for piece at (${row}, ${col})`);

    const shape = piece.classList.contains('triangle') ? 'triangle'
        : piece.classList.contains('circle') ? 'circle'
        : piece.classList.contains('square') ? 'square'
        : 'pentagon';
console.log(shape);
    let moves = [];
    switch (shape) {
        case 'triangle':
            moves = getDiagonalMoves(row, col, 3, currentPlayer);
            break;
        case 'circle':
            moves = getOmniMoves(row, col, 1, currentPlayer, true); // Allow direction changes
            break;
        case 'square':
            moves = getLinearMoves(row, col, 2, currentPlayer);
            break;
        case 'pentagon':
            moves = getOmniMoves(row, col, 1, currentPlayer); // Shields can't capture
            break;
    }
console.log(moves);

    moves.forEach(([r, c]) => {
        const cellIndex = r * 6 + c;
        const cell = gameBoard.children[cellIndex];
        const targetPiece = boardState[r][c];
        console.log(currentPlayer);

        if (!targetPiece) {
            // Empty cell: valid move
            const dot = cell.querySelector('.dot');
            dot.style.backgroundColor = 'green';
            dot.dataset.moveTarget = true;
            dot.addEventListener('click', movePiece);

        } else if (targetPiece.color !== currentPlayer && targetPiece.shape !== 'pentagon') { 
            // Capturable piece logic: opposite color and not a shield
            const enemyPiece = cell.querySelector('.piece');
            console.log('enemy piece: (${enemyPiece})');
            console.log(enemyPiece.classList);
            if (enemyPiece) {
                if (enemyPiece.classList.contains('triangle')) {
                    enemyPiece.style.borderBottomColor = 'red';
                } else {
                    enemyPiece.style.backgroundColor = 'red';
                }
                enemyPiece.dataset.captureTarget = true;
                enemyPiece.dataset.row = r;
                enemyPiece.dataset.col = c;
                enemyPiece.addEventListener('click', capturePiece);
            }
        }
    });
}

function movePiece(event) {
    const targetDot = event.target;
    const cell = targetDot.parentElement;

    if (selectedPiece && targetDot.dataset.moveTarget) {
        const { piece, row, col } = selectedPiece;

        // Update board state
        const targetIndex = Array.from(gameBoard.children).indexOf(cell);
        const targetRow = Math.floor(targetIndex / 6);
        const targetCol = targetIndex % 6;
        boardState[row][col] = null; // Remove from current position
        boardState[targetRow][targetCol] = {
            shape: piece.classList[1],
            color: currentPlayer
        };

        // Move the piece
        cell.appendChild(piece);

        // Clear highlights and reset state
        clearHighlights();
        selectedPiece = null;

        // Switch turns
        switchTurn();
        updateBoard(); // Redraw the board to reflect the state
    }
}
function capturePiece(event) {
    const targetDot = event.target;
    const cell = targetDot.parentElement;
    console.log(selectedPiece);
    if (selectedPiece && targetDot.dataset.captureTarget) {
        const { piece, row, col } = selectedPiece;

        // Get target position
        const targetIndex = Array.from(gameBoard.children).indexOf(cell);
        const targetRow = Math.floor(targetIndex / 6);
        const targetCol = targetIndex % 6;

        const targetPiece = boardState[targetRow][targetCol];

        // Ensure it's an opponent's piece and not a shield
        if (targetPiece && targetPiece.color !== currentPlayer && targetPiece.shape !== 'pentagon') {
            console.log(`Captured ${targetPiece.color} ${targetPiece.shape} at (${targetRow}, ${targetCol}).`);

            // Remove the captured piece from the board state
            boardState[targetRow][targetCol] = null;

            // Remove the captured piece from the DOM
            const capturedPieceElement = document.querySelector(`[data-row="${targetRow}"][data-col="${targetCol}"] .piece`);
            if (capturedPieceElement) capturedPieceElement.remove();

            // Update board state for the moving piece
            boardState[row][col] = null; // Clear old position
            boardState[targetRow][targetCol] = {
                shape: piece.classList[1],
                color: currentPlayer
            };

            // Move the piece
            cell.appendChild(piece);

            // Clear highlights and reset state
            clearHighlights();
            selectedPiece = null;

            // Switch turns
            switchTurn();
            updateBoard(); // Redraw the board to reflect the state
        } else {
            console.log("Cannot capture: either it's not an opponent piece or it's a shield.");
        }
    } else {
        console.log("No valid piece selected or invalid capture target.");
    }
}

function clearHighlights() {
    // Reset dot highlights
    document.querySelectorAll('.dot').forEach(dot => {
        dot.style.backgroundColor = 'black';
        dot.removeEventListener('click', movePiece);
        delete dot.dataset.moveTarget;
    });

    // Reset piece highlights
    document.querySelectorAll('.piece').forEach(piece => {
        piece.style.backgroundColor = '';
        piece.removeEventListener('click', capturePiece);
        delete piece.dataset.captureTarget;
    });

    if (selectedPiece) {
        if (selectedPiece.piece.classList.contains('triangle')) {
            selectedPiece.piece.style.borderBottomColor = '';
        } else {
            selectedPiece.piece.style.backgroundColor = '';
        }
        selectedPiece = null;
    }
}

function getOmniMoves(row, col, range, color, allowDirectionChange = false) {
    const moves = [];
    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1],  // Cardinal directions
        [-1, -1], [-1, 1], [1, -1], [1, 1] // Diagonal directions
    ];

    const piece = boardState[row][col];
    const isPentagon = piece && piece.shape === 'pentagon';

    for (const [dr, dc] of directions) {
        let currentRow = row;
        let currentCol = col;
        let steps = 0;

        while (steps < range) {
            currentRow += dr;
            currentCol += dc;

            if (currentRow < 0 || currentRow >= 6 || currentCol < 0 || currentCol >= 6) break;

            const targetPiece = boardState[currentRow][currentCol];
            if (targetPiece) {
                if (targetPiece.color === color && targetPiece.shape === 'pentagon') {
                    // Same-color shield, pass through without consuming a step
                    if (allowDirectionChange) {
                        moves.push(...getOmniMoves(currentRow, currentCol, range - steps, color, true));
                    }
                    continue;
                } else if (!isPentagon && targetPiece.color !== color && targetPiece.shape !== 'pentagon') {
                    // Opposite color and not a shield, capturable if not a pentagon
                    moves.push([currentRow, currentCol]);
                }
                break; // Stop further moves in this direction
            }

            moves.push([currentRow, currentCol]);
            steps++;
        }
    }

    return moves;
}

function getLinearMoves(row, col, range, color) {
    const moves = [];
    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1] // Cardinal directions only
    ];

    const piece = boardState[row][col];
    const isPentagon = piece && piece.shape === 'pentagon';

    for (const [dr, dc] of directions) {
        let currentRow = row;
        let currentCol = col;
        let steps = 0;

        while (steps < range) {
            currentRow += dr;
            currentCol += dc;

            if (currentRow < 0 || currentRow >= 6 || currentCol < 0 || currentCol >= 6) break;

            const targetPiece = boardState[currentRow][currentCol];
            if (targetPiece) {
                if (targetPiece.color === color && targetPiece.shape === 'pentagon') {
                    // Same-color shield, pass through without consuming a step
                    continue;
                } else if (!isPentagon && targetPiece.color !== color && targetPiece.shape !== 'pentagon') {
                    // Opposite color and not a shield, capturable if not a pentagon
                    moves.push([currentRow, currentCol]);
                }
                break; // Stop further moves in this direction
            }

            moves.push([currentRow, currentCol]);
            steps++;
        }
    }
console.log("hello");
console.log(moves);
    return moves;
}

function getDiagonalMoves(row, col, range, color) {
    const moves = [];
    const directions = [
        [-1, -1], [-1, 1], [1, -1], [1, 1] // Diagonal directions only
    ];

    const piece = boardState[row][col];
    const isPentagon = piece && piece.shape === 'pentagon';

    for (const [dr, dc] of directions) {
        let currentRow = row;
        let currentCol = col;
        let steps = 0;

        while (steps < range) {
            currentRow += dr;
            currentCol += dc;

            if (currentRow < 0 || currentRow >= 6 || currentCol < 0 || currentCol >= 6) break;

            const targetPiece = boardState[currentRow][currentCol];
            if (targetPiece) {
                if (targetPiece.color === color && targetPiece.shape === 'pentagon') {
                    // Same-color shield, pass through without consuming a step
                    continue;
                } else if (!isPentagon && targetPiece.color !== color && targetPiece.shape !== 'pentagon') {
                    // Opposite color and not a shield, capturable if not a pentagon
                    moves.push([currentRow, currentCol]);
                }
                break; // Stop further moves in this direction
            }

            moves.push([currentRow, currentCol]);
            steps++;
        }
    }

    return moves;
}

function updateTurnIndicator() {
    const turnIndicator = document.querySelector('.turn-indicator');
    turnIndicator.style.backgroundColor = currentPlayer === 'white' ? 'white' : 'black';
}

// Call this function whenever the turn changes
function switchTurn() {
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    updateTurnIndicator();
    console.log(`Turn switched to ${currentPlayer}`);
}

// Initialize the indicator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    updateTurnIndicator();
});

