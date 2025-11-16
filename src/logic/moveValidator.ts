import { Piece, Position, BoardState, MoveResult, PieceType } from '../types';
import { PieceLogic, PawnLogic } from './pieceLogic';
import { GameState } from './gameState';

/**
 * MoveValidator
 * Validates moves against piece-specific rules, checks path obstructions,
 * verifies destination validity, and handles capture logic
 */
export class MoveValidator {
  /**
   * Validate a move and return detailed result with error messages
   */
  static validateMove(piece: Piece, to: Position, board: BoardState): MoveResult {
    // Check if it's the piece owner's turn
    if (piece.owner !== board.currentPlayer) {
      return {
        valid: false,
        error: 'Invalid: not your turn'
      };
    }

    // Check if destination is within board boundaries
    if (!MoveValidator.isWithinBounds(to)) {
      return {
        valid: false,
        error: 'Invalid: out of bounds'
      };
    }

    // Validate against piece-specific movement rules first
    if (!PieceLogic.isValidMove(piece, to, board)) {
      return {
        valid: false,
        error: 'Invalid: illegal move for piece type'
      };
    }

    // Check if destination is occupied by friendly piece
    const pieceAtDestination = GameState.getPieceAt(to, board);
    if (pieceAtDestination && pieceAtDestination.owner === piece.owner) {
      return {
        valid: false,
        error: 'Invalid: blocked'
      };
    }

    // Check path obstruction for pieces that need clear paths
    if (!MoveValidator.checkPathClear(piece, to, board)) {
      return {
        valid: false,
        error: 'Invalid: obstructed'
      };
    }

    // Check capture validation
    const captureResult = MoveValidator.validateCapture(piece, to, board);
    if (!captureResult.valid) {
      return captureResult;
    }

    // Check for auto-promotion (Pawn reaching row 8)
    const movedPiece = { ...piece, position: to };
    const isAutoPromotion = piece.type === PieceType.PAWN && PawnLogic.shouldAutoPromote(movedPiece);

    // Move is valid - create the new state
    const move = {
      piece,
      from: { ...piece.position },
      to: { ...to },
      capturedPiece: pieceAtDestination,
      isUpgrade: isAutoPromotion,
      timestamp: Date.now()
    };

    const newState = GameState.applyMove(board, move);

    return {
      valid: true,
      newState,
      move
    };
  }

  /**
   * Get all valid moves for a piece
   */
  static getValidMoves(piece: Piece, board: BoardState): Position[] {
    // Only return moves if it's the piece owner's turn
    if (piece.owner !== board.currentPlayer) {
      return [];
    }

    return PieceLogic.getValidDestinations(piece, board);
  }

  /**
   * Check if path is clear between piece position and destination
   */
  static isPathClear(from: Position, to: Position, board: BoardState, pieceType: PieceType): boolean {
    return PieceLogic.isPathClear(from, to, board, pieceType);
  }

  /**
   * Check path obstruction for pieces that need clear paths
   * Knights can jump, so no obstruction check needed
   */
  private static checkPathClear(piece: Piece, to: Position, board: BoardState): boolean {
    // Knights can jump over pieces
    if (piece.type === PieceType.KNIGHT) {
      return true;
    }

    // For Bishops, Rooks, Queens, and Kings, check paths
    if (piece.type === PieceType.BISHOP || 
        piece.type === PieceType.ROOK || 
        piece.type === PieceType.QUEEN ||
        piece.type === PieceType.KING) {
      return PieceLogic.isPathClear(piece.position, to, board, piece.type);
    }

    // For Pawns, the getValidDestinations already handles obstruction
    // by not including occupied squares
    if (piece.type === PieceType.PAWN) {
      return true;
    }

    return true;
  }

  /**
   * Validate capture logic
   */
  private static validateCapture(piece: Piece, target: Position, board: BoardState): MoveResult {
    const pieceAtTarget = GameState.getPieceAt(target, board);

    // If no piece at target, no capture validation needed
    if (!pieceAtTarget) {
      return { valid: true };
    }

    // Pawns cannot capture in this game
    if (piece.type === PieceType.PAWN) {
      return {
        valid: false,
        error: 'Invalid: pawns cannot capture'
      };
    }

    // Knights, Bishops, Rooks, Queens, and Kings can capture opponent pieces
    if (pieceAtTarget.owner !== piece.owner) {
      return { valid: true };
    }

    // Should not reach here as friendly piece blocking is checked earlier
    return {
      valid: false,
      error: 'Invalid: blocked'
    };
  }

  /**
   * Validate and process a Pawn upgrade to Queen
   */
  static validateUpgrade(pieceId: string, board: BoardState): MoveResult {
    // Find the piece
    const piece = board.pieces.find(p => p.id === pieceId);
    
    if (!piece) {
      return {
        valid: false,
        error: 'Invalid: piece not found'
      };
    }

    // Check if it's the piece owner's turn
    if (piece.owner !== board.currentPlayer) {
      return {
        valid: false,
        error: 'Invalid: not your turn'
      };
    }

    // Check if piece is a Pawn
    if (piece.type !== PieceType.PAWN) {
      return {
        valid: false,
        error: 'Invalid: only pawns can be upgraded'
      };
    }

    // Check if player has at least 2 resource points
    if (board.resourcePoints[piece.owner] < 2) {
      return {
        valid: false,
        error: 'Invalid: insufficient resource points (need 2)'
      };
    }

    // Check if Pawn is not on row 1 or row 8
    if (piece.position.row === 1 || piece.position.row === 8) {
      return {
        valid: false,
        error: 'Invalid: cannot upgrade pawns on row 1 or row 8'
      };
    }

    // Create upgrade move
    const move = {
      piece,
      from: { ...piece.position },
      to: { ...piece.position },
      isUpgrade: true,
      timestamp: Date.now()
    };

    const newState = GameState.applyMove(board, move);

    return {
      valid: true,
      newState,
      move
    };
  }

  /**
   * Check if position is within board boundaries
   */
  private static isWithinBounds(position: Position): boolean {
    return position.row >= 1 && position.row <= 8 && 
           position.col >= 1 && position.col <= 8;
  }
}
