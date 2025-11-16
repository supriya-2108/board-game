export enum PieceType {
  PAWN = 'PAWN',
  KNIGHT = 'KNIGHT',
  BISHOP = 'BISHOP',
  ROOK = 'ROOK',
  QUEEN = 'QUEEN',
  KING = 'KING'
}

export enum Player {
  PLAYER_1 = 1,
  PLAYER_2 = 2
}

export interface Position {
  row: number;  // 1-8
  col: number;  // 1-8
}

export interface Piece {
  type: PieceType;
  owner: Player;
  position: Position;
  hasMoved: boolean;
  id: string;
}

export interface BoardState {
  pieces: Piece[];
  currentPlayer: Player;
  playerNames: { [Player.PLAYER_1]: string; [Player.PLAYER_2]: string };
  resourcePoints: { [Player.PLAYER_1]: number; [Player.PLAYER_2]: number };
  moveCount: number;
  capturesSinceLastMove: number;
}

export interface Move {
  piece: Piece;
  from: Position;
  to: Position;
  capturedPiece?: Piece;
  isUpgrade?: boolean;
  timestamp: number;
}

export interface MoveResult {
  valid: boolean;
  error?: string;
  newState?: BoardState;
  move?: Move;
}

export enum GameStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  PLAYER_1_WIN = 'PLAYER_1_WIN',
  PLAYER_2_WIN = 'PLAYER_2_WIN',
  DRAW = 'DRAW'
}

export enum Difficulty {
  EASY = 'EASY',
  HARD = 'HARD'
}

export enum GameMode {
  PVP = 'PVP',
  AI = 'AI'
}

export interface GameConfig {
  mode: GameMode;
  difficulty?: Difficulty;
}

export interface PlayerProfile {
  id: string;
  displayName: string;
  createdAt: number;
  gamesPlayed?: number;
  wins?: number;
}

export interface ProfileValidationResult {
  valid: boolean;
  error?: string;
}

export interface IProfileManager {
  createProfile(displayName: string): PlayerProfile;
  getProfile(): PlayerProfile | null;
  updateProfile(profile: PlayerProfile): void;
  updateDisplayName(newDisplayName: string): ProfileValidationResult;
  validateDisplayName(name: string): ProfileValidationResult;
  hasProfile(): boolean;
  clearProfile(): void;
}
