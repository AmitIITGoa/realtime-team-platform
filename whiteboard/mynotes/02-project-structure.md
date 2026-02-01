# Project Structure Explained

## 📁 Detailed File Organization

### Root Level Files

```
my_white_board/
├── package.json          # Project dependencies and scripts
├── README.md             # Basic project information
├── tailwind.config.js    # Tailwind CSS configuration
└── .gitignore           # Files to ignore in version control
```

### Public Directory
```
public/
├── index.html           # Main HTML template
├── favicon.ico          # Browser tab icon
├── logo192.png          # App logo (192x192)
├── logo512.png          # App logo (512x512)
├── manifest.json        # PWA manifest file
└── robots.txt           # Search engine instructions
```

**Purpose**: Contains static assets that don't need processing by webpack.

### Source Directory Structure
```
src/
├── index.js             # App entry point
├── App.js              # Root component
├── index.css           # Global styles with Tailwind
├── constants.js        # App-wide constants
├── components/         # Reusable UI components
├── store/             # State management files
└── utils/             # Helper functions
```

## 🔧 Components Directory

### Board Component
```
components/Board/
├── index.js            # Main canvas component logic
└── index.module.css    # Canvas-specific styles
```

**Responsibilities**:
- Renders the HTML5 canvas
- Handles mouse events (down, move, up)
- Draws elements using RoughJS and Canvas API
- Manages text input overlay
- Implements keyboard shortcuts

### Toolbar Component
```
components/Toolbar/
├── index.js            # Toolbar UI and tool selection
└── index.module.css    # Toolbar styling
```

**Responsibilities**:
- Displays drawing tools (brush, line, shapes, etc.)
- Shows active tool state
- Provides undo/redo buttons
- Handles canvas download functionality

### Toolbox Component
```
components/Toolbox/
├── index.js            # Tool customization panel
└── index.module.css    # Toolbox styling
```

**Responsibilities**:
- Color picker for stroke and fill
- Size/thickness controls
- Tool-specific options
- Dynamic UI based on selected tool

## 🏪 Store Directory (State Management)

### Context Files
```
store/
├── board-context.js      # Board context definition
├── toolbox-context.js    # Toolbox context definition
├── BoardProvider.js      # Board state management
└── ToolboxProvider.js    # Tool settings management
```

**State Architecture**:
- **board-context.js**: Defines the shape of board state
- **BoardProvider.js**: Implements board state logic with useReducer
- **toolbox-context.js**: Defines tool settings structure
- **ToolboxProvider.js**: Manages tool properties and changes

## 🛠 Utils Directory

### Helper Functions
```
utils/
├── element.js          # Element creation and detection
└── math.js            # Mathematical calculations
```

**element.js Functions**:
- `createElement()` - Creates drawing elements
- `isPointNearElement()` - Detects element for erasing
- `getSvgPathFromStroke()` - Converts brush strokes to SVG paths

**math.js Functions**:
- `isPointCloseToLine()` - Line proximity detection
- `isNearPoint()` - Point proximity detection
- `getArrowHeadsCoordinates()` - Arrow head calculations
- `midPointBtw()` - Midpoint calculations

## 📋 Key Files Explained

### 1. package.json
```json
{
  "dependencies": {
    "react": "^18.2.0",           // Core React library
    "roughjs": "^4.6.6",         // Hand-drawn style graphics
    "perfect-freehand": "^1.2.0", // Smooth brush strokes
    "classnames": "^2.3.2",      // Conditional CSS classes
    "react-icons": "^4.12.0",    // Icon library
    "tailwindcss": "^3.3.6"      // CSS framework
  }
}
```

### 2. constants.js
Central location for all app constants:
- Tool types (BRUSH, LINE, RECTANGLE, etc.)
- Action types (DRAWING, ERASING, WRITING)
- Colors (BLACK, RED, GREEN, etc.)
- Board actions (DRAW_DOWN, DRAW_MOVE, etc.)

### 3. index.css
Global styles:
- Tailwind CSS imports
- Google Fonts imports
- Base body styles

### 4. App.js
Root component structure:
```jsx
<BoardProvider>           // Drawing state
  <ToolboxProvider>       // Tool settings
    <Toolbar />           // Top tool selection
    <Board />             // Main canvas
    <Toolbox />           // Side customization panel
  </ToolboxProvider>
</BoardProvider>
```

## 🎯 Component Hierarchy

```
App
├── BoardProvider (Context)
│   └── ToolboxProvider (Context)
│       ├── Toolbar
│       │   ├── Tool Icons
│       │   ├── Undo/Redo buttons
│       │   └── Download button
│       ├── Board
│       │   ├── Canvas element
│       │   └── Text input overlay
│       └── Toolbox
│           ├── Color picker
│           ├── Predefined colors
│           └── Size slider
```

## 📊 Data Flow

### 1. Props Flow
```
App → Providers → Components
```
- No direct props passing
- All data flows through Context

### 2. State Updates
```
User Action → Component → Context → Reducer → State Update → Re-render
```

### 3. Event Handling
```
Mouse Event → Board Component → Board Context → State Update → Canvas Re-draw
```

## 🔄 File Dependencies

### Import Relationships
```
App.js
├── imports: Board, Toolbar, Toolbox, Providers
│
Board/index.js
├── imports: boardContext, toolboxContext, constants, rough
│
Toolbar/index.js
├── imports: boardContext, constants, react-icons
│
Toolbox/index.js
├── imports: boardContext, toolboxContext, constants
│
BoardProvider.js
├── imports: board-context, constants, utils/element
│
ToolboxProvider.js
├── imports: toolbox-context, constants
```

## 📁 Directory Best Practices

### Why This Structure Works

1. **Separation of Concerns**
   - Components handle UI
   - Store handles state
   - Utils handle logic

2. **Scalability**
   - Easy to add new tools
   - Clear where to put new features
   - Modular architecture

3. **Maintainability**
   - Related files grouped together
   - Clear naming conventions
   - Logical organization

4. **Development Experience**
   - Easy to find files
   - Predictable structure
   - Clear dependencies

### File Naming Conventions

- **Components**: PascalCase directories with index.js
- **Styles**: index.module.css for component styles
- **Utils**: camelCase.js for utility functions
- **Constants**: constants.js for app-wide values
- **Context**: kebab-case-context.js for context definitions

This structure makes the codebase easy to navigate and understand, following React community best practices.
