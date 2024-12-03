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

    console.log("Initializing pieces:", pieces);

    pieces.forEach(piece => {
        boardState[piece.row][piece.col] = { shape: piece.shape, color: piece.color };
    });

    updateBoard();
}

// Function to update the board dynamically
function updateBoard() {
    console.log("Updating board...");

    // Clear all existing pieces
    Array.from(gameBoard.children).forEach(cell => {
        const piece = cell.querySelector('.piece');
        if (piece) cell.removeChild(piece);
    });

    // Render pieces from the board state
    boardState.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            if (cell) {
                const cellElement = gameBoard.children[rowIndex * 6 + colIndex];
                const shapeElement = document.createElement('div');
                shapeElement.classList.add('piece', cell.shape, cell.color);
                cellElement.appendChild(shapeElement);

                shapeElement.addEventListener('click', () => selectPiece(shapeElement, rowIndex, colIndex));
            }
        });
    });

    console.log("Board updated. Current state:", boardState);
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
        console.log("Cannot select this piece. It's not the current player's turn.");
    }
}

function highlightMoves(piece, row, col) {
    console.log(`Highlighting moves for piece at (${row}, ${col})`);

    const shape = piece.classList.contains('triangle') ? 'triangle'
        : piece.classList.contains('circle') ? 'circle'
        : piece.classList.contains('square') ? 'square'
        : 'pentagon';

    console.log(`Piece shape: ${shape}`);

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

    console.log("Possible moves:", moves);

    moves.forEach(([r, c]) => {
        const cellIndex = r * 6 + c;
        const cell = gameBoard.children[cellIndex];
        const targetPiece = boardState[r][c];

        if (!targetPiece) {
            // Empty cell: valid move
            const dot = cell.querySelector('.dot');
            dot.style.backgroundColor = 'green';
            dot.dataset.moveTarget = true;
            dot.addEventListener('click', movePiece);

        } else if (targetPiece.color !== currentPlayer && targetPiece.shape !== 'pentagon') { 
            // Capturable piece logic: opposite color and not a shield
            const enemyPiece = cell.querySelector('.piece');
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

        console.log(`Moving piece from (${row}, ${col}) to target cell`);

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
        currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
        updateBoard(); // Redraw the board to reflect the state
    }
}

function capturePiece(event) {
    const targetDot = event.target;
    const cell = targetDot.parentElement;

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
            currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
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
        delete dot.dataset.moveTarget;
        delete dot.dataset.captureTarget;
    });

    // Reset selected piece highlights
    const selectedPieceElement = document.querySelector('.piece.highlight');
    if (selectedPieceElement) {
        selectedPieceElement.classList.remove('highlight');
    }

    // Reset capture targets
    document.querySelectorAll('.piece[data-capture-target]').forEach(piece => {
        piece.style.backgroundColor = '';
        delete piece.dataset.captureTarget;
    });
}

function getLinearMoves(row, col, steps, color) {
    const directions = [
        [-1, 0], // Up
        [1, 0],  // Down
        [0, -1], // Left
        [0, 1]   // Right
    ];
    let moves = [];

    directions.forEach(([dRow, dCol]) => {
        for (let i = 1; i <= steps; i++) {
            const newRow = row + dRow * i;
            const newCol = col + dCol * i;
            if (newRow >= 0 && newRow < 6 && newCol >= 0 && newCol < 6) {
                if (boardState[newRow][newCol] === null) {
                    moves.push([newRow, newCol]);
                } else if (boardState[newRow][newCol].color !== color) {
                    moves.push([newRow, newCol]);
                    break;
                } else {
                    break;
                }
            }
        }
    });

    return moves;
}

function getOmniMoves(row, col, steps, color, changeDirection = false) {
    const directions = [
        [-1, 0], // Up
        [1, 0],  // Down
        [0, -1], // Left
        [0, 1]   // Right
    ];
    let moves = [];

    if (changeDirection) {
        directions.push(
            [-1, -1], // Up-left diagonal
            [-1, 1],  // Up-right diagonal
            [1, -1],  // Down-left diagonal
            [1, 1]    // Down-right diagonal
        );
    }

    directions.forEach(([dRow, dCol]) => {
        for (let i = 1; i <= steps; i++) {
            const newRow = row + dRow * i;
            const newCol = col + dCol * i;
            if (newRow >= 0 && newRow < 6 && newCol >= 0 && newCol < 6) {
                if (boardState[newRow][newCol] === null) {
                    moves.push([newRow, newCol]);
                } else if (boardState[newRow][newCol].color !== color) {
                    moves.push([newRow, newCol]);
                    break;
                } else {
                    break;
                }
            }
        }
    });

    return moves;
}

function getDiagonalMoves(row, col, steps, color) {
    const diagonalDirections = [
        [-1, -1], // Up-left
        [-1, 1],  // Up-right
        [1, -1],  // Down-left
        [1, 1]    // Down-right
    ];
    let moves = [];

    diagonalDirections.forEach(([dRow, dCol]) => {
        for (let i = 1; i <= steps; i++) {
            const newRow = row + dRow * i;
            const newCol = col + dCol * i;
            if (newRow >= 0 && newRow < 6 && newCol >= 0 && newCol < 6) {
                if (boardState[newRow][newCol] === null) {
                    moves.push([newRow, newCol]);
                } else if (boardState[newRow][newCol].color !== color) {
                    moves.push([newRow, newCol]);
                    break;
                } else {
                    break;
                }
            }
        }
    });

    return moves;
}

