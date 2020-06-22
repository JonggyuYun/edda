var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var _DBPool = require('../../lib/DBPool');
var fs = require("fs");
var config = require('../../lib/config');
const http = require('http');
const socketio = require('socket.io');
const socketEvents = require('../../lib/socket.js'); // 추가
// http의 createServer에서 사용할 때 express를 매개변수로 넣어준다.
const server = http.createServer(express);

server.listen(3000, function(){
    console.log("Server running 3000");
});

// 연결할 http 서버 객체 매개변수로 사용해 소켓 연결
// src에서 이 객체를 사용한다.
const io = socketio.listen(server);
//socketEvents(io); // 아까 만든 이벤트 연결

// on : 이벤트를 만들어라 connection은 예약어
io.on('connection', function(socket){

    console.log("socket connection : " + socket.id);


    // broadcast라는 메소드 socket 통해 호출되면 매개변수로 전달된 data와 함께 적당한 로직 수행
    socket.on("broadcast", function (data) {
            console.log("broadcast!!");
            // chat 공간에 등록된 브라우저들에 특정 이벤트 수행
    io.emit('recMsg', data);
        });
});


/* GET users listing. */

router.use(function(req, res, next) {
    var sess = req.session;
    console.log(sess.cmp_id);

    if(sess.cmp_id == 'undefined'){
        res.redirect('/manager/users/login');
    }else{
        res.locals.cmp_id = sess.cmp_id;
        res.locals.cmp_type = sess.cmp_type;
        res.locals.cmp_expired = sess.cmp_expired;
        next();
    }
});

function checkLogin(req, res, next) {
    console.log(":::::::::checkLogin::::::::::");
     var sess = req.session;
        console.log(sess.cmp_id);
     if(sess.cmp_id == null){
         console.log("HERE?");
        res.redirect('/users/login');
     }else{
         
         next();
     }
}


function selectMemberCount(req, res, next) {
    console.log(":::::::::selectMemberCount::::::::::");

    var sess = req.session;
    console.log(sess.cmp_idx);

    _DBPool.query("select count(*) as memberCount from visit where cmp_idx = ? ",[sess.cmp_idx],function(err, rows, columns) {
        //_DBPool.end();
 
        if (err) {
            return res.end("QUERY ERROR: " + err);
        }
        req.memberCount = rows[0].memberCount;
        console.log("req.memberCount:"+req.memberCount);
        next();   
    });
}

/*function selectCommentList(req, res, next) {
    console.log(":::::::::selectCommentList::::::::::");

    var sess = req.session;
    console.log(sess.cmp_id);


    var query  = "select idx,board_idx, name, email, concat(substr(replace(comment,'<br/>','\n'),1,15),'...') as comment, date_format(cre_dtime,'%Y-%m-%d') cre_dtime  from tb_board_comment ";
        query += "where board_idx in (";
        query += "select idx from tb_board where cre_id = ?";
        query += ") order by cre_dtime desc";

        console.log("query:"+query);

    _DBPool.query(query,[sess.cmp_id],function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            return res.end("QUERY ERROR: " + err);
        }
        req.commentList = rows;
        next();



    });
}*/

/*function selectExpireDateCheck(req, res, next) {
     console.log(":::::::::selectExpireDateCheck::::::::::");
    var sess = req.session;
    console.log(sess.cmp_idx);
    _DBPool.query("select DATEDIFF(expired_date,now()) as expiredCount from tb_company where cmp_idx = ?",[sess.cmp_idx],function(err, rows, columns) {
        //_DBPool.end();
 
        if (err) {
          return res.end("QUERY ERROR: " + err);
        }
        req.expiredCount = rows[0].expiredCount;
        console.log("req.expiredCount:"+req.expiredCount);
       next();
   });
}

function selectNewContactCount(req, res, next) {
    console.log(":::::::::selectNewContactCount::::::::::");
    var sess = req.session;
    console.log(sess.cmp_idx);
    _DBPool.query("select count(*) as newContactCount from contact where cmp_idx = ? AND readCnt = 0",[sess.cmp_idx],function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            return res.end("QUERY ERROR: " + err);
        }
        req.newContactCount = rows[0].newContactCount;
        console.log("req.newContactCount:"+req.newContactCount);
        next();
    });
}
*/



function renderIndex(req, res) {
    console.log(":::::::::renderIndex::::::::::");
    var sess = req.session;
    console.log(sess.cmp_id);
    res.redirect('/');
	//var lang = req.body.lang;
	//var lang = en;
    //res.render('index',{title : "메인화면"}); 
    //location.href="/member";
/*                               commentList : req.commentList,
                           newContactCount : req.newContactCount,
                           expiredCount : req.expiredCount,
				           lang			: lang*/
    
}


router.get('/', checkLogin, renderIndex);
//router.get('/', checkLogin, selectExpireDateCheck, renderIndex);

/*router.get('/ana', function (req, res) {


    res.render('ana');


});*/

module.exports = router;
