import { describe, it, expect } from 'vitest';
import { GameState } from '../gameState';
import { Player, PieceType, Move } from '../../types';

describe('GameState', () => {
  describe('initializeBoard', () => {
    it('should create an 8x8 board with 32 pieces', () => {
      const state = GameState.initializeBoard();
      
      expect(state.pieces.length).toBe(32);
    });

    it('should place 16 pieces for Player 1', () => {
      const state = GameState.initializeBoard();
      const player1Pieces = state.pieces.filter(p => p.owner === Player.PLAYER_1);
      
      expect(player1Pieces.length).toBe(16);
    });

    it('should place 16 pieces for Player 2', () => {
      const state = GameState.initializeBoard();
      const player2Pieces = state.pieces.filter(p => p.owner === Player.PLAYER_2);
      
      expect(player2Pieces.length).toBe(16);
    });

    it('should place Player 1 pieces on rows 1-2', () => {
      const state = GameState.initializeBoard();
      const player1Pieces = state.pieces.filter(p => p.owner === Player.PLAYER_1);
      
      player1Pieces.forEach(piece => {
        expect(piece.position.row).toBeGreaterThanOrEqual(1);
        expect(piece.position.row).toBeLessThanOrEqual(2);
      });
    });

    it('should place Player 2 pieces on rows 7-8', () => {
      const state = GameState.initializeBoard();
      const player2Pieces = state.pieces.filter(p => p.owner === Player.PLAYER_2);
      
      player2Pieces.forEach(piece => {
        expect(piece.position.row).toBeGreaterThanOrEqual(7);
        expect(piece.position.row).toBeLessThanOrEqual(8);
      });
    });

    it('should have 8 Pawns per player', () => {
      const state = GameState.initializeBoard();
      const player1Pawns = state.pieces.filter(p => p.owner === Player.PLAYER_1 && p.type === PieceType.PAWN);
      const player2Pawns = state.pieces.filter(p => p.owner === Player.PLAYER_2 && p.type === PieceType.PAWN);
      
      expect(player1Pawns.length).toBe(8);
      expect(player2Pawns.length).toBe(8);
    });

    it('should have 2 Knights per player', () => {
      const state = GameState.initializeBoard();
      const player1Knights = state.pieces.filter(p => p.owner === Player.PLAYER_1 && p.type === PieceType.KNIGHT);
      const player2Knights = state.pieces.filter(p => p.owner === Player.PLAYER_2 && p.type === PieceType.KNIGHT);
      
      expect(player1Knights.length).toBe(2);
      expect(player2Knights.length).toBe(2);
    });

    it('should have 2 Bishops per player', () => {
      const state = GameState.initializeBoard();
      const player1Bishops = state.pieces.filter(p => p.owner === Player.PLAYER_1 && p.type === PieceType.BISHOP);
      const player2Bishops = state.pieces.filter(p => p.owner === Player.PLAYER_2 && p.type === PieceType.BISHOP);
      
      expect(player1Bishops.length).toBe(2);
      expect(player2Bishops.length).toBe(2);
    });

    it('should have 2 Rooks per player', () => {
      const state = GameState.initializeBoard();
      const player1Rooks = state.pieces.filter(p => p.owner === Player.PLAYER_1 && p.type === PieceType.ROOK);
      const player2Rooks = state.pieces.filter(p => p.owner === Player.PLAYER_2 && p.type === PieceType.ROOK);
      
      expect(player1Rooks.length).toBe(2);
      expect(player2Rooks.length).toBe(2);
    });

    it('should have 1 Queen per player', () => {
      const state = GameState.initializeBoard();
      const player1Queens = state.pieces.filter(p => p.owner === Player.PLAYER_1 && p.type === PieceType.QUEEN);
      const player2Queens = state.pieces.filter(p => p.owner === Player.PLAYER_2 && p.type === PieceType.QUEEN);
      
      expect(player1Queens.length).toBe(1);
      expect(player2Queens.length).toBe(1);
    });

    it('should have 1 King per player', () => {
      const state = GameState.initializeBoard();
      const player1Kings = state.pieces.filter(p => p.owner === Player.PLAYER_1 && p.type === PieceType.KING);
      const player2Kings = state.pieces.filter(p => p.owner === Player.PLAYER_2 && p.type === PieceType.KING);
      
      expect(player1Kings.length).toBe(1);
      expect(player2Kings.length).toBe(1);
    });

    it('should arrange Player 1 back row as Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook', () => {
      const state = GameState.initializeBoard();
      const backRow = state.pieces.filter(p => p.owner === Player.PLAYER_1 && p.position.row === 1)
        .sort((a, b) => a.position.col - b.position.col);
      
      expect(backRow[0].type).toBe(PieceType.ROOK);
      expect(backRow[1].type).toBe(PieceType.KNIGHT);
      expect(backRow[2].type).toBe(PieceType.BISHOP);
      expect(backRow[3].type).toBe(PieceType.QUEEN);
      expect(backRow[4].type).toBe(PieceType.KING);
      expect(backRow[5].type).toBe(PieceType.BISHOP);
      expect(backRow[6].type).toBe(PieceType.KNIGHT);
      expect(backRow[7].type).toBe(PieceType.ROOK);
    });

    it('should arrange Player 2 back row as Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook', () => {
      const state = GameState.initializeBoard();
      const backRow = state.pieces.filter(p => p.owner === Player.PLAYER_2 && p.position.row === 8)
        .sort((a, b) => a.position.col - b.position.col);
      
      expect(backRow[0].type).toBe(PieceType.ROOK);
      expect(backRow[1].type).toBe(PieceType.KNIGHT);
      expect(backRow[2].type).toBe(PieceType.BISHOP);
      expect(backRow[3].type).toBe(PieceType.QUEEN);
      expect(backRow[4].type).toBe(PieceType.KING);
      expect(backRow[5].type).toBe(PieceType.BISHOP);
      expect(backRow[6].type).toBe(PieceType.KNIGHT);
      expect(backRow[7].type).toBe(PieceType.ROOK);
    });

    it('should set Player 1 as the active player', () => {
      const state = GameState.initializeBoard();
      
      expect(state.currentPlayer).toBe(Player.PLAYER_1);
    });

    it('should initialize resource points to zero', () => {
      const state = GameState.initializeBoard();
      
      expect(state.resourcePoints[Player.PLAYER_1]).toBe(0);
      expect(state.resourcePoints[Player.PLAYER_2]).toBe(0);
    });

    it('should initialize move count to zero', () => {
      const state = GameState.initializeBoard();
      
      expect(state.moveCount).toBe(0);
    });

    it('should initialize captures since last move to zero', () => {
      const state = GameState.initializeBoard();
      
      expect(state.capturesSinceLastMove).toBe(0);
    });
  });

  describe('applyMove', () => {
    it('should update piece position', () => {
      const state = GameState.initializeBoard();
      const piece = state.pieces.find(p => p.owner === Player.PLAYER_1 && p.type === PieceType.PAWN)!;
      
      const move: Move = {
        piece,
        from: piece.position,
        to: { row: piece.position.row + 1, col: piece.position.col },
        timestamp: Date.now()
      };

      const newState = GameState.applyMove(state, move);
      const movedPiece = newState.pieces.find(p => p.id === piece.id)!;
      
      expect(movedPiece.position).toEqual(move.to);
    });

    it('should set hasMoved flag to true', () => {
      const state = GameState.initializeBoard();
      const piece = state.pieces.find(p => p.owner === Player.PLAYER_1 && p.type === PieceType.PAWN)!;
      
      const move: Move = {
        piece,
        from: piece.position,
        to: { row: piece.position.row + 1, col: piece.position.col },
        timestamp: Date.now()
      };

      const newState = GameState.applyMove(state, move);
      const movedPiece = newState.pieces.find(p => p.id === piece.id)!;
      
      expect(movedPiece.hasMoved).toBe(true);
    });

    it('should switch current player', () => {
      const state = GameState.initializeBoard();
      const piece = state.pieces.find(p => p.owner === Player.PLAYER_1)!;
      
      const move: Move = {
        piece,
        from: piece.position,
        to: { row: piece.position.row + 1, col: piece.position.col },
        timestamp: Date.now()
      };

      const newState = GameState.applyMove(state, move);
      
      expect(newState.currentPlayer).toBe(Player.PLAYER_2);
    });

    it('should increment move count', () => {
      const state = GameState.initializeBoard();
      const piece = state.pieces.find(p => p.owner === Player.PLAYER_1)!;
      
      const move: Move = {
        piece,
        from: piece.position,
        to: { row: piece.position.row + 1, col: piece.position.col },
        timestamp: Date.now()
      };

      const newState = GameState.applyMove(state, move);
      
      expect(newState.moveCount).toBe(1);
    });

    it('should remove captured piece', () => {
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
      
      expect(newState.pieces.find(p => p.id === target.id)).toBeUndefined();
    });

    it('should award resource point on capture', () => {
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
    });

    it('should reset captures counter on capture', () => {
      const state = GameState.initializeBoard();
      state.capturesSinceLastMove = 5;
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
      
      expect(newState.capturesSinceLastMove).toBe(0);
    });

    it('should increment captures counter on non-capture move', () => {
      const state = GameState.initializeBoard();
      const piece = state.pieces.find(p => p.owner === Player.PLAYER_1)!;
      
      const move: Move = {
        piece,
        from: piece.position,
        to: { row: piece.position.row + 1, col: piece.position.col },
        timestamp: Date.now()
      };

      const newState = GameState.applyMove(state, move);
      
      expect(newState.capturesSinceLastMove).toBe(1);
    });

    it('should upgrade piece to Queen when isUpgrade is true', () => {
      const state = GameState.initializeBoard();
      state.resourcePoints[Player.PLAYER_1] = 2;
      const pawn = state.pieces.find(p => p.owner === Player.PLAYER_1 && p.type === PieceType.PAWN)!;
      
      const move: Move = {
        piece: pawn,
        from: pawn.position,
        to: pawn.position,
        isUpgrade: true,
        timestamp: Date.now()
      };

      const newState = GameState.applyMove(state, move);
      const upgradedPiece = newState.pieces.find(p => p.id === pawn.id)!;
      
      expect(upgradedPiece.type).toBe(PieceType.QUEEN);
    });

    it('should deduct 2 resource points on upgrade', () => {
      const state = GameState.initializeBoard();
      state.resourcePoints[Player.PLAYER_1] = 3;
      const pawn = state.pieces.find(p => p.owner === Player.PLAYER_1 && p.type === PieceType.PAWN)!;
      
      const move: Move = {
        piece: pawn,
        from: pawn.position,
        to: pawn.position,
        isUpgrade: true,
        timestamp: Date.now()
      };

      const newState = GameState.applyMove(state, move);
      
      expect(newState.resourcePoints[Player.PLAYER_1]).toBe(1);
    });
  });

  describe('getPieceAt', () => {
    it('should return piece at specified position', () => {
      const state = GameState.initializeBoard();
      const piece = state.pieces[0];
      
      const foundPiece = GameState.getPieceAt(piece.position, state);
      
      expect(foundPiece).toBeDefined();
      expect(foundPiece!.id).toBe(piece.id);
    });

    it('should return undefined for empty position', () => {
      const state = GameState.initializeBoard();
      
      const foundPiece = GameState.getPieceAt({ row: 4, col: 4 }, state);
      
      expect(foundPiece).toBeUndefined();
    });
  });

  describe('cloneState', () => {
    it('should create a deep copy of the state', () => {
      const state = GameState.initializeBoard();
      const cloned = GameState.cloneState(state);
      
      expect(cloned).not.toBe(state);
      expect(cloned.pieces).not.toBe(state.pieces);
      expect(cloned).toEqual(state);
    });

    it('should not affect original when clone is modified', () => {
      const state = GameState.initializeBoard();
      const cloned = GameState.cloneState(state);
      
      cloned.pieces[0].position.row = 99;
      
      expect(state.pieces[0].position.row).not.toBe(99);
    });
  });
});
