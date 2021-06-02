interface User {
    id: string, username: string, room: string
}

const totalUsers: User[] = [];

// join user to chat

function userJoin(id: string, username: string, room: string): User {
    const user: User = { id, username, room }

    totalUsers.push(user)

    return user
}

function getCurrentUser(id: string): User | undefined {
    return totalUsers.find(user => user.id === id)
}

// User Leaves
function userLeave(id: string): User | undefined{
    const index: number = totalUsers.findIndex(user => user.id === id)
    if (index !== -1) {
        return totalUsers.splice(index, 1)[0]
    }
}

// Get Room Specific Users
function getRoomUsers(room: string) {
    return totalUsers.filter(user => user.room === room)
}

export { User, totalUsers, userJoin, getCurrentUser, userLeave, getRoomUsers }