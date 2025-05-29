import { rooms, broadcastToRoom } from './rooms.js';
import { sendToPlayer } from './players.js';
import { connections } from './ws.js';

function handleGameAction(ws, data) {
  const roomID = data.data.gameId;
  const playerName =
    [...connections.entries()].find(([n, s]) => s === ws)?.[0] || 'Unknown';

  if (!rooms[roomID]) {
    return ws.send(
      JSON.stringify({ type: 'error', message: 'Room is not found' })
    );
  }

  if (data.type === 'add_ships') {
    rooms[roomID].forEach((player) => {
      if (player.name === playerName) {
        player.ships = data.data.ships || [];
      }
    });

    if (rooms[roomID].every((player) => player.ships?.length)) {
      const currentPlayer = rooms[roomID][0].name;
      rooms[roomID].gameStarted = true;

      broadcastToRoom(roomID, {
        type: 'start_game',
        data: JSON.stringify({
          ships: rooms[roomID].find((p) => p.name === playerName).ships,
          currentPlayerIndex: currentPlayer,
        }),
        id: 0,
      });
    }
  } else if (data.type === 'attack') {
    const opponent = rooms[roomID].find((p) => p.name !== playerName);
    if (!opponent) return;

    let status = 'miss';
    for (const ship of opponent.ships) {
      if (ship.position.x === data.data.x && ship.position.y === data.data.y) {
        status = ship.hp <= 1 ? 'killed' : 'shot';
        ship.hp -= 1;
        break;
      }
    }

    console.log(
      `🎯 ${playerName} атакует (${data.data.x}, ${data.data.y}) → ${status}`
    );

    broadcastToRoom(roomID, {
      type: 'attack',
      data: JSON.stringify({
        position: { x: data.data.x, y: data.data.y },
        currentPlayer: playerName,
        status,
      }),
      id: 0,
    });

    if (status === 'killed' && opponent.ships.every((s) => s.hp <= 0)) {
      broadcastToRoom(roomID, {
        type: 'finish',
        data: JSON.stringify({ winPlayer: playerName }),
        id: 0,
      });
      updateWinners(playerName);
    } else {
      const nextPlayer = status === 'miss' ? opponent.name : playerName;
      broadcastToRoom(roomID, {
        type: 'turn',
        data: JSON.stringify({ currentPlayer: nextPlayer }),
        id: 0,
      });
    }
  } else if (data.type === 'randomAttack') {
    const opponent = rooms[roomID].find((p) => p.name !== playerName);
    if (!opponent) return;

    const randomX = Math.floor(Math.random() * 10);
    const randomY = Math.floor(Math.random() * 10);

    sendToPlayer(playerName, {
      type: 'attack',
      data: JSON.stringify({
        position: { x: randomX, y: randomY },
        currentPlayer: playerName,
        status: 'shot',
      }),
      id: 0,
    });
  } else {
    ws.send(JSON.stringify({ type: 'error', message: 'Unknown game action' }));
  }
}

function updateWinners(winnerName) {
  if (!players[winnerName]) return;
  players[winnerName].wins += 1;

  const winnersData = Object.entries(players).map(([name, info]) => ({
    name,
    wins: info.wins,
  }));

  broadcastToAll({
    type: 'update_winners',
    data: JSON.stringify(winnersData),
    id: 0,
  });
}

export { handleGameAction };
