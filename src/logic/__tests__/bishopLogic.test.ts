import { describe, it, expect } from 'vitest';
import { BishopLogic } from '../bishopLogic';
import { Piece, BoardState, PieceType, Player } from '../../types';

describe('BishopLogic', () => {
  const createEmptyBoard = (): BoardState => ({
    pieces: [],
    currentPlayer: Player.PLAYER_1,
    resourcePoints: { [Player.PLAYER_1]: 0, [Player.PLAYER_2]: 0 },
    moveCount: 0,
    capturesSinceLastMove: 0
  });

  const createBishop = (row: number, col: number, owner: Player): Piece => ({
    type: PieceType.BISHOP,
    owner,
    position: { row, col },
    hasMoved: false,
    id: `bishop-${row}-${col}`
  });

  const createPawn = (row: number, col: number, owner: Player): Piece => ({
    type: PieceType.PAWN,
    owner,
    position: { row, col },
    hasMoved: false,
    id: `pawn-${row}-${col}`
  });

  describe('getValidDestinations', () => {
    it('should return all diagonal moves from center position', () => {
      const bishop = createBishop(4, 4, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [bishop];

      const validMoves = BishopLogic.getValidDestinations(bishop, board);

      // Should have moves in all 4 diagonal directions
      expect(validMoves.length).toBeGreaterThan(0);
      expect(validMoves).toContainEqual({ row: 5, col: 5 });
      expect(validMoves).toContainEqual({ row: 3, col: 3 });
      expect(validMoves).toContainEqual({ row: 5, col: 3 });
      expect(validMoves).toContainEqual({ row: 3, col: 5 });
    });

    it('should stop at board boundaries', () => {
      const bishop = createBishop(4, 4, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [bishop];

      const validMoves = BishopLogic.getValidDestinations(bishop, board);

      validMoves.forEach(move => {
        expect(move.row).toBeGreaterThanOrEqual(1);
        expect(move.row).toBeLessThanOrEqual(8);
        expect(move.col).toBeGreaterThanOrEqual(1);
        expect(move.col).toBeLessThanOrEqual(8);
      });
    });

    it('should stop before friendly piece', () => {
      const bishop = createBishop(4, 4, Player.PLAYER_1);
      const friendlyPiece = createPawn(6, 6, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [bishop, friendlyPiece];

      const validMoves = BishopLogic.getValidDestinations(bishop, board);

      expect(validMoves).toContainEqual({ row: 5, col: 5 });
      expect(validMoves).not.toContainEqual({ row: 6, col: 6 });
      expect(validMoves).not.toContainEqual({ row: 7, col: 7 });
    });

    it('should capture opponent piece and stop', () => {
      const bishop = createBishop(4, 4, Player.PLAYER_1);
      const opponentPiece = createPawn(6, 6, Player.PLAYER_2);
      const board = createEmptyBoard();
      board.pieces = [bishop, opponentPiece];

      const validMoves = BishopLogic.getValidDestinations(bishop, board);

      expect(validMoves).toContainEqual({ row: 5, col: 5 });
      expect(validMoves).toContainEqual({ row: 6, col: 6 });
      expect(validMoves).not.toContainEqual({ row: 7, col: 7 });
    });
  });

  describe('isPathClear', () => {
    it('should return true for clear diagonal path', () => {
      const bishop = createBishop(4, 4, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [bishop];

      expect(BishopLogic.isPathClear({ row: 4, col: 4 }, { row: 7, col: 7 }, board)).toBe(true);
    });

    it('should return false when path is obstructed', () => {
      const bishop = createBishop(4, 4, Player.PLAYER_1);
      const blockingPiece = createPawn(5, 5, Player.PLAYER_2);
      const board = createEmptyBoard();
      board.pieces = [bishop, blockingPiece];

      expect(BishopLogic.isPathClear({ row: 4, col: 4 }, { row: 7, col: 7 }, board)).toBe(false);
    });

    it('should return false for non-diagonal path', () => {
      const board = createEmptyBoard();

      expect(BishopLogic.isPathClear({ row: 4, col: 4 }, { row: 4, col: 7 }, board)).toBe(false);
    });
  });

  describe('canCapture', () => {
    it('should return true when target has opponent piece', () => {
      const bishop = createBishop(4, 4, Player.PLAYER_1);
      const opponentPiece = createPawn(6, 6, Player.PLAYER_2);
      const board = createEmptyBoard();
      board.pieces = [bishop, opponentPiece];

      expect(BishopLogic.canCapture(bishop, { row: 6, col: 6 }, board)).toBe(true);
    });

    it('should return false when target is empty', () => {
      const bishop = createBishop(4, 4, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [bishop];

      expect(BishopLogic.canCapture(bishop, { row: 6, col: 6 }, board)).toBe(false);
    });
  });
});
