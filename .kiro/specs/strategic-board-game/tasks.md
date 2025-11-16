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

- [x] 11. Implement player profile system
- [x] 11.1 Create PlayerProfile type definitions and interfaces
  - Define PlayerProfile interface with id, displayName, createdAt fields
  - Define ProfileValidationResult interface
  - Define IProfileManager interface with CRUD operations
  - Add playerNames field to BoardState interface
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 11.2 Implement ProfileManager component
  - Create ProfileManager class implementing IProfileManager
  - Implement createProfile() method with UUID generation
  - Implement getProfile() method to retrieve from local storage
  - Implement updateProfile() method to save to local storage
  - Implement updateDisplayName() method to edit display name
  - Implement hasProfile() method to check profile existence
  - Implement clearProfile() method for profile deletion
  - _Requirements: 13.1, 13.4, 13.6, 13.7, 13.8_

- [x] 11.3 Implement display name validation
  - Create validateDisplayName() function
  - Validate length between 1-20 characters
  - Validate alphanumeric characters and spaces only
  - Reject leading/trailing spaces
  - Reject consecutive spaces
  - Return descriptive error messages for each validation failure
  - _Requirements: 13.2, 13.3_

- [x] 11.4 Implement local storage integration
  - Save profile to local storage on creation
  - Load profile from local storage on app launch
  - Handle local storage unavailable scenarios (fallback to session-only)
  - Handle corrupted profile data (clear and prompt re-creation)
  - Use 'playerProfile' as storage key
  - _Requirements: 13.4_

- [x] 11.5 Create profile creation UI component
  - Create modal overlay for first-time users
  - Add input field for display name with validation
  - Show real-time validation feedback
  - Add character counter (X/20)
  - Disable submit button until valid name entered
  - Prevent modal dismissal without profile creation
  - _Requirements: 13.1, 13.2, 13.3_

- [x] 11.6 Integrate profiles with game system
  - Update GameController to use player display names
  - Load profile on game initialization
  - Show profile creation modal if no profile exists
  - Replace "Player 1" with user's display name throughout UI
  - In PvP mode, prompt for second player name (session-only)
  - In AI mode, show user's name vs "AI Opponent"
  - _Requirements: 13.5_

- [x] 11.7 Update UI to display player names
  - Show display names in current turn indicator
  - Show display names in move history ("John: Pawn E2→E4")
  - Show display names in win/draw announcements
  - Show display names in resource point display
  - Update all "Player 1" / "Player 2" references
  - _Requirements: 13.5_

- [x] 11.8 Create profile settings UI component
  - Add settings icon/button in game header
  - Create settings modal overlay
  - Display current display name
  - Add "Edit Display Name" button
  - Add "Clear Profile" button with confirmation dialog
  - Show optional statistics (games played, wins)
  - _Requirements: 13.6_

- [x] 11.9 Implement edit display name functionality
  - Create edit display name modal
  - Pre-fill input with current display name
  - Show real-time validation feedback
  - Add character counter (X/20)
  - Disable save button until valid and changed
  - Add cancel button to dismiss without changes
  - On save, call updateDisplayName() and update UI
  - Show success confirmation message
  - _Requirements: 13.6, 13.7, 13.8_

- [ ]* 11.10 Write unit tests for profile system
  - Test display name validation (all edge cases)
  - Test profile creation and storage
  - Test profile retrieval
  - Test profile update
  - Test display name editing
  - Test local storage fallback scenarios
  - Test validation error messages
  - _Requirements: 12.1, 12.2_

- [ ]* 11.11 Write integration tests for profile flow
  - Test first-time user profile creation flow
  - Test returning user profile load flow
  - Test profile persistence across page reloads
  - Test display names shown correctly in game UI
  - Test edit display name flow
  - Test PvP mode with two player names
  - _Requirements: 12.4_

- [x] 12. Implement cyberpunk theme foundation
- [x] 12.1 Create cyberpunk color palette and CSS variables
  - Define color palette CSS variables (bg-primary, bg-secondary, bg-tertiary)
  - Define neon color variables (cyan, magenta, purple, blue)
  - Define text color variables (primary, secondary, dim)
  - Define player color variables (player1-color, player2-color)
  - Define state color variables (success, warning, error)
  - Create cyberpunk-theme.css file with all color definitions
  - _Requirements: 14.1, 14.2_

- [x] 12.2 Implement neon glow effect utilities
  - Create CSS classes for cyan neon glow (.neon-glow-cyan)
  - Create CSS classes for magenta neon glow (.neon-glow-magenta)
  - Create CSS classes for purple neon glow (.neon-glow-purple)
  - Create hover state glow intensification (.neon-glow-hover)
  - Implement multi-layered box-shadow for authentic neon effect
  - Add inset shadows for dimensionality
  - _Requirements: 14.2, 14.5_

- [x] 12.3 Set up animation system with keyframes
  - Define CSS custom properties for timing functions (ease-smooth, ease-bounce, ease-snap)
  - Create animations.css file for all keyframe definitions
  - Set up animation utility classes
  - Configure animation performance optimizations (transform, opacity only)
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 12.4 Apply dark cyberpunk background to main layout
  - Update body and root element backgrounds to dark theme
  - Apply gradient backgrounds to main containers
  - Add subtle texture or noise overlay for depth
  - Ensure all text has sufficient contrast
  - _Requirements: 14.1_

- [x] 13. Implement board and piece cyberpunk styling
- [x] 13.1 Style board squares with cyberpunk aesthetic
  - Apply gradient backgrounds to board squares
  - Add neon border lines with low opacity
  - Implement grid line overlay with neon cyan
  - Add radial gradient hover effect
  - Style valid destination squares with neon highlights
  - Style selected square with intense neon glow
  - _Requirements: 14.3_

- [x] 13.2 Apply neon glow effects to pieces
  - Add drop-shadow filters to pieces with player colors
  - Apply cyan glow to Player 1 pieces
  - Apply magenta glow to Player 2 pieces
  - Implement hover state with intensified glow (50% increase)
  - Add scale transform on hover (1.05x)
  - Style active/dragging state with reduced scale (0.95x)
  - _Requirements: 14.4, 14.5_

- [x] 13.3 Implement piece movement animations
  - Create piece-move keyframe animation (300ms duration)
  - Implement smooth position transition with scale effect
  - Add mid-point scale increase (1.1x) for arc motion
  - Apply ease-smooth timing function
  - Use CSS custom properties for from/to positions
  - _Requirements: 15.1_

- [x] 13.4 Implement piece capture animations
  - Create piece-capture keyframe animation (400ms duration)
  - Animate opacity fade from 1 to 0
  - Add rotation effect (0 to 360 degrees)
  - Add scale transformation (1 to 0)
  - Add brightness filter increase for flash effect
  - _Requirements: 15.2_

- [x] 13.5 Implement pawn promotion animations
  - Create pawn-promotion keyframe animation (600ms duration)
  - Implement multi-stage scale animation (1 → 1.3 → 0.8 → 1.2 → 1)
  - Add brightness filter progression
  - Add drop-shadow glow that intensifies and fades
  - Apply neon color to glow effect
  - _Requirements: 15.3_

- [ ] 14. Implement particle system
- [x] 14.1 Create particle engine core
  - Define Particle interface (position, velocity, life, size, color, glow)
  - Define ParticleEmitter interface (position, count, config, pattern, duration)
  - Create ParticleSystem class with emit(), update(), render() methods
  - Implement particle lifecycle management
  - Set up canvas rendering context
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

- [x] 14.2 Implement particle physics and rendering
  - Implement particle position updates based on velocity
  - Implement particle life decay over time
  - Implement particle rendering with glow effects
  - Add opacity based on remaining life
  - Implement particle culling when life reaches zero
  - Optimize rendering for 60fps performance
  - _Requirements: 16.5_

- [x] 14.3 Create capture particle effect
  - Implement burst emission pattern from capture location
  - Configure 20-30 particles per capture
  - Set radial outward velocity (100-200px/s)
  - Use capturing player's color (cyan or magenta)
  - Set particle life to 500-800ms
  - Set particle size to 2-4px with glow
  - _Requirements: 16.1_

- [ ] 14.4 Create promotion particle effect
  - Implement burst + upward stream emission pattern
  - Configure 40-60 particles per promotion
  - Set upward-biased velocity (150-250px/s)
  - Use player color with white sparkle accents
  - Set particle life to 800-1200ms
  - Set particle size to 3-6px with intense glow
  - _Requirements: 16.2_

- [ ] 14.5 Create victory particle effect
  - Implement continuous emission across board
  - Configure 100+ particles over 3 seconds
  - Set varied velocities (rising and falling)
  - Use winner's color with rainbow accents
  - Set particle life to 1000-2000ms
  - Set particle size to 4-8px with glow
  - _Requirements: 16.3_

- [ ] 14.6 Create valid move indicator particles
  - Implement subtle pulse at valid destination squares
  - Configure 5-10 particles per destination
  - Set minimal velocity with slight float
  - Use dim cyan/magenta colors
  - Set continuous emission while piece selected
  - Set particle size to 1-2px
  - _Requirements: 16.4_

- [ ] 14.7 Integrate particle system with game events
  - Connect capture events to capture particle emission
  - Connect promotion events to promotion particle emission
  - Connect win events to victory particle emission
  - Connect piece selection to valid move particle emission
  - Clear particles on piece deselection
  - _Requirements: 16.1, 16.2, 16.3, 16.4_

- [ ] 15. Implement profile settings modal with cyberpunk styling
- [x] 15.1 Create profile settings icon
  - Position icon in top-right corner (fixed positioning)
  - Style with circular shape and gradient background
  - Apply neon cyan border with glow
  - Implement hover effect (scale 1.1x, rotate 90deg, intensified glow)
  - Add smooth transition (0.3s ease)
  - _Requirements: 17.1_

- [x] 15.2 Style profile settings modal
  - Create modal backdrop with blur effect (backdrop-filter: blur(10px))
  - Apply dark semi-transparent background (rgba(10, 14, 39, 0.9))
  - Style modal container with gradient background
  - Add neon cyan border (2px solid)
  - Apply multi-layered box-shadow for depth
  - Add border-radius for rounded corners
  - _Requirements: 17.3_

- [x] 15.3 Implement modal slide-in animation
  - Create modal-slide-in keyframe animation (250ms duration)
  - Animate from translateY(-100%) to translateY(0)
  - Animate opacity from 0 to 1
  - Apply animation on modal open
  - Create reverse animation for modal close
  - _Requirements: 15.5, 17.2, 17.4_

- [x] 15.4 Style modal content elements
  - Style modal header with neon cyan color and text-shadow
  - Style input fields with dark background and neon borders
  - Implement input focus state with glow effect
  - Style buttons with gradient backgrounds and neon borders
  - Add button hover effects (glow, transform translateY(-2px))
  - Style validation messages with appropriate colors
  - _Requirements: 17.3_

- [x] 15.5 Implement modal interaction behaviors
  - Open modal on profile icon click with slide-in animation
  - Close modal on backdrop click with slide-out animation
  - Close modal on escape key press
  - Preserve game state during modal interactions
  - Prevent body scroll when modal is open
  - _Requirements: 17.2, 17.4, 17.5_

- [x] 16. Style move history sidebar with cyberpunk theme
- [x] 16.1 Apply cyberpunk styling to sidebar container
  - Apply gradient background (top to bottom, dark blue to darker)
  - Add neon cyan border on right side (2px solid)
  - Style scrollbar with cyberpunk theme
  - Add padding and ensure proper overflow handling
  - _Requirements: 18.3_

- [x] 16.2 Style move history items
  - Apply semi-transparent background to items
  - Add color-coded left border (cyan for P1, magenta for P2)
  - Implement hover effect (background intensify, glow, translateX(4px))
  - Style active/selected item with highlighted background and glow
  - Add smooth transitions (0.2s ease)
  - _Requirements: 18.3_

- [x] 16.3 Implement mobile collapsible sidebar
  - Position sidebar at bottom on mobile (<768px)
  - Set initial collapsed state (translateY to show only 60px)
  - Add toggle handle with neon styling
  - Implement expand/collapse animation (0.3s ease)
  - Change border from right to top on mobile
  - _Requirements: 18.3_

- [ ] 17. Style game controls with cyberpunk theme
- [x] 17.1 Style control panel container
  - Apply gradient background (left to right, dark blue)
  - Add neon cyan border with border-radius
  - Implement flexbox layout with proper spacing
  - Add padding and ensure responsive behavior
  - _Requirements: 18.4_

- [x] 17.2 Style control buttons
  - Apply gradient background (cyan to purple)
  - Add neon cyan border
  - Implement ripple effect on click (radial gradient animation)
  - Add hover effect (glow, translateY(-2px))
  - Add active state (translateY(0))
  - Style button text with proper color and weight
  - _Requirements: 18.4_

- [x] 17.3 Style difficulty selector
  - Create segmented control with dark background
  - Style inactive options with muted text
  - Style active option with gradient background and glow
  - Implement smooth transition between states
  - Add hover effect for inactive options
  - _Requirements: 18.4_

- [x] 17.4 Style game mode toggle
  - Apply similar styling to difficulty selector
  - Use neon colors for active state
  - Add smooth transitions
  - Ensure clear visual distinction between modes
  - _Requirements: 18.4_

- [x] 18. Implement board flip animation
- [x] 18.1 Create board-flip keyframe animation
  - Define 3D perspective transformation (perspective(1000px))
  - Animate rotateX from 0deg to 180deg
  - Add mid-point at 50% with rotateX(90deg)
  - Set duration to 500ms
  - Apply ease-smooth timing function
  - _Requirements: 15.4_

- [x] 18.2 Integrate board flip with turn changes
  - Trigger animation when turn switches to Player 2 in PvP mode
  - Reverse animation when turn switches back to Player 1
  - Maintain Player 1 orientation in AI mode
  - Ensure pieces remain properly positioned after flip
  - _Requirements: 15.4, 18.2_

- [x] 19. Implement typography and global styling
- [x] 19.1 Set up cyberpunk font stack
  - Import Rajdhani and Orbitron fonts (or similar geometric sans-serif)
  - Import Share Tech Mono for monospace elements
  - Define CSS custom properties for font families
  - Apply primary font to body
  - Apply monospace font to move notation and technical elements
  - _Requirements: 14.1_

- [x] 19.2 Style headings with cyberpunk aesthetic
  - Apply uppercase text-transform to headings
  - Add letter-spacing (0.1em) for futuristic look
  - Apply neon text-shadow to headings
  - Set appropriate font weights (700 for headings)
  - _Requirements: 14.1_

- [x] 19.3 Ensure text contrast and readability
  - Verify all text meets WCAG AA contrast standards (4.5:1)
  - Use high-contrast text colors on dark backgrounds
  - Avoid using neon colors for body text
  - Test readability across different screen sizes
  - _Requirements: 14.1_

- [-] 20. Implement responsive and accessibility features
- [x] 20.1 Optimize animations for mobile devices
  - Reduce glow intensity by 50% on mobile
  - Simplify particle effects (fewer particles, shorter life)
  - Shorten animation durations on mobile
  - Ensure touch targets are minimum 44x44px
  - _Requirements: 18.5_

- [x] 20.2 Implement reduced motion support
  - Add prefers-reduced-motion media query
  - Disable animations when reduced motion is preferred
  - Hide particle system when reduced motion is preferred
  - Set animation durations to 0.01ms
  - _Requirements: 18.5_

- [-] 20.3 Ensure keyboard navigation support
  - Verify all interactive elements are focusable
  - Style focus indicators with neon glow
  - Implement keyboard shortcuts for common actions
  - Test tab order and navigation flow
  - _Requirements: 18.5_

- [ ] 20.4 Add ARIA labels and semantic HTML
  - Add ARIA labels to all interactive elements
  - Implement live regions for game state announcements
  - Use semantic HTML elements (button, nav, main, etc.)
  - Test with screen readers
  - _Requirements: 18.5_

- [ ] 21. Performance optimization and testing
- [ ] 21.1 Optimize animation performance
  - Ensure animations use only transform and opacity
  - Add will-change property to critical animated elements
  - Use translateZ(0) to force GPU acceleration
  - Profile animations to ensure 60fps
  - _Requirements: 18.5_

- [ ] 21.2 Optimize particle system performance
  - Implement particle object pooling to reduce garbage collection
  - Limit maximum active particles to 200
  - Cull particles outside viewport
  - Reduce particle count on mobile (50% reduction)
  - Profile particle rendering to ensure 60fps
  - _Requirements: 16.5_

- [ ] 21.3 Test responsive behavior across devices
  - Test on mobile devices (iOS and Android)
  - Test on tablets
  - Test on desktop browsers (Chrome, Firefox, Safari)
  - Verify touch interactions work correctly
  - Verify animations perform well on all devices
  - _Requirements: 18.5_

- [ ]* 21.4 Write tests for cyberpunk theme components
  - Test particle system emit, update, and render methods
  - Test animation triggers for moves, captures, promotions
  - Test modal open/close animations
  - Test board flip animation
  - Test responsive layout changes
  - _Requirements: 12.4_

- [ ] 22. Final integration and polish
- [ ] 22.1 Integrate all cyberpunk theme elements
  - Ensure all components use cyberpunk styling
  - Verify color palette consistency across all elements
  - Test all animations and particle effects together
  - Ensure smooth transitions between all states
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_

- [ ] 22.2 Verify all existing functionality works with new theme
  - Test board interactions (drag-and-drop, touch)
  - Test PvP and AI modes
  - Test move history and undo
  - Test profile settings
  - Test game controls (new game, restart, difficulty)
  - Test win/draw conditions
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_

- [ ] 22.3 Polish visual details
  - Fine-tune glow intensities
  - Adjust animation timings for best feel
  - Optimize particle effect parameters
  - Ensure consistent spacing and alignment
  - Add any missing hover states or transitions
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 22.4 Create production build with optimizations
  - Minify CSS and JavaScript
  - Optimize asset loading
  - Enable code splitting if applicable
  - Test production build performance
  - _Requirements: 18.5_
