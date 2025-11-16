import React, { useState, useEffect } from 'react';
import { GameController } from '../../logic/gameController';
import { GameMode, Difficulty, Position, Piece, Player } from '../../types';
import Board from './Board';
import GameControls from './GameControls';
import MoveHistory from './MoveHistory';
import ErrorTooltip from './ErrorTooltip';
import './Game.css';

const Game: React.FC = () => {
  const [controller] = useState(() => new GameController());
  const [boardState, setBoardState] = useState(controller.getGameState());
  const [gameStatus, setGameStatus] = useState(controller.getGameStatus());
  const [moveHistory, setMoveHistory] = useState(controller.getMoveHistory());
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.PVP);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [draggedPiece, setDraggedPiece] = useState<Piece | null>(null);

  useEffect(() => {
    controller.initializeGame({ mode: gameMode, difficulty });
    updateGameState();
  }, []);

  const updateGameState = () => {
    setBoardState(controller.getGameState());
    setGameStatus(controller.getGameStatus());
    setMoveHistory(controller.getMoveHistory());
  };

  const handleSquareClick = (position: Position) => {
    const piece = boardState.pieces.find(
      (p) => p.position.row === position.row && p.position.col === position.col
    );

    // If clicking on own piece, select it
    if (piece && piece.owner === boardState.currentPlayer) {
      setSelectedPiece(piece);
      const moves = controller.getValidMoves(piece);
      setValidMoves(moves);
    }
    // If a piece is selected and clicking on valid move, attempt move
    else if (selectedPiece) {
      const isValidMove = validMoves.some(
        (move) => move.row === position.row && move.col === position.col
      );

      if (isValidMove) {
        attemptMove(selectedPiece.position, position);
      } else {
        setErrorMessage('Invalid move');
      }
      
      setSelectedPiece(null);
      setValidMoves([]);
    }
  };

  const handlePieceDragStart = (piece: Piece) => {
    if (piece.owner === boardState.currentPlayer) {
      setDraggedPiece(piece);
      setSelectedPiece(piece);
      const moves = controller.getValidMoves(piece);
      setValidMoves(moves);
    }
  };

  const handlePieceDragEnd = () => {
    // Keep selection for visual feedback
  };

  const handleSquareDrop = (position: Position) => {
    if (draggedPiece) {
      const isValidMove = validMoves.some(
        (move) => move.row === position.row && move.col === position.col
      );

      if (isValidMove) {
        attemptMove(draggedPiece.position, position);
      } else {
        setErrorMessage('Invalid move');
      }
    }

    setDraggedPiece(null);
    setSelectedPiece(null);
    setValidMoves([]);
  };

  const attemptMove = (from: Position, to: Position) => {
    const result = controller.attemptMove(from, to);
    
    if (result.valid) {
      updateGameState();
    } else {
      setErrorMessage(result.error || 'Invalid move');
    }
  };

  const handleModeChange = (mode: GameMode) => {
    setGameMode(mode);
    controller.newGame({ mode, difficulty });
    updateGameState();
    setSelectedPiece(null);
    setValidMoves([]);
  };

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    controller.newGame({ mode: gameMode, difficulty: newDifficulty });
    updateGameState();
    setSelectedPiece(null);
    setValidMoves([]);
  };

  const handleNewGame = () => {
    controller.newGame({ mode: gameMode, difficulty });
    updateGameState();
    setSelectedPiece(null);
    setValidMoves([]);
  };

  const handleRestart = () => {
    controller.restartGame();
    updateGameState();
    setSelectedPiece(null);
    setValidMoves([]);
  };

  const handleUndo = (count: number) => {
    controller.undoMove(count);
    updateGameState();
    setSelectedPiece(null);
    setValidMoves([]);
  };

  const handleMoveClick = (moveIndex: number) => {
    // Replay functionality - would need to implement state reconstruction
    // For now, just a placeholder
    console.log('Replay to move', moveIndex);
  };

  const handleErrorClose = () => {
    setErrorMessage(null);
  };

  const shouldFlipBoard = gameMode === GameMode.PVP && boardState.currentPlayer === Player.PLAYER_2;

  return (
    <div className="game-container">
      <ErrorTooltip message={errorMessage} onClose={handleErrorClose} />
      
      <div className="game-layout">
        <aside className="game-sidebar">
          <GameControls
            gameMode={gameMode}
            difficulty={difficulty}
            currentPlayer={boardState.currentPlayer}
            gameStatus={gameStatus}
            resourcePoints={boardState.resourcePoints}
            onModeChange={handleModeChange}
            onDifficultyChange={handleDifficultyChange}
            onNewGame={handleNewGame}
            onRestart={handleRestart}
          />
        </aside>

        <main className="game-main">
          <Board
            boardState={boardState}
            onSquareClick={handleSquareClick}
            onPieceDragStart={handlePieceDragStart}
            onPieceDragEnd={handlePieceDragEnd}
            onSquareDrop={handleSquareDrop}
            selectedPiece={selectedPiece}
            validMoves={validMoves}
            flipBoard={shouldFlipBoard}
          />
        </main>

        <aside className="game-history">
          <MoveHistory
            moves={moveHistory}
            onMoveClick={handleMoveClick}
            onUndo={handleUndo}
          />
        </aside>
      </div>
    </div>
  );
};

export default Game;
