
var express = require('express');
var router = express.Router();
var passport = require('passport');
var crypto = require('crypto');
var ciphers = crypto.getCiphers();
var _DBPool = require('../lib/DBPool');
var config = require('../lib/config');
var configJs = require('../lib/config.json');
var common = require('./admin/common');
const upload = require('../lib/local_upload_util');
var FCM = require('fcm-push');
var serverKey = 'AAAArlstieY:APA91bHFcYCWYbJo2BMhRU3K9efjXrCP6AfRTOd8njVm2K_ge-Gyt0Q4oMm8pA556gomcMxF4PgBGnmHwfdRcBiQyDPQSb5wS6GS7gE8tn-mTiBuBcDz5Qtem8ln1xgm-F0Bb8QVP1Zn'; //put your server key here
var fcm = new FCM(serverKey);
var nodemailer = require('nodemailer');
var async = require('async');
var ejs = require("ejs");





/* S3 Upload Start */
var fs = require('fs');
var s3 = require('../lib/S3Manager');
var multer  = require('multer');
var S3FS = require('s3fs');
var async = require('async');
var bucketPath = 'ydi.company';

var s3Options = {
    aaccessKeyId: configJs.accessKeyId,
    secretAccessKey: configJs.secretAccessKey,
    "region": configJs.region

};
var client_id = config.naver_client_id;//개발자센터에서 발급받은 Client ID
var client_secret = config.naver_client_secret; //개발자센터에서 발급받은 Client Secret
var code = "0";

var fsImpl = new S3FS(bucketPath, s3Options);

const fetch = require('isomorphic-fetch');

const handleSend = (req, res) => {
    const secret_key = "6LcugM8UAAAAAJtLT5imWjve3Uh5Uw2aVi-LHt6k";
    const token = req.body.token;
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${token}`;

    fetch(url, {
        method: 'post'
    })
        .then(response => response.json())
        .then(google_response => res.json({ google_response }))
        .catch(error => res.json({ error }));
};


router.post('/send', handleSend);

router.use(function(req, res, next) {
    var sess = req.session;
    console.log("member:"+sess.member_id);
    if(sess.member_id == null){
        console.log("member: session is undefiend");
        //  res.redirect('/manager/users/login');
        res.locals.whoami = null;
        res.locals.memberName = null;
        res.locals.authType = null;
        res.locals.memberPhone = null;

    }else{
        console.log("member: session is not undefiend"+sess.member_auth_type);
        res.locals.whoami = sess.member_id;
        res.locals.authType = sess.member_auth_type;
        res.locals.memberName = sess.member_name;
        res.locals.memberPhone = sess.member_phone;
    }
    next();
});

/* GET home page. */
router.get('/',bannerList ,topBoard1, topBoard2, freeBoard,insertToken, function (req, res, next) {






    console.log('index');
    //sendPush(46, "test", "testasdfafd","B");
    //sendAdminSMS('문자테스트 -잇다-')
    res.render('main',{bannerList:req.bannerList, topBoard1: req.topBoard1, topBoard2: req.topBoard2});

});

router.get('/logout', function (req, res, next) {
    console.log('logout');

    var sess = req.session;

    var userSeq = sess.member_idx;

    const addr = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    console.log("addr:"+addr);

    console.log("userSeq:"+userSeq+ "addr:"+addr);

    var queryString = "update tb_token \n" +
        "set  member_seq = null, cre_date = now() \n" +
        "where  member_seq = ? and member_ip = ? ";
    _DBPool.query(queryString,[userSeq, addr],function(err, rows, result) {

        if(err){

            console.log("QUERY ERROR: " + err);

        }
        // next();

        req.session.destroy();
        res.clearCookie("keep");
        res.redirect('/');

    })


});


router.get('/login', function (req, res) {




    var sess = req.session;
    console.log("member:"+sess.member_id);

    var token = "-";

    var keep = req.cookies.keep;
    //token = req.cookies.token;
    if(keep){

        console.log("keep is on!");
        sess.member_id = keep.member_id;
        sess.member_name = keep.member_name;
        sess.member_idx = keep.member_idx;
        sess.member_phone = keep.member_phone;
        sess.member_auth_type = keep.member_auth_type;
    }

    if(sess.member_id){

        console.log("member_id:"+sess.member_id);
        res.redirect('/');

    }else{

    res.render('login');
    }

})

router.get('/:siteUrl', common.areaList, getCompany, function (req, res, next) {

    var sess = req.session;
    console.log("member:"+sess.member_id);


    var memeber_name = "";
    var memeber_email = "";
    var member_phone = "";
    var member_auth_type = "";
    if(sess != null){

        member_name = sess.member_name;
        member_email = sess.member_id;
        member_phone = sess.member_phone;
        member_auth_type = sess.member_auth_type;
    }

    console.log("member_phone:"+member_phone);

    var siteUrl = req.params.siteUrl;
    var boardTitle = "";
    var leftTitle = "";
    var rightTitle = "";
    var render = "";
    var leftLink = "";
    var rightLink = "";
    var keyword = "";
    var description = "";

    var key = "";
    var token = "-";

    console.log("siteUrl:"+siteUrl);

    if(siteUrl == 'apply01') { //기장대행

        boardTitle = "기장대행";
        leftTitle = "무료 세무상담";
        rightTitle = "신고대행";
        render = "apply01";
        leftLink = "apply02";
        rightLink = "apply06";
        keyword = "";
        description = "";
    }else if(siteUrl == 'apply02') { //신고대행

        boardTitle = "신고대행";
        leftTitle = "기장대행";
        rightTitle = "세무조사/불복";
            render = "apply02";
        leftLink = "apply01";
        rightLink = "apply03";
        keyword = "";
        description = "";
    }else if(siteUrl == 'apply03') { //세무조사/불복

        boardTitle = "세무조사/불복";
        leftTitle = "신고대행";
        rightTitle = "양도/상속/증여";
        render = "apply03";
        leftLink = "apply02";
        rightLink = "apply04";
        keyword = "";
        description = "";
    }else if(siteUrl == 'apply04') { //양도/상속/증여

        boardTitle = "양도/상속/증여";
        leftTitle = "세무조사/불복";
        rightTitle = "컨설팅/평가/감사";
        render = "apply04";
        leftLink = "apply03";
        rightLink = "apply05";
        keyword = "";
        description = "";
    }else if(siteUrl == 'apply05') { //컨설팅/평가/감사 기타랑 동일한 메뉴

        boardTitle = "컨설팅/평가/감사";
        leftTitle = "양도/상속/증여";
        rightTitle = "무료 세무상담";
        render = "apply05";
        leftLink = "apply04";
        rightLink = "apply06";
        keyword = "";
        description = "";
    }else if(siteUrl == 'apply06') { //무료 세무상담

        boardTitle = "무료 세무상담";
        leftTitle = "컨설팅/평가/감사";
        rightTitle = "기장대행";
        render = "apply06";
        leftLink = "apply05";
        rightLink = "apply01";
        keyword = "";
        description = "";

        key = req.key;


    }else if(siteUrl == 'pw') { //로그인


        render = "pw";
    }else if(siteUrl == 'leave') { //로그인


        render = "leave";



    }else if(siteUrl == 'company') { //로그인


        render = "company";

    }else if(siteUrl == 'counseling_list') { //세무상담실


        render = "counseling_list";
    }else if(siteUrl == 'story_list') { //세무잇다이야기


        render = "story_list";
    }else if(siteUrl == 'story_view') { //세무잇다이야기


        render = "story_view";
    }else if(siteUrl == 'counseling_write') { //세무잇다이야기

        key = "";
        render = "counseling_write";
    }else if(siteUrl == 'join') { //회원가입


        render = "join";
    }else if(siteUrl == 'accountant') { //회원가입


        render = "accountant";
    }else if(siteUrl == 'accountant_detail') { //회원가입


        render = "accountant_detail";
    }else if(siteUrl == 'join_info1') { //일반회원

        key = "";
        render = "join_info1";
    }else if(siteUrl == 'join_info2') { //제휴사 회원

        key = "";
        render = "join_info2";
    }else if(siteUrl == 'service') { //제휴사 회원


        render = "service";
    }else if(siteUrl == 'my_consult_list') { //제휴사 회원


        render = "my_consult_list";
    }else if(siteUrl == 'sitemap') { //sitemap

        boardTitle = "사이트맵";
        leftTitle = "조직도";
        rightTitle = "이사장 인사말";
        render = "sitemap";
        leftLink = "organization";
        rightLink = "greeting_01";
        keyword = "사이트맵";
        description = "여의도연구원 전체 메뉴를 안내합니다.";
    }else if(siteUrl == 'privacy') { //sitemap

        boardTitle = "개인정보취급방침";
        leftTitle = "조직도";
        rightTitle = "이사장 인사말";
        render = "privacy";
        leftLink = "organization";
        rightLink = "greeting_01";
        keyword = "개인정보취급방침";
        description = "여의도연구원 개인정보취급방침을 안내합니다.";
    }
    console.log("key:"+key);
    res.render(render,{title:boardTitle, areaList:req.areaList, boardData:null, leftTitle: leftTitle, rightTitle:rightTitle, leftLink:leftLink, rightLink:rightLink, keyword:keyword, description:description, member_name: member_name, member_email : member_email, member_phone: member_phone, companyInfo: req.companyInfo, key: key, token:token, mode:"write", member_auth_type: member_auth_type});
});


router.get('/apply/apply_result/:type', function (req, res, next) {

    var type = req.params.type;
    console.log('apply_result:'+type);
    var title = "aaaa";

    if(type == 'A'){
        title = "기장대행";
    }else if(type == 'B'){
        title = "신고대행";
    }else if(type == 'C'){
        title = "세무조사/불복";
    }else if(type == 'D'){
        title = "양도/상속/증여";
    }else if(type == 'E'){
        title = "컨설팅/평가/감사";
    }else if(type == 'F'){
        title = "무료세무상담";
    }

    res.render('apply_result',{title:title});

});

router.get('/greeting_02', function (req, res, next) {
    res.render('greeting_02');
});

router.get('/search/searchDetail/:searchDetail', function (req, res, next) {

    var searchTxt = req.params.searchDetail;

    console.log("searchDetail:"+searchTxt);

    res.render('search_detail');
});


router.get('/accountant/accountant_detail/:seq', function (req, res, next) {

    var seq = req.params.seq;

    console.log("accountant_detail:"+seq);


    var queryString = "select * from tb_member where seq = ?";
    _DBPool.query(queryString,[seq],function(err, rows, result) {

        if(err){

            console.log("QUERY ERROR: " + err);

        } else {

                res.render('accountant_detail',{row:rows[0]});
        }


    })



});


router.post('/user/login',  function (req, res, next) {

    var userId = req.body.id.toLowerCase();
    var passwd = req.body.pwd;
    console.log("login:"+userId);
    var keep = req.body.keep;
    var token = req.body.token;
    console.log("keep:"+keep+ "token:"+token);

    var queryString = "select member_id, member_status from tb_member where member_id = ? and member_status = 'A' limit 1";
    var queryString1 = "select member_id, seq, member_name, member_auth_type, member_phone from tb_member where member_id = ? and password = password(?) and member_status = 'A' limit 1";

    async.waterfall([
        function (callback) {
            console.log("select member_id login");
            _DBPool.query(queryString, [userId], function(err, rows, columns) {
                //_DBPool.release();
                if (err) {
                    console.log("QUERY ERROR: " + err);
                    callback("error");
                }
               
                if(rows[0] == undefined){

                    //res.json(data);
                    callback("error", "noId");
                }else{

                if(rows[0].member_status == 'D'){
                    callback("error", "noStatus");
                }else{
                    callback(null);
                }


                }
            });
        },
        function (callback) {
            //room_status C 처리
            console.log("select member_id pwd");
            _DBPool.query(queryString1, [userId, passwd], function(err, rows, columns) {
                //_DBPool.release();
                if (err) {
                    console.log("QUERY ERROR: " + err);
                    callback("error");
                }
                console.log("rows:"+rows[0]);
                if(rows[0] != undefined){
                    console.log("rows[0].member_phone:"+rows[0].member_phone);
                    var sess = req.session;
                    sess.member_id = rows[0].member_id;
                    sess.member_name = rows[0].member_name;
                    sess.member_idx = rows[0].seq;
                    sess.member_phone = rows[0].member_phone;
                    sess.member_auth_type = rows[0].member_auth_type;


                    if(keep){
                        console.log('keep : ', keep);
                        var keepCookie = sess;
                        console.log('keepCookie : ', sess);
                        res.cookie('keep', keepCookie,{
                            maxAge: 1000 * 60 * 60 * 24 * 60
                        });
                    }else{
                        res.clearCookie('keepCookie');
                    }

                    updateToken(req, res, next);
                    callback("error", "success");
                }else{
                    callback("error", "noPwd");


                }



            });

        }

    ], function (err, data) {
        var result = {result: data};
        if (err) {
            console.log("result1:"+data);
            res.json(result);
        } else {
console.log("result2:"+result);
            res.json(result);
        }
    });


});

router.post('/semu/matchingSave',fileUpload, function (req, res, next) {


    var sess = req.session;

    var memberIdx = 0;
    var memberGubun = 'B';
    console.log("matchingSave:"+sess.member_idx);
    var smsMessage = "님의 새로운 견적요청입니다. 비회원";
    if(sess.member_id != undefined){
        console.log("member!!");
        memberIdx = sess.member_idx;
        memberGubun = "A";
        smsMessage = "님의 새로운 견적요청입니다.";
    }

    var name = req.body.name;
    var semuType = req.body.semuType;
    var phone = req.body.phone;
    var etc = req.body.etc;
    var area = req.body.area;

    var type1 = req.body.type1;
    var type2 = req.body.type2;
    var upjong = req.body.upjong;
    var jikwonsu = req.body.jikwonsu;
    var kijangcharge = req.body.kijangcharge;

    var budongsan = req.body.budongsan;
    var gumyoung = req.body.gumyoung;
    var etccharge = req.body.etccharge;

    var companyname = req.body.companyname;
    var companymoney = req.body.companymoney;

    var password = req.body.password;
    var email = req.body.email;
    var bimil = req.body.bimil;
    var title = req.body.title;
    var link1 = req.body.link1;
    var link2 = req.body.link2;

    var file1_name = "";
    var file1_orgname = "";
    var file1_path = "";
    var file2_name = "";
    var file2_orgname = "";
    var file2_path = "";


    if(req.files){


        if(req.files[0]){

            file1_name = req.files[0].filename;
            file1_orgname = req.files[0].originalname;
            file1_path = upload.changeDBPath(req.files[0].path);

        }
        if(req.files[1]){

            file2_name = req.files[1].filename;
            file2_orgname = req.files[1].originalname;
            file2_path = upload.changeDBPath(req.files[1].path);

        }

    }

    var query = "";
    var data = "";

        data = [memberIdx, name, phone, area, type1, upjong, jikwonsu, kijangcharge, memberGubun, semuType, budongsan, gumyoung, etccharge, companyname, companymoney,  etc, password, email, bimil, title, link1, link2, file1_name, file1_orgname, file1_path, file2_name, file2_orgname, file2_path];
        query = "insert into tb_semu (member_idx, name, phone, area, type1, type2, upjong, jikwonsu, kijangcharge, member_gubun, semu_type, budongsan, gumyoung, etccharge, companyname, companymoney, etc, password, email, bimil, title, link1, link2, file1_name, file1_orgname, file1_path, file2_name, file2_orgname, file2_path, cre_date) values (?, ?, ?, ?, ?,'"+type2+"', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,  password(?),?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, now())";

    // }else if(semuType == 'D'){
    //
    //     data = [idx, semuSelect, idx, estimate, bulbok, goji, charge_before, charge_after, contents];
    //     query = "insert into tb_semu (semu_idx, semusa_idx, member_idx, estimate, bulbok, goji,charge_before, charge_after, contents, cre_date) values (?, ?, (select member_idx from tb_semu a where a.idx = ?), ?, ?, ?, ?, ?, ?, now())";
    //
    // }else if(semuType == 'D'){
    //
    //     data = [idx, semuSelect, idx, estimate, pyunggajasan, pyunggadate, charge_before, charge_after,pyungga_submission_date, contents];
    //     query = "insert into tb_semu_match (semu_idx, semusa_idx, member_idx, estimate, pyunggajasan, pyunggadate,charge_before, charge_after,pyungga_submission_date, contents, cre_date) values (?, ?, (select member_idx from tb_semu a where a.idx = ?), ?, ?, ?, ?, ?, ?, ?, now())";
    //
    // }else if(semuType == 'E'){
    //
    //     data = [idx, semuSelect, idx, estimate, gamsidaesang, gamsiowner, charge_before,charge_center, charge_after,jigubdate, contents];
    //     query = "insert into tb_semu_match (semu_idx, semusa_idx, member_idx, estimate, gamsidaesang, gamsiowner,charge_before,charge_center, charge_after,jigubdate, contents, cre_date) values (?, ?, (select member_idx from tb_semu a where a.idx = ?), ?, ?, ?, ?, ?, ?, ?, ?  , now())";
    //
    // }


    console.log("data:"+data);
    console.log("query:"+query);

    _DBPool.query(query,data,function(err, result) {
        //_DBPool.end();


        if (err) {
            console.log("matchingSave ERROR:"+err);
            var data = {result:'failed'};
            res.json(data);
        }
        sendAdminPush(sess.member_name+'님의 새로운 견적요청입니다.', sess.member_name+'님의 새로운 견적요청입니다.');
        sendAdminSMS(name+smsMessage);
        //sendPush(1, sess.member_name+' 새로운 견적요청이 발생하였습니다.', sess.member_name+' 새로운 견적요청이 발생하였습니다.');

        var data = {result:'success'};



        res.json(data);
    });



});


router.post('/semu/consulting_write',fileUpload, function (req, res, next) {


    var sess = req.session;

    var memberIdx = 0;
    var memberGubun = 'B';

    if(sess.member_idx != null){
        console.log("member!!");
        memberIdx = sess.member_idx;
        memberGubun = "A";

    }

    var name = req.body.name;
    var semuType = req.body.semuType;
    var phone = req.body.phone;
    var etc = req.body.etc;
    etc = etc.replace(/\n/gi, '<br/>');
    var area = req.body.area;

    var type1 = req.body.type1;
    var type2 = req.body.type2;
    var upjong = req.body.upjong;
    var jikwonsu = req.body.jikwonsu;
    var kijangcharge = req.body.kijangcharge;

    var budongsan = req.body.budongsan;
    var gumyoung = req.body.gumyoung;
    var etccharge = req.body.etccharge;

    var companyname = req.body.companyname;
    var companymoney = req.body.companymoney;

    var password = req.body.password;
    var email = req.body.email;
    var bimil = req.body.bimil==null?"N":req.body.bimil;
    var title = req.body.title;
    var link1 = req.body.link1;
    var link2 = req.body.link2;

    var file1_name = "";
    var file1_orgname = "";
    var file1_path = "";
    var file2_name = "";
    var file2_orgname = "";
    var file2_path = "";


    if(req.files){


        if(req.files[0]){

            file1_name = req.files[0].filename;
            file1_orgname = req.files[0].originalname;
            file1_path = upload.changeDBPath(req.files[0].path);

        }
        if(req.files[1]){

            file2_name = req.files[1].filename;
            file2_orgname = req.files[1].originalname;
            file2_path = upload.changeDBPath(req.files[1].path);

        }

    }

    var query = "";
    var data = "";

    data = [memberIdx, name,  etc, password, email, bimil, title, link1, link2, file1_name, file1_orgname, file1_path, file2_name, file2_orgname, file2_path];
    query = "insert into tb_board (board_idx, member_idx, cre_name, content, cre_pwd, cre_email, secret_yn, title, text1, text2, file1_name, file1_orgname, file1_path, file2_name, file2_orgname, file2_path, cre_dtime) values (2, ?, ?, ?, password(?), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, now())";

    // }else if(semuType == 'D'){
    //
    //     data = [idx, semuSelect, idx, estimate, bulbok, goji, charge_before, charge_after, contents];
    //     query = "insert into tb_semu (semu_idx, semusa_idx, member_idx, estimate, bulbok, goji,charge_before, charge_after, contents, cre_date) values (?, ?, (select member_idx from tb_semu a where a.idx = ?), ?, ?, ?, ?, ?, ?, now())";
    //
    // }else if(semuType == 'D'){
    //
    //     data = [idx, semuSelect, idx, estimate, pyunggajasan, pyunggadate, charge_before, charge_after,pyungga_submission_date, contents];
    //     query = "insert into tb_semu_match (semu_idx, semusa_idx, member_idx, estimate, pyunggajasan, pyunggadate,charge_before, charge_after,pyungga_submission_date, contents, cre_date) values (?, ?, (select member_idx from tb_semu a where a.idx = ?), ?, ?, ?, ?, ?, ?, ?, now())";
    //
    // }else if(semuType == 'E'){
    //
    //     data = [idx, semuSelect, idx, estimate, gamsidaesang, gamsiowner, charge_before,charge_center, charge_after,jigubdate, contents];
    //     query = "insert into tb_semu_match (semu_idx, semusa_idx, member_idx, estimate, gamsidaesang, gamsiowner,charge_before,charge_center, charge_after,jigubdate, contents, cre_date) values (?, ?, (select member_idx from tb_semu a where a.idx = ?), ?, ?, ?, ?, ?, ?, ?, ?  , now())";
    //
    // }


    console.log("data:"+data);
    console.log("query:"+query);

    _DBPool.query(query,data,function(err, result) {
        //_DBPool.end();


        if (err) {
            console.log("matchingSave ERROR:"+err);
            var data = {result:'failed'};
            res.json(data);
        }

        var data = {result:'success'};
        res.json(data);
    });



});

router.post('/semu/consulting_modify',fileUpload, function (req, res, next) {


    var sess = req.session;

    var boardIdx = req.body.boardIdx;

    var name = req.body.name;
    var semuType = req.body.semuType;
    var phone = req.body.phone;
    var etc = req.body.etc;
    etc = etc.replace(/\n/gi, '<br/>');
    var area = req.body.area;

    var type1 = req.body.type1;
    var type2 = req.body.type2;
    var upjong = req.body.upjong;
    var jikwonsu = req.body.jikwonsu;
    var kijangcharge = req.body.kijangcharge;

    var budongsan = req.body.budongsan;
    var gumyoung = req.body.gumyoung;
    var etccharge = req.body.etccharge;

    var companyname = req.body.companyname;
    var companymoney = req.body.companymoney;

    var password = req.body.password;
    var email = req.body.email;
    var bimil = req.body.bimil==null?"N":req.body.bimil;
    var title = req.body.title;
    var link1 = req.body.link1;
    var link2 = req.body.link2;

    var file1_name = "";
    var file1_orgname = "";
    var file1_path = "";
    var file2_name = "";
    var file2_orgname = "";
    var file2_path = "";


    var fileQuery = "";

    var query = "";
    var data = "";

    query = "update tb_board set content = ?, cre_email=?, secret_yn = ?, title = ?, text1 = ?, text2 = ?";
    data = [etc, email, bimil, title, link1, link2];
    var fileData = [];
    if(req.files){

        console.log("req.files:"+JSON.stringify(req.files[file1]));

        if(req.files[0]){

            file1_name = req.files[0].filename;
            file1_orgname = req.files[0].originalname;
            file1_path = upload.changeDBPath(req.files[0].path);

            fileQuery = ",file1_name = ?, file1_orgname = ?, file1_path = ?";
            fileData = [file1_name, file1_orgname, file1_path];
            query += fileQuery;
            data = data.concat(fileData);


        }
        if(req.files[1]){

            file2_name = req.files[1].filename;
            file2_orgname = req.files[1].originalname;
            file2_path = upload.changeDBPath(req.files[1].path);

            fileQuery = ",file2_name = ?, file2_orgname = ?, file2_path = ?";
            fileData = [file2_name, file2_orgname, file2_path];
            query += fileQuery;
            data = data.concat(fileData);

        }

    }


        var idxData = [boardIdx];

        data = data.concat(idxData);

    query += ", upd_dtime = now() where idx = ?";
    // }else if(semuType == 'D'){
    //
    //     data = [idx, semuSelect, idx, estimate, bulbok, goji, charge_before, charge_after, contents];
    //     query = "insert into tb_semu (semu_idx, semusa_idx, member_idx, estimate, bulbok, goji,charge_before, charge_after, contents, cre_date) values (?, ?, (select member_idx from tb_semu a where a.idx = ?), ?, ?, ?, ?, ?, ?, now())";
    //
    // }else if(semuType == 'D'){
    //
    //     data = [idx, semuSelect, idx, estimate, pyunggajasan, pyunggadate, charge_before, charge_after,pyungga_submission_date, contents];
    //     query = "insert into tb_semu_match (semu_idx, semusa_idx, member_idx, estimate, pyunggajasan, pyunggadate,charge_before, charge_after,pyungga_submission_date, contents, cre_date) values (?, ?, (select member_idx from tb_semu a where a.idx = ?), ?, ?, ?, ?, ?, ?, ?, now())";
    //
    // }else if(semuType == 'E'){
    //
    //     data = [idx, semuSelect, idx, estimate, gamsidaesang, gamsiowner, charge_before,charge_center, charge_after,jigubdate, contents];
    //     query = "insert into tb_semu_match (semu_idx, semusa_idx, member_idx, estimate, gamsidaesang, gamsiowner,charge_before,charge_center, charge_after,jigubdate, contents, cre_date) values (?, ?, (select member_idx from tb_semu a where a.idx = ?), ?, ?, ?, ?, ?, ?, ?, ?  , now())";
    //
    // }


    console.log("data:"+data);
    console.log("query:"+query);

    _DBPool.query(query,data,function(err, result) {
        //_DBPool.end();


        if (err) {
            console.log("matchingSave ERROR:"+err);
            var data = {result:'failed'};
            res.json(data);
        }

        var data = {result:'success'};
        res.json(data);
    });



});

router.post('/member/join',fileUpload, function (req, res, next) {

    console.log("a1");
    var memberAuthType = req.body.memberAuthType;

    var memberId = req.body.memberId.toLowerCase();
    var password = req.body.password;
    var memberName = req.body.memberName;
    var memberPhone = req.body.memberPhone;
    console.log("a2");
    var zipcode = req.body.zipcode;
    var address1 = req.body.address1;
    var address2 = req.body.address2;
    var license_type = req.body.license_type;
    var auth_number  = req.body.auth_number;
    var affiliation = req.body.affiliation;
    var businessdistrict = req.body.businessdistrict;
    var carrer = req.body.carrer;
    var content = req.body.content;
    var viewYn = req.body.viewYn;
    console.log("a3+ viewYn:"+viewYn);
    if(carrer != undefined && carrer != null){
    carrer = carrer.replace(/\n/gi, '<br/>');
    }
    if(content != undefined && content != null) {
        content = content.replace(/\n/gi, '<br/>');
    }
    console.log("a4");
    var file1_name = "";
    var file1_orgname = "";
    var file1_path = "";

    console.log("a");
    if(req.files){


        if(req.files[0]){

            file1_name = req.files[0].filename;
            file1_orgname = req.files[0].originalname;
            file1_path = upload.changeDBPath(req.files[0].path);

        }


    }
    console.log("b");
    var query = "";
    var data = "";
    if(memberAuthType == 'A'){

        data = [memberId, password, memberName, memberPhone, memberAuthType];
        query = "insert into tb_member (member_id, password, member_name, member_phone , member_auth_type,  cre_dtime) values (?, password(?), ?, ?, ?, now())";

    }else{

        data = [memberId, password, memberName, memberPhone, memberAuthType, zipcode, address1, address2, auth_number, affiliation, carrer, content, file1_name ,file1_orgname, file1_path, viewYn];
        query = "insert into tb_member (member_id, password, member_name, member_phone , member_auth_type, zipcode, address1, address2, license_type, auth_number, affiliation, carrer, content, image_name ,image_org_name, image_path, sale_area, member_status, viewYn,  cre_dtime) values (?, password(?), ?, ?, ?, ?, ?, ?, '"+license_type+"', ?, ?, ?, ?, ?, ?, ?, '"+businessdistrict+"', 'D',?, now())";

    }


    console.log("data:"+data);
    console.log("query:"+query);

    _DBPool.query(query,data,function(err, result) {
        //_DBPool.end();


        if (err) {
            console.log("join ERROR:"+err);
            var data = {result:'failed'};
            res.json(data);
        }

        var data = {result:'success'};
        res.json(data);
    });



});


router.get('/mypage/consulting/:cur', function (req, res, next) {



    var sess = req.session;

    if(sess.member_id) {


        console.log("mypage/consulting:" + sess.member_id);

        var member_idx = sess.member_idx;


        //페이지당 게시물 수 : 한 페이지 당 10개 게시물
        var page_size = 10;
        //페이지의 갯수 : 1 ~ 10개 페이지
        var page_list_size = 10;
        //limit 변수
        var no = "";
        //전체 게시물의 숫자
        var totalPageCount = 0;


        var queryString = 'select count(*) as cnt from (\n' +
            'select idx from tb_semu where member_idx = ?\n' +
            ' union all\n' +
            'select idx from tb_board where board_idx = 2 and  member_idx = ?\n' +
            ') a ';

        console.log("queryString:" + queryString);
        _DBPool.query(queryString, [member_idx, member_idx], function (err, rows, columns) {
            //_DBPool.end();

            if (err) {
                console.log("QUERY ERROR: " + err);
            } else {

                totalPageCount = rows[0].cnt;

                var curPage = req.params.cur;

                console.log("현재 페이지 : " + curPage, "전체 페이지 : " + totalPageCount);


                //전체 페이지 갯수
                if (totalPageCount < 0) {
                    totalPageCount = 0
                }

                var totalPage = Math.ceil(totalPageCount / page_size);// 전체 페이지수
                var totalSet = Math.ceil(totalPage / page_list_size); //전체 세트수
                var curSet = Math.ceil(curPage / page_list_size) // 현재 셋트 번호
                var startPage = ((curSet - 1) * 10) + 1 //현재 세트내 출력될 시작 페이지
                var endPage = (startPage + page_list_size) - 1; //현재 세트내 출력될 마지막 페이지


                //현재페이지가 0 보다 작으면
                if (curPage < 0) {
                    no = 0
                } else {
                    //0보다 크면 limit 함수에 들어갈 첫번째 인자 값 구하기
                    no = (curPage - 1) * 10
                }

                console.log('[0] curPage : ' + curPage + ' | [1] page_list_size : ' + page_list_size + ' | [2] page_size : ' + page_size + ' | [3] totalPage : ' + totalPage + ' | [4] totalSet : ' + totalSet + ' | [5] curSet : ' + curSet + ' | [6] startPage : ' + startPage + ' | [7] endPage : ' + endPage)

                var result2 = {
                    "curPage": curPage,
                    "page_list_size": page_list_size,
                    "page_size": page_size,
                    "totalPage": totalPage,
                    "totalSet": totalSet,
                    "curSet": curSet,
                    "startPage": startPage,
                    "endPage": endPage,
                    "totalPageCount": totalPageCount
                };

                var queryString = "select * from (\n" +
                    "select idx,semu_type,\n" +
                    "        case when semu_type = 'A' THEN '기장대행'\n" +
                    "                 when semu_type = 'B' THEN  '신고대행'\n" +
                    "                 when semu_type = 'C' THEN  '세무조사/불복'\n" +
                    "                 when semu_type = 'D' THEN  '양도/상속/증여'\n" +
                    "                 when semu_type = 'E' THEN  '컨설팅/평가/감사'\n" +
                    "                 END as semu_type_name,\n" +
                    " case when semu_type = 'A' THEN '기장대행 신청건입니다.'\n" +
                    "                 when semu_type = 'B' THEN  '신고대행 신청건입니다.'\n" +
                    "                 when semu_type = 'C' THEN  '세무조사/불복 신청건입니다.'\n" +
                    "                 when semu_type = 'D' THEN  '양도/상속/증여 신청건입니다.'\n" +
                    "                 when semu_type = 'E' THEN  '컨설팅/평가/감사 신청건입니다.'\n" +
                    "                 END as title, \n" +
                    "                 case when semu_status = 'A' THEN '접수완료'\n" +
                    "                 when semu_status = 'B' THEN  '견적중'\n" +
                    "                 when semu_status = 'C' THEN  '견적취소'\n" +
                    "                 when semu_status = 'D' THEN  '견적완료'\n" +
                    "                 when semu_status = 'E' THEN  '재견적 요청'\n" +
                    "                 when semu_status = 'F' THEN  '선택완료'\n" +
                    "                 END as semu_status, semu_status as sumuStatus, cre_date as cre_date1, date_format(cre_date, \"%Y.%m.%d\") as cre_dtime, \n" +
                    "                 ifnull((select member_name from tb_member where seq = (select semusa_idx from tb_semu_match c where c.match_status = 'C' and c.semu_idx = s.idx)),'N') as semusa from tb_semu s where member_idx = ?\n" +
                    "                 union all\n" +
                    "select a.idx, 'F' AS semu_type, '무료 세무상담' as semu_type_name, title, if(b.idx>0,'답변완료','답변대기')  as semu_status,'' AS sumuStatus, a.cre_dtime as cre_date1, date_format(a.cre_dtime, \"%Y.%m.%d\") as cre_dtime,'N' AS semusa from tb_board a left  join tb_board_comment b on a.idx = b.board_idx where a.board_idx = 2 and  a.member_idx = ?\n" +
                    ") a order by cre_date1 desc limit ?,? ";

                console.log("queryString:" + queryString);

                console.log("no:" + no + " page_size:" + page_size);
                var fileList = [];
                _DBPool.query(queryString, [member_idx, member_idx, no, page_size], function (err, rows, result) {
                    //_DBPool.end();
                    if (err) {
                        console.log("QUERY ERROR: " + err);
                    } else {


                        res.render('my_consult_list', {
                            boardIdx: 2,
                            data: rows,
                            pasing: result2
                        });
                    }

                });

            }
        });

    }else{

        res.redirect('/');

    }


});

router.get('/mypage/estimate/:cur', function (req, res, next) {



    var sess = req.session;

    if(sess.member_id) {


        console.log("mypage/estimate:" + sess.member_idx);

        var member_idx = sess.member_idx;


        //페이지당 게시물 수 : 한 페이지 당 10개 게시물
        var page_size = 10;
        //페이지의 갯수 : 1 ~ 10개 페이지
        var page_list_size = 10;
        //limit 변수
        var no = "";
        //전체 게시물의 숫자
        var totalPageCount = 0;


        var queryString = 'select count(*) as cnt from tb_semu_match where semusa_idx = ?';

        console.log("queryString:" + queryString);
        _DBPool.query(queryString, [member_idx, member_idx], function (err, rows, columns) {
            //_DBPool.end();

            if (err) {
                console.log("QUERY ERROR: " + err);
            } else {

                totalPageCount = rows[0].cnt;

                var curPage = req.params.cur;

                console.log("현재 페이지 : " + curPage, "전체 페이지 : " + totalPageCount);


                //전체 페이지 갯수
                if (totalPageCount < 0) {
                    totalPageCount = 0
                }

                var totalPage = Math.ceil(totalPageCount / page_size);// 전체 페이지수
                var totalSet = Math.ceil(totalPage / page_list_size); //전체 세트수
                var curSet = Math.ceil(curPage / page_list_size) // 현재 셋트 번호
                var startPage = ((curSet - 1) * 10) + 1 //현재 세트내 출력될 시작 페이지
                var endPage = (startPage + page_list_size) - 1; //현재 세트내 출력될 마지막 페이지


                //현재페이지가 0 보다 작으면
                if (curPage < 0) {
                    no = 0
                } else {
                    //0보다 크면 limit 함수에 들어갈 첫번째 인자 값 구하기
                    no = (curPage - 1) * 10
                }

                console.log('[0] curPage : ' + curPage + ' | [1] page_list_size : ' + page_list_size + ' | [2] page_size : ' + page_size + ' | [3] totalPage : ' + totalPage + ' | [4] totalSet : ' + totalSet + ' | [5] curSet : ' + curSet + ' | [6] startPage : ' + startPage + ' | [7] endPage : ' + endPage)

                var result2 = {
                    "curPage": curPage,
                    "page_list_size": page_list_size,
                    "page_size": page_size,
                    "totalPage": totalPage,
                    "totalSet": totalSet,
                    "curSet": curSet,
                    "startPage": startPage,
                    "endPage": endPage,
                    "totalPageCount": totalPageCount
                };

                var queryString = "select a.idx,b.idx as semuIdx, b.semu_type,\n" +
                    "        case when b.semu_type = 'A' THEN '기장대행'\n" +
                    "                 when b.semu_type = 'B' THEN  '신고대행'\n" +
                    "                 when b.semu_type = 'C' THEN  '세무조사/불복'\n" +
                    "                 when b.semu_type = 'D' THEN  '양도/상속/증여'\n" +
                    "                 when b.semu_type = 'E' THEN  '컨설팅/평가/감사'\n" +
                    "                 END as semu_type_name,\n" +
                    " case when b.semu_type = 'A' THEN '기장대행 신청건입니다.'\n" +
                    "                 when b.semu_type = 'B' THEN  '신고대행 신청건입니다.'\n" +
                    "                 when b.semu_type = 'C' THEN  '세무조사/불복 신청건입니다.'\n" +
                    "                 when b.semu_type = 'D' THEN  '양도/상속/증여 신청건입니다.'\n" +
                    "                 when b.semu_type = 'E' THEN  '컨설팅/평가/감사 신청건입니다.'\n" +
                    "                 END as title,  b.cre_date as cre_date1, date_format(b.cre_date, \"%Y.%m.%d\") as cre_dtime,\n" +
                    "                 case when a.semusa_status = 'A' then '견적대기'\n" +
                    "                 when a.semusa_status = 'B' then '견적완료'\n" +
                    "                 when a.semusa_status = 'C' then '견적반려'\n" +
                    "                 else '선택완료' end as semusa_status \n" +
                    "                 from tb_semu_match a left outer join tb_semu b on a.semu_idx = b.idx\n" +
                    "where a.semusa_idx = ? order by a.cre_date desc limit ?,?\n";

                console.log("member_idx:" + member_idx);
                console.log("queryString:" + queryString);
                console.log("no:" + no + " page_size:" + page_size);
                var fileList = [];
                _DBPool.query(queryString, [member_idx, no, page_size], function (err, rows, result) {
                    //_DBPool.end();
                    if (err) {
                        console.log("QUERY ERROR: " + err);
                    } else {


                        res.render('my_estimate_list', {
                            data: rows,
                            pasing: result2
                        });
                    }

                });

            }
        });

    }else{
        res.redirect('/');

    }

});

router.get('/comment/getCommentList', function (req, res, next) {

    var seq = req.query.boardIdx;

    console.log(":::::::::comment_list::::::::::" + seq);
    _DBPool.query("SELECT c.idx, c.board_idx, c.top_idx, c.comment,\n" +
        "(select member_idx from tb_board b where b.idx = c.board_idx ) as member_idx, user_name, cre_id \n" +
        "FROM tb_board_comment c where c.board_idx = ? order by c.cre_dtime desc limit 1",[seq],function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            return res.end("QUERY ERROR: " + err);
        }

        var data = {result:'success', comment: rows[0]};
        res.json(data);

    });

});


router.get('/mypage/my_consult_view/:semu_type/:seq', comment_list, semuSelectList, function (req, res, next) {


    var sess = req.session;

    if(sess.member_id == null || sess.member_id == undefined){

        res.redirect('/');

    }

    var seq = req.params.seq;
    var semuType = req.params.semu_type;

    console.log("my_consult_view:"+seq+" semuType:"+semuType);

    var render = "my_consult_view01";

    var queryString = "select idx, member_idx, name, phone, email, area, type1, type2, upjong,jikwonsu, kijangcharge, sodukgubun, budongsan, gumyoung,etccharge, etc, companyname, companymoney, bimil, member_gubun, semu_type, semu_status, date_format(cre_date, \"%Y.%m.%d\") as cre_date from tb_semu where idx = ?";

    if(semuType == 'F'){
        queryString = "select a.idx, 'F' AS semu_type, '무료 세무상담' as semu_type_name, title, a.cre_dtime, if(b.idx>0,'답변완료','답변대기')  as semu_status, a.cre_name,a.content, a.cre_dtime as cre_date1, date_format(a.cre_dtime, \"%Y.%m.%d\") as cre_dtime from tb_board a left  join tb_board_comment b on a.idx = b.board_idx where a.idx = ?";
    }



    _DBPool.query(queryString,[seq],function(err, rows, result) {

        if(err){

            console.log("QUERY ERROR: " + err);

        } else {

            res.render('my_consult_view01',{row:rows[0], semuType:semuType, member_idx:sess.member_idx,member_name:sess.member_name, semuSelectList: req.semuSelectList, commentList: req.comment_list});
        }


    })





});


function comment_list(req,res,next){

    var board_idx = req.params.boardIdx;

    console.log(":::::::::comment_list::::::::::" + board_idx);
    _DBPool.query("SELECT idx, board_idx, top_idx, replace(comment,'<br/>','\n') as comment FROM tb_board_comment where board_idx = ? order by cre_dtime desc",[board_idx],function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            return res.end("QUERY ERROR: " + err);
        }

        req.comment_list = rows;
        next();

    });

}


router.get('/nopage/my_consult_view/:semu_type/:seq', semuSelectList, function (req, res, next) {



    var seq = req.params.seq;
    var semuType = req.params.semu_type;

    console.log("my_consult_view:"+seq+" semuType:"+semuType);

    var render = "my_consult_view01";

    var queryString = "select idx, member_idx, name, phone, email, area, type1, type2, upjong,jikwonsu, kijangcharge, sodukgubun, budongsan, gumyoung,etccharge, etc, companyname, companymoney, bimil, member_gubun, semu_type, semu_status, date_format(cre_date, \"%Y.%m.%d\") as cre_date from tb_semu where idx = ?";





    _DBPool.query(queryString,[seq],function(err, rows, result) {

        if(err){

            console.log("QUERY ERROR: " + err);

        } else {

            res.render('noMem_consult_view01',{row:rows[0], semuType:semuType,member_name:rows[0].name, semuSelectList: req.semuSelectList});
        }


    })





});

router.get('/mypage/my_estimate_view/:semu_type/:seq', function (req, res, next) {


    var sess = req.session;

    if(sess.member_id) {


        var seq = req.params.seq;
        var semuType = req.params.semu_type;

        console.log("my_estimate_view:" + seq + " semuType:" + semuType);

        var render = "my_estimate_view01";

        var queryString = "select a.idx, b.idx as semuMatchIdx, a.member_idx, name, phone, email, area, type1, type2, upjong,jikwonsu, kijangcharge, sodukgubun, budongsan, gumyoung,etccharge, etc, companyname, companymoney, bimil, member_gubun, semu_type, semu_status, date_format(a.cre_date, \"%Y.%m.%d\") as cre_date,\n" +
            " b.estimate,b.bulbok, b.goji, b.charge_before, b.charge_center, b.charge_after, b.pyunggajasan, b.pyunggadate, b.pyungga_submission_date, \n" +
            " b.gamsidaesang, b.gamsiowner, b.jigubdate, b.contents\n" +
            " from tb_semu a, tb_semu_match b where a.idx = b.semu_idx and b.idx = ?";


        console.log("queryString:" + queryString);


        _DBPool.query(queryString, [seq], function (err, rows, result) {

            if (err) {

                console.log("QUERY ERROR: " + err);

            } else {

                res.render('my_estimate_view01', {row: rows[0], semuType: semuType, member_name: sess.member_name});
            }


        })

    }else{

        res.redirect('/');

    }



});

router.get('/mypage/my_consult_semusa/:semu_type/:semuIdx/:seq', function (req, res, next) {


    var sess = req.session;



        var seq = req.params.seq;
        var semuType = req.params.semu_type;
        var semuIdx = req.params.semuIdx;

        console.log("my_consult_semusa:" + seq + " my_consult_semusa:" + semuType);

        var render = "my_consult_view02";

        var queryString = "select a.idx, b.semu_status, b.name, (select concat(member_name,'(',affiliation,')') from tb_member a where seq = semusa_idx) as semusa_name, (select license_type from tb_member a where seq = semusa_idx) as license_type, (select image_path from tb_member a where seq = semusa_idx) as image_path, semu_idx, semusa_idx, a.member_idx, estimate, bulbok, goji, charge_before, charge_center, charge_after, pyunggajasan, pyunggadate, pyungga_submission_date, gamsidaesang, gamsiowner, jigubdate, contents, a.cre_date, mod_date, match_status from tb_semu_match a, tb_semu b where a.semu_idx = b.idx and  a.idx =  ?";


        _DBPool.query(queryString, [seq], function (err, rows, result) {

            if (err) {

                console.log("QUERY ERROR: " + err);

            } else {

                res.render('my_consult_view02', {
                    row: rows[0],
                    semuType: semuType,
                    member_name: sess.member_name,
                    semuSeq: rows[0].semusa_idx,
                    semuIdx: semuIdx,
                    semuMatchSeq: seq
                });
            }


        })




});


router.get('/nopage/my_consult_semusa/:semu_type/:semuIdx/:seq', function (req, res, next) {


    var sess = req.session;



    var seq = req.params.seq;
    var semuType = req.params.semu_type;
    var semuIdx = req.params.semuIdx;

    console.log("my_consult_semusa:" + seq + " my_consult_semusa:" + semuType);

    var render = "my_consult_view02";

    var queryString = "select a.idx, b.semu_status, b.name, (select concat(member_name,'(',affiliation,')') from tb_member a where seq = semusa_idx) as semusa_name, (select license_type from tb_member a where seq = semusa_idx) as license_type, (select image_path from tb_member a where seq = semusa_idx) as image_path, semu_idx, semusa_idx, a.member_idx, estimate, bulbok, goji, charge_before, charge_center, charge_after, pyunggajasan, pyunggadate, pyungga_submission_date, gamsidaesang, gamsiowner, jigubdate, contents, a.cre_date, mod_date, match_status from tb_semu_match a, tb_semu b where a.semu_idx = b.idx and  a.idx =  ?";


    _DBPool.query(queryString, [seq], function (err, rows, result) {

        if (err) {

            console.log("QUERY ERROR: " + err);

        } else {

            res.render('noMem_consult_view02', {
                row: rows[0],
                semuType: semuType,
                member_name: sess.member_name,
                semuSeq: rows[0].semusa_idx,
                semuIdx: semuIdx,
                semuMatchSeq: seq
            });
        }


    })




});

router.post('/mypage/selectSemusa', function (req, res, next) {
    console.log("selectSemusa");

    var sess = req.session;




        var seq = req.body.seq;
        console.log("selectSemusa:" + seq);
        var semuIdx = req.body.semuIdx;
        var customer = req.body.name;
        var semuMatchSeq = req.body.semuMatchSeq;
        console.log("semuMatchSeq:" + semuMatchSeq);

        var queryString = "update tb_semu_match set match_status = 'C', semusa_status = 'D' where idx = ?";
        var queryString2 = "update tb_semu set semu_status = 'F' where idx = ?";


        async.waterfall([
            function (callback) {
                console.log("update tb_semu_match");
                _DBPool.query(queryString, [semuMatchSeq], function (err, rows, columns) {
                    //_DBPool.release();
                    if (err) {
                        console.log("QUERY ERROR: " + err);
                        callback("error");
                    }
                    callback(null);

                });
            },
            function (callback) {
                //room_status C 처리
                console.log("update tb_semu");
                _DBPool.query(queryString2, [semuIdx], function (err, rows, columns) {
                    //_DBPool.release();
                    if (err) {
                        console.log("QUERY ERROR: " + err);
                        callback("error");
                    }
                    callback(null);

                });

            }

        ], function (err) {

            if (err) {
                res.json('failed');
            } else {
                if (sess.member_idx != null && sess.member_idx != undefined) {
                    sendPush(seq, sess.member_id + '고객이 세무사 선택을 완료하였습니다.', sess.member_id + ' 고객이 세무사 선택을 완료하였습니다.', 'B');

                    sendAdminPush(sess.member_id + '고객이 세무사 선택을 완료하였습니다.', sess.member_id + ' 고객이 세무사 선택을 완료하였습니다.');

                }

                    sendAdminSMS(customer+ '고객이 세무사 선택을 완료하였습니다.');
                    sendSMS(seq,customer+ '님이 세무사님을 선택했습니다. 계약을 진행하시길 바랍니다.','B');
                res.json('success');
            }
        });






});

function updateToken(req,res,next){

    console.log("updateToken");

    var sess = req.session;

    var userSeq = sess.member_idx;

    const addr = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    console.log("addr:"+addr);

    console.log("userSeq:"+userSeq+ "addr:"+addr);

    var queryString = "update tb_token \n" +
        "set  member_seq = ?, cre_date = now() \n" +
        "where member_ip = ? and member_seq is null";
    _DBPool.query(queryString,[userSeq, addr],function(err, rows, result) {

        if(err){

            console.log("QUERY ERROR: " + err);

        }
           // next();



    })


}

function insertToken(req,res,next){

    console.log("insertToken");
    var token = req.query.token;

    console.log("token:"+token);

    if(token != null && token != undefined){
        const addr = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        console.log("addr:"+addr);

        var queryString = "insert into tb_token (member_ip, token, cre_date) \n" +
            "SELECT ?,?, now() from dual \n" +
            "WHERE NOT EXISTS \n" +
            "( SELECT * FROM tb_token WHERE token = ? AND member_ip= ? )";
        _DBPool.query(queryString,[addr, token, token, addr],function(err, rows, result) {

            if(err){

                console.log("insertToken QUERY ERROR: " + err);

            }
            next();



        })

    }else{
        next();
    }




}

router.post('/mypage/reMatching', function (req, res, next) {

    var sess = req.session;




        var seq = req.body.seq;
        var memberName = req.body.member_name;
        console.log("reMatching:" + seq+ "memberName:"+memberName);
        var data = {};

        async.waterfall([
            function (callback) {
                console.log("update tb_semu ");
                var queryString = "update tb_semu set semu_status = 'E' where idx = ?";
                _DBPool.query(queryString, [seq], function (err, rows, result) {

                    if (err) {

                        console.log("QUERY ERROR: " + err);
                        callback("error");
                    } else {

                        callback(null);

                    }


                })
            },
            function (callback) {
                //room_status C 처리
                console.log("select member_id pwd");
                var queryString = "update tb_semu_match set semusa_status = 'C' where semu_idx = ?";
                _DBPool.query(queryString, [seq], function (err, rows, result) {

                    if (err) {

                        console.log("QUERY ERROR: " + err);
                        callback("error");
                    } else {


                        if (sess.member_idx != null && sess.member_idx != undefined) {

                            sendAdminPush(sess.member_id + " 고객이 세무사 재요청을 하셨습니다.", sess.member_id + "고객이 세무사 재요청을 하셨습니다.")

                        }

                            sendAdminSMS(memberName+" 고객이 세무사 재요청을 하셨습니다.");

                        callback(null);

                    }


                })

            }

        ], function (err, data) {

            if (err) {
                data = {result: 'failed'};
                res.json(data);
            } else {
                data = {result: 'success'};
                res.json(data);
            }
        });





});

router.post('/top5List', function (req, res, next) {

    var boardIdx = req.body.board_idx;
    console.log("board_idx:"+boardIdx);

    var queryString = "select idx, board_idx, case when length(title) > 40 then concat(left(title,40),'')  else title end as title,content, title2, a_date,(select cate_name from tb_cate where code_idx = board_gubun) as board_gubun, main_image_path, text1, text2, text3, text4, text5, top_fix, start_date, end_date, start_time, end_time, apply_url, cre_name, date_format(cre_dtime, \"%Y.%m.%d\") as cre_dtime, left(cre_dtime, 7) as a_date_m, substring(cre_dtime,9,2) as a_date_d from tb_board where board_idx = ? order by a_date desc,cre_dtime desc limit 4";
    _DBPool.query(queryString,[boardIdx],function(err, rows, result) {

        if(err){

            console.log("QUERY ERROR: " + err);
        } else {


            var data = {result: 'success', top5List : rows};
            res.json(data);
        }


    })



});


router.post('/member/leave', function (req, res, next) {

    var sess = req.session;

    if(sess == null){
        var data = {result: 'failed'};
        res.json(data);

    }

    var seq = sess.member_idx;
    var queryString = "\n" +
        "update tb_member set member_id = '-', password='-', member_phone = '-', member_status = 'C', view_yn = 'N', cancel_dtime = now() where seq = ?";
    _DBPool.query(queryString,[seq],function(err, rows, result) {

        if(err){

            console.log("QUERY ERROR: " + err);
            var data = {result: 'failed'};
            res.json(data);
        } else {

            req.session.destroy();
            res.clearCookie('steveNcorp'); // 세션 쿠키 삭제
            res.clearCookie('keep'); // 세션 쿠키 삭제
            var data = {result: 'success'};
            res.json(data);
        }


    })



});




router.post('/member/pwdChange', function (req, res, next) {


    var sess = req.session;
    console.log("member:"+sess.member_id);

    if(sess.member_id == null || sess.member_id == undefined){

        var data = {result: 'failed'};
        res.json(data);
    }

    var pwd = req.body.pwd;
    var password = req.body.re1_pwd;
    var seq = sess.member_idx;
    var queryString = "\n" +
        "update tb_member set password = password(?) where seq = ? and password = password(?)";
    console.log("query:"+queryString);
    _DBPool.query(queryString,[password, seq, pwd],function(err, rows, result) {

        if(err){

            console.log("QUERY ERROR: " + err);
            var data = {result: 'failed'};
            res.json(data);
        } else {

            console.log("result.affectedRows :"+rows.affectedRows );
           if(rows.affectedRows>0){
            var data = {result: 'success'};
            res.json(data);
           }else{
               var data = {result: 'pwdcheck'};
               res.json(data);
           }
        }


    })



});


router.post('/getOrgDetail', function (req, res, next) {

    var c_code = req.body.c_code;
    console.log("c_Code:"+c_code);
    var queryString = "\n" +
        "select c_code, c_mcode, c_mname,(select c_name from tb_code a where a.c_code = b.c_mname) as jik, c_name from tb_code b where c_mcode = ? ";
    _DBPool.query(queryString,[c_code],function(err, rows, result) {

        if(err){

            console.log("QUERY ERROR: " + err);
        } else {


            var data = {result: 'success', orgDetailList : rows};
            console.log("row:"+rows);
            res.json(data);
        }


    })



});

router.post('/consult/commentWrite', updateBoardStatus, function(req, res, next){

    console.log(":::::::::commentWrite:::::::::");
    var sess = req.session;
    console.log("member:"+sess.member_name);

    if(sess.member_id == null || sess.member_id == undefined){

        res.redirect('/');

    }
    var idx = req.body.idx;
    var comment = req.body.comment;
    comment = comment.replace(/\n/gi, '<br/>');
    console.log("idx:"+idx);

    var query = "insert INTO tb_board_comment (board_idx, top_idx, depth, cre_id, user_name, comment, cre_dtime) values (?, 1, 0, ?, ?,?, now())";
    var data = "";

    _DBPool.query(query,[idx, sess.member_idx, sess.member_name, comment],function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            console.log("err:"+err);
            res.json('failed');
        } else {

            data = {result: 'success'};
            res.json(data);
        }
    });

});

router.post('/consult/commentModify', function(req, res, next){

    console.log(":::::::::commentModify:::::::::");
    var sess = req.session;
    console.log("member:"+sess.member_name);

    if(sess.member_id == null || sess.member_id == undefined){

        res.redirect('/');

    }
    var idx = req.body.idx;
    var comment = req.body.comment;
    comment = comment.replace(/\n/gi, '<br/>');
    console.log("idx:"+idx);

    var query = "update tb_board_comment set comment = ?, upd_dtime = now() where board_idx = ?";
    var data = "";

    _DBPool.query(query,[comment,idx],function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            console.log("err:"+err);
            res.json('failed');
        } else {

            data = {result: 'success'};
            res.json(data);
        }
    });

});

router.get('/comment/delete', function(req, res, next){

    console.log(":::::::::delete:::::::::");
    var sess = req.session;
    console.log("member:"+sess.member_name);

    if(sess.member_id == null || sess.member_id == undefined){

        res.redirect('/');

    }
    var idx     = req.query.boardIdx;

    var query = "delete FROM tb_board_comment where board_idx=?";
    var datas = [idx];

    _DBPool.query(query,datas,function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            console.log("QUERY ERROR: " + err);
            res.json('failed');
        }

        res.json('success');
    });

});

function updateBoardStatus(req, res, next){

    var idx = req.body.idx;
    var queryString = "update tb_board set reply_yn = 'Y' where idx = ?";
    _DBPool.query(queryString,[idx],function(err, rows, result) {

        if(err){

            console.log("QUERY ERROR: " + err);
        } else {



            next();
        }


    })

}

function bannerList(req, res, next){


    var queryString = "select seq, member_name, license_type, affiliation, image_path from tb_member where member_auth_type = 'B' and view_yn = 'Y' and member_status = 'A' order by viewLevel,seq desc";
    _DBPool.query(queryString,[],function(err, rows, result) {

        if(err){

            console.log("QUERY ERROR: " + err);
        } else {


            req.bannerList = rows;
            next();
        }


    })

}



function semuSelectList(req, res, next){

    console.log("/semu/readMatching/:"+req.body.idx);

    var seq = req.params.seq;

    var datas = [];

    var query = "select a.idx, (select concat(member_name,'(',affiliation,')') from tb_member a where seq = semusa_idx) as semusa_name, (select license_type from tb_member a where seq = semusa_idx) as license_type, (select image_path from tb_member a where seq = semusa_idx) as image_path, semu_idx, semusa_idx, a.member_idx, estimate, bulbok, goji, charge_before, charge_center, charge_after, pyunggajasan, pyunggadate, pyungga_submission_date, gamsidaesang, gamsiowner, jigubdate, contents, a.cre_date, mod_date, match_status from tb_semu_match a, tb_semu b where a.semu_idx = b.idx and semu_idx = ? and a.semusa_status in ('B','D')  and b.semu_status IN ('D','F')"


    datas = [seq];


    _DBPool.query(query, datas,function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
           console.log("err:"+err);
        }

        req.semuSelectList = rows;
        next();
    });


}

function bannerListEn(req, res, next){


    var queryString = "select title, subTitle, image_path, image_org_name, banner_type, banner_link from tb_banner where use_yn = 'Y' and global_type = 'EN' order by position";
    _DBPool.query(queryString,[],function(err, rows, result) {

        if(err){

            console.log("QUERY ERROR: " + err);
        } else {


            req.bannerListEn = rows;
            next();
        }


    })

}

function topBoard1(req, res, next){




    var queryString = "SELECT idx, board_idx,  case when length(title) > 20 then concat(left(title,20),'')  else title end as title, left(cre_dtime, 7) as a_date_m, substring(cre_dtime,9,2) as a_date_d FROM tb_board where board_idx = 3 and admin_del_yn = 'N' order by top_fix DESC, cre_dtime desc limit 3" ;
    _DBPool.query(queryString,[],function(err, rows, result) {

        if(err){

            console.log("QUERY ERROR: " + err);
        } else {


                req.topBoard1 = rows;
            next();
        }


    })

}

function topBoard2(req, res, next){

    var queryString = "SELECT idx, board_idx,  case when length(title) > 20 then concat(left(title,20),'')  else title end as title, left(cre_dtime, 7) as a_date_m, substring(cre_dtime,9,2) as a_date_d, if(char_length(cre_name) >3, concat(left(cre_name,2), '*', right(cre_name,1)), concat(left(cre_name,1), '*', right(cre_name,1))) as cre_name, date_format(cre_dtime, \"%Y.%m.%d\") as cre_dtime1 FROM tb_board where board_idx = 2 and secret_yn = 'N' and admin_del_yn = 'N' order by cre_dtime desc limit 5" ;
    _DBPool.query(queryString,[],function(err, rows, result) {

        if(err){

            console.log("QUERY ERROR: " + err);
        } else {


            req.topBoard2 = rows;
            next();
        }
    })
}

function freeBoard(req, res, next){


    var queryString = "select idx, board_idx, title, title2, a_date,(select cate_name from tb_cate where code_idx = board_gubun) as board_gubun, main_image_path, text1, text2, text3, text4, text5, top_fix, start_date, end_date, start_time, end_time, apply_url, cre_name, date_format(cre_dtime, \"%Y.%m.%d\") as cre_dtime from tb_board where board_idx = 9 order by top_fix desc, a_date desc,cre_dtime desc limit 5";
    _DBPool.query(queryString,[],function(err, rows, result) {

        if(err){

            console.log("QUERY ERROR: " + err);
        } else {


            req.freeBoard = rows;
            next();
        }


    })

}


function getKey(req, res, next){

    var api_url = 'https://openapi.naver.com/v1/captcha/nkey?code=' + code;
    var request = require('request');
    var options = {
        url: api_url,
        headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
    };
    request.get(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {

            var obj = JSON.parse(body);
            console.log(obj.key);

            req.key = obj.key;
            next();
        } else {
            //res.status(response.statusCode).end();
            console.log('error = ' + response.statusCode);
            next();
        }
    });


}

router.get('/captcha/image', function(req,res,next) {

    var api_url = 'https://openapi.naver.com/v1/captcha/ncaptcha.bin?key=' + req.query.key;
    var request = require('request');
    var options = {
        url: api_url,
        headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
    };
    console.log("{__dirname:"+__dirname);
    var writeStream = fs.createWriteStream(__dirname+'/captcha.jpg');
    var _req = request.get(options).on('response', function(response) {
        console.log("dir:"+JSON.stringify(writeStream)) // 200
        console.log("path:"+writeStream.path);
    });



    //_req.pipe(writeStream); // file로 출력
    _req.pipe(res); // 브라우저로 출력




})

router.get('/captcha/checkCaptcha', function (req, res) {

    console.log("checkCaptcha:"+req.query.key);
    code = "1";

    const secret_key = "6LcugM8UAAAAAJtLT5imWjve3Uh5Uw2aVi-LHt6k";
    const token = req.query.key;
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${token}`;


    var request = require('request');
    var options = {
        url: url,
        headers: {'Accept':'application/json', 'Content-Type': 'application/json'}
    };
    // request.get(options, function (error, response, body) {
    //     if (!error && response.statusCode == 200) {
    //         var result = JSON.parse(body);
    //         console.log("result:"+JSON.stringify(body));
    //         if(result.success == true){
    //             res.json("success");
    //         }else{
    //             res.json("failed");
    //         }
    //
    //
    //         res.end(body);
    //     } else {
    //         res.json("failed");
    //         res.status(response.statusCode).end();
    //         console.log('error = ' + response.statusCode);
    //     }
    // });

    res.json("success");

});

function fileUpload(req,res,next){

    console.log("fileUpload!!");
    const uploadInit = upload.multerInitFile('board').array('attatch', 2)
    uploadInit(req, res, (err) => {
        if (err) return next(err);

        next();
    });

};

function getCompany(req, res, next){


    _DBPool.query("SELECT cmp_idx, ifnull(cmp_name,'') as cmp_name, ifnull(cmp_number,'') as cmp_number, cmp_id, cmp_pass, cmp_phone, ifnull(cmp_fax,'') as cmp_fax,ifnull(cmp_address,'') as cmp_address, cmp_ceo_name, cmp_email, ifnull(cmp_logo_image,'') as cmp_logo_image, cmp_logo_path, ifnull(cmp_footer_image,'') as cmp_footer_image, cmp_footer_path, use_yn, ifnull(cmp_domain,'') as cmp_domain, date_format(expired_date,'%Y-%m-%d') as expired_date, cmp_notice, cmp_text1, cre_dtime FROM tb_company where cmp_id = 'admin'",[],function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            console.log("QUERY ERROR: " + err);
        }
        req.companyInfo = rows[0];
        next();
    });


}

function fileDelete(req, res, next){
    console.log(":::::::::::::fileDelete:::::::::::::::::::");
    var sess = req.session;
    console.log("/banner/info:"+sess.cmp_id);

    var cmpId = sess.cmp_id;
    var f_img = config.root+config.bannerFilePath+req.body.f_img;
    console.log("f_img:"+f_img);


    // Create a bucket and upload something into it
    if(req.body.f_img != '' && req.body.f_img != null){

        upload.fileDelete(f_img);


    }

}


function sendAdminPush(title, message){


    console.log("::::::::::::::sendAdminPush:::::::::::::::::");

    console.log("title:"+title+"   message:"+message);

    var dataMessage = message;

    async.waterfall([

        function (callback) {
            console.log('::::select recUserId Info::::');

            _DBPool.query("select cmp_token from tb_company where cmp_token is not null",[],function(err, rows, columns) {
                //_DBPool.end();

                if (err) {
                    console.log("REC USER INFO QUERY ERROR: " + err);

                }

                callback(null, rows);

            });


        },
        function (rows, callback) {
            // Use the connection


            if (rows != null) {




                for (var i = 0; i < rows.length; i++) {
                    var token = rows[i].cmp_token;

                    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                        to: token,
                        collapse_key: '',

                        notification: {
                            title: title,
                            body: dataMessage,
                            sound:"default",
                            click_action:"FCM_PLUGIN_ACTIVITY"
                        },

                        data: {  //you can send only notification or only data(or include both)
                            my_key: 'C',
                            my_another_key: '32'
                        }
                    };


                        //보내기만 하는 전송
                        fcm.send(message)
                            .then(function(response){
                                console.log("Successfully sent with response: ", response);
                            })
                            .catch(function(err){
                                console.log("Something has gone wrong!");
                                console.error(err);
                            });


                }


            }
            callback(null);
        }

    ], function (err) {



        if (err) {
            console.log('failed');
        }
    });



}

function sendPush(recUserId, title, message, bigo){
    //password에 token값 저장.
    console.log("::::::::::::::sendPush:::::::::::::::::");
    console.log("########idx:"+recUserId+"##########"+title+"#######"+message);
    //작성자의 id값과 게시글 idx, 토큰값 가져오기
    var pushMessage = message;
    var recUserDeviceId = "";



    async.waterfall([

        function (callback) {
            console.log('::::select recUserId Info::::');

            _DBPool.query("select token from tb_token where member_seq =? order by cre_date desc limit 1",[recUserId],function(err, rows, columns) {
                //_DBPool.end();
                if (err) {
                    console.log("REC USER INFO QUERY ERROR: " + err);

                }
                if(rows[0] != null && rows[0] != undefined) {
                    recUserDeviceId = rows[0].token;
                    callback(null);
                }
            });


        },
        function (callback) {
            // Use the connection


            if(recUserDeviceId != '' && recUserDeviceId != undefined){

                var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                    to: recUserDeviceId,
                    collapse_key: '',

                    notification: {
                        title: title,
                        body: pushMessage,
                        sound:"default",
                        click_action:"FCM_PLUGIN_ACTIVITY"
                    },

                    data: {  //you can send only notification or only data(or include both)
                        my_key: bigo,
                        my_another_key: ''
                    }
                };
                //보내기만 하는 전송
                fcm.send(message)
                    .then(function(response){
                        console.log("Successfully sent with response: ", response);
                    })
                    .catch(function(err){
                        console.log("Something has gone wrong!");
                        console.error(err);
                    });
            }else{
                console.log('recUserDeviceId == NULL');
            }

            callback(null);



        }

    ], function (err) {



        if (err) {
            console.log('failed');
        }
    });



}

router.post('/mypage/sendEstimate', function(req,res,next)
{

    console.log("sendEstimate");

    var sess = req.session;

    var idx = req.body.semuMatchIdx;
    var estimate = req.body.estimate;
    var contents = req.body.contents;
    var semuType = req.body.semuType;

    var bulbok = req.body.bulbok;
    var goji = req.body.goji;
    var charge_before = req.body.charge_before;
    var charge_center = req.body.charge_center;
    var charge_after = req.body.charge_after;
    var pyunggajasan = req.body.pyunggajasan;
    var pyunggadate = req.body.pyunggadate;
    var pyungga_submission_date = req.body.pyungga_submission_date;
    var gamsidaesang = req.body.gamsidaesang;
    var gamsiowner = req.body.gamsiowner;
    var jigubdate = req.body.jigubdate;

    var semusaStatus = req.body.semusaStatus;

    var query = "";
    var data = "";
    if(semuType == 'A' || semuType == 'B' ){

        data = [estimate, contents, semusaStatus, idx];
        query = "update tb_semu_match set estimate = ?, contents = ?, semusa_status = ?, mod_date = now() where idx = ?";

    }else if(semuType == 'C'){

        data = [estimate, bulbok, goji, charge_before, charge_after, contents, semusaStatus, idx];
        query = "update tb_semu_match set estimate = ?, bulbok= ?, goji= ?,charge_before= ?, charge_after= ?, contents = ?, semusa_status = ?, mod_date = now() where idx = ?";

    }else if(semuType == 'D'){

        data = [estimate, pyunggajasan, pyunggadate, charge_before, charge_after,pyungga_submission_date, contents, semusaStatus, idx];
        query = "update tb_semu_match set estimate = ?, pyunggajasan = ?, pyunggadate = ?,charge_before = ?, charge_after = ?,pyungga_submission_date = ?, contents = ?, semusa_status = ?, mod_date = now() where idx = ?";

    }else if(semuType == 'E'){

        data = [estimate, gamsidaesang, gamsiowner, charge_before,charge_center, charge_after,jigubdate, contents, semusaStatus, idx];
        query = "update tb_semu_match set estimate = ?, gamsidaesang = ?, gamsiowner = ?,charge_before = ?,charge_center = ?, charge_after = ?,jigubdate = ?, contents = ?, semusa_status = ?, mod_date = now() where idx = ?";

    }


    console.log("data:"+data);
    console.log("query:"+query);

    _DBPool.query(query,data,function(err, result) {
        //_DBPool.end();


        if (err) {
            console.log("matchingSave ERROR:"+err);
            var data = {result:'failed'};
            res.json(data);
        }

         sendAdminPush(sess.member_name+'세무사가 견적을 발송했습니다.', sess.member_name+'세무사가 견적을 발송했습니다.');
         sendAdminSMS(sess.member_name+'세무사가 견적을 발송했습니다.');
        var data = {result:'success'};
        res.json(data);
    });
});


router.get('/member/idCheck', function (req, res, next) {


    const member_id = req.query.member_id.trim();
    console.log("/member/idCheck::"+member_id);

    _DBPool.query("select member_status from tb_member where member_id = ?",[member_id.toLowerCase()],function(err, rows, columns) {
        //_DBPool.end();


        if (err) {
            console.log("idCheck ERROR:"+err);
            var data = {result:'failed'};
            res.json(data);
        }


        if(rows.length > 0) {

            if(rows[0].member_status == 'C'){
                var data = {result: 'withdraw'};

            }else{
                var data = {result: 'samerow'};

            }
            res.json(data);
        }else{
            var data = {result:'success'};
            res.json(data);
        }
    });


});

router.get('/member/phoneCheck', function (req, res, next) {


    const memberPhone = req.query.memberPhone.trim();
    console.log("/member/phoneCheck::"+memberPhone);

    _DBPool.query("select count(member_id) as cnt from tb_member where member_phone = ?",[memberPhone],function(err, rows, columns) {
        //_DBPool.end();


        if (err) {
            console.log("idCheck ERROR:"+err);
            var data = {result:'failed'};
            res.json(data);
        }

        console.log("rows[0].cnt:"+rows[0].cnt);
        if(rows[0].cnt == 0) {

            var data = {result: 'success'};
            res.json(data);
        }else{
            var data = {result:'samerow'};
            res.json(data);
        }
    });


});

router.get("/member/findId", function(req, res){
    res.render("find_id");
});

router.get("/member/findPw", function(req, res){
    res.render("find_pw");
});

router.get("/noPage/index", function(req, res){
    res.render("noMemberSearch");
});


router.get('/noMemberList/:name/:phone', function (req, res, next) {


    console.log(req.params.name);
    console.log(req.params.phone);
    var name = req.params.name;
    var phone = req.params.phone;

    var queryString = "select * from (\n" +
        "select idx,semu_type,\n" +
        "\tcase when semu_type = 'A' THEN '기장대행'\n" +
        "\t\t when semu_type = 'B' THEN  '신고대행'\n" +
        "\t\t when semu_type = 'C' THEN  '세무조사/불복'\n" +
        "\t\t when semu_type = 'D' THEN  '양도/상속/증여'\n" +
        "\t\t when semu_type = 'E' THEN  '컨설팅/평가/감사'\n" +
        "\t\t END as semu_type_name,\n" +
        " case when semu_type = 'A' THEN '기장대행 신청건입니다.'\n" +
        "\t\t when semu_type = 'B' THEN  '신고대행 신청건입니다.'\n" +
        "\t\t when semu_type = 'C' THEN  '세무조사/불복 신청건입니다.'\n" +
        "\t\t when semu_type = 'D' THEN  '양도/상속/증여 신청건입니다.'\n" +
        "\t\t when semu_type = 'E' THEN  '컨설팅/평가/감사 신청건입니다.'\n" +
        "\t\t END as title, \n" +
        "\t\t case when semu_status = 'A' THEN '접수완료'\n" +
        "\t\t when semu_status = 'B' THEN  '견적중'\n" +
        "\t\t when semu_status = 'C' THEN  '견적취소'\n" +
        "\t\t when semu_status = 'D' THEN  '견적완료'\n" +
        "\t\t when semu_status = 'E' THEN  '재견적 요청'\n" +
        "\t\t when semu_status = 'F' THEN  '선택완료'\n" +
        "\t\t END as semu_status, cre_date as cre_date1, date_format(cre_date, \"%Y.%m.%d\") as cre_dtime, ifnull((select member_name from tb_member where seq = (select semusa_idx from tb_semu_match c where c.match_status = 'C' and c.semu_idx = s.idx)),'N') as semusa from tb_semu s where name = ? and phone = ? \n" +
        ") a order by cre_date1 desc ";

    console.log("queryString:" + queryString);


    var data = {};
    _DBPool.query(queryString, [name, phone], function (err, rows, result) {
        //_DBPool.end();
        if (err) {
            console.log("QUERY ERROR: " + err);

        } else {

            res.render('noMem_consult_list', {
                data: rows
            });

        }


    });





});

router.get("/findId/:name/:phone", function(req, res){
    console.log(req.params.name);
    console.log(req.params.phone);
    var name = req.params.name;
    var phone = req.params.phone;

    var datas = [name, phone];
    var data = {};
    var query = "SELECT * FROM tb_member WHERE member_name = ? and member_phone = ?";

    _DBPool.query(query, datas, function(err, rows, columns){
        if(err){
            console.log("ERR : ", err);
        }else{
            if(rows.length > 0) {
                console.log("rows:"+rows);
                data = {result: "success", return: rows};
            }else{
                data = {result:"failed"}
            }

            res.json(data);
        }
    });
})

router.get("/findPw/:id/:name/:phone", function(req, res){
    console.log(req.params.id);
    console.log(req.params.name);
    console.log(req.params.phone);
    var id = req.params.id;
    var name = req.params.name;
    var phone = req.params.phone;

    var data = {};
    var query = "update tb_member set password = password(?) WHERE member_id=? and member_name = ? and member_phone = ?";


    var arr = "0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z".split(",");
    var randomPw = createCode(arr, 4);
    var datas = [randomPw, id, name, phone];



    _DBPool.query(query, datas, function(err, rows, columns){
        if(err){
            console.log("ERR : ", err);
            data = {result:"failed"}
        }else{

            if(rows.affectedRows> 0){
                sendNewPwFunc(id, randomPw);
            console.log("affectedRows:"+rows.affectedRows);

                data = {result: "success"};
                res.json(data);
            }else{
                data = {result:"failed"}
                res.json(data);
            }
        }
    });


})

//비밀번호 랜덤 함수
function createCode(objArr, iLength) {
    var arr = objArr;
    var randomStr = "";
    for (var j=0; j<iLength; j++) {
        randomStr += arr[Math.floor(Math.random()*arr.length)];
    }
    return randomStr
}

//이메일 발송함수
function sendNewPwFunc(email,pw){

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
            user: 'huenweb@huensystem.com',  // gmail 계정 아이디를 입력
            pass: 'huen3549'          // gmail 계정의 비밀번호를 입력
        }
    });
    var mailOptions = {
        from: 'huenweb@huensystem.com',
        to: email,
        subject: '잇다 임시 비밀번호 안내',
        html:'<h1>잇다에서 새로운 비밀번호를 보내드립니다.</h1> <h2>' + pw + '</h2>'
    };
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
            return false;
        } else {
            console.log('Email sent: ' + info.response);
            console.log("새로운 비밀번호가 발송되었습니다.");
            return true;
        }
    });

    return true;
}

router.get('/mypage/my_info/:type', common.areaList, function (req, res, next) {



    var sess = req.session;

    if(sess.member_id == null || sess.member_id == undefined){

        res.redirect('/');

    }

    console.log("mypage/my_info:"+req.params.type);

    var member_idx = sess.member_idx;







    var queryString = 'select * from tb_member where seq = ?';


    _DBPool.query(queryString,[member_idx],function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            console.log("QUERY ERROR: " + err);
        } else {


            console.log("rows[0]:"+JSON.stringify(rows[0]));
            if(req.params.type == 'A'){

                res.render('my_info1', {userInfo:rows[0], areaList:req.areaList});
            }else{
                res.render('my_info2', {userInfo:rows[0], areaList:req.areaList});
            }

        }
    });


});


    router.post('/member/modify/:type',fileUpload, function (req, res, next) {


        var sess = req.session;

        var type = req.params.type;

        console.log("modify:"+type);

        var memberSeq = req.body.memberSeq;
        var memberPhone = req.body.memberPhone;

        var zipcode = req.body.zipcode;
        var address1 = req.body.address1;
        var address2 = req.body.address2;
        var license_type = req.body.license_type;
        var auth_number  = req.body.auth_number;
        var affiliation = req.body.affiliation;
        var businessdistrict = req.body.saleArea;
        var carrer = req.body.carrer;
        var content = req.body.content;


        if(carrer != undefined && carrer != null){
            carrer = carrer.replace(/\n/gi, '<br/>');
        }
        if(content != undefined && content != null) {
            content = content.replace(/\n/gi, '<br/>');
        }
        var file1_name = "";
        var file1_orgname = "";
        var file1_path = "";


        if(req.files){


            if(req.files[0]){

                file1_name = req.files[0].filename;
                file1_orgname = req.files[0].originalname;
                file1_path = upload.changeDBPath(req.files[0].path);

            }


        }

        var query = "";
        var data = "";
        if(type == 'A'){

            data = [memberPhone, memberSeq];
            query = "update tb_member set member_phone = ? where seq = ?";

        }else{

            if(file1_name == ""){
                data = [memberPhone, zipcode, address1, address2,  auth_number, affiliation, carrer, content, memberSeq];
                query = "update tb_member set member_phone = ?,  zipcode = ?, address1 = ?, address2 = ?, license_type = '"+license_type+"', auth_number = ?, affiliation = ?, carrer = ?, content = ?, sale_area = '"+businessdistrict+"',  upd_dtime = now()  where seq = ?";

            }else{
                data = [memberPhone, zipcode, address1, address2,  auth_number, affiliation, carrer, content, file1_name ,file1_orgname, file1_path, memberSeq];
                query = "update tb_member set member_phone = ?,  zipcode = ?, address1 = ?, address2 = ?, license_type = '"+license_type+"', auth_number = ?, affiliation = ?, carrer = ?, content = ?,, image_name = ? ,image_org_name = ?, image_path = ?, sale_area = '"+businessdistrict+"',  upd_dtime = now()  where seq = ?";

            }


        }


        console.log("data:"+data);
        console.log("query:"+query);

        _DBPool.query(query,data,function(err, result) {
            //_DBPool.end();


            if (err) {
                console.log("join ERROR:"+err);
                var data = {result:'failed'};
                res.json(data);
            }

            sess.member_phone = memberPhone;

            var data = {result:'success', imagePath: file1_path};
            res.json(data);
        });



    });


/* 인증번호 발송 */ //문자 보내기 작업 추가해야함
router.post('/getVerifyNumber', function(req, res){
    console.log('######getVerifyNumber in######');
    var phone = req.body.member_phone;
    console.log('######1######', phone);
    var name = req.body.nick_name;
    console.log('######2######', name);
    var rtn = "";
    var rn3 = 0;
    var numbers = new Array;
    numbers = [ "0", "1", "2", "3", "4", "5", "6", "7", "8", "9" ];
    console.log('######3######', numbers);

    for (var i = 0; i < 6; i++) {
        console.log('######for######', i);
        rn3 = Math.floor(Math.random() * 10);
        rtn += numbers[rn3];
        console.log('######for1 ######', rtn);
    }

    console.log('######4######', rtn);
    var AWS = require('aws-sdk');

    AWS.config.update({
        "accessKeyId": configJs.accessKeyId,
        "secretAccessKey": configJs.secretAccessKey,
        "region": 'ap-northeast-1'
    });
    console.log('######sns1######');


    var params = {
        Message: '1811-7085 [웹발신][세무잇다] 인증번호는 '+rtn+' 입니다.',
        MessageStructure: 'string',
        PhoneNumber: '+82'+phone
    };
    console.log('######sns2######');

    var publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();

// Handle promise's fulfilled/rejected states
    publishTextPromise.then(
        function(data) {
            console.log("MessageID is " + data.MessageId);
        }).catch(
        function(err) {
            console.error(err, err.stack);
        });
    console.log('######sns3######');




    var data = {result: 'success', message: rtn};
    res.json(data);
});


function sendAdminSMS(message){


    console.log("::::::::::::::sendAdminSMS:::::::::::::::::");

    console.log(" message:"+message);

    var dataMessage = message;

    async.waterfall([

        function (callback) {
            console.log('::::select recUserId Info::::');

            _DBPool.query("select cmp_phone from tb_company where cmp_phone is not null",[],function(err, rows, columns) {
                //_DBPool.end();

                if (err) {
                    console.log("REC USER INFO QUERY ERROR: " + err);

                }

                callback(null, rows);

            });


        },
        function (rows, callback) {
            // Use the connection


            if (rows != null) {


                var phone = "";

                var AWS = require('aws-sdk');

                AWS.config.update({
                    "accessKeyId": configJs.accessKeyId,
                    "secretAccessKey": configJs.secretAccessKey,
                    "region": 'ap-northeast-1'
                });
                console.log('######sns1######');

                var sns = new AWS.SNS();
                console.log('######sns1######');



                for (var i = 0; i < rows.length; i++) {

                    console.log(rows[i].cmp_phone);
                    var params = {
                        Message: message,
                        MessageStructure: 'string',
                        PhoneNumber: '+82'+rows[i].cmp_phone
                    };
                    console.log('######sns2######');

                    sns.publish(params, function(err, data) {
                        if (err) console.log(err, err.stack); // an error occurred
                        else     console.log(data);           // successful response
                    });
                    console.log('######sns3######');



                }






            }
            callback(null);
        }

    ], function (err) {



        if (err) {
            console.log('failed');
        }
    });



}


function sendSMS(recUserId, message, bigo){
    //password에 token값 저장.
    console.log("::::::::::::::sendSMS:::::::::::::::::");
    console.log("########idx:"+recUserId+"#######"+message);
    //작성자의 id값과 게시글 idx, 토큰값 가져오기
    var recUserDeviceId = "";



    async.waterfall([
        function (callback) {
            console.log('::::select recUserId Info::::');
            var query = "";

            if(bigo == 'A'){
                query = "select phone from tb_semu where idx =?";
            }else{
                query = "select member_phone as phone from tb_member where seq = ?";

            }


            _DBPool.query(query,[recUserId],function(err, rows, columns) {
                //_DBPool.end();
                if (err) {
                    console.log("REC USER INFO QUERY ERROR: " + err);

                }

                if(rows[0] != null && rows[0] != undefined){

                    recUserDeviceId = rows[0].phone;
                    callback(null, recUserDeviceId);
                }
            });


        },
        function (recUserDeviceId, callback) {
            // Use the connection


            if(recUserDeviceId != '' && recUserDeviceId != undefined){

                var phone = "";

                var AWS = require('aws-sdk');

                AWS.config.update({
                    "accessKeyId": configJs.accessKeyId,
                    "secretAccessKey": configJs.secretAccessKey,
                    "region": 'ap-northeast-1'
                });
                console.log('######sns1######');

                var sns = new AWS.SNS();
                console.log('######sns1######');



                var params = {
                    Message: message,
                    MessageStructure: 'string',
                    PhoneNumber: '+82'+recUserDeviceId
                };
                console.log('######sns2######');

                sns.publish(params, function(err, data) {
                    if (err) console.log(err, err.stack); // an error occurred
                    else     console.log(data);           // successful response
                });
                console.log('######sns3######');


            }else{
                console.log('recUserDeviceId == NULL');
            }

            callback(null);



        }

    ], function (err) {



        if (err) {
            console.log('failed');
        }
    });



}

module.exports = router;

