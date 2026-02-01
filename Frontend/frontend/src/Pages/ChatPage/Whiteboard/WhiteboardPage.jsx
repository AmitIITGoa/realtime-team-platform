import React from 'react';
import WhiteboardWrapper from "../../../whiteboard_module/WhiteboardWrapper";

const WhiteboardPage = ({ room, socket }) => {
    // room and socket props are available here for future integration
    return (
        <WhiteboardWrapper socket={socket} room={room} />
    );
};

export default WhiteboardPage;
