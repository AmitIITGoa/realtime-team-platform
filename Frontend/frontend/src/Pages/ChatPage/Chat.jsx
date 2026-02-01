import React, { useEffect, useState, useRef } from "react";
import ChatInput from "./MessageSend";
import { io } from 'socket.io-client';
import PollComponent from "./PollComponent";
import { API_BASE, SOCKET_URL } from '../../config.js'


const fetchMessages = async (roomId) => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await fetch(`${API_BASE}/user/room/getMessages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${refreshToken}`
        },
        body: JSON.stringify({ "roomId": roomId }),
    });
    if (response.ok) {
        return await response.json();
    } else {
        console.log("Error while fetching messages");
        return [];
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

const isUserAuthorizedInRoom = async (roomId) => {
    console.log(roomId);
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await fetch(`${API_BASE}/user/room/isUserAuthorized`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${refreshToken}`
        },
        body: JSON.stringify({ "roomId": roomId }),
    });
    if (response.ok) {
        return true;
    }
    else {
        console.log("User not authorized in room");
        return false;
    }
};

const findCurrentUserMessage = (message, user) => {
    return message.user.userId === user.userId;
};

const voteAPI = async (optionId, socket) => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await fetch(`${API_BASE}/user/room/poll/vote`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${refreshToken}`
        },
        body: JSON.stringify({ "optId": optionId }),
    });

    if (response.ok) {
        console.log("Voted successfully!");
        socket.emit('vote', await response.json());
    }
    else {
        console.log("Error while voting");
    }
};

const likeMessageAPI = async (messageId, socket) => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await fetch(`${API_BASE}/user/room/message/like`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${refreshToken}`
        },
        body: JSON.stringify({ "messageId": messageId }),
    });

    if (response.ok) {
        const likeData = await response.json();
        socket.emit('like', likeData); // Emit the like event
    } else {
        console.log("Error while liking the message");
    }
};

const unlikeMessageAPI = async (messageId, socket) => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await fetch(`${API_BASE}/user/room/message/unlike`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${refreshToken}`
        },
        body: JSON.stringify({ "messageId": messageId }),
    });

    if (response.ok) {
        const unlikeData = await response.json();
        socket.emit('unlike', unlikeData); // Emit the unlike event
    } else {
        console.log("Error while unliking the message");
    }
};

const MessageContent = ({ text, isSent, onImageLoad }) => {
    let content = text;
    let type = 'TEXT';
    let language = 'text';

    try {
        if (!text) return null;
        if (typeof text === 'string' && text.trim().startsWith('{')) {
            const parsed = JSON.parse(text);
            if (parsed.type && parsed.content) {
                type = parsed.type;
                content = parsed.content;
                language = parsed.language || 'text';
            }
        }
    } catch (e) {
        // Not JSON, treat as text
    }

    if (type === 'CODE') {
        return (
            <div className="rounded-lg overflow-hidden my-1 bg-[#1e1e1e] border border-neutral-700 shadow-sm text-left w-full min-w-[200px] max-w-full">
                <div className="flex items-center justify-between px-3 py-1.5 bg-[#252526] border-b border-neutral-700">
                    <span className="text-xs font-mono text-neutral-400 lowercase">{language}</span>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(content);
                        }}
                        className="text-xs text-neutral-500 hover:text-white transition-colors"
                        title="Copy code"
                    >
                        Copy
                    </button>
                </div>
                <pre className="p-3 overflow-x-auto text-sm font-mono text-[#d4d4d4] custom-scrollbar">
                    <code>{content}</code>
                </pre>
            </div>
        );
    }

    if (type === 'IMAGE') {
        return (
            <div className="rounded-lg overflow-hidden my-1 max-w-full">
                <img 
                    src={content} 
                    alt="Shared image" 
                    className="max-h-[300px] w-auto object-contain rounded-lg border border-black/10 dark:border-white/10" 
                    loading="lazy"
                    onLoad={onImageLoad}
                />
            </div>
        );
    }

    // Default Text
    return <p className={`text-[15px] leading-relaxed whitespace-pre-wrap ${isSent ? 'text-white' : ''}`}>{text || ""}</p>;
};



const Chat = ({ room}) => {
    const [messages, setMessages] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(null); // To track dropdown states
    const [user, setUser] = useState(null);
    const [client, setClient] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
    const socket = io(SOCKET_URL);
        setClient(socket);
        setMessages([]);
        fetchMessages(room.roomId).then((data) => {
            console.log(data);
            setMessages(data);
        });

        isUserAuthorizedInRoom(room.roomId).then((data) => {
            console.log(data);
            if (data === true) {
                socket.emit("joinRoom", room.roomId);
                const messageListener = ({ user, message }) => {
                    if (message.message.room.roomId === room.roomId) {
                        setMessages((prevMessages) => [...prevMessages, message]);
                    }
                };
                socket.on("message", messageListener);

                // To receive brodcasted poll
                socket.on("vote", (voteData) => {
                    console.log("Vote data broadcasted");
                    setMessages((prevMessages) => {
                        return prevMessages.map((msg) => {
                            if (msg.message.messageId === voteData.option.message.messageId) {
                                return {
                                    ...msg,
                                    pollOptions: msg.pollOptions.map((opt) => {
                                        if (opt.optId === voteData.option.optId) {
                                            return {
                                                ...opt,
                                                userVoted: [...opt.userVoted, voteData.person],
                                            };
                                        }
                                        return opt;
                                    }),
                                };
                            }
                            return msg;
                        });
                    });
                });

                const likeListener = (likeData) => {
                    setMessages((prevMessages) => {
                        return prevMessages.map((msg) => {
                            if (msg.message.messageId === likeData.message.messageId) {
                                return {
                                    ...msg,
                                    userLiked: [...msg.userLiked, likeData.person],
                                };
                            }
                            return msg;
                        });
                    });
                };
                socket.on("like", likeListener);

                const unlikeListener = (unlikeData) => {
                    setMessages((prevMessages) => {
                        return prevMessages.map((msg) => {
                            if (msg.message.messageId === unlikeData.message.messageId) {
                                return {
                                    ...msg,
                                    userLiked: msg.userLiked.filter(user => user.userId !== unlikeData.person.userId),
                                };
                            }
                            return msg;
                        });
                    });
                };
                socket.on("unlike", unlikeListener);
                // Cleanup function to remove the event listener
                return () => {
                    socket.off("message", messageListener);
                    socket.off("vote");
                    socket.off("like", likeListener);
                    socket.off("unlike", unlikeListener);
                    socket.emit("leaveRoom", room.roomId);
                };
            }
        });

        return () => {
            socket.emit("leaveRoom", room.roomId);
        }
        
    }, [room]);

    useEffect(() => {
        fetchUser().then((data) => {
            console.log(data);
            setUser(data);
        });
    }, []);

    const toggleDropdown = (messageId) => {
        setDropdownOpen((prev) => (prev === messageId ? null : messageId));
    };

    return (
        <div className="flex flex-col h-full max-h-full min-h-0 relative">
            <div
                id="chat-content"
                className="relative z-20 flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 pb-6 scroll-smooth"
            >
                {/* Wallpaper background layer */}
                <div className="absolute inset-0 chat-wallpaper pointer-events-none -z-10"></div>

                {messages.map((messageDTO) => {
                    const { message, pollOptions } = messageDTO;
                    const isSent = user ? findCurrentUserMessage(message, user) : false; // right vs left
                    return (
                        <div
                            key={message.messageId}
                            className={`flex mb-6 animate-fade-in-up ${isSent ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[550px]`}>
                                {!message.isAnonymous && !isSent && (
                                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 ml-3">
                                        {message.user.name}
                                    </p>
                                )}

                                <div className={
                                    `px-4 py-2.5 max-w-full break-words relative group transition-all duration-200 shadow-sm
                                    ${isSent 
                                        ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' 
                                        : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 rounded-2xl rounded-tl-sm border border-neutral-200 dark:border-neutral-700'
                                    }`
                                }>



                                    {message.isPoll ? (
                                        <PollComponent message={message} pollOptions={pollOptions} voteAPI={voteAPI} currentUser={user} socket={client} />
                                    ) : (
                                        <MessageContent text={message.text} isSent={isSent} onImageLoad={scrollToBottom} />
                                    )}

                                    <div className={`text-[10px] mt-1 flex items-center justify-between gap-4 opacity-70 group-hover:opacity-100 transition-opacity ${isSent ? 'text-brand-100' : 'text-neutral-400'}`}>
                                        <span>{new Date(message.postTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        
                                        <div className="flex items-center gap-2">
                                            {messageDTO.userLiked && messageDTO.userLiked.length > 0 && (
                                                <span className="flex items-center gap-0.5">
                                                    <span>❤️</span> {messageDTO.userLiked.length}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Dropdown Menu Trigger - Absolute positioned for cleanliness */}
                                    <div className={`absolute top-2 ${isSent ? 'left-2' : 'right-2'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                        <div className="relative">
                                            <button
                                                onClick={() => toggleDropdown(message.messageId)}
                                                className={`p-1 rounded-full ${isSent ? 'hover:bg-brand-600 text-brand-100' : 'hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500'}`}
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
                                            </button>
                                            {dropdownOpen === message.messageId && (
                                                <div className="absolute top-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl z-50 text-neutral-800 dark:text-neutral-200 overflow-hidden min-w-[120px]">
                                                    {messageDTO.userLiked?.some((msgUser) => msgUser.userId === user?.userId) ? (
                                                        <button
                                                            onClick={() => {
                                                                unlikeMessageAPI(message.messageId, client);
                                                                setDropdownOpen(null);
                                                            }}
                                                            className="block w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 transition"
                                                        >
                                                            💔 Unlike
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                likeMessageAPI(message.messageId, client);
                                                                setDropdownOpen(null);
                                                            }}
                                                            className="block w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 transition"
                                                        >
                                                            ❤️ Like
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            <div className="z-30">
                <ChatInput room={room} socket={client} />
            </div>
        </div>
    );
};

export default Chat;
