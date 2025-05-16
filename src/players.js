import { connections } from './ws.js';

const players = {};

function registerPlayer(name, password) {
  if (!name || !password) {
    return { success: false, error: 'Name and password  required' };
  }

  if (players[name]) {
    return { success: true };
  }

  players[name] = { password, wins: 0 };

  return { success: true };
}

function handlePlayerAction(ws, data) {
  const { name, password } = data.data;
  const result = registerPlayer(name, password);
  connections.set(name, ws);
  ws.send(
    JSON.stringify({
      type: 'reg',
      data: JSON.stringify({
        name,
        index: name,
        error: !result.success,
        errorText: result.error || '',
      }),
      id: 0,
    })
  );
}

function sendToPlayer(playerName, message) {
  const playerSocket = connections.get(playerName);
  if (playerSocket && playerSocket.readyState === WebSocket.OPEN) {
    playerSocket.send(JSON.stringify(message));
  }
}

export { registerPlayer, players, handlePlayerAction, sendToPlayer };
