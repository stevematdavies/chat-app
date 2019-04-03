const users = [];

const addUser = ({id, username, room}) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if(!username || !room) {
        return {
            error: 'Username and Room are required!'
        }
    }

    const userExists = users.find(u => u.room === room && u.username === username);

    if(userExists) {
        return {
            error: 'Username is in use'
        }
    }

    const user = { id, username, room }
    users.push(user)
    return { user };
}

const getUser = id =>  users.find(u => u.id === id);

const removeUser = id => {
   const index = users.findIndex(u => u.id === id);
   if (index > -1) {
        return users.splice(index, 1)[0];
   }
}

const getUsersForRoom = room => {
    room = room.trim().toLowerCase();
    return users.filter(user => user.room === room);
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersForRoom
};
