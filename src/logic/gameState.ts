import { BoardState, Piece, PieceType, Player, Position, Move } from '../types';

/**
 * Game State Manager
 * Handles board initialization, state transitions, move history, and undo functionality
 */
export class GameState {
  /**
   * Initialize a new game board with starting positions
   */
  static initializeBoard(player1Name: string = 'Player 1', player2Name: string = 'Player 2'): BoardState {
    const pieces: Piece[] = [];

    // Player 1 pieces (rows 1-2)
    // Row 1: 4 Knights, 4 Bishops (back row)
    pieces.push(
      { type: PieceType.KNIGHT, owner: Player.PLAYER_1, position: { row: 1, col: 1 }, hasMoved: false, id: 'p1-knight-1' },
      { type: PieceType.KNIGHT, owner: Player.PLAYER_1, position: { row: 1, col: 2 }, hasMoved: false, id: 'p1-knight-2' },
      { type: PieceType.KNIGHT, owner: Player.PLAYER_1, position: { row: 1, col: 3 }, hasMoved: false, id: 'p1-knight-3' },
      { type: PieceType.KNIGHT, owner: Player.PLAYER_1, position: { row: 1, col: 4 }, hasMoved: false, id: 'p1-knight-4' },
      { type: PieceType.BISHOP, owner: Player.PLAYER_1, position: { row: 1, col: 5 }, hasMoved: false, id: 'p1-bishop-1' },
      { type: PieceType.BISHOP, owner: Player.PLAYER_1, position: { row: 1, col: 6 }, hasMoved: false, id: 'p1-bishop-2' },
      { type: PieceType.BISHOP, owner: Player.PLAYER_1, position: { row: 1, col: 7 }, hasMoved: false, id: 'p1-bishop-3' },
      { type: PieceType.BISHOP, owner: Player.PLAYER_1, position: { row: 1, col: 8 }, hasMoved: false, id: 'p1-bishop-4' }
    );

    // Row 2: 8 Pawns (front row)
    pieces.push(
      { type: PieceType.PAWN, owner: Player.PLAYER_1, position: { row: 2, col: 1 }, hasMoved: false, id: 'p1-pawn-1' },
      { type: PieceType.PAWN, owner: Player.PLAYER_1, position: { row: 2, col: 2 }, hasMoved: false, id: 'p1-pawn-2' },
      { type: PieceType.PAWN, owner: Player.PLAYER_1, position: { row: 2, col: 3 }, hasMoved: false, id: 'p1-pawn-3' },
      { type: PieceType.PAWN, owner: Player.PLAYER_1, position: { row: 2, col: 4 }, hasMoved: false, id: 'p1-pawn-4' },
      { type: PieceType.PAWN, owner: Player.PLAYER_1, position: { row: 2, col: 5 }, hasMoved: false, id: 'p1-pawn-5' },
      { type: PieceType.PAWN, owner: Player.PLAYER_1, position: { row: 2, col: 6 }, hasMoved: false, id: 'p1-pawn-6' },
      { type: PieceType.PAWN, owner: Player.PLAYER_1, position: { row: 2, col: 7 }, hasMoved: false, id: 'p1-pawn-7' },
      { type: PieceType.PAWN, owner: Player.PLAYER_1, position: { row: 2, col: 8 }, hasMoved: false, id: 'p1-pawn-8' }
    );

    // Player 2 pieces (rows 7-8)
    // Row 7: 8 Pawns (front row)
    pieces.push(
      { type: PieceType.PAWN, owner: Player.PLAYER_2, position: { row: 7, col: 1 }, hasMoved: false, id: 'p2-pawn-1' },
      { type: PieceType.PAWN, owner: Player.PLAYER_2, position: { row: 7, col: 2 }, hasMoved: false, id: 'p2-pawn-2' },
      { type: PieceType.PAWN, owner: Player.PLAYER_2, position: { row: 7, col: 3 }, hasMoved: false, id: 'p2-pawn-3' },
      { type: PieceType.PAWN, owner: Player.PLAYER_2, position: { row: 7, col: 4 }, hasMoved: false, id: 'p2-pawn-4' },
      { type: PieceType.PAWN, owner: Player.PLAYER_2, position: { row: 7, col: 5 }, hasMoved: false, id: 'p2-pawn-5' },
      { type: PieceType.PAWN, owner: Player.PLAYER_2, position: { row: 7, col: 6 }, hasMoved: false, id: 'p2-pawn-6' },
      { type: PieceType.PAWN, owner: Player.PLAYER_2, position: { row: 7, col: 7 }, hasMoved: false, id: 'p2-pawn-7' },
      { type: PieceType.PAWN, owner: Player.PLAYER_2, position: { row: 7, col: 8 }, hasMoved: false, id: 'p2-pawn-8' }
    );

    // Row 8: 4 Bishops, 4 Knights (back row)
    pieces.push(
      { type: PieceType.BISHOP, owner: Player.PLAYER_2, position: { row: 8, col: 1 }, hasMoved: false, id: 'p2-bishop-1' },
      { type: PieceType.BISHOP, owner: Player.PLAYER_2, position: { row: 8, col: 2 }, hasMoved: false, id: 'p2-bishop-2' },
      { type: PieceType.BISHOP, owner: Player.PLAYER_2, position: { row: 8, col: 3 }, hasMoved: false, id: 'p2-bishop-3' },
      { type: PieceType.BISHOP, owner: Player.PLAYER_2, position: { row: 8, col: 4 }, hasMoved: false, id: 'p2-bishop-4' },
      { type: PieceType.KNIGHT, owner: Player.PLAYER_2, position: { row: 8, col: 5 }, hasMoved: false, id: 'p2-knight-1' },
      { type: PieceType.KNIGHT, owner: Player.PLAYER_2, position: { row: 8, col: 6 }, hasMoved: false, id: 'p2-knight-2' },
      { type: PieceType.KNIGHT, owner: Player.PLAYER_2, position: { row: 8, col: 7 }, hasMoved: false, id: 'p2-knight-3' },
      { type: PieceType.KNIGHT, owner: Player.PLAYER_2, position: { row: 8, col: 8 }, hasMoved: false, id: 'p2-knight-4' }
    );

    return {
      pieces,
      currentPlayer: Player.PLAYER_1,
      playerNames: {
        [Player.PLAYER_1]: player1Name,
        [Player.PLAYER_2]: player2Name
      },
      resourcePoints: {
        [Player.PLAYER_1]: 0,
        [Player.PLAYER_2]: 0
      },
      moveCount: 0,
      capturesSinceLastMove: 0
    };
  }

  /**
   * Apply a move to the board state (immutable)
   */
  static applyMove(state: BoardState, move: Move): BoardState {
    const newPieces = state.pieces.map(p => ({ ...p }));

    // Remove captured piece if any
    if (move.capturedPiece) {
      const capturedIndex = newPieces.findIndex(p => p.id === move.capturedPiece!.id);
      if (capturedIndex !== -1) {
        newPieces.splice(capturedIndex, 1);
      }
    }

    // Update moving piece position and hasMoved flag
    const movingPieceIndex = newPieces.findIndex(p => p.id === move.piece.id);
    if (movingPieceIndex !== -1) {
      newPieces[movingPieceIndex] = {
        ...newPieces[movingPieceIndex],
        position: { ...move.to },
        hasMoved: true,
        type: move.isUpgrade ? PieceType.QUEEN : newPieces[movingPieceIndex].type
      };
    }

    // Calculate new resource points
    const newResourcePoints = { ...state.resourcePoints };
    if (move.capturedPiece) {
      newResourcePoints[state.currentPlayer] += 1;
    }
    if (move.isUpgrade) {
      newResourcePoints[state.currentPlayer] -= 2;
    }

    // Switch player (unless it's just an upgrade without movement)
    const isUpgradeOnly = move.isUpgrade && move.from.row === move.to.row && move.from.col === move.to.col;
    const nextPlayer = isUpgradeOnly ? state.currentPlayer : (state.currentPlayer === Player.PLAYER_1 ? Player.PLAYER_2 : Player.PLAYER_1);

    return {
      pieces: newPieces,
      currentPlayer: nextPlayer,
      playerNames: { ...state.playerNames },
      resourcePoints: newResourcePoints,
      moveCount: isUpgradeOnly ? state.moveCount : state.moveCount + 1,
      capturesSinceLastMove: move.capturedPiece ? 0 : (isUpgradeOnly ? state.capturesSinceLastMove : state.capturesSinceLastMove + 1)
    };
  }

  /**
   * Get piece at a specific position
   */
  static getPieceAt(position: Position, state: BoardState): Piece | undefined {
    return state.pieces.find(
      p => p.position.row === position.row && p.position.col === position.col
    );
  }

  /**
   * Clone board state (deep copy)
   */
  static cloneState(state: BoardState): BoardState {
    return {
      pieces: state.pieces.map(p => ({ ...p, position: { ...p.position } })),
      currentPlayer: state.currentPlayer,
      playerNames: { ...state.playerNames },
      resourcePoints: { ...state.resourcePoints },
      moveCount: state.moveCount,
      capturesSinceLastMove: state.capturesSinceLastMove
    };
  }
}
