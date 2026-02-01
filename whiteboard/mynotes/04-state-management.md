# State Management Deep Dive

## 🏛 Architecture Overview

This whiteboard app uses **React Context API** with **useReducer** for state management. Think of it as a mini-Redux pattern but simpler and built into React.

```
┌─────────────────┐
│   App Component │
└─────────┬───────┘
          │
    ┌─────▼──────┐      Manages: Drawing elements, tools, undo/redo
    │BoardProvider│      
    └─────┬──────┘
          │
    ┌─────▼────────┐    Manages: Tool colors, sizes, properties
    │ToolboxProvider│    
    └─────┬────────┘
          │
    ┌─────▼─────┐
    │Components │
    └───────────┘
```

## 📋 Board State Management

### Board Context Definition (board-context.js)

```javascript
import { createContext } from "react";

const boardContext = createContext({
  // State values
  activeToolItem: "",          // Currently selected tool
  toolActionType: "",          // What user is doing (drawing/erasing)
  elements: [],                // All drawn elements
  history: [[]],              // Snapshots for undo/redo
  index: 0,                   // Current history position
  
  // Action handlers (functions)
  boardMouseDownHandler: () => {},   // Start drawing
  changeToolHandler: () => {},       // Switch tools
  boardMouseMoveHandler: () => {},   // Update drawing
  boardMouseUpHandler: () => {},     // Finish drawing
});
```

**Purpose**: Defines the "shape" of the board context - what data and functions will be available to components.

### Board Provider Implementation (BoardProvider.js)

#### Initial State
```javascript
const initialBoardState = {
  activeToolItem: TOOL_ITEMS.BRUSH,    // Start with brush tool
  toolActionType: TOOL_ACTION_TYPES.NONE, // No action initially
  elements: [],                        // Empty canvas
  history: [[]],                      // History starts with empty state
  index: 0,                           // Pointing to first history item
};
```

#### Reducer Pattern
```javascript
const boardReducer = (state, action) => {
  switch (action.type) {
    case BOARD_ACTIONS.CHANGE_TOOL:
      return { ...state, activeToolItem: action.payload.tool };
    
    case BOARD_ACTIONS.DRAW_DOWN:
      // Create new element and add to elements array
      
    case BOARD_ACTIONS.DRAW_MOVE:
      // Update the last element being drawn
      
    // ... more cases
  }
};
```

**Reducer Benefits**:
- **Predictable**: Same input always produces same output
- **Immutable**: Never modifies existing state
- **Centralized**: All state changes in one place
- **Debuggable**: Easy to trace what changed

## 🎨 Drawing State Flow

### Complete Drawing Cycle

```
1. User clicks mouse
   ↓
2. DRAW_DOWN action
   ↓ 
3. Create new element
   ↓
4. Add to elements array
   ↓
5. User drags mouse
   ↓
6. DRAW_MOVE action
   ↓
7. Update element coordinates
   ↓
8. User releases mouse
   ↓
9. DRAW_UP action
   ↓
10. Save to history for undo/redo
```

### DRAW_DOWN Action Explained
```javascript
case BOARD_ACTIONS.DRAW_DOWN: {
  const { clientX, clientY, stroke, fill, size } = action.payload;
  
  // Create new element at mouse position
  const newElement = createElement(
    state.elements.length,  // ID
    clientX, clientY,       // Start position
    clientX, clientY,       // End position (same as start initially)
    { type: state.activeToolItem, stroke, fill, size }
  );
  
  return {
    ...state,
    // Set action type based on tool
    toolActionType: state.activeToolItem === TOOL_ITEMS.TEXT 
      ? TOOL_ACTION_TYPES.WRITING 
      : TOOL_ACTION_TYPES.DRAWING,
    // Add new element to array
    elements: [...state.elements, newElement],
  };
}
```

**Key Points**:
- Creates element with same start/end coordinates
- Determines if we're drawing or writing text
- Adds element to the end of elements array
- Uses spread operator to avoid mutating state

### DRAW_MOVE Action Explained
```javascript
case BOARD_ACTIONS.DRAW_MOVE: {
  const { clientX, clientY } = action.payload;
  const newElements = [...state.elements];
  const index = state.elements.length - 1; // Last element
  const { type } = newElements[index];
  
  switch (type) {
    case TOOL_ITEMS.RECTANGLE:
      // Update width and height by changing x2, y2
      const { x1, y1, stroke, fill, size } = newElements[index];
      const newElement = createElement(
        index, x1, y1, clientX, clientY,
        { type, stroke, fill, size }
      );
      newElements[index] = newElement;
      break;
      
    case TOOL_ITEMS.BRUSH:
      // Add new point to points array
      newElements[index].points.push({ x: clientX, y: clientY });
      // Update the drawing path
      newElements[index].path = new Path2D(
        getSvgPathFromStroke(getStroke(newElements[index].points))
      );
      break;
  }
  
  return { ...state, elements: newElements };
}
```

**Different Tools, Different Updates**:
- **Shapes** (Rectangle, Circle): Update end coordinates
- **Brush**: Add new points to stroke path
- **Line/Arrow**: Update end coordinates

### DRAW_UP Action (Finalizing)
```javascript
case BOARD_ACTIONS.DRAW_UP: {
  const elementsCopy = [...state.elements];
  
  // Create new history entry
  const newHistory = state.history.slice(0, state.index + 1);
  newHistory.push(elementsCopy);
  
  return {
    ...state,
    history: newHistory,
    index: state.index + 1,
  };
}
```

**History Management**:
- Copies current elements
- Truncates future history (if user did undo then drew new element)
- Adds current state to history
- Moves index forward

## 🧰 Toolbox State Management

### Toolbox Context (toolbox-context.js)
```javascript
const toolboxContext = createContext({
  toolboxState: {},               // Tool properties for each tool
  changeStroke: () => {},         // Update stroke color
  changeFill: () => {},          // Update fill color
  changeSize: () => {},          // Update size/thickness
});
```

### Toolbox Provider (ToolboxProvider.js)

#### Initial Toolbox State
```javascript
const initialToolboxState = {
  [TOOL_ITEMS.BRUSH]: {
    stroke: COLORS.BLACK,         // Only stroke for brush
  },
  [TOOL_ITEMS.LINE]: {
    stroke: COLORS.BLACK,
    size: 1,                      // Line thickness
  },
  [TOOL_ITEMS.RECTANGLE]: {
    stroke: COLORS.BLACK,         // Border color
    fill: null,                   // No fill initially
    size: 1,                      // Border thickness
  },
  // ... similar for other tools
};
```

#### Toolbox Reducer
```javascript
function toolboxReducer(state, action) {
  switch (action.type) {
    case TOOLBOX_ACTIONS.CHANGE_STROKE: {
      const newState = { ...state };
      newState[action.payload.tool].stroke = action.payload.stroke;
      return newState;
    }
    // Similar for CHANGE_FILL and CHANGE_SIZE
  }
}
```

**Tool-Specific Updates**: Each tool maintains its own properties independently.

## 🔄 Undo/Redo System

### History Structure
```javascript
history: [
  [],                    // Initial empty state (index 0)
  [element1],           // After drawing first element (index 1)
  [element1, element2], // After drawing second element (index 2)
  // ... more states
]
index: 2  // Currently at the latest state
```

### Undo Implementation
```javascript
case BOARD_ACTIONS.UNDO: {
  if (state.index <= 0) return state; // Can't undo further
  
  return {
    ...state,
    elements: state.history[state.index - 1], // Go to previous state
    index: state.index - 1,                   // Move index back
  };
}
```

### Redo Implementation
```javascript
case BOARD_ACTIONS.REDO: {
  if (state.index >= state.history.length - 1) return state; // Can't redo further
  
  return {
    ...state,
    elements: state.history[state.index + 1], // Go to next state
    index: state.index + 1,                   // Move index forward
  };
}
```

## 🔄 Context Provider Pattern

### BoardProvider Setup
```javascript
const BoardProvider = ({ children }) => {
  const [boardState, dispatchBoardAction] = useReducer(
    boardReducer,
    initialBoardState
  );
  
  // Action creators (wrapper functions)
  const changeToolHandler = (tool) => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.CHANGE_TOOL,
      payload: { tool },
    });
  };
  
  // Create context value object
  const boardContextValue = {
    activeToolItem: boardState.activeToolItem,
    elements: boardState.elements,
    // ... other state
    changeToolHandler,
    // ... other handlers
  };
  
  return (
    <boardContext.Provider value={boardContextValue}>
      {children}
    </boardContext.Provider>
  );
};
```

## 📡 Component-Context Communication

### Using Context in Components
```javascript
// In any component
import { useContext } from 'react';
import boardContext from '../store/board-context';

const SomeComponent = () => {
  const { 
    activeToolItem,      // Read state
    elements,           // Read state
    changeToolHandler   // Call actions
  } = useContext(boardContext);
  
  return (
    <button onClick={() => changeToolHandler(TOOL_ITEMS.RECTANGLE)}>
      Rectangle
    </button>
  );
};
```

## 🎯 State Management Benefits

### 1. **Separation of Concerns**
- UI components focus on rendering
- State logic isolated in providers
- Business logic in reducers

### 2. **Predictability**
- All state changes through actions
- Pure functions (reducers)
- Immutable updates

### 3. **Debuggability**
- Clear action history
- State snapshots
- Time-travel debugging possible

### 4. **Testability**
- Reducers are pure functions
- Easy to test in isolation
- Predictable inputs/outputs

### 5. **Scalability**
- Easy to add new tools
- Clear patterns to follow
- Modular structure

This state management approach provides a solid foundation for a complex interactive application while keeping the code organized and maintainable!
