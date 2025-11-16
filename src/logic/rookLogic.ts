import { Piece, Position, BoardState, PieceType } from '../types';

export class RookLogic {
  /**
   * Get valid destination positions for a Rook
   */
  static getValidDestinations(rook: Piece, board: BoardState): Position[] {
    if (rook.type !== PieceType.ROOK) {
      return [];
    }

    const validPositions: Position[] = [];
    const { row, col } = rook.position;

    // Four straight directions (horizontal and vertical)
    const directions = [
      { rowDelta: 1, colDelta: 0 },   // Up
      { rowDelta: -1, colDelta: 0 },  // Down
      { rowDelta: 0, colDelta: 1 },   // Right
      { rowDelta: 0, colDelta: -1 }   // Left
    ];

    for (const direction of directions) {
      let currentRow = row + direction.rowDelta;
      let currentCol = col + direction.colDelta;

      while (this.isWithinBounds({ row: currentRow, col: currentCol })) {
        const currentPos = { row: currentRow, col: currentCol };
        const pieceAtPos = this.getPieceAt(currentPos, board);

        if (pieceAtPos) {
          // If opponent piece, can capture (but stop here)
          if (pieceAtPos.owner !== rook.owner) {
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
   * Check if path is clear between two positions (horizontal or vertical only)
   */
  static isPathClear(from: Position, to: Position, board: BoardState): boolean {
    const rowDiff = to.row - from.row;
    const colDiff = to.col - from.col;

    // Must be horizontal or vertical move
    if (rowDiff !== 0 && colDiff !== 0) {
      return false;
    }

    // Determine direction
    const rowStep = rowDiff === 0 ? 0 : (rowDiff > 0 ? 1 : -1);
    const colStep = colDiff === 0 ? 0 : (colDiff > 0 ? 1 : -1);
    const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));

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
   * Check if Rook can capture at the destination
   */
  static canCapture(rook: Piece, target: Position, board: BoardState): boolean {
    const pieceAtTarget = this.getPieceAt(target, board);
    return pieceAtTarget !== undefined && pieceAtTarget.owner !== rook.owner;
  }

  /**
   * Validate if a move is legal for a Rook
   */
  static isValidMove(rook: Piece, to: Position, board: BoardState): boolean {
    const validDestinations = this.getValidDestinations(rook, board);
    return validDestinations.some(
      pos => pos.row === to.row && pos.col === to.col
    );
  }
}
