// Declarem el socket
let socket = io()

// Declarem els diferents elements i variables que utilitzarem

let usernameElement = document.getElementById('username')
let startRoom = document.getElementById('start-room')
let joinRoom = document.getElementById('join-room')
let roomIdElement = document.getElementById('room-id')
let startGame = document.getElementById('start-game')
let randomButton = document.getElementById('random')

let start = document.getElementById('start')
let game = document.getElementById('game')

let usernameContainer = document.getElementById('username-container')
let decideContainer = document.getElementById('decide-container')
let roomIdContainer = document.getElementById('roomid-container')

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

let username, action

let users = []

// Creem el nostre piano
const sampler = new Tone.Sampler({
	urls: {
		"C4": "C4.mp3",
		"D#4": "Ds4.mp3",
		"F#4": "Fs4.mp3",
		"A4": "A4.mp3",
	},
	release: 1,
	baseUrl: "../extra/piano/",
}).toDestination();

// Aquesta funció ens tornarà un HTMLElement, amb el text i atributs desitjats
let el = (tag, data) => {
    let e = document.createElement(tag)
    e.innerHTML = data.text
    for (let a in data.attrs) e.setAttribute(a, data.attrs[a])
    return e
}

// Afegim els diferents eventListeners

// Quan s'actualitzi el nom d'usuari, mostra els altres botons
usernameElement.addEventListener('input', () => {
    decideContainer.style.display = (usernameElement.value) ? 'flex' : 'none'
    if (roomIdContainer.style.display = 'flex' && !usernameElement.value) {
        roomIdContainer.style.display = 'none'
    }
})

// Quan es premi el botó de començar la sala, l'acció és create, i mostra el div per posar l'id
startRoom.addEventListener('click', (e) => {
    action = 'create'
    roomIdContainer.style.display = 'flex'

    startRoom.classList.add('active')
    if (joinRoom.classList.contains('active')) {
        joinRoom.classList.remove('active')
        if (randomButton.classList.contains('hidden')) {
            randomButton.classList.remove('hidden')
        }
    }
})

// Quan es premi el botó d'unir-se a la sala, l'acció és join, i mostra el div per posar l'id
joinRoom.addEventListener('click', (e) => {
    action = 'join'
    roomIdContainer.style.display = 'flex'

    joinRoom.classList.add('active')
    if (startRoom.classList.contains('active')) {
        startRoom.classList.remove('active')
    }
    if (!randomButton.classList.contains('hidden')) {
        randomButton.classList.add('hidden')
    }
})

// Quan es premi el botó per començar el joc, agafa l'id i comença o uneix-te a la sala
startGame.addEventListener('click', (e) => {
    let roomId = roomIdElement.value
    username = usernameElement.value

    socket.emit(`${action} room`, roomId, username)

    Tone.start() // Necessari per poder reproduir sonx
})

let notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// EventListeners per a cada tecla
Array(c, cs, d, ds, e, f, fs, g, gs, a, as, b).forEach((element, index) => {
    element.addEventListener('mousedown', () => {
        socket.emit('note', notes[index] + octava)
    })
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

randomButton.addEventListener('click', () => {
    let randomWord = ''
    for (let i = 0; i < 5; i++) randomWord += randomChar().toUpperCase()
    roomIdElement.value = randomWord
})

socket.on('note', (note) => {
    //create a synth and connect it to the main output (your speakers)
    const synth = new Tone.Synth().toDestination();

    //play a middle 'C' for the duration of an 8th note
    sampler.triggerAttackRelease(note, "8n");
})

socket.on('answer', (socketUsername, result, points) => {
    if (socketUsername == username) {
        console.log(result)
    }
    document.getElementById('points-' + socketUsername).innerHTML = points
    console.log(document.getElementById('points-' + socketUsername))
    console.log(points)
})

socket.on('joined', (usersInRoom) => {
    start.style.display = 'none'
    game.style.display = 'block'

    usersInRoom.forEach(user => {
        users.push(user)

        usersList.appendChild(el('li', {
            'text': `
                <span>
                    ${user.owner ? '<i class="fa-solid fa-crown"></i> ' : ''}
                    ${user.username}</span> 
                <span id="points-${user.username}">${user.points}</span>`,
            'attrs': {
                'id': 'user-' + user.username,
                'class': 'user ' + ((user.owner) ? 'owner' : '')
            }
        }))

        console.log((user.owner ? 'owner' : '') + ' user ')
    })

    document.getElementById('user-' + username).classList.add('you')

    //console.log(usersInRoom)
    //console.log(users)
})

socket.on('new owner', (ownerUsername, show) => {
    if (ownerUsername == username) {
        owner.style.display = 'block'
    }
    // Si show és true vol dir que s'ha creat la sala ara mateix, per tant, NO cal que torni a posar la corona
    if (show) {
        document.getElementById('user-' + ownerUsername).children[0].innerHTML = '<i class="fa-solid fa-crown"></i> ' + document.getElementById('user-' + ownerUsername).children[0].innerHTML
        document.getElementById('user-' + ownerUsername).classList.add('owner')
    }
})

socket.on('user joined', (username) => {
    users.push[username]

    usersList.appendChild(el('li', {
        'text': `
            <span>${username}</span> 
            <span id="points-${username}">0</span>`,
        'attrs': {
            'id': 'user-' + username,
            'class': 'user'
        }
    }))

    console.log('The user ' + username + ' has joined.')
})

socket.on('username already in use', () => {
    alert('This username is already in use!')
})

socket.on('user disconnected', (username) => {
    document.getElementById('user-' + username).remove()
})

function randomChar() {
    const alphabet = "abcdefghijklmnopqrstuvwxyz1234567890"
    return alphabet[Math.floor(Math.random() * alphabet.length)]
}
