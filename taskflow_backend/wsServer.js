const websocket = require('ws');
const wss = new websocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('New client connected');
});

function broadcastMessage({ type, task }) {
    try {
        wss.clients.forEach(client => {
            if (client.readyState === websocket.OPEN) {
                client.send(JSON.stringify({ type, task }));
            }
        });
    } catch (err) {
        console.error('WebSocket broadcastMessage error:', err);
    }
}

function broadcastActionLog(actionLog) {
    try {
        wss.clients.forEach(client => {
            if (client.readyState === websocket.OPEN) {
                client.send(JSON.stringify({ type: 'ACTION_LOG', actionLog }));
            }
        });
    } catch (err) {
        console.error('WebSocket broadcastActionLog error:', err);
    }
}

module.exports = {
    broadcastMessage,
    broadcastActionLog
}; 