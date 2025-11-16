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
      case PieceType.ROOK:
        return 50;
      case PieceType.QUEEN:
        return 90;
      case PieceType.KING:
        return 10000;
    }
  }

  static orderMoves(moves: Move[], board: BoardState): Move[] {
    return moves.sort((a, b) => {
      // Prioritize King captures (immediate win)
      const aIsKingCapture = a.capturedPiece?.type === PieceType.KING;
      const bIsKingCapture = b.capturedPiece?.type === PieceType.KING;
      
      if (aIsKingCapture && !bIsKingCapture) return -1;
      if (!aIsKingCapture && bIsKingCapture) return 1;
      
      // Prioritize King moves that improve safety
      const aIsKingMove = a.piece.type === PieceType.KING;
      const bIsKingMove = b.piece.type === PieceType.KING;
      
      if (aIsKingMove && !bIsKingMove) {
        // King moves are important, but not more than captures
        const bIsCapture = b.capturedPiece !== undefined;
        if (bIsCapture && !aIsKingCapture) return 1;
      }
      if (!aIsKingMove && bIsKingMove) {
        const aIsCapture = a.capturedPiece !== undefined;
        if (aIsCapture && !bIsKingCapture) return -1;
      }
      
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

  static evaluateKingSafety(board: BoardState, player: Player): number {
    // Find the player's King
    const king = board.pieces.find(p => p.owner === player && p.type === PieceType.KING);
    
    if (!king) {
      // King is captured - worst possible position
      return -10000;
    }
    
    let safetyScore = 0;
    
    // Bonus for King being on back rows (safer positions)
    if (player === Player.PLAYER_1) {
      if (king.position.row <= 2) {
        safetyScore += 20;
      }
    } else {
      if (king.position.row >= 7) {
        safetyScore += 20;
      }
    }
    
    // Bonus for King being protected by friendly pieces nearby
    const friendlyPiecesNearby = board.pieces.filter(p => {
      if (p.owner !== player || p.id === king.id) return false;
      
      const rowDiff = Math.abs(p.position.row - king.position.row);
      const colDiff = Math.abs(p.position.col - king.position.col);
      
      // Check if piece is within 2 squares of King
      return rowDiff <= 2 && colDiff <= 2;
    });
    
    safetyScore += friendlyPiecesNearby.length * 5;
    
    // Penalty for enemy pieces near King
    const opponent = player === Player.PLAYER_1 ? Player.PLAYER_2 : Player.PLAYER_1;
    const enemyPiecesNearby = board.pieces.filter(p => {
      if (p.owner !== opponent) return false;
      
      const rowDiff = Math.abs(p.position.row - king.position.row);
      const colDiff = Math.abs(p.position.col - king.position.col);
      
      // Check if enemy piece is within 3 squares of King
      return rowDiff <= 3 && colDiff <= 3;
    });
    
    safetyScore -= enemyPiecesNearby.length * 10;
    
    return safetyScore;
  }

  static evaluatePosition(board: BoardState, player: Player): number {
    let score = 0;
    
    // Material value
    for (const piece of board.pieces) {
      const value = this.getPieceValue(piece.type);
      score += piece.owner === player ? value : -value;
    }
    
    // Resource points (weighted heavily)
    const opponent = player === Player.PLAYER_1 ? Player.PLAYER_2 : Player.PLAYER_1;
    score += board.resourcePoints[player] * 10;
    score -= board.resourcePoints[opponent] * 10;
    
    // King safety evaluation (critical)
    score += this.evaluateKingSafety(board, player);
    score -= this.evaluateKingSafety(board, opponent);
    
    // Mobility (number of valid moves)
    const playerMoves = this.generateMoves(board, player);
    const opponentMoves = this.generateMoves(board, opponent);
    score += playerMoves.length * 2;
    score -= opponentMoves.length * 2;
    
    return score;
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
