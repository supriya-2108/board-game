import React from 'react';
import { Position, Piece } from '../../types';
import PieceComponent from './PieceComponent';
import './Square.css';

interface SquareProps {
  position: Position;
  piece?: Piece;
  isLight: boolean;
  isValidMove: boolean;
  isSelected: boolean;
  onClick?: (position: Position) => void;
  onPieceDragStart?: (piece: Piece) => void;
  onPieceDragEnd?: () => void;
  onDrop?: (position: Position) => void;
}

const Square: React.FC<SquareProps> = ({
  position,
  piece,
  isLight,
  isValidMove,
  isSelected,
  onClick,
  onPieceDragStart,
  onPieceDragEnd,
  onDrop,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(position);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (onDrop) {
      onDrop(position);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!e.changedTouches[0]) return;
    
    const touch = e.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (element && element.classList.contains('square')) {
      const row = parseInt(element.getAttribute('data-row') || '0');
      const col = parseInt(element.getAttribute('data-col') || '0');
      if (onDrop && row && col) {
        onDrop({ row, col });
      }
    }
  };

  const squareClass = `square ${isLight ? 'light' : 'dark'} ${
    isValidMove ? 'valid-move' : ''
  } ${isSelected ? 'selected' : ''}`;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Allow Enter or Space to activate square
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={squareClass}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      data-row={position.row}
      data-col={position.col}
      tabIndex={0}
      role="button"
      aria-label={`Square at row ${position.row}, column ${position.col}${piece ? `, contains ${piece.type}` : ''}${isValidMove ? ', valid move' : ''}${isSelected ? ', selected' : ''}`}
    >
      {piece && (
        <PieceComponent
          piece={piece}
          onDragStart={onPieceDragStart}
          onDragEnd={onPieceDragEnd}
        />
      )}
      {isValidMove && <div className="move-indicator" />}
    </div>
  );
};

export default Square;
