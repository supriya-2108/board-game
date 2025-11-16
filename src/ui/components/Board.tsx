import React from 'react';
import { BoardState, Position, Piece } from '../../types';
import Square from './Square';
import './Board.css';

interface BoardProps {
  boardState: BoardState;
  onSquareClick?: (position: Position) => void;
  onPieceDragStart?: (piece: Piece) => void;
  onPieceDragEnd?: () => void;
  onSquareDrop?: (position: Position) => void;
  selectedPiece?: Piece | null;
  validMoves?: Position[];
  flipBoard?: boolean;
}

const Board: React.FC<BoardProps> = ({
  boardState,
  onSquareClick,
  onPieceDragStart,
  onPieceDragEnd,
  onSquareDrop,
  selectedPiece,
  validMoves = [],
  flipBoard = false,
}) => {
  const renderSquare = (row: number, col: number) => {
    const position: Position = { row, col };
    const piece = boardState.pieces.find(
      (p) => p.position.row === row && p.position.col === col
    );
    
    const isValidMove = validMoves.some(
      (move) => move.row === row && move.col === col
    );
    
    const isSelected = selectedPiece?.position.row === row && 
                       selectedPiece?.position.col === col;

    return (
      <Square
        key={`${row}-${col}`}
        position={position}
        piece={piece}
        isLight={(row + col) % 2 === 0}
        isValidMove={isValidMove}
        isSelected={isSelected}
        onClick={onSquareClick}
        onPieceDragStart={onPieceDragStart}
        onPieceDragEnd={onPieceDragEnd}
        onDrop={onSquareDrop}
      />
    );
  };

  const renderBoard = () => {
    const rows = [];
    const rowRange = flipBoard ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
    const colRange = flipBoard ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];

    for (const row of rowRange) {
      const squares = [];
      for (const col of colRange) {
        squares.push(renderSquare(row, col));
      }
      rows.push(
        <div key={row} className="board-row">
          {squares}
        </div>
      );
    }
    return rows;
  };

  return (
    <div className="board-container">
      <div className="board">{renderBoard()}</div>
    </div>
  );
};

export default Board;
