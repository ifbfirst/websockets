const playersDB = {}; 

function registerPlayer(name, password) {
    if (!(name in playersDB)) {
        playersDB[name] = { password, wins: 0 };
        return { success: true, error: null };
    } else {
        return { success: false, error: "Player already registered" };
    }
}


function getPlayer(name) {
    return playersDB[name] || null;
}

// 📌 Обновить победы игрока
function updateWins(name) {
    if (playersDB[name]) {
        playersDB[name].wins += 1;
    }
}

// 📌 Получить список всех игроков
function getAllPlayers() {
    return playersDB;
}

export { registerPlayer, getPlayer, updateWins, getAllPlayers };