import { WebSocketServer } from 'ws';
import { httpServer } from './http_server/index.js';
import { registerPlayer } from './players.js';

const wsServer = new WebSocketServer({ noServer: true });

httpServer.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, (ws) => {
        wsServer.emit('connection', ws, request);
    });
});

wsServer.on('connection', (ws) => {

    ws.on('message', (message) => {
    const data = JSON.parse(message);
    const playerData = JSON.parse(data.data);

    if (data.type === "reg") {
        const { name, password } = playerData;
        const result = registerPlayer(name, password);
        ws.send(JSON.stringify({ type: "reg", data: { name, index: name, error: !result.success, errorText: result.error || "" }, id: 0 }));
    }
});

    ws.on('error', (err) => console.error('Error WebSocket:', err));
});