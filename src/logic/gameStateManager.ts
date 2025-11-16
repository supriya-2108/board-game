import { BoardState, Move, Player, Position, Piece, PieceType, GameStatus } from '../types';
import { GameState } from './gameState';
import { WinConditions } from './winConditions';

/**
 * Game State Manager with History and Undo
 * Manages the complete game state including move history and undo functionality
 */
export class GameStateManager {
  private currentState: BoardState;
  private moveHistory: Move[];
  private stateHistory: BoardState[];

  constructor(initialState?: BoardState) {
    this.currentState = initialState || GameState.initializeBoard();
    this.moveHistory = [];
    this.stateHistory = [GameState.cloneState(this.currentState)];
  }

  /**
   * Get the current board state
   */
  getCurrentState(): BoardState {
    return GameState.cloneState(this.currentState);
  }

  /**
   * Get the complete move history
   */
  getMoveHistory(): Move[] {
    return [...this.moveHistory];
  }

  /**
   * Record a move and update the game state
   */
  recordMove(move: Move): void {
    // Apply the move to get new state
    this.currentState = GameState.applyMove(this.currentState, move);
    
    // Record the move in history
    this.moveHistory.push(move);
    
    // Save state snapshot for undo
    this.stateHistory.push(GameState.cloneState(this.currentState));
  }

  /**
   * Undo the last N moves (up to 3)
   */
  undoMoves(count: number): boolean {
    // Validate count
    if (count < 1) {
      return false;
    }

    // Limit to available moves
    const actualCount = Math.min(count, this.moveHistory.length, 3);
    
    if (actualCount === 0) {
      return false;
    }

    // Remove moves from history
    this.moveHistory.splice(-actualCount);
    
    // Remove state snapshots
    this.stateHistory.splice(-actualCount);
    
    // Restore the state from the last snapshot
    if (this.stateHistory.length > 0) {
      this.currentState = GameState.cloneState(
        this.stateHistory[this.stateHistory.length - 1]
      );
    }

    return true;
  }

  /**
   * Get the state at a specific point in history
   */
  getStateAtMove(moveIndex: number): BoardState | null {
    if (moveIndex < 0 || moveIndex >= this.stateHistory.length) {
      return null;
    }
    return GameState.cloneState(this.stateHistory[moveIndex]);
  }

  /**
   * Reset the game to initial state
   */
  reset(player1Name?: string, player2Name?: string): void {
    this.currentState = GameState.initializeBoard(player1Name, player2Name);
    this.moveHistory = [];
    this.stateHistory = [GameState.cloneState(this.currentState)];
  }

  /**
   * Get the number of moves in history
   */
  getMoveCount(): number {
    return this.moveHistory.length;
  }

  /**
   * Check if undo is available
   */
  canUndo(count: number = 1): boolean {
    return this.moveHistory.length >= count && count <= 3;
  }

  /**
   * Check if a piece can be upgraded
   */
  canUpgradePiece(pieceId: string): boolean {
    const piece = this.currentState.pieces.find(p => p.id === pieceId);
    
    if (!piece) return false;
    if (piece.type !== PieceType.PAWN) return false;
    if (piece.owner !== this.currentState.currentPlayer) return false;
    if (this.currentState.resourcePoints[piece.owner] < 2) return false;
    if (piece.position.row === 1 || piece.position.row === 8) return false;
    
    return true;
  }

  /**
   * Get current resource points for a player
   */
  getResourcePoints(player: Player): number {
    return this.currentState.resourcePoints[player];
  }

  /**
   * Upgrade a Pawn to a Queen
   * Returns the move if successful, null otherwise
   */
  upgradePiece(pieceId: string): Move | null {
    // Validate upgrade is possible
    if (!this.canUpgradePiece(pieceId)) {
      return null;
    }

    const piece = this.currentState.pieces.find(p => p.id === pieceId);
    if (!piece) {
      return null;
    }

    // Create upgrade move
    const upgradeMove: Move = {
      piece: { ...piece },
      from: { ...piece.position },
      to: { ...piece.position },
      isUpgrade: true,
      timestamp: Date.now()
    };

    // Record the move (this will apply the upgrade and deduct resources)
    this.recordMove(upgradeMove);

    return upgradeMove;
  }

  /**
   * Get the current game status (in progress, win, or draw)
   */
  getGameStatus(): GameStatus {
    return WinConditions.checkGameStatus(this.currentState);
  }

  /**
   * Check if the game is over
   */
  isGameOver(): boolean {
    return WinConditions.isGameOver(this.currentState);
  }

  /**
   * Get the winner if there is one
   */
  getWinner(): Player | null {
    return WinConditions.getWinner(this.currentState);
  }

  /**
   * Get a human-readable game outcome message
   */
  getOutcomeMessage(): string {
    return WinConditions.getOutcomeMessage(this.currentState);
  }

  /**
   * Check if a move can be made (game is not over)
   */
  canMakeMove(): boolean {
    return !this.isGameOver();
  }
}
