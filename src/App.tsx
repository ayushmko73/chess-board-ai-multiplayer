import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Users, Cpu, Swords, Settings, Loader2, Zap, CheckCircle } from 'lucide-react';
import { supabase, MOCK_USER_ID, MOCK_USERNAME } from './lib/supabaseClient';

// --- Type Definitions ---

type GameMode = 'LOCAL_2P' | 'AI' | 'MULTIPLAYER' | 'IDLE';
type AIDifficulty = 'Beginner' | 'Easy' | 'Hard' | 'Master';
type PlayerColor = 'w' | 'b';

interface GameState {
  board: string; // Simplified FEN-like string or internal representation
  turn: PlayerColor;
  status: 'playing' | 'checkmate' | 'stalemate' | 'draw';
}

interface LobbyGame {
    id: string;
    status: 'waiting' | 'playing';
    player_w: string; // User ID
    player_b: string | null; // User ID or null if waiting
    created_at: string;
}

// --- Chess Constants & Mock Logic ---
// In a real application, this would use a library like chess.js

const INITIAL_BOARD_STATE = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const PIECE_MAP: { [key: string]: React.FC<any> } = {
  'K': Swords, 'Q': Zap, 'R': Settings, 'B': CheckCircle, 'N': Cpu, 'P': Users, 
  'k': Swords, 'q': Zap, 'r': Settings, 'b': CheckCircle, 'n': Cpu, 'p': Users
};

const getPieceIcon = (pieceChar: string) => {
    if (!pieceChar || pieceChar === '.') return null;
    const IconComponent = PIECE_MAP[pieceChar];
    const isBlack = pieceChar === pieceChar.toLowerCase();
    return IconComponent ? {
        Icon: IconComponent,
        color: isBlack ? 'text-gray-800' : 'text-white'
    } : null;
};

// Mock function to simulate legal moves based on board state
const mockGetLegalMoves = (board: string, turn: PlayerColor): string[] => {
    // Extremely simplified mock: always suggest moving the piece on square e2 or e7 if it exists
    if (board.includes('P') && turn === 'w') return ['e2e3', 'e2e4'];
    if (board.includes('p') && turn === 'b') return ['e7e6', 'e7e5'];
    return []; // No moves found
};

// Mock function to apply a move
const mockApplyMove = (board: string, move: string): GameState => {
    // In a real scenario, this applies the move from algebraic notation (e.g., 'e2e4')
    // For simulation, we just switch turns and maintain the board string unless it's multiplayer.
    const newTurn: PlayerColor = board.includes('w') ? 'b' : 'w';
    // Simple board flip for visual change in local modes only (since we can't calculate new FEN easily)
    const newBoard = board.includes('w') ? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1' : INITIAL_BOARD_STATE;
    
    return { 
        board: newBoard, // Keep placeholder/initial state for local simulation consistency
        turn: newTurn,
        status: 'playing'
    };
};

// --- AI Logic (Highly Simplified) ---
const getAIMove = (difficulty: AIDifficulty, boardState: GameState): Promise<string> => {
    const legalMoves = mockGetLegalMoves(boardState.board, boardState.turn);
    
    let thinkingTime = 500; // Base time

    switch (difficulty) {
        case 'Beginner': thinkingTime = 200; break;
        case 'Easy': thinkingTime = 800; break;
        case 'Hard': thinkingTime = 1500; break;
        case 'Master': thinkingTime = 2500; break;
    }

    return new Promise((resolve) => {
        setTimeout(() => {
            if (legalMoves.length > 0) {
                // Master/Hard might pick the best move, but here we pick randomly.
                const randomIndex = Math.floor(Math.random() * legalMoves.length);
                resolve(legalMoves[randomIndex]);
            } else {
                resolve(''); // Indicates resignation or stalemate
            }
        }, thinkingTime);
    });
};


// --- Components ---

interface SquareProps {
    coord: string; // e.g., 'a1', 'h8'
    pieceChar: string;
    isLight: boolean;
    isSelected: boolean;
    isPossibleMove: boolean;
    onSelect: (coord: string) => void;
}

const Square: React.FC<SquareProps> = ({ coord, pieceChar, isLight, isSelected, isPossibleMove, onSelect }) => {
    const bgColor = isLight ? 'bg-amber-100' : 'bg-amber-700';
    let selectionClass = '';

    if (isSelected) {
        selectionClass = 'ring-4 ring-blue-500 ring-inset shadow-lg';
    } else if (isPossibleMove) {
        selectionClass = 'bg-green-300/70 hover:bg-green-400 transition duration-150';
    }

    const pieceInfo = getPieceIcon(pieceChar);

    return (
        <div 
            className={`w-full h-full flex items-center justify-center cursor-pointer text-4xl font-bold relative ${bgColor} ${selectionClass}`}
            onClick={() => onSelect(coord)}
        >
            {pieceInfo && (
                <pieceInfo.Icon className={`w-10 h-10 drop-shadow-md ${pieceInfo.color}`} />
            )}
            {isPossibleMove && !isSelected && (
                <div className={`absolute w-3 h-3 rounded-full ${pieceChar === '.' ? 'bg-blue-500/60' : 'bg-blue-700/70'}`} />
            )}
            {/* Coordinates for debugging/visual aid */}
            <span className={`absolute bottom-0 right-0 text-[8px] p-[1px] opacity-50 ${isLight ? 'text-gray-800' : 'text-white'}`}>{coord}</span>
        </div>
    );
};

interface ChessBoardProps {
    gameState: GameState;
    myColor: PlayerColor;
    onMoveAttempt: (from: string, to: string) => void;
}

const ChessBoardComponent: React.FC<ChessBoardProps> = ({ gameState, myColor, onMoveAttempt }) => {
    const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
    
    // Mock Legal Moves for visualization (assuming current turn matches user's color or AI is not playing)
    const legalMoves = useMemo(() => {
        if (gameState.status !== 'playing') return [];
        
        // In multiplayer/local 2P, selection is only relevant if it's the current player's turn
        if (myColor === gameState.turn) {
             // In a real app, we fetch moves relevant to the selected square
             // For this simulation, we just return placeholder moves for UI feedback
             if (selectedSquare) return ['e2e3', 'e2e4']; // Hardcoded visual feedback
        }
        return [];
    }, [selectedSquare, gameState.turn, gameState.status, myColor]);

    const handleSquareClick = useCallback((coord: string) => {
        if (gameState.status !== 'playing' || gameState.turn !== myColor) return; // Not my turn or game over

        if (selectedSquare === coord) {
            setSelectedSquare(null); // Deselect
        } else if (selectedSquare) {
            // Attempt move
            onMoveAttempt(selectedSquare, coord);
            setSelectedSquare(null); // Reset selection after attempt
        } else {
            // Select square, only if it contains a piece matching the current turn color
            // Since we don't parse FEN, we skip piece check, allowing user to select anything for mock interaction
            setSelectedSquare(coord);
        }
    }, [selectedSquare, gameState.turn, myColor, onMoveAttempt]);

    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    
    // Mock board state parsing (since we aren't parsing FEN properly)
    // We create a lookup map based on INITIAL_BOARD_STATE structure for visualization feedback
    const boardLookup: { [key: string]: string } = {};
    let pieceIndex = 0;
    const pieces = INITIAL_BOARD_STATE.split(' ')[0].split('/');
    pieces.forEach((rankStr, rIndex) => {
        let fileIndex = 0;
        for (let i = 0; i < rankStr.length; i++) {
            const char = rankStr[i];
            if (/[1-8]/.test(char)) {
                const emptyCount = parseInt(char);
                for (let j = 0; j < emptyCount; j++) {
                    boardLookup[files[fileIndex] + ranks[rIndex]] = '.';
                    fileIndex++;
                }
            } else {
                boardLookup[files[fileIndex] + ranks[rIndex]] = char;
                fileIndex++;
            }
        }
    });

    // Adjusting the visual board based on player color
    const displayRanks = myColor === 'w' ? ranks : [...ranks].reverse();
    const displayFiles = myColor === 'w' ? files : [...files].reverse();

    return (
        <div className="shadow-2xl border-8 border-gray-800 w-full aspect-square max-w-xl mx-auto">
            <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
                {displayRanks.map((rank, r) => (
                    displayFiles.map((file, f) => {
                        const coord = file + rank;
                        const isLight = (r + f) % 2 === 0;
                        
                        // Determine piece character based on visual orientation
                        // This is highly dependent on how the actual state mapping works. 
                        // For simplicity in this mock setup, we rely heavily on the INITIAL_BOARD_STATE lookup for the *visual layout*
                        const pieceChar = boardLookup[coord] || '.'; 
                        
                        const isSelected = selectedSquare === coord;
                        const isPossibleMove = legalMoves.includes(selectedSquare + coord);
                        
                        return (
                            <Square
                                key={coord}
                                coord={coord}
                                pieceChar={pieceChar} 
                                isLight={isLight}
                                isSelected={isSelected}
                                isPossibleMove={isPossibleMove}
                                onSelect={handleSquareClick}
                            />
                        );
                    })
                ))}
            </div>
        </div>
    );
};


// --- Game Setup Screens ---

interface ModeSelectionProps {
    setMode: (mode: GameMode) => void;
    setDifficulty: (diff: AIDifficulty) => void;
    setPlayerColor: (color: PlayerColor) => void;
    mode: GameMode;
}

const ModeSelection: React.FC<ModeSelectionProps> = ({ setMode, setDifficulty, setPlayerColor, mode }) => {
    const difficulties: AIDifficulty[] = ['Beginner', 'Easy', 'Hard', 'Master'];

    if (mode === 'IDLE') {
        return (
            <div className="p-6 bg-white shadow-xl rounded-lg w-full max-w-lg mx-auto">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Select Game Mode</h2>
                <div className="space-y-4">
                    <button 
                        className="w-full flex items-center justify-center p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        onClick={() => { setMode('LOCAL_2P'); setPlayerColor('w'); /* Start 2P game immediately */ }}
                    >
                        <Users className="w-5 h-5 mr-2" /> Play Local (2 Players)
                    </button>
                    <button 
                        className="w-full flex items-center justify-center p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                        onClick={() => { setMode('AI'); }}
                    >
                        <Cpu className="w-5 h-5 mr-2" /> Play vs AI
                    </button>
                    <button 
                        className="w-full flex items-center justify-center p-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                        onClick={() => { setMode('MULTIPLAYER'); }}
                    >
                        <Zap className="w-5 h-5 mr-2" /> Online Multiplayer (Supabase)
                    </button>
                </div>
            </div>
        );
    }

    if (mode === 'AI') {
        return (
            <div className="p-6 bg-white shadow-xl rounded-lg w-full max-w-lg mx-auto">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Configure AI Challenge</h2>
                
                <div className='mb-4'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Choose Difficulty</label>
                    <div className="grid grid-cols-2 gap-3">
                        {difficulties.map(diff => (
                            <button 
                                key={diff}
                                className={`p-3 rounded-lg border transition text-sm font-medium ${
                                    diff === 'Master' ? 'bg-red-100 border-red-500 text-red-800' :
                                    diff === 'Hard' ? 'bg-yellow-100 border-yellow-500 text-yellow-800' :
                                    'bg-gray-100 border-gray-300 text-gray-800'
                                } hover:ring-2 ring-offset-1`}
                                onClick={() => {
                                    setDifficulty(diff);
                                    setPlayerColor('w'); // Human always starts as White vs AI
                                    setMode('AI'); // Re-confirm mode to trigger game start
                                }}
                            >
                                {diff}
                            </button>
                        ))}
                    </div>
                </div>

                <div className='mb-6'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Play As</label>
                    <div className='flex space-x-4'>
                        <button onClick={() => setPlayerColor('w')} className={`flex-1 p-2 rounded-lg border ${'w' === 'w' ? 'bg-white ring-2 ring-blue-500' : 'bg-gray-50'}`}>White (Start)</button>
                        <button onClick={() => setPlayerColor('b')} className={`flex-1 p-2 rounded-lg border ${'b' === 'w' ? 'bg-white ring-2 ring-blue-500' : 'bg-gray-50'}`}>Black (Wait)</button>
                    </div>
                </div>

                <button 
                    className="w-full p-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                    onClick={() => setMode('IDLE')}
                >
                    Back
                </button>
            </div>
        );
    }

    if (mode === 'MULTIPLAYER') {
        return <MultiplayerLobby setMode={setMode} setPlayerColor={setPlayerColor} />
    }

    return null;
};


// --- Multiplayer Component (Supabase Realtime Mock) ---

interface MultiplayerLobbyProps {
    setMode: (mode: GameMode) => void;
    setPlayerColor: (color: PlayerColor) => void;
}

const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({ setMode, setPlayerColor }) => {
    const [lobbyGames, setLobbyGames] = useState<LobbyGame[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    
    const fetchGames = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch active games where player_b is null (waiting for opponent)
            const { data, error } = await supabase
                .from('games')
                .select('*')
                .eq('status', 'waiting') as { data: LobbyGame[] | null, error: any };
            
            if (error) throw error;
            setLobbyGames(data || []);
        } catch (e) {
            console.error("Error fetching lobby games:", e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGames();
        
        // Setup Realtime Listener for new/updated games
        const channel = supabase.channel('public:games').on(
            'postgres_changes', 
            { event: '*', schema: 'public', table: 'games', filter: `status=eq.waiting` }, 
            (payload) => {
                // Simple update mechanism: refetch or update list based on payload type
                console.log('Lobby update received:', payload);
                fetchGames(); 
            }
        );

        channel.subscribe(async (status, err) => {
            if (status === 'SUBSCRIBED') {
                console.log("Realtime channel subscribed for lobby.");
                await fetchGames(); // Initial fetch upon subscription confirmation
            } else if (err) {
                console.error("Subscription error:", err);
            }
        });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchGames]);


    const createGame = async () => {
        setIsCreating(true);
        // In a real app, we'd use UUIDs. Using mock ID here.
        const gameId = `room-${Date.now()}`;

        const { error } = await supabase
            .from('games')
            .insert([{ 
                id: gameId,
                status: 'waiting',
                player_w: MOCK_USER_ID,
                player_b: null
            }]);
        
        if (!error) {
            // Automatically join as White, triggering state change via realtime listener
            setPlayerColor('w');
            setMode('MULTIPLAYER'); // Transition to game view (which will handle the room state)
        } else {
            console.error("Error creating game:", error);
        }
        setIsCreating(false);
    };

    const joinGame = async (game: LobbyGame, playerColor: PlayerColor) => {
        if (playerColor === 'w') return; // Should only join as Black if White exists

        const { error } = await supabase
            .from('games')
            .update({ player_b: MOCK_USER_ID, status: 'playing' }) // Set status to playing instantly upon joining
            .eq('id', game.id);
        
        if (!error) {
            setPlayerColor('b');
            setMode('MULTIPLAYER'); // Transition to game view
        } else {
            console.error("Error joining game:", error);
            alert("Could not join game. It might have started or been cancelled.");
            fetchGames();
        }
    };

    return (
        <div className="p-6 bg-white shadow-xl rounded-lg w-full max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center"><Zap className='w-6 h-6 mr-2'/> Online Multiplayer Lobby</h2>
            
            <button 
                className={`w-full p-3 mb-6 rounded-lg font-semibold transition flex items-center justify-center ${
                    isCreating ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'
                }`}
                onClick={createGame}
                disabled={isCreating}
            >
                {isCreating ? (<><Loader2 className='w-5 h-5 mr-2 animate-spin'/> Creating Room...</>) : "+ Create New Game (Start as White)"}
            </button>

            <h3 className='text-lg font-semibold mb-2'>Available Games ({lobbyGames.length})</h3>
            
            {isLoading ? (
                <div className='text-center py-8'><Loader2 className='w-6 h-6 mx-auto animate-spin mb-2'/> Loading Lobby...</div>
            ) : lobbyGames.length === 0 ? (
                <p className='text-center text-gray-500 py-8'>No games currently waiting for an opponent. Create one!</p>
            ) : (
                <div className='space-y-3 max-h-80 overflow-y-auto pr-2'>
                    {lobbyGames.map(game => (
                        <div key={game.id} className='flex justify-between items-center p-3 border rounded-lg bg-gray-50'>
                            <span className='font-mono text-sm'>{game.id}</span>
                            <div className='flex items-center space-x-3 text-sm'>
                                <span className='text-gray-600'>White: {game.player_w.substring(0, 6)}...</span>
                                
                                {game.player_b === null ? (
                                    <button 
                                        className='px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600'
                                        onClick={() => joinGame(game, 'b')}
                                    >
                                        Join as Black
                                    </button>
                                ) : (
                                    <span className='text-xs text-green-600 font-medium'>In Progress (Remote state sync pending)</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <button 
                className="mt-6 w-full p-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                onClick={() => setMode('IDLE')}
            >
                Back to Menu
            </button>
        </div>
    );
};


// --- Main Application Component ---

export default function App() {
    const [mode, setMode] = useState<GameMode>('IDLE');
    const [difficulty, setDifficulty] = useState<AIDifficulty | null>(null);
    const [playerColor, setPlayerColor] = useState<PlayerColor>('w');
    
    // Game State (Simplified: Note: Actual FEN management is omitted)
    const [gameState, setGameState] = useState<GameState>({
        board: INITIAL_BOARD_STATE, 
        turn: 'w',
        status: 'playing'
    });
    const [selectedSquare, setSelectedSquare] = useState<string | null>(null); // Used for UI selection management
    const [gameLog, setGameLog] = useState<string[]>([]);
    const [gameId, setGameId] = useState<string | null>(null); // For multiplayer room tracking

    const resetGame = useCallback(() => {
        setGameState({ board: INITIAL_BOARD_STATE, turn: 'w', status: 'playing' });
        setSelectedSquare(null);
        setGameLog([]);
        setDifficulty(null);
        setGameId(null);
        setMode('IDLE');
    }, []);

    // --- Game Loop Handlers ---

    const handleMoveAttempt = useCallback(async (from: string, to: string) => {
        if (gameState.turn !== playerColor && mode !== 'LOCAL_2P') return; // Not current player's turn

        let newTurn: PlayerColor;
        let nextBoardState: string;
        let moveNotation = `${from}-${to}`;

        // --- 1. Apply Move (Simulated) ---
        if (mode === 'LOCAL_2P') {
            const result = mockApplyMove(gameState.board, moveNotation);
            setGameState(result);
            newTurn = result.turn;
            nextBoardState = result.board; // Use simulated new board or keep current for UI consistency
            setGameLog(prev => [...prev, `${gameState.turn === 'w' ? 'W' : 'B'}: ${moveNotation}`]);
        } else if (mode === 'AI' && gameState.turn === playerColor) {
            // Human moves
            const result = mockApplyMove(gameState.board, moveNotation);
            setGameState(result);
            newTurn = result.turn;
            nextBoardState = result.board;
            setGameLog(prev => [...prev, `Human (W): ${moveNotation}`]);
            
            // Trigger AI turn immediately after human move
            if (newTurn === 'b') {
                const aiMove = await getAIMove(difficulty!, { board: result.board, turn: 'b', status: 'playing' });
                if (aiMove) {
                    const aiResult = mockApplyMove(result.board, aiMove);
                    setGameState(aiResult);
                    setGameLog(prev => [...prev, `AI (B): ${aiMove}`]);
                }
            }
        } else if (mode === 'MULTIPLAYER' && gameId) {
            // In a real scenario: Send move to Supabase/Server
            // For simulation, we just switch turn locally and assume sync happens
            const result = mockApplyMove(gameState.board, moveNotation);
            setGameState(result);
            newTurn = result.turn;
            nextBoardState = result.board;
            setGameLog(prev => [...prev, `Move: ${moveNotation}`]);
            
            // We would push the move to the 'games' table via supabase.from('games').update({ last_move: moveNotation }).eq('id', gameId)
            // The opponent's listener updates their local state.
        }
        
    }, [gameState, playerColor, mode, difficulty, gameId]);

    // --- AI Turn Effect Hook ---
    useEffect(() => {
        if (mode === 'AI' && gameState.turn === 'b' && difficulty) {
            const triggerAIMove = async () => {
                const aiMove = await getAIMove(difficulty, gameState);
                if (aiMove) {
                    // Note: We call handleMoveAttempt again, but since the turn is 'b', 
                    // it skips the human check and proceeds to the AI block logic.
                    handleMoveAttempt('SimulatedFrom', aiMove); 
                } else {
                     setGameState(prev => ({...prev, status: 'stalemate'}));
                     setGameLog(prev => [...prev, "AI cannot move. Stalemate or Checkmate detected."]);
                }
            };
            triggerAIMove();
        }
    }, [mode, gameState.turn, difficulty, handleMoveAttempt]);

    // --- Render Logic ---

    let ContentComponent = null;
    let gameActive = false;

    if (mode === 'IDLE' || mode === 'AI' && !difficulty || mode === 'MULTIPLAYER' && lobbyGames.length === 0 && !gameId) {
        ContentComponent = <ModeSelection 
            setMode={setMode} 
            setDifficulty={setDifficulty} 
            setPlayerColor={setPlayerColor}
            mode={mode}
        />;
    } else if (mode === 'LOCAL_2P' || (mode === 'AI' && difficulty) || (mode === 'MULTIPLAYER' && gameId)) {
        gameActive = true;
        
        const opponentName = mode === 'LOCAL_2P' ? (playerColor === 'w' ? 'Black Player' : 'White Player') :
                             mode === 'AI' ? `${difficulty} AI` : 
                             'Remote Opponent';

        ContentComponent = (
            <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl mx-auto p-4">
                <div className="lg:w-2/3 w-full">
                    <h1 className='text-3xl font-bold mb-4 text-gray-800'>{mode === 'LOCAL_2P' ? '2 Player Local Game' : mode === 'AI' ? `Vs ${difficulty} AI` : `Multiplayer Room: ${gameId || 'Connecting...'}` }</h1>
                    
                    <div className='flex justify-between items-center mb-4 p-3 bg-gray-100 rounded-lg'>
                        <p className='text-lg font-semibold'>Turn: {gameState.turn === 'w' ? 'White' : 'Black'}</p>
                        <p className='text-sm text-gray-600'>Playing as: {playerColor === 'w' ? 'White' : 'Black'}</p>
                    </div>

                    <ChessBoardComponent 
                        gameState={gameState} 
                        myColor={playerColor}
                        onMoveAttempt={handleMoveAttempt}
                    />
                    
                    {gameState.status !== 'playing' && (
                        <div className={`mt-4 p-3 rounded-lg text-center font-bold text-white ${gameState.status === 'checkmate' ? 'bg-red-500' : 'bg-yellow-500'}`}>
                            Game Over! {gameState.status.toUpperCase()}. 
                        </div>
                    )}

                    <button 
                        className="mt-4 p-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                        onClick={resetGame}
                    >
                        End Game & Return to Menu
                    </button>

                </div>
                
                {/* Sidebar for Log / Settings */}
                <div className="lg:w-1/3 w-full bg-white p-4 shadow-lg rounded-lg">
                    <h3 className='text-xl font-semibold mb-3 border-b pb-2'>Game Log</h3>
                    <div className='h-64 overflow-y-auto space-y-1 bg-gray-50 p-2 rounded text-sm font-mono'>
                        {gameLog.length === 0 && <p className='text-gray-400'>No moves recorded yet.</p>}
                        {gameLog.slice(-20).map((log, index) => (
                            <p key={index} className={`whitespace-nowrap ${log.startsWith('AI') ? 'text-purple-700' : log.startsWith('Human') ? 'text-blue-700' : 'text-gray-800'}`}>
                                {log}
                            </p>
                        ))}
                    </div>
                    
                    <h3 className='text-xl font-semibold mt-4 mb-3 border-b pb-2'>Game Info</h3>
                    <p>Opponent: <span className='font-medium'>{opponentName}</span></p>
                    {mode === 'AI' && <p>Difficulty: <span className='font-medium text-red-600'>{difficulty}</span></p>}
                    
                    <button 
                        className="mt-4 w-full p-2 border border-gray-300 rounded hover:bg-gray-100 transition text-sm"
                        onClick={() => { /* Implement resign logic */ alert("Resign functionality simulated."); resetGame(); }}
                    >
                        Resign Game
                    </button>
                </div>
            </div>
        );
    } else if (mode === 'AI' && !difficulty) {
        // Should transition back to mode selection if AI selected without difficulty
        ContentComponent = <ModeSelection setMode={setMode} setDifficulty={setDifficulty} setPlayerColor={setPlayerColor} mode={'AI'} />
    } else if (mode === 'MULTIPLAYER' && !gameId) {
         // This block handles the lobby view transition
         ContentComponent = <MultiplayerLobby setMode={setMode} setPlayerColor={setPlayerColor} />
    }


    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
            <header className='text-center mb-8'>
                <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">React Chess Engine</h1>
                <p className='text-gray-500 mt-1'>Full Stack Application Showcase</p>
            </header>
            
            {ContentComponent}
        </div>
    );
}