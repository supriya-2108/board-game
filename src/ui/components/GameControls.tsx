import React from 'react';
import { GameMode, Difficulty, Player, GameStatus } from '../../types';
import './GameControls.css';

interface GameControlsProps {
  gameMode: GameMode;
  difficulty: Difficulty;
  currentPlayer: Player;
  gameStatus: GameStatus;
  resourcePoints: { [Player.PLAYER_1]: number; [Player.PLAYER_2]: number };
  playerNames: { [Player.PLAYER_1]: string; [Player.PLAYER_2]: string };
  onModeChange: (mode: GameMode) => void;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onNewGame: () => void;
  onRestart: () => void;
  onOpenSettings?: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  gameMode,
  difficulty,
  currentPlayer,
  gameStatus,
  resourcePoints,
  playerNames,
  onModeChange,
  onDifficultyChange,
  onNewGame,
  onRestart,
  onOpenSettings,
}) => {
  const getStatusMessage = () => {
    switch (gameStatus) {
      case GameStatus.PLAYER_1_WIN:
        return `${playerNames[Player.PLAYER_1]} Wins!`;
      case GameStatus.PLAYER_2_WIN:
        return `${playerNames[Player.PLAYER_2]} Wins!`;
      case GameStatus.DRAW:
        return 'Draw!';
      default:
        return `Current Player: ${playerNames[currentPlayer]}`;
    }
  };

  return (
    <div className="game-controls">
      <div className="controls-header">
        <h2>Strategic Board Game</h2>
        {onOpenSettings && (
          <button className="settings-icon" onClick={onOpenSettings} title="Profile Settings">
            ⚙️
          </button>
        )}
      </div>

      <div className="game-status">
        <div className={`status-message ${gameStatus !== GameStatus.IN_PROGRESS ? 'game-over' : ''}`}>
          {getStatusMessage()}
        </div>
      </div>

      <div className="resource-display">
        <div className="resource-item">
          <span className="resource-label">{playerNames[Player.PLAYER_1]} Resources:</span>
          <span className="resource-value">{resourcePoints[Player.PLAYER_1]}</span>
        </div>
        <div className="resource-item">
          <span className="resource-label">{playerNames[Player.PLAYER_2]} Resources:</span>
          <span className="resource-value">{resourcePoints[Player.PLAYER_2]}</span>
        </div>
      </div>

      <div className="control-group">
        <label>Game Mode:</label>
        <div className="segmented-control">
          <button
            className={`segmented-option ${gameMode === GameMode.PVP ? 'active' : ''}`}
            onClick={() => onModeChange(GameMode.PVP)}
          >
            PvP
          </button>
          <button
            className={`segmented-option ${gameMode === GameMode.AI ? 'active' : ''}`}
            onClick={() => onModeChange(GameMode.AI)}
          >
            vs AI
          </button>
        </div>
      </div>

      {gameMode === GameMode.AI && (
        <div className="control-group">
          <label>Difficulty:</label>
          <div className="segmented-control">
            <button
              className={`segmented-option ${difficulty === Difficulty.EASY ? 'active' : ''}`}
              onClick={() => onDifficultyChange(Difficulty.EASY)}
            >
              Easy
            </button>
            <button
              className={`segmented-option ${difficulty === Difficulty.HARD ? 'active' : ''}`}
              onClick={() => onDifficultyChange(Difficulty.HARD)}
            >
              Hard
            </button>
          </div>
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
