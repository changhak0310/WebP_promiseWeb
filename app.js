// 모듈 불러오기 //
const fs = require('fs');
const express = require('express');
const socket = require('socket.io');
const path = require('path');
const http = require('http');

// express 객체 생성 및 express http 서버 생성 //
const app = express();
//const app = require('express')();
const server = http.createServer(app);

// 서버를 socket.io로 업그래이드(실시간 서버) //
const io = socket(server);
//const io = require('socket.io')(server);

// express 정적 파일 제공 //
app.use(express.static(__dirname+'/public'));
//sendFile - app.use(express.static(path.join(__dirname+'/public')));
//(마운트 경로) - app.use('/stylesheets', express.static('./public/stylesheets'));
//(마운트 경로) - app.use('/javascripts', express.static('./public/javascripts'));

//req - 클라이언트에서 전달된 정보
//res - 클라이언트에세 응답을 위한 정보
// app.get('/', function(req, res){
//     res.sendFile(__dirname + '/public/index.html');
//     console.log('html 불러옴');
// })
app.get('/', function(req, res){
    fs.readFile('./public/index.html', function(err, data){
        if(err){
            res.send(err);
        } else {
            res.writeHead(200, {'Content-Type':'text/html'});
            res.write(data);
            res.end();
        }
    })
})
// app.get('/about', function(req, res){
//     res.send('<h1>this is about page</h1>')
// })

//connection될 시 콜백
io.on('connection', function(socket){
    // 새로운 유저가 접속했을 때 다른 소켓에게도 알려줌 //
    socket.on('newUser', function(name){
        console.log(name + '님이 접속하였습니다.');

        //socket에 클라이언트 정보 저장
        socket.name = name;

        socket.broadcast.emit('update', {type: 'connect', name: 'SERVER', message: name + '님이 접속하였습니다.'})
    })
    //접속하면
    // socket.on('login', function(data){
    //     console.log('Client logged-in:/n name : ' + data.name + '/n userid : ' + data.userid);

    //     //socket에 클라이언트 정보 저장
    //     socket.name = data.name;
    //     socket.userid = data.userid;

    //     // 접속된 모든 클라이언트에 메세지 전송
    //     io.emit('login', data.name);
    // })

    //메세지를 보내면
    socket.on('message', function(data){
        // 누가 보냈는지 이름 추가
        data.name = socket.name;

        console.log(data);

        // 보내사람 제외 나머지유저에게 메세지 전송
        socket.broadcast.emit('update', data);
    });

    // socket.on('chat', function(data){
    //     console.log('Message from ' + socket.name + ' : ' + data.msg);
        
    //     var msg = {
    //         from: {
    //             name: socket.name,
    //             userid: socket.userid
    //         },
    //         msg: data.msg
    //     };
    //     //메세지를 전송한 클라이언트를 제외한 모든 클라이언트에게 메세지 전송
    //     socket.broadcast.emit('chat, msg');

    //     // 메세지를 전송한 클라이언트에게만 메세지 전송
    //     socket.emit('s2c chat', msg);

    //     // 접속된 모든 클라이언트에 메세지 전송
    //     io.emit('s2c chat', msg);

    //     //특정 클라이언트에게만 메세지를 전송
    //     io.to(id).emit('s2c chat', data);
    // });

    //접속이 종료되면
    socket.on('disconnect', function(){
        console.log('접속 종료 - ' + socket.name);

        //나가는 사람을 제외한 나머지 사람
        socket.broadcast.emit('updata', {type: 'disconnect', name: 'SERVER', message: socket.name + '님이 나가셨습니다.'});
    });
});

//서버 실행 시
server.listen(3000, function(){
    console.log('서버 실행');
});