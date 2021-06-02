const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const roomUsers = document.getElementById('users')

// Get username and room from url
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
})

console.log(username, room)

const socket = io()

// Join Chat Room
socket.emit('joinRoom', { username, room })

// Get room specific users
socket.on('roomUsers', ({ room, users }) => {
  outputRoom(room)
  outputUsers(users)
})

socket.on('message', message => {
  console.log(message)
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
