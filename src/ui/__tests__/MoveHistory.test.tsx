import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MoveHistory from '../components/MoveHistory';
import { Move, PieceType, Player } from '../../types';

describe('MoveHistory Component Tests', () => {
  const mockMoves: Move[] = [
    {
      piece: {
        type: PieceType.PAWN,
        owner: Player.PLAYER_1,
        position: { row: 3, col: 1 },
        hasMoved: true,
        id: 'p1',
      },
      from: { row: 2, col: 1 },
      to: { row: 3, col: 1 },
      timestamp: Date.now(),
    },
  ];

  it('renders move history header', () => {
    render(<MoveHistory moves={[]} />);
    expect(screen.getByText(/Move History/i)).toBeInTheDocument();
  });

  it('displays no moves message when empty', () => {
    render(<MoveHistory moves={[]} />);
    expect(screen.getByText(/No moves yet/i)).toBeInTheDocument();
  });

  it('displays moves in formatted notation', () => {
    render(<MoveHistory moves={mockMoves} />);
    expect(screen.getByText(/P1: Pawn/i)).toBeInTheDocument();
  });

  it('renders undo button when moves exist', () => {
    render(<MoveHistory moves={mockMoves} />);
    expect(screen.getByRole('button', { name: /Undo/i })).toBeInTheDocument();
  });
});
