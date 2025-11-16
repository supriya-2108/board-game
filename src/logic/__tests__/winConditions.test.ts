import { describe, it, expect } from 'vitest';
import { WinConditions } from '../winConditions';
import { GameState } from '../gameState';
import { Player, PieceType, GameStatus, BoardState } from '../../types';

describe('WinConditions', () => {
  describe('hasInsufficientPieces', () => {
    it('should return true when player has fewer than 3 pieces', () => {
      const state = GameState.initializeBoard();
      // Remove pieces until Player 1 has only 2
      state.pieces = state.pieces.filter(p => 
        p.owner === Player.PLAYER_2 || 
        (p.owner === Player.PLAYER_1 && state.pieces.indexOf(p) < 2)
      );
      
      expect(WinConditions.hasInsufficientPieces(state, Player.PLAYER_1)).toBe(true);
    });

    it('should return false when player has 3 or more pieces', () => {
      const state = GameState.initializeBoard();
      
      expect(WinConditions.hasInsufficientPieces(state, Player.PLAYER_1)).toBe(false);
      expect(WinConditions.hasInsufficientPieces(state, Player.PLAYER_2)).toBe(false);
    });

    it('should return true when player has exactly 2 pieces', () => {
      const state = GameState.initializeBoard();
      state.pieces = [
        { type: PieceType.KNIGHT, owner: Player.PLAYER_1, position: { row: 1, col: 1 }, hasMoved: false, id: 'p1-1' },
        { type: PieceType.BISHOP, owner: Player.PLAYER_1, position: { row: 1, col: 2 }, hasMoved: false, id: 'p1-2' },
        { type: PieceType.KNIGHT, owner: Player.PLAYER_2, position: { row: 8, col: 1 }, hasMoved: false, id: 'p2-1' },
        { type: PieceType.BISHOP, owner: Player.PLAYER_2, position: { row: 8, col: 2 }, hasMoved: false, id: 'p2-2' },
        { type: PieceType.QUEEN, owner: Player.PLAYER_2, position: { row: 8, col: 3 }, hasMoved: false, id: 'p2-3' }
      ];
      
      expect(WinConditions.hasInsufficientPieces(state, Player.PLAYER_1)).toBe(true);
      expect(WinConditions.hasInsufficientPieces(state, Player.PLAYER_2)).toBe(false);
    });
  });

  describe('hasNoValidMoves', () => {
    it('should return false when player has valid moves', () => {
      const state = GameState.initializeBoard();
      
      expect(WinConditions.hasNoValidMoves(state, Player.PLAYER_1)).toBe(false);
    });

    it('should return true when all pieces are blocked', () => {
      // Create a scenario where Player 1 has no valid moves
      const state: BoardState = {
        pieces: [
          // Player 1 pawn completely blocked
          { type: PieceType.PAWN, owner: Player.PLAYER_1, position: { row: 2, col: 1 }, hasMoved: false, id: 'p1-1' },
          // Player 2 pieces blocking
          { type: PieceType.BISHOP, owner: Player.PLAYER_2, position: { row: 3, col: 1 }, hasMoved: false, id: 'p2-1' },
          { type: PieceType.KNIGHT, owner: Player.PLAYER_2, position: { row: 4, col: 1 }, hasMoved: false, id: 'p2-2' },
          { type: PieceType.QUEEN, owner: Player.PLAYER_2, position: { row: 5, col: 1 }, hasMoved: false, id: 'p2-3' }
        ],
        currentPlayer: Player.PLAYER_1,
        resourcePoints: {
          [Player.PLAYER_1]: 0,
          [Player.PLAYER_2]: 0
        },
        moveCount: 0,
        capturesSinceLastMove: 0
      };
      
      expect(WinConditions.hasNoValidMoves(state, Player.PLAYER_1)).toBe(true);
    });
  });

  describe('isDrawByFiftyMoveRule', () => {
    it('should return false when fewer than 50 moves without capture', () => {
      const state = GameState.initializeBoard();
      state.capturesSinceLastMove = 49;
      
      expect(WinConditions.isDrawByFiftyMoveRule(state)).toBe(false);
    });

    it('should return true when exactly 50 moves without capture', () => {
      const state = GameState.initializeBoard();
      state.capturesSinceLastMove = 50;
      
      expect(WinConditions.isDrawByFiftyMoveRule(state)).toBe(true);
    });

    it('should return true when more than 50 moves without capture', () => {
      const state = GameState.initializeBoard();
      state.capturesSinceLastMove = 75;
      
      expect(WinConditions.isDrawByFiftyMoveRule(state)).toBe(true);
    });
  });

  describe('checkGameStatus', () => {
    it('should return IN_PROGRESS for initial board state', () => {
      const state = GameState.initializeBoard();
      
      expect(WinConditions.checkGameStatus(state)).toBe(GameStatus.IN_PROGRESS);
    });

    it('should return PLAYER_2_WIN when Player 1 has fewer than 3 pieces', () => {
      const state = GameState.initializeBoard();
      state.pieces = state.pieces.filter(p => 
        p.owner === Player.PLAYER_2 || 
        (p.owner === Player.PLAYER_1 && ['p1-pawn-1', 'p1-knight-1'].includes(p.id))
      );
      
      expect(WinConditions.checkGameStatus(state)).toBe(GameStatus.PLAYER_2_WIN);
    });

    it('should return PLAYER_1_WIN when Player 2 has fewer than 3 pieces', () => {
      const state = GameState.initializeBoard();
      state.pieces = state.pieces.filter(p => 
        p.owner === Player.PLAYER_1 || 
        (p.owner === Player.PLAYER_2 && ['p2-pawn-1', 'p2-knight-1'].includes(p.id))
      );
      
      expect(WinConditions.checkGameStatus(state)).toBe(GameStatus.PLAYER_1_WIN);
    });

    it('should return DRAW when 50 moves without capture', () => {
      const state = GameState.initializeBoard();
      state.capturesSinceLastMove = 50;
      
      expect(WinConditions.checkGameStatus(state)).toBe(GameStatus.DRAW);
    });

    it('should prioritize draw over win conditions', () => {
      const state = GameState.initializeBoard();
      state.capturesSinceLastMove = 50;
      // Also make Player 1 have fewer than 3 pieces
      state.pieces = state.pieces.filter(p => 
        p.owner === Player.PLAYER_2 || 
        (p.owner === Player.PLAYER_1 && ['p1-pawn-1', 'p1-knight-1'].includes(p.id))
      );
      
      expect(WinConditions.checkGameStatus(state)).toBe(GameStatus.DRAW);
    });

    it('should return PLAYER_2_WIN when Player 1 has no valid moves', () => {
      const state: BoardState = {
        pieces: [
          { type: PieceType.PAWN, owner: Player.PLAYER_1, position: { row: 2, col: 1 }, hasMoved: false, id: 'p1-1' },
          { type: PieceType.BISHOP, owner: Player.PLAYER_2, position: { row: 3, col: 1 }, hasMoved: false, id: 'p2-1' },
          { type: PieceType.KNIGHT, owner: Player.PLAYER_2, position: { row: 4, col: 1 }, hasMoved: false, id: 'p2-2' },
          { type: PieceType.QUEEN, owner: Player.PLAYER_2, position: { row: 5, col: 1 }, hasMoved: false, id: 'p2-3' }
        ],
        currentPlayer: Player.PLAYER_1,
        resourcePoints: {
          [Player.PLAYER_1]: 0,
          [Player.PLAYER_2]: 0
        },
        moveCount: 0,
        capturesSinceLastMove: 0
      };
      
      expect(WinConditions.checkGameStatus(state)).toBe(GameStatus.PLAYER_2_WIN);
    });
  });

  describe('isGameOver', () => {
    it('should return false for game in progress', () => {
      const state = GameState.initializeBoard();
      
      expect(WinConditions.isGameOver(state)).toBe(false);
    });

    it('should return true when Player 1 wins', () => {
      const state = GameState.initializeBoard();
      state.pieces = state.pieces.filter(p => 
        p.owner === Player.PLAYER_1 || 
        (p.owner === Player.PLAYER_2 && ['p2-pawn-1', 'p2-knight-1'].includes(p.id))
      );
      
      expect(WinConditions.isGameOver(state)).toBe(true);
    });

    it('should return true when Player 2 wins', () => {
      const state = GameState.initializeBoard();
      state.pieces = state.pieces.filter(p => 
        p.owner === Player.PLAYER_2 || 
        (p.owner === Player.PLAYER_1 && ['p1-pawn-1', 'p1-knight-1'].includes(p.id))
      );
      
      expect(WinConditions.isGameOver(state)).toBe(true);
    });

    it('should return true when game is a draw', () => {
      const state = GameState.initializeBoard();
      state.capturesSinceLastMove = 50;
      
      expect(WinConditions.isGameOver(state)).toBe(true);
    });
  });

  describe('getWinner', () => {
    it('should return null for game in progress', () => {
      const state = GameState.initializeBoard();
      
      expect(WinConditions.getWinner(state)).toBeNull();
    });

    it('should return Player 1 when Player 1 wins', () => {
      const state = GameState.initializeBoard();
      state.pieces = state.pieces.filter(p => 
        p.owner === Player.PLAYER_1 || 
        (p.owner === Player.PLAYER_2 && ['p2-pawn-1', 'p2-knight-1'].includes(p.id))
      );
      
      expect(WinConditions.getWinner(state)).toBe(Player.PLAYER_1);
    });

    it('should return Player 2 when Player 2 wins', () => {
      const state = GameState.initializeBoard();
      state.pieces = state.pieces.filter(p => 
        p.owner === Player.PLAYER_2 || 
        (p.owner === Player.PLAYER_1 && ['p1-pawn-1', 'p1-knight-1'].includes(p.id))
      );
      
      expect(WinConditions.getWinner(state)).toBe(Player.PLAYER_2);
    });

    it('should return null for draw', () => {
      const state = GameState.initializeBoard();
      state.capturesSinceLastMove = 50;
      
      expect(WinConditions.getWinner(state)).toBeNull();
    });
  });

  describe('getOutcomeMessage', () => {
    it('should return "Game in progress" for ongoing game', () => {
      const state = GameState.initializeBoard();
      
      expect(WinConditions.getOutcomeMessage(state)).toBe('Game in progress');
    });

    it('should return "Player 1 wins!" when Player 1 wins', () => {
      const state = GameState.initializeBoard();
      state.pieces = state.pieces.filter(p => 
        p.owner === Player.PLAYER_1 || 
        (p.owner === Player.PLAYER_2 && ['p2-pawn-1', 'p2-knight-1'].includes(p.id))
      );
      
      expect(WinConditions.getOutcomeMessage(state)).toBe('Player 1 wins!');
    });

    it('should return "Player 2 wins!" when Player 2 wins', () => {
      const state = GameState.initializeBoard();
      state.pieces = state.pieces.filter(p => 
        p.owner === Player.PLAYER_2 || 
        (p.owner === Player.PLAYER_1 && ['p1-pawn-1', 'p1-knight-1'].includes(p.id))
      );
      
      expect(WinConditions.getOutcomeMessage(state)).toBe('Player 2 wins!');
    });

    it('should return draw message when game is a draw', () => {
      const state = GameState.initializeBoard();
      state.capturesSinceLastMove = 50;
      
      expect(WinConditions.getOutcomeMessage(state)).toBe('Game is a draw (50 moves without capture)');
    });
  });
});
