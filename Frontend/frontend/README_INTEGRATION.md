# Chat, Poll & Whiteboard Application

## Overview
This application integrates a real-time Chat & Poll system with a fully functional Whiteboard module. It allows users to communicate via text and visualize ideas on a shared whiteboard within the same interface.

## Integration Strategy (Phase 1)
The Whiteboard application (originally a separate React project) has been integrated as a **native module** within the Chat application's frontend.

- **Module Location**: `src/whiteboard_module`
- **Entry Point**: `src/whiteboard_module/WhiteboardWrapper.jsx`
- **UI Integration**: The whiteboard is accessible via a toggle tab in the `RoomPage` header, allowing seamless switching between Chat and Whiteboard views without losing context.

## Module Structure
```
src/
  whiteboard_module/
    components/       # UI Components (Board, Toolbar, Toolbox)
    store/            # Context Providers (BoardProvider, ToolboxProvider)
    utils/            # Helper functions for drawing logic
    constants.js      # Configuration constants
    WhiteboardWrapper.jsx # Main wrapper component
```

## How It Works
1.  **Dependencies**: The whiteboard uses `perfect-freehand`, `roughjs`, and `react-icons` for drawing and UI.
2.  **State Management**: `BoardProvider` manages the drawing elements and history (undo/redo). `ToolboxProvider` manages tool selection (pen, eraser, color, size).
3.  **Rendering**: The `Board` component uses an HTML5 Canvas and `roughjs` to render sketch-like shapes.
4.  **Navigation**: The `RoomPage` manages the active view state (`activeTab`). Both Chat and Whiteboard remain mounted (using CSS visibility) to preserve their state when switching tabs.

## Running the Project
1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Start Development Server**:
    ```bash
    npm run dev
    ```
3.  **Build for Production**:
    ```bash
    npm run build
    ```

## Features Preserved
- **Drawing Tools**: Brush, Line, Rectangle, Circle, Arrow, Text.
- **Editing**: Eraser, Undo/Redo.
- **Customization**: Stroke color, fill style, brush size.
- **Shortcuts**: Ctrl+Z (Undo), Ctrl+Y (Redo).
