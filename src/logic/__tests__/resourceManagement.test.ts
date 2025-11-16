import { describe, it, expect } from 'vitest';
import { GameState } from '../gameState';
import { GameStateManager } from '../gameStateManager';
import { Player, PieceType, Move, Piece, BoardState } from '../../types';

describe('Resource Management', () => {
  describe('Resource Point Awarding', () => {
    it('should award 1 resource point when capturing an opponent piece', () => {
      const state = GameState.initializeBoard();
      const attacker = state.pieces.find(p => p.owner === Player.PLAYER_1)!;
      const target = state.pieces.find(p => p.owner === Player.PLAYER_2)!;

      const move: Move = {
        piece: attacker,
        from: attacker.position,
        to: target.position,
        capturedPiece: target,
        timestamp: Date.now()
      };

      const newState = GameState.applyMove(state, move);

      expect(newState.resourcePoints[Player.PLAYER_1]).toBe(1);
      expect(newState.resourcePoints[Player.PLAYER_2]).toBe(0);
    });

    it('should accumulate resource points across multiple captures', () => {
      let state = GameState.initializeBoard();
      const p1Pieces = state.pieces.filter(p => p.owner === Player.PLAYER_1).slice(0, 2);
      const p2Targets = state.pieces.filter(p => p.owner === Player.PLAYER_2).slice(0, 2);

      // Player 1 captures first piece
      const move1: Move = {
        piece: p1Pieces[0],
        from: p1Pieces[0].position,
        to: p2Targets[0].position,
        capturedPiece: p2Targets[0],
        timestamp: Date.now()
      };
      state = GameState.applyMove(state, move1);
      
      // Now it's Player 2's turn, switch back to Player 1
      state.currentPlayer = Player.PLAYER_1;
      
      // Player 1 captures second piece
      const move2: Move = {
        piece: p1Pieces[1],
        from: p1Pieces[1].position,
        to: p2Targets[1].position,
        capturedPiece: p2Targets[1],
        timestamp: Date.now()
      };
      state = GameState.applyMove(state, move2);

      expect(state.resourcePoints[Player.PLAYER_1]).toBe(2);
    });

    it('should not award resource points for non-capture moves', () => {
      const state = GameState.initializeBoard();
      const piece = state.pieces.find(p => p.owner === Player.PLAYER_1)!;

      const move: Move = {
        piece,
        from: piece.position,
        to: { row: piece.position.row + 1, col: piece.position.col },
        timestamp: Date.now()
      };

      const newState = GameState.applyMove(state, move);

      expect(newState.resourcePoints[Player.PLAYER_1]).toBe(0);
    });

    it('should award resource points to the correct player', () => {
      let state = GameState.initializeBoard();
      
      // Player 1 captures
      const p1Attacker = state.pieces.find(p => p.owner === Player.PLAYER_1)!;
      const p1Target = state.pieces.find(p => p.owner === Player.PLAYER_2)!;
      
      const move1: Move = {
        piece: p1Attacker,
        from: p1Attacker.position,
        to: p1Target.position,
        capturedPiece: p1Target,
        timestamp: Date.now()
      };
      
      state = GameState.applyMove(state, move1);
      
      // Player 2 captures
      const p2Attacker = state.pieces.find(p => p.owner === Player.PLAYER_2)!;
      const p2Target = state.pieces.find(p => p.owner === Player.PLAYER_1 && p.id !== p1Attacker.id)!;
      
      const move2: Move = {
        piece: p2Attacker,
        from: p2Attacker.position,
        to: p2Target.position,
        capturedPiece: p2Target,
        timestamp: Date.now()
      };
      
      state = GameState.applyMove(state, move2);

      expect(state.resourcePoints[Player.PLAYER_1]).toBe(1);
      expect(state.resourcePoints[Player.PLAYER_2]).toBe(1);
    });
  });

  describe('Upgrade Validation', () => {
    it('should allow upgrade when player has 2 or more resource points', () => {
      const testPawn: Piece = {
        type: PieceType.PAWN,
        owner: Player.PLAYER_1,
        position: { row: 4, col: 3 },
        hasMoved: true,
        id: 'test-pawn-1'
      };

      const testState: BoardState = {
        pieces: [testPawn],
        currentPlayer: Player.PLAYER_1,
        resourcePoints: { [Player.PLAYER_1]: 2, [Player.PLAYER_2]: 0 },
        moveCount: 0,
        capturesSinceLastMove: 0
      };

      const manager = new GameStateManager(testState);

      expect(manager.canUpgradePiece(testPawn.id)).toBe(true);
    });

    it('should reject upgrade when player has less than 2 resource points', () => {
      const testPawn: Piece = {
        type: PieceType.PAWN,
        owner: Player.PLAYER_1,
        position: { row: 4, col: 3 },
        hasMoved: true,
        id: 'test-pawn-1'
      };

      const testState: BoardState = {
        pieces: [testPawn],
        currentPlayer: Player.PLAYER_1,
        resourcePoints: { [Player.PLAYER_1]: 1, [Player.PLAYER_2]: 0 },
        moveCount: 0,
        capturesSinceLastMove: 0
      };

      const manager = new GameStateManager(testState);

      expect(manager.canUpgradePiece(testPawn.id)).toBe(false);
    });

    it('should reject upgrade for non-Pawn pieces', () => {
      const testKnight: Piece = {
        type: PieceType.KNIGHT,
        owner: Player.PLAYER_1,
        position: { row: 4, col: 3 },
        hasMoved: true,
        id: 'test-knight-1'
      };

      const testState: BoardState = {
        pieces: [testKnight],
        currentPlayer: Player.PLAYER_1,
        resourcePoints: { [Player.PLAYER_1]: 2, [Player.PLAYER_2]: 0 },
        moveCount: 0,
        capturesSinceLastMove: 0
      };

      const manager = new GameStateManager(testState);

      expect(manager.canUpgradePiece(testKnight.id)).toBe(false);
    });

    it('should reject upgrade for Pawns on row 1', () => {
      const testPawn: Piece = {
        type: PieceType.PAWN,
        owner: Player.PLAYER_1,
        position: { row: 1, col: 3 },
        hasMoved: false,
        id: 'test-pawn-1'
      };

      const testState: BoardState = {
        pieces: [testPawn],
        currentPlayer: Player.PLAYER_1,
        resourcePoints: { [Player.PLAYER_1]: 2, [Player.PLAYER_2]: 0 },
        moveCount: 0,
        capturesSinceLastMove: 0
      };

      const manager = new GameStateManager(testState);

      expect(manager.canUpgradePiece(testPawn.id)).toBe(false);
    });

    it('should reject upgrade for Pawns on row 8', () => {
      const testPawn: Piece = {
        type: PieceType.PAWN,
        owner: Player.PLAYER_1,
        position: { row: 8, col: 3 },
        hasMoved: true,
        id: 'test-pawn-1'
      };

      const testState: BoardState = {
        pieces: [testPawn],
        currentPlayer: Player.PLAYER_1,
        resourcePoints: { [Player.PLAYER_1]: 2, [Player.PLAYER_2]: 0 },
        moveCount: 0,
        capturesSinceLastMove: 0
      };

      const manager = new GameStateManager(testState);

      expect(manager.canUpgradePiece(testPawn.id)).toBe(false);
    });

    it('should reject upgrade when piece does not belong to current player', () => {
      const testPawn: Piece = {
        type: PieceType.PAWN,
        owner: Player.PLAYER_2,
        position: { row: 4, col: 3 },
        hasMoved: true,
        id: 'test-pawn-1'
      };

      const testState: BoardState = {
        pieces: [testPawn],
        currentPlayer: Player.PLAYER_1,
        resourcePoints: { [Player.PLAYER_1]: 2, [Player.PLAYER_2]: 0 },
        moveCount: 0,
        capturesSinceLastMove: 0
      };

      const manager = new GameStateManager(testState);

      expect(manager.canUpgradePiece(testPawn.id)).toBe(false);
    });
  });

  describe('Resource Point Deduction', () => {
    it('should deduct 2 resource points when upgrading a Pawn', () => {
      const testPawn: Piece = {
        type: PieceType.PAWN,
        owner: Player.PLAYER_1,
        position: { row: 4, col: 3 },
        hasMoved: true,
        id: 'test-pawn-1'
      };

      const testState: BoardState = {
        pieces: [testPawn],
        currentPlayer: Player.PLAYER_1,
        resourcePoints: { [Player.PLAYER_1]: 3, [Player.PLAYER_2]: 0 },
        moveCount: 0,
        capturesSinceLastMove: 0
      };

      const manager = new GameStateManager(testState);
      manager.upgradePiece(testPawn.id);

      const newState = manager.getCurrentState();
      expect(newState.resourcePoints[Player.PLAYER_1]).toBe(1);
    });

    it('should deduct exactly 2 resource points, not more', () => {
      const testPawn: Piece = {
        type: PieceType.PAWN,
        owner: Player.PLAYER_1,
        position: { row: 4, col: 3 },
        hasMoved: true,
        id: 'test-pawn-1'
      };

      const testState: BoardState = {
        pieces: [testPawn],
        currentPlayer: Player.PLAYER_1,
        resourcePoints: { [Player.PLAYER_1]: 5, [Player.PLAYER_2]: 0 },
        moveCount: 0,
        capturesSinceLastMove: 0
      };

      const manager = new GameStateManager(testState);
      manager.upgradePiece(testPawn.id);

      const newState = manager.getCurrentState();
      expect(newState.resourcePoints[Player.PLAYER_1]).toBe(3);
    });

    it('should convert Pawn to Queen after upgrade', () => {
      const testPawn: Piece = {
        type: PieceType.PAWN,
        owner: Player.PLAYER_1,
        position: { row: 4, col: 3 },
        hasMoved: true,
        id: 'test-pawn-1'
      };

      const testState: BoardState = {
        pieces: [testPawn],
        currentPlayer: Player.PLAYER_1,
        resourcePoints: { [Player.PLAYER_1]: 2, [Player.PLAYER_2]: 0 },
        moveCount: 0,
        capturesSinceLastMove: 0
      };

      const manager = new GameStateManager(testState);
      manager.upgradePiece(testPawn.id);

      const newState = manager.getCurrentState();
      const upgradedPiece = newState.pieces.find(p => p.id === testPawn.id);
      
      expect(upgradedPiece).toBeDefined();
      expect(upgradedPiece!.type).toBe(PieceType.QUEEN);
    });

    it('should not deduct resource points from opponent', () => {
      const testPawn: Piece = {
        type: PieceType.PAWN,
        owner: Player.PLAYER_1,
        position: { row: 4, col: 3 },
        hasMoved: true,
        id: 'test-pawn-1'
      };

      const testState: BoardState = {
        pieces: [testPawn],
        currentPlayer: Player.PLAYER_1,
        resourcePoints: { [Player.PLAYER_1]: 2, [Player.PLAYER_2]: 5 },
        moveCount: 0,
        capturesSinceLastMove: 0
      };

      const manager = new GameStateManager(testState);
      manager.upgradePiece(testPawn.id);

      const newState = manager.getCurrentState();
      expect(newState.resourcePoints[Player.PLAYER_2]).toBe(5);
    });

    it('should handle upgrade with minimum required resource points', () => {
      const testPawn: Piece = {
        type: PieceType.PAWN,
        owner: Player.PLAYER_1,
        position: { row: 4, col: 3 },
        hasMoved: true,
        id: 'test-pawn-1'
      };

      const testState: BoardState = {
        pieces: [testPawn],
        currentPlayer: Player.PLAYER_1,
        resourcePoints: { [Player.PLAYER_1]: 2, [Player.PLAYER_2]: 0 },
        moveCount: 0,
        capturesSinceLastMove: 0
      };

      const manager = new GameStateManager(testState);
      const move = manager.upgradePiece(testPawn.id);

      expect(move).not.toBeNull();
      
      const newState = manager.getCurrentState();
      expect(newState.resourcePoints[Player.PLAYER_1]).toBe(0);
    });
  });

  describe('Resource Management Integration', () => {
    it('should allow upgrade after earning sufficient resource points through captures', () => {
      const manager = new GameStateManager();
      let state = manager.getCurrentState();
      
      // Find pieces for capture scenario
      const p1Pieces = state.pieces.filter(p => p.owner === Player.PLAYER_1 && p.type === PieceType.KNIGHT).slice(0, 2);
      const p2Targets = state.pieces.filter(p => p.owner === Player.PLAYER_2).slice(0, 2);
      
      // Player 1 captures first piece
      const move1: Move = {
        piece: p1Pieces[0],
        from: p1Pieces[0].position,
        to: p2Targets[0].position,
        capturedPiece: p2Targets[0],
        timestamp: Date.now()
      };
      manager.recordMove(move1);
      
      // Now it's Player 2's turn, make a dummy move
      state = manager.getCurrentState();
      const p2Piece = state.pieces.find(p => p.owner === Player.PLAYER_2)!;
      const dummyMove: Move = {
        piece: p2Piece,
        from: p2Piece.position,
        to: { row: p2Piece.position.row - 1, col: p2Piece.position.col },
        timestamp: Date.now()
      };
      manager.recordMove(dummyMove);
      
      // Player 1 captures second piece
      const move2: Move = {
        piece: p1Pieces[1],
        from: p1Pieces[1].position,
        to: p2Targets[1].position,
        capturedPiece: p2Targets[1],
        timestamp: Date.now()
      };
      manager.recordMove(move2);
      
      // Check resource points
      expect(manager.getResourcePoints(Player.PLAYER_1)).toBe(2);
      
      // Now it's Player 2's turn, make another dummy move to switch back to Player 1
      state = manager.getCurrentState();
      const p2Piece2 = state.pieces.find(p => p.owner === Player.PLAYER_2 && p.id !== p2Piece.id)!;
      const dummyMove2: Move = {
        piece: p2Piece2,
        from: p2Piece2.position,
        to: { row: p2Piece2.position.row - 1, col: p2Piece2.position.col },
        timestamp: Date.now()
      };
      manager.recordMove(dummyMove2);
      
      // Find a pawn to upgrade
      state = manager.getCurrentState();
      const pawn = state.pieces.find(
        p => p.owner === Player.PLAYER_1 && 
        p.type === PieceType.PAWN && 
        p.position.row !== 1 && 
        p.position.row !== 8
      );
      
      if (pawn) {
        expect(manager.canUpgradePiece(pawn.id)).toBe(true);
      }
    });

    it('should track resource points correctly across multiple players', () => {
      let state = GameState.initializeBoard();
      
      // Player 1 captures
      const p1Piece = state.pieces.find(p => p.owner === Player.PLAYER_1)!;
      const p2Target = state.pieces.find(p => p.owner === Player.PLAYER_2)!;
      
      const move1: Move = {
        piece: p1Piece,
        from: p1Piece.position,
        to: p2Target.position,
        capturedPiece: p2Target,
        timestamp: Date.now()
      };
      state = GameState.applyMove(state, move1);
      
      // Player 2 captures
      const p2Piece = state.pieces.find(p => p.owner === Player.PLAYER_2)!;
      const p1Target = state.pieces.find(p => p.owner === Player.PLAYER_1 && p.id !== p1Piece.id)!;
      
      const move2: Move = {
        piece: p2Piece,
        from: p2Piece.position,
        to: p1Target.position,
        capturedPiece: p1Target,
        timestamp: Date.now()
      };
      state = GameState.applyMove(state, move2);
      
      expect(state.resourcePoints[Player.PLAYER_1]).toBe(1);
      expect(state.resourcePoints[Player.PLAYER_2]).toBe(1);
    });
  });
});
