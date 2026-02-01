import { useContext, useEffect, useLayoutEffect, useRef } from "react";
import rough from "roughjs"; // For drawing rough shapes
import boardContext from "../../store/board-context"; // Context for board state and handlers
import { TOOL_ACTION_TYPES, TOOL_ITEMS } from "../../constants"; // Constants for tool types and actions
import toolboxContext from "../../store/toolbox-context"; // Context for toolbox state

import classes from "./index.module.css"; // CSS module for styling

function Board() {
  const canvasRef = useRef(); // Ref for the canvas element
  const textAreaRef = useRef(); // Ref for the textarea element
  const {
    elements, // List of drawn elements on the board
    toolActionType, // Current tool action type
    boardMouseDownHandler, // Handler for mouse down event
    boardMouseMoveHandler, // Handler for mouse move event
    boardMouseUpHandler, // Handler for mouse up event
    textAreaBlurHandler, // Handler for when textarea loses focus
    undo, // Undo function
    redo, // Redo function
  } = useContext(boardContext); // Accessing board context
  const { toolboxState } = useContext(toolboxContext); // Accessing toolbox context

  useEffect(() => {
    // Sets the canvas size to the parent container size on load and window resize
    const canvas = canvasRef.current;
    
    // Helper to resize canvas
    const resizeCanvas = () => {
        if (canvas && canvas.parentElement) {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;
            console.log("Resized Canvas to:", canvas.width, canvas.height);
        }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
        window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    // Adds keyboard shortcuts for undo (Ctrl+Z) and redo (Ctrl+Y)
    function handleKeyDown(event) {
      if (event.ctrlKey && event.key === "z") {
        undo();
      } else if (event.ctrlKey && event.key === "y") {
        redo();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      // Cleans up the event listener when the component unmounts
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [undo, redo]);

  useLayoutEffect(() => {
    console.log("Drawing elements:", elements);
    // Draws elements on the canvas whenever `elements` changes
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.save(); // Save the current canvas state

    const roughCanvas = rough.canvas(canvas); // Initialize rough.js canvas

    elements.forEach((element) => {
      // Loop through and render each element based on its type
      try {
        switch (element.type) {
          case TOOL_ITEMS.LINE: // For lines
          case TOOL_ITEMS.RECTANGLE: // For rectangles
          case TOOL_ITEMS.CIRCLE: // For circles
          case TOOL_ITEMS.ARROW: // For arrows
            if (element.roughEle) {
                roughCanvas.draw(element.roughEle); // Draw with rough.js
            }
            break;
          // ...existing code...
  
          case TOOL_ITEMS.BRUSH: // For freehand brush strokes
          // Set the fill color for the brush stroke to the stroke color of the element
          context.fillStyle = element.stroke;
  
          // Fill the path of the element with the current fill style
          if (element.path && element.path instanceof Path2D) {
              context.fill(element.path);
          } else {
             // Try to construct it on the fly if missing (backup safety)
             // This covers cases where hydration might have failed or race conditions
             /* 
                We can't easily reconstruct here without dependencies. 
                Just skip drawing to avoid crash. 
             */
          }
  
          // Restore the canvas state to what it was before the brush stroke was applied
          context.restore();
  
          // Exit the switch case
          break;
  
         
          case TOOL_ITEMS.TEXT: // For text elements
            context.textBaseline = "top";
            context.font = `${element.size}px Caveat`; // Set font and size
            context.fillStyle = element.stroke;
            if (element.text) {
                context.fillText(element.text, element.x1, element.y1); // Draw text
            }
            context.restore();
            break;
          default:
            // throw new Error("Type not recognized"); // Handle unsupported types
            console.warn("Unrecognized tool type:", element.type);
        }
      } catch (error) {
          console.error("Error drawing element:", element, error);
      }
    });

    return () => {
      // Clear the canvas when the effect is cleaned up
      context.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [elements]);

  useEffect(() => {
    // Focus on the textarea when in writing mode
    const textarea = textAreaRef.current;
    if (toolActionType === TOOL_ACTION_TYPES.WRITING) {
      setTimeout(() => {
        textarea.focus(); // Focus textarea after DOM updates
      }, 0);
    }
  }, [toolActionType]);

  // Helper to get relative coordinates
  const getRelativePos = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return { clientX: event.clientX, clientY: event.clientY };
    
    const rect = canvas.getBoundingClientRect();
    return {
      clientX: event.clientX - rect.left,
      clientY: event.clientY - rect.top,
    };
  };

  // Handle mouse down events
  const handleMouseDown = (event) => {
    const { clientX, clientY } = getRelativePos(event);
    console.log("Mouse Down:", clientX, clientY);
    // Create a synthetic event or just pass the corrected object that BoardProvider expects (it looks for clientX, clientY on the passed object)
    boardMouseDownHandler({ ...event, clientX, clientY }, toolboxState);
  };

  // Handle mouse move events
  const handleMouseMove = (event) => {
    const { clientX, clientY } = getRelativePos(event);
    boardMouseMoveHandler({ ...event, clientX, clientY });
  };

  // Handle mouse up events
  const handleMouseUp = () => {
    boardMouseUpHandler();
  };

  return (
    <>
      {/* Render a textarea for writing text elements */}
      {toolActionType === TOOL_ACTION_TYPES.WRITING && (
        <textarea
          type="text"
          ref={textAreaRef}
          className={classes.textElementBox}
          style={{
            top: elements[elements.length - 1].y1,
            left: elements[elements.length - 1].x1,
            fontSize: `${elements[elements.length - 1]?.size}px`,
            color: elements[elements.length - 1]?.stroke,
          }}
          onBlur={(event) => textAreaBlurHandler(event.target.value)} // Save text on blur
        />
      )}
      {/* Render the canvas */}
      <canvas
        ref={canvasRef}
        id="canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </>
  );
}

export default Board;
