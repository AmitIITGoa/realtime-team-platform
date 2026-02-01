# Drawing Logic Explained

## 🎨 How Drawing Actually Works

This document explains the **core drawing logic** - how mouse movements become visual elements on the canvas.

## 🖱 Mouse Event Lifecycle

### Complete Drawing Flow
```
User presses mouse (onMouseDown)
         ↓
    Create initial element
         ↓
User drags mouse (onMouseMove)
         ↓
    Update element dimensions
         ↓
User releases mouse (onMouseUp)
         ↓
    Finalize element & save to history
```

## 🏗 Element Creation Process

### 1. createElement Function (utils/element.js)

```javascript
export const createElement = (id, x1, y1, x2, y2, { type, stroke, fill, size }) => {
  const element = {
    id,           // Unique identifier
    x1, y1,      // Starting coordinates
    x2, y2,      // Ending coordinates
    type,        // Tool type (BRUSH, LINE, etc.)
    stroke,      // Outline color
    fill,        // Interior color (for shapes)
    size,        // Thickness/size
  };
  
  // Tool-specific processing
  switch (type) {
    case TOOL_ITEMS.RECTANGLE:
      // Creates RoughJS rectangle element
      element.roughEle = gen.rectangle(x1, y1, x2 - x1, y2 - y1, options);
      return element;
      
    case TOOL_ITEMS.BRUSH:
      // Creates smooth freehand path
      return {
        id,
        points: [{ x: x1, y: y1 }],  // Array of coordinates
        path: new Path2D(...),       // Canvas drawing path
        type,
        stroke,
      };
  }
};
```

**Key Concepts**:
- **x1, y1**: Where user first clicked (start point)
- **x2, y2**: Where mouse currently is (end point)
- **RoughJS**: Library that creates hand-drawn, sketchy graphics
- **Path2D**: Browser API for smooth path drawing

## 📐 Different Drawing Strategies

### Strategy 1: Two-Point Elements (Lines, Rectangles, Circles, Arrows)

```javascript
// Rectangle drawing logic
case TOOL_ITEMS.RECTANGLE:
  // Width = horizontal distance
  const width = x2 - x1;
  
  // Height = vertical distance  
  const height = y2 - y1;
  
  // Create rectangle from top-left corner
  element.roughEle = gen.rectangle(x1, y1, width, height, options);
  break;
```

**How it works**:
1. User clicks at (100, 50) → x1=100, y1=50
2. User drags to (200, 150) → x2=200, y2=150
3. Rectangle: top-left=(100,50), width=100, height=100

### Strategy 2: Multi-Point Elements (Brush Strokes)

```javascript
case TOOL_ITEMS.BRUSH: {
  // Add current mouse position to points array
  newElements[index].points = [
    ...newElements[index].points,
    { x: clientX, y: clientY }
  ];
  
  // Convert points to smooth path using perfect-freehand
  const stroke = getStroke(newElements[index].points);
  const svgPath = getSvgPathFromStroke(stroke);
  newElements[index].path = new Path2D(svgPath);
  
  break;
}
```

**How it works**:
1. User clicks → First point added to array
2. User drags → More points added continuously
3. Points converted to smooth curved path
4. Path rendered on canvas

## 🎯 Tool-Specific Drawing Logic

### Line Drawing
```javascript
case TOOL_ITEMS.LINE:
  // Simple straight line from start to end
  element.roughEle = gen.line(x1, y1, x2, y2, options);
  return element;
```

### Circle Drawing
```javascript
case TOOL_ITEMS.CIRCLE:
  // Calculate center point
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  
  // Calculate dimensions
  const width = x2 - x1;
  const height = y2 - y1;
  
  // Create ellipse (can be circular or oval)
  element.roughEle = gen.ellipse(cx, cy, width, height, options);
  return element;
```

### Arrow Drawing
```javascript
case TOOL_ITEMS.ARROW:
  // Calculate arrow head coordinates
  const { x3, y3, x4, y4 } = getArrowHeadsCoordinates(x1, y1, x2, y2, ARROW_LENGTH);
  
  // Create path: line + two arrow head lines
  const points = [
    [x1, y1],  // Start of main line
    [x2, y2],  // End of main line
    [x3, y3],  // First arrow head line
    [x2, y2],  // Back to arrow tip
    [x4, y4],  // Second arrow head line
  ];
  
  element.roughEle = gen.linearPath(points, options);
  return element;
```

### Text Elements
```javascript
case TOOL_ITEMS.TEXT:
  element.text = "";  // Empty text initially
  return element;     // Text content added when user types
```

## 🎨 Canvas Rendering Process

### RoughJS Elements (Lines, Shapes, Arrows)
```javascript
case TOOL_ITEMS.LINE:
case TOOL_ITEMS.RECTANGLE:
case TOOL_ITEMS.CIRCLE:
case TOOL_ITEMS.ARROW:
  roughCanvas.draw(element.roughEle);  // RoughJS handles rendering
  break;
```

**RoughJS Benefits**:
- Hand-drawn, sketchy appearance
- Consistent styling
- Built-in shape primitives

### Canvas Path Elements (Brush Strokes)
```javascript
case TOOL_ITEMS.BRUSH:
  context.fillStyle = element.stroke;  // Set color
  context.fill(element.path);          // Fill the path
  context.restore();                   // Reset canvas state
  break;
```

**Canvas API Benefits**:
- Smooth, anti-aliased rendering
- Performance optimized
- Fine-grained control

### Text Rendering
```javascript
case TOOL_ITEMS.TEXT:
  context.textBaseline = "top";                    // Align text to top
  context.font = `${element.size}px Caveat`;       // Set font and size
  context.fillStyle = element.stroke;              // Set text color
  context.fillText(element.text, element.x1, element.y1);  // Draw text
  context.restore();
  break;
```

## 🧮 Mathematical Calculations

### Arrow Head Geometry (utils/math.js)
```javascript
export const getArrowHeadsCoordinates = (x1, y1, x2, y2, arrowLength) => {
  // Calculate angle of main line
  const angle = Math.atan2(y2 - y1, x2 - x1);
  
  // Calculate first arrow head line (30° offset)
  const x3 = x2 - arrowLength * Math.cos(angle - Math.PI / 6);
  const y3 = y2 - arrowLength * Math.sin(angle - Math.PI / 6);
  
  // Calculate second arrow head line (-30° offset)
  const x4 = x2 - arrowLength * Math.cos(angle + Math.PI / 6);
  const y4 = y2 - arrowLength * Math.sin(angle + Math.PI / 6);
  
  return { x3, y3, x4, y4 };
};
```

**Trigonometry Explanation**:
- `atan2()` calculates angle between two points
- `cos()` and `sin()` project arrow length at specific angles
- `PI/6` = 30 degrees in radians

### Distance Calculations
```javascript
const distanceBetweenPoints = (x1, y1, x2, y2) => {
  const dx = x2 - x1;  // Horizontal distance
  const dy = y2 - y1;  // Vertical distance
  return Math.sqrt(dx * dx + dy * dy);  // Pythagorean theorem
};
```

## 🎪 Perfect Freehand Integration

### Smooth Brush Strokes
```javascript
import getStroke from "perfect-freehand";

// Convert points array to smooth stroke
const stroke = getStroke(points, {
  size: 16,           // Brush size
  thinning: 0.5,      // How much to thin at speed
  smoothing: 0.5,     // How much to smooth
  streamline: 0.5,    // How much to streamline
});

// Convert stroke to SVG path
const svgPath = getSvgPathFromStroke(stroke);

// Create Canvas path for rendering
const path = new Path2D(svgPath);
```

**Perfect Freehand Features**:
- **Pressure sensitivity** (simulated)
- **Speed-based thinning**
- **Smooth interpolation**
- **Natural brush feel**

## 🎯 Real-Time Drawing Updates

### Immediate Visual Feedback
```javascript
// In BoardProvider - DRAW_MOVE case
const newElements = [...state.elements];
const index = state.elements.length - 1;  // Current element being drawn

// Update the element in place
newElements[index] = updatedElement;

return {
  ...state,
  elements: newElements,  // Triggers immediate re-render
};
```

### Canvas Re-rendering
```javascript
// In Board component
useLayoutEffect(() => {
  // Clear previous drawing
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  // Redraw all elements
  elements.forEach((element) => {
    // Render each element based on its type
  });
}, [elements]);  // Runs whenever elements array changes
```

**Performance Note**: `useLayoutEffect` ensures drawing happens before browser paint, preventing flicker.

## 🧹 Eraser Logic

### Element Detection
```javascript
export const isPointNearElement = (element, pointX, pointY) => {
  const { x1, y1, x2, y2, type } = element;
  
  switch (type) {
    case TOOL_ITEMS.LINE:
      return isPointCloseToLine(x1, y1, x2, y2, pointX, pointY);
      
    case TOOL_ITEMS.RECTANGLE:
      // Check all four sides of rectangle
      return (
        isPointCloseToLine(x1, y1, x2, y1, pointX, pointY) ||  // Top
        isPointCloseToLine(x2, y1, x2, y2, pointX, pointY) ||  // Right
        isPointCloseToLine(x2, y2, x1, y2, pointX, pointY) ||  // Bottom
        isPointCloseToLine(x1, y2, x1, y1, pointX, pointY)     // Left
      );
      
    case TOOL_ITEMS.BRUSH:
      // Use Canvas API to check if point is inside path
      return context.isPointInPath(element.path, pointX, pointY);
  }
};
```

### Erasing Process
```javascript
// In BoardProvider - ERASE action
case BOARD_ACTIONS.ERASE: {
  const { clientX, clientY } = action.payload;
  
  // Filter out elements near eraser position
  const newElements = state.elements.filter((element) => {
    return !isPointNearElement(element, clientX, clientY);
  });
  
  // Save to history
  const newHistory = state.history.slice(0, state.index + 1);
  newHistory.push(newElements);
  
  return {
    ...state,
    elements: newElements,
    history: newHistory,
    index: state.index + 1,
  };
}
```

This drawing system provides smooth, responsive drawing with proper mathematical foundations and performance optimizations!
