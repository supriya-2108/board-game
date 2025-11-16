import { Piece, Position, BoardState, PieceType } from '../types';

export class KingLogic {
  /**
   * Get valid destination positions for a King
   * King can move exactly one square in any direction (horizontal, vertical, or diagonal)
   */
  static getValidDestinations(king: Piece, board: BoardState): Position[] {
    if (king.type !== PieceType.KING) {
      return [];
    }

    const validPositions: Position[] = [];
    const { row, col } = king.position;

    // All eight directions (one square each)
    const directions = [
      { rowDelta: 1, colDelta: 0 },    // Up
      { rowDelta: -1, colDelta: 0 },   // Down
      { rowDelta: 0, colDelta: 1 },    // Right
      { rowDelta: 0, colDelta: -1 },   // Left
      { rowDelta: 1, colDelta: 1 },    // Up-right
      { rowDelta: 1, colDelta: -1 },   // Up-left
      { rowDelta: -1, colDelta: 1 },   // Down-right
      { rowDelta: -1, colDelta: -1 }   // Down-left
    ];

    for (const direction of directions) {
      const newRow = row + direction.rowDelta;
      const newCol = col + direction.colDelta;
      const newPos = { row: newRow, col: newCol };

      // Check if within bounds
      if (!this.isWithinBounds(newPos)) {
        continue;
      }

      const pieceAtPos = this.getPieceAt(newPos, board);

      // Can move to empty square or capture opponent piece
      if (!pieceAtPos || pieceAtPos.owner !== king.owner) {
        validPositions.push(newPos);
      }
    }

    return validPositions;
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
   * Check if King can capture at the destination
   */
  static canCapture(king: Piece, target: Position, board: BoardState): boolean {
    const pieceAtTarget = this.getPieceAt(target, board);
    return pieceAtTarget !== undefined && pieceAtTarget.owner !== king.owner;
  }

  /**
   * Validate if a move is legal for a King
   */
  static isValidMove(king: Piece, to: Position, board: BoardState): boolean {
    const validDestinations = this.getValidDestinations(king, board);
    return validDestinations.some(
      pos => pos.row === to.row && pos.col === to.col
    );
  }

  /**
   * Check if path is clear (King only moves one square, so always clear)
   */
  static isPathClear(from: Position, to: Position, board: BoardState): boolean {
    // King moves only one square, so path is always clear
    const rowDiff = Math.abs(to.row - from.row);
    const colDiff = Math.abs(to.col - from.col);
    
    // Verify it's a valid one-square move
    return rowDiff <= 1 && colDiff <= 1 && (rowDiff > 0 || colDiff > 0);
  }
}
