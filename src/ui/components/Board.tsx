import React, { useRef, useEffect, useState } from 'react';
import { BoardState, Position, Piece } from '../../types';
import Square from './Square';
import ParticleCanvas, { ParticleCanvasHandle } from './ParticleCanvas';
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
  onParticleCanvasReady?: (handle: ParticleCanvasHandle) => void;
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
  onParticleCanvasReady,
}) => {
  const particleCanvasRef = useRef<ParticleCanvasHandle>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'flip' | 'reverse' | null>(null);
  const previousFlipBoard = useRef(flipBoard);

  useEffect(() => {
    if (particleCanvasRef.current && onParticleCanvasReady) {
      onParticleCanvasReady(particleCanvasRef.current);
    }
  }, [onParticleCanvasReady]);

  // Handle board flip animation when flipBoard prop changes
  useEffect(() => {
    if (previousFlipBoard.current !== flipBoard) {
      setIsAnimating(true);
      setAnimationDirection(flipBoard ? 'flip' : 'reverse');
      
      // Remove animation class after animation completes
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setAnimationDirection(null);
      }, 500); // Match animation duration
      
      previousFlipBoard.current = flipBoard;
      
      return () => clearTimeout(timer);
    }
  }, [flipBoard]);

  // Update valid move indicators when selection changes
  useEffect(() => {
    if (particleCanvasRef.current && boardRef.current) {
      particleCanvasRef.current.clearParticles();
      
      if (selectedPiece && validMoves.length > 0) {
        const boardRect = boardRef.current.getBoundingClientRect();
        const squareSize = boardRect.width / 8;
        
        const particlePositions = validMoves.map(move => {
          const col = flipBoard ? (8 - move.col) : (move.col - 1);
          const row = flipBoard ? (move.row - 1) : (8 - move.row);
          
          return {
            x: col * squareSize + squareSize / 2,
            y: row * squareSize + squareSize / 2,
          };
        });
        
        particleCanvasRef.current.emitValidMoveIndicators(
          particlePositions,
          boardState.currentPlayer
        );
      }
    }
  }, [selectedPiece, validMoves, flipBoard, boardState.currentPlayer]);
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
    const rows: JSX.Element[] = [];
    const rowRange = flipBoard ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
    const colRange = flipBoard ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];

    for (const row of rowRange) {
      const squares: JSX.Element[] = [];
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

  // Build board class names based on animation state
  const boardClassNames = [
    'board',
    isAnimating && animationDirection === 'flip' ? 'animating-flip' : '',
    isAnimating && animationDirection === 'reverse' ? 'animating-flip-reverse' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="board-container" style={{ position: 'relative' }}>
      <div 
        ref={boardRef} 
        className={boardClassNames}
        role="grid"
        aria-label="Game board"
        aria-describedby="board-description"
      >
        {renderBoard()}
      </div>
      <div id="board-description" className="sr-only">
        An 8 by 8 game board. Use arrow keys to navigate between squares, Enter or Space to select.
      </div>
      <ParticleCanvas ref={particleCanvasRef} className="particle-canvas" aria-hidden="true" />
    </div>
  );
};

export default Board;
