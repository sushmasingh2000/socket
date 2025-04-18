const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust as needed for production
    methods: ["GET", "POST"],
  },
});

app.use(cors());

app.get("/", (req, res) => {
  res.send("WebSocket server is running 🤔 ");
});

const userSockets = {}; // Store user IDs and their socket IDs
const userMessages = {}; // Store messages for each user

const socketIo = require('socket.io');
const moment = require('moment');

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('A user connected: ' + socket.id);

    // Listening for a new message
    socket.on('send_message', async (messageData) => {
        try {
            const { sender_id, sender_name, reciver_id, reciver_name, message } = messageData;
            const time = moment().format("YYYY-MM-DD HH:mm:ss");
            if (!sender_id || !sender_name || !reciver_id || !reciver_name || !message) {
                socket.emit('message_error', { msg: 'sender_id, sender_name, reciver_name, reciver_id, and message are required' });
                return;
            }

            // Save message to database
            const { error } = await supabase
                .from('message_data')
                .insert([{ sender_id, sender_name, reciver_id, reciver_name, message, time }]);

            if (error) {
                console.error("Supabase error:", error);
                socket.emit('message_error', { msg: error.message || "Database error" });
                return;
            }

            // Emit the message to the receiver
            io.to(reciver_id).emit('receive_message', { sender_id, sender_name, reciver_id, reciver_name, message, time });
            socket.emit('message_sent', { msg: 'Message sent successfully' });

        } catch (e) {
            console.error("API error:", e);
            socket.emit('message_error', { msg: e.message || "Something went wrong while sending the message" });
        }
    });

    // Listen for user disconnect
    socket.on('disconnect', () => {
        console.log('A user disconnected: ' + socket.id);
    });
});

// Start server
const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// import React, { useState, useEffect } from 'react';
// import io from 'socket.io-client';

// const socket = io('http://localhost:5000'); // Server URL

// function MessagingApp() {
//     const [message, setMessage] = useState('');
//     const [messages, setMessages] = useState([]);
//     const [userDetails, setUserDetails] = useState({
//         sender_id: 1,
//         sender_name: 'User1',
//         reciver_id: 2,
//         reciver_name: 'User2'
//     });

//     useEffect(() => {
//         socket.on('receive_message', (data) => {
//             setMessages((prevMessages) => [...prevMessages, data]);
//         });

//         socket.on('message_sent', (data) => {
//             console.log(data.msg);
//         });

//         socket.on('message_error', (error) => {
//             console.log(error.msg);
//         });

//         return () => {
//             socket.off('receive_message');
//             socket.off('message_sent');
//             socket.off('message_error');
//         };
//     }, []);

//     const sendMessage = () => {
//         if (!message) return;

//         const messageData = {
//             sender_id: userDetails.sender_id,
//             sender_name: userDetails.sender_name,
//             reciver_id: userDetails.reciver_id,
//             reciver_name: userDetails.reciver_name,
//             message: message
//         };

//         socket.emit('send_message', messageData);
//         setMessage(''); // Clear message input after sending
//     };

//     return (
//         <div>
//             <div>
//                 <h3>Chat with {userDetails.reciver_name}</h3>
//                 <div>
//                     {messages.map((msg, index) => (
//                         <div key={index}>
//                             <strong>{msg.sender_name}: </strong>{msg.message}
//                         </div>
//                     ))}
//                 </div>
//             </div>
//             <input
//                 type="text"
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//                 placeholder="Type a message"
//             />
//             <button onClick={sendMessage}>Send</button>
//         </div>
//     );
// }

// export default MessagingApp;
