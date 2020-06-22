module.exports = (io) => {
    io.on('connection', (socket) => { // 웹소켓 연결 시
        console.log('Socket initiated!');
        socket.on("broadcast", function (data) {
            console.log("broadcast!!");
            // chat 공간에 등록된 브라우저들에 특정 이벤트 수행
            io.sockets.in("chat").emit('recMsg', data);
        });
    });
};