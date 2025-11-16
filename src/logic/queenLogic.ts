import { Piece, Position, BoardState, PieceType, Player } from '../types';

export class QueenLogic {
  /**
   * Get valid destination positions for a Queen
   * Queen combines diagonal movement (like Bishop) and forward movement (like extended Pawn)
   */
  static getValidDestinations(queen: Piece, board: BoardState): Position[] {
    if (queen.type !== PieceType.QUEEN) {
      return [];
    }

    const validPositions: Position[] = [];
    const { row, col } = queen.position;

    // Diagonal directions (like Bishop)
    const diagonalDirections = [
      { rowDelta: 1, colDelta: 1 },   // Up-right
      { rowDelta: 1, colDelta: -1 },  // Up-left
      { rowDelta: -1, colDelta: 1 },  // Down-right
      { rowDelta: -1, colDelta: -1 }  // Down-left
    ];

    // Forward direction (based on player)
    const forwardDirection = queen.owner === Player.PLAYER_1 ? 1 : -1;
    const forwardDirections = [
      { rowDelta: forwardDirection, colDelta: 0 }  // Forward
    ];

    // Combine all directions
    const allDirections = [...diagonalDirections, ...forwardDirections];

    for (const direction of allDirections) {
      let currentRow = row + direction.rowDelta;
      let currentCol = col + direction.colDelta;

      while (this.isWithinBounds({ row: currentRow, col: currentCol })) {
        const currentPos = { row: currentRow, col: currentCol };
        const pieceAtPos = this.getPieceAt(currentPos, board);

        if (pieceAtPos) {
          // If opponent piece, can capture (but stop here)
          if (pieceAtPos.owner !== queen.owner) {
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
   * Check if path is clear between two positions
   */
  static isPathClear(from: Position, to: Position, board: BoardState): boolean {
    const rowDiff = to.row - from.row;
    const colDiff = to.col - from.col;

    // Determine if move is diagonal or forward
    const isDiagonal = Math.abs(rowDiff) === Math.abs(colDiff) && rowDiff !== 0;
    const isForward = colDiff === 0 && rowDiff !== 0;

    if (!isDiagonal && !isForward) {
      return false;
    }

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
   * Check if Queen can capture at the destination
   */
  static canCapture(queen: Piece, target: Position, board: BoardState): boolean {
    const pieceAtTarget = this.getPieceAt(target, board);
    return pieceAtTarget !== undefined && pieceAtTarget.owner !== queen.owner;
  }

  /**
   * Validate if a move is legal for a Queen
   */
  static isValidMove(queen: Piece, to: Position, board: BoardState): boolean {
    const validDestinations = this.getValidDestinations(queen, board);
    return validDestinations.some(
      pos => pos.row === to.row && pos.col === to.col
    );
  }
}
