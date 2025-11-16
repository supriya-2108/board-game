import { describe, it, expect, beforeEach } from 'vitest';
import { GameStateManager } from '../gameStateManager';
import { Player, PieceType, Move, Piece } from '../../types';

describe('GameStateManager', () => {
  let manager: GameStateManager;

  beforeEach(() => {
    manager = new GameStateManager();
  });

  describe('initialization', () => {
    it('should initialize with a valid board state', () => {
      const state = manager.getCurrentState();
      
      expect(state.pieces.length).toBe(24);
      expect(state.currentPlayer).toBe(Player.PLAYER_1);
    });

    it('should start with empty move history', () => {
      expect(manager.getMoveHistory().length).toBe(0);
    });

    it('should have initial state in history', () => {
      expect(manager.getMoveCount()).toBe(0);
    });
  });

  describe('recordMove', () => {
    it('should add move to history', () => {
      const state = manager.getCurrentState();
      const piece = state.pieces.find(p => p.owner === Player.PLAYER_1)!;
      
      const move: Move = {
        piece,
        from: piece.position,
        to: { row: piece.position.row + 1, col: piece.position.col },
        timestamp: Date.now()
      };

      manager.recordMove(move);
      
      expect(manager.getMoveHistory().length).toBe(1);
    });

    it('should update current state', () => {
      const state = manager.getCurrentState();
      const piece = state.pieces.find(p => p.owner === Player.PLAYER_1)!;
      const originalPosition = { ...piece.position };
      
      const move: Move = {
        piece,
        from: piece.position,
        to: { row: piece.position.row + 1, col: piece.position.col },
        timestamp: Date.now()
      };

      manager.recordMove(move);
      const newState = manager.getCurrentState();
      const movedPiece = newState.pieces.find(p => p.id === piece.id)!;
      
      expect(movedPiece.position).not.toEqual(originalPosition);
    });

    it('should maintain chronological order', () => {
      const state = manager.getCurrentState();
      const pieces = state.pieces.filter(p => p.owner === Player.PLAYER_1);
      
      const move1: Move = {
        piece: pieces[0],
        from: pieces[0].position,
        to: { row: pieces[0].position.row + 1, col: pieces[0].position.col },
        timestamp: 1000
      };

      const move2: Move = {
        piece: pieces[1],
        from: pieces[1].position,
        to: { row: pieces[1].position.row + 1, col: pieces[1].position.col },
        timestamp: 2000
      };

      manager.recordMove(move1);
      manager.recordMove(move2);
      
      const history = manager.getMoveHistory();
      expect(history[0].timestamp).toBe(1000);
      expect(history[1].timestamp).toBe(2000);
    });

    it('should record captured pieces', () => {
      const state = manager.getCurrentState();
      const attacker = state.pieces.find(p => p.owner === Player.PLAYER_1)!;
      const target = state.pieces.find(p => p.owner === Player.PLAYER_2)!;
      
      const move: Move = {
        piece: attacker,
        from: attacker.position,
        to: target.position,
        capturedPiece: target,
        timestamp: Date.now()
      };

      manager.recordMove(move);
      const history = manager.getMoveHistory();
      
      expect(history[0].capturedPiece).toBeDefined();
      expect(history[0].capturedPiece!.id).toBe(target.id);
    });

    it('should track upgrade actions', () => {
      const state = manager.getCurrentState();
      state.resourcePoints[Player.PLAYER_1] = 2;
      const pawn = state.pieces.find(p => p.owner === Player.PLAYER_1 && p.type === PieceType.PAWN)!;
      
      const move: Move = {
        piece: pawn,
        from: pawn.position,
        to: pawn.position,
        isUpgrade: true,
        timestamp: Date.now()
      };

      manager.recordMove(move);
      const history = manager.getMoveHistory();
      
      expect(history[0].isUpgrade).toBe(true);
    });
  });

  describe('undoMoves', () => {
    it('should revert last move', () => {
      const initialState = manager.getCurrentState();
      const piece = initialState.pieces.find(p => p.owner === Player.PLAYER_1)!;
      const originalPosition = { ...piece.position };
      
      const move: Move = {
        piece,
        from: piece.position,
        to: { row: piece.position.row + 1, col: piece.position.col },
        timestamp: Date.now()
      };

      manager.recordMove(move);
      manager.undoMoves(1);
      
      const currentState = manager.getCurrentState();
      const restoredPiece = currentState.pieces.find(p => p.id === piece.id)!;
      expect(restoredPiece.position).toEqual(originalPosition);
    });

    it('should support reverting up to 3 moves', () => {
      const state = manager.getCurrentState();
      const pieces = state.pieces.filter(p => p.owner === Player.PLAYER_1).slice(0, 3);
      
      pieces.forEach((piece, i) => {
        const move: Move = {
          piece,
          from: piece.position,
          to: { row: piece.position.row + 1, col: piece.position.col },
          timestamp: Date.now() + i
        };
        manager.recordMove(move);
      });

      expect(manager.getMoveCount()).toBe(3);
      manager.undoMoves(3);
      expect(manager.getMoveCount()).toBe(0);
    });

    it('should handle undo with fewer moves than requested', () => {
      const state = manager.getCurrentState();
      const piece = state.pieces.find(p => p.owner === Player.PLAYER_1)!;
      
      const move: Move = {
        piece,
        from: piece.position,
        to: { row: piece.position.row + 1, col: piece.position.col },
        timestamp: Date.now()
      };

      manager.recordMove(move);
      manager.undoMoves(5);
      
      expect(manager.getMoveCount()).toBe(0);
    });

    it('should update move history after undo', () => {
      const state = manager.getCurrentState();
      const pieces = state.pieces.filter(p => p.owner === Player.PLAYER_1).slice(0, 2);
      
      pieces.forEach(piece => {
        const move: Move = {
          piece,
          from: piece.position,
          to: { row: piece.position.row + 1, col: piece.position.col },
          timestamp: Date.now()
        };
        manager.recordMove(move);
      });

      manager.undoMoves(1);
      
      expect(manager.getMoveHistory().length).toBe(1);
    });

    it('should return false when no moves to undo', () => {
      const result = manager.undoMoves(1);
      
      expect(result).toBe(false);
    });

    it('should return true when undo is successful', () => {
      const state = manager.getCurrentState();
      const piece = state.pieces.find(p => p.owner === Player.PLAYER_1)!;
      
      const move: Move = {
        piece,
        from: piece.position,
        to: { row: piece.position.row + 1, col: piece.position.col },
        timestamp: Date.now()
      };

      manager.recordMove(move);
      const result = manager.undoMoves(1);
      
      expect(result).toBe(true);
    });
  });

  describe('getStateAtMove', () => {
    it('should return state at specific move index', () => {
      const state = manager.getCurrentState();
      const piece = state.pieces.find(p => p.owner === Player.PLAYER_1)!;
      
      const move: Move = {
        piece,
        from: piece.position,
        to: { row: piece.position.row + 1, col: piece.position.col },
        timestamp: Date.now()
      };

      manager.recordMove(move);
      const historicalState = manager.getStateAtMove(0);
      
      expect(historicalState).toBeDefined();
      expect(historicalState!.moveCount).toBe(0);
    });

    it('should return null for invalid index', () => {
      const state = manager.getStateAtMove(99);
      
      expect(state).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      const state = manager.getCurrentState();
      const piece = state.pieces.find(p => p.owner === Player.PLAYER_1)!;
      
      const move: Move = {
        piece,
        from: piece.position,
        to: { row: piece.position.row + 1, col: piece.position.col },
        timestamp: Date.now()
      };

      manager.recordMove(move);
      manager.reset();
      
      const resetState = manager.getCurrentState();
      expect(resetState.moveCount).toBe(0);
      expect(manager.getMoveCount()).toBe(0);
    });
  });

  describe('canUndo', () => {
    it('should return true when undo is available', () => {
      const state = manager.getCurrentState();
      const piece = state.pieces.find(p => p.owner === Player.PLAYER_1)!;
      
      const move: Move = {
        piece,
        from: piece.position,
        to: { row: piece.position.row + 1, col: piece.position.col },
        timestamp: Date.now()
      };

      manager.recordMove(move);
      
      expect(manager.canUndo(1)).toBe(true);
    });

    it('should return false when no moves available', () => {
      expect(manager.canUndo(1)).toBe(false);
    });

    it('should return false when requesting more than 3 undos', () => {
      expect(manager.canUndo(4)).toBe(false);
    });
  });

  describe('canUpgradePiece', () => {
    it('should return true when all conditions are met', () => {
      // Create a custom state with a pawn in the middle and sufficient resources
      const customState = manager.getCurrentState();
      const pawn = customState.pieces.find(p => p.owner === Player.PLAYER_1 && p.type === PieceType.PAWN)!;
      
      // Manually create a state with pawn in middle and resources
      const testPawn: Piece = {
        ...pawn,
        position: { row: 4, col: 3 },
        hasMoved: true
      };
      
      const testState = {
        pieces: [testPawn],
        currentPlayer: Player.PLAYER_1,
        resourcePoints: { [Player.PLAYER_1]: 2, [Player.PLAYER_2]: 0 },
        moveCount: 0,
        capturesSinceLastMove: 0
      };
      
      const testManager = new GameStateManager(testState);
      
      expect(testManager.canUpgradePiece(testPawn.id)).toBe(true);
    });

    it('should return false when piece is not a Pawn', () => {
      const state = manager.getCurrentState();
      state.resourcePoints[Player.PLAYER_1] = 2;
      const knight = state.pieces.find(p => p.owner === Player.PLAYER_1 && p.type === PieceType.KNIGHT)!;
      
      expect(manager.canUpgradePiece(knight.id)).toBe(false);
    });

    it('should return false when insufficient resource points', () => {
      const state = manager.getCurrentState();
      state.resourcePoints[Player.PLAYER_1] = 1;
      const pawn = state.pieces.find(p => p.owner === Player.PLAYER_1 && p.type === PieceType.PAWN)!;
      
      expect(manager.canUpgradePiece(pawn.id)).toBe(false);
    });

    it('should return false when Pawn is on row 1', () => {
      const state = manager.getCurrentState();
      state.resourcePoints[Player.PLAYER_1] = 2;
      const pawn = state.pieces.find(
        p => p.owner === Player.PLAYER_1 && 
        p.type === PieceType.PAWN && 
        p.position.row === 1
      )!;
      
      expect(manager.canUpgradePiece(pawn.id)).toBe(false);
    });

    it('should return false when Pawn is on row 8', () => {
      const state = manager.getCurrentState();
      state.resourcePoints[Player.PLAYER_2] = 2;
      const pawn = state.pieces.find(
        p => p.owner === Player.PLAYER_2 && 
        p.type === PieceType.PAWN && 
        p.position.row === 8
      )!;
      
      // Switch to Player 2's turn
      const p1Piece = state.pieces.find(p => p.owner === Player.PLAYER_1)!;
      const move: Move = {
        piece: p1Piece,
        from: p1Piece.position,
        to: { row: p1Piece.position.row + 1, col: p1Piece.position.col },
        timestamp: Date.now()
      };
      manager.recordMove(move);
      
      expect(manager.canUpgradePiece(pawn.id)).toBe(false);
    });

    it('should return false when piece does not exist', () => {
      expect(manager.canUpgradePiece('non-existent-id')).toBe(false);
    });
  });

  describe('getResourcePoints', () => {
    it('should return current resource points for Player 1', () => {
      const points = manager.getResourcePoints(Player.PLAYER_1);
      
      expect(points).toBe(0);
    });

    it('should return current resource points for Player 2', () => {
      const points = manager.getResourcePoints(Player.PLAYER_2);
      
      expect(points).toBe(0);
    });

    it('should return updated resource points after capture', () => {
      const state = manager.getCurrentState();
      const attacker = state.pieces.find(p => p.owner === Player.PLAYER_1)!;
      const target = state.pieces.find(p => p.owner === Player.PLAYER_2)!;
      
      const move: Move = {
        piece: attacker,
        from: attacker.position,
        to: target.position,
        capturedPiece: target,
        timestamp: Date.now()
      };

      manager.recordMove(move);
      const points = manager.getResourcePoints(Player.PLAYER_1);
      
      expect(points).toBe(1);
    });
  });

  describe('upgradePiece', () => {
    it('should upgrade Pawn to Queen when conditions are met', () => {
      // Create a custom state with a pawn in the middle and sufficient resources
      const testPawn: Piece = {
        type: PieceType.PAWN,
        owner: Player.PLAYER_1,
        position: { row: 4, col: 3 },
        hasMoved: true,
        id: 'test-pawn-1'
      };
      
      const testState = {
        pieces: [testPawn],
        currentPlayer: Player.PLAYER_1,
        resourcePoints: { [Player.PLAYER_1]: 2, [Player.PLAYER_2]: 0 },
        moveCount: 0,
        capturesSinceLastMove: 0
      };
      
      const testManager = new GameStateManager(testState);
      const move = testManager.upgradePiece(testPawn.id);
      
      expect(move).not.toBeNull();
      expect(move!.isUpgrade).toBe(true);
      
      const newState = testManager.getCurrentState();
      const upgradedPiece = newState.pieces.find(p => p.id === testPawn.id);
      expect(upgradedPiece!.type).toBe(PieceType.QUEEN);
    });

    it('should deduct 2 resource points on upgrade', () => {
      const testPawn: Piece = {
        type: PieceType.PAWN,
        owner: Player.PLAYER_1,
        position: { row: 4, col: 3 },
        hasMoved: true,
        id: 'test-pawn-1'
      };
      
      const testState = {
        pieces: [testPawn],
        currentPlayer: Player.PLAYER_1,
        resourcePoints: { [Player.PLAYER_1]: 3, [Player.PLAYER_2]: 0 },
        moveCount: 0,
        capturesSinceLastMove: 0
      };
      
      const testManager = new GameStateManager(testState);
      testManager.upgradePiece(testPawn.id);
      
      const newState = testManager.getCurrentState();
      expect(newState.resourcePoints[Player.PLAYER_1]).toBe(1);
    });

    it('should record upgrade in move history', () => {
      const testPawn: Piece = {
        type: PieceType.PAWN,
        owner: Player.PLAYER_1,
        position: { row: 4, col: 3 },
        hasMoved: true,
        id: 'test-pawn-1'
      };
      
      const testState = {
        pieces: [testPawn],
        currentPlayer: Player.PLAYER_1,
        resourcePoints: { [Player.PLAYER_1]: 2, [Player.PLAYER_2]: 0 },
        moveCount: 0,
        capturesSinceLastMove: 0
      };
      
      const testManager = new GameStateManager(testState);
      testManager.upgradePiece(testPawn.id);
      
      const history = testManager.getMoveHistory();
      expect(history.length).toBe(1);
      expect(history[0].isUpgrade).toBe(true);
      expect(history[0].piece.id).toBe(testPawn.id);
    });

    it('should return null when insufficient resource points', () => {
      const testPawn: Piece = {
        type: PieceType.PAWN,
        owner: Player.PLAYER_1,
        position: { row: 4, col: 3 },
        hasMoved: true,
        id: 'test-pawn-1'
      };
      
      const testState = {
        pieces: [testPawn],
        currentPlayer: Player.PLAYER_1,
        resourcePoints: { [Player.PLAYER_1]: 1, [Player.PLAYER_2]: 0 },
        moveCount: 0,
        capturesSinceLastMove: 0
      };
      
      const testManager = new GameStateManager(testState);
      const move = testManager.upgradePiece(testPawn.id);
      
      expect(move).toBeNull();
    });

    it('should return null when Pawn is on row 1', () => {
      const testPawn: Piece = {
        type: PieceType.PAWN,
        owner: Player.PLAYER_1,
        position: { row: 1, col: 3 },
        hasMoved: false,
        id: 'test-pawn-1'
      };
      
      const testState = {
        pieces: [testPawn],
        currentPlayer: Player.PLAYER_1,
        resourcePoints: { [Player.PLAYER_1]: 2, [Player.PLAYER_2]: 0 },
        moveCount: 0,
        capturesSinceLastMove: 0
      };
      
      const testManager = new GameStateManager(testState);
      const move = testManager.upgradePiece(testPawn.id);
      
      expect(move).toBeNull();
    });

    it('should return null when Pawn is on row 8', () => {
      const testPawn: Piece = {
        type: PieceType.PAWN,
        owner: Player.PLAYER_1,
        position: { row: 8, col: 3 },
        hasMoved: true,
        id: 'test-pawn-1'
      };
      
      const testState = {
        pieces: [testPawn],
        currentPlayer: Player.PLAYER_1,
        resourcePoints: { [Player.PLAYER_1]: 2, [Player.PLAYER_2]: 0 },
        moveCount: 0,
        capturesSinceLastMove: 0
      };
      
      const testManager = new GameStateManager(testState);
      const move = testManager.upgradePiece(testPawn.id);
      
      expect(move).toBeNull();
    });

    it('should return null when piece is not a Pawn', () => {
      const testKnight: Piece = {
        type: PieceType.KNIGHT,
        owner: Player.PLAYER_1,
        position: { row: 4, col: 3 },
        hasMoved: true,
        id: 'test-knight-1'
      };
      
      const testState = {
        pieces: [testKnight],
        currentPlayer: Player.PLAYER_1,
        resourcePoints: { [Player.PLAYER_1]: 2, [Player.PLAYER_2]: 0 },
        moveCount: 0,
        capturesSinceLastMove: 0
      };
      
      const testManager = new GameStateManager(testState);
      const move = testManager.upgradePiece(testKnight.id);
      
      expect(move).toBeNull();
    });

    it('should return null when piece does not exist', () => {
      const move = manager.upgradePiece('non-existent-id');
      
      expect(move).toBeNull();
    });

    it('should not switch current player on upgrade', () => {
      const testPawn: Piece = {
        type: PieceType.PAWN,
        owner: Player.PLAYER_1,
        position: { row: 4, col: 3 },
        hasMoved: true,
        id: 'test-pawn-1'
      };
      
      const testState = {
        pieces: [testPawn],
        currentPlayer: Player.PLAYER_1,
        resourcePoints: { [Player.PLAYER_1]: 2, [Player.PLAYER_2]: 0 },
        moveCount: 0,
        capturesSinceLastMove: 0
      };
      
      const testManager = new GameStateManager(testState);
      testManager.upgradePiece(testPawn.id);
      
      const newState = testManager.getCurrentState();
      expect(newState.currentPlayer).toBe(Player.PLAYER_1);
    });
  });

  describe('getGameStatus', () => {
    it('should return IN_PROGRESS for initial state', () => {
      const status = manager.getGameStatus();
      
      expect(status).toBe('IN_PROGRESS');
    });

    it('should return PLAYER_2_WIN when Player 1 has fewer than 3 pieces', () => {
      // Create a state with Player 1 having only 2 pieces
      const testState = {
        pieces: [
          { type: PieceType.KNIGHT, owner: Player.PLAYER_1, position: { row: 1, col: 1 }, hasMoved: false, id: 'p1-1' },
          { type: PieceType.BISHOP, owner: Player.PLAYER_1, position: { row: 1, col: 2 }, hasMoved: false, id: 'p1-2' },
          { type: PieceType.KNIGHT, owner: Player.PLAYER_2, position: { row: 8, col: 1 }, hasMoved: false, id: 'p2-1' },
          { type: PieceType.BISHOP, owner: Player.PLAYER_2, position: { row: 8, col: 2 }, hasMoved: false, id: 'p2-2' },
          { type: PieceType.QUEEN, owner: Player.PLAYER_2, position: { row: 8, col: 3 }, hasMoved: false, id: 'p2-3' }
        ],
        currentPlayer: Player.PLAYER_1,
        resourcePoints: { [Player.PLAYER_1]: 0, [Player.PLAYER_2]: 0 },
        moveCount: 0,
        capturesSinceLastMove: 0
      };
      
      const testManager = new GameStateManager(testState);
      const status = testManager.getGameStatus();
      
      expect(status).toBe('PLAYER_2_WIN');
    });

    it('should return DRAW when 50 moves without capture', () => {
      const state = manager.getCurrentState();
      state.capturesSinceLastMove = 50;
      const testManager = new GameStateManager(state);
      
      const status = testManager.getGameStatus();
      
      expect(status).toBe('DRAW');
    });
  });

  describe('isGameOver', () => {
    it('should return false for initial state', () => {
      expect(manager.isGameOver()).toBe(false);
    });

    it('should return true when game is won', () => {
      const testState = {
        pieces: [
          { type: PieceType.KNIGHT, owner: Player.PLAYER_1, position: { row: 1, col: 1 }, hasMoved: false, id: 'p1-1' },
          { type: PieceType.BISHOP, owner: Player.PLAYER_1, position: { row: 1, col: 2 }, hasMoved: false, id: 'p1-2' },
          { type: PieceType.KNIGHT, owner: Player.PLAYER_2, position: { row: 8, col: 1 }, hasMoved: false, id: 'p2-1' },
          { type: PieceType.BISHOP, owner: Player.PLAYER_2, position: { row: 8, col: 2 }, hasMoved: false, id: 'p2-2' },
          { type: PieceType.QUEEN, owner: Player.PLAYER_2, position: { row: 8, col: 3 }, hasMoved: false, id: 'p2-3' }
        ],
        currentPlayer: Player.PLAYER_1,
        resourcePoints: { [Player.PLAYER_1]: 0, [Player.PLAYER_2]: 0 },
        moveCount: 0,
        capturesSinceLastMove: 0
      };
      
      const testManager = new GameStateManager(testState);
      
      expect(testManager.isGameOver()).toBe(true);
    });

    it('should return true when game is a draw', () => {
      const state = manager.getCurrentState();
      state.capturesSinceLastMove = 50;
      const testManager = new GameStateManager(state);
      
      expect(testManager.isGameOver()).toBe(true);
    });
  });

  describe('getWinner', () => {
    it('should return null for game in progress', () => {
      expect(manager.getWinner()).toBeNull();
    });

    it('should return Player 1 when Player 1 wins', () => {
      const testState = {
        pieces: [
          { type: PieceType.KNIGHT, owner: Player.PLAYER_1, position: { row: 1, col: 1 }, hasMoved: false, id: 'p1-1' },
          { type: PieceType.BISHOP, owner: Player.PLAYER_1, position: { row: 1, col: 2 }, hasMoved: false, id: 'p1-2' },
          { type: PieceType.QUEEN, owner: Player.PLAYER_1, position: { row: 1, col: 3 }, hasMoved: false, id: 'p1-3' },
          { type: PieceType.KNIGHT, owner: Player.PLAYER_2, position: { row: 8, col: 1 }, hasMoved: false, id: 'p2-1' },
          { type: PieceType.BISHOP, owner: Player.PLAYER_2, position: { row: 8, col: 2 }, hasMoved: false, id: 'p2-2' }
        ],
        currentPlayer: Player.PLAYER_1,
        resourcePoints: { [Player.PLAYER_1]: 0, [Player.PLAYER_2]: 0 },
        moveCount: 0,
        capturesSinceLastMove: 0
      };
      
      const testManager = new GameStateManager(testState);
      
      expect(testManager.getWinner()).toBe(Player.PLAYER_1);
    });

    it('should return null for draw', () => {
      const state = manager.getCurrentState();
      state.capturesSinceLastMove = 50;
      const testManager = new GameStateManager(state);
      
      expect(testManager.getWinner()).toBeNull();
    });
  });

  describe('getOutcomeMessage', () => {
    it('should return "Game in progress" for ongoing game', () => {
      expect(manager.getOutcomeMessage()).toBe('Game in progress');
    });

    it('should return "Player 1 wins!" when Player 1 wins', () => {
      const testState = {
        pieces: [
          { type: PieceType.KNIGHT, owner: Player.PLAYER_1, position: { row: 1, col: 1 }, hasMoved: false, id: 'p1-1' },
          { type: PieceType.BISHOP, owner: Player.PLAYER_1, position: { row: 1, col: 2 }, hasMoved: false, id: 'p1-2' },
          { type: PieceType.QUEEN, owner: Player.PLAYER_1, position: { row: 1, col: 3 }, hasMoved: false, id: 'p1-3' },
          { type: PieceType.KNIGHT, owner: Player.PLAYER_2, position: { row: 8, col: 1 }, hasMoved: false, id: 'p2-1' },
          { type: PieceType.BISHOP, owner: Player.PLAYER_2, position: { row: 8, col: 2 }, hasMoved: false, id: 'p2-2' }
        ],
        currentPlayer: Player.PLAYER_1,
        resourcePoints: { [Player.PLAYER_1]: 0, [Player.PLAYER_2]: 0 },
        moveCount: 0,
        capturesSinceLastMove: 0
      };
      
      const testManager = new GameStateManager(testState);
      
      expect(testManager.getOutcomeMessage()).toBe('Player 1 wins!');
    });

    it('should return draw message when game is a draw', () => {
      const state = manager.getCurrentState();
      state.capturesSinceLastMove = 50;
      const testManager = new GameStateManager(state);
      
      expect(testManager.getOutcomeMessage()).toBe('Game is a draw (50 moves without capture)');
    });
  });

  describe('canMakeMove', () => {
    it('should return true for game in progress', () => {
      expect(manager.canMakeMove()).toBe(true);
    });

    it('should return false when game is over', () => {
      const testState = {
        pieces: [
          { type: PieceType.KNIGHT, owner: Player.PLAYER_1, position: { row: 1, col: 1 }, hasMoved: false, id: 'p1-1' },
          { type: PieceType.BISHOP, owner: Player.PLAYER_1, position: { row: 1, col: 2 }, hasMoved: false, id: 'p1-2' },
          { type: PieceType.KNIGHT, owner: Player.PLAYER_2, position: { row: 8, col: 1 }, hasMoved: false, id: 'p2-1' },
          { type: PieceType.BISHOP, owner: Player.PLAYER_2, position: { row: 8, col: 2 }, hasMoved: false, id: 'p2-2' },
          { type: PieceType.QUEEN, owner: Player.PLAYER_2, position: { row: 8, col: 3 }, hasMoved: false, id: 'p2-3' }
        ],
        currentPlayer: Player.PLAYER_1,
        resourcePoints: { [Player.PLAYER_1]: 0, [Player.PLAYER_2]: 0 },
        moveCount: 0,
        capturesSinceLastMove: 0
      };
      
      const testManager = new GameStateManager(testState);
      
      expect(testManager.canMakeMove()).toBe(false);
    });
  });
});
