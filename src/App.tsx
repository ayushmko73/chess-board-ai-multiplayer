import React, { useState, useCallback, useMemo } from 'react';
import { RefreshCw, CircleDot } from 'lucide-react';
import ChessBoard, { INITIAL_BOARD } from './components/Board';
import ModeSelector from './components/ModeSelector';
import { BoardState, GameMode, Difficulty, Move } from './types';

// --- Utility Functions (Simulated Engine Logic) ---

const getPieceColor = (piece: string | null): 'w' | 'b' | null => piece ? piece[0] as 'w' | 'b' : null;

// Simplified AI Move Generator (Always chooses a random, legal-looking move for demonstration)
const generateAIMove = (board: BoardState, difficulty: Difficulty): Move | null => {
    const opponentColor: 'w' | 'b' = 'b'; // AI is always Black for simplicity here
    
    // Determine search depth/behavior based on difficulty (Visual mapping only)
    let complexityFactor = 1;
    if (difficulty === 'Easy') complexityFactor = 1;
    if (difficulty === 'Hard') complexityFactor = 2;
    if (difficulty === 'Master') complexityFactor = 3;

    const allPossibleMoves: Move[] = [];

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (getPieceColor(piece) === opponentColor) {
                // Simulate finding valid moves for this piece
                for (let tr = 0; tr < 8; tr++) {
                    for (let tc = 0; tc < 8; tc++) {
                        // Simple check: must move to a different square and not capture own piece (opponentColor)
                        if ((r !== tr || c !== tc) && getPieceColor(board[tr][tc]) !== opponentColor) {
                            allPossibleMoves.push({ from: { row: r, col: c }, to: { row: tr, col: tc }, piece });
                        }
                    }
                }
            }
        }
    }

    if (allPossibleMoves.length === 0) return null;

    // Select a move (Simulating AI depth by random selection for now)
    const index = Math.floor(Math.random() * allPossibleMoves.length);
    return allPossibleMoves[index];
};

// --- Component Logic ---

export default function App() {
    const [mode, setMode] = useState<GameMode>('local');
    const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
    const [board, setBoard] = useState<BoardState>(INITIAL_BOARD);
    const [currentPlayer, setCurrentPlayer] = useState<'w' | 'b'>('w'); // White always starts
    const [selectedSquare, setSelectedSquare] = useState<{ row: number, col: number } | null>(null);
    const [statusMessage, setStatusMessage] = useState("White to move.");

    const resetGame = useCallback(() => {
        setBoard(INITIAL_BOARD);
        setCurrentPlayer('w');
        setSelectedSquare(null);
        setStatusMessage("Game Reset. White to move.");
    }, []);

    // Memoize current status display
    const statusDisplay = useMemo(() => {
        let msg = statusMessage;
        if (mode === 'local') {
            msg = `${currentPlayer === 'w' ? 'White' : 'Black'}'s turn.`;
        } else if (mode === 'ai' && currentPlayer === 'w') {
            msg = "Your Turn (White)";
        } else if (mode === 'ai' && currentPlayer === 'b') {
            msg = `AI Thinking (${difficulty})...`;
        }
        return msg;
    }, [currentPlayer, mode, difficulty, statusMessage]);

    const executeMove = useCallback((move: Move, player: 'w' | 'b') => {
        setBoard(prevBoard => {
            const newBoard = prevBoard.map(row => [...row]);
            newBoard[move.to.row][move.to.col] = move.piece;
            newBoard[move.from.row][move.from.col] = null;
            return newBoard;
        });
        
        // Switch turn
        const nextPlayer = player === 'w' ? 'b' : 'w';
        setCurrentPlayer(nextPlayer);
        setSelectedSquare(null);

        if (mode === 'local') {
            setStatusMessage(`${nextPlayer === 'w' ? 'White' : 'Black'} to move.`);
        } else if (mode === 'ai' && nextPlayer === 'w') {
            setStatusMessage("Your Turn (White)");
        } else if (mode === 'ai' && nextPlayer === 'b') {
             setStatusMessage("AI Thinking...");
        }
    }, [mode]);

    // Handle human move submission (used by 2P and AI White)
    const handleHumanMove = useCallback((move: Move) => {
        // Validation check: Ensure move is valid for the current player before executing
        const pieceColor = getPieceColor(move.piece);
        if (pieceColor !== currentPlayer) {
            setStatusMessage("Error: Cannot move opponent's piece.");
            return;
        }
        // NOTE: Full engine validation (check/checkmate) is skipped here due to complexity constraints.
        executeMove(move, currentPlayer);
    }, [currentPlayer, executeMove]);

    // --- AI Effect Hook (Runs when currentPlayer switches to 'b' in AI mode) ---
    React.useEffect(() => {
        if (mode === 'ai' && currentPlayer === 'b') {
            setStatusMessage(`AI (${difficulty}) calculating move...`);
            
            // Simulate processing delay for AI thinking
            const delay = difficulty === 'Beginner' ? 800 : difficulty === 'Easy' ? 500 : difficulty === 'Hard' ? 300 : 150;

            const timer = setTimeout(() => {
                const aiMove = generateAIMove(board, difficulty);
                if (aiMove) {
                    executeMove(aiMove, 'b');
                } else {
                    setStatusMessage("AI could not find a move. Game Over? (Stalemate/Error)");
                    setCurrentPlayer('w'); // End AI turn
                }
            }, delay);

            return () => clearTimeout(timer);
        }
    }, [currentPlayer, mode, board, difficulty, executeMove]);

    // Reset when mode changes
    React.useEffect(() => {
        resetGame();
    }, [mode, difficulty]); 

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 font-sans">
            <header className="text-4xl font-extrabold mb-6 tracking-wider border-b-4 border-indigo-500 pb-2">
                Supreme Chess Engine
            </header>

            <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl">
                
                {/* Left Column: Controls */}
                <div className="lg:w-1/4 flex flex-col gap-6 order-2 lg:order-1">
                    <ModeSelector 
                        mode={mode} 
                        setMode={setMode} 
                        difficulty={difficulty} 
                        setDifficulty={setDifficulty}
                        isGameActive={selectedSquare !== null || mode !== 'local' && currentPlayer === 'b'} // Simplified active check
                    />

                    <div className="p-4 bg-gray-800 rounded-xl shadow-xl border border-gray-700">
                        <h3 className="text-xl font-bold mb-2 text-indigo-400">Game Status</h3>
                        <div className="flex items-center gap-2 mb-3">
                            <CircleDot className={`w-4 h-4 ${currentPlayer === 'w' ? 'text-white' : 'text-gray-400'}`} />
                            <p className="font-mono text-lg">Turn: {currentPlayer === 'w' ? 'White' : 'Black'}</p>
                        </div>
                        <p className="text-sm italic text-yellow-300">{statusDisplay}</p>

                        <button 
                            onClick={resetGame}
                            className="mt-4 w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 shadow-md"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Restart Game
                        </button>
                    </div>

                    {mode === 'ai' && (
                         <div className="p-3 bg-indigo-900/30 border border-indigo-500 rounded-lg text-xs text-indigo-200">
                            Note: AI functionality relies on simplified move generation, as full chess engine logic requires external libraries.
                         </div>
                    )}

                </div>

                {/* Right Column: Board */}
                <div className="lg:w-3/4 flex justify-center order-1 lg:order-2">
                    <ChessBoard 
                        board={board}
                        onMove={handleHumanMove}
                        currentPlayer={currentPlayer}
                        selectedSquare={selectedSquare}
                        setSelectedSquare={setSelectedSquare}
                        mode={mode}
                    />
                </div>

            </div>
            
            <footer className="mt-8 text-gray-500 text-sm">
                Powered by React & Tailwind. Multiplayer/AI Depth Simulated.
            </footer>
        </div>
    );
}