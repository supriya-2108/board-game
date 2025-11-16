import React, { useState, useEffect, useRef } from 'react';
import { GameController } from '../../logic/gameController';
import { GameMode, Difficulty, Position, Piece, Player, PlayerProfile } from '../../types';
import { ProfileManager } from '../../logic/profileManager';
import Board from './Board';
import GameControls from './GameControls';
import MoveHistory from './MoveHistory';
import ErrorTooltip from './ErrorTooltip';
import { ProfileCreation } from './ProfileCreation';
import { ProfileSettings } from './ProfileSettings';
import { EditDisplayName } from './EditDisplayName';
import { ParticleCanvasHandle } from './ParticleCanvas';
import './Game.css';

const Game: React.FC = () => {
  const [profileManager] = useState(() => new ProfileManager());
  const [showProfileCreation, setShowProfileCreation] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showEditDisplayName, setShowEditDisplayName] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<PlayerProfile | null>(null);
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');
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
  const particleCanvasRef = useRef<ParticleCanvasHandle | null>(null);
  const boardContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Check if profile exists
    if (!profileManager.hasProfile()) {
      setShowProfileCreation(true);
    } else {
      const profile = profileManager.getProfile();
      if (profile) {
        setCurrentProfile(profile);
        setPlayer1Name(profile.displayName);
        initializeGameWithNames(profile.displayName, 'Player 2');
      }
    }
  }, []);

  const initializeGameWithNames = (p1Name: string, p2Name: string) => {
    setPlayer1Name(p1Name);
    setPlayer2Name(p2Name);
    controller.initializeGame({ mode: gameMode, difficulty }, p1Name, p2Name);
    updateGameState();
  };

  const handleProfileCreated = (displayName: string) => {
    setShowProfileCreation(false);
    const profile = profileManager.getProfile();
    if (profile) {
      setCurrentProfile(profile);
    }
    const p2Name = gameMode === GameMode.AI ? 'AI Opponent' : 'Player 2';
    initializeGameWithNames(displayName, p2Name);
  };

  const handleOpenSettings = () => {
    const profile = profileManager.getProfile();
    if (profile) {
      setCurrentProfile(profile);
      setShowProfileSettings(true);
    }
  };

  const handleCloseSettings = () => {
    setShowProfileSettings(false);
  };

  const handleEditDisplayName = () => {
    setShowProfileSettings(false);
    setShowEditDisplayName(true);
  };

  const handleDisplayNameSaved = (newName: string) => {
    setPlayer1Name(newName);
    controller.setPlayerNames(newName, player2Name);
    updateGameState();
    const profile = profileManager.getProfile();
    if (profile) {
      setCurrentProfile(profile);
    }
  };

  const handleCloseEditDisplayName = () => {
    setShowEditDisplayName(false);
  };

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
    
    if (result.valid && result.move) {
      // Emit particle effects for captures and promotions
      if (particleCanvasRef.current && boardContainerRef.current) {
        const boardRect = boardContainerRef.current.getBoundingClientRect();
        const squareSize = boardRect.width / 8;
        const shouldFlip = gameMode === GameMode.PVP && boardState.currentPlayer === Player.PLAYER_2;
        
        // Calculate screen position for the destination
        const col = shouldFlip ? (8 - to.col) : (to.col - 1);
        const row = shouldFlip ? (to.row - 1) : (8 - to.row);
        const screenPos = {
          x: col * squareSize + squareSize / 2,
          y: row * squareSize + squareSize / 2,
        };
        
        // Emit capture effect if piece was captured
        if (result.move.capturedPiece) {
          particleCanvasRef.current.emitCaptureEffect(screenPos, result.move.piece.owner);
        }
        
        // Emit promotion effect if pawn was promoted
        if (result.move.isUpgrade) {
          particleCanvasRef.current.emitPromotionEffect(screenPos, result.move.piece.owner);
        }
      }
      
      updateGameState();
      
      // Check for victory and emit victory effect
      const newStatus = controller.getGameStatus();
      if (newStatus !== 'IN_PROGRESS' && particleCanvasRef.current) {
        const winner = newStatus === 'PLAYER_1_WIN' ? Player.PLAYER_1 : 
                      newStatus === 'PLAYER_2_WIN' ? Player.PLAYER_2 : null;
        if (winner) {
          setTimeout(() => {
            particleCanvasRef.current?.emitVictoryEffect(winner);
          }, 500);
        }
      }
    } else {
      setErrorMessage(result.error || 'Invalid move');
    }
  };

  const handleModeChange = (mode: GameMode) => {
    setGameMode(mode);
    const p2Name = mode === GameMode.AI ? 'AI Opponent' : 'Player 2';
    setPlayer2Name(p2Name);
    controller.newGame({ mode, difficulty }, player1Name, p2Name);
    updateGameState();
    setSelectedPiece(null);
    setValidMoves([]);
  };

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    controller.newGame({ mode: gameMode, difficulty: newDifficulty }, player1Name, player2Name);
    updateGameState();
    setSelectedPiece(null);
    setValidMoves([]);
  };

  const handleNewGame = () => {
    controller.newGame({ mode: gameMode, difficulty }, player1Name, player2Name);
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

  const handleParticleCanvasReady = (handle: ParticleCanvasHandle) => {
    particleCanvasRef.current = handle;
  };

  return (
    <div className="game-container" ref={boardContainerRef}>
      {showProfileCreation && (
        <ProfileCreation onProfileCreated={handleProfileCreated} />
      )}
      
      {showProfileSettings && currentProfile && (
        <ProfileSettings
          profile={currentProfile}
          onClose={handleCloseSettings}
          onProfileUpdated={handleDisplayNameSaved}
          onEditDisplayName={handleEditDisplayName}
        />
      )}
      
      {showEditDisplayName && (
        <EditDisplayName
          currentName={player1Name}
          onClose={handleCloseEditDisplayName}
          onSave={handleDisplayNameSaved}
        />
      )}
      
      <ErrorTooltip message={errorMessage} onClose={handleErrorClose} />
      
      <div className="game-layout">
        <aside className="game-sidebar">
          <GameControls
            gameMode={gameMode}
            difficulty={difficulty}
            currentPlayer={boardState.currentPlayer}
            gameStatus={gameStatus}
            resourcePoints={boardState.resourcePoints}
            playerNames={boardState.playerNames}
            onModeChange={handleModeChange}
            onDifficultyChange={handleDifficultyChange}
            onNewGame={handleNewGame}
            onRestart={handleRestart}
            onOpenSettings={handleOpenSettings}
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
            onParticleCanvasReady={handleParticleCanvasReady}
          />
        </main>

        <aside className="game-history">
          <MoveHistory
            moves={moveHistory}
            playerNames={boardState.playerNames}
            onMoveClick={handleMoveClick}
            onUndo={handleUndo}
          />
        </aside>
      </div>
    </div>
  );
};

export default Game;
