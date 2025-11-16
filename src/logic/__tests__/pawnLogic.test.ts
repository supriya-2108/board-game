import { describe, it, expect } from 'vitest';
import { PawnLogic } from '../pawnLogic';
import { Piece, BoardState, PieceType, Player } from '../../types';

describe('PawnLogic', () => {
  const createEmptyBoard = (): BoardState => ({
    pieces: [],
    currentPlayer: Player.PLAYER_1,
    resourcePoints: { [Player.PLAYER_1]: 0, [Player.PLAYER_2]: 0 },
    moveCount: 0,
    capturesSinceLastMove: 0
  });

  const createPawn = (row: number, col: number, owner: Player, hasMoved: boolean = false): Piece => ({
    type: PieceType.PAWN,
    owner,
    position: { row, col },
    hasMoved,
    id: `pawn-${row}-${col}`
  });

  describe('getValidDestinations', () => {
    it('should allow Pawn to move 1-2 squares forward on first move', () => {
      const pawn = createPawn(2, 4, Player.PLAYER_1, false);
      const board = createEmptyBoard();
      board.pieces = [pawn];

      const validMoves = PawnLogic.getValidDestinations(pawn, board);

      expect(validMoves).toHaveLength(2);
      expect(validMoves).toContainEqual({ row: 3, col: 4 });
      expect(validMoves).toContainEqual({ row: 4, col: 4 });
    });

    it('should allow Pawn to move only 1 square forward after first move', () => {
      const pawn = createPawn(3, 4, Player.PLAYER_1, true);
      const board = createEmptyBoard();
      board.pieces = [pawn];

      const validMoves = PawnLogic.getValidDestinations(pawn, board);

      expect(validMoves).toHaveLength(1);
      expect(validMoves).toContainEqual({ row: 4, col: 4 });
    });

    it('should not allow Pawn to move to occupied square', () => {
      const pawn = createPawn(2, 4, Player.PLAYER_1, false);
      const blockingPiece = createPawn(3, 4, Player.PLAYER_2, true);
      const board = createEmptyBoard();
      board.pieces = [pawn, blockingPiece];

      const validMoves = PawnLogic.getValidDestinations(pawn, board);

      expect(validMoves).toHaveLength(0);
    });

    it('should move Player 2 Pawn in opposite direction', () => {
      const pawn = createPawn(7, 4, Player.PLAYER_2, false);
      const board = createEmptyBoard();
      board.pieces = [pawn];

      const validMoves = PawnLogic.getValidDestinations(pawn, board);

      expect(validMoves).toHaveLength(2);
      expect(validMoves).toContainEqual({ row: 6, col: 4 });
      expect(validMoves).toContainEqual({ row: 5, col: 4 });
    });
  });

  describe('shouldAutoPromote', () => {
    it('should return true when Player 1 Pawn reaches row 8', () => {
      const pawn = createPawn(8, 4, Player.PLAYER_1, true);
      expect(PawnLogic.shouldAutoPromote(pawn)).toBe(true);
    });

    it('should return true when Player 2 Pawn reaches row 1', () => {
      const pawn = createPawn(1, 4, Player.PLAYER_2, true);
      expect(PawnLogic.shouldAutoPromote(pawn)).toBe(true);
    });

    it('should return false when Pawn is not at promotion row', () => {
      const pawn = createPawn(5, 4, Player.PLAYER_1, true);
      expect(PawnLogic.shouldAutoPromote(pawn)).toBe(false);
    });
  });

  describe('promoteToQueen', () => {
    it('should convert Pawn to Queen', () => {
      const pawn = createPawn(8, 4, Player.PLAYER_1, true);
      const queen = PawnLogic.promoteToQueen(pawn);

      expect(queen.type).toBe(PieceType.QUEEN);
      expect(queen.owner).toBe(pawn.owner);
      expect(queen.position).toEqual(pawn.position);
    });
  });
});
