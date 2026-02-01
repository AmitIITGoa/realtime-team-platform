# Components Breakdown

## 🏗 Component Architecture Overview

The whiteboard app consists of three main UI components that work together:

```
┌─────────────────────────────────────────────┐
│                 Toolbar                     │ ← Tool selection
│  🖌️ 📏 ▭ ⭕ ➡️ 🧹 🔤 ↶ ↷ 💾              │
└─────────────────────────────────────────────┘
┌─────────────────┬───────────────────────────┐
│    Toolbox      │         Board             │
│  ┌─────────────┐│                           │ ← Main canvas
│  │Color Picker ││                           │
│  │ 🔴 🟢 🔵    ││                           │
│  │             ││                           │
│  │Size: ━━━━━━  ││                           │
│  └─────────────┘│                           │
└─────────────────┴───────────────────────────┘
```

## 🎯 Board Component (The Canvas)

**Location**: `src/components/Board/index.js`  
**Purpose**: Main drawing canvas that handles all user interactions

### Key Responsibilities

1. **Canvas Management**
   - Creates and manages HTML5 canvas element
   - Sets canvas size to window dimensions
   - Provides drawing context for rendering

2. **Mouse Event Handling**
   - Captures mouse down/move/up events
   - Converts mouse coordinates to canvas coordinates
   - Delegates actions to appropriate handlers

3. **Element Rendering**
   - Draws all elements using RoughJS and Canvas API
   - Handles different rendering for each tool type
   - Manages real-time drawing updates

4. **Text Input Overlay**
   - Shows textarea when TEXT tool is active
   - Positions textarea at click location
   - Handles text input and styling

5. **Keyboard Shortcuts**
   - Ctrl+Z for undo
   - Ctrl+Y for redo

### Code Structure

```javascript
function Board() {
  const canvasRef = useRef();           // Canvas DOM reference
  const textAreaRef = useRef();         // Text input reference
  
  // Context data
  const {
    elements,                           // All drawn elements
    toolActionType,                     // Current action (drawing/erasing)
    boardMouseDownHandler,              // Start action
    boardMouseMoveHandler,              // Update action
    boardMouseUpHandler,                // End action
    textAreaBlurHandler,                // Save text
    undo, redo                          // History actions
  } = useContext(boardContext);
  
  const { toolboxState } = useContext(toolboxContext);
```

### Mouse Event Flow

```javascript
// Mouse Down - Start drawing
const handleMouseDown = (event) => {
  boardMouseDownHandler(event, toolboxState);
};

// Mouse Move - Update drawing
const handleMouseMove = (event) => {
  boardMouseMoveHandler(event);
};

// Mouse Up - Finish drawing
const handleMouseUp = () => {
  boardMouseUpHandler();
};
```

### Canvas Rendering Logic

```javascript
useLayoutEffect(() => {
  const canvas = canvasRef.current;
  const context = canvas.getContext("2d");
  const roughCanvas = rough.canvas(canvas);
  
  elements.forEach((element) => {
    switch (element.type) {
      case TOOL_ITEMS.LINE:
      case TOOL_ITEMS.RECTANGLE:
      case TOOL_ITEMS.CIRCLE:
      case TOOL_ITEMS.ARROW:
        roughCanvas.draw(element.roughEle); // RoughJS rendering
        break;
        
      case TOOL_ITEMS.BRUSH:
        context.fillStyle = element.stroke;
        context.fill(element.path);        // Canvas path rendering
        break;
        
      case TOOL_ITEMS.TEXT:
        context.font = `${element.size}px Caveat`;
        context.fillStyle = element.stroke;
        context.fillText(element.text, element.x1, element.y1);
        break;
    }
  });
}, [elements]);
```

## 🛠 Toolbar Component (Tool Selection)

**Location**: `src/components/Toolbar/index.js`  
**Purpose**: Top horizontal bar for selecting drawing tools and actions

### Tool Icons and Functions

```javascript
const Toolbar = () => {
  const { activeToolItem, changeToolHandler, undo, redo } = useContext(boardContext);
  
  return (
    <div className={classes.container}>
      {/* Drawing Tools */}
      <ToolButton icon={<FaPaintBrush />} tool={TOOL_ITEMS.BRUSH} />
      <ToolButton icon={<FaSlash />} tool={TOOL_ITEMS.LINE} />
      <ToolButton icon={<LuRectangleHorizontal />} tool={TOOL_ITEMS.RECTANGLE} />
      <ToolButton icon={<FaRegCircle />} tool={TOOL_ITEMS.CIRCLE} />
      <ToolButton icon={<FaArrowRight />} tool={TOOL_ITEMS.ARROW} />
      <ToolButton icon={<FaEraser />} tool={TOOL_ITEMS.ERASER} />
      <ToolButton icon={<FaFont />} tool={TOOL_ITEMS.TEXT} />
      
      {/* Action Buttons */}
      <ActionButton icon={<FaUndoAlt />} onClick={undo} />
      <ActionButton icon={<FaRedoAlt />} onClick={redo} />
      <ActionButton icon={<FaDownload />} onClick={handleDownloadClick} />
    </div>
  );
};
```

### Active Tool Styling

```javascript
<div
  className={cx(classes.toolItem, {
    [classes.active]: activeToolItem === TOOL_ITEMS.BRUSH,
  })}
  onClick={() => changeToolHandler(TOOL_ITEMS.BRUSH)}
>
  <FaPaintBrush />
</div>
```

**Visual Feedback**: Active tool gets different background color/styling.

### Download Functionality

```javascript
const handleDownloadClick = () => {
  const canvas = document.getElementById("canvas");
  const data = canvas.toDataURL("image/png");    // Convert canvas to image
  const anchor = document.createElement("a");
  anchor.href = data;
  anchor.download = "board.png";                 // Set filename
  anchor.click();                                // Trigger download
};
```

## 🎨 Toolbox Component (Tool Customization)

**Location**: `src/components/Toolbox/index.js`  
**Purpose**: Side panel for customizing tool properties (colors, sizes)

### Dynamic UI Based on Selected Tool

```javascript
const Toolbox = () => {
  const { activeToolItem } = useContext(boardContext);
  const { toolboxState, changeStroke, changeFill, changeSize } = useContext(toolboxContext);
  
  const strokeColor = toolboxState[activeToolItem]?.stroke;
  const fillColor = toolboxState[activeToolItem]?.fill;
  const size = toolboxState[activeToolItem]?.size;
```

### Stroke Color Section

```javascript
{STROKE_TOOL_TYPES.includes(activeToolItem) && (
  <div className={classes.selectOptionContainer}>
    <div className={classes.toolBoxLabel}>Stroke Color</div>
    <div className={classes.colorsContainer}>
      {/* Custom Color Picker */}
      <input
        className={classes.colorPicker}
        type="color"
        value={strokeColor}
        onChange={(e) => changeStroke(activeToolItem, e.target.value)}
      />
      
      {/* Predefined Colors */}
      {Object.keys(COLORS).map((colorKey) => (
        <div
          key={colorKey}
          className={cx(classes.colorBox, {
            [classes.activeColorBox]: strokeColor === COLORS[colorKey],
          })}
          style={{ backgroundColor: COLORS[colorKey] }}
          onClick={() => changeStroke(activeToolItem, COLORS[colorKey])}
        />
      ))}
    </div>
  </div>
)}
```

### Fill Color Section (Shapes Only)

```javascript
{FILL_TOOL_TYPES.includes(activeToolItem) && (
  <div className={classes.selectOptionContainer}>
    <div className={classes.toolBoxLabel}>Fill Color</div>
    <div className={classes.colorsContainer}>
      {/* No Fill Option */}
      <div
        className={cx(classes.colorBox, classes.noFillColorBox, {
          [classes.activeColorBox]: fillColor === null,
        })}
        onClick={() => changeFill(activeToolItem, null)}
      />
      
      {/* Color Options */}
      {Object.keys(COLORS).map((colorKey) => (
        <ColorOption key={colorKey} color={COLORS[colorKey]} />
      ))}
    </div>
  </div>
)}
```

### Size Control Section

```javascript
{SIZE_TOOL_TYPES.includes(activeToolItem) && (
  <div className={classes.selectOptionContainer}>
    <div className={classes.toolBoxLabel}>
      {activeToolItem === TOOL_ITEMS.TEXT ? "Font Size" : "Brush Size"}
    </div>
    <input
      type="range"
      min={activeToolItem === TOOL_ITEMS.TEXT ? 12 : 1}    // Different ranges
      max={activeToolItem === TOOL_ITEMS.TEXT ? 64 : 10}   // for different tools
      value={size}
      onChange={(event) => changeSize(activeToolItem, event.target.value)}
    />
  </div>
)}
```

## 🎯 Component Communication Patterns

### 1. Context-Based Communication

```
User clicks tool in Toolbar
    ↓
Toolbar calls changeToolHandler
    ↓
BoardProvider updates activeToolItem
    ↓
Board and Toolbox components re-render
    ↓
Toolbox shows options for new tool
```

### 2. Event Bubbling

```
User draws on canvas
    ↓
Board captures mouse events
    ↓
Board calls context handlers
    ↓
BoardProvider updates state
    ↓
Board re-renders with new elements
```

### 3. Prop-less Components

All components use context instead of props:
- **Advantage**: No prop drilling
- **Advantage**: Easy to add new features
- **Trade-off**: More context dependencies

## 📱 Responsive Design

### Toolbar
```css
.container {
  @apply absolute left-1/2 top-5 px-3 py-2 flex rounded border;
  transform: translateX(-50%);  /* Center horizontally */
  box-shadow: 1px 0 10px rgba(0, 0, 0, 0.2);
}
```

### Toolbox
```css
.container {
  @apply absolute top-1/2 left-5 text-sm border;
  transform: translateY(-50%);  /* Center vertically */
  box-shadow: 1px 0 10px rgba(0, 0, 0, 0.2);
}
```

### Board
```javascript
useEffect(() => {
  const canvas = canvasRef.current;
  canvas.width = window.innerWidth;   // Full width
  canvas.height = window.innerHeight; // Full height
}, []);
```

## 🎨 Styling Architecture

### 1. CSS Modules
- **Board**: `index.module.css` for text overlay styling
- **Toolbar**: `index.module.css` for tool button styling
- **Toolbox**: `index.module.css` for color picker styling

### 2. Tailwind CSS
- Utility classes for common styles
- Responsive design utilities
- Consistent spacing and colors

### 3. Classnames Library
```javascript
className={cx(classes.toolItem, {
  [classes.active]: activeToolItem === TOOL_ITEMS.BRUSH,
})}
```
Conditional class application for active states.

## 🔄 Component Lifecycle

### Board Component Lifecycle
1. **Mount**: Set canvas size, add keyboard listeners
2. **Update**: Re-draw canvas when elements change
3. **Unmount**: Remove keyboard listeners

### State Synchronization
1. User interacts with Toolbar/Toolbox
2. Context state updates
3. All subscribed components re-render
4. UI reflects new state immediately

This component architecture provides a clean separation of concerns while maintaining tight integration through the context system!
