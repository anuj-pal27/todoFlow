const express = require('express');
const cors = require('cors');
const app = express();
const connectDB = require('./db/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const actionRoutes = require('./routes/actionRoutes');
const dotenv = require('dotenv');
const http = require('http');
const WebSocket = require('ws');

dotenv.config();

connectDB();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors({
    origin:process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials:true,
}));

app.use('/api/auth',authRoutes);
app.use('/api/tasks',taskRoutes);
app.use('/api/action',actionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// WebSocket test endpoint
app.get('/ws-test', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'WebSocket server is available',
        wsUrl: `wss://${req.get('host')}`
    });
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server attached to the HTTP server
const wss = new WebSocket.Server({ 
    server,
    path: '/ws' // Add specific path for WebSocket connections
});

// Handle WebSocket upgrade requests
server.on('upgrade', (request, socket, head) => {
    const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
    
    if (pathname === '/ws') {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    } else {
        socket.destroy();
    }
});

wss.on('connection', (ws, req) => {
    console.log('New WebSocket client connected from:', req.socket.remoteAddress);
    
    // Send a welcome message
    ws.send(JSON.stringify({ 
        type: 'CONNECTION_STATUS', 
        message: 'Connected to TodoFlow WebSocket server',
        timestamp: new Date().toISOString()
    }));
    
    ws.on('close', (code, reason) => {
        console.log('WebSocket client disconnected:', code, reason);
    });
    
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// Export WebSocket functions for use in other modules
global.broadcastMessage = ({ type, task }) => {
    try {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type, task }));
            }
        });
    } catch (err) {
        console.error('WebSocket broadcastMessage error:', err);
    }
};

global.broadcastActionLog = (actionLog) => {
    try {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'ACTION_LOG', actionLog }));
            }
        });
    } catch (err) {
        console.error('WebSocket broadcastActionLog error:', err);
    }
};

server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
    console.log(`WebSocket server is running on the same port`);
});