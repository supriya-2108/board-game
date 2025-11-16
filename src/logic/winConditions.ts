import { BoardState, GameStatus, Player, PieceType } from '../types';
import { MoveValidator } from './moveValidator';

/**
 * Win and Draw Condition Detection
 * Detects win conditions (King capture, piece count, no valid moves) and draw conditions (50-move rule)
 */
export class WinConditions {
  /**
   * Check the current game status
   */
  static checkGameStatus(state: BoardState): GameStatus {
    // Check for King capture first (immediate win condition)
    const kingCaptureStatus = this.checkKingCapture(state);
    if (kingCaptureStatus !== GameStatus.IN_PROGRESS) {
      return kingCaptureStatus;
    }

    // Check draw condition (50 moves without capture)
    if (this.isDrawByFiftyMoveRule(state)) {
      return GameStatus.DRAW;
    }

    // Check win conditions for both players
    const player1Pieces = state.pieces.filter(p => p.owner === Player.PLAYER_1);
    const player2Pieces = state.pieces.filter(p => p.owner === Player.PLAYER_2);

    // Check if Player 1 has fewer than 3 pieces (excluding King)
    if (this.hasInsufficientPieces(state, Player.PLAYER_1)) {
      return GameStatus.PLAYER_2_WIN;
    }

    // Check if Player 2 has fewer than 3 pieces (excluding King)
    if (this.hasInsufficientPieces(state, Player.PLAYER_2)) {
      return GameStatus.PLAYER_1_WIN;
    }

    // Check if current player has no valid moves
    if (this.hasNoValidMoves(state, state.currentPlayer)) {
      // Opponent wins
      return state.currentPlayer === Player.PLAYER_1 
        ? GameStatus.PLAYER_2_WIN 
        : GameStatus.PLAYER_1_WIN;
    }

    return GameStatus.IN_PROGRESS;
  }

  /**
   * Check if a King has been captured (immediate win condition)
   */
  static checkKingCapture(state: BoardState): GameStatus {
    const player1HasKing = state.pieces.some(p => p.owner === Player.PLAYER_1 && p.type === PieceType.KING);
    const player2HasKing = state.pieces.some(p => p.owner === Player.PLAYER_2 && p.type === PieceType.KING);

    // If Player 1's King is captured, Player 2 wins immediately
    if (!player1HasKing) {
      return GameStatus.PLAYER_2_WIN;
    }

    // If Player 2's King is captured, Player 1 wins immediately
    if (!player2HasKing) {
      return GameStatus.PLAYER_1_WIN;
    }

    return GameStatus.IN_PROGRESS;
  }

  /**
   * Check if a player has fewer than 3 pieces (excluding King)
   */
  static hasInsufficientPieces(state: BoardState, player: Player): boolean {
    const playerPieces = state.pieces.filter(p => p.owner === player && p.type !== PieceType.KING);
    return playerPieces.length < 3;
  }

  /**
   * Check if a player has no valid moves available
   */
  static hasNoValidMoves(state: BoardState, player: Player): boolean {
    const playerPieces = state.pieces.filter(p => p.owner === player);

    // Check each piece to see if it has any valid moves
    for (const piece of playerPieces) {
      const validMoves = MoveValidator.getValidMoves(piece, state);
      if (validMoves.length > 0) {
        return false; // Found at least one valid move
      }
    }

    return true; // No valid moves found for any piece
  }

  /**
   * Check if game is a draw by 50-move rule (50 consecutive moves without capture)
   */
  static isDrawByFiftyMoveRule(state: BoardState): boolean {
    return state.capturesSinceLastMove >= 50;
  }

  /**
   * Check if the game is over (any win or draw condition)
   */
  static isGameOver(state: BoardState): boolean {
    return this.checkGameStatus(state) !== GameStatus.IN_PROGRESS;
  }

  /**
   * Get the winner if there is one
   */
  static getWinner(state: BoardState): Player | null {
    const status = this.checkGameStatus(state);
    if (status === GameStatus.PLAYER_1_WIN) {
      return Player.PLAYER_1;
    }
    if (status === GameStatus.PLAYER_2_WIN) {
      return Player.PLAYER_2;
    }
    return null;
  }

  /**
   * Get a human-readable game outcome message
   */
  static getOutcomeMessage(state: BoardState): string {
    const status = this.checkGameStatus(state);
    
    // Check if win was due to King capture
    const kingCaptureStatus = this.checkKingCapture(state);
    const isKingCapture = kingCaptureStatus !== GameStatus.IN_PROGRESS;
    
    switch (status) {
      case GameStatus.PLAYER_1_WIN:
        return isKingCapture ? 'Player 1 wins by King capture!' : 'Player 1 wins!';
      case GameStatus.PLAYER_2_WIN:
        return isKingCapture ? 'Player 2 wins by King capture!' : 'Player 2 wins!';
      case GameStatus.DRAW:
        return 'Game is a draw (50 moves without capture)';
      case GameStatus.IN_PROGRESS:
        return 'Game in progress';
      default:
        return 'Unknown game status';
    }
  }
}
