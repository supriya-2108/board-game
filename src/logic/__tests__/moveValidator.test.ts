import { describe, it, expect } from 'vitest';
import { MoveValidator } from '../moveValidator';
import { Piece, BoardState, PieceType, Player } from '../../types';

describe('MoveValidator', () => {
  const createEmptyBoard = (): BoardState => ({
    pieces: [],
    currentPlayer: Player.PLAYER_1,
    resourcePoints: { [Player.PLAYER_1]: 0, [Player.PLAYER_2]: 0 },
    moveCount: 0,
    capturesSinceLastMove: 0
  });

  const createPiece = (
    type: PieceType,
    row: number,
    col: number,
    owner: Player,
    hasMoved: boolean = false
  ): Piece => ({
    type,
    owner,
    position: { row, col },
    hasMoved,
    id: `${type}-${owner}-${row}-${col}`
  });

  describe('validateMove - turn validation', () => {
    it('should reject move when not player turn', () => {
      const knight = createPiece(PieceType.KNIGHT, 4, 4, Player.PLAYER_2);
      const board = createEmptyBoard();
      board.pieces = [knight];
      board.currentPlayer = Player.PLAYER_1;

      const result = MoveValidator.validateMove(knight, { row: 6, col: 5 }, board);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid: not your turn');
    });

    it('should allow move when it is player turn', () => {
      const knight = createPiece(PieceType.KNIGHT, 4, 4, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [knight];
      board.currentPlayer = Player.PLAYER_1;

      const result = MoveValidator.validateMove(knight, { row: 6, col: 5 }, board);

      expect(result.valid).toBe(true);
    });
  });

  describe('validateMove - boundary validation', () => {
    it('should reject move outside board boundaries (row too high)', () => {
      const knight = createPiece(PieceType.KNIGHT, 7, 4, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [knight];

      const result = MoveValidator.validateMove(knight, { row: 9, col: 5 }, board);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid: out of bounds');
    });

    it('should reject move outside board boundaries (row too low)', () => {
      const knight = createPiece(PieceType.KNIGHT, 2, 4, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [knight];

      const result = MoveValidator.validateMove(knight, { row: 0, col: 5 }, board);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid: out of bounds');
    });

    it('should reject move outside board boundaries (col too high)', () => {
      const knight = createPiece(PieceType.KNIGHT, 4, 7, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [knight];

      const result = MoveValidator.validateMove(knight, { row: 5, col: 9 }, board);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid: out of bounds');
    });
  });

  describe('validateMove - friendly piece blocking', () => {
    it('should reject move to square occupied by friendly piece', () => {
      const knight = createPiece(PieceType.KNIGHT, 4, 4, Player.PLAYER_1);
      const friendlyPiece = createPiece(PieceType.PAWN, 6, 5, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [knight, friendlyPiece];

      const result = MoveValidator.validateMove(knight, { row: 6, col: 5 }, board);

      expect(result.valid).toBe(false);
      // Piece logic already handles this, so it returns illegal move
      expect(result.error).toBe('Invalid: illegal move for piece type');
    });
  });

  describe('validateMove - path obstruction', () => {
    it('should reject Bishop move with obstructed path', () => {
      const bishop = createPiece(PieceType.BISHOP, 3, 3, Player.PLAYER_1);
      const blockingPiece = createPiece(PieceType.PAWN, 4, 4, Player.PLAYER_2);
      const board = createEmptyBoard();
      board.pieces = [bishop, blockingPiece];

      const result = MoveValidator.validateMove(bishop, { row: 5, col: 5 }, board);

      expect(result.valid).toBe(false);
      // Piece logic already handles obstruction, so it returns illegal move
      expect(result.error).toBe('Invalid: illegal move for piece type');
    });

    it('should allow Bishop move with clear path', () => {
      const bishop = createPiece(PieceType.BISHOP, 3, 3, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [bishop];

      const result = MoveValidator.validateMove(bishop, { row: 5, col: 5 }, board);

      expect(result.valid).toBe(true);
    });

    it('should allow Knight move regardless of obstructions', () => {
      const knight = createPiece(PieceType.KNIGHT, 4, 4, Player.PLAYER_1);
      const blockingPiece = createPiece(PieceType.PAWN, 5, 4, Player.PLAYER_2);
      const board = createEmptyBoard();
      board.pieces = [knight, blockingPiece];

      const result = MoveValidator.validateMove(knight, { row: 6, col: 5 }, board);

      expect(result.valid).toBe(true);
    });

    it('should reject Queen move with obstructed diagonal path', () => {
      const queen = createPiece(PieceType.QUEEN, 3, 3, Player.PLAYER_1);
      const blockingPiece = createPiece(PieceType.PAWN, 4, 4, Player.PLAYER_2);
      const board = createEmptyBoard();
      board.pieces = [queen, blockingPiece];

      const result = MoveValidator.validateMove(queen, { row: 5, col: 5 }, board);

      expect(result.valid).toBe(false);
      // Piece logic already handles obstruction, so it returns illegal move
      expect(result.error).toBe('Invalid: illegal move for piece type');
    });

    it('should reject Queen move with obstructed forward path', () => {
      const queen = createPiece(PieceType.QUEEN, 3, 3, Player.PLAYER_1);
      const blockingPiece = createPiece(PieceType.PAWN, 4, 3, Player.PLAYER_2);
      const board = createEmptyBoard();
      board.pieces = [queen, blockingPiece];

      const result = MoveValidator.validateMove(queen, { row: 5, col: 3 }, board);

      expect(result.valid).toBe(false);
      // Piece logic already handles obstruction, so it returns illegal move
      expect(result.error).toBe('Invalid: illegal move for piece type');
    });
  });

  describe('validateMove - piece-specific rules', () => {
    it('should reject invalid Pawn move (sideways)', () => {
      const pawn = createPiece(PieceType.PAWN, 3, 3, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [pawn];

      const result = MoveValidator.validateMove(pawn, { row: 3, col: 4 }, board);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid: illegal move for piece type');
    });

    it('should allow valid Pawn move (forward 1)', () => {
      const pawn = createPiece(PieceType.PAWN, 3, 3, Player.PLAYER_1, true);
      const board = createEmptyBoard();
      board.pieces = [pawn];

      const result = MoveValidator.validateMove(pawn, { row: 4, col: 3 }, board);

      expect(result.valid).toBe(true);
    });

    it('should allow valid Pawn move (forward 2 on first move)', () => {
      const pawn = createPiece(PieceType.PAWN, 3, 3, Player.PLAYER_1, false);
      const board = createEmptyBoard();
      board.pieces = [pawn];

      const result = MoveValidator.validateMove(pawn, { row: 5, col: 3 }, board);

      expect(result.valid).toBe(true);
    });

    it('should reject invalid Knight move (not L-shape)', () => {
      const knight = createPiece(PieceType.KNIGHT, 4, 4, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [knight];

      const result = MoveValidator.validateMove(knight, { row: 5, col: 5 }, board);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid: illegal move for piece type');
    });

    it('should allow valid Knight L-shape move', () => {
      const knight = createPiece(PieceType.KNIGHT, 4, 4, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [knight];

      const result = MoveValidator.validateMove(knight, { row: 6, col: 5 }, board);

      expect(result.valid).toBe(true);
    });

    it('should reject invalid Bishop move (not diagonal)', () => {
      const bishop = createPiece(PieceType.BISHOP, 3, 3, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [bishop];

      const result = MoveValidator.validateMove(bishop, { row: 5, col: 3 }, board);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid: illegal move for piece type');
    });

    it('should allow valid Bishop diagonal move', () => {
      const bishop = createPiece(PieceType.BISHOP, 3, 3, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [bishop];

      const result = MoveValidator.validateMove(bishop, { row: 6, col: 6 }, board);

      expect(result.valid).toBe(true);
    });
  });

  describe('validateMove - capture validation', () => {
    it('should allow Knight to capture opponent piece', () => {
      const knight = createPiece(PieceType.KNIGHT, 4, 4, Player.PLAYER_1);
      const opponentPiece = createPiece(PieceType.PAWN, 6, 5, Player.PLAYER_2);
      const board = createEmptyBoard();
      board.pieces = [knight, opponentPiece];

      const result = MoveValidator.validateMove(knight, { row: 6, col: 5 }, board);

      expect(result.valid).toBe(true);
      expect(result.move?.capturedPiece).toBeDefined();
      expect(result.move?.capturedPiece?.id).toBe(opponentPiece.id);
    });

    it('should allow Bishop to capture opponent piece', () => {
      const bishop = createPiece(PieceType.BISHOP, 3, 3, Player.PLAYER_1);
      const opponentPiece = createPiece(PieceType.PAWN, 5, 5, Player.PLAYER_2);
      const board = createEmptyBoard();
      board.pieces = [bishop, opponentPiece];

      const result = MoveValidator.validateMove(bishop, { row: 5, col: 5 }, board);

      expect(result.valid).toBe(true);
      expect(result.move?.capturedPiece).toBeDefined();
    });

    it('should allow Queen to capture opponent piece', () => {
      const queen = createPiece(PieceType.QUEEN, 3, 3, Player.PLAYER_1);
      const opponentPiece = createPiece(PieceType.PAWN, 5, 5, Player.PLAYER_2);
      const board = createEmptyBoard();
      board.pieces = [queen, opponentPiece];

      const result = MoveValidator.validateMove(queen, { row: 5, col: 5 }, board);

      expect(result.valid).toBe(true);
      expect(result.move?.capturedPiece).toBeDefined();
    });

    it('should prevent Pawn from capturing', () => {
      const pawn = createPiece(PieceType.PAWN, 3, 3, Player.PLAYER_1);
      const opponentPiece = createPiece(PieceType.PAWN, 4, 3, Player.PLAYER_2);
      const board = createEmptyBoard();
      board.pieces = [pawn, opponentPiece];

      const result = MoveValidator.validateMove(pawn, { row: 4, col: 3 }, board);

      expect(result.valid).toBe(false);
      // Pawn logic already prevents moving to occupied squares
      expect(result.error).toBe('Invalid: illegal move for piece type');
    });
  });

  describe('validateMove - state updates', () => {
    it('should return new state with updated piece position', () => {
      const knight = createPiece(PieceType.KNIGHT, 4, 4, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [knight];

      const result = MoveValidator.validateMove(knight, { row: 6, col: 5 }, board);

      expect(result.valid).toBe(true);
      expect(result.newState).toBeDefined();
      const movedPiece = result.newState!.pieces.find(p => p.id === knight.id);
      expect(movedPiece?.position).toEqual({ row: 6, col: 5 });
    });

    it('should award resource points on capture', () => {
      const knight = createPiece(PieceType.KNIGHT, 4, 4, Player.PLAYER_1);
      const opponentPiece = createPiece(PieceType.PAWN, 6, 5, Player.PLAYER_2);
      const board = createEmptyBoard();
      board.pieces = [knight, opponentPiece];
      board.resourcePoints[Player.PLAYER_1] = 0;

      const result = MoveValidator.validateMove(knight, { row: 6, col: 5 }, board);

      expect(result.valid).toBe(true);
      expect(result.newState?.resourcePoints[Player.PLAYER_1]).toBe(1);
    });

    it('should switch current player after move', () => {
      const knight = createPiece(PieceType.KNIGHT, 4, 4, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [knight];
      board.currentPlayer = Player.PLAYER_1;

      const result = MoveValidator.validateMove(knight, { row: 6, col: 5 }, board);

      expect(result.valid).toBe(true);
      expect(result.newState?.currentPlayer).toBe(Player.PLAYER_2);
    });
  });

  describe('getValidMoves', () => {
    it('should return valid moves for piece when it is their turn', () => {
      const knight = createPiece(PieceType.KNIGHT, 4, 4, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [knight];
      board.currentPlayer = Player.PLAYER_1;

      const validMoves = MoveValidator.getValidMoves(knight, board);

      expect(validMoves.length).toBeGreaterThan(0);
    });

    it('should return empty array when not player turn', () => {
      const knight = createPiece(PieceType.KNIGHT, 4, 4, Player.PLAYER_2);
      const board = createEmptyBoard();
      board.pieces = [knight];
      board.currentPlayer = Player.PLAYER_1;

      const validMoves = MoveValidator.getValidMoves(knight, board);

      expect(validMoves).toHaveLength(0);
    });
  });

  describe('isPathClear', () => {
    it('should return true for clear diagonal path', () => {
      const board = createEmptyBoard();

      const result = MoveValidator.isPathClear(
        { row: 2, col: 2 },
        { row: 5, col: 5 },
        board,
        PieceType.BISHOP
      );

      expect(result).toBe(true);
    });

    it('should return false for obstructed diagonal path', () => {
      const blockingPiece = createPiece(PieceType.PAWN, 3, 3, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [blockingPiece];

      const result = MoveValidator.isPathClear(
        { row: 2, col: 2 },
        { row: 5, col: 5 },
        board,
        PieceType.BISHOP
      );

      expect(result).toBe(false);
    });

    it('should return true for Knight (can jump)', () => {
      const blockingPiece = createPiece(PieceType.PAWN, 5, 4, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [blockingPiece];

      const result = MoveValidator.isPathClear(
        { row: 4, col: 4 },
        { row: 6, col: 5 },
        board,
        PieceType.KNIGHT
      );

      expect(result).toBe(true);
    });
  });

  describe('validateUpgrade', () => {
    it('should successfully upgrade Pawn to Queen with sufficient resources', () => {
      const pawn = createPiece(PieceType.PAWN, 4, 3, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [pawn];
      board.currentPlayer = Player.PLAYER_1;
      board.resourcePoints[Player.PLAYER_1] = 2;

      const result = MoveValidator.validateUpgrade(pawn.id, board);

      expect(result.valid).toBe(true);
      expect(result.newState).toBeDefined();
      const upgradedPiece = result.newState!.pieces.find(p => p.id === pawn.id);
      expect(upgradedPiece?.type).toBe(PieceType.QUEEN);
    });

    it('should deduct 2 resource points on upgrade', () => {
      const pawn = createPiece(PieceType.PAWN, 4, 3, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [pawn];
      board.currentPlayer = Player.PLAYER_1;
      board.resourcePoints[Player.PLAYER_1] = 3;

      const result = MoveValidator.validateUpgrade(pawn.id, board);

      expect(result.valid).toBe(true);
      expect(result.newState?.resourcePoints[Player.PLAYER_1]).toBe(1);
    });

    it('should reject upgrade with insufficient resource points', () => {
      const pawn = createPiece(PieceType.PAWN, 4, 3, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [pawn];
      board.currentPlayer = Player.PLAYER_1;
      board.resourcePoints[Player.PLAYER_1] = 1;

      const result = MoveValidator.validateUpgrade(pawn.id, board);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid: insufficient resource points (need 2)');
    });

    it('should reject upgrade of non-Pawn piece', () => {
      const knight = createPiece(PieceType.KNIGHT, 4, 3, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [knight];
      board.currentPlayer = Player.PLAYER_1;
      board.resourcePoints[Player.PLAYER_1] = 2;

      const result = MoveValidator.validateUpgrade(knight.id, board);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid: only pawns can be upgraded');
    });

    it('should reject upgrade of Pawn on row 1', () => {
      const pawn = createPiece(PieceType.PAWN, 1, 3, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [pawn];
      board.currentPlayer = Player.PLAYER_1;
      board.resourcePoints[Player.PLAYER_1] = 2;

      const result = MoveValidator.validateUpgrade(pawn.id, board);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid: cannot upgrade pawns on row 1 or row 8');
    });

    it('should reject upgrade of Pawn on row 8', () => {
      const pawn = createPiece(PieceType.PAWN, 8, 3, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [pawn];
      board.currentPlayer = Player.PLAYER_1;
      board.resourcePoints[Player.PLAYER_1] = 2;

      const result = MoveValidator.validateUpgrade(pawn.id, board);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid: cannot upgrade pawns on row 1 or row 8');
    });

    it('should reject upgrade when not player turn', () => {
      const pawn = createPiece(PieceType.PAWN, 4, 3, Player.PLAYER_2);
      const board = createEmptyBoard();
      board.pieces = [pawn];
      board.currentPlayer = Player.PLAYER_1;
      board.resourcePoints[Player.PLAYER_2] = 2;

      const result = MoveValidator.validateUpgrade(pawn.id, board);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid: not your turn');
    });

    it('should reject upgrade for non-existent piece', () => {
      const board = createEmptyBoard();
      board.currentPlayer = Player.PLAYER_1;
      board.resourcePoints[Player.PLAYER_1] = 2;

      const result = MoveValidator.validateUpgrade('non-existent-id', board);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid: piece not found');
    });

    it('should record upgrade in move history', () => {
      const pawn = createPiece(PieceType.PAWN, 4, 3, Player.PLAYER_1);
      const board = createEmptyBoard();
      board.pieces = [pawn];
      board.currentPlayer = Player.PLAYER_1;
      board.resourcePoints[Player.PLAYER_1] = 2;

      const result = MoveValidator.validateUpgrade(pawn.id, board);

      expect(result.valid).toBe(true);
      expect(result.move).toBeDefined();
      expect(result.move?.isUpgrade).toBe(true);
      expect(result.move?.piece.id).toBe(pawn.id);
    });
  });
});
