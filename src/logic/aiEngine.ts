import { BoardState, Move, Player, PieceType, Difficulty } from '../types';
import { MoveValidator } from './moveValidator';
import { PieceLogic } from './pieceLogic';

export class AIEngine {
  private static readonly TIME_LIMIT_MS = 5000; // 5 seconds

  static getPieceValue(type: PieceType): number {
    switch (type) {
      case PieceType.PAWN:
        return 10;
      case PieceType.KNIGHT:
        return 30;
      case PieceType.BISHOP:
        return 30;
      case PieceType.QUEEN:
        return 50;
    }
  }

  static orderMoves(moves: Move[], board: BoardState): Move[] {
    return moves.sort((a, b) => {
      const aIsCapture = a.capturedPiece !== undefined;
      const bIsCapture = b.capturedPiece !== undefined;
      
      if (aIsCapture && !bIsCapture) return -1;
      if (!aIsCapture && bIsCapture) return 1;
      
      if (aIsCapture && bIsCapture) {
        const aValue = this.getPieceValue(a.capturedPiece!.type);
        const bValue = this.getPieceValue(b.capturedPiece!.type);
        if (aValue !== bValue) return bValue - aValue;
      }

      const aIsUpgrade = a.isUpgrade === true;
      const bIsUpgrade = b.isUpgrade === true;
      
      if (aIsUpgrade && !bIsUpgrade) return -1;
      if (!aIsUpgrade && bIsUpgrade) return 1;

      const aForwardProgress = this.getForwardProgress(a);
      const bForwardProgress = this.getForwardProgress(b);
      
      if (aForwardProgress !== bForwardProgress) {
        return bForwardProgress - aForwardProgress;
      }

      return 0;
    });
  }

  private static getForwardProgress(move: Move): number {
    const piece = move.piece;
    const fromRow = move.from.row;
    const toRow = move.to.row;
    
    if (piece.owner === Player.PLAYER_1) {
      return toRow - fromRow;
    } else {
      return fromRow - toRow;
    }
  }

  static generateMoves(board: BoardState, player: Player): Move[] {
    const moves: Move[] = [];
    const playerPieces = board.pieces.filter(p => p.owner === player);

    for (const piece of playerPieces) {
      const validDestinations = PieceLogic.getValidDestinations(piece, board);
      
      for (const destination of validDestinations) {
        const result = MoveValidator.validateMove(piece, destination, board);
        
        if (result.valid && result.move) {
          moves.push(result.move);
        }
      }
    }

    return moves;
  }

  static getDepthForDifficulty(difficulty: Difficulty): number {
    switch (difficulty) {
      case Difficulty.EASY:
        return 4;
      case Difficulty.HARD:
        return 6;
    }
  }

  static calculateBestMove(board: BoardState, difficulty: Difficulty): Move | null {
    const depth = this.getDepthForDifficulty(difficulty);
    const startTime = Date.now();
    
    const moves = this.generateMoves(board, board.currentPlayer);
    
    if (moves.length === 0) {
      return null;
    }

    const orderedMoves = this.orderMoves(moves, board);
    let bestMove = orderedMoves[0];
    
    // Return first move if time limit is already exceeded
    if (Date.now() - startTime >= this.TIME_LIMIT_MS) {
      return bestMove;
    }

    // For now, return the best ordered move
    // This will be enhanced with minimax in task 7.1
    return bestMove;
  }
}
