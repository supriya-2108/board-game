import { describe, it, expect } from 'vitest';
import { WinConditions } from '../winConditions';
import { GameState } from '../gameState';
import { Player, PieceType, GameStatus, BoardState } from '../../types';

describe('WinConditions', () => {
  describe('checkKingCapture', () => {
    it('should return IN_PROGRESS when both Kings are present', () => {
      const state = GameState.initializeBoard();
      
      expect(WinConditions.checkKingCapture(state)).toBe(GameStatus.IN_PROGRESS);
    });

    it('should return PLAYER_2_WIN when Player 1 King is captured', () => {
      const state = GameState.initializeBoard();
      // Remove Player 1's King
      state.pieces = state.pieces.filter(p => p.id !== 'p1-king');
      
      expect(WinConditions.checkKingCapture(state)).toBe(GameStatus.PLAYER_2_WIN);
    });

    it('should return PLAYER_1_WIN when Player 2 King is captured', () => {
      const state = GameState.initializeBoard();
      // Remove Player 2's King
      state.pieces = state.pieces.filter(p => p.id !== 'p2-king');
      
      expect(WinConditions.checkKingCapture(state)).toBe(GameStatus.PLAYER_1_WIN);
    });
  });

  describe('hasInsufficientPieces', () => {
    it('should return true when player has fewer than 3 pieces excluding King', () => {
      const state = GameState.initializeBoard();
      // Keep only King and 2 other pieces for Player 1
      state.pieces = state.pieces.filter(p => 
        p.owner === Player.PLAYER_2 || 
        (p.owner === Player.PLAYER_1 && ['p1-king', 'p1-pawn-1', 'p1-knight-1'].includes(p.id))
      );
      
      expect(WinConditions.hasInsufficientPieces(state, Player.PLAYER_1)).toBe(true);
    });

    it('should return false when player has 3 or more pieces excluding King', () => {
      const state = GameState.initializeBoard();
      
      expect(WinConditions.hasInsufficientPieces(state, Player.PLAYER_1)).toBe(false);
      expect(WinConditions.hasInsufficientPieces(state, Player.PLAYER_2)).toBe(false);
    });

    it('should return true when player has exactly 2 pieces excluding King', () => {
      const state = GameState.initializeBoard();
      state.pieces = [
        { type: PieceType.KING, owner: Player.PLAYER_1, position: { row: 1, col: 1 }, hasMoved: false, id: 'p1-king' },
        { type: PieceType.KNIGHT, owner: Player.PLAYER_1, position: { row: 1, col: 2 }, hasMoved: false, id: 'p1-1' },
        { type: PieceType.BISHOP, owner: Player.PLAYER_1, position: { row: 1, col: 3 }, hasMoved: false, id: 'p1-2' },
        { type: PieceType.KING, owner: Player.PLAYER_2, position: { row: 8, col: 1 }, hasMoved: false, id: 'p2-king' },
        { type: PieceType.KNIGHT, owner: Player.PLAYER_2, position: { row: 8, col: 2 }, hasMoved: false, id: 'p2-1' },
        { type: PieceType.BISHOP, owner: Player.PLAYER_2, position: { row: 8, col: 3 }, hasMoved: false, id: 'p2-2' },
        { type: PieceType.QUEEN, owner: Player.PLAYER_2, position: { row: 8, col: 4 }, hasMoved: false, id: 'p2-3' }
      ];
      
      expect(WinConditions.hasInsufficientPieces(state, Player.PLAYER_1)).toBe(true);
      expect(WinConditions.hasInsufficientPieces(state, Player.PLAYER_2)).toBe(false);
    });

    it('should not count King towards piece count', () => {
      const state = GameState.initializeBoard();
      // Player 1 has only King and 2 pawns (should be insufficient)
      state.pieces = [
        { type: PieceType.KING, owner: Player.PLAYER_1, position: { row: 1, col: 1 }, hasMoved: false, id: 'p1-king' },
        { type: PieceType.PAWN, owner: Player.PLAYER_1, position: { row: 2, col: 1 }, hasMoved: false, id: 'p1-pawn-1' },
        { type: PieceType.PAWN, owner: Player.PLAYER_1, position: { row: 2, col: 2 }, hasMoved: false, id: 'p1-pawn-2' },
        { type: PieceType.KING, owner: Player.PLAYER_2, position: { row: 8, col: 1 }, hasMoved: false, id: 'p2-king' },
        { type: PieceType.QUEEN, owner: Player.PLAYER_2, position: { row: 8, col: 2 }, hasMoved: false, id: 'p2-queen' },
        { type: PieceType.ROOK, owner: Player.PLAYER_2, position: { row: 8, col: 3 }, hasMoved: false, id: 'p2-rook' },
        { type: PieceType.BISHOP, owner: Player.PLAYER_2, position: { row: 8, col: 4 }, hasMoved: false, id: 'p2-bishop' }
      ];
      
      expect(WinConditions.hasInsufficientPieces(state, Player.PLAYER_1)).toBe(true);
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

    it('should return PLAYER_2_WIN immediately when Player 1 King is captured', () => {
      const state = GameState.initializeBoard();
      // Remove Player 1's King
      state.pieces = state.pieces.filter(p => p.id !== 'p1-king');
      
      expect(WinConditions.checkGameStatus(state)).toBe(GameStatus.PLAYER_2_WIN);
    });

    it('should return PLAYER_1_WIN immediately when Player 2 King is captured', () => {
      const state = GameState.initializeBoard();
      // Remove Player 2's King
      state.pieces = state.pieces.filter(p => p.id !== 'p2-king');
      
      expect(WinConditions.checkGameStatus(state)).toBe(GameStatus.PLAYER_1_WIN);
    });

    it('should prioritize King capture over other win conditions', () => {
      const state = GameState.initializeBoard();
      // Remove Player 1's King AND give them fewer than 3 pieces
      state.pieces = state.pieces.filter(p => 
        p.owner === Player.PLAYER_2 || 
        (p.owner === Player.PLAYER_1 && ['p1-pawn-1', 'p1-knight-1'].includes(p.id))
      );
      
      expect(WinConditions.checkGameStatus(state)).toBe(GameStatus.PLAYER_2_WIN);
    });

    it('should return PLAYER_2_WIN when Player 1 has fewer than 3 pieces excluding King', () => {
      const state = GameState.initializeBoard();
      state.pieces = state.pieces.filter(p => 
        p.owner === Player.PLAYER_2 || 
        (p.owner === Player.PLAYER_1 && ['p1-king', 'p1-pawn-1', 'p1-knight-1'].includes(p.id))
      );
      
      expect(WinConditions.checkGameStatus(state)).toBe(GameStatus.PLAYER_2_WIN);
    });

    it('should return PLAYER_1_WIN when Player 2 has fewer than 3 pieces excluding King', () => {
      const state = GameState.initializeBoard();
      state.pieces = state.pieces.filter(p => 
        p.owner === Player.PLAYER_1 || 
        (p.owner === Player.PLAYER_2 && ['p2-king', 'p2-pawn-1', 'p2-knight-1'].includes(p.id))
      );
      
      expect(WinConditions.checkGameStatus(state)).toBe(GameStatus.PLAYER_1_WIN);
    });

    it('should return DRAW when 50 moves without capture', () => {
      const state = GameState.initializeBoard();
      state.capturesSinceLastMove = 50;
      
      expect(WinConditions.checkGameStatus(state)).toBe(GameStatus.DRAW);
    });

    it('should prioritize King capture over draw condition', () => {
      const state = GameState.initializeBoard();
      state.capturesSinceLastMove = 50;
      // Remove Player 1's King
      state.pieces = state.pieces.filter(p => p.id !== 'p1-king');
      
      expect(WinConditions.checkGameStatus(state)).toBe(GameStatus.PLAYER_2_WIN);
    });

    it('should prioritize draw over piece count win conditions', () => {
      const state = GameState.initializeBoard();
      state.capturesSinceLastMove = 50;
      // Also make Player 1 have fewer than 3 pieces (excluding King)
      state.pieces = state.pieces.filter(p => 
        p.owner === Player.PLAYER_2 || 
        (p.owner === Player.PLAYER_1 && ['p1-king', 'p1-pawn-1', 'p1-knight-1'].includes(p.id))
      );
      
      expect(WinConditions.checkGameStatus(state)).toBe(GameStatus.DRAW);
    });

    it('should return PLAYER_2_WIN when Player 1 has no valid moves', () => {
      const state: BoardState = {
        pieces: [
          { type: PieceType.KING, owner: Player.PLAYER_1, position: { row: 1, col: 1 }, hasMoved: false, id: 'p1-king' },
          { type: PieceType.PAWN, owner: Player.PLAYER_1, position: { row: 2, col: 1 }, hasMoved: false, id: 'p1-1' },
          { type: PieceType.KING, owner: Player.PLAYER_2, position: { row: 8, col: 1 }, hasMoved: false, id: 'p2-king' },
          { type: PieceType.BISHOP, owner: Player.PLAYER_2, position: { row: 3, col: 1 }, hasMoved: false, id: 'p2-1' },
          { type: PieceType.KNIGHT, owner: Player.PLAYER_2, position: { row: 4, col: 1 }, hasMoved: false, id: 'p2-2' },
          { type: PieceType.QUEEN, owner: Player.PLAYER_2, position: { row: 5, col: 1 }, hasMoved: false, id: 'p2-3' }
        ],
        currentPlayer: Player.PLAYER_1,
        playerNames: {
          [Player.PLAYER_1]: 'Player 1',
          [Player.PLAYER_2]: 'Player 2'
        },
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

    it('should return true when Player 1 King is captured', () => {
      const state = GameState.initializeBoard();
      state.pieces = state.pieces.filter(p => p.id !== 'p1-king');
      
      expect(WinConditions.isGameOver(state)).toBe(true);
    });

    it('should return true when Player 2 King is captured', () => {
      const state = GameState.initializeBoard();
      state.pieces = state.pieces.filter(p => p.id !== 'p2-king');
      
      expect(WinConditions.isGameOver(state)).toBe(true);
    });

    it('should return true when Player 1 wins by piece count', () => {
      const state = GameState.initializeBoard();
      state.pieces = state.pieces.filter(p => 
        p.owner === Player.PLAYER_1 || 
        (p.owner === Player.PLAYER_2 && ['p2-king', 'p2-pawn-1', 'p2-knight-1'].includes(p.id))
      );
      
      expect(WinConditions.isGameOver(state)).toBe(true);
    });

    it('should return true when Player 2 wins by piece count', () => {
      const state = GameState.initializeBoard();
      state.pieces = state.pieces.filter(p => 
        p.owner === Player.PLAYER_2 || 
        (p.owner === Player.PLAYER_1 && ['p1-king', 'p1-pawn-1', 'p1-knight-1'].includes(p.id))
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

    it('should return Player 1 when Player 2 King is captured', () => {
      const state = GameState.initializeBoard();
      state.pieces = state.pieces.filter(p => p.id !== 'p2-king');
      
      expect(WinConditions.getWinner(state)).toBe(Player.PLAYER_1);
    });

    it('should return Player 2 when Player 1 King is captured', () => {
      const state = GameState.initializeBoard();
      state.pieces = state.pieces.filter(p => p.id !== 'p1-king');
      
      expect(WinConditions.getWinner(state)).toBe(Player.PLAYER_2);
    });

    it('should return Player 1 when Player 1 wins by piece count', () => {
      const state = GameState.initializeBoard();
      state.pieces = state.pieces.filter(p => 
        p.owner === Player.PLAYER_1 || 
        (p.owner === Player.PLAYER_2 && ['p2-king', 'p2-pawn-1', 'p2-knight-1'].includes(p.id))
      );
      
      expect(WinConditions.getWinner(state)).toBe(Player.PLAYER_1);
    });

    it('should return Player 2 when Player 2 wins by piece count', () => {
      const state = GameState.initializeBoard();
      state.pieces = state.pieces.filter(p => 
        p.owner === Player.PLAYER_2 || 
        (p.owner === Player.PLAYER_1 && ['p1-king', 'p1-pawn-1', 'p1-knight-1'].includes(p.id))
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

    it('should return "Player 1 wins by King capture!" when Player 2 King is captured', () => {
      const state = GameState.initializeBoard();
      state.pieces = state.pieces.filter(p => p.id !== 'p2-king');
      
      expect(WinConditions.getOutcomeMessage(state)).toBe('Player 1 wins by King capture!');
    });

    it('should return "Player 2 wins by King capture!" when Player 1 King is captured', () => {
      const state = GameState.initializeBoard();
      state.pieces = state.pieces.filter(p => p.id !== 'p1-king');
      
      expect(WinConditions.getOutcomeMessage(state)).toBe('Player 2 wins by King capture!');
    });

    it('should return "Player 1 wins!" when Player 1 wins by piece count', () => {
      const state = GameState.initializeBoard();
      state.pieces = state.pieces.filter(p => 
        p.owner === Player.PLAYER_1 || 
        (p.owner === Player.PLAYER_2 && ['p2-king', 'p2-pawn-1', 'p2-knight-1'].includes(p.id))
      );
      
      expect(WinConditions.getOutcomeMessage(state)).toBe('Player 1 wins!');
    });

    it('should return "Player 2 wins!" when Player 2 wins by piece count', () => {
      const state = GameState.initializeBoard();
      state.pieces = state.pieces.filter(p => 
        p.owner === Player.PLAYER_2 || 
        (p.owner === Player.PLAYER_1 && ['p1-king', 'p1-pawn-1', 'p1-knight-1'].includes(p.id))
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
