var express = require('express');
var router = express.Router();
var _DBPool = require('../../lib/DBPool');
var config = require('../../lib/config');
var async = require('async');
const upload = require('../../lib/local_upload_util');
var FCM = require('fcm-push');
var serverKey = 'AAAArlstieY:APA91bHFcYCWYbJo2BMhRU3K9efjXrCP6AfRTOd8njVm2K_ge-Gyt0Q4oMm8pA556gomcMxF4PgBGnmHwfdRcBiQyDPQSb5wS6GS7gE8tn-mTiBuBcDz5Qtem8ln1xgm-F0Bb8QVP1Zn'; //put your server key here
var fcm = new FCM(serverKey);

router.use(function(req, res, next) {
    var sess = req.session;
    console.log("member:"+sess.cmp_id);
    if(sess.cmp_id == null){
        console.log("member: session is undefiend");
        res.redirect('/manager/users/login');
    }else{
        console.log("member: session is not undefiend");
        res.locals.whoami = sess.cmp_id;
        next();
    }
});



router.get('/list/:semuType', semusaSelect, function (req,res,next) {

    console.log(":::::::::semu/list/"+req.params.semuType);

    var semuType = req.params.semuType;
    var title = "기장대행";

    if(semuType == 'A'){
        title = "기장대행";
    }else if(semuType == 'B'){
        title = "신고대행";
    }else if(semuType == 'C'){
        title = "세무조사/불복";
    }else if(semuType == 'D'){
        title = "양도/상속/증여";
    }else{
        title = "컨설팅/평가/감사";
    }

    var query = "select \n" +
        "idx, name, phone, email, (select c_name from tb_code a where c_code = area) as area, \n" +
        "case \n" +
        "when semu_type = 'A' then (select cate_name from tb_cate a where board_idx = 1 and cate_code = type1)\n" +
        "when semu_type = 'B' then (select cate_name from tb_cate a where board_idx = 2 and cate_code = type1)\n" +
        "when semu_type = 'C' then (select cate_name from tb_cate a where board_idx = 3 and cate_code = type1)\n" +
        "end as type1, type2, upjong, jikwonsu, kijangcharge, sodukgubun, budongsan, gumyoung, \n" +
        "etccharge, etc, companyname, companymoney, bimil, \n" +
        "case when member_gubun = 'A' then '회원' else '비회원' end as member_gubun, \n" +
        "title, link1, link2, file1_name, file1_orgname, file1_path, file2_name, file2_orgname, file2_path, \n" +
        "semu_type, date_format(cre_date,'%Y-%m-%d %H:%i:%s') as cre_date, date_format(upd_date,'%Y-%m-%d %H:%i:%s') as upd_date,\n" +
        "case when semu_status = 'A' then '접수' when semu_status = 'B' then '견적중' when semu_status = 'C' then '견적취소' when semu_status = 'E' then '재견적요청' when semu_status = 'F' then '선택완료' else '견적완료' end as semu_status\n" +
        "from tb_semu where semu_type = ? order by cre_date desc";


    _DBPool.query(query,[semuType],function(err, rows, columns) {

        if (err) {
            console.log("QUERY ERROR: " + err);
        }

        res.render('manager/semu/list',{title : title, rows: rows, semuType: semuType, semusaSelect: req.semusaSelect});

    });
});


router.post('/read', function(req, res) {

    console.log("/semu/read/:"+req.body.idx);

    var m_idx = req.body.idx;

    var datas = [];

    var query = "select \n" +
        "idx, name,member_idx, phone, email, (select c_name from tb_code a where c_code = area) as area, area as areaCode, \n" +
        "type1, type2, upjong, jikwonsu, kijangcharge, sodukgubun, budongsan, gumyoung, \n" +
        "etccharge, etc, companyname, companymoney, bimil, \n" +
        "case when member_gubun = 'A' then '회원' else '비회원' end as member_gubun, \n" +
        "title, link1, link2, file1_name, file1_orgname, file1_path, file2_name, file2_orgname, file2_path, \n" +
        "semu_type, date_format(cre_date,'%Y-%m-%d %H:%i:%s') as cre_date, date_format(upd_date,'%Y-%m-%d %H:%i:%s') as upd_date,\n" +
        "semu_status\n" +
        "from tb_semu "

    query += " where idx = ?";

    datas = [m_idx];

        console.log("query:"+query);

    _DBPool.query(query, datas,function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            data = {result: 'failed'};
            res.json(data);
        }
        data = {result: 'success', dbdata: rows[0]};
        res.json(data);
    });
});

router.post('/viewSemusa', function(req, res) {

    console.log("/semu/viewSemusa/:"+req.body.idx);

    var m_idx = req.body.idx;

    var datas = [];

    var query = "select idx, semu_idx, (select concat(member_name,'(',affiliation,')') from tb_member a where seq = semusa_idx) as semusa_naem, semusa_idx, member_idx, estimate, bulbok, goji, charge_before, charge_center, charge_after, pyunggajasan, pyunggadate, pyungga_submission_date, gamsidaesang, gamsiowner, jigubdate, contents, cre_date, mod_date, match_status from tb_semu_match where idx = ?"


    datas = [m_idx];



    _DBPool.query(query, datas,function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            data = {result: 'failed'};
            res.json(data);
        }
        data = {result: 'success', dbdata: rows[0]};
        res.json(data);
    });
});


router.post('/readMatching', function(req, res) {

    console.log("/semu/readMatching/:"+req.body.idx);

    var m_idx = req.body.idx;

    var datas = [];

    var query = "select idx, (select concat(member_name,'(',affiliation,')') from tb_member a where seq = semusa_idx) as semusa_name, semu_idx, semusa_idx, member_idx, estimate, bulbok, goji, charge_before, charge_center, charge_after, pyunggajasan, pyunggadate, pyungga_submission_date, gamsidaesang, gamsiowner, jigubdate, contents, cre_date, mod_date, match_status from tb_semu_match where semu_idx = ?"


    datas = [m_idx];



    _DBPool.query(query, datas,function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            data = {result: 'failed'};
            res.json(data);
        }
        data = {result: 'success', dbdata: rows};
        res.json(data);
    });
});

router.post('/getSemuList', function(req, res) {

    console.log("/semu/getSemuList/");

    var m_search = req.body.semuSearch;
    var areaCode = req.body.areaCode==null?"":req.body.areaCode;

    console.log("areaCode:"+areaCode);
    var datas = [];

    var query = "select * from tb_member where member_auth_type = 'B' and member_status = 'A'  ";

    if(m_search != undefined && m_search != ''){
         query += " and member_name like '%"+m_search+"%' ";
    }

    if(areaCode != undefined && areaCode != ''){
        query += " and sale_area like '%"+areaCode+"%' ";
    }


    query+= " order by member_name ";

    console.log("query:"+query+ "m_search:"+m_search+ "areaCode:"+areaCode);

    _DBPool.query(query, datas,function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            data = {result: 'failed'};
            res.json(data);
        }
        data = {result: 'success', dbdata: rows};
        res.json(data);
    });
});

router.post('/getSendMatchSemusaList', function(req, res) {

    console.log("/semu/getSendMatchSemusaList/");

    var m_semuIdx = req.body.idx;

    var m_type = req.body.type;
    var datas = [m_semuIdx];

    var query = "select a.idx, b.member_name, ifnull(a.estimate,0) as estimate, b.member_phone, b.affiliation, case when semusa_status = 'A' then '견적요청' when semusa_status = 'B' then '견적완료' else '견적반려' end semusa_status, case when match_status = 'A' then '고객발송대기' when match_status = 'B' then '고객발송' else '선택완료' end as match_status from tb_semu_match a left outer join tb_member  b on a.semusa_idx = b.seq\n" +
        "where a.semu_idx = ? ";

    if(m_type == 'B'){

        query += " and a.semusa_status IN ('B','D') ";
    }

    console.log("query:"+query+ "m_search:"+m_semuIdx);

    _DBPool.query(query, datas,function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            data = {result: 'failed'};
            res.json(data);
        }
        data = {result: 'success', dbdata: rows};
        res.json(data);
    });
});


router.post('/matchingSave', function(req,res,next)
{


    var idx = req.body.semuIdx;
    var semuType = req.body.semuType;
    var semuSelect = req.body.semuSelect;
    var estimate = req.body.estimate;
    var contents = req.body.contents;
    var semuText = req.body.semuText;

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

    var query = "";
    var data = "";
    if(semuType == 'A' || semuType == 'B' ){

        data = [idx, semuSelect, idx, estimate, contents];
        query = "insert into tb_semu_match (semu_idx, semusa_idx, member_idx, estimate, contents, cre_date) values (?, ?, (select member_idx from tb_semu a where a.idx = ?), ?, ?, now())";

    }else if(semuType == 'C'){

        data = [idx, semuSelect, idx, estimate, bulbok, goji, charge_before, charge_after, contents];
        query = "insert into tb_semu_match (semu_idx, semusa_idx, member_idx, estimate, bulbok, goji,charge_before, charge_after, contents, cre_date) values (?, ?, (select member_idx from tb_semu a where a.idx = ?), ?, ?, ?, ?, ?, ?, now())";

    }else if(semuType == 'D'){

        data = [idx, semuSelect, idx, estimate, pyunggajasan, pyunggadate, charge_before, charge_after,pyungga_submission_date, contents];
        query = "insert into tb_semu_match (semu_idx, semusa_idx, member_idx, estimate, pyunggajasan, pyunggadate,charge_before, charge_after,pyungga_submission_date, contents, cre_date) values (?, ?, (select member_idx from tb_semu a where a.idx = ?), ?, ?, ?, ?, ?, ?, ?, now())";

    }else if(semuType == 'E'){

        data = [idx, semuSelect, idx, estimate, gamsidaesang, gamsiowner, charge_before,charge_center, charge_after,jigubdate, contents];
        query = "insert into tb_semu_match (semu_idx, semusa_idx, member_idx, estimate, gamsidaesang, gamsiowner,charge_before,charge_center, charge_after,jigubdate, contents, cre_date) values (?, ?, (select member_idx from tb_semu a where a.idx = ?), ?, ?, ?, ?, ?, ?, ?, ?  , now())";

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
        var clubSn = result.insertId;
        console.log("clubSn:"+clubSn);
        var data = {result:'success', idx:clubSn, semu_text:semuText};
        res.json(data);
    });
});

router.post('/matchingModify', function(req,res,next)
{


    var idx = req.body.semuMatchIdx;
    var semuType = req.body.semuType;
    var semuSelect = req.body.semuSelect;
    var estimate = req.body.estimate;
    var contents = req.body.contents;
    var semuText = req.body.semuText;

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

    var query = "";
    var data = "";
    if(semuType == 'A' || semuType == 'B' ){

        data = [semuSelect, estimate, contents, idx];
        query = "update tb_semu_match set semusa_idx = ?, estimate = ?, contents = ?, mod_date = now() where idx = ?";

    }else if(semuType == 'C'){

        data = [semuSelect, estimate, bulbok, goji, charge_before, charge_after, contents, idx];
        query = "update tb_semu_match set semusa_idx = ?, estimate = ?, bulbok= ?, goji= ?,charge_before= ?, charge_after= ?, contents = ?, mod_date = now() where idx = ?";

    }else if(semuType == 'D'){

        data = [semuSelect, estimate, pyunggajasan, pyunggadate, charge_before, charge_after,pyungga_submission_date, contents, idx];
        query = "update tb_semu_match set semusa_idx = ?, estimate = ?, pyunggajasan = ?, pyunggadate = ?,charge_before = ?, charge_after = ?,pyungga_submission_date = ?, contents = ?, mod_date = now() where idx = ?";

    }else if(semuType == 'E'){

        data = [semuSelect, estimate, gamsidaesang, gamsiowner, charge_before,charge_center, charge_after,jigubdate, contents, idx];
        query = "update tb_semu_match set semusa_idx = ?, estimate = ?, gamsidaesang = ?, gamsiowner = ?,charge_before = ?,charge_center = ?, charge_after = ?,jigubdate = ?, contents = ?, mod_date = now() where idx = ?";

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

        var data = {result:'success', idx:idx, semu_text:semuText};
        res.json(data);
    });
});


router.post('/statusUpdate', function(req,res,next)
{

        console.log("statusUpdate start!");
    var idx = req.body.idx;
    var semuStatus = req.body.semu_status;
    var member_idx = req.body.memberIdx;
    var memberName = req.body.name;
    console.log("memberName:"+memberName);
    data = [semuStatus, idx];
    query = "update tb_semu set semu_status = ? where idx  = ?";

    var title = "";
    var message = "";

    //A:접수 B:견적중 D:견적완료 E:재견적요청

    if(semuStatus == 'B'){
        title = "견적을 시작했습니다!";
        message = memberName+" 고객님의 세무견적신청이 접수되었습니다. -세무잇다주식회사";
    }else if(semuStatus == 'D'){
        title = memberName+"님! 요청하신 견적서를 보내드립니다.";
        message = memberName+" 고객님! 요청하신 견적서가 도착했습니다. [세무잇다]홈페이지 우측 상단의 [내견적현황]에서 세무사를 선택하세요.";
    }


    console.log("data:"+data);
    console.log("query:"+query);

        _DBPool.query(query,data,function(err, result) {
        //_DBPool.end();


        if (err) {
            console.log("statusUpdate ERROR:"+err);
            res.json('failed');
        }

        if(member_idx != null && member_idx != undefined && member_idx != 0){
            if(semuStatus == 'B' || semuStatus == 'D') {
                //push 모듈 춛가
                sendPush(member_idx, title, message, 'A');

            }
        }

            sendSMS(idx, " "+message, 'A');

        res.json('success');
    });
});

router.post('/deleteSemu', function(req,res,next)
{


    var idx = req.body.idx;

        data = [idx];
        query = "delete from tb_semu_match where idx  = ?";


    console.log("data:"+data);
    console.log("query:"+query);

    _DBPool.query(query,data,function(err, result) {
        //_DBPool.end();


        if (err) {
            console.log("matchingSave ERROR:"+err);
            res.json('failed');
        }


        res.json('success');
    });
});

router.post('/selectSemusa', function(req,res,next)
{


    var idxs = req.body.idxs;
    var semuIdx = req.body.semuIdx;
    var memberIdx = req.body.memberIdx;
    console.log("idxs:"+idxs+ " semuIdx:"+semuIdx+" memberIdx:"+memberIdx);

    query = "insert into tb_semu_match (semu_idx, semusa_idx, member_idx, cre_date) values (?,?,?, now())";
    var semusaSeq = (idxs.split(','));
    for (var idx in semusaSeq) {
        console.log(semusaSeq[idx]);
        data = [semuIdx, semusaSeq[idx], memberIdx];
        console.log("data:"+data);
        console.log("query:"+query);
        _DBPool.query(query,data,function(err, result) {
            //_DBPool.end();


            if (err) {
                console.log("insert tb_semu_match ERROR:"+err);

            }


        });
        sendPush(   semusaSeq[idx], "새로운 견적요청입니다.", "[세무잇다]홈페이지 우측 상단의 [내견적현황]에서 견적서를 작성, 발송하세요.", "B");
        sendSMS(semusaSeq[idx], "새로운 견적요청입니다. [세무잇다]홈페이지 우측 상단의 [내견적현황]에서 견적서를 작성, 발송하세요.", 'B');

    }
  res.json('success');

});

router.post('/sendSemusa', function(req,res,next)
{


    var idxs = req.body.idxs;
    console.log("idxs:"+idxs);

    query = "update tb_semu_match set match_status = 'B' where idx = ?";
    var semusaSeq = (idxs.split(','));
    for (var idx in semusaSeq) {
        console.log(semusaSeq[idx]);
        data = [idx];
        console.log("data:"+data);
        console.log("query:"+query);
        _DBPool.query(query,data,function(err, result) {
            //_DBPool.end();


            if (err) {
                console.log("insert tb_semu_match ERROR:"+err);

            }
        });
    }
    res.json('success');

});

function semusaSelect(req, res, next){



    var query = "select seq, member_name, affiliation from tb_member where member_auth_type = 'B' and member_status = 'A'";


    _DBPool.query(query,[],function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            console.log("QUERY ERROR: " + err);
        }


        req.semusaSelect =  rows;
        next();

    });



}

function sendPush(recUserId, title, message, bigo){
    //password에 token값 저장.
    console.log("::::::::::::::sendPush:::::::::::::::::");
    console.log("########idx:"+recUserId+"##########"+title+"#######"+message);
    //작성자의 id값과 게시글 idx, 토큰값 가져오기
    var recUserDeviceId = "";



    async.waterfall([
        function (callback) {
            console.log('::::select recUserId Info::::');

            _DBPool.query("select token from tb_token where member_seq =? order by cre_date desc limit 1",[recUserId],function(err, rows, columns) {
                //_DBPool.end();
                if (err) {
                    console.log("REC USER INFO QUERY ERROR: " + err);

                }

                if(rows[0] != null && rows[0] != undefined){

                recUserDeviceId = rows[0].token;
                callback(null, recUserDeviceId);
                }
            });


        },
        function (recUserDeviceId, callback) {
            // Use the connection


            if(recUserDeviceId != '' && recUserDeviceId != undefined){

                var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                    to: recUserDeviceId,
                    collapse_key: '',

                    notification: {
                        title: title,
                        body: message,
                        sound:"default",
                        click_action:"FCM_PLUGIN_ACTIVITY"
                    },

                    data: {  //you can send only notification or only data(or include both)
                        my_key: bigo,
                        my_another_key: ''
                    }
                };
                console.log("##########PUSHMESSAGE : ",message);
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
                    "accessKeyId": "AKIAJKGRG2HDX7EBW5BQ",
                    "secretAccessKey": "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",
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

function sendAdminPush(title, message){


    console.log("::::::::::::::sendAdminPush:::::::::::::::::");


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
                    console.log("token:" + token);



                    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                        to: token,
                        collapse_key: '',

                        notification: {
                            title: title,
                            body: message
                        },

                        data: {  //you can send only notification or only data(or include both)
                            my_key: '',
                            my_another_key: ''
                        }
                    };
                    console.log("##########PUSHMESSAGE : ",message);
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


router.post('/deleteSemusa', function(req,res,next)
{


    var idxs = req.body.idxs;

    console.log("idxs:"+idxs);

    query = "delete from  tb_semu_match where idx in ("+idxs+")";
    // var semusaSeq = (idxs.split(','));
    // for (var idx in semusaSeq) {
    //     console.log(semusaSeq[idx]);
    //     data = [semuIdx, semusaSeq[idx], memberIdx];
    //     console.log("data:"+data);
        console.log("query:"+query);
        _DBPool.query(query,[],function(err, result) {
            //_DBPool.end();


            if (err) {
                console.log("insert tb_semu_match ERROR:"+err);
                res.json('failed');
            }

            res.json('success');
        });



});

module.exports = router;