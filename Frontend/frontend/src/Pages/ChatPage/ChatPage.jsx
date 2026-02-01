import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import RoomPage from './RoomPage';
import { ThemeToggleButton } from '../../theme/ThemeProvider.jsx'
import { API_BASE } from '../../config.js'
import { useToast } from '../../components/ToastProvider.jsx'

const refreshTokens = async () => {
    const token = localStorage.getItem('sessionToken');
    const response = await fetch(`${API_BASE}/auth/v1/refreshToken`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "token": token }),
    });

    if (response.ok) {
        const { refreshToken, sessionToken } = await response.json();
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("sessionToken", sessionToken);
        return true;
    }
    else {
        console.log("Error Refreshing Token");
        return false;
    }
};

const fetchRooms = async (setRoom, setFilteredRooms) => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await fetch(`${API_BASE}/user/allRoom`, {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${refreshToken}`
        },
    });

    if (response.ok) {
        const data = await response.json();
        console.log(data);
        // return data;
        setRoom(data);
        setFilteredRooms(data);
    }
    else {
        console.log("Error while fetching the Rooms");
        // return [];
    }
};

const joinGroupAPI = async (roomName) => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await fetch(`${API_BASE}/user/createRoom`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${refreshToken}`
        },
        body: JSON.stringify({ "roomName": roomName }),
    });

    if (response.ok) {
        console.log("Room created succesfully");
    }
    else {
        console.log("Error Encoutered while creating Room");
    }
};

const joinNewGroupAPI = async (roomId) => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await fetch(`${API_BASE}/user/joinRoom`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${refreshToken}`
        },
        body: JSON.stringify({ "roomId": roomId }),
    });

    if (response.ok) {
        console.log("Room Joined succesfully");
    }
    else {
        console.log("Error Encoutered while creating Room");
    }
};
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

const chatPage = () => {
    const [isNewChat, setIsNewChat] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [isJoinGroup, setIsJoinGroup] = useState(false);
    const [joinGroupName, setJoinGroupName] = useState("");
    const [rooms, setRoom] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [filteredRooms, setFilteredRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isToBeRefreshed, setIsToBeRefreshed] = useState(false);
    const [isNewGroupCreatedOrJoined, setIsNewGroupCreatedOrJoined] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const { notify } = useToast();

    const navigate = useNavigate();
    useEffect(() => {
        document.title = "InteractiveQ - Chat";
        refreshTokens().then((state) => {
            if (state === false) {
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('sessionToken');
                navigate('/signin');
            }
        });
        fetchUser().then((data) => {
            setCurrentUser(data);
        });
    }, []);

    useEffect(() => {
        console.log("ChatPage mounted");

        setTimeout(() => {
            fetchRooms(setRoom, setFilteredRooms);
        }, 500);
        // fetchRooms(setRoom, setFilteredRooms);

        console.log(rooms.length);
    }, [isNewGroupCreatedOrJoined]);

    useEffect(() => {
        fetchRooms(setRoom, setFilteredRooms);
    }, [isToBeRefreshed]);

    const handleSearchChange = (e) => {
        const input = e.target.value.toLowerCase();
        setSearchText(input);
        const filtered = rooms.filter((room) =>
            room.roomName.toLowerCase().includes(input)
        );
        setFilteredRooms(filtered);
    };

    const handleNewGroupClick = () => {
        setIsNewChat(true);
    };
    const handleJoinGroupClick = () => {
        setIsJoinGroup(true);
    };

    const handleGroupCreate = () => {
        joinGroupAPI(newGroupName);
        setIsNewGroupCreatedOrJoined(!isNewGroupCreatedOrJoined);
        setNewGroupName("");
        setIsNewChat(false);
    };

    const handleJoinGroup = () => {
        console.log("Group joined:", joinGroupName);
        joinNewGroupAPI(Number.parseInt(joinGroupName));
        setIsNewGroupCreatedOrJoined(!isNewGroupCreatedOrJoined);
        setJoinGroupName("");
        setIsJoinGroup(false);
    };

    const handleModalClose = () => {
        setIsNewChat(false);
    };
    const handleJoinGroupModalClose = () => {
        setIsJoinGroup(false);
    };

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="h-screen w-full flex flex-col bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">
            {/* Main Container with subtle glass effect */}
            <div className={`h-full w-full flex flex-col ${isNewChat || isJoinGroup ? 'blur-sm pointer-events-none select-none' : ''}`}>
                <nav className="flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 z-20">
                    <button className="hidden md:inline-flex items-center justify-center h-9 w-9 rounded-full border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition"
                        onClick={toggleSidebar} aria-label="Toggle sidebar" title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}>
                        {isSidebarOpen ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                        )}
                    </button>
                    <button className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-full border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition"
                        onClick={() => setMobileDrawerOpen(true)} aria-label="Open chats">
                        ☰
                    </button>
                    <div className="flex-1 max-w-sm relative">
                        <input
                            type="text"
                            id="search-bar"
                            placeholder="Search Chat..."
                            className="w-full input pl-9"
                            value={searchText}
                            onChange={(e) => {
                                handleSearchChange(e)
                            }}
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">🔍</span>
                    </div>

                    <div className="ml-auto flex items-center gap-2 sm:gap-3 text-sm">
                        <ThemeToggleButton />
                        <span className="font-medium text-neutral-700 dark:text-neutral-200 hidden sm:inline-block">
                            {currentUser ? `Hi, ${currentUser.name}` : "Loading..."}
                        </span>
                        <button className="btn-outline px-3 py-1.5 text-xs sm:text-sm" onClick={()=>{
                            localStorage.removeItem('refreshToken');
                            localStorage.removeItem('sessionToken');
                            navigate('/signin');
                        }}>Log Out</button>
                    </div>
                </nav>
                <div className="flex flex-1 min-h-0 overflow-hidden relative transition-all duration-300">
                    {/* Sidebar */}
                    <div className={`${isSidebarOpen ? 'w-full max-w-sm opacity-100' : 'w-0 opacity-0 overflow-hidden'} hidden md:flex border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex-col z-10 transition-all duration-300 ease-in-out`}>
                        <div className="flex items-center justify-between p-4 border-b border-white/20 dark:border-white/5 whitespace-nowrap">
                            <h2 className="font-bold text-lg text-gradient">My Chats</h2>
                            <div className="flex items-center gap-1">
                                <button className="p-2 hover:bg-brand-50 dark:hover:bg-brand-900/30 rounded-full text-brand-600 transition" 
                                    onClick={handleNewGroupClick} title="Create New Group">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                </button>
                                <button className='p-2 hover:bg-brand-50 dark:hover:bg-brand-900/30 rounded-full text-brand-600 transition' 
                                    onClick={handleJoinGroupClick} title="Join Group">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                                </button>
                            </div>
                        </div>
                        <div id="chat-items" className="flex-1 overflow-y-auto p-3 space-y-2">
                            {filteredRooms.length > 0 ? (
                                filteredRooms.map((room) => (
                                    <div
                                        key={room.roomId}
                                        className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border 
                                            ${selectedRoom?.roomId === room.roomId 
                                                ? 'bg-brand-50 border-brand-200 dark:bg-brand-900/20 dark:border-brand-800' 
                                                : 'bg-white/60 hover:bg-white border-white/40 dark:bg-neutral-800/60 dark:hover:bg-neutral-800 dark:border-white/5'}
                                        `}
                                        onClick={() => setSelectedRoom(room)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                                                ${selectedRoom?.roomId === room.roomId ? 'bg-brand-500 shadow-lg shadow-brand-500/30' : 'bg-neutral-300 dark:bg-neutral-600'}
                                            `}>
                                                {room.roomName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-neutral-900 dark:text-white truncate max-w-[150px]">{room.roomName}</h4>
                                                <div className="flex items-center gap-2 text-xs mt-0.5">
                                                    <span className="text-neutral-500 font-mono bg-neutral-100 dark:bg-neutral-800 px-1 rounded">#{room.roomId}</span>
                                                    <span className={`${room.isEnded ? "text-red-400" : "text-green-500 font-medium"}`}>
                                                        {room.isEnded ? "Ended" : "Active"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 opacity-50">
                                    <p className="text-sm">No chats found</p>
                                    <p className="text-xs mt-1">Create or join a group to get started</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col min-w-0 bg-white/30 dark:bg-neutral-900/30 relative transition-all duration-300">
                        {/* Background blobs for chat area */}
                        {/* Background blobs removed for cleaner look */}
                        
                        <RoomPage 
                            room={selectedRoom} 
                            isNewGroupCreatedOrJoined={isNewGroupCreatedOrJoined} 
                            setIsNewGroupCreatedOrJoined={setIsNewGroupCreatedOrJoined}
                            isToBeRefreshed={isToBeRefreshed} 
                            setIsToBeRefreshed={setIsToBeRefreshed} 
                        />
                    </div>
                </div>
                                {/* Mobile Drawer */}
                                {mobileDrawerOpen && (
                                    <div className="fixed inset-0 z-50 md:hidden">
                                        <div className="absolute inset-0 bg-black/40" onClick={() => setMobileDrawerOpen(false)} />
                                        <div className="absolute inset-y-0 left-0 w-80 max-w-[85%] bg-white/90 dark:bg-neutral-800/90 backdrop-blur border-r border-neutral-200/60 dark:border-neutral-700/50 shadow-xl flex flex-col">
                                            <div className="flex items-center justify-between p-3 border-b border-neutral-200 dark:border-neutral-700/50">
                                                <h2 className="font-semibold">My Chats</h2>
                                                <button className="text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white" onClick={() => setMobileDrawerOpen(false)}>✖</button>
                                            </div>
                                            <div className="p-3 flex items-center gap-2">
                        <button className="btn-ghost" onClick={()=>{handleNewGroupClick(); setMobileDrawerOpen(false);}}>New Chat +</button>
                        <button className='btn-ghost' onClick={()=>{handleJoinGroupClick(); setMobileDrawerOpen(false);}}>Join Group +</button>
                                            </div>
                                            <div id="chat-items-mobile" className="flex-1 overflow-y-auto p-3 space-y-2">
                                                {filteredRooms.length > 0 ? (
                                                    filteredRooms.map((room) => (
                            <div key={room.roomId} className="p-3 rounded-lg bg-white/80 hover:bg-white dark:bg-neutral-700/70 dark:hover:bg-neutral-700 cursor-pointer border border-neutral-200/60 dark:border-neutral-700/50"
                                                                 onClick={() => { setSelectedRoom(room); setMobileDrawerOpen(false); }}>
                                                            <div className="flex justify-between items-start">
                                                                <h4 className="text-sm font-medium text-neutral-900 dark:text-white">{room.roomName}</h4>
                                                                <span className="text-xs font-mono text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">#{room.roomId}</span>
                                                            </div>
                                                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{room.isEnded ? 'Ended' : 'Active'}</p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 px-3">No rooms found</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
            </div>

            {/* Modals */}
            {(isNewChat || isJoinGroup) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="card w-full max-w-md p-8 bg-white/90 dark:bg-neutral-900/90 shadow-2xl scale-100 animate-scale-up border-white/20">
                        <h2 className="text-2xl font-bold mb-1 text-gradient inline-block">
                            {isNewChat ? "Create New Group" : "Join Group"}
                        </h2>
                        <p className="text-sm text-neutral-500 mb-6">
                            {isNewChat ? "Start a new conversation room" : "Enter a Room ID to join"}
                        </p>
                        
                        <input
                            type="text"
                            placeholder={isNewChat ? "Enter group name" : "Enter group ID"}
                            value={isNewChat ? newGroupName : joinGroupName}
                            onChange={(e) => isNewChat ? setNewGroupName(e.target.value) : setJoinGroupName(e.target.value)}
                            required
                            className="input mb-6 bg-neutral-50 dark:bg-neutral-800"
                            autoFocus
                        />
                        
                        <div className="flex items-center justify-end gap-3">
                            <button className="btn-ghost" onClick={isNewChat ? handleModalClose : handleJoinGroupModalClose}>Cancel</button>
                            <button className="btn shadow-brand-500/25" onClick={isNewChat ? handleGroupCreate : handleJoinGroup}>
                                {isNewChat ? "Create Group" : "Join Room"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default chatPage;
