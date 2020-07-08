var express = require('express');

var router = express.Router();
//   MySQL 로드
var mysql = require('mysql');
var async = require('async');
var common = require('./common');
var _DBPool = require('../../lib/DBPool');
const upload = require('../../lib/local_upload_util');
var config = require('../../lib/config');


// router.use(function(req, res, next) {
//     var sess = req.session;
//     console.log("member:"+sess.cmp_id);
//     if(sess.cmp_id == null){
//         console.log("member: session is undefiend");
//         res.redirect('/manager/users/login');
//     }else{
//         console.log("member: session is not undefiend");
//         res.locals.whoami = sess.cmp_id;
//         next();
//     }
// });

router.get('/list/:memberType', common.areaList, function(req, res) {

    var memberType = req.params.memberType;

    console.log("memberType:"+memberType);

    _DBPool.query("select a.seq, a.member_id, date_format(a.cre_dtime,'%Y-%m-%d %H:%i:%s') AS cre_dtime, a.member_name, a.member_auth_type, case when a.member_auth_type = 'A' then '일반회원' else '제휴사회원' end auth_type, a.content, case when a.member_status = 'A' then '승인회원' when a.member_status = 'C' THEN '탈퇴회원' when a.member_status = 'B' then '휴먼회원' else '비승인회원' end member_status, a.keyword, address1, address2, affiliation,\n" +
        "(select count(*) from tb_semu_match a where a.semusa_idx = seq) as cnt from tb_member a where member_auth_type = ? order by a.cre_dtime desc",[memberType],function(err, rows, columns) {

    if (err) {
            console.log("QUERY ERROR: " + err);
        }
        
        res.render('manager/users/list',{title : "회원관리", rows: rows, areaList:req.areaList, memberType: memberType});
        
   });

});

router.get('/login', function (req, res, next) {
    console.log('::::login::::');
    res.render('manager/users/login',{title : "로그인"});
    //res.redirect("http://54.180.163.44/manager/users/login")
});

router.get('/logout', function (req, res, next) {
    console.log('::::logout::::'+req.session.username);  
    req.session.destroy();
    res.clearCookie('steveNcorp'); // 세션 쿠키 삭제
    res.redirect('/manager/users/login');
});

router.post('/idcheck', function (req, res, next){
            
    var cmp_id = req.body.cmp_id;
    console.log("cmp_id:"+cmp_id);
    _DBPool.query("SELECT count(*) as cnt from tb_company where cmp_id = ?",[cmp_id],function(err, rows, columns) {

        if (err) {
            console.log("QUERY ERROR: " + err);
            res.json('faild');
        }
        
        if(rows != null){
            console.log("cnt:"+rows[0].cnt);
            if(rows[0].cnt == 0){
                res.json('success');
            }else{
                res.json('faild');
            }
        }else{
            res.json('faild');        
        }
         
   });
    
});

router.post('/login', function (req, res, next) {
    //console.log("id:"+req.body.username);
    //console.log("pass:"+req.body.password);
    var user_id = req.body.username;
    var user_pass = req.body.password;
    var datas = [user_id,user_pass];
    
    _DBPool.query("SELECT cmp_idx, cmp_name, cmp_id, date_format(expired_date,'%Y-%m-%d') as expired_date FROM tb_company where cmp_id = ? and cmp_pass = PASSWORD(?)",datas,function(err, rows, columns) {
        //_DBPool.release();
 
        if (err) {
            console.log("QUERY ERROR: " + err);
            res.json('faild');
        }

        //console.log("rows:"+rows);
        
        if(rows != ''){
            var sess = req.session;
            sess.cmp_id = rows[0].cmp_id;
            sess.cmp_type = rows[0].cmp_type;
            sess.cmp_idx = rows[0].cmp_idx;
            sess.cmp_expired = rows[0].expired_date; 
            
            res.json('success');
        }else{
            res.json('faild');        
        }
   });
 
});

router.post('/read', function(req, res) {
    var sess = req.session;
    console.log("/member/read/:"+req.body.m_idx);

    var m_idx = req.body.m_idx;

    var datas = [];

    var  query = "select a.seq, a.member_id, a.password, a.member_auth_type, a.zipcode, a.address1, a.address2, date_format(a.cre_dtime,'%Y-%m-%d %H:%i:%s') AS cre_dtime, a.member_name, a.member_phone, a.license_type,a.auth_number, a.affiliation, a.sale_area, a.image_name, a.image_org_name, a.image_path, a.member_status, a.content, a.view_yn, a.keyword, a.viewLevel, a.viewYn from tb_member a ";
        query += " where a.seq = ?";

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


router.post('/write',fileUpload, function(req,res,next)
{

    var member_id = req.body.member_id;
    var member_name = req.body.member_name;
    var member_pwd = req.body.password;
    var member_phone = req.body.member_phone;
    var address1 = req.body.address1;
    var address2 = req.body.address2;
    var zipcode = req.body.zipcode;
    var licenseType = req.body.licenseType;
    var authNumber = req.body.authNumber;
    var affiliation = req.body.affiliation;
    var saleArea = req.body.saleArea;
    var memberAuthType = req.body.memberAuthType;
    var content = req.body.content;
    var image_name = "";
    var image_org_name = "";
    var image_path = "";
    var image_size = "";
    var member_status = req.body.memberStatus;
    var keyword = req.body.keyword;


    var datas = [member_id, member_name, member_pwd, member_phone, address1, address2, zipcode,  authNumber, affiliation, memberAuthType, content, member_status, keyword];
    var query = "insert into tb_member (member_id, member_name, password, member_phone, address1, address2, zipcode, license_type, auth_number, affiliation, sale_area, member_auth_type, content, member_status, keyword, cre_dtime) values (?,?,password(?),?,?,?,?,'"+licenseType+"',?,?,'"+saleArea+"',?,?,?,?, now())";


    if(req.file){

        image_name = req.file.filename;
        image_org_name = req.file.originalname;
        image_size = req.file.size;
        image_path = upload.changeDBPath(req.file.path);

        datas = [member_id, member_name, member_pwd, member_phone, address1, address2, zipcode,  authNumber, affiliation, memberAuthType, content, member_status, keyword, image_name, image_org_name, image_size, image_path];
        query = "insert into tb_member (member_id, member_name, password, member_phone, address1, address2, zipcode, license_type, auth_number, affiliation, sale_area, member_auth_type, content, member_status, keyword, image_name, image_org_name, image_size, image_path, cre_dtime) values (?,?,password(?),?,?,?,?,'"+licenseType+"',?,?,'"+saleArea+"',?,?,?,?,?,?,?,?, now())";
    }





    if(memberAuthType == 'A'){
        datas = [member_id, member_name,  member_pwd, member_phone, memberAuthType, member_status, keyword];
        query = "insert into tb_member (member_id, member_name, password, member_phone, member_auth_type, member_status, keyword, cre_dtime) value (?,?,password(?),?,?,?,?, now()) ";
    }


    console.log("query:"+query);
    console.log("data:"+datas);

    _DBPool.query(query,datas,function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            res.json('failed');
        }

        res.json('success');

    });

});

router.post('/update', fileUpload, function(req,res,next)
{

    var a_idx = req.body.seq;
    var member_name = req.body.member_name;
    var member_pwd = req.body.password;
    var member_phone = req.body.member_phone;
    var address1 = req.body.address1==null?'':req.body.address1;
    var address2 = req.body.address2==null?'':req.body.address2;
    var zipcode = req.body.zipcode==null?'':req.body.zipcode;
    var licenseType = req.body.licenseType==null?'':req.body.licenseType;
    var authNumber = req.body.authNumber==null?'':req.body.authNumber;
    var affiliation = req.body.affiliation==null?'':req.body.affiliation;
    var saleArea = req.body.saleArea==null?'':req.body.saleArea;
    var memberAuthType = req.body.memberAuthType;
    var content = req.body.content;
    content = content.replace(/\n/gi, '<br/>');
    var f_img = req.body.f_img;
    var view_yn = req.body.view_yn;
    var member_status = req.body.memberStatus;
    var deleteFileCheck = req.body.fileDelete;
    var keyword = req.body.keyword;
    var viewLevel = req.body.viewLevel;
    var image_name = "";
    var image_org_name = "";
    var image_path = "";
    var image_size = "";

    var pwd_check = req.body.pwdCheck;
    console.log("pwd_check:"+memberAuthType);

    var datas = [member_name, member_phone, address1, address2, zipcode, authNumber, affiliation, memberAuthType, member_status, content, view_yn, keyword, viewLevel, a_idx];

    if(req.file){
        console.log("/banner/UPDATE:"+req.file.originalname+";;"+req.file.filename+";;"+req.file.size+";;"+req.file.path);

        image_name = req.file.filename;
        image_org_name = req.file.originalname;
        image_size = req.file.size;
        image_path = upload.changeDBPath(req.file.path);

        fileDelete(req,res,next);

        datas = [member_name, member_phone, address1, address2, zipcode, authNumber, affiliation, memberAuthType, member_status, content, view_yn, keyword, viewLevel, image_name, image_org_name, image_size, image_path, a_idx];


    }





    if(memberAuthType == 'A'){
        datas = [member_name, member_phone, memberAuthType,member_status, keyword, a_idx];
    }

    var query = "update tb_member set member_name = ?, member_phone=?, address1 = ?, address2 = ?, zipcode = ?, license_type = '"+licenseType+"', auth_number = ?, affiliation = ?, sale_area = '"+saleArea+"', member_auth_type = ?, member_status = ?, content = ?, view_yn = ?, keyword = ?, viewLevel = ?, upd_dtime = NOW() ";
    if(req.file){
        query +=",image_name = ?, image_org_name = ?, image_size = ?, image_path = ?";
    }

    if(deleteFileCheck == 'Y'){
        query +=",image_name = '', image_org_name = '', image_size = '', image_path = ''";
    }

    if(memberAuthType == 'A') {
        query = "update tb_member set member_name = ?, member_phone=?, member_auth_type = ?, member_status = ?, keyword = ?, upd_dtime = NOW() ";
    }

        if(pwd_check == '1'){
            if(memberAuthType == 'A') {
                datas = [member_name, member_phone, memberAuthType,member_status, keyword, member_pwd, a_idx];
            }else{

                if(req.file) {
                    datas = [member_name, member_phone, address1, address2, zipcode, authNumber, affiliation, memberAuthType, member_status, content, view_yn,member_status, keyword, viewLevel, image_name, image_org_name, image_size, image_path, member_pwd, a_idx];

                }else{
                    datas = [member_name, member_phone, address1, address2, zipcode, authNumber, affiliation, memberAuthType, member_status, content, view_yn,member_status, keyword, viewLevel, member_pwd, a_idx];

                }
            }
            query +=",password=password(?) ";
        }

    query += " where seq = ?";
    console.log("query:"+query);
    console.log("data:"+datas);

    _DBPool.query(query,datas,function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            res.json('failed');
        }

        res.json('success');

    });

});

router.post('/leave', function(req, res){
    var member_idx = req.body.seq;


    console.log("member_idx:"+member_idx);
    var data = [member_idx];
    var query1 = "update tb_member set member_id = '-', password='-', member_phone='-', member_status = 'C', cancel_dtime = now() WHERE seq = ?";
    var query2 = "DELETE from tb_member WHERE seq = ?";



    async.waterfall([
        function (callback) {
            console.log("UPDATE tb_MEMBER ");
            _DBPool.query(query1, data, function(err, rows, columns) {
                //_DBPool.release();
                console.log(query1);
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
            res.json('success');
        }
    });


});

router.post('/deleteFile', function(req, res){
    var member_idx = req.body.seq;


    console.log("member_idx:"+member_idx);
    var data = [member_idx];
    var query1 = "update tb_member set image_name = '', image_org_name = '', image_size = '', image_path = '' WHERE seq = ?";



    async.waterfall([
        function (callback) {
            console.log("UPDATE tb_MEMBER ");
            _DBPool.query(query1, data, function(err, rows, columns) {
                //_DBPool.release();
                console.log(query1);
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
            res.json('success');
        }
    });


});


function fileUpload(req,res,next){

    console.log("fileUpload!!");
    const uploadInit = upload.multerInitImg('banner').single('bgImage');
    uploadInit(req, res, (err) => {
        if (err) return next(err);

        next();
    });

};



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

module.exports = router;
