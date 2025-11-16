import { Piece, Position, BoardState, PieceType } from '../types';
import { PawnLogic } from './pawnLogic';
import { KnightLogic } from './knightLogic';
import { BishopLogic } from './bishopLogic';
import { QueenLogic } from './queenLogic';

/**
 * Unified interface for piece movement logic
 */
export class PieceLogic {
  /**
   * Get valid destination positions for any piece type
   */
  static getValidDestinations(piece: Piece, board: BoardState): Position[] {
    switch (piece.type) {
      case PieceType.PAWN:
        return PawnLogic.getValidDestinations(piece, board);
      case PieceType.KNIGHT:
        return KnightLogic.getValidDestinations(piece, board);
      case PieceType.BISHOP:
        return BishopLogic.getValidDestinations(piece, board);
      case PieceType.QUEEN:
        return QueenLogic.getValidDestinations(piece, board);
      default:
        return [];
    }
  }

  /**
   * Validate if a move is legal for any piece type
   */
  static isValidMove(piece: Piece, to: Position, board: BoardState): boolean {
    switch (piece.type) {
      case PieceType.PAWN:
        return PawnLogic.isValidMove(piece, to, board);
      case PieceType.KNIGHT:
        return KnightLogic.isValidMove(piece, to, board);
      case PieceType.BISHOP:
        return BishopLogic.isValidMove(piece, to, board);
      case PieceType.QUEEN:
        return QueenLogic.isValidMove(piece, to, board);
      default:
        return false;
    }
  }

  /**
   * Check if a piece can capture at the target position
   */
  static canCapture(piece: Piece, target: Position, board: BoardState): boolean {
    switch (piece.type) {
      case PieceType.PAWN:
        return false; // Pawns cannot capture in this game
      case PieceType.KNIGHT:
        return KnightLogic.canCapture(piece, target, board);
      case PieceType.BISHOP:
        return BishopLogic.canCapture(piece, target, board);
      case PieceType.QUEEN:
        return QueenLogic.canCapture(piece, target, board);
      default:
        return false;
    }
  }

  /**
   * Check if path is clear between two positions
   * (Only applicable for Bishop and Queen)
   */
  static isPathClear(from: Position, to: Position, board: BoardState, pieceType: PieceType): boolean {
    switch (pieceType) {
      case PieceType.BISHOP:
        return BishopLogic.isPathClear(from, to, board);
      case PieceType.QUEEN:
        return QueenLogic.isPathClear(from, to, board);
      case PieceType.KNIGHT:
        return true; // Knights jump over pieces
      case PieceType.PAWN:
        // Pawns have their own obstruction logic in getValidDestinations
        return true;
      default:
        return false;
    }
  }
}

// Export individual piece logic classes for direct access if needed
export { PawnLogic, KnightLogic, BishopLogic, QueenLogic };
