import { io } from "socket.io-client";

// URL of the backend server
const SOCKET_URL = "http://localhost:3000"; 
const ROOM_ID = "test-room-123";

console.log(`Connecting to ${SOCKET_URL}...`);
const socket = io(SOCKET_URL);

socket.on("connect", () => {
  console.log("Connected to server with ID:", socket.id);
  
  // Join the room
  console.log(`Joining room: ${ROOM_ID}`);
  socket.emit("joinRoom", ROOM_ID);

  // Listen for whiteboard sync events
  socket.on("whiteboardSync", (data) => {
    console.log("✅ Received whiteboardSync event:");
    // console.log(JSON.stringify(data, null, 2));
    if (data.element.type === 'brush') {
        console.log("Received brush element. Points count:", data.element.points?.length);
    }
  });

  // Simulate drawing after 2 seconds
  setTimeout(() => {
    console.log("Simulating BRUSH drawing from script...");
    const mockBrushElement = {
        type: "brush",
        points: [{x: 100, y: 100}, {x: 105, y: 105}, {x: 110, y: 110}], // Minimal points
        stroke: "blue",
        size: 5,
        id: Date.now()
    };
    
    socket.emit("whiteboardDraw", {
        roomId: ROOM_ID,
        element: mockBrushElement
    });
    console.log("Sent brush whiteboardDraw event.");
  }, 2000);
});

socket.on("disconnect", () => {
    console.log("Disconnected from server.");
});

// Keep the script running
setInterval(() => {}, 1000);
