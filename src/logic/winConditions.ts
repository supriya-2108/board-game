import { BoardState, GameStatus, Player } from '../types';
import { MoveValidator } from './moveValidator';

/**
 * Win and Draw Condition Detection
 * Detects win conditions (piece count, no valid moves) and draw conditions (50-move rule)
 */
export class WinConditions {
  /**
   * Check the current game status
   */
  static checkGameStatus(state: BoardState): GameStatus {
    // Check draw condition first (50 moves without capture)
    if (this.isDrawByFiftyMoveRule(state)) {
      return GameStatus.DRAW;
    }

    // Check win conditions for both players
    const player1Pieces = state.pieces.filter(p => p.owner === Player.PLAYER_1);
    const player2Pieces = state.pieces.filter(p => p.owner === Player.PLAYER_2);

    // Check if Player 1 has fewer than 3 pieces
    if (player1Pieces.length < 3) {
      return GameStatus.PLAYER_2_WIN;
    }

    // Check if Player 2 has fewer than 3 pieces
    if (player2Pieces.length < 3) {
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
   * Check if a player has fewer than 3 pieces
   */
  static hasInsufficientPieces(state: BoardState, player: Player): boolean {
    const playerPieces = state.pieces.filter(p => p.owner === player);
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
    
    switch (status) {
      case GameStatus.PLAYER_1_WIN:
        return 'Player 1 wins!';
      case GameStatus.PLAYER_2_WIN:
        return 'Player 2 wins!';
      case GameStatus.DRAW:
        return 'Game is a draw (50 moves without capture)';
      case GameStatus.IN_PROGRESS:
        return 'Game in progress';
      default:
        return 'Unknown game status';
    }
  }
}
