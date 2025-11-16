import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GameControls from '../components/GameControls';
import { GameMode, Difficulty, Player, GameStatus } from '../../types';

describe('GameControls Component Tests', () => {
  const mockProps = {
    gameMode: GameMode.PVP,
    difficulty: Difficulty.EASY,
    currentPlayer: Player.PLAYER_1,
    gameStatus: GameStatus.IN_PROGRESS,
    resourcePoints: { [Player.PLAYER_1]: 0, [Player.PLAYER_2]: 0 },
    onModeChange: vi.fn(),
    onDifficultyChange: vi.fn(),
    onNewGame: vi.fn(),
    onRestart: vi.fn(),
  };

  it('renders game mode selector', () => {
    render(<GameControls {...mockProps} />);
    expect(screen.getByLabelText(/game mode/i)).toBeInTheDocument();
  });

  it('calls onModeChange when mode is changed', () => {
    render(<GameControls {...mockProps} />);
    const select = screen.getByLabelText(/game mode/i);
    fireEvent.change(select, { target: { value: GameMode.AI } });
    expect(mockProps.onModeChange).toHaveBeenCalledWith(GameMode.AI);
  });

  it('displays resource points', () => {
    render(<GameControls {...mockProps} />);
    expect(screen.getByText(/Player 1 Resources:/i)).toBeInTheDocument();
    expect(screen.getByText(/Player 2 Resources:/i)).toBeInTheDocument();
  });
});
