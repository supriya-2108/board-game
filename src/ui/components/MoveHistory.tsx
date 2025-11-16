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
    <div className={`move-history ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="move-history-header">
        <h3>Move History</h3>
        <button className="collapse-button" onClick={toggleCollapse}>
          {isCollapsed ? '▼' : '▲'}
        </button>
      </div>

      {!isCollapsed && (
        <>
          <div className="move-list">
            {moves.length === 0 ? (
              <div className="no-moves">No moves yet</div>
            ) : (
              moves.map((move, index) => (
                <div
                  key={index}
                  className="move-item"
                  onClick={() => onMoveClick && onMoveClick(index)}
                >
                  {formatMove(move, index)}
                </div>
              ))
            )}
          </div>

          {moves.length > 0 && (
            <div className="undo-controls">
              <label htmlFor="undo-count">Undo moves:</label>
              <select
                id="undo-count"
                value={undoCount}
                onChange={(e) => setUndoCount(Number(e.target.value))}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
              <button onClick={handleUndo} className="undo-button">
                Undo
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MoveHistory;
