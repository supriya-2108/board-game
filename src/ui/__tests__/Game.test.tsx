import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Game from '../components/Game';

describe('Game Component Integration Tests', () => {
  beforeEach(() => {
    render(<Game />);
  });

  it('renders the game board with 64 squares', () => {
    const squares = document.querySelectorAll('.square');
    expect(squares.length).toBe(64);
  });

  it('renders game controls with mode selector', () => {
    const modeSelect = screen.getByLabelText(/game mode/i);
    expect(modeSelect).toBeInTheDocument();
  });

  it('renders resource points display', () => {
    expect(screen.getByText(/Player 1 Resources:/i)).toBeInTheDocument();
    expect(screen.getByText(/Player 2 Resources:/i)).toBeInTheDocument();
  });

  it('renders current player indicator', () => {
    expect(screen.getByText(/Current Player: Player 1/i)).toBeInTheDocument();
  });

  it('renders new game and restart buttons', () => {
    expect(screen.getByText(/New Game/i)).toBeInTheDocument();
    expect(screen.getByText(/Restart/i)).toBeInTheDocument();
  });

  it('renders move history section', () => {
    expect(screen.getByText(/Move History/i)).toBeInTheDocument();
  });

  it('shows difficulty selector when AI mode is selected', () => {
    const modeSelect = screen.getByLabelText(/game mode/i) as HTMLSelectElement;
    fireEvent.change(modeSelect, { target: { value: 'AI' } });
    
    expect(screen.getByLabelText(/difficulty/i)).toBeInTheDocument();
  });

  it('handles new game button click', () => {
    const newGameButton = screen.getByText(/New Game/i);
    fireEvent.click(newGameButton);
    
    // Game should reset - verify current player is Player 1
    expect(screen.getByText(/Current Player: Player 1/i)).toBeInTheDocument();
  });

  it('handles restart button click', () => {
    const restartButton = screen.getByText(/Restart/i);
    fireEvent.click(restartButton);
    
    // Game should reset
    expect(screen.getByText(/Current Player: Player 1/i)).toBeInTheDocument();
  });

  it('displays pieces on the board', () => {
    const pieces = document.querySelectorAll('.piece');
    expect(pieces.length).toBeGreaterThan(0);
  });
});
