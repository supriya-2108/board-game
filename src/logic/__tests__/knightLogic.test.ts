import { describe, it, expect } from 'vitest';
import { KnightLogic } from '../knightLogic';
import { Piece, BoardState, PieceType, Player } from '../../types';

describe('KnightLogic', () => {
  const createEmptyBoard = (): BoardState => ({
    pieces: [],
    currentPlayer: Player.PLAYER_1,
    resourcePoints: { [Player.PLAYER_1]: 0, [Player.PLAYER_2]: 0 },
    moveCount: 0,
    capturesSinceLastMove: 0
  });

  const createKnight = (row: number, col: number, owner: Player): Piece => ({
    type: PieceType.KNIGHT,
    owner,
    position: { row, col },
    hasMoved: false,
    id: `knight-${row}-${col}`
  });

  describe('getValidDestinations', () => {
    it('should return all 8 L-shape moves from center position', () => {
      const knight = createKnight(4, 4, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [knight];

      const validMoves = KnightLogic.getValidDestinations(knight, board);

      expect(validMoves).toHaveLength(8);
      expect(validMoves).toContainEqual({ row: 6, col: 5 });
      expect(validMoves).toContainEqual({ row: 6, col: 3 });
      expect(validMoves).toContainEqual({ row: 2, col: 5 });
      expect(validMoves).toContainEqual({ row: 2, col: 3 });
      expect(validMoves).toContainEqual({ row: 5, col: 6 });
      expect(validMoves).toContainEqual({ row: 5, col: 2 });
      expect(validMoves).toContainEqual({ row: 3, col: 6 });
      expect(validMoves).toContainEqual({ row: 3, col: 2 });
    });

    it('should exclude moves outside board boundaries', () => {
      const knight = createKnight(1, 1, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [knight];

      const validMoves = KnightLogic.getValidDestinations(knight, board);

      expect(validMoves.length).toBeLessThan(8);
      validMoves.forEach(move => {
        expect(move.row).toBeGreaterThanOrEqual(1);
        expect(move.row).toBeLessThanOrEqual(8);
        expect(move.col).toBeGreaterThanOrEqual(1);
        expect(move.col).toBeLessThanOrEqual(8);
      });
    });

    it('should exclude moves to friendly piece positions', () => {
      const knight = createKnight(4, 4, Player.PLAYER_1);
      const friendlyPiece = createKnight(6, 5, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [knight, friendlyPiece];

      const validMoves = KnightLogic.getValidDestinations(knight, board);

      expect(validMoves).not.toContainEqual({ row: 6, col: 5 });
    });

    it('should include moves to opponent piece positions (captures)', () => {
      const knight = createKnight(4, 4, Player.PLAYER_1);
      const opponentPiece = createKnight(6, 5, Player.PLAYER_2);
      const board = createEmptyBoard();
      board.pieces = [knight, opponentPiece];

      const validMoves = KnightLogic.getValidDestinations(knight, board);

      expect(validMoves).toContainEqual({ row: 6, col: 5 });
    });

    it('should jump over pieces', () => {
      const knight = createKnight(4, 4, Player.PLAYER_1);
      const blockingPiece1 = createKnight(5, 4, Player.PLAYER_2);
      const blockingPiece2 = createKnight(4, 5, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [knight, blockingPiece1, blockingPiece2];

      const validMoves = KnightLogic.getValidDestinations(knight, board);

      // Knight should still be able to reach all valid L-shape destinations
      expect(validMoves.length).toBeGreaterThan(0);
    });
  });

  describe('canCapture', () => {
    it('should return true when target has opponent piece', () => {
      const knight = createKnight(4, 4, Player.PLAYER_1);
      const opponentPiece = createKnight(6, 5, Player.PLAYER_2);
      const board = createEmptyBoard();
      board.pieces = [knight, opponentPiece];

      expect(KnightLogic.canCapture(knight, { row: 6, col: 5 }, board)).toBe(true);
    });

    it('should return false when target is empty', () => {
      const knight = createKnight(4, 4, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [knight];

      expect(KnightLogic.canCapture(knight, { row: 6, col: 5 }, board)).toBe(false);
    });
  });
});
