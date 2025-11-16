# Design Document

## Overview

This document outlines the design for a turn-based strategic board game featuring an 8x8 grid with unique piece mechanics, resource management, and AI opponent capabilities. The game supports both local player-vs-player (PvP) and player-vs-AI modes with configurable difficulty levels.

The system is designed as a web-based application using a component-based architecture that separates game logic from presentation. This separation enables testability, maintainability, and potential future extensions (e.g., online multiplayer, additional piece types).

**Key Design Decisions:**
- **Web-based implementation**: Provides cross-platform compatibility and responsive design without platform-specific builds
- **Separation of concerns**: Game logic is independent of UI, allowing for comprehensive unit testing and potential UI framework changes
- **Immutable game state**: State transitions create new state objects rather than mutating existing ones, simplifying undo functionality and state management
- **Minimax with alpha-beta pruning**: Industry-standard algorithm for turn-based games, providing strong AI performance with configurable difficulty

## Architecture

### High-Level Architecture

```mermaid
graph TB
    UI[UI Layer]
    GameController[Game Controller]
    GameState[Game State Manager]
    MoveValidator[Move Validator]
    AIEngine[AI Engine]
    PieceLogic[Piece Logic]
    
    UI --> GameController
    GameController --> GameState
    GameController --> MoveValidator
    GameController --> AIEngine
    MoveValidator --> PieceLogic
    AIEngine --> MoveValidator
    AIEngine --> GameState
    GameState --> PieceLogic
```

### Layer Responsibilities

**UI Layer**
- Renders the 8x8 board with current piece positions
- Handles user interactions (drag-and-drop, touch gestures)
- Displays game state (current player, resource points, move history)
- Shows feedback messages for invalid moves
- Provides controls for game mode, difficulty, new game, and restart

**Game Controller**
- Orchestrates game flow and turn management
- Processes player move requests through the Move Validator
- Triggers AI moves when appropriate
- Manages game mode switching (PvP vs AI)
- Handles undo requests
- Detects win/draw conditions

**Game State Manager**
- Maintains current board state (piece positions, types, ownership)
- Tracks resource points for both players
- Records move history
- Manages turn state
- Provides state snapshots for undo functionality

**Move Validator**
- Validates moves against piece-specific rules
- Checks path obstructions
- Verifies destination square validity
- Handles capture logic
- Returns validation results with error messages

**AI Engine**
- Implements minimax algorithm with alpha-beta pruning
- Evaluates board positions using heuristic scoring
- Generates and evaluates possible moves
- Respects difficulty-based search depth limits
- Returns optimal move within time constraints

**Piece Logic**
- Defines movement rules for each piece type (Pawn, Knight, Bishop, Queen)
- Calculates valid destination squares
- Handles piece-specific constraints (e.g., Pawn first move, Knight jumping)

## Components and Interfaces

### Core Data Structures

```typescript
enum PieceType {
  PAWN = 'PAWN',
  KNIGHT = 'KNIGHT',
  BISHOP = 'BISHOP',
  QUEEN = 'QUEEN'
}

enum Player {
  PLAYER_1 = 1,
  PLAYER_2 = 2
}

interface Position {
  row: number;  // 1-8
  col: number;  // 1-8
}

interface Piece {
  type: PieceType;
  owner: Player;
  position: Position;
  hasMoved: boolean;  // Tracks if piece has moved (relevant for Pawns)
  id: string;  // Unique identifier for tracking
}

interface BoardState {
  pieces: Piece[];
  currentPlayer: Player;
  resourcePoints: { [Player.PLAYER_1]: number; [Player.PLAYER_2]: number };
  moveCount: number;
  capturesSinceLastMove: number;  // For 50-move draw rule
}

interface Move {
  piece: Piece;
  from: Position;
  to: Position;
  capturedPiece?: Piece;
  isUpgrade?: boolean;
  timestamp: number;
}

interface MoveResult {
  valid: boolean;
  error?: string;
  newState?: BoardState;
  move?: Move;
}

interface GameConfig {
  mode: 'PVP' | 'AI';
  difficulty?: 'EASY' | 'HARD';
}

enum GameStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  PLAYER_1_WIN = 'PLAYER_1_WIN',
  PLAYER_2_WIN = 'PLAYER_2_WIN',
  DRAW = 'DRAW'
}
```

### Component Interfaces

**GameController Interface**
```typescript
interface IGameController {
  initializeGame(config: GameConfig): void;
  attemptMove(from: Position, to: Position): MoveResult;
  attemptUpgrade(pieceId: string): MoveResult;
  undoMove(count: number): boolean;
  getGameState(): BoardState;
  getGameStatus(): GameStatus;
  getMoveHistory(): Move[];
  restartGame(): void;
  newGame(config: GameConfig): void;
}
```

**MoveValidator Interface**
```typescript
interface IMoveValidator {
  validateMove(piece: Piece, to: Position, board: BoardState): MoveResult;
  getValidMoves(piece: Piece, board: BoardState): Position[];
  isPathClear(from: Position, to: Position, board: BoardState): boolean;
}
```

**AIEngine Interface**
```typescript
interface IAIEngine {
  calculateBestMove(board: BoardState, depth: number): Move;
  evaluatePosition(board: BoardState, player: Player): number;
}
```

**PieceLogic Interface**
```typescript
interface IPieceLogic {
  getValidDestinations(piece: Piece, board: BoardState): Position[];
  canCapture(piece: Piece, target: Position, board: BoardState): boolean;
}
```

### Initial Board Setup

**Design Decision**: Pieces are arranged symmetrically with specific positioning to balance gameplay:
- Row 1 (Player 1): 4 Pawns, 4 Knights
- Row 2 (Player 1): 4 Bishops
- Row 7 (Player 2): 4 Bishops  
- Row 8 (Player 2): 4 Pawns, 4 Knights

This arrangement ensures both players have identical starting positions and strategic options.

## Data Models

### Piece Movement Rules

**Pawn**
- Direction: Forward only (toward row 8 for Player 1, toward row 1 for Player 2)
- Distance: 1-2 squares on first move, 1 square thereafter
- Capture: Cannot capture (simplified from chess)
- Special: Auto-promotes to Queen upon reaching row 8
- Obstruction: Cannot move through or onto occupied squares

**Knight**
- Pattern: L-shape (2 squares in one direction, 1 square perpendicular)
- Jump: Can jump over any pieces
- Capture: Captures by landing on opponent piece
- Valid destinations: 8 possible positions (if within board boundaries)

**Bishop**
- Direction: Diagonal only
- Distance: Any number of squares
- Capture: Captures by landing on opponent piece
- Obstruction: Cannot move through pieces; stops at first piece encountered

**Queen** (Promoted Pawn)
- Combines Bishop diagonal movement with extended forward movement
- Can move diagonally any distance or forward any distance
- Capture: Captures by landing on opponent piece
- Obstruction: Cannot move through pieces

### Resource System

**Design Decision**: Resource points create strategic depth by forcing players to choose between aggressive play (capturing for resources) and defensive positioning.

- **Earning**: 1 resource point per captured piece
- **Spending**: 2 resource points to upgrade a Pawn to Queen
- **Constraints**: Cannot upgrade Pawns on row 1 or row 8 (row 8 Pawns auto-promote)
- **Display**: Both players' resource counts visible at all times

### Game State Transitions

```mermaid
stateDiagram-v2
    [*] --> Setup
    Setup --> Player1Turn
    Player1Turn --> ValidatingMove
    ValidatingMove --> Player1Turn: Invalid Move
    ValidatingMove --> Player2Turn: Valid Move
    Player2Turn --> ValidatingMove
    ValidatingMove --> Player1Turn: Valid Move
    Player1Turn --> GameOver: Win/Draw Condition
    Player2Turn --> GameOver: Win/Draw Condition
    GameOver --> [*]
```

### Move History and Undo

**Design Decision**: Limiting undo to 3 moves prevents excessive backtracking while allowing tactical corrections.

- Move history stores complete move information including captures
- Undo reconstructs previous board state from history
- Maximum 3 moves can be undone
- Undo is available in both PvP and AI modes
- Move history displayed in sidebar with replay capability

## AI Implementation

### Minimax Algorithm with Alpha-Beta Pruning

**Design Decision**: Minimax provides optimal play for turn-based games, while alpha-beta pruning makes deeper search depths computationally feasible.

**Algorithm Overview:**
1. Generate all possible moves for current player
2. For each move, recursively evaluate opponent's best response
3. Select move that maximizes player's advantage while minimizing opponent's best counter
4. Alpha-beta pruning eliminates branches that cannot affect final decision

**Depth Configuration:**
- Easy: Depth 4 (looks ahead 4 half-moves)
- Hard: Depth 6 (looks ahead 6 half-moves)

**Time Constraint**: AI must complete move calculation within 5 seconds

### Position Evaluation Heuristic

The AI evaluates board positions using a weighted scoring system:

```typescript
function evaluatePosition(board: BoardState, player: Player): number {
  let score = 0;
  
  // Material value
  for (const piece of board.pieces) {
    const value = getPieceValue(piece.type);
    score += piece.owner === player ? value : -value;
  }
  
  // Resource points
  score += board.resourcePoints[player] * 10;
  score -= board.resourcePoints[opponent] * 10;
  
  // Positional bonuses
  score += evaluatePositioning(board, player);
  
  // Mobility (number of valid moves)
  score += countValidMoves(board, player) * 2;
  
  return score;
}

function getPieceValue(type: PieceType): number {
  switch (type) {
    case PieceType.PAWN: return 10;
    case PieceType.KNIGHT: return 30;
    case PieceType.BISHOP: return 30;
    case PieceType.QUEEN: return 50;
  }
}
```

**Design Rationale:**
- Material value reflects piece strength
- Resource points weighted heavily to encourage captures
- Positional bonuses reward board control
- Mobility scoring encourages flexible positioning

### Move Ordering Optimization

**Design Decision**: Evaluating captures first improves alpha-beta pruning efficiency by finding good moves early.

Moves are ordered for evaluation:
1. Captures (highest value targets first)
2. Upgrades (if resources available)
3. Forward advancement
4. Other moves

## Error Handling

### Move Validation Errors

All invalid moves return descriptive error messages:

- `"Invalid: out of bounds"` - Destination outside 8x8 grid
- `"Invalid: obstructed"` - Path blocked by another piece
- `"Invalid: blocked"` - Destination occupied by friendly piece
- `"Invalid: illegal move for piece type"` - Move violates piece movement rules
- `"Invalid: not your turn"` - Player attempting move out of turn
- `"Invalid: game over"` - Move attempted after game conclusion

**Design Decision**: Specific error messages help players understand game rules without consulting documentation.

### AI Error Handling

- If AI exceeds 5-second time limit, return best move found so far
- If no valid moves available, trigger win condition for opponent
- If evaluation encounters invalid state, log error and use fallback heuristic

### State Consistency

- All state transitions validated before application
- Invalid state transitions rejected with error
- Undo operations validated against history availability
- Board state integrity checked after each move

## Win and Draw Conditions

### Win Conditions

1. **Piece Count**: Opponent has fewer than 3 pieces remaining
2. **No Valid Moves**: Opponent has no legal moves available (stalemate variant)

**Design Decision**: Using piece count threshold (< 3) provides clear victory condition while preventing prolonged endgames.

### Draw Condition

**50-Move Rule**: If 50 consecutive moves occur without any capture, game is declared a draw

**Design Decision**: Prevents infinite games while allowing sufficient time for strategic maneuvering.

### End Game Flow

```mermaid
sequenceDiagram
    participant GC as Game Controller
    participant GS as Game State
    participant UI as UI Layer
    
    GC->>GS: Check win/draw conditions
    GS->>GC: Return game status
    alt Win or Draw
        GC->>UI: Display outcome
        GC->>GC: Prevent further moves
        UI->>UI: Show new game option
    else In Progress
        GC->>GC: Continue game
    end
```

## UI Design

### Responsive Layout

**Design Decision**: Mobile-first responsive design ensures playability on all devices without separate implementations.

**Desktop Layout (≥768px):**
```
+----------------------------------+
|  Header (Mode, Difficulty, New)  |
+----------------------------------+
|          |                       |
|  Move    |      8x8 Board        |
| History  |                       |
| Sidebar  |                       |
|          |                       |
+----------+-----------------------+
|  Resource Points | Current Turn  |
+----------------------------------+
```

**Mobile Layout (<768px):**
```
+----------------------------------+
|  Header (Mode, Difficulty, New)  |
+----------------------------------+
|                                  |
|         8x8 Board                |
|                                  |
+----------------------------------+
|  Resource Points | Current Turn  |
+----------------------------------+
|  Move History (Collapsible)      |
+----------------------------------+
```

### Interaction Design

**Drag and Drop:**
- Mouse: Click and drag piece to destination
- Touch: Touch and drag piece to destination
- Visual feedback: Piece follows cursor/finger
- Valid destinations highlighted during drag
- Invalid drop returns piece to origin with error tooltip

**Board Orientation:**
- Player 1 view: Row 1 at bottom, Row 8 at top
- Player 2 view (PvP mode): Board flips 180° on turn change
- AI mode: Board remains in Player 1 orientation

**Visual Feedback:**
- Current player indicator
- Selected piece highlight
- Valid move indicators
- Capture animations
- Promotion animations
- Error tooltips (2-second display)

### Move History Sidebar

**Features:**
- Chronological list of all moves
- Format: "P1: Pawn E2→E4" or "P2: Knight B8→C6 (capture)"
- Click any move to replay board state at that point
- Scroll to view full history
- Undo button (reverts last 1-3 moves)

## Testing Strategy

### Unit Tests

**Game Logic Tests:**
- Piece movement validation for all piece types
- Capture logic
- Pawn promotion (auto and manual upgrade)
- Resource point earning and spending
- Win/draw condition detection
- Move history and undo functionality
- Board state transitions

**AI Tests:**
- Minimax algorithm correctness
- Alpha-beta pruning optimization
- Position evaluation accuracy
- Move ordering
- Depth-limited search
- Time constraint compliance
- Difficulty level behavior

**Validation Tests:**
- Path obstruction detection
- Boundary checking
- Turn enforcement
- Invalid move rejection
- Error message accuracy

### Integration Tests

**Game Flow Tests:**
- Complete game from initialization to win/draw
- Mode switching (PvP ↔ AI)
- Difficulty changes
- New game and restart functionality
- Undo during active game

**UI Interaction Tests:**
- Drag and drop piece movement
- Touch gesture handling
- Board orientation flip
- Move history replay
- Control button functionality
- Responsive layout adaptation

### Test Coverage Goals

**Target**: 100% code coverage across all modules

**Coverage Areas:**
- All piece movement rules and edge cases
- All game state transitions
- All win/draw conditions
- All error conditions
- AI decision-making at both difficulty levels
- UI event handlers and rendering logic

**Testing Tools:**
- Unit testing framework (Jest/Vitest)
- Integration testing (Testing Library)
- Coverage reporting (Istanbul/c8)
- E2E testing for full game scenarios

### Test Data

**Standard Test Scenarios:**
- Opening moves
- Mid-game captures
- Pawn promotion sequences
- Resource management decisions
- Endgame with < 3 pieces
- 50-move draw approach
- AI vs AI games at both difficulties

## Performance Considerations

### AI Performance

- Alpha-beta pruning reduces search space by ~50-90%
- Move ordering improves pruning efficiency
- Depth 4 (Easy): ~1-2 seconds per move
- Depth 6 (Hard): ~3-5 seconds per move
- Iterative deepening for time management

### UI Performance

- Virtual DOM for efficient rendering
- Debounced drag events
- Lazy loading of move history
- Optimized board re-rendering (only changed squares)

### Memory Management

- Immutable state prevents memory leaks
- Move history capped at reasonable limit (e.g., 200 moves)
- AI search tree garbage collected after move selection

## Player Profile System

### Overview

The player profile system allows users to create personalized profiles with custom display names that persist across game sessions. This enhances the gaming experience by replacing generic "Player 1" and "Player 2" labels with user-chosen identities.

**Design Decision**: Using browser local storage provides simple persistence without requiring backend infrastructure, keeping the application fully client-side.

### Data Model

```typescript
interface PlayerProfile {
  id: string;  // UUID for unique identification
  displayName: string;  // User-chosen name (1-20 characters)
  createdAt: number;  // Timestamp
  gamesPlayed?: number;  // Optional: track statistics
  wins?: number;  // Optional: track statistics
}

interface ProfileValidationResult {
  valid: boolean;
  error?: string;
}
```

### Profile Manager Interface

```typescript
interface IProfileManager {
  createProfile(displayName: string): PlayerProfile;
  getProfile(): PlayerProfile | null;
  updateProfile(profile: PlayerProfile): void;
  updateDisplayName(newDisplayName: string): ProfileValidationResult;
  validateDisplayName(name: string): ProfileValidationResult;
  hasProfile(): boolean;
  clearProfile(): void;
}
```

### Validation Rules

**Display Name Requirements:**
- Length: 1-20 characters
- Allowed characters: Alphanumeric (a-z, A-Z, 0-9) and spaces
- No leading or trailing spaces
- No consecutive spaces

**Validation Implementation:**
```typescript
function validateDisplayName(name: string): ProfileValidationResult {
  const trimmed = name.trim();
  
  if (trimmed.length < 1) {
    return { valid: false, error: "Display name cannot be empty" };
  }
  
  if (trimmed.length > 20) {
    return { valid: false, error: "Display name must be 20 characters or less" };
  }
  
  const validPattern = /^[a-zA-Z0-9]+( [a-zA-Z0-9]+)*$/;
  if (!validPattern.test(trimmed)) {
    return { valid: false, error: "Display name can only contain letters, numbers, and single spaces" };
  }
  
  return { valid: true };
}
```

### Storage Strategy

**Local Storage Schema:**
```typescript
// Key: 'playerProfile'
// Value: JSON-serialized PlayerProfile object
{
  "id": "uuid-v4-string",
  "displayName": "PlayerName",
  "createdAt": 1234567890,
  "gamesPlayed": 0,
  "wins": 0
}
```

**Design Decision**: Single profile per browser simplifies implementation. Future enhancement could support multiple profiles with profile selection.

### UI Flow

**First-Time User Experience:**
```mermaid
sequenceDiagram
    participant User
    participant UI
    participant ProfileMgr as Profile Manager
    participant Storage as Local Storage
    
    User->>UI: Launch game
    UI->>ProfileMgr: hasProfile()
    ProfileMgr->>Storage: Check for profile
    Storage->>ProfileMgr: No profile found
    ProfileMgr->>UI: false
    UI->>User: Show profile creation modal
    User->>UI: Enter display name
    UI->>ProfileMgr: validateDisplayName()
    ProfileMgr->>UI: Validation result
    alt Valid
        User->>UI: Submit
        UI->>ProfileMgr: createProfile()
        ProfileMgr->>Storage: Save profile
        UI->>User: Show game interface
    else Invalid
        UI->>User: Show error message
    end
```

**Returning User Experience:**
```mermaid
sequenceDiagram
    participant User
    participant UI
    participant ProfileMgr as Profile Manager
    participant Storage as Local Storage
    
    User->>UI: Launch game
    UI->>ProfileMgr: hasProfile()
    ProfileMgr->>Storage: Check for profile
    Storage->>ProfileMgr: Profile found
    ProfileMgr->>UI: true
    UI->>ProfileMgr: getProfile()
    ProfileMgr->>UI: PlayerProfile
    UI->>User: Show game interface with display name
```

### Integration with Game System

**Display Name Usage:**
- Replace "Player 1" with user's display name
- In PvP mode: Prompt second player for display name (session-only or separate profile)
- In AI mode: User's display name vs "AI Opponent"
- Show display names in:
  - Current turn indicator
  - Move history ("John: Pawn E2→E4")
  - Win/draw announcements ("John wins!")
  - Resource point display

**Game State Integration:**
```typescript
interface BoardState {
  pieces: Piece[];
  currentPlayer: Player;
  playerNames: { [Player.PLAYER_1]: string; [Player.PLAYER_2]: string };
  resourcePoints: { [Player.PLAYER_1]: number; [Player.PLAYER_2]: number };
  moveCount: number;
  capturesSinceLastMove: number;
}
```

### Profile Management UI

**Profile Creation Modal:**
- Centered modal overlay
- Input field for display name
- Real-time validation feedback
- Character counter (X/20)
- Submit button (disabled until valid)
- Cannot be dismissed without creating profile

**Profile Settings Menu:**
- Access via settings icon/button in game header
- Opens modal overlay with profile options
- Shows current display name
- Provides "Edit Display Name" option
- Shows statistics (games played, wins) - optional
- Provides "Clear Profile" option with confirmation dialog

**Edit Display Name Flow:**
- Opens edit modal with current name pre-filled
- Input field with same validation as creation
- Real-time validation feedback
- Character counter (X/20)
- "Save" button (disabled until valid and changed)
- "Cancel" button to dismiss without changes
- On save, updates profile in local storage
- Shows success confirmation message
- Updates display name throughout UI immediately

### Error Handling

**Storage Errors:**
- If local storage is unavailable (privacy mode, quota exceeded):
  - Fall back to session-only profile (not persisted)
  - Show warning message to user
  - Profile lost on page refresh

**Validation Errors:**
- Display inline error messages below input field
- Prevent submission until valid
- Clear error on input change

**Profile Load Errors:**
- If stored profile is corrupted:
  - Clear corrupted data
  - Prompt user to create new profile
  - Log error for debugging

### Testing Considerations

**Unit Tests:**
- Display name validation (all edge cases)
- Profile creation and storage
- Profile retrieval
- Profile update
- Validation error messages

**Integration Tests:**
- First-time user flow
- Returning user flow
- Profile persistence across page reloads
- Display name shown in game UI
- Local storage fallback scenarios

## Future Extensibility

The architecture supports potential future enhancements:

- **Online Multiplayer**: Game state serialization enables network play
- **Additional Piece Types**: Piece logic abstraction allows new pieces
- **Replay System**: Move history supports full game replay
- **AI Improvements**: Evaluation function can be enhanced with machine learning
- **Custom Board Sizes**: Grid system can be parameterized
- **Tournament Mode**: Game controller can manage multiple games
- **Save/Load Games**: State serialization enables persistence
- **Multiple Profiles**: Support profile switching and management
- **Profile Statistics**: Track detailed game history and performance metrics
- **Profile Avatars**: Add visual customization options

