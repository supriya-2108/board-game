import { BoardState, GameConfig, GameMode, GameStatus, Move, MoveResult, Player, Position, Difficulty, Piece } from '../types';
import { GameStateManager } from './gameStateManager';
import { MoveValidator } from './moveValidator';
import { AIEngine } from './aiEngine';
import { WinConditions } from './winConditions';

/**
 * GameController
 * Orchestrates game flow, turn management, move processing, AI triggering,
 * game mode switching, undo requests, and win/draw condition detection
 */
export class GameController {
  private stateManager: GameStateManager;
  private config: GameConfig;
  private player1Name: string;
  private player2Name: string;

  constructor(config?: GameConfig, player1Name?: string, player2Name?: string) {
    this.config = config || { mode: GameMode.PVP, difficulty: Difficulty.EASY };
    this.player1Name = player1Name || 'Player 1';
    this.player2Name = player2Name || 'Player 2';
    this.stateManager = new GameStateManager();
  }

  /**
   * Initialize a new game with the given configuration
   */
  initializeGame(config: GameConfig, player1Name?: string, player2Name?: string): void {
    this.config = config;
    if (player1Name) this.player1Name = player1Name;
    if (player2Name) this.player2Name = player2Name;
    this.stateManager.reset(this.player1Name, this.player2Name);
  }

  /**
   * Set player names
   */
  setPlayerNames(player1Name: string, player2Name: string): void {
    this.player1Name = player1Name;
    this.player2Name = player2Name;
  }

  /**
   * Get player names
   */
  getPlayerNames(): { player1: string; player2: string } {
    return { player1: this.player1Name, player2: this.player2Name };
  }

  /**
   * Get the current game configuration
   */
  getConfig(): GameConfig {
    return { ...this.config };
  }

  /**
   * Get the current board state
   */
  getGameState(): BoardState {
    return this.stateManager.getCurrentState();
  }

  /**
   * Get the current game status
   */
  getGameStatus(): GameStatus {
    return this.stateManager.getGameStatus();
  }

  /**
   * Get the complete move history
   */
  getMoveHistory(): Move[] {
    return this.stateManager.getMoveHistory();
  }

  /**
   * Check if the game is over
   */
  isGameOver(): boolean {
    return this.stateManager.isGameOver();
  }

  /**
   * Get the winner if there is one
   */
  getWinner(): Player | null {
    return this.stateManager.getWinner();
  }

  /**
   * Get a human-readable game outcome message
   */
  getOutcomeMessage(): string {
    return this.stateManager.getOutcomeMessage();
  }

  /**
   * Attempt to make a move from one position to another
   * Returns the result of the move attempt
   */
  attemptMove(from: Position, to: Position): MoveResult {
    // Check if game is over
    if (this.isGameOver()) {
      return {
        valid: false,
        error: 'Invalid: game over'
      };
    }

    const currentState = this.stateManager.getCurrentState();
    
    // Find the piece at the from position
    const piece = currentState.pieces.find(
      p => p.position.row === from.row && p.position.col === from.col
    );

    if (!piece) {
      return {
        valid: false,
        error: 'Invalid: no piece at source position'
      };
    }

    // Validate the move
    const result = MoveValidator.validateMove(piece, to, currentState);

    if (result.valid && result.move) {
      // Record the move
      this.stateManager.recordMove(result.move);

      // Check if AI should make a move
      if (this.shouldTriggerAI()) {
        this.triggerAIMove();
      }
    }

    return result;
  }

  /**
   * Attempt to upgrade a pawn to a queen
   */
  attemptUpgrade(pieceId: string): MoveResult {
    // Check if game is over
    if (this.isGameOver()) {
      return {
        valid: false,
        error: 'Invalid: game over'
      };
    }

    const currentState = this.stateManager.getCurrentState();
    
    // Validate the upgrade
    const result = MoveValidator.validateUpgrade(pieceId, currentState);

    if (result.valid && result.move) {
      // Record the upgrade move
      this.stateManager.recordMove(result.move);
    }

    return result;
  }

  /**
   * Undo the last N moves (up to 3)
   */
  undoMove(count: number = 1): boolean {
    if (this.isGameOver()) {
      return false;
    }

    return this.stateManager.undoMoves(count);
  }

  /**
   * Switch game mode and reset the board
   */
  switchMode(newConfig: GameConfig): void {
    this.config = newConfig;
    // Update player 2 name based on mode
    if (newConfig.mode === GameMode.AI) {
      this.player2Name = 'AI Opponent';
    }
    this.stateManager.reset(this.player1Name, this.player2Name);
  }

  /**
   * Start a new game with the same configuration
   */
  restartGame(): void {
    this.stateManager.reset(this.player1Name, this.player2Name);
  }

  /**
   * Start a new game with a different configuration
   */
  newGame(config: GameConfig, player1Name?: string, player2Name?: string): void {
    this.config = config;
    if (player1Name) this.player1Name = player1Name;
    if (player2Name) this.player2Name = player2Name;
    this.stateManager.reset(this.player1Name, this.player2Name);
  }

  /**
   * Get the state at a specific point in history
   */
  getStateAtMove(moveIndex: number): BoardState | null {
    return this.stateManager.getStateAtMove(moveIndex);
  }

  /**
   * Check if undo is available
   */
  canUndo(count: number = 1): boolean {
    return this.stateManager.canUndo(count);
  }

  /**
   * Check if a piece can be upgraded
   */
  canUpgradePiece(pieceId: string): boolean {
    return this.stateManager.canUpgradePiece(pieceId);
  }

  /**
   * Get current resource points for a player
   */
  getResourcePoints(player: Player): number {
    return this.stateManager.getResourcePoints(player);
  }

  /**
   * Check if AI should make a move after the current move
   */
  private shouldTriggerAI(): boolean {
    // AI should move if:
    // 1. Game mode is AI
    // 2. Current player is Player 2 (AI player)
    // 3. Game is not over
    if (this.config.mode !== GameMode.AI) {
      return false;
    }

    const currentState = this.stateManager.getCurrentState();
    if (currentState.currentPlayer !== Player.PLAYER_2) {
      return false;
    }

    if (this.isGameOver()) {
      return false;
    }

    return true;
  }

  /**
   * Trigger AI to make a move
   */
  private triggerAIMove(): void {
    const currentState = this.stateManager.getCurrentState();
    const difficulty = this.config.difficulty || Difficulty.EASY;

    // Calculate best move
    const bestMove = AIEngine.calculateBestMove(currentState, difficulty);

    if (bestMove) {
      // Record the AI's move
      this.stateManager.recordMove(bestMove);
    }
  }

  /**
   * Get the current player
   */
  getCurrentPlayer(): Player {
    return this.stateManager.getCurrentState().currentPlayer;
  }

  /**
   * Check if it's the AI's turn
   */
  isAITurn(): boolean {
    return this.config.mode === GameMode.AI && 
           this.getCurrentPlayer() === Player.PLAYER_2;
  }

  /**
   * Get the current game mode
   */
  getGameMode(): GameMode {
    return this.config.mode;
  }

  /**
   * Get the current difficulty setting
   */
  getDifficulty(): Difficulty {
    return this.config.difficulty || Difficulty.EASY;
  }

  /**
   * Get valid moves for a piece
   */
  getValidMoves(piece: Piece): Position[] {
    const currentState = this.stateManager.getCurrentState();
    return MoveValidator.getValidMoves(piece, currentState);
  }
}
