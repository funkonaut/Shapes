        const gameBoard = document.querySelector('.game-board');
        let currentPlayer = 'white'; // Start with white's turn
        let selectedPiece = null;

        function createBoard() {
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
                const cellIndex = piece.row * 6 + piece.col;
                const cell = gameBoard.children[cellIndex];

                const shapeElement = document.createElement('div');
                shapeElement.classList.add('piece', piece.shape, piece.color);
                cell.appendChild(shapeElement);

                shapeElement.addEventListener('click', () => selectPiece(shapeElement, piece.row, piece.col));
            });
        }

        function selectPiece(piece, row, col) {
            if (piece.classList.contains(currentPlayer)) {
                clearHighlights();
                selectedPiece = { piece, row, col };

                if (piece.classList.contains('triangle')) {
                    piece.style.borderBottomColor = 'yellow';
                } else {
                    piece.style.backgroundColor = 'yellow';
                }

                highlightMoves(piece, row, col);
            }
        }

        function highlightMoves(piece, row, col) {
            const shape = piece.classList.contains('triangle') ? 'triangle'
                        : piece.classList.contains('circle') ? 'circle'
                        : piece.classList.contains('square') ? 'square'
                        : 'pentagon';

            const pieceColor = piece.classList.contains('white') ? 'white' : 'black';

            let moves = [];
            switch (shape) {
                case 'triangle':
                    moves = getDiagonalMoves(row, col, 3, pieceColor);
                    break;
                case 'circle':
                    moves = getOmniMoves(row, col, 1, pieceColor);
                    break;
                case 'square':
                    moves = getLinearMoves(row, col, 2, pieceColor);
                    break;
                case 'pentagon':
                    moves = getOmniMoves(row, col, 1, pieceColor);
                    break;
            }

            moves.forEach(([r, c]) => {
                const cellIndex = r * 6 + c;
                const cell = gameBoard.children[cellIndex];
                if (cell && !cell.querySelector('.piece')) {
                    const dot = cell.querySelector('.dot');
                    dot.style.backgroundColor = 'green';
                    dot.dataset.moveTarget = true;
                    dot.addEventListener('click', movePiece);
                }
            });
        }

        function movePiece(event) {
            const targetDot = event.target;
            const cell = targetDot.parentElement;

            if (selectedPiece && targetDot.dataset.moveTarget) {
                const { piece } = selectedPiece;

                // Clear previous position
                piece.style.backgroundColor = '';
                piece.style.borderBottomColor = '';
                cell.appendChild(piece);

                clearHighlights();

                selectedPiece = null;
                currentPlayer = currentPlayer === 'white' ? 'black' : 'white'; // Switch turn
            }
        }

        function clearHighlights() {
            document.querySelectorAll('.dot').forEach(dot => {
                dot.style.backgroundColor = 'black';
                dot.removeEventListener('click', movePiece);
                delete dot.dataset.moveTarget;
            });

            if (selectedPiece) {
                selectedPiece.piece.style.backgroundColor = '';
                selectedPiece.piece.style.borderBottomColor = '';
                selectedPiece = null;
            }
        }

        // Add specific movement functions here (e.g., getOmniMoves, getLinearMoves, getDiagonalMoves)
        function getDiagonalMoves(row, col, range, pieceColor) {
            const moves = [];
            for (const [dr, dc] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
                for (let i = 1; i <= range; i++) {
                    const r = row + dr * i, c = col + dc * i;
                    if (r < 0 || r >= 6 || c < 0 || c >= 6) break;
                    moves.push([r, c]);
                }
            }
            return moves;
        }

        function getOmniMoves(row, col, range, pieceColor) {
            const moves = [];
            for (const dr of [-1, 0, 1]) {
                for (const dc of [-1, 0, 1]) {
                    for (let i = 1; i <= range; i++) {
                        const r = row + dr * i, c = col + dc * i;
                        if (r < 0 || r >= 6 || c < 0 || c >= 6 || (dr === 0 && dc === 0)) break;
                        moves.push([r, c]);
                    }
                }
            }
            return moves;
        }

        function getLinearMoves(row, col, range, pieceColor) {
            const moves = [];
            for (const [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
                for (let i = 1; i <= range; i++) {
                    const r = row + dr * i, c = col + dc * i;
                    if (r < 0 || r >= 6 || c < 0 || c >= 6) break;
                    moves.push([r, c]);
                }
            }
            return moves;
        }

        createBoard();
