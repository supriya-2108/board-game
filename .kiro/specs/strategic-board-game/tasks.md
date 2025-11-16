# Implementation Plan

- [x] 1. Set up project structure and core type definitions
  - Create project directory structure (src/types, src/logic, src/ai, src/ui, src/utils)
  - Initialize package.json with TypeScript, React, and testing dependencies
  - Configure TypeScript (tsconfig.json) with strict mode
  - Define core type definitions (PieceType, Player, Position, Piece, BoardState, Move, MoveResult, GameConfig, GameStatus)
  - Create enums for piece types, players, and game status
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Implement piece movement logic
- [ ] 2.1 Create Pawn movement rules
  - Implement forward movement (1-2 squares on first move, 1 square thereafter)
  - Add hasMoved tracking for Pawns
  - Implement auto-promotion to Queen when reaching row 8
  - Validate that Pawns cannot move to occupied squares
  - Restrict movement to forward direction only
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2.2 Create Knight movement rules
  - Implement L-shape pattern calculation (2 squares + 1 perpendicular)
  - Enable jumping over pieces
  - Implement capture logic for opponent pieces
  - Validate destination is within board boundaries
  - Reject moves to friendly piece positions
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 2.3 Create Bishop movement rules
  - Implement diagonal movement calculation
  - Add path obstruction checking
  - Implement capture logic with movement stop
  - Validate destination is within board boundaries
  - Reject moves to friendly piece positions
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 2.4 Create Queen movement rules
  - Implement combined diagonal and forward movement
  - Add path obstruction checking for both directions
  - Implement capture logic
  - Validate destination is within board boundaries
  - _Requirements: 2.3, 5.2_

- [ ] 2.5 Write unit tests for piece movement
  - Test Pawn movement rules and promotion
  - Test Knight L-shape movement and jumping
  - Test Bishop diagonal movement and obstructions
  - Test Queen combined movement patterns
  - _Requirements: 12.1_

- [ ] 3. Implement game state management
- [ ] 3.1 Create BoardState initialization
  - Initialize 8x8 grid structure
  - Place 12 pieces per player (4 Pawns, 4 Knights, 4 Bishops)
  - Position Player 1 pieces on rows 1-2
  - Position Player 2 pieces on rows 7-8
  - Set Player 1 as active player
  - Initialize resource points to zero for both players
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 3.2 Implement state transition logic
  - Create immutable state update functions
  - Implement turn switching between players
  - Track move count and captures
  - Update resource points on captures
  - Maintain piece positions and states
  - _Requirements: 5.1, 6.5, 7.1_

- [ ] 3.3 Implement move history tracking
  - Record each move with timestamp
  - Store captured pieces in move records
  - Track upgrade actions in history
  - Maintain chronological order
  - _Requirements: 7.1, 7.5_

- [ ] 3.4 Implement undo functionality
  - Revert last move and restore board state
  - Support reverting up to 3 moves
  - Handle cases with fewer than requested undo count
  - Update move history after undo
  - _Requirements: 7.2, 7.3, 7.4_

- [-] 3.5 Write unit tests for game state
  - Test board initialization
  - Test state transitions
  - Test move history recording
  - Test undo functionality
  - _Requirements: 12.2_

- [x] 4. Implement move validation system
- [x] 4.1 Create MoveValidator component
  - Validate moves against piece-specific rules
  - Check path obstructions for Bishops and Queens
  - Verify destination square validity
  - Check for friendly piece blocking
  - Return validation results with error messages
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 4.2 Implement path obstruction checking
  - Check diagonal paths for Bishops and Queens
  - Check forward paths for Pawns and Queens
  - Handle Knight jump logic (no obstruction check)
  - _Requirements: 4.2, 6.2_

- [ ] 4.3 Implement capture validation
  - Validate opponent piece capture for Knights, Bishops, Queens
  - Prevent Pawn captures (simplified rules)
  - Award resource points on successful capture
  - _Requirements: 3.3, 4.3, 5.1_

- [ ] 4.4 Write unit tests for move validation
  - Test validation for all piece types
  - Test path obstruction detection
  - Test capture validation
  - Test error message generation
  - _Requirements: 12.2_

- [ ] 5. Implement resource management system
- [ ] 5.1 Create resource point tracking
  - Award 1 resource point per capture
  - Display current resource points for both players
  - Track resource points in game state
  - _Requirements: 5.1, 5.5_

- [ ] 5.2 Implement Pawn upgrade functionality
  - Check for minimum 2 resource points
  - Validate Pawn is not on row 1 or row 8
  - Deduct 2 resource points on upgrade
  - Convert Pawn to Queen
  - Record upgrade in move history
  - _Requirements: 5.2, 5.3, 5.4_

- [x] 5.3 Write unit tests for resource management
  - Test resource point awarding
  - Test upgrade validation
  - Test resource point deduction
  - _Requirements: 12.2_

- [-] 6. Implement win and draw condition detection
- [ ] 6.1 Create win condition checks
  - Detect when player has fewer than 3 pieces
  - Detect when player has no valid moves
  - Declare opponent as winner
  - Prevent further moves after win
  - _Requirements: 8.1, 8.2, 8.4_

- [ ] 6.2 Create draw condition check
  - Track consecutive moves without captures
  - Declare draw after 50 moves without capture
  - Prevent further moves after draw
  - _Requirements: 8.3, 8.4_

- [ ] 6.3 Implement game outcome display
  - Display win/draw message to players
  - Show final game state
  - Provide new game option
  - _Requirements: 8.5_

- [ ] 6.4 Write unit tests for win/draw conditions
  - Test piece count win condition
  - Test no valid moves win condition
  - Test 50-move draw condition
  - _Requirements: 12.2_

- [-] 7. Implement AI engine with minimax algorithm
- [ ] 7.1 Create minimax algorithm core
  - Implement recursive minimax function
  - Add alpha-beta pruning optimization
  - Support configurable search depth
  - Generate all possible moves for evaluation
  - _Requirements: 9.2, 9.3_

- [x] 7.2 Implement position evaluation heuristic
  - Calculate material value (Pawn: 10, Knight: 30, Bishop: 30, Queen: 50)
  - Weight resource points (×10 multiplier)
  - Add positional bonuses for board control
  - Calculate mobility score (valid moves × 2)
  - _Requirements: 9.4_

- [x] 7.3 Implement move ordering optimization
  - Order captures first (highest value targets)
  - Order upgrades second
  - Order forward advancement third
  - Order other moves last
  - _Requirements: 9.4_

- [x] 7.4 Add difficulty level configuration
  - Set depth 4 for Easy difficulty
  - Set depth 6 for Hard difficulty
  - Ensure moves complete within 5 seconds
  - Return best move found if time limit exceeded
  - _Requirements: 9.2, 9.3, 9.5_

- [x] 7.5 Write unit tests for AI engine
  - Test minimax algorithm correctness
  - Test alpha-beta pruning
  - Test position evaluation at both difficulty levels
  - Test move ordering
  - Test time constraint compliance
  - _Requirements: 12.3_

- [x] 8. Implement game controller
- [x] 8.1 Create GameController component
  - Orchestrate game flow and turn management
  - Process player move requests through MoveValidator
  - Trigger AI moves when appropriate
  - Handle game mode switching (PvP vs AI)
  - Manage undo requests
  - Detect and handle win/draw conditions
  - _Requirements: 6.5, 7.2, 9.1, 11.2, 11.3_

- [x] 8.2 Implement game initialization
  - Support local PvP mode selection
  - Support AI opponent mode selection
  - Configure AI difficulty (Easy/Hard)
  - Initialize board state
  - _Requirements: 9.1, 11.1, 11.2, 11.3_

- [x] 8.3 Implement game mode switching
  - Reset board to initial state on mode change
  - Update AI activation based on mode
  - Display current game mode
  - _Requirements: 11.4, 11.5_

- [x] 8.4 Implement new game and restart
  - Provide new game functionality
  - Provide restart current game functionality
  - Reset all game state appropriately
  - _Requirements: 10.5_

- [x] 8.5 Write integration tests for game controller
  - Test complete game flow from start to win/draw
  - Test mode switching
  - Test new game and restart
  - _Requirements: 12.4_

- [x] 9. Implement UI layer with React
- [x] 9.1 Create responsive board component
  - Render 8x8 grid with square components
  - Display pieces at current positions
  - Adapt layout to screen size (mobile-first)
  - Implement desktop layout (≥768px) with sidebar
  - Implement mobile layout (<768px) with collapsible history
  - _Requirements: 10.1, 10.3_

- [x] 9.2 Implement drag-and-drop interaction
  - Support mouse drag-and-drop for pieces
  - Support touch gestures for mobile
  - Show visual feedback during drag
  - Highlight valid destination squares
  - Return piece to origin on invalid drop
  - _Requirements: 10.2_

- [x] 9.3 Implement board orientation flip
  - Keep Player 1 view (row 1 at bottom)
  - Flip board 180° for Player 2 turn in PvP mode
  - Maintain Player 1 orientation in AI mode
  - _Requirements: 10.3_

- [x] 9.4 Create game controls UI
  - Add game mode selector (PvP/AI)
  - Add difficulty selector (Easy/Hard)
  - Add new game button
  - Add restart game button
  - Display current player indicator
  - Display resource points for both players
  - _Requirements: 10.5, 5.5, 11.1_

- [x] 9.5 Implement move history sidebar
  - Display chronological list of moves
  - Format moves (e.g., "P1: Pawn E2→E4")
  - Show capture indicators
  - Add undo button (1-3 moves)
  - Enable replay by clicking historical moves
  - Make collapsible on mobile
  - _Requirements: 7.5, 10.4_

- [x] 9.6 Implement error feedback system
  - Display tooltip messages for invalid moves
  - Show "Invalid: obstructed" for blocked paths
  - Show "Invalid: blocked" for occupied destinations
  - Show appropriate error for each validation failure
  - Auto-hide tooltips after 2 seconds
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 9.7 Add visual feedback and animations
  - Highlight selected piece
  - Show valid move indicators
  - Animate captures
  - Animate promotions
  - Show current player indicator
  - _Requirements: 10.2_

- [x] 9.8 Write integration tests for UI
  - Test drag-and-drop interactions
  - Test touch gesture handling
  - Test board orientation flip
  - Test move history replay
  - Test control button functionality
  - Test responsive layout adaptation
  - _Requirements: 12.4_

- [x] 10. Final integration and polish
- [x] 10.1 Wire all components together
  - Connect UI to GameController
  - Connect GameController to AI engine
  - Connect GameController to MoveValidator
  - Ensure proper data flow between all layers
  - _Requirements: All_

- [x] 10.2 Implement end-to-end game flow
  - Test complete game from initialization to conclusion
  - Verify all win/draw conditions work correctly
  - Ensure AI moves trigger appropriately
  - Validate undo works in all scenarios
  - _Requirements: All_

- [ ] 10.3 Create end-to-end tests
  - Test complete PvP game flow
  - Test complete AI game flow at both difficulties
  - Test all win and draw scenarios
  - Test mode switching during gameplay
  - _Requirements: 12.4, 12.5_

- [x] 10.4 Add build configuration
  - Configure build scripts for production
  - Set up development server
  - Configure asset bundling
  - Optimize for performance
  - _Requirements: 10.1_

- [x] 10.5 Verify test coverage
  - Run all test suites
  - Generate coverage report
  - Ensure 100% coverage target is met
  - Fix any gaps in coverage
  - _Requirements: 12.5_
