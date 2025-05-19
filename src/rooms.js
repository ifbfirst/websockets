import { generateRoomID } from './utils/index.js';
import { sendToPlayer } from './players.js';
import { connections } from './ws.js';

const rooms = {};

function handleRoomAction(ws, data) {
  if (data.type === 'create_room') {
    const roomID = generateRoomID();
    const playerName =
      [...connections.keys()].find((n) => connections.get(n) === ws) ||
      `Guest_${Math.floor(Math.random() * 1000)}`;
    rooms[roomID] = [{ name: playerName, index: roomID }];
  } else if (data.type === 'add_user_to_room') {
    const roomID = data.data.indexRoom;

    if (rooms[roomID]) {
      if (rooms[roomID].length >= 2) {
        return ws.send(
          JSON.stringify({ type: 'error', message: 'Room is full' })
        );
      }
      const playerName =
        [...connections.entries()].find(([n, s]) => s === ws)?.[0] ||
        `Guest_${Math.floor(Math.random() * 1000)}`;
      rooms[roomID].push({ name: playerName, index: roomID });

      if (rooms[roomID].length === 2) {
        broadcastToRoom(roomID, {
          type: 'create_game',
          data: JSON.stringify({ idGame: roomID }),
          id: 0,
        });
      }
    } else {
      ws.send(JSON.stringify({ type: 'error', message: 'Room is not exist' }));
    }
  }
}

function broadcastToRoom(roomID, message) {
  if (rooms[roomID]) {
    rooms[roomID].forEach(({ name }) => sendToPlayer(name, message));
  }
}
export { handleRoomAction, rooms, broadcastToRoom };
