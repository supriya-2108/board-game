import { Piece, Position, BoardState, PieceType } from '../types';

export class BishopLogic {
  /**
   * Get valid destination positions for a Bishop
   */
  static getValidDestinations(bishop: Piece, board: BoardState): Position[] {
    if (bishop.type !== PieceType.BISHOP) {
      return [];
    }

    const validPositions: Position[] = [];
    const { row, col } = bishop.position;

    // Four diagonal directions
    const directions = [
      { rowDelta: 1, colDelta: 1 },   // Up-right
      { rowDelta: 1, colDelta: -1 },  // Up-left
      { rowDelta: -1, colDelta: 1 },  // Down-right
      { rowDelta: -1, colDelta: -1 }  // Down-left
    ];

    for (const direction of directions) {
      let currentRow = row + direction.rowDelta;
      let currentCol = col + direction.colDelta;

      while (this.isWithinBounds({ row: currentRow, col: currentCol })) {
        const currentPos = { row: currentRow, col: currentCol };
        const pieceAtPos = this.getPieceAt(currentPos, board);

        if (pieceAtPos) {
          // If opponent piece, can capture (but stop here)
          if (pieceAtPos.owner !== bishop.owner) {
            validPositions.push(currentPos);
          }
          // Stop in either case (friendly or opponent piece)
          break;
        }

        // Empty square - valid move
        validPositions.push(currentPos);

        // Continue in this direction
        currentRow += direction.rowDelta;
        currentCol += direction.colDelta;
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
   * Check if path is clear between two positions (diagonal only)
   */
  static isPathClear(from: Position, to: Position, board: BoardState): boolean {
    const rowDiff = to.row - from.row;
    const colDiff = to.col - from.col;

    // Must be diagonal move
    if (Math.abs(rowDiff) !== Math.abs(colDiff)) {
      return false;
    }

    const rowStep = rowDiff > 0 ? 1 : -1;
    const colStep = colDiff > 0 ? 1 : -1;
    const steps = Math.abs(rowDiff);

    // Check each square along the path (excluding start and end)
    for (let i = 1; i < steps; i++) {
      const checkPos = {
        row: from.row + (i * rowStep),
        col: from.col + (i * colStep)
      };

      if (this.getPieceAt(checkPos, board)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if Bishop can capture at the destination
   */
  static canCapture(bishop: Piece, target: Position, board: BoardState): boolean {
    const pieceAtTarget = this.getPieceAt(target, board);
    return pieceAtTarget !== undefined && pieceAtTarget.owner !== bishop.owner;
  }

  /**
   * Validate if a move is legal for a Bishop
   */
  static isValidMove(bishop: Piece, to: Position, board: BoardState): boolean {
    const validDestinations = this.getValidDestinations(bishop, board);
    return validDestinations.some(
      pos => pos.row === to.row && pos.col === to.col
    );
  }
}
