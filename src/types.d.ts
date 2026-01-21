export type GameMode = 'local' | 'ai' | 'multiplayer';
export type Difficulty = 'Beginner' | 'Easy' | 'Hard' | 'Master';

// Simplified piece representation: [Color][Type]
// wP=White Pawn, bK=Black King, etc.
export type Piece = 'wP' | 'wN' | 'wB' | 'wR' | 'wQ' | 'wK' | 'bP' | 'bN' | 'bB' | 'bR' | 'bQ' | 'bK' | null;

export type BoardState = Piece[][];

export interface Move {
    from: { row: number, col: number };
    to: { row: number, col: number };
    piece: Piece;
}