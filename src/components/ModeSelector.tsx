import React from 'react';
import { Gamepad2, Cpu, Users, ChevronDown } from 'lucide-react';
import { GameMode, Difficulty } from '../types';

interface SelectorProps {
  mode: GameMode;
  setMode: (mode: GameMode) => void;
  difficulty: Difficulty;
  setDifficulty: (diff: Difficulty) => void;
  isGameActive: boolean;
}

const DIFFICULTY_LEVELS: Difficulty[] = ['Beginner', 'Easy', 'Hard', 'Master'];

export default function ModeSelector({
  mode,
  setMode,
  difficulty,
  setDifficulty,
  isGameActive
}: SelectorProps) {
  const [showDifficulty, setShowDifficulty] = React.useState(false);

  if (isGameActive) return null;

  const baseClasses = "p-3 transition duration-300 rounded-lg flex items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg";

  return (
    <div className="flex flex-col gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-2">Select Game Mode</h2>
      
      {/* Mode Selection */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setMode('local')}
          className={`${baseClasses} ${mode === 'local' ? 'bg-green-500 text-white scale-[1.02]' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}`}
          disabled={isGameActive}
        >
          <Gamepad2 className="w-5 h-5" /> 2 Player
        </button>
        <button
          onClick={() => setMode('ai')}
          className={`${baseClasses} ${mode === 'ai' ? 'bg-indigo-500 text-white scale-[1.02]' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}`}
          disabled={isGameActive}
        >
          <Cpu className="w-5 h-5" /> Vs AI
        </button>
        <button
          onClick={() => setMode('multiplayer')}
          className={`${baseClasses} ${mode === 'multiplayer' ? 'bg-amber-500 text-white scale-[1.02]' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}`}
          disabled={isGameActive}
        >
          <Users className="w-5 h-5" /> Online
        </button>
      </div>

      {/* AI Difficulty Selector (Only visible if mode is AI) */}
      {mode === 'ai' && (
        <div className="mt-4 relative">
          <button
            onClick={() => setShowDifficulty(!showDifficulty)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg flex justify-between items-center transition duration-200 shadow-md"
          >
            Difficulty: {difficulty}
            <ChevronDown className={`w-5 h-5 transition-transform ${showDifficulty ? 'rotate-180' : 'rotate-0'}`} />
          </button>
          {showDifficulty && (
            <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-indigo-500 rounded-lg shadow-xl">
              {DIFFICULTY_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    setDifficulty(level);
                    setShowDifficulty(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-indigo-600 hover:text-white transition duration-150"
                >
                  {level}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Multiplayer Placeholder */}
      {mode === 'multiplayer' && (
        <div className="mt-4 p-3 bg-amber-900/50 border border-amber-500 rounded-lg text-sm text-amber-200">
          Multiplayer Mode selected. Requires Supabase connection and room logic to implement actual gameplay.
        </div>
      )}
    </div>
  );
}