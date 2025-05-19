import { WebSocketServer } from 'ws';
import { handlePlayerAction } from './players.js';
import { handleGameAction } from './game.js';
import { httpServer } from './http_server/index.js';
import { handleRoomAction, rooms } from './rooms.js';

const connections = new Map();
const wsServer = new WebSocketServer({ noServer: true });

httpServer.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (ws) => {
    wsServer.emit('connection', ws, request);
  });
});

wsServer.on('connection', (ws) => {
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      data.data = data.data && data.data !== '' ? JSON.parse(data.data) : {};

      if (data.type === 'reg') {
        handlePlayerAction(ws, data);
        broadcastUpdateRoom();
      } else if (['create_room', 'add_user_to_room'].includes(data.type)) {
        handleRoomAction(ws, data);
        broadcastUpdateRoom();
      } else if (['add_ships', 'attack', 'randomAttack'].includes(data.type)) {
        handleGameAction(ws, data);
      } else {
        console.warn('Unknown command:', data.type);
      }
    } catch (error) {
      console.error('Error JSON:', error);
    }
  });

  ws.on('error', (err) => console.error('Error WebSocket:', err));
});

console.log('🚀 WebSocket is running on port 8181!');

function broadcastUpdateRoom() {
  wsServer.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: 'update_room',
          data: JSON.stringify(
            Object.entries(rooms).map(([roomId, roomUsers]) => ({
              roomId,
              roomUsers: roomUsers.map((user) => ({
                name: user.name,
                index: user.index,
              })),
            }))
          ),
          id: 0,
        })
      );
    }
  });
}

export { connections };
