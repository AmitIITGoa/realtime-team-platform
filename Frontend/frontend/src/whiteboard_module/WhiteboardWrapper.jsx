import React from 'react';
import Board from "./components/Board";
import Toolbar from "./components/Toolbar";
import Toolbox from "./components/Toolbox";
import BoardProvider from "./store/BoardProvider";
import ToolboxProvider from "./store/ToolboxProvider";

const WhiteboardWrapper = ({ socket, room }) => {
    return (
        <div className="relative w-full h-full bg-neutral-50 dark:bg-neutral-900 border-l border-white/20 dark:border-white/5 shadow-inner">
            <BoardProvider socket={socket} room={room}>
                <ToolboxProvider>
                    <div className="relative w-full h-full overflow-hidden">
                        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
                        <Toolbar />
                        <Board />
                        <Toolbox />
                    </div>
                </ToolboxProvider>
            </BoardProvider>
        </div>
    );
};

export default WhiteboardWrapper;
