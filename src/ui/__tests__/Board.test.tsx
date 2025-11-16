import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Board from '../components/Board';
import { Player, PieceType } from '../../types';

describe('Board Component Tests', () => {
  const mockBoardState = {
    pieces: [
      {
        id: 'p1',
        type: PieceType.PAWN,
        owner: Player.PLAYER_1,
        position: { row: 2, col: 1 },
        hasMoved: false,
      },
    ],
    currentPlayer: Player.PLAYER_1,
    resourcePoints: { [Player.PLAYER_1]: 0, [Player.PLAYER_2]: 0 },
    moveCount: 0,
    capturesSinceLastMove: 0,
  };

  it('renders 64 squares', () => {
    const { container } = render(<Board boardState={mockBoardState} />);
    const squares = container.querySelectorAll('.square');
    expect(squares.length).toBe(64);
  });

  it('renders pieces at correct positions', () => {
    const { container } = render(<Board boardState={mockBoardState} />);
    const pieces = container.querySelectorAll('.piece');
    expect(pieces.length).toBe(1);
  });

  it('flips board when flipBoard prop is true', () => {
    const { container } = render(
      <Board boardState={mockBoardState} flipBoard={true} />
    );
    expect(container.querySelector('.board')).toBeTruthy();
  });

  it('highlights valid moves', () => {
    const validMoves = [{ row: 3, col: 1 }];
    const { container } = render(
      <Board boardState={mockBoardState} validMoves={validMoves} />
    );
    const validSquares = container.querySelectorAll('.valid-move');
    expect(validSquares.length).toBeGreaterThan(0);
  });
});
