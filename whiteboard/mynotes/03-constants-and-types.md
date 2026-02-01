# Constants and Data Types Explained

## 📝 Understanding constants.js

The `constants.js` file is the **central hub** for all fixed values used throughout the application. Think of it as a dictionary that defines all the "words" our app uses.

## 🛠 TOOL_ITEMS (Available Drawing Tools)

```javascript
export const TOOL_ITEMS = {
  BRUSH: "BRUSH",           // Freehand drawing
  LINE: "LINE",             // Straight lines
  RECTANGLE: "RECTANGLE",   // Rectangular shapes
  CIRCLE: "CIRCLE",         // Circular/oval shapes
  ARROW: "ARROW",           // Directional arrows
  ERASER: "ERASER",         // Remove elements
  TEXT: "TEXT",             // Add text labels
};
```

**Why strings?**: Each tool is represented as a string constant to avoid magic strings in code and provide type safety.

**Usage Example**:
```javascript
// Instead of writing "BRUSH" everywhere (error-prone)
if (currentTool === "BRUSH") // ❌ Typo-prone

// We use constants (safe)
if (currentTool === TOOL_ITEMS.BRUSH) // ✅ Safe
```

## 🎯 TOOL_ACTION_TYPES (What User is Currently Doing)

```javascript
export const TOOL_ACTION_TYPES = {
  NONE: "NONE",             // No action, just hovering
  DRAWING: "DRAWING",       // Actively drawing an element
  ERASING: "ERASING",       // Actively erasing elements
  WRITING: "WRITING",       // Typing text
};
```

**State Machine Logic**:
- **NONE**: Default state, ready for action
- **DRAWING**: Mouse pressed, creating/updating element
- **ERASING**: Mouse pressed with eraser tool
- **WRITING**: Text tool active, showing text input

## 🎬 BOARD_ACTIONS (State Change Commands)

```javascript
export const BOARD_ACTIONS = {
  CHANGE_TOOL: "CHANGE_TOOL",           // Switch active tool
  DRAW_DOWN: "DRAW_DOWN",               // Start drawing (mouse press)
  DRAW_MOVE: "DRAW_MOVE",               // Update drawing (mouse drag)
  DRAW_UP: "DRAW_UP",                   // Finish drawing (mouse release)
  ERASE: "ERASE",                       // Remove elements
  CHANGE_ACTION_TYPE: "CHANGE_ACTION_TYPE", // Change what user is doing
  CHANGE_TEXT: "CHANGE_TEXT",           // Update text content
  UNDO: "UNDO",                         // Undo last action
  REDO: "REDO",                         // Redo previously undone action
};
```

**Drawing Lifecycle**:
1. `DRAW_DOWN` - User presses mouse, create initial element
2. `DRAW_MOVE` - User drags mouse, update element size/shape
3. `DRAW_UP` - User releases mouse, finalize element

## 🎨 COLORS (Available Color Palette)

```javascript
export const COLORS = {
  BLACK: "#000000",
  RED: "#ff0000",
  GREEN: "#00ff00",
  BLUE: "#0000ff",
  ORANGE: "#ffa500",
  YELLOW: "#ffff00",
  WHITE: "#ffffff",
};
```

**Hex Color Format**: Each color uses hexadecimal format (#RRGGBB) for precise color control.

## ⚙️ TOOLBOX_ACTIONS (Tool Settings Changes)

```javascript
export const TOOLBOX_ACTIONS = {
  CHANGE_STROKE: "CHANGE_STROKE",   // Change outline color
  CHANGE_FILL: "CHANGE_FILL",       // Change interior color
  CHANGE_SIZE: "CHANGE_SIZE",       // Change thickness/size
};
```

**Tool Property Types**:
- **Stroke**: Outline/border color (applies to all tools)
- **Fill**: Interior color (only rectangles and circles)
- **Size**: Line thickness, brush size, or font size

## 🔍 Tool Type Categories

### Tools That Support Fill Color
```javascript
export const FILL_TOOL_TYPES = [
  TOOL_ITEMS.RECTANGLE, 
  TOOL_ITEMS.CIRCLE
];
```
Only shapes can have interior fill color.

### Tools That Support Stroke Color
```javascript
export const STROKE_TOOL_TYPES = [
  TOOL_ITEMS.BRUSH,
  TOOL_ITEMS.LINE,
  TOOL_ITEMS.ARROW,
  TOOL_ITEMS.RECTANGLE,
  TOOL_ITEMS.CIRCLE,
  TOOL_ITEMS.TEXT,
];
```
All tools except eraser have stroke/outline color.

### Tools That Support Size Control
```javascript
export const SIZE_TOOL_TYPES = [
  TOOL_ITEMS.LINE,        // Line thickness
  TOOL_ITEMS.ARROW,       // Arrow thickness
  TOOL_ITEMS.RECTANGLE,   // Border thickness
  TOOL_ITEMS.CIRCLE,      // Border thickness
  TOOL_ITEMS.TEXT,        // Font size
];
```
Note: Brush size is handled differently (not included here).

## 📏 Measurement Constants

```javascript
export const ARROW_LENGTH = 20;              // Arrow head size in pixels
export const ELEMENT_ERASE_THRESHOLD = 0.1;  // Eraser sensitivity
```

**ARROW_LENGTH**: Controls how big the arrow heads are when drawing arrows.

**ELEMENT_ERASE_THRESHOLD**: Determines how close the eraser needs to be to an element to delete it. Smaller values = more precise erasing.

## 🧩 Data Type Patterns

### Element Structure
Every drawing element follows this pattern:
```javascript
{
  id: number,           // Unique identifier
  x1: number,          // Start X coordinate
  y1: number,          // Start Y coordinate
  x2: number,          // End X coordinate
  y2: number,          // End Y coordinate
  type: TOOL_ITEMS,    // Tool type used
  stroke: string,      // Outline color (hex)
  fill: string|null,   // Interior color (hex or null)
  size: number,        // Thickness/size
  // Tool-specific properties:
  text?: string,       // For text elements
  points?: Array,      // For brush strokes
  path?: Path2D,       // For brush rendering
  roughEle?: object,   // For RoughJS elements
}
```

### State Structure Patterns

**Board State**:
```javascript
{
  activeToolItem: TOOL_ITEMS,        // Currently selected tool
  toolActionType: TOOL_ACTION_TYPES, // What user is doing
  elements: Array,                   // All drawn elements
  history: Array,                    // State snapshots for undo/redo
  index: number,                     // Current position in history
}
```

**Toolbox State**:
```javascript
{
  [TOOL_ITEMS.BRUSH]: {
    stroke: COLORS,     // Brush color
  },
  [TOOL_ITEMS.LINE]: {
    stroke: COLORS,     // Line color
    size: number,       // Line thickness
  },
  [TOOL_ITEMS.RECTANGLE]: {
    stroke: COLORS,     // Border color
    fill: COLORS|null,  // Interior color
    size: number,       // Border thickness
  },
  // ... similar for other tools
}
```

## 💡 Why Use Constants?

### 1. **Typo Prevention**
```javascript
// Error-prone
if (tool === "RECTANGEL") // Typo!

// Safe
if (tool === TOOL_ITEMS.RECTANGLE) // IDE will catch typos
```

### 2. **Easy Refactoring**
```javascript
// If you want to change "BRUSH" to "PENCIL"
// Just change it in constants.js
export const TOOL_ITEMS = {
  BRUSH: "PENCIL", // One change affects entire app
  // ...
}
```

### 3. **Auto-completion**
Your IDE can suggest available tools when you type `TOOL_ITEMS.`

### 4. **Documentation**
Constants serve as documentation - you can see all available options in one place.

### 5. **Consistency**
Everyone on the team uses the same values, preventing bugs from inconsistent naming.

## 🎯 Practical Usage Examples

### Tool Selection
```javascript
// In Toolbar component
onClick={() => changeToolHandler(TOOL_ITEMS.RECTANGLE)}
```

### State Updates
```javascript
// In BoardProvider
case BOARD_ACTIONS.CHANGE_TOOL: {
  return {
    ...state,
    activeToolItem: action.payload.tool
  };
}
```

### Conditional Rendering
```javascript
// In Toolbox component
{STROKE_TOOL_TYPES.includes(activeToolItem) && (
  <ColorPicker />
)}
```

### Color Application
```javascript
// Setting element color
stroke: COLORS.BLACK,
fill: COLORS.RED,
```

This constants system makes the code more maintainable, less error-prone, and easier to understand!
