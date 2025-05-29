function generateRoomID() {
    return `room_${Math.random().toString(36).substr(2, 10)}`;
}

export { generateRoomID}
