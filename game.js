const gameBoard = document.querySelector('.game-board');
let currentPlayer = 'white'; // Human player is white
let aiColor = 'black';       // AI is black
let selectedPiece = null;

const boardState = Array.from({ length: 6 }, () => Array(6).fill(null));

document.addEventListener('DOMContentLoaded', () => {
    console.log("Initializing board...");
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 6; col++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            gameBoard.appendChild(cell);

            // Create a dot-container to cover the entire cell
            const dotContainer = document.createElement('div');
            dotContainer.classList.add('dot-container');
            cell.appendChild(dotContainer);

            // Create the small dot inside
            const dot = document.createElement('div');
            dot.classList.add('dot');
            dotContainer.appendChild(dot);
        }
    }

    initializePieces();
    updateTurnIndicator();
    console.log("Board initialized on page load.");
});

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
    Array.from(gameBoard.children).forEach((cell) => {
        const pieces = cell.querySelectorAll('.piece');
        pieces.forEach(piece => piece.remove());
    });

    // Render pieces from the board state
    boardState.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            if (cell) {
                if (cell.shape !== 'pentagon') {
                    if (cell.color === 'white') whiteCapturable++;
                    else blackCapturable++;
                }

                const cellElement = gameBoard.children[rowIndex * 6 + colIndex];
                const shapeElement = document.createElement('div');
                shapeElement.classList.add('piece', cell.shape, cell.color);
                cellElement.appendChild(shapeElement);

                // Allow the human player (white) to select their pieces
                if (currentPlayer === 'white' && cell.color === 'white') {
                    shapeElement.addEventListener('click', () => selectPiece(shapeElement, rowIndex, colIndex));
                }
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
        console.log("Cannot select this piece. It's not the current player's turn.");
    }
}

function highlightMoves(piece, row, col) {
    const shape = piece.classList.contains('triangle') ? 'triangle'
        : piece.classList.contains('circle') ? 'circle'
        : piece.classList.contains('square') ? 'square'
        : 'pentagon';

    const moves = getMovesForPiece(boardState, row, col, shape, currentPlayer);

    moves.forEach(([r, c]) => {
        const cellIndex = r * 6 + c;
        const cell = gameBoard.children[cellIndex];
        const targetPiece = boardState[r][c];
        const dotContainer = cell.querySelector('.dot-container');
        const dot = cell.querySelector('.dot');

        if (!targetPiece) {
            // Empty cell: valid move
            // Color the dot green to indicate a valid move target
            dot.style.backgroundColor = 'green';
            dotContainer.dataset.moveTarget = true;
            dotContainer.removeEventListener('click', movePiece);
            dotContainer.addEventListener('click', movePiece);
        } else if (targetPiece.color !== currentPlayer && targetPiece.shape !== 'pentagon') {
            // Capturable piece
            const enemyPiece = cell.querySelector('.piece');
            if (enemyPiece.classList.contains('triangle')) {
                enemyPiece.style.borderBottomColor = 'red';
            } else {
                enemyPiece.style.backgroundColor = 'red';
            }
            enemyPiece.dataset.captureTarget = true;
            enemyPiece.dataset.row = r;
            enemyPiece.dataset.col = c;
            enemyPiece.removeEventListener('click', capturePiece);
            enemyPiece.addEventListener('click', capturePiece);
        }
    });
}

function movePiece(event) {
    // event.target could be the dot or dot-container; find the cell:
    const dotContainer = event.currentTarget;
    if (selectedPiece && dotContainer.dataset.moveTarget) {
        const cell = dotContainer.parentElement;
        const { piece, row, col } = selectedPiece;

        const targetIndex = Array.from(gameBoard.children).indexOf(cell);
        const targetRow = Math.floor(targetIndex / 6);
        const targetCol = targetIndex % 6;
        boardState[row][col] = null;
        boardState[targetRow][targetCol] = {
            shape: piece.classList[1],
            color: currentPlayer
        };

        cell.appendChild(piece);
        clearHighlights();
        selectedPiece = null;
        switchTurn();
        updateBoard();
    }
}

function capturePiece(event) {
    const targetPiece = event.currentTarget;
    const cell = targetPiece.parentElement;

    if (selectedPiece && targetPiece.dataset.captureTarget) {
        const { piece, row, col } = selectedPiece;

        const targetIndex = Array.from(gameBoard.children).indexOf(cell);
        const targetRow = Math.floor(targetIndex / 6);
        const targetCol = targetIndex % 6;

        const targetPieceState = boardState[targetRow][targetCol];

        // Check capture rules:
        const movingPieceShape = piece.classList[1];
        if (movingPieceShape === 'pentagon') {
            console.log("Pentagons cannot capture. Move invalid.");
            return;
        }

        if (targetPieceState && targetPieceState.color !== currentPlayer && targetPieceState.shape !== 'pentagon') {
            console.log(`Captured ${targetPieceState.color} ${targetPieceState.shape} at (${targetRow}, ${targetCol}).`);
            boardState[targetRow][targetCol] = null;
            boardState[row][col] = null;
            boardState[targetRow][targetCol] = {
                shape: movingPieceShape,
                color: currentPlayer
            };
            cell.appendChild(piece);

            clearHighlights();
            selectedPiece = null;
            switchTurn();
            updateBoard();
        } else {
            console.log("Cannot capture: either not opponent piece or shield or same color.");
        }
    } else {
        console.log("No valid piece selected or invalid capture target.");
    }
}

function clearHighlights() {
    document.querySelectorAll('.dot-container').forEach(dc => {
        dc.removeEventListener('click', movePiece);
        delete dc.dataset.moveTarget;
    });

    document.querySelectorAll('.dot').forEach(dot => {
        dot.style.backgroundColor = 'black';
    });

    document.querySelectorAll('.piece').forEach(piece => {
        piece.style.backgroundColor = '';
        piece.style.borderBottomColor = '';
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

function updateTurnIndicator() {
    const turnIndicator = document.querySelector('.turn-indicator');
    if (turnIndicator) {
        turnIndicator.style.backgroundColor = currentPlayer === 'white' ? 'white' : 'black';
    }
}

function switchTurn() {
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    updateTurnIndicator();
    console.log(`Turn switched to ${currentPlayer}`);
    // If it's the AI's turn, make the AI move
    if (currentPlayer === aiColor) {
        setTimeout(aiMove, 500);
    }
}

// ============================
// Move Generation Functions
// ============================

function getMovesForPiece(state, row, col, shape, color) {
    if (shape === 'triangle') {
        return getDiagonalMoves(state, row, col, 3, color);
    } else if (shape === 'circle') {
        return getOmniMoves(state, row, col, 1, color, true);
    } else if (shape === 'square') {
        return getLinearMoves(state, row, col, 2, color);
    } else if (shape === 'pentagon') {
        return getOmniMoves(state, row, col, 1, color, false);
    }
    return [];
}

function getOmniMoves(state, row, col, range, color, allowDirectionChange = false) {
    const moves = [];
    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1],
        [-1, -1], [-1, 1], [1, -1], [1, 1]
    ];

    const piece = state[row][col];
    const isPentagon = (piece && piece.shape === 'pentagon');

    const stack = [[row, col, range]];

    while (stack.length > 0) {
        const [currentRow, currentCol, remainingRange] = stack.pop();

        for (const [dr, dc] of directions) {
            let tempRow = currentRow;
            let tempCol = currentCol;
            let steps = 0;

            while (steps < remainingRange) {
                tempRow += dr;
                tempCol += dc;

                if (tempRow < 0 || tempRow >= 6 || tempCol < 0 || tempCol >= 6) break;

                const targetPiece = state[tempRow][tempCol];
                if (targetPiece) {
                    if (targetPiece.color === color && targetPiece.shape === 'pentagon') {
                        // Same-color pentagon: pass through without using a step
                        if (allowDirectionChange) {
                            // Direction changes allowed: push a new starting point
                            stack.push([tempRow, tempCol, remainingRange - steps]);
                        }
                        continue;
                    } else if (!isPentagon && targetPiece.color !== color && targetPiece.shape !== 'pentagon') {
                        moves.push([tempRow, tempCol]);
                    }
                    break;
                }

                moves.push([tempRow, tempCol]);
                steps++;
            }
        }
    }

    return moves;
}

function getLinearMoves(state, row, col, range, color) {
    const moves = [];
    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1]
    ];

    const piece = state[row][col];
    const isPentagon = (piece && piece.shape === 'pentagon');

    for (const [dr, dc] of directions) {
        let currentRow = row;
        let currentCol = col;
        let steps = 0;

        while (steps < range) {
            currentRow += dr;
            currentCol += dc;

            if (currentRow < 0 || currentRow >= 6 || currentCol < 0 || currentCol >= 6) break;

            const targetPiece = state[currentRow][currentCol];
            if (targetPiece) {
                if (targetPiece.color === color && targetPiece.shape === 'pentagon') {
                    continue;
                } else if (!isPentagon && targetPiece.color !== color && targetPiece.shape !== 'pentagon') {
                    moves.push([currentRow, currentCol]);
                }
                break;
            }

            moves.push([currentRow, currentCol]);
            steps++;
        }
    }

    return moves;
}

function getDiagonalMoves(state, row, col, range, color) {
    const moves = [];
    const directions = [
        [-1, -1], [-1, 1], [1, -1], [1, 1]
    ];

    const piece = state[row][col];
    const isPentagon = (piece && piece.shape === 'pentagon');

    for (const [dr, dc] of directions) {
        let currentRow = row;
        let currentCol = col;
        let steps = 0;

        while (steps < range) {
            currentRow += dr;
            currentCol += dc;

            if (currentRow < 0 || currentRow >= 6 || currentCol < 0 || currentCol >= 6) break;

            const targetPiece = state[currentRow][currentCol];
            if (targetPiece) {
                if (targetPiece.color === color && targetPiece.shape === 'pentagon') {
                    continue;
                } else if (!isPentagon && targetPiece.color !== color && targetPiece.shape !== 'pentagon') {
                    moves.push([currentRow, currentCol]);
                }
                break;
            }

            moves.push([currentRow, currentCol]);
            steps++;
        }
    }

    return moves;
}

// ============================
// AI and Minimax Implementation
// ============================

function aiMove() {
    const bestMove = minimaxRoot(boardState, aiColor, 3); // Depth can be adjusted
    if (bestMove) {
        applyMoveToRealBoard(bestMove);
        switchTurn();
        updateBoard();
    }
}

function getAllMoves(state, player) {
    const moves = [];
    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
            const piece = state[r][c];
            if (piece && piece.color === player) {
                const possibleMoves = getMovesForPiece(state, r, c, piece.shape, player);
                possibleMoves.forEach(m => {
                    const target = state[m[0]][m[1]];
                    const isPentagon = (piece.shape === 'pentagon');
                    let capture = false;
                    if (target && target.color !== player && target.shape !== 'pentagon' && !isPentagon) {
                        capture = true;
                    }
                    moves.push({
                        from: {row: r, col: c},
                        to: {row: m[0], col: m[1]},
                        capture: capture
                    });
                });
            }
        }
    }
    return moves;
}

function applyMove(state, move) {
    const newState = JSON.parse(JSON.stringify(state));
    const piece = newState[move.from.row][move.from.col];
    newState[move.from.row][move.from.col] = null;
    newState[move.to.row][move.to.col] = piece;
    return newState;
}

function evaluateBoard(state) {
    let whiteCapturable = 0;
    let blackCapturable = 0;
    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
            const cell = state[r][c];
            if (cell && cell.shape !== 'pentagon') {
                if (cell.color === 'white') whiteCapturable++;
                if (cell.color === 'black') blackCapturable++;
            }
        }
    }
    if (aiColor === 'black') {
        return blackCapturable - whiteCapturable;
    } else {
        return whiteCapturable - blackCapturable;
    }
}

function gameIsOver(state) {
    let whiteCapturable = 0;
    let blackCapturable = 0;
    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
            const cell = state[r][c];
            if (cell && cell.shape !== 'pentagon') {
                if (cell.color === 'white') whiteCapturable++;
                if (cell.color === 'black') blackCapturable++;
            }
        }
    }
    return (whiteCapturable === 1 || blackCapturable === 1);
}

function minimax(state, depth, isMaximizingPlayer, aiColor) {
    if (depth === 0 || gameIsOver(state)) {
        return evaluateBoard(state);
    }

    const player = isMaximizingPlayer ? aiColor : (aiColor === 'white' ? 'black' : 'white');
    const moves = getAllMoves(state, player);

    if (moves.length === 0) {
        return evaluateBoard(state);
    }

    if (isMaximizingPlayer) {
        let bestVal = -Infinity;
        for (const move of moves) {
            const newState = applyMove(state, move);
            const value = minimax(newState, depth - 1, false, aiColor);
            bestVal = Math.max(bestVal, value);
        }
        return bestVal;
    } else {
        let bestVal = Infinity;
        for (const move of moves) {
            const newState = applyMove(state, move);
            const value = minimax(newState, depth - 1, true, aiColor);
            bestVal = Math.min(bestVal, value);
        }
        return bestVal;
    }
}

function minimaxRoot(state, player, depth) {
    const moves = getAllMoves(state, player);
    let bestMove = null;
    let bestValue = -Infinity;

    for (const move of moves) {
        const newState = applyMove(state, move);
        const value = minimax(newState, depth - 1, false, player);
        if (value > bestValue) {
            bestValue = value;
            bestMove = move;
        }
    }

    return bestMove;
}

function applyMoveToRealBoard(move) {
    const piece = boardState[move.from.row][move.from.col];
    boardState[move.from.row][move.from.col] = null;
    boardState[move.to.row][move.to.col] = piece;
}
