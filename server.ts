import path from 'path'
import http from 'http'
import express from 'express'
import { Server, Socket } from 'socket.io'
import { PeerServer } from 'peer';
import formatMessage from './utils/message'
import { User, getCurrentUser, userJoin, getRoomUsers, userLeave } from './utils/users'

const app = express()
const server = http.createServer(app)

const io = new Server(server)

// Peer Server 
const peerServer = PeerServer({
    port: 7001,
    path: '/'
});


const botname: string = 'Admin'



// Set client folder
app.use(express.static(path.join(__dirname, 'static')))

// Run when cliens conntec
io.on('connection', (socket: Socket) => {
    socket.emit('id-merge', socket.id)
    console.log('New Socket Connection')
    socket.on('joinRoom', ({ username, room }: { username: string, room: string, socketId: string }) => {

        const user = userJoin(socket.id, username, room)

        // Add user to room
        socket.join(user.room)

        // Welcome Connecting User Only
        socket.emit('message', formatMessage(botname, `Welcome ${user.username} at ${user.room} chat room`))


        // Listen Chat Messages From Clients
        socket.on('chatMessage', (msg: string) => {
            const user: User | undefined = getCurrentUser(socket.id)
            io.to(user!.room).emit('message', formatMessage(user!.username, msg))
        })

        // when someone disconnects inform all
        socket.on('disconnect', () => {
            const user = userLeave(socket.id)
            if (user) {
                io.to(user.room).emit('message', formatMessage(botname, `${user.username} Diconnected`))

                // Update Again User And Room Info Realtime
                io.to(user.room).emit('roomUsers', {
                    room: user.room,
                    users: getRoomUsers(user.room)
                })
            }
            // io.to(user!.room).emit('message', formatMessage(botname, `${user!.username} Diconnected`))
        })

        // when user connects inform all
        socket.broadcast.to(user.room).emit('message', formatMessage(botname, `${user.username} is Joining Chat`))

        // User And Room Info Realtime
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })

        socket.on('peerId', id => {
            // console.log(id)
            socket.broadcast.to(user.room).emit('video-call-connect', id)
            peerServer.on('disconnect', (client: any) => {
                console.log('disconnected client ', client.id)
                socket.broadcast.to(user.room).emit('video-call-ended', client.id)
            });

        })
        socket.on('call-initiate', id => {
            // console.log(id)
            socket.emit('call-now', 'call-now')
        })
        socket.on('disconnected', msg => {
            console.log(msg)

        })
    })
    // socket.emit('message', formatMessage(botname, 'Welcome'))

    // socket.broadcast.emit('message', formatMessage(botname, 'A User Joining'))


    // socket.on('disconnect', () => {
    //     io.emit('message', formatMessage(botname, 'A User Diconnected'))
    // })
    // socket.on('chatleave', (args) => {
    //     io.emit('message', formatMessage(botname, args))
    // })



})

const PORT = 7000 || process.env.PORT

server.listen(PORT, () => console.log(`Server Running On PORT ${PORT}`))

