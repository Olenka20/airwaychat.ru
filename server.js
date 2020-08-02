const express = require('express');
const app = express();
const server = require('http').Server(app);
const {join} = require('path');
const io = require('socket.io')(server);

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
        let {name , room} = data;
        if(!rooms[room]) {
            rooms[room] = {
                players: [socket.id]
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
    });

    socket.on('msg', msg => {
        let {name, room} = players[socket.id];
        socket.broadcast.to(room).emit('msg', {name, msg});
    });

    socket.on('disconnect', () => {
        try {
            let {name, room} = players[socket.id];
            delete players[socket.id];
            if(rooms[room].players.length == 1) {
                delete rooms[room];
            } else {
                rooms[room].players = rooms[room].players.filter(id => id != socket.id);
            }
            io.to(room).emit('status', {'status': 'left', 'name': name});
            socket.disconnect(true);
        } catch {}
    });
});