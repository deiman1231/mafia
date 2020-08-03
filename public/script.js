const socket = io('https://mafia-go.herokuapp.com/')
const videoGrid = document.getElementsByClassName('grid-container')
const myPeer = new Peer(undefined, {
  host: 'mafia-go.herokuapp.com/',
  port: '443',
  secure: true
})
const myVideo = document.getElementById('video1')
myVideo.muted = true
const peers = {}
var clients = 1

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream)

  myPeer.on('call', call => {
    call.answer(stream)
    clients++
    const video = document.getElementById('video' + clients.toString())
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
  clients--
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  clients++
  const video = document.getElementById('video' + clients.toString())
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
}