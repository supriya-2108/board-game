import { Piece, Position, BoardState, PieceType } from '../types';

export class KnightLogic {
  /**
   * Get valid destination positions for a Knight
   */
  static getValidDestinations(knight: Piece, board: BoardState): Position[] {
    if (knight.type !== PieceType.KNIGHT) {
      return [];
    }

    const validPositions: Position[] = [];
    const { row, col } = knight.position;

    // All 8 possible L-shape moves
    const moves = [
      { row: row + 2, col: col + 1 },
      { row: row + 2, col: col - 1 },
      { row: row - 2, col: col + 1 },
      { row: row - 2, col: col - 1 },
      { row: row + 1, col: col + 2 },
      { row: row + 1, col: col - 2 },
      { row: row - 1, col: col + 2 },
      { row: row - 1, col: col - 2 }
    ];

    for (const move of moves) {
      if (this.isValidDestination(move, knight, board)) {
        validPositions.push(move);
      }
    }

    return validPositions;
  }

  /**
   * Check if a destination is valid for the Knight
   */
  private static isValidDestination(
    position: Position, 
    knight: Piece, 
    board: BoardState
  ): boolean {
    // Check bounds
    if (!this.isWithinBounds(position)) {
      return false;
    }

    // Check if square is occupied by friendly piece
    const pieceAtDestination = this.getPieceAt(position, board);
    if (pieceAtDestination && pieceAtDestination.owner === knight.owner) {
      return false;
    }

    return true;
  }

  /**
   * Check if position is within board boundaries
   */
  private static isWithinBounds(position: Position): boolean {
    return position.row >= 1 && position.row <= 8 && 
           position.col >= 1 && position.col <= 8;
  }

  /**
   * Get piece at a specific position
   */
  private static getPieceAt(position: Position, board: BoardState): Piece | undefined {
    return board.pieces.find(
      piece => piece.position.row === position.row && 
               piece.position.col === position.col
    );
  }

  /**
   * Check if Knight can capture at the destination
   */
  static canCapture(knight: Piece, target: Position, board: BoardState): boolean {
    const pieceAtTarget = this.getPieceAt(target, board);
    return pieceAtTarget !== undefined && pieceAtTarget.owner !== knight.owner;
  }

  /**
   * Validate if a move is legal for a Knight
   */
  static isValidMove(knight: Piece, to: Position, board: BoardState): boolean {
    const validDestinations = this.getValidDestinations(knight, board);
    return validDestinations.some(
      pos => pos.row === to.row && pos.col === to.col
    );
  }
}
