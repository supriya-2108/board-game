import React, { useState } from 'react';
import { Move, PieceType, Player } from '../../types';
import './MoveHistory.css';

interface MoveHistoryProps {
  moves: Move[];
  playerNames: { [Player.PLAYER_1]: string; [Player.PLAYER_2]: string };
  onMoveClick?: (moveIndex: number) => void;
  onUndo?: (count: number) => void;
}

const MoveHistory: React.FC<MoveHistoryProps> = ({
  moves,
  playerNames,
  onMoveClick,
  onUndo,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [undoCount, setUndoCount] = useState(1);

  const formatMove = (move: Move, index: number): string => {
    const player = playerNames[move.piece.owner];
    const pieceType = getPieceTypeName(move.piece.type);
    const from = positionToNotation(move.from);
    const to = positionToNotation(move.to);
    const capture = move.capturedPiece ? ' (capture)' : '';
    const upgrade = move.isUpgrade ? ' (upgrade)' : '';
    
    return `${index + 1}. ${player}: ${pieceType} ${from}→${to}${capture}${upgrade}`;
  };

  const getPieceTypeName = (type: PieceType): string => {
    switch (type) {
      case PieceType.PAWN:
        return 'Pawn';
      case PieceType.KNIGHT:
        return 'Knight';
      case PieceType.BISHOP:
        return 'Bishop';
      case PieceType.QUEEN:
        return 'Queen';
    }
  };

  const positionToNotation = (pos: { row: number; col: number }): string => {
    const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    return `${cols[pos.col - 1]}${pos.row}`;
  };

  const handleUndo = () => {
    if (onUndo && moves.length > 0) {
      const count = Math.min(undoCount, moves.length, 3);
      onUndo(count);
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside 
      className={`move-history ${isCollapsed ? 'collapsed' : ''}`}
      aria-label="Move history"
      role="complementary"
    >
      <div className="move-history-header">
        <h3>Move History</h3>
        <button 
          className="collapse-button" 
          onClick={toggleCollapse}
          aria-label={isCollapsed ? 'Expand move history' : 'Collapse move history'}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? '▼' : '▲'}
        </button>
      </div>

      {!isCollapsed && (
        <>
          <div 
            className="move-list" 
            role="list"
            aria-label="List of moves"
          >
            {moves.length === 0 ? (
              <div className="no-moves" role="status">No moves yet</div>
            ) : (
              moves.map((move, index) => (
                <div
                  key={index}
                  className={`move-item player-${move.piece.owner}`}
                  onClick={() => onMoveClick && onMoveClick(index)}
                  role="listitem"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && onMoveClick) {
                      e.preventDefault();
                      onMoveClick(index);
                    }
                  }}
                  aria-label={formatMove(move, index)}
                >
                  {formatMove(move, index)}
                </div>
              ))
            )}
          </div>

          {moves.length > 0 && (
            <div className="undo-controls" role="group" aria-label="Undo controls">
              <label htmlFor="undo-count">Undo moves:</label>
              <select
                id="undo-count"
                value={undoCount}
                onChange={(e) => setUndoCount(Number(e.target.value))}
                aria-label="Select number of moves to undo"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
              <button 
                onClick={handleUndo} 
                className="undo-button"
                aria-label={`Undo last ${undoCount} move${undoCount > 1 ? 's' : ''} (Keyboard shortcut: U)`}
              >
                Undo
              </button>
            </div>
          )}
        </>
      )}
    </aside>
  );
};

export default MoveHistory;
