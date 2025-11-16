import React from 'react';
import { GameMode, Difficulty, Player, GameStatus } from '../../types';
import './GameControls.css';

interface GameControlsProps {
  gameMode: GameMode;
  difficulty: Difficulty;
  currentPlayer: Player;
  gameStatus: GameStatus;
  resourcePoints: { [Player.PLAYER_1]: number; [Player.PLAYER_2]: number };
  onModeChange: (mode: GameMode) => void;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onNewGame: () => void;
  onRestart: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  gameMode,
  difficulty,
  currentPlayer,
  gameStatus,
  resourcePoints,
  onModeChange,
  onDifficultyChange,
  onNewGame,
  onRestart,
}) => {
  const getStatusMessage = () => {
    switch (gameStatus) {
      case GameStatus.PLAYER_1_WIN:
        return 'Player 1 Wins!';
      case GameStatus.PLAYER_2_WIN:
        return 'Player 2 Wins!';
      case GameStatus.DRAW:
        return 'Draw!';
      default:
        return `Current Player: Player ${currentPlayer}`;
    }
  };

  return (
    <div className="game-controls">
      <div className="controls-header">
        <h2>Strategic Board Game</h2>
      </div>

      <div className="game-status">
        <div className={`status-message ${gameStatus !== GameStatus.IN_PROGRESS ? 'game-over' : ''}`}>
          {getStatusMessage()}
        </div>
      </div>

      <div className="resource-display">
        <div className="resource-item">
          <span className="resource-label">Player 1 Resources:</span>
          <span className="resource-value">{resourcePoints[Player.PLAYER_1]}</span>
        </div>
        <div className="resource-item">
          <span className="resource-label">Player 2 Resources:</span>
          <span className="resource-value">{resourcePoints[Player.PLAYER_2]}</span>
        </div>
      </div>

      <div className="control-group">
        <label htmlFor="game-mode">Game Mode:</label>
        <select
          id="game-mode"
          value={gameMode}
          onChange={(e) => onModeChange(e.target.value as GameMode)}
        >
          <option value={GameMode.PVP}>Player vs Player</option>
          <option value={GameMode.AI}>Player vs AI</option>
        </select>
      </div>

      {gameMode === GameMode.AI && (
        <div className="control-group">
          <label htmlFor="difficulty">Difficulty:</label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => onDifficultyChange(e.target.value as Difficulty)}
          >
            <option value={Difficulty.EASY}>Easy</option>
            <option value={Difficulty.HARD}>Hard</option>
          </select>
        </div>
      )}

      <div className="button-group">
        <button onClick={onNewGame} className="control-button">
          New Game
        </button>
        <button onClick={onRestart} className="control-button">
          Restart
        </button>
      </div>
    </div>
  );
};

export default GameControls;
