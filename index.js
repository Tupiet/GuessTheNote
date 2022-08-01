// TODO: User points must be seen by everyone
const express = require('express')
const app = express()
const http = require('http')
const path = require('path')
const server = http.createServer(app)
const { Server, Socket } = require('socket.io')
const io = new Server(server) 

app.use(express.static(path.join(__dirname, '/public')))

let rooms = []

io.on('connection', (socket) => {
    console.log('The user ' + socket.id + ' has been connected. ')

    // Quan un usuari s'estigui desconnectant
    socket.on("disconnecting", () => {
        // Si hi ha alguna sala
        if (rooms.length > 0) {
            // Agafem l'índex de la sala on està l'usuari, sinó, serà -1
            let index = getRoomIndex(socket.id, rooms) ?? -1
            
            // Detectem si l'usuari és l'owner o no
            let roomOwner = rooms.some(room => room.owner.id == socket.id)
            
            // Agafem la sala on està l'usuari
            let room = rooms[index]
    
            //console.log(room.id + ' ' + index)

            // Si tot ha anat bé, i tenim la sala de l'usuari
            if (index != -1) {
                // Si l'usuari està amb gent
                if (room.users.length > 1) {
                    // Si és l'owner
                    if (roomOwner) {
                        let newOwner = room.users[1]
                        // Canvia l'owner al següent
                        room.owner = newOwner.socket

                        newOwner.socket.emit('you are the owner')

                        console.log('The owner is: ' + newOwner.socket.id)
                    }

                    let userDisconnecting = room.users.find(user => user.id == socket.id)

                    io.to(room.id).emit('user disconnected', userDisconnecting.username)
                    
                    // Elimina l'usuari de l'array users
                    console.log('Intento modificar l\'array d\'usuaris')
                    room.users = room.users.filter(r => r.socket.id != socket.id)
    
                    // Actualitza la sala
                    rooms[index] = room
                } 
                // Si està sol
                else {
                    // Borra la sala
                    rooms.splice(index, 1)
                }
            }
        }
    })
    
    // Quan rebi una nota (pot ser de l'owner o dels altres)
    socket.on('note', (note) => {
        // Si hi ha alguna sala
        if (rooms.length > 0) {
            // Agafem l'índex de la sala on està l'usuari, sinó, serà -1
            let index = getRoomIndex(socket.id, rooms) ?? -1
            // Agafem la sala
            let room = rooms[index]
            
            console.log('Note received! ' + note)
    
            // Si l'owner de la sala és l'usuari que ha enviat la nota
            if (room.owner.id == socket.id) {
                // Actualitza la última nota tocada a la sala
                room.current_note = note
                // Envia a tots la nota
                io.to(room.id).emit('note', note)
                room.users.forEach(user => {
                    user.has_pressed_note = false
                });
            }
            // Si no ho és (per tant, és un usuari normal)
            else {
                // Agafem l'usuari que ha espitxat el botó
                let user = room.users.find(u => u.socket.id == socket.id)

                // Si l'usuari encara no havia premut cap nota
                if (!user.has_pressed_note) {
                    // Guarda la puntuació de l'usuari
                    (note == room.current_note) ? user.points++ : user.points--

                    // L'usuari ha seleccionat una nota
                    user.has_pressed_note = true

                    // Envia la resposta (true o false) al client que ha enviat la nota
                    socket.emit('answer', note == room.current_note)
                    // Toca la nota
                    socket.emit('note', note)

                }
                
            }
        }
    })

    // Quan rebis la petició de crear una sala
    socket.on('create room', (roomId, username) => {
        // Assigna el prefix 'room - ' a la sala
        roomId = 'room - ' + roomId

        // Si no existeix la sala
        if (!rooms.some(room => room.id == roomId)) {
            // Crea la sala amb les dades necessàries
            let room = {
                'id': roomId,
                'current_note': null,
                'owner': socket,
                'users': [ 
                    {
                        'id': socket.id,
                        'username': username,
                        'points': 0,
                        'socket': socket,
                        'has_pressed_note': false
                    }
                ]
            }
            // Afegeix-la a les sales i uneix a l'usuari, que serà l'owner
            rooms.push(room)
            socket.join(roomId)

            // Digues que s'ha unit l'usuari a la sala i que és l'owner
            socket.emit('joined', [{
                'username': username,
                'owner': true
            }])
            socket.emit('you are the owner')

            console.log('Room created! The id is: ' + roomId)
            console.log('The user ' + socket.id + 'with the username ' + username + ' is the owner of the room.')
        } else {
            console.log('The room already exists.')
        }
    })

    // Quan rebis la petició d'unir-te a una sala
    socket.on('join room', (roomId, username) => {
        // Assigna el prefix 'room - ' a la sala
        roomId = 'room - ' + roomId

        // Si no existeix la sala
        if (rooms.some(room => room.id == roomId)) {
            // Uneix l'usuari a la sala
            socket.join(roomId)
            
            console.log('The user with id ' + socket.id + 'with the username ' + username + ' has been joined to the room: ' + roomId)
            
            // Agafem la sala desitjada de rooms
            let room = rooms.find(room => room.id == roomId)
            // Afegim el socket a l'array users
            room.users.push({
                'id': socket.id,
                'username': username,
                'socket': socket,
                'has_pressed_note': false
            })

            // Digues que s'ha unit l'usuari a la sala
            let usersInRoom = []
            room.users.forEach(user => {
                usersInRoom.push({
                    'username': user.username,
                    'owner': user.id == room.owner.id
                })
            })

            socket.emit('joined', usersInRoom)
            socket.broadcast.to(room.id).emit('user joined', username)
        } else {
            console.log('Room doesn\'t exist')
        }
    })
})

// Posem el server en funcionament, al port 85
server.listen(85, () => {
    console.log('Connected')
})

// Aquesta funció agafarà l'índex de la sala on estava un usuari determinat
function getRoomIndex(id, rooms) {
    for (let i = 0; i < rooms.length; i++) {
        // Per cada usuari a la sala
        for (let j = 0; j < rooms[i].users.length; j++) {
            // Si la seva id és igual a la de l'usuari, és perquè hem trobat la sala on està (o estava)
            if (rooms[i].users[j].socket.id == id) {
                return i // Retorna l'índex
            }
        }
    }
}