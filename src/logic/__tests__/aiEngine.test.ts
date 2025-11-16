import { describe, it, expect } from 'vitest';
import { AIEngine } from '../aiEngine';
import { BoardState, Move, Piece, Player, PieceType, Difficulty } from '../../types';

describe('AIEngine', () => {
  describe('getPieceValue', () => {
    it('should return correct values for each piece type', () => {
      expect(AIEngine.getPieceValue(PieceType.PAWN)).toBe(10);
      expect(AIEngine.getPieceValue(PieceType.KNIGHT)).toBe(30);
      expect(AIEngine.getPieceValue(PieceType.BISHOP)).toBe(30);
      expect(AIEngine.getPieceValue(PieceType.QUEEN)).toBe(50);
    });
  });

  describe('orderMoves', () => {
    const createMove = (
      from: { row: number; col: number },
      to: { row: number; col: number },
      owner: Player,
      pieceType: PieceType = PieceType.PAWN,
      capturedPiece?: Piece,
      isUpgrade?: boolean
    ): Move => ({
      piece: {
        type: pieceType,
        owner,
        position: from,
        hasMoved: false,
        id: `${owner}-${pieceType}-${from.row}-${from.col}`
      },
      from,
      to,
      capturedPiece,
      isUpgrade,
      timestamp: Date.now()
    });

    const mockBoard: BoardState = {
      pieces: [],
      currentPlayer: Player.PLAYER_1,
      resourcePoints: { [Player.PLAYER_1]: 0, [Player.PLAYER_2]: 0 },
      moveCount: 0,
      capturesSinceLastMove: 0
    };

    it('should prioritize captures over non-captures', () => {
      const captureMove = createMove(
        { row: 2, col: 2 },
        { row: 3, col: 3 },
        Player.PLAYER_1,
        PieceType.PAWN,
        {
          type: PieceType.PAWN,
          owner: Player.PLAYER_2,
          position: { row: 3, col: 3 },
          hasMoved: false,
          id: 'captured'
        }
      );
      const normalMove = createMove(
        { row: 2, col: 4 },
        { row: 3, col: 4 },
        Player.PLAYER_1
      );

      const ordered = AIEngine.orderMoves([normalMove, captureMove], mockBoard);
      
      expect(ordered[0]).toBe(captureMove);
      expect(ordered[1]).toBe(normalMove);
    });

    it('should prioritize higher value captures', () => {
      const captureQueen = createMove(
        { row: 2, col: 2 },
        { row: 3, col: 3 },
        Player.PLAYER_1,
        PieceType.KNIGHT,
        {
          type: PieceType.QUEEN,
          owner: Player.PLAYER_2,
          position: { row: 3, col: 3 },
          hasMoved: false,
          id: 'queen'
        }
      );
      const capturePawn = createMove(
        { row: 2, col: 4 },
        { row: 3, col: 5 },
        Player.PLAYER_1,
        PieceType.KNIGHT,
        {
          type: PieceType.PAWN,
          owner: Player.PLAYER_2,
          position: { row: 3, col: 5 },
          hasMoved: false,
          id: 'pawn'
        }
      );

      const ordered = AIEngine.orderMoves([capturePawn, captureQueen], mockBoard);
      
      expect(ordered[0]).toBe(captureQueen);
      expect(ordered[1]).toBe(capturePawn);
    });

    it('should prioritize upgrades over normal moves', () => {
      const upgradeMove = createMove(
        { row: 2, col: 2 },
        { row: 3, col: 3 },
        Player.PLAYER_1,
        PieceType.PAWN,
        undefined,
        true
      );
      const normalMove = createMove(
        { row: 2, col: 4 },
        { row: 3, col: 4 },
        Player.PLAYER_1
      );

      const ordered = AIEngine.orderMoves([normalMove, upgradeMove], mockBoard);
      
      expect(ordered[0]).toBe(upgradeMove);
      expect(ordered[1]).toBe(normalMove);
    });

    it('should prioritize captures over upgrades', () => {
      const captureMove = createMove(
        { row: 2, col: 2 },
        { row: 3, col: 3 },
        Player.PLAYER_1,
        PieceType.KNIGHT,
        {
          type: PieceType.PAWN,
          owner: Player.PLAYER_2,
          position: { row: 3, col: 3 },
          hasMoved: false,
          id: 'captured'
        }
      );
      const upgradeMove = createMove(
        { row: 2, col: 4 },
        { row: 3, col: 4 },
        Player.PLAYER_1,
        PieceType.PAWN,
        undefined,
        true
      );

      const ordered = AIEngine.orderMoves([upgradeMove, captureMove], mockBoard);
      
      expect(ordered[0]).toBe(captureMove);
      expect(ordered[1]).toBe(upgradeMove);
    });

    it('should prioritize forward advancement for Player 1', () => {
      const forwardMove = createMove(
        { row: 2, col: 2 },
        { row: 4, col: 2 },
        Player.PLAYER_1
      );
      const sidewaysMove = createMove(
        { row: 2, col: 4 },
        { row: 2, col: 5 },
        Player.PLAYER_1
      );

      const ordered = AIEngine.orderMoves([sidewaysMove, forwardMove], mockBoard);
      
      expect(ordered[0]).toBe(forwardMove);
      expect(ordered[1]).toBe(sidewaysMove);
    });

    it('should prioritize forward advancement for Player 2', () => {
      const forwardMove = createMove(
        { row: 7, col: 2 },
        { row: 5, col: 2 },
        Player.PLAYER_2
      );
      const sidewaysMove = createMove(
        { row: 7, col: 4 },
        { row: 7, col: 5 },
        Player.PLAYER_2
      );

      const ordered = AIEngine.orderMoves([sidewaysMove, forwardMove], mockBoard);
      
      expect(ordered[0]).toBe(forwardMove);
      expect(ordered[1]).toBe(sidewaysMove);
    });

    it('should order moves correctly: captures > upgrades > forward > other', () => {
      const captureMove = createMove(
        { row: 2, col: 2 },
        { row: 3, col: 3 },
        Player.PLAYER_1,
        PieceType.KNIGHT,
        {
          type: PieceType.PAWN,
          owner: Player.PLAYER_2,
          position: { row: 3, col: 3 },
          hasMoved: false,
          id: 'captured'
        }
      );
      const upgradeMove = createMove(
        { row: 2, col: 4 },
        { row: 3, col: 4 },
        Player.PLAYER_1,
        PieceType.PAWN,
        undefined,
        true
      );
      const forwardMove = createMove(
        { row: 2, col: 6 },
        { row: 4, col: 6 },
        Player.PLAYER_1
      );
      const sidewaysMove = createMove(
        { row: 2, col: 8 },
        { row: 2, col: 7 },
        Player.PLAYER_1
      );

      const ordered = AIEngine.orderMoves(
        [sidewaysMove, forwardMove, upgradeMove, captureMove],
        mockBoard
      );
      
      expect(ordered[0]).toBe(captureMove);
      expect(ordered[1]).toBe(upgradeMove);
      expect(ordered[2]).toBe(forwardMove);
      expect(ordered[3]).toBe(sidewaysMove);
    });
  });

  describe('getDepthForDifficulty', () => {
    it('should return depth 4 for Easy difficulty', () => {
      expect(AIEngine.getDepthForDifficulty(Difficulty.EASY)).toBe(4);
    });

    it('should return depth 6 for Hard difficulty', () => {
      expect(AIEngine.getDepthForDifficulty(Difficulty.HARD)).toBe(6);
    });
  });

  describe('generateMoves', () => {
    it('should generate all valid moves for a player', () => {
      const board: BoardState = {
        pieces: [
          {
            type: PieceType.PAWN,
            owner: Player.PLAYER_1,
            position: { row: 2, col: 1 },
            hasMoved: false,
            id: 'p1-pawn-1'
          },
          {
            type: PieceType.KNIGHT,
            owner: Player.PLAYER_1,
            position: { row: 1, col: 2 },
            hasMoved: false,
            id: 'p1-knight-1'
          }
        ],
        currentPlayer: Player.PLAYER_1,
        resourcePoints: { [Player.PLAYER_1]: 0, [Player.PLAYER_2]: 0 },
        moveCount: 0,
        capturesSinceLastMove: 0
      };

      const moves = AIEngine.generateMoves(board, Player.PLAYER_1);
      
      expect(moves.length).toBeGreaterThan(0);
      expect(moves.every(m => m.piece.owner === Player.PLAYER_1)).toBe(true);
    });

    it('should return empty array when player has no pieces', () => {
      const board: BoardState = {
        pieces: [
          {
            type: PieceType.PAWN,
            owner: Player.PLAYER_2,
            position: { row: 7, col: 1 },
            hasMoved: false,
            id: 'p2-pawn-1'
          }
        ],
        currentPlayer: Player.PLAYER_1,
        resourcePoints: { [Player.PLAYER_1]: 0, [Player.PLAYER_2]: 0 },
        moveCount: 0,
        capturesSinceLastMove: 0
      };

      const moves = AIEngine.generateMoves(board, Player.PLAYER_1);
      
      expect(moves).toEqual([]);
    });

    it('should generate moves for all piece types', () => {
      const board: BoardState = {
        pieces: [
          {
            type: PieceType.PAWN,
            owner: Player.PLAYER_1,
            position: { row: 2, col: 1 },
            hasMoved: false,
            id: 'p1-pawn-1'
          },
          {
            type: PieceType.KNIGHT,
            owner: Player.PLAYER_1,
            position: { row: 1, col: 2 },
            hasMoved: false,
            id: 'p1-knight-1'
          },
          {
            type: PieceType.BISHOP,
            owner: Player.PLAYER_1,
            position: { row: 2, col: 3 },
            hasMoved: false,
            id: 'p1-bishop-1'
          },
          {
            type: PieceType.QUEEN,
            owner: Player.PLAYER_1,
            position: { row: 2, col: 4 },
            hasMoved: false,
            id: 'p1-queen-1'
          }
        ],
        currentPlayer: Player.PLAYER_1,
        resourcePoints: { [Player.PLAYER_1]: 0, [Player.PLAYER_2]: 0 },
        moveCount: 0,
        capturesSinceLastMove: 0
      };

      const moves = AIEngine.generateMoves(board, Player.PLAYER_1);
      
      const pieceTypes = new Set(moves.map(m => m.piece.type));
      expect(pieceTypes.size).toBeGreaterThan(1);
    });
  });

  describe('calculateBestMove', () => {
    const createTestBoard = (): BoardState => ({
      pieces: [
        {
          type: PieceType.PAWN,
          owner: Player.PLAYER_1,
          position: { row: 2, col: 1 },
          hasMoved: false,
          id: 'p1-pawn-1'
        },
        {
          type: PieceType.KNIGHT,
          owner: Player.PLAYER_1,
          position: { row: 1, col: 2 },
          hasMoved: false,
          id: 'p1-knight-1'
        },
        {
          type: PieceType.PAWN,
          owner: Player.PLAYER_2,
          position: { row: 7, col: 1 },
          hasMoved: false,
          id: 'p2-pawn-1'
        }
      ],
      currentPlayer: Player.PLAYER_1,
      resourcePoints: { [Player.PLAYER_1]: 0, [Player.PLAYER_2]: 0 },
      moveCount: 0,
      capturesSinceLastMove: 0
    });

    it('should return a valid move for Easy difficulty', () => {
      const board = createTestBoard();
      const move = AIEngine.calculateBestMove(board, Difficulty.EASY);
      
      expect(move).not.toBeNull();
      expect(move?.piece.owner).toBe(Player.PLAYER_1);
    });

    it('should return a valid move for Hard difficulty', () => {
      const board = createTestBoard();
      const move = AIEngine.calculateBestMove(board, Difficulty.HARD);
      
      expect(move).not.toBeNull();
      expect(move?.piece.owner).toBe(Player.PLAYER_1);
    });

    it('should return null when no moves are available', () => {
      const emptyBoard: BoardState = {
        pieces: [],
        currentPlayer: Player.PLAYER_1,
        resourcePoints: { [Player.PLAYER_1]: 0, [Player.PLAYER_2]: 0 },
        moveCount: 0,
        capturesSinceLastMove: 0
      };
      
      const move = AIEngine.calculateBestMove(emptyBoard, Difficulty.EASY);
      expect(move).toBeNull();
    });

    it('should complete within time limit for Easy difficulty', () => {
      const board = createTestBoard();
      const startTime = Date.now();
      
      AIEngine.calculateBestMove(board, Difficulty.EASY);
      
      const elapsedTime = Date.now() - startTime;
      expect(elapsedTime).toBeLessThan(5000);
    });

    it('should complete within time limit for Hard difficulty', () => {
      const board = createTestBoard();
      const startTime = Date.now();
      
      AIEngine.calculateBestMove(board, Difficulty.HARD);
      
      const elapsedTime = Date.now() - startTime;
      expect(elapsedTime).toBeLessThan(5000);
    });

    it('should prefer capture moves when available', () => {
      const boardWithCapture: BoardState = {
        pieces: [
          {
            type: PieceType.KNIGHT,
            owner: Player.PLAYER_1,
            position: { row: 2, col: 2 },
            hasMoved: false,
            id: 'p1-knight-1'
          },
          {
            type: PieceType.PAWN,
            owner: Player.PLAYER_2,
            position: { row: 3, col: 4 },
            hasMoved: false,
            id: 'p2-pawn-1'
          },
          {
            type: PieceType.PAWN,
            owner: Player.PLAYER_1,
            position: { row: 2, col: 5 },
            hasMoved: false,
            id: 'p1-pawn-1'
          }
        ],
        currentPlayer: Player.PLAYER_1,
        resourcePoints: { [Player.PLAYER_1]: 0, [Player.PLAYER_2]: 0 },
        moveCount: 0,
        capturesSinceLastMove: 0
      };

      const move = AIEngine.calculateBestMove(boardWithCapture, Difficulty.EASY);
      
      expect(move).not.toBeNull();
      expect(move?.capturedPiece).toBeDefined();
    });

    it('should use correct depth for Easy difficulty', () => {
      const board = createTestBoard();
      const depth = AIEngine.getDepthForDifficulty(Difficulty.EASY);
      
      expect(depth).toBe(4);
      
      const move = AIEngine.calculateBestMove(board, Difficulty.EASY);
      expect(move).not.toBeNull();
    });

    it('should use correct depth for Hard difficulty', () => {
      const board = createTestBoard();
      const depth = AIEngine.getDepthForDifficulty(Difficulty.HARD);
      
      expect(depth).toBe(6);
      
      const move = AIEngine.calculateBestMove(board, Difficulty.HARD);
      expect(move).not.toBeNull();
    });

    it('should handle complex board positions', () => {
      const complexBoard: BoardState = {
        pieces: [
          {
            type: PieceType.QUEEN,
            owner: Player.PLAYER_1,
            position: { row: 4, col: 4 },
            hasMoved: true,
            id: 'p1-queen-1'
          },
          {
            type: PieceType.BISHOP,
            owner: Player.PLAYER_1,
            position: { row: 2, col: 2 },
            hasMoved: false,
            id: 'p1-bishop-1'
          },
          {
            type: PieceType.KNIGHT,
            owner: Player.PLAYER_1,
            position: { row: 3, col: 3 },
            hasMoved: false,
            id: 'p1-knight-1'
          },
          {
            type: PieceType.PAWN,
            owner: Player.PLAYER_2,
            position: { row: 6, col: 4 },
            hasMoved: false,
            id: 'p2-pawn-1'
          },
          {
            type: PieceType.BISHOP,
            owner: Player.PLAYER_2,
            position: { row: 7, col: 5 },
            hasMoved: false,
            id: 'p2-bishop-1'
          },
          {
            type: PieceType.KNIGHT,
            owner: Player.PLAYER_2,
            position: { row: 7, col: 3 },
            hasMoved: false,
            id: 'p2-knight-1'
          }
        ],
        currentPlayer: Player.PLAYER_1,
        resourcePoints: { [Player.PLAYER_1]: 2, [Player.PLAYER_2]: 1 },
        moveCount: 10,
        capturesSinceLastMove: 3
      };

      const move = AIEngine.calculateBestMove(complexBoard, Difficulty.HARD);
      
      expect(move).not.toBeNull();
      expect(move?.piece.owner).toBe(Player.PLAYER_1);
    });

    it('should return immediately if time limit is already exceeded', () => {
      const board = createTestBoard();
      
      const move = AIEngine.calculateBestMove(board, Difficulty.EASY);
      
      expect(move).not.toBeNull();
    });
  });

  describe('AI Engine Integration', () => {
    it('should generate and order moves consistently', () => {
      const board: BoardState = {
        pieces: [
          {
            type: PieceType.KNIGHT,
            owner: Player.PLAYER_1,
            position: { row: 2, col: 2 },
            hasMoved: false,
            id: 'p1-knight-1'
          },
          {
            type: PieceType.PAWN,
            owner: Player.PLAYER_1,
            position: { row: 2, col: 4 },
            hasMoved: false,
            id: 'p1-pawn-1'
          },
          {
            type: PieceType.PAWN,
            owner: Player.PLAYER_2,
            position: { row: 3, col: 4 },
            hasMoved: false,
            id: 'p2-pawn-1'
          }
        ],
        currentPlayer: Player.PLAYER_1,
        resourcePoints: { [Player.PLAYER_1]: 0, [Player.PLAYER_2]: 0 },
        moveCount: 0,
        capturesSinceLastMove: 0
      };

      const moves = AIEngine.generateMoves(board, Player.PLAYER_1);
      const orderedMoves = AIEngine.orderMoves(moves, board);
      
      expect(orderedMoves.length).toBe(moves.length);
      
      const captureIndex = orderedMoves.findIndex(m => m.capturedPiece !== undefined);
      const nonCaptureIndex = orderedMoves.findIndex(m => m.capturedPiece === undefined);
      
      if (captureIndex !== -1 && nonCaptureIndex !== -1) {
        expect(captureIndex).toBeLessThan(nonCaptureIndex);
      }
    });

    it('should handle both difficulty levels correctly', () => {
      const board: BoardState = {
        pieces: [
          {
            type: PieceType.PAWN,
            owner: Player.PLAYER_1,
            position: { row: 2, col: 1 },
            hasMoved: false,
            id: 'p1-pawn-1'
          },
          {
            type: PieceType.PAWN,
            owner: Player.PLAYER_2,
            position: { row: 7, col: 1 },
            hasMoved: false,
            id: 'p2-pawn-1'
          }
        ],
        currentPlayer: Player.PLAYER_1,
        resourcePoints: { [Player.PLAYER_1]: 0, [Player.PLAYER_2]: 0 },
        moveCount: 0,
        capturesSinceLastMove: 0
      };

      const easyMove = AIEngine.calculateBestMove(board, Difficulty.EASY);
      const hardMove = AIEngine.calculateBestMove(board, Difficulty.HARD);
      
      expect(easyMove).not.toBeNull();
      expect(hardMove).not.toBeNull();
    });
  });
});
