import React, { useCallback, useReducer } from "react";

import boardContext from "./board-context";
import { BOARD_ACTIONS, TOOL_ACTION_TYPES, TOOL_ITEMS } from "../constants";
import {
  createElement,
  getSvgPathFromStroke,
  isPointNearElement,
} from "../utils/element";
import getStroke from "perfect-freehand";

// Reducer function to manage the state of the drawing board
const boardReducer = (state, action) => {
  switch (action.type) {
    case BOARD_ACTIONS.CHANGE_TOOL: {
      // Update the current active tool (e.g., brush, eraser, line, etc.)
      return {
        ...state,
        activeToolItem: action.payload.tool,
      };
    }
    case BOARD_ACTIONS.CHANGE_ACTION_TYPE: {
      // Update the current action type (e.g., drawing, erasing, writing, etc.)
      return {
        ...state,
        toolActionType: action.payload.actionType,
      };
    }
    case BOARD_ACTIONS.DRAW_DOWN: {
      // Handle mouse down event to start drawing

      //  when  mouses  press  then  save the point or  size  when it start  pressing the  point  
      const { clientX, clientY, stroke, fill, size } = action.payload;

      // Create a new element based on the current tool and starting position
      const newElement = createElement(
        state.elements.length,
        clientX,
        clientY,
        clientX,
        clientY,
        { type: state.activeToolItem, stroke, fill, size }
      );
      //  this mew  elemant is also  help  to  calculate  the  height and  the width  of the  reactangle  
      //  to  save the  new  starting elemant and then  go for  the next  moving elemant  

      // Add the new element to the list of elements
      return {
        ...state,
        toolActionType:
          state.activeToolItem === TOOL_ITEMS.TEXT
            ? TOOL_ACTION_TYPES.WRITING
            : TOOL_ACTION_TYPES.DRAWING,
        elements: [...state.elements, newElement], //  append the new  elemant of the pressed  mouse  state  in the  array  
      };
    }
    case BOARD_ACTIONS.DRAW_MOVE: {
      // Handle mouse move event to update the current drawing
      const { clientX, clientY } = action.payload;
      const newElements = [...state.elements];
      const index = state.elements.length - 1; // Index of the last element being drawn
      const { type } = newElements[index]; //  it is  talking about  the  tool  type  

      // Update the element based on the active tool type
      switch (type) {
        case TOOL_ITEMS.LINE:
        case TOOL_ITEMS.RECTANGLE:
        case TOOL_ITEMS.CIRCLE:
        case TOOL_ITEMS.ARROW: {
          const { x1, y1, stroke, fill, size } = newElements[index];
          const newElement = createElement(index, x1, y1, clientX, clientY, {
            type: state.activeToolItem,
            stroke,
            fill,
            size,
          });
          newElements[index] = newElement;
          return {
            ...state,
            elements: newElements,
          }; //  save  the  elemant  in the array  of the till know  state  getted  and one by  one and the our  tool  item is  drawing that  diagram  
        }
        case TOOL_ITEMS.BRUSH: {
          // For brush, update the points and path dynamically
          newElements[index].points = [
            ...newElements[index].points,
            { x: clientX, y: clientY },
          ];
          newElements[index].path = new Path2D(
            getSvgPathFromStroke(getStroke(newElements[index].points)) //   this is the method  to  get  the  closest  point  to  the  perticular  elemant  and when brush is  goes  their  is  start  erasing it  
          );
          return {
            ...state,
            elements: newElements,
          };
        }
        default:
          throw new Error("Type not recognized");
      }
    }
    case BOARD_ACTIONS.DRAW_UP: {
      // Finalize the current drawing when the mouse button is released
      const elementsCopy = [...state.elements];
      //  save   the current  state 
      const newHistory = state.history.slice(0, state.index + 1);
      //  save it  with  the history or elemant 

      // Add the current state to the history for undo/redo functionality
      newHistory.push(elementsCopy);
      //  add it  in our  history  array  where  save the all  the elemant  you  added  

      return {
        ...state,
        history: newHistory,
        index: state.index + 1,
      };
      //  and  at  the  end  we  save the  history  state our  new  hostory  
    }
    case BOARD_ACTIONS.ERASE: {
      // Handle eraser tool: remove elements near the eraser cursor
      const { clientX, clientY } = action.payload;
      let newElements = [...state.elements];

      // Remove elements close to the eraser position
      newElements = newElements.filter((element) => {
        return !isPointNearElement(element, clientX, clientY);
      });

      const newHistory = state.history.slice(0, state.index + 1);
      newHistory.push(newElements);

      return {
        ...state,
        elements: newElements,
        history: newHistory,
        index: state.index + 1,
      };
    }
    case BOARD_ACTIONS.CHANGE_TEXT: {
      // Update the text for the most recent text element
      const index = state.elements.length - 1;
      const newElements = [...state.elements];
      newElements[index].text = action.payload.text;

      // Add the updated state to the history
      const newHistory = state.history.slice(0, state.index + 1);
      newHistory.push(newElements);

      return {
        ...state,
        toolActionType: TOOL_ACTION_TYPES.NONE,
        elements: newElements,
        history: newHistory,
        index: state.index + 1,
      };
    }
    case BOARD_ACTIONS.UNDO: {
      // Handle undo: revert to the previous state
      if (state.index <= 0) return state;
      return {
        ...state,
        elements: state.history[state.index - 1],
        index: state.index - 1,
      };
    }
    case BOARD_ACTIONS.REDO: {
      // Handle redo: move to the next state
      if (state.index >= state.history.length - 1) return state;
      return {
        ...state,
        elements: state.history[state.index + 1],
        index: state.index + 1,
      };
    }
    default:
      return state; // Return the current state if no action matches
  }
};

// Initial state of the drawing board
const initialBoardState = {
  activeToolItem: TOOL_ITEMS.BRUSH, // Default tool is the brush
  toolActionType: TOOL_ACTION_TYPES.NONE, // No action by default
  elements: [], // List of elements on the canvas
  history: [[]], // History of states for undo/redo
  index: 0, // Current index in the history
};

const BoardProvider = ({ children }) => {
  // useReducer to manage the state and dispatch actions
  const [boardState, dispatchBoardAction] = useReducer(
    boardReducer,
    initialBoardState
  );

  // Change the current tool
  const changeToolHandler = (tool) => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.CHANGE_TOOL,
      payload: { tool },
    });
  };

  // Handle mouse down event to start drawing or erasing
  const boardMouseDownHandler = (event, toolboxState) => {
    if (boardState.toolActionType === TOOL_ACTION_TYPES.WRITING) return; // Ignore if writing

    const { clientX, clientY } = event;

    if (boardState.activeToolItem === TOOL_ITEMS.ERASER) {
      // Start erasing
      dispatchBoardAction({
        type: BOARD_ACTIONS.CHANGE_ACTION_TYPE,
        payload: { actionType: TOOL_ACTION_TYPES.ERASING },
      });
      return;
    }

    // Start drawing
    dispatchBoardAction({
      type: BOARD_ACTIONS.DRAW_DOWN,
      payload: {
        clientX,
        clientY,
        stroke: toolboxState[boardState.activeToolItem]?.stroke,
        fill: toolboxState[boardState.activeToolItem]?.fill,
        size: toolboxState[boardState.activeToolItem]?.size,
      },
    });
  };

  // Handle mouse move event to update drawing or erasing
  const boardMouseMoveHandler = (event) => {
    if (boardState.toolActionType === TOOL_ACTION_TYPES.WRITING) return;

    const { clientX, clientY } = event;

    if (boardState.toolActionType === TOOL_ACTION_TYPES.DRAWING) {
      // Update the drawing
      dispatchBoardAction({
        type: BOARD_ACTIONS.DRAW_MOVE,
        payload: { clientX, clientY },
      });
    } else if (boardState.toolActionType === TOOL_ACTION_TYPES.ERASING) {
      // Update the erasing
      dispatchBoardAction({
        type: BOARD_ACTIONS.ERASE,
        payload: { clientX, clientY },
      });
    }
  };

  // Handle mouse up event to stop drawing or erasing
  const boardMouseUpHandler = () => {
    if (boardState.toolActionType === TOOL_ACTION_TYPES.WRITING) return;

    if (boardState.toolActionType === TOOL_ACTION_TYPES.DRAWING) {
      // Finalize the drawing
      dispatchBoardAction({ type: BOARD_ACTIONS.DRAW_UP });
    }

    // Reset the action type
    dispatchBoardAction({
      type: BOARD_ACTIONS.CHANGE_ACTION_TYPE,
      payload: { actionType: TOOL_ACTION_TYPES.NONE },
    });
  };

  // Handle blur event for text input
  const textAreaBlurHandler = (text) => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.CHANGE_TEXT,
      payload: { text },
    });
  };

  // Undo the last action
  const boardUndoHandler = useCallback(() => {
    dispatchBoardAction({ type: BOARD_ACTIONS.UNDO });
  }, []);

  // Redo the last undone action
  const boardRedoHandler = useCallback(() => {
    dispatchBoardAction({ type: BOARD_ACTIONS.REDO });
  }, []);

  // Provide the context value to the child components
  const boardContextValue = {
    activeToolItem: boardState.activeToolItem,
    elements: boardState.elements,
    toolActionType: boardState.toolActionType,
    changeToolHandler,
    boardMouseDownHandler,
    boardMouseMoveHandler,
    boardMouseUpHandler,
    textAreaBlurHandler,
    undo: boardUndoHandler,
    redo: boardRedoHandler,
  };

  return (
    <boardContext.Provider value={boardContextValue}>
      {children}
    </boardContext.Provider>
  );
};

export default BoardProvider;


/*


DRAW_DOWN → Creates a new rectangle with initial coordinates.
DRAW_MOVE → Updates the rectangle's width & height dynamically as the mouse moves.
DRAW_UP → Saves the final state of the rectangle into history for undo/redo. 

This is  the important point  
draw  down  is  help  for  the  start  or  initite the  rectangle  drawing 

draw move is help  for changing the last point of the  reactangle i.e  update  the hright and width of the reactangle 

and draw  up  is save  the  reactangle and draw it 




*/