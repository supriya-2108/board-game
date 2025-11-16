import React from 'react';
import { Piece, PieceType, Player } from '../../types';
import './PieceComponent.css';

interface PieceComponentProps {
  piece: Piece;
  onDragStart?: (piece: Piece) => void;
  onDragEnd?: () => void;
}

const PieceComponent: React.FC<PieceComponentProps> = ({
  piece,
  onDragStart,
  onDragEnd,
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(piece);
    }
  };

  const handleDragEnd = () => {
    if (onDragEnd) {
      onDragEnd();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (onDragStart) {
      onDragStart(piece);
    }
  };

  const getPieceSymbol = (type: PieceType, owner: Player): string => {
    const symbols = {
      [PieceType.PAWN]: owner === Player.PLAYER_1 ? '♙' : '♟',
      [PieceType.KNIGHT]: owner === Player.PLAYER_1 ? '♘' : '♞',
      [PieceType.BISHOP]: owner === Player.PLAYER_1 ? '♗' : '♝',
      [PieceType.ROOK]: owner === Player.PLAYER_1 ? '♖' : '♜',
      [PieceType.QUEEN]: owner === Player.PLAYER_1 ? '♕' : '♛',
      [PieceType.KING]: owner === Player.PLAYER_1 ? '♔' : '♚',
    };
    return symbols[type];
  };

  const pieceClass = `piece player-${piece.owner}`;

  return (
    <div
      className={pieceClass}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTouchStart={handleTouchStart}
    >
      {getPieceSymbol(piece.type, piece.owner)}
    </div>
  );
};

export default PieceComponent;
