var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var path =  require('path');
var _DBPool = require('../../lib/DBPool');
var config = require('../../lib/config');
var fs = require('fs');
var s3 = require('../../lib/S3Manager');
var multer  = require('multer');
var S3FS = require('s3fs');
var bucketPath = 'ydi.company';
var s3Options = {
    aaccessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    "region": config.region

};
var fsImpl = new S3FS(bucketPath, s3Options);

var storage = s3.storage('company');
var upload = multer({ storage : storage,  limits: { fileSize: 2097152 }});
var cpUpload = upload.fields([{ name: 'cmp_logo_image', maxCount: 1 }, { name: 'cmp_footer_image', maxCount: 1 }]);

/* GET users listing. */

router.use(function(req, res, next) {
    var sess = req.session;
    console.log("member:"+sess.cmp_id);
    if(sess.cmp_id == null){
        console.log("member: session is undefiend");
        res.redirect('/manager/users/login');
    }else{
        console.log("company: session is not undefiend");
        res.locals.whoami = sess.cmp_id;
        next();
    }
});


router.get('/', function(req, res) {
    var sess = req.session;
    console.log("/company/:"+sess.cmp_id);

    _DBPool.query("SELECT cmp_idx, ifnull(cmp_name,'') as cmp_name, ifnull(cmp_number,'') as cmp_number, cmp_id, cmp_pass, cmp_phone, ifnull(cmp_fax,'') as cmp_fax,ifnull(cmp_address,'') as cmp_address, cmp_ceo_name, cmp_email, ifnull(cmp_logo_image,'') as cmp_logo_image, cmp_logo_path, ifnull(cmp_footer_image,'') as cmp_footer_image, cmp_footer_path, use_yn, ifnull(cmp_domain,'') as cmp_domain, date_format(expired_date,'%Y-%m-%d') as expired_date, cmp_notice, cmp_text1, cre_dtime FROM tb_company where cmp_id = ?",[sess.cmp_id],function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            console.log("QUERY ERROR: " + err);
        }
        console.log("cmp_name:"+rows[0].cmp_name);
        res.render('manager/company/list',{title : "기본정보관리", rows: rows[0]});
    });
});

router.get('/:cmp_idx', function(req, res) {
    var cmp_idx = req.params.cmp_idx;
    console.log("/:"+cmp_idx);

    _DBPool.query("SELECT cmp_idx, cmp_name, cmp_number, cmp_id, cmp_pass, cmp_phone, cmp_fax, cmp_address, cmp_ceo_name, cmp_email, use_yn, cre_dtime FROM tb_company where cmp_idx = ?",[cmp_idx],function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            console.log("QUERY ERROR: " + err);
        }
        res.render('manager/member/member',{title : "기본정보관리", rows: rows[0]});
    });
});


router.post('/memberOut', function (req,res,next) {

    var cmpIdx = req.body.cmp_idx;
    console.log("cmpIdx:"+cmpIdx);

    var query = "update tb_company set cmp_id= '-', cmp_pass = '-', cmp_name='-' , cmp_number='-', cmp_phone = '-', cmp_fax = '-', cmp_address = '-', cmp_ceo_name = '-', cmp_email = '-', cmp_domain = '-', ";
    query +=" cmp_logo_image = '-', cmp_logo_path = '-', USE_YN = 'C0003',";
    query += " upd_dtime=now() where cmp_idx=?";
    console.log("query:"+query);
    _DBPool.query(query,[cmpIdx],function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            res.json('failed');
        }


        req.session.destroy();
        res.clearCookie('steveNcorp'); // 세션 쿠키 삭제


        res.json('success');
    });

});

router.post('/update',cpUpload, function(req,res,next)
{

    var cmpId      = req.body.cmp_id;
    var cmpNum     = req.body.cmp_idx;
    var cmpName    = req.body.cmp_name;
    var cmpNumber  = req.body.cmp_number;
    var cmpPhone   = req.body.cmp_phone;
    var cmpFax     = req.body.cmp_fax;
    var cmpAddress = req.body.cmp_address;
    var cmpCeoName = req.body.cmp_ceo_name;
    var cmpEmail   = req.body.cmp_email;
    var cmpDomain  = req.body.cmp_domain;
    var useYn      = 'Y';
    var cmp_notice = req.body.cmp_notice;
        cmp_notice = cmp_notice.replace(/\n/gi, '<br/>');
    var cmp_text1  = req.body.cmp_text1;
    cmp_text1 = cmp_text1.replace(/\n/gi, '<br/>');
    var cmpLogoImage       = "";
    var cmpLogoImagePath   = "";
    var cmpFooterImage     = "";
    var cmpFooterImagePath = "";

    var datas2 = new Array;
    var datas3 = new Array;
    var datas4 = new Array;
    
    var datas = [cmp_notice, cmp_text1];//,cmp_text1
    console.log(req.files['cmp_logo_image']);
    
    if(req.files['cmp_logo_image']){
        
        cmpLogoImage = req.files['cmp_logo_image'][0].key;
        cmpLogoImagePath = req.files['cmp_logo_image'][0].location;

        datas2 = [cmpLogoImage, cmpLogoImagePath];
        
        console.log("/company/update:datas2"+datas2);

    }
    
    if(req.files['cmp_footer_image']){
        
        cmpFooterImage = req.files['cmp_footer_image'][0].key;
        cmpFooterImagePath = req.files['cmp_footer_image'][0].location;

        datas3 = [cmpFooterImage, cmpFooterImagePath];
        
        console.log("/company/update:datas3"+datas3);

    }
    
    datas4 = [cmpNum];
    datas = datas.concat(datas2, datas3, datas4);
    
    console.log("datas:"+datas);
    
    var query = "update tb_company set  cmp_notice=?, cmp_text1 = ?, upd_dtime=now() ";//cmp_text1=?,
    
    if(req.files['cmp_logo_image'])
    {
        query +=", cmp_logo_image = ?, cmp_logo_path = ? ";
    }
    
    if(req.files['cmp_footer_image'])
    {
        query +=", cmp_footer_image = ?, cmp_footer_path = ? ";
    }
    
    query += " where cmp_idx= ?";

    console.log("query:"+query);
    _DBPool.query(query,datas,function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            res.json('failed');
        }

        res.json('success');
    });
});


function fileDelete(req, res, next){
    console.log(":::::::::::::fileDelete:::::::::::::::::::");
    var sess = req.session;
    console.log("/company/update:"+sess.cmp_id);

    var cmpId = sess.cmp_id;
    var f_img = req.body.f_img;
    console.log("f_img:"+f_img);


    // Create a bucket and upload something into it
    if(f_img != '' && f_img != null){
        fsImpl.unlink(f_img).then(function() {
            // Directory has been recursively deleted
            console.log("delete file:"+f_img);
        }, function(reason) {
            // Something went wrong
        });
    }

}

router.post('/pwdChange', function(req,res,next)
{


    var cmp_idx = req.body.cmp_idx;
    var re_pwd = req.body.re_pwd;
    var new_pwd = req.body.new_pwd;

    var datas = [new_pwd, re_pwd, cmp_idx];


    var query = "update tb_company set cmp_pass = PASSWORD(?), upd_dtime=now() WHERE cmp_pass = PASSWORD(?) AND cmp_idx = ?";
    _DBPool.query(query,datas,function(err, result) {
        //_DBPool.end();
        if (err) {
            res.json('failed');
        }
        console.log("rows:"+result.changedRows);
        if(result.changedRows > 0){
            res.json('success');
        }else{
            res.json('failed');
        }
    });
});

module.exports = router;
