import { describe, it, expect } from 'vitest';
import { QueenLogic } from '../queenLogic';
import { Piece, BoardState, PieceType, Player } from '../../types';

describe('QueenLogic', () => {
  const createEmptyBoard = (): BoardState => ({
    pieces: [],
    currentPlayer: Player.PLAYER_1,
    resourcePoints: { [Player.PLAYER_1]: 0, [Player.PLAYER_2]: 0 },
    moveCount: 0,
    capturesSinceLastMove: 0
  });

  const createQueen = (row: number, col: number, owner: Player): Piece => ({
    type: PieceType.QUEEN,
    owner,
    position: { row, col },
    hasMoved: false,
    id: `queen-${row}-${col}`
  });

  const createPawn = (row: number, col: number, owner: Player): Piece => ({
    type: PieceType.PAWN,
    owner,
    position: { row, col },
    hasMoved: false,
    id: `pawn-${row}-${col}`
  });

  describe('getValidDestinations', () => {
    it('should return diagonal and forward moves', () => {
      const queen = createQueen(4, 4, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [queen];

      const validMoves = QueenLogic.getValidDestinations(queen, board);

      // Should have diagonal moves
      expect(validMoves).toContainEqual({ row: 5, col: 5 });
      expect(validMoves).toContainEqual({ row: 3, col: 3 });
      
      // Should have forward moves (Player 1 moves up)
      expect(validMoves).toContainEqual({ row: 5, col: 4 });
      expect(validMoves).toContainEqual({ row: 6, col: 4 });
    });

    it('should move forward in correct direction for Player 2', () => {
      const queen = createQueen(6, 4, Player.PLAYER_2);
      const board = createEmptyBoard();
      board.pieces = [queen];

      const validMoves = QueenLogic.getValidDestinations(queen, board);

      // Player 2 moves down (decreasing row)
      expect(validMoves).toContainEqual({ row: 5, col: 4 });
      expect(validMoves).toContainEqual({ row: 4, col: 4 });
    });

    it('should stop at obstructions in all directions', () => {
      const queen = createQueen(4, 4, Player.PLAYER_1);
      const blockDiagonal = createPawn(6, 6, Player.PLAYER_1);
      const blockForward = createPawn(6, 4, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [queen, blockDiagonal, blockForward];

      const validMoves = QueenLogic.getValidDestinations(queen, board);

      // Should stop before friendly pieces
      expect(validMoves).toContainEqual({ row: 5, col: 5 });
      expect(validMoves).not.toContainEqual({ row: 6, col: 6 });
      expect(validMoves).toContainEqual({ row: 5, col: 4 });
      expect(validMoves).not.toContainEqual({ row: 6, col: 4 });
    });

    it('should capture opponent pieces', () => {
      const queen = createQueen(4, 4, Player.PLAYER_1);
      const opponentDiagonal = createPawn(6, 6, Player.PLAYER_2);
      const opponentForward = createPawn(6, 4, Player.PLAYER_2);
      const board = createEmptyBoard();
      board.pieces = [queen, opponentDiagonal, opponentForward];

      const validMoves = QueenLogic.getValidDestinations(queen, board);

      // Should include capture positions but not beyond
      expect(validMoves).toContainEqual({ row: 6, col: 6 });
      expect(validMoves).not.toContainEqual({ row: 7, col: 7 });
      expect(validMoves).toContainEqual({ row: 6, col: 4 });
      expect(validMoves).not.toContainEqual({ row: 7, col: 4 });
    });
  });

  describe('isPathClear', () => {
    it('should return true for clear diagonal path', () => {
      const queen = createQueen(4, 4, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [queen];

      expect(QueenLogic.isPathClear({ row: 4, col: 4 }, { row: 7, col: 7 }, board)).toBe(true);
    });

    it('should return true for clear forward path', () => {
      const queen = createQueen(4, 4, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [queen];

      expect(QueenLogic.isPathClear({ row: 4, col: 4 }, { row: 7, col: 4 }, board)).toBe(true);
    });

    it('should return false when diagonal path is obstructed', () => {
      const queen = createQueen(4, 4, Player.PLAYER_1);
      const blockingPiece = createPawn(5, 5, Player.PLAYER_2);
      const board = createEmptyBoard();
      board.pieces = [queen, blockingPiece];

      expect(QueenLogic.isPathClear({ row: 4, col: 4 }, { row: 7, col: 7 }, board)).toBe(false);
    });

    it('should return false when forward path is obstructed', () => {
      const queen = createQueen(4, 4, Player.PLAYER_1);
      const blockingPiece = createPawn(5, 4, Player.PLAYER_2);
      const board = createEmptyBoard();
      board.pieces = [queen, blockingPiece];

      expect(QueenLogic.isPathClear({ row: 4, col: 4 }, { row: 7, col: 4 }, board)).toBe(false);
    });
  });

  describe('canCapture', () => {
    it('should return true when target has opponent piece', () => {
      const queen = createQueen(4, 4, Player.PLAYER_1);
      const opponentPiece = createPawn(6, 6, Player.PLAYER_2);
      const board = createEmptyBoard();
      board.pieces = [queen, opponentPiece];

      expect(QueenLogic.canCapture(queen, { row: 6, col: 6 }, board)).toBe(true);
    });

    it('should return false when target is empty', () => {
      const queen = createQueen(4, 4, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [queen];

      expect(QueenLogic.canCapture(queen, { row: 6, col: 6 }, board)).toBe(false);
    });
  });
});
