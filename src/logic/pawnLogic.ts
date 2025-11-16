import { Piece, Position, BoardState, Player, PieceType } from '../types';

export class PawnLogic {
  /**
   * Get valid destination positions for a Pawn
   */
  static getValidDestinations(pawn: Piece, board: BoardState): Position[] {
    if (pawn.type !== PieceType.PAWN) {
      return [];
    }

    const validPositions: Position[] = [];
    const direction = pawn.owner === Player.PLAYER_1 ? 1 : -1;
    const { row, col } = pawn.position;

    // Forward 1 square
    const oneSquareAhead = { row: row + direction, col };
    if (this.isValidForwardMove(oneSquareAhead, board)) {
      validPositions.push(oneSquareAhead);

      // Forward 2 squares (only if hasn't moved and 1 square ahead is clear)
      if (!pawn.hasMoved) {
        const twoSquaresAhead = { row: row + (2 * direction), col };
        if (this.isValidForwardMove(twoSquaresAhead, board)) {
          validPositions.push(twoSquaresAhead);
        }
      }
    }

    return validPositions;
  }

  /**
   * Check if a forward move is valid (within bounds and not occupied)
   */
  private static isValidForwardMove(position: Position, board: BoardState): boolean {
    // Check bounds
    if (!this.isWithinBounds(position)) {
      return false;
    }

    // Check if square is occupied
    return !this.isSquareOccupied(position, board);
  }

  /**
   * Check if position is within board boundaries
   */
  private static isWithinBounds(position: Position): boolean {
    return position.row >= 1 && position.row <= 8 && 
           position.col >= 1 && position.col <= 8;
  }

  /**
   * Check if a square is occupied by any piece
   */
  private static isSquareOccupied(position: Position, board: BoardState): boolean {
    return board.pieces.some(
      piece => piece.position.row === position.row && 
               piece.position.col === position.col
    );
  }

  /**
   * Check if Pawn should auto-promote to Queen
   */
  static shouldAutoPromote(pawn: Piece): boolean {
    if (pawn.type !== PieceType.PAWN) {
      return false;
    }

    // Player 1 promotes at row 8, Player 2 promotes at row 1
    const promotionRow = pawn.owner === Player.PLAYER_1 ? 8 : 1;
    return pawn.position.row === promotionRow;
  }

  /**
   * Promote Pawn to Queen
   */
  static promoteToQueen(pawn: Piece): Piece {
    return {
      ...pawn,
      type: PieceType.QUEEN
    };
  }

  /**
   * Validate if a move is legal for a Pawn
   */
  static isValidMove(pawn: Piece, to: Position, board: BoardState): boolean {
    const validDestinations = this.getValidDestinations(pawn, board);
    return validDestinations.some(
      pos => pos.row === to.row && pos.col === to.col
    );
  }
}
