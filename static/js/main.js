const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const roomUsers = document.getElementById('users')
const videoGrid = document.getElementById('video-grid')

// Get username and room from url
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
})

console.log(username, room)

const socket = io()
const myPeer = new Peer({
  host: 'localhost',
  port: '7001',
  // debug: 3
})

myPeer.on('open', id => {
  socket.emit('peerId', id)
  console.log('fresh ID: ', id)
})

myPeer.on('disconnected', () => {
  socket.emit('disconnected', 'disconnected already')
  console.log('someone disconnected event disconnected')
})
myPeer.on('error', err => {
  alert(err)
})

const peerConnections = {}
socket.on('video-call-ended', id => {
  console.log('video-chat-ended')
  console.log('video-call-ended ID: ', id)
  console.log(peerConnections[id])
  if (peerConnections[id]) {
    peerConnections[id].close()
    console.log(peerConnections[id])
    // myPeer.destroy()
    delete peerConnections[id]
  }
})

const myVideo = document.createElement('video')
myVideo.muted = true

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true
  })
  .then(async stream => {
    addVideoStream(myVideo, stream)
    socket.on('video-call-connect', userId => {
      connectToNewUser(userId, stream)
    })
  })

myPeer.on('call', call => {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then(stream => {
      call.answer(stream)
      const video = document.createElement('video')

      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
        peerConnections[call.provider.id] = call
        console.log(peerConnections)
        console.log('onCall', call.provider.id)
      })
    })
})

function addVideoStream (video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}

function connectToNewUser (userId, stream) {
  const call = myPeer.call(userId, stream)
  peerConnections[userId] = call
  console.log(peerConnections)
  console.log('newUser', userId)
  const video = document.createElement('video')
  call.on(
    'stream',
    remoteStream => {
      addVideoStream(video, remoteStream)
      console.log('call stream')
    },
    err => console.log(err)
  )
  call.on('close', () => {
    video.remove()
  })
}

// Join Chat Room
socket.emit('joinRoom', { username, room })

// Get room specific users
socket.on('roomUsers', ({ room, users }) => {
  outputRoom(room)
  outputUsers(users)
})

socket.on('message', message => {
  // console.log(message)
  outputMessage(message)

  // Scroll Message
  chatMessages.scrollTop = chatMessages.scrollHeight
})

// Message submitting
chatForm.addEventListener('submit', e => {
  e.preventDefault()
  const msg = e.target.elements.msg.value
  //   console.log(msg)

  // Emit message into server
  socket.emit('chatMessage', msg)

  // clear inputs
  e.target.elements.msg.value = ''
  e.target.elements.msg.focus()
})

function outputMessage (message) {
  const div = document.createElement('div')
  div.classList.add('message')
  div.innerHTML = `<div class="message">
    <p class="meta">${message.username}: <span>@ ${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>
    </div>`

  chatMessages.appendChild(div)
}

function outputRoom (room) {
  roomName.innerText = room
}

function outputUsers (users) {
  roomUsers.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
  `
}
