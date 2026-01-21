import React from 'react';
import { Square } from 'lucide-react';
import { BoardState, Piece, Move, GameMode } from '../types';

interface PieceMap {
    [key: string]: { char: string, color: 'white' | 'black' };
}

// Simplified map for visualization. In a real engine, this would handle rendering SVG or actual sprites.
const PIECE_MAP: PieceMap = {
    'wP': { char: '♙', color: 'white' }, 'wN': { char: '♘', color: 'white' }, 'wB': { char: '♗', color: 'white' }, 'wR': { char: '♖', color: 'white' }, 'wQ': { char: '♕', color: 'white' }, 'wK': { char: '♔', color: 'white' },
    'bP': { char: '♟', color: 'black' }, 'bN': { char: '♞', color: 'black' }, 'bB': { char: '♝', color: 'black' }, 'bR': { char: '♜', color: 'black' }, 'bQ': { char: '♛', color: 'black' }, 'bK': { char: '♚', color: 'black' },
};

interface BoardProps {
    board: BoardState;
    onMove: (move: Move) => void;
    currentPlayer: 'w' | 'b';
    selectedSquare: { row: number, col: number } | null;
    setSelectedSquare: React.Dispatch<React.SetStateAction<{ row: number, col: number } | null>>;
    mode: GameMode;
}

const INITIAL_BOARD: BoardState = [
    ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
    ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
    ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR'],
];

// Helper function to determine piece color
const getPieceColor = (piece: Piece): 'w' | 'b' | null => piece ? piece[0] as 'w' | 'b' : null;

// Simplified placeholder for move validation (Allows any non-occupied friendly move for demonstration)
const isValidMovePlaceholder = (board: BoardState, from: {row: number, col: number}, to: {row: number, col: number}, piece: Piece, currentPlayer: 'w' | 'b'): boolean => {
    if (!piece || getPieceColor(piece) !== currentPlayer) return false;
    if (to.row === from.row && to.col === from.col) return false;
    
    const targetPieceColor = getPieceColor(board[to.row][to.col]);
    if (targetPieceColor === currentPlayer) return false; // Cannot capture own piece

    // Since we cannot implement a full engine, we allow any move by the current player if the target is empty or opponent piece
    return true;
};


const ChessBoard: React.FC<BoardProps> = ({ 
    board, 
    onMove, 
    currentPlayer,
    selectedSquare,
    setSelectedSquare,
    mode
}) => {

    const isHumanTurn = mode === 'local' || (mode === 'ai' && currentPlayer === 'w');

    const handleSquareClick = (row: number, col: number) => {
        if (!isHumanTurn) return; 

        const clickedPiece = board[row][col];
        const clickedColor = getPieceColor(clickedPiece);

        if (selectedSquare) {
            // Case 1: A piece is already selected
            const move: Move = { from: selectedSquare, to: { row, col }, piece: board[selectedSquare.row][selectedSquare.col]! };

            if (selectedSquare.row === row && selectedSquare.col === col) {
                // Deselect if clicking the same square
                setSelectedSquare(null);
            } else if (clickedColor === currentPlayer) {
                // Select a new friendly piece
                setSelectedSquare({ row, col });
            } else if (isValidMovePlaceholder(board, selectedSquare, { row, col }, move.piece, currentPlayer)) {
                // Execute move
                onMove(move);
                setSelectedSquare(null);
            } else {
                // Invalid move target or logic error, deselect
                setSelectedSquare(null);
            }

        } else {
            // Case 2: No piece selected, try to select one
            if (clickedPiece && clickedColor === currentPlayer) {
                setSelectedSquare({ row, col });
            }
        }
    };

    const renderPiece = (piece: Piece, row: number, col: number) => {
        if (!piece) return null;
        const pieceData = PIECE_MAP[piece];
        const pieceClass = pieceData.color === 'white' 
            ? 'text-white text-shadow-md'
            : 'text-black text-shadow-md';
        
        return (
            <div className={`text-4xl font-serif cursor-pointer ${pieceClass}`}>
                {pieceData.char}
            </div>
        );
    };

    const getSquareClasses = (row: number, col: number): string => {
        const isLight = (row + col) % 2 === 0;
        let classes = isLight 
            ? 'bg-[#f0d9b5] hover:bg-[#b58863]/80' // Light square color
            : 'bg-[#b58863] hover:bg-[#f0d9b5]/80'; // Dark square color
        
        const isSelected = selectedSquare?.row === row && selectedSquare?.col === col;
        const isTarget = selectedSquare && !isSelected && isValidMovePlaceholder(board, selectedSquare, {row, col}, board[selectedSquare.row][selectedSquare.col]!, currentPlayer);

        if (isSelected) {
            classes = 'bg-yellow-400/80 ring-4 ring-yellow-600/80 shadow-inner';
        } else if (isTarget) {
             classes = isLight ? 'bg-green-300/70 hover:bg-green-400' : 'bg-green-600/70 hover:bg-green-700';
        }

        return `${classes} w-full h-full flex items-center justify-center transition duration-100 ease-in-out`;
    };

    const isGameOver = false; // Simplified: No checkmate logic implemented

    return (
        <div className={`w-full max-w-xl aspect-square shadow-2xl border-8 border-gray-800 rounded-lg overflow-hidden ${isGameOver ? 'opacity-70' : ''}`}>
            {board.map((rowArr, rowIndex) => (
                <div key={rowIndex} className="flex flex-row flex-nowrap h-[12.5%]">
                    {rowArr.map((piece, colIndex) => (
                        <div 
                            key={colIndex} 
                            className={`w-[12.5%] h-full ${getSquareClasses(rowIndex, colIndex)}`}
                            onClick={() => handleSquareClick(rowIndex, colIndex)}
                        >
                            {renderPiece(piece, rowIndex, colIndex)}
                            {/* Visual indicator for potential capture targets if selected */}
                            {selectedSquare && !piece && isValidMovePlaceholder(board, selectedSquare, {row: rowIndex, col: colIndex}, board[selectedSquare.row][selectedSquare.col]!, currentPlayer) && (
                                <div className="absolute w-1/4 h-1/4 rounded-full bg-black/20 pointer-events-none"></div>
                            )}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default ChessBoard;
export { INITIAL_BOARD };