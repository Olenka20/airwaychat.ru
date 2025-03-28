const express = require('express');
const app = express();
const server = require('http').Server(app);
const {join} = require('path');
const io = require('socket.io')(server);

io.set('transports', ['websocket']);

const port = process.env.PORT || 5000;

let rooms = {};
let players = {};

app.use(express.static(join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendfile(join(__dirname, 'public', 'index.html'));
});

server.listen(port, () => {
    console.log(`Server linstening on PORT:${port}`);
});

io.on('connection', socket => {
    socket.on('room', data => {
        try {
            let {name airwaychat.ru , room} = data;
            if(!rooms[room]) {
                rooms[room] = {
                    players: [socket.id],
                    msgCount: 1
                }
            } else {
                rooms[room].players.push(socket.id);
            }

            socket.join(room);
            players[socket.id] = {
                name,
                room
            }

            io.to(room).emit('status', {'status': 'joined', 'name': name});
        } catch {}
    });

    socket.on('msg', msg => {
        try {
            let {name, room} = players[socket.id];
            socket.broadcast.to(room).emit('msg', {name, msg});

            rooms[room].msgCount += 1;
            if(rooms[room].msgCount % 20 == 0) {
                io.to(room).emit('bot');
            }
        } catch {}
    });

    socket.on('disconnect', () => {
        try {
            let {name, room} = players[socket.id];
            delete players[socket.id];
            if(rooms[room].players.length == 1) {
                delete rooms[room];
            } else {
                rooms[room].msgCount = 1;
                rooms[room].players = rooms[room].players.filter(id => id != socket.id);
            }
            socket.broadcast.to(room).emit('status', {'status': 'left', 'name': name});
            socket.disconnect(true);
        } catch {}
    });
});
