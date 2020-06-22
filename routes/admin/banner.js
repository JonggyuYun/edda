var express = require('express');
var router = express.Router();
var _DBPool = require('../../lib/DBPool');
var config = require('../../lib/config');
var fs = require('fs');
const upload = require('../../lib/local_upload_util');





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


router.get('/list', function(req, res) {
    var sess = req.session;
    console.log("/banner/list:"+sess.cmp_idx);
    var domain= req.host;
    console.log("domain:"+domain);

    res.render('manager/banner/list',{title : "메인 캐러셀 관리"});

});

router.post('/bannerList', totalCount, function(req, res) {
    var sess = req.session;
    console.log("/banner/bannerList:"+sess.cmp_idx);


    var draw = req.body.draw;
    var start = req.body.start;
    var length = req.body.length==-1?10000000000:req.body.length;

    var search = req.body['search[value]'];
    console.log("draw:"+draw);
    console.log("start:"+start);
    console.log("length:"+length);
    console.log("search:"+search);


    var total = req.totalCount;
    console.log("total:"+total);

    var query = "SELECT idx, title, subTitle, position, case when global_type = 'KR' then '국문' else '영문' end as global_type, use_yn, date_format(upd_dtime,'%Y-%m-%d %H:%i:%s') as upd_dtime FROM tb_banner where 1 = 1 ";

    if(search != undefined && search != ''){

        query += "and (title like '%"+search+"%' or subTitle like '%"+search+"%') ";
    }

        query += " ORDER BY idx DESC  limit "+start+","+length+" ";
            console.log(query);
            _DBPool.query(query,[],function(err, rows, columns) {
                //_DBPool.end();

                if (err) {
                    console.log("QUERY ERROR: " + err);
                }

                var data = JSON.stringify({
                    "draw": req.body.draw,
                    "recordsFiltered": total,
                    "recordsTotal": total,
                    "data": rows
                });

                res.send(data);

            });
});


router.post('/write', fileUpload, function(req,res,next)
{
    var sess = req.session;


    var cmp_idx = sess.cmp_idx;
    var cmp_id = sess.cmp_id;
    var image_name;
    var image_org_name;
    var image_size;
    var image_path;

    var title = req.body.title;
    var subTitle = req.body.subTitle;
    var position = req.body.position;
    var banner_url = req.body.bannerLink;
    var use_yn = req.body.use_yn;
    var bannerType = req.body.bannerType;
    var bannerLinkOpen = req.body.bannerLinkOpen;
    var globalType = req.body.globalType;

    var datas = [title, subTitle, position,  bannerType, banner_url, bannerLinkOpen, globalType, use_yn, cmp_id, cmp_id];
    var query = "insert into tb_banner(title, subTitle, position, banner_type, banner_link, banner_link_open_type, global_type, use_yn, cre_id, cre_dtime, upd_id, upd_dtime) values (?,?,?,?,?,?,?,?,?, now(),?,now())";

    if(bannerType == 'A' && req.file){

        image_name = req.file.filename;
        image_org_name = req.file.originalname;
        image_size = req.file.size;
        image_path = upload.changeDBPath(req.file.path);

        datas = [title, subTitle, position, bannerType, banner_url, bannerLinkOpen, globalType, use_yn, image_name, image_org_name, image_size, image_path, cmp_id, cmp_id];
        query = "insert into tb_banner(title, subTitle, position, banner_type, banner_link, banner_link_open_type, global_type, use_yn, image_name, image_org_name, image_size, image_path, cre_id, cre_dtime, upd_id, upd_dtime) values (?,?,?,?,?,?,?,?,?,?,?,?,?, now(),?,now())";
    }
    console.log("datas:"+datas);
    console.log("query:"+query);


    _DBPool.query(query,datas,function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            res.json('failed');
        }
        res.json('success');
    });
});



router.post('/delete', function(req,res,next)
{


    var idx = req.body.idx;

    fileDelete(req,res,next);

    _DBPool.query("delete from tb_banner where idx = ?",[idx],function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            res.json('failed');
        }
        res.json('success');
    });
});

router.post('/update', fileUpload,  function(req,res,next)
{

    var sess = req.session;
    var cmp_id = sess.cmp_id;
    var idx = req.body.idx;
    var image_name = "";
    var image_org_name = "";
    var image_path = "";
    var image_size = "";

    var title = req.body.title;
    var subTitle = req.body.subTitle;
    var position = req.body.position;
    var banner_url = req.body.bannerLink;
    var use_yn = req.body.use_yn;
    var bannerType = req.body.bannerType;
    var f_img = req.body.f_img;
    var bannerLinkOpen = req.body.bannerLinkOpen;
    var globalType = req.body.globalType;

    if(req.file){
        console.log("/banner/UPDATE:"+req.file.originalname+";;"+req.file.filename+";;"+req.file.size+";;"+req.file.path);

        image_name = req.file.filename;
        image_org_name = req.file.originalname;
        image_size = req.file.size;
        image_path = upload.changeDBPath(req.file.path);

        fileDelete(req,res,next);

        var datas = [title, subTitle, bannerType, bannerLinkOpen, globalType, position,  use_yn, banner_url, image_name, image_org_name, image_size, image_path, cmp_id, idx];

    }else{
        var datas = [title, subTitle, bannerType, bannerLinkOpen, globalType, position, use_yn, banner_url, cmp_id, idx];
    }




    var query = "update tb_banner set title=?, subTitle=?, banner_type = ?, banner_link_open_type = ?, global_type = ?, position = ?,  use_yn=?, banner_link=?";
    if(req.file){
        query +=",image_name = ?, image_org_name = ?, image_size = ?, image_path = ?";
    }

    if(f_img != '' && f_img != null && bannerType != 'A'){
        fileDelete(req,res,next);

        query +=",image_name = '', image_org_name = '', image_size = 0, image_path = ''";

    }


    query += ", upd_id = ?, upd_dtime = now() where idx=?";
    console.log("datas:"+datas);
    console.log("query:"+query);

    _DBPool.query(query,datas,function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            res.json('failed');
        }

        res.json('success');

    });

});


router.post('/read',  function(req,res,next){
    console.log(":::::::::read::::::::::");

    var idx = req.body.idx;
    console.log("idx:"+idx);
    
    _DBPool.query("select idx, title, subTitle, position, image_name, banner_type, image_org_name, image_size, image_path, banner_link, banner_link_open_type, global_type, use_yn from tb_banner where idx = ?",[idx],function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            data = {result: 'failed'};
            res.json(data);
        }
        data = {result: 'success', dbdata: rows[0]};
        res.json(data);

    });
});


function totalCount(req, res, next){

    var sess = req.session;
    console.log("/totalCount/:"+sess.cmp_idx);

    var draw = req.body.draw;
    var start = req.body.start;
    var length = req.body.length==-1?10000000000:req.body.length;

    var search = req.body['search[value]'];
    console.log("draw:"+draw);
    console.log("start:"+start);
    console.log("length:"+length);
    console.log("search:"+search);

    var query = "SELECT count(*) as cnt FROM tb_banner where 1 = 1 ";

    if(search != undefined && search != ''){

        query += "and (title like '%"+search+"%' or subTitle like '%"+search+"%') ";
    }
    console.log(query);
    _DBPool.query(query,[],function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            console.log("QUERY ERROR: " + err);
        }

        console.log("totalCont:"+rows[0].cnt);
        req.totalCount =  rows[0].cnt;
        next();

    });



}


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
