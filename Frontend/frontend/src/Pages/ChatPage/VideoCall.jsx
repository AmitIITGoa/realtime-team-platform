import React, { useEffect, useRef, useState } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from 'react-icons/fa';

const VideoCall = ({ room, socket, currentUser }) => {
    const [peers, setPeers] = useState([]);
    const [userStream, setUserStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const userVideo = useRef();
    const peersRef = useRef([]);
    const streamRef = useRef();

    useEffect(() => {
        // Handle incoming ICE candidates
        const handleIceCandidate = (payload) => {
             const item = peersRef.current.find(p => p.peerID === payload.sender);
             if (item) {
                 item.peer.addIceCandidate(new RTCIceCandidate(payload.candidate)).catch(err => console.error("Add Ice Candidate Error:", err));
             }
        };

        // Handle incoming answers
        const handleAnswer = (payload) => {
             const item = peersRef.current.find(p => p.peerID === payload.id);
             if (item) {
                 item.peer.setRemoteDescription(new RTCSessionDescription(payload.signal)).catch(err => console.error("Set Remote Desc Error:", err));
             }
        };

        // Handle new peer joining (offer)
        const handleOffer = (payload) => {
             // If we already have a connection for this caller, ignore (or handle renegotiation - out of scope for now)
             const item = peersRef.current.find(p => p.peerID === payload.callerID);
             if (item) {
                  return;
             }
             const peer = addPeer(payload.signal, payload.callerID, streamRef.current);
             peersRef.current.push({
                 peerID: payload.callerID,
                 peer,
             });
             setPeers(users => [...users, { peerID: payload.callerID, peer }]);
        };

        // Handle receiving list of all users in room
        const handleAllUsers = (users) => {
             const peers = [];
             users.forEach(userID => {
                 // Double check we don't peer with ourselves
                 if (userID === socket.id) return;
                 
                 const peer = createPeer(userID, socket.id, streamRef.current);
                 peersRef.current.push({
                     peerID: userID,
                     peer,
                 });
                 peers.push({
                     peerID: userID,
                     peer,
                 });
             });
             setPeers(peers);
        };
        
        // Handle user leaving
        const handleUserLeft = (data) => {
            // If the server emits a user left event (unimplemented in server currently but good practice)
            // Or if we need to clean up specifics. 
            // Currently server doesn't seem to emit explicit "peer left" to other peers via socket for cleanup?
            // Actually server.js has `socket.on('disconnect')` but doesn't emit to room.
            // Server has `socket.on('leaveRoom')` -> log only. 
            // Ideally server should emit 'userLeft' to room. 
            // For now, if a peer connection fails/closes, we might want to clean up manually, 
            // but standard signaling often relies on server events.
        };


        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            setUserStream(stream);
            streamRef.current = stream;
            if (userVideo.current) {
                userVideo.current.srcObject = stream;
            }

            socket.emit("joinRoom", room.roomId);

            socket.on("allUsers", handleAllUsers);
            socket.on("offer", handleOffer);
            socket.on("answer", handleAnswer);
            socket.on("ice-candidate", handleIceCandidate); 
        });
        
        // Cleanup functions
        return () => {
             // Tell server we are leaving
             socket.emit("leaveRoom", room.roomId);

             if (streamRef.current) {
                 streamRef.current.getTracks().forEach(track => track.stop());
             }
             
             socket.off("allUsers", handleAllUsers);
             socket.off("offer", handleOffer);
             socket.off("answer", handleAnswer);
             socket.off("ice-candidate", handleIceCandidate);
             
             peersRef.current.forEach(p => {
                 if(p.peer) p.peer.destroy ? p.peer.destroy() : p.peer.close(); 
             });
             peersRef.current = [];
             setPeers([]);
        }
    }, [socket, room.roomId]); // Added dependencies for safety

    // Helper functions for Raw WebRTC
    function createPeer(userToSignal, callerID, stream) {
        const peer = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" }
            ]
        });

        if (stream) {
            stream.getTracks().forEach(track => peer.addTrack(track, stream));
        }

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("ice-candidate", {
                    target: userToSignal,
                    candidate: event.candidate,
                });
            }
        };

        peer.ontrack = (event) => {
             setPeers(prevPeers => {
                 return prevPeers.map(p => {
                     if (p.peerID === userToSignal) {
                         return { ...p, stream: event.streams[0] };
                     }
                     return p;
                 });
             });
        };

        peer.createOffer().then(offer => {
            peer.setLocalDescription(offer);
            socket.emit("offer", {
                userToCall: userToSignal,
                signal: offer,
                callerID,
            });
        });

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new RTCPeerConnection({
             iceServers: [
                { urls: "stun:stun.l.google.com:19302" }
            ]
        });

        if (stream) {
            stream.getTracks().forEach(track => peer.addTrack(track, stream));
        }

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("ice-candidate", {
                    target: callerID,
                    candidate: event.candidate,
                });
            }
        };

        peer.ontrack = (event) => {
             setPeers(prevPeers => {
                 return prevPeers.map(p => {
                     if (p.peerID === callerID) {
                         return { ...p, stream: event.streams[0] };
                     }
                     return p;
                 });
             });
        };

        peer.setRemoteDescription(new RTCSessionDescription(incomingSignal));
        peer.createAnswer().then(answer => {
            peer.setLocalDescription(answer);
            socket.emit("answer", {
                signal: answer,
                callerID,
            });
        });

        return peer;
    }

    const toggleMute = () => {
        if (userStream) {
             const audioTrack = userStream.getAudioTracks()[0];
             if (audioTrack) {
                 audioTrack.enabled = !audioTrack.enabled;
                 setIsMuted(!audioTrack.enabled);
             }
        }
    };

    const toggleVideo = () => {
        if (userStream) {
             const videoTrack = userStream.getVideoTracks()[0];
             if (videoTrack) {
                 videoTrack.enabled = !videoTrack.enabled;
                 setIsVideoOff(!videoTrack.enabled);
             }
        }
    };

    return (
        <div className="flex-1 bg-neutral-900 p-4 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Local Video */}
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-lg border border-neutral-800">
                    <video ref={userVideo} autoPlay muted playsInline className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-white text-xs">
                        You
                    </div>
                </div>

                {/* Remote Videos */}
                {peers.map((p, index) => (
                    <VideoCard key={p.peerID} peer={p} />
                ))}
            </div>

            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 bg-neutral-800/90 p-3 rounded-full backdrop-blur-md border border-neutral-700 shadow-xl z-50">
                <button onClick={toggleMute} className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-neutral-600 hover:bg-neutral-500'}`}>
                    {isMuted ? <FaMicrophoneSlash className="text-white" /> : <FaMicrophone className="text-white" />}
                </button>
                <button onClick={toggleVideo} className={`p-4 rounded-full transition-colors ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-neutral-600 hover:bg-neutral-500'}`}>
                    {isVideoOff ? <FaVideoSlash className="text-white" /> : <FaVideo className="text-white" />}
                </button>
            </div>
        </div>
    );
};

const VideoCard = ({ peer }) => {
    const ref = useRef();

    useEffect(() => {
        if (peer.stream) {
            ref.current.srcObject = peer.stream;
        }
    }, [peer.stream]);

    return (
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-lg border border-neutral-800">
            <video ref={ref} autoPlay playsInline className="w-full h-full object-cover" />
             <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-white text-xs">
                User {peer.peerID.substr(0, 5)}...
            </div>
        </div>
    );
};

export default VideoCall;
