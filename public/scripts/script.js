let socket = io()

let usernameElement = document.getElementById('username')
let startRoom = document.getElementById('start-room')
let joinRoom = document.getElementById('join-room')
let roomIdElement = document.getElementById('room-id')

let start = document.getElementById('start')
let game = document.getElementById('game')

let c = document.getElementById('c')
let cs = document.getElementById('cs')
let d = document.getElementById('d')
let ds = document.getElementById('ds')
let e = document.getElementById('e')
let f = document.getElementById('f')
let fs= document.getElementById('fs')
let g = document.getElementById('g')
let gs = document.getElementById('gs')
let a = document.getElementById('a')
let as = document.getElementById('as')
let b = document.getElementById('b')

let plus = document.getElementById('plus')
let minus = document.getElementById('minus')

let octavaElement = document.getElementById('octava')
let pointsElement = document.getElementById('points')

let owner = document.getElementById('owner')

let usersList = document.getElementById('users')

let octava = 4, points = 0

let username

let users = []

let el = (tag, data) => {
    let e = document.createElement(tag)
    e.innerHTML = data.text
    for (let a in data.attrs) e.setAttribute(a, data.attrs[a])
    return e
}

startRoom.addEventListener('click', (e) => {
    let roomId = roomIdElement.value
    username = usernameElement.value
    console.log(username)
    
    console.log(roomId)
    socket.emit('create room', roomId, username)

    Tone.start()
})

joinRoom.addEventListener('click', (e) => {
    let roomId = roomIdElement.value
    username = usernameElement.value
    console.log(username)

    console.log(roomId)
    socket.emit('join room', roomId, username)

    Tone.start()
})


c.addEventListener('click', (e) => {
    socket.emit('note', 'C' + octava) 
})
cs.addEventListener('click', (e) => {
    socket.emit('note', 'C#' + octava) 
})
d.addEventListener('click', (e) => {
    socket.emit('note', 'D' + octava) 
})
ds.addEventListener('click', (e) => {
    socket.emit('note', 'D#' + octava) 
})
e.addEventListener('click', (e) => {
    socket.emit('note', 'E' + octava) 
})
f.addEventListener('click', (e) => {
    socket.emit('note', 'F' + octava) 
})
fs.addEventListener('click', (e) => {
    socket.emit('note', 'F#' + octava) 
})
g.addEventListener('click', (e) => {
    socket.emit('note', 'G' + octava) 
})
gs.addEventListener('click', (e) => {
    socket.emit('note', 'G#' + octava) 
})
a.addEventListener('click', (e) => {
    socket.emit('note', 'A' + octava) 
})
as.addEventListener('click', (e) => {
    socket.emit('note', 'A#' + octava) 
})
b.addEventListener('click', (e) => {
    socket.emit('note', 'B' + octava) 
})

plus.addEventListener('click', (e) => {
    if (octava < 5) {
        octava++
        octavaElement.innerHTML = octava
    }
})
minus.addEventListener('click', (e) => {
    if (octava > 1) {
        octava--
        octavaElement.innerHTML = octava
    }
})

socket.on('note', (note) => {
    //create a synth and connect it to the main output (your speakers)
    const synth = new Tone.Synth().toDestination();

    //play a middle 'C' for the duration of an 8th note
    synth.triggerAttackRelease(note, "8n");
})

socket.on('answer', (result) => {
    if (result) {
        points++
    } else {
        points--
    }
    document.getElementById('points-' + username).innerHTML = points
})

socket.on('joined', (usersInRoom) => {
    start.style.display = 'none'
    game.style.display = 'block'

    usersInRoom.forEach(user => {
        users.push(user)

        usersList.appendChild(el('li', {
            'text': `<span>${user.username}</span> <span id="points-${user.username}">0</span>`,
            'attrs': {
                'id': 'user-' + user.username,
                'class': 'you'
            }
        }))
    })

    console.log(usersInRoom)
    console.log(users)
})

socket.on('you are the owner', () => {
    owner.style.display = 'block'
    //document.getElementById('')
})

socket.on('user joined', (username) => {
    users.push[username]

    usersList.appendChild(el('li', {
        'text': `<span>${username}</span> <span id="points-${username}">0</span>`,
        'attrs': {
            'id': 'user-' + username
        }
    }))

    console.log('The user ' + username + ' has joined.')
})

socket.on('user disconnected', (username) => {
    document.getElementById('user-' + username).remove()
})