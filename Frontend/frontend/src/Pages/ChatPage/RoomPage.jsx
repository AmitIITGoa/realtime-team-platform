import React, { useEffect, useState } from "react";
import { io } from 'socket.io-client';
import RoomOptions from "./RoomOptions";
import Chat from "./Chat";
import WhiteboardPage from "./Whiteboard/WhiteboardPage";
import { API_BASE, SOCKET_URL } from '../../config.js'
import VideoCall from "./VideoCall";

const fetchUser = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await fetch(`${API_BASE}/user/Profile`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${refreshToken}`
        },
    });
    if (response.ok) {
        return await response.json();
    }
    else {
        console.log("Error while fetching user");
        return null;
    }
};

const RoomPage = ({ room, isNewGroupCreatedOrJoined, setIsNewGroupCreatedOrJoined, isToBeRefreshed, setIsToBeRefreshed }) => {
    const [roomDetails, setRoomDetails] = useState(null);
    const [client, setClient] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [activeTab, setActiveTab] = useState('chat');

    useEffect(() => {
        fetchUser().then((data) => {
            setCurrentUser(data);
        });
    }, []);


    useEffect(() => {
        setRoomDetails(room);
        if (room) {
            const socket = io(SOCKET_URL);
            socket.emit("joinRoom", room.roomId);
            setClient(socket);

            socket.on("rejectUser", (data) => {
                if (data.userId == currentUser.userId) {
                    setIsToBeRefreshed((pre) => !pre);
                }
            });

            socket.on("acceptUser", (data) => {
                if (data.userId == currentUser.userId) {
                    setIsToBeRefreshed((pre) => !pre);
                }
            });

            socket.on("renameGroup", (data) => {
                setIsToBeRefreshed((pre) => !pre);
            });

            socket.on("endGroup", (data) => {
                setIsToBeRefreshed((pre) => !pre);
            });

            return () => {
                socket.emit("leaveRoom", room.roomId);
            };
        }
    }, [room]);

    useEffect(() => {
        setRoomDetails(null);
        console.log("I am in RoomPage.jsx and logically i should be called");
    }, [isToBeRefreshed]);

    if (!roomDetails) {
        return (
            <div className="flex-1 bg-neutral-50 dark:bg-neutral-800/40 flex items-center justify-center">
                <div className="text-neutral-600 dark:text-neutral-400">Select a room to view details.</div>
            </div>
        )
    }

    return (
        <div className="flex-1 min-h-0 flex flex-col">
            <div className="relative z-40 flex items-center justify-between px-4 py-3 border-b border-white/20 dark:border-white/5 bg-white/40 dark:bg-neutral-800/40 backdrop-blur-md shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/30">
                        {roomDetails.roomName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="font-bold text-lg leading-tight">{room.roomName}</h2>
                        <p className="text-xs text-neutral-500 font-medium">Online</p>
                    </div>
                    

                    {/* Tab Navigation */}
                    <div className="flex items-center gap-1 bg-white/50 dark:bg-black/20 rounded-full p-1 border border-white/20 dark:border-white/5 ml-4">
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                                activeTab === 'chat'
                                    ? 'bg-white dark:bg-neutral-800 text-brand-600 dark:text-brand-400 shadow-sm'
                                    : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                            }`}
                        >
                            💬 Chat
                        </button>
                        <button
                            onClick={() => setActiveTab('whiteboard')}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                                activeTab === 'whiteboard'
                                    ? 'bg-white dark:bg-neutral-800 text-brand-600 dark:text-brand-400 shadow-sm'
                                    : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                            }`}
                        >
                            🎨 Whiteboard
                        </button>
                        <button
                            onClick={() => setActiveTab('video')}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                                activeTab === 'video'
                                    ? 'bg-white dark:bg-neutral-800 text-brand-600 dark:text-brand-400 shadow-sm'
                                    : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                            }`}
                        >
                            📹 Video Call
                        </button>
                    </div>
                </div>
                <div>
                    <RoomOptions room={roomDetails} isNewGroupCreatedOrJoined={isNewGroupCreatedOrJoined} setIsNewGroupCreatedOrJoined={setIsNewGroupCreatedOrJoined}
                        socket={client} setIsToBeRefreshed={setIsToBeRefreshed} />
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0">
                {activeTab === 'chat' && <Chat room={roomDetails} />}
                {activeTab === 'whiteboard' && <WhiteboardPage room={roomDetails} socket={client} />}
                {activeTab === 'video' && <VideoCall room={roomDetails} socket={client} currentUser={currentUser} />}
            </div>
        </div>
    );
};

export default RoomPage;
