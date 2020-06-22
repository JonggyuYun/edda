var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var path =  require('path');
var _DBPool = require('../../lib/DBPool');
var common = require('./common');

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


router.get('/list/:cateType', cate1, cate2, function(req, res) {
    var sess = req.session;
    console.log("/code:"+sess.cmp_idx);
    
    var cateType = req.params.cateType;
    console.log("/cateType:"+cateType);
    var title = "";
    var subTitle = "";
    if(cateType == 'A'){
        title = "부서 관리";
        subTitle = "부서";
    }else if(cateType == 'B'){
        title = "직급 관리";
        subTitle = "직급";
    }else{
        title = "임직원 관리";
        subTitle = "임직원";
    }

    _DBPool.query("SELECT idx, c_mcode, c_mname, c_code, c_name, c_level, use_yn FROM tb_code where c_class = ? order by c_mcode desc",[cateType],function(err, rows, columns) {
        //_DBPool.end();
 		console.log('ROWS : ', rows);
        if (err) {
            console.log("QUERY ERROR: " + err);
        }

        res.render('manager/code/list',{title : title, subTitle: subTitle, cateList: req.cate1,cateList2: req.cate2, cateType: cateType, rows: rows});
         
   });
    
});


router.post('/write', function(req,res,next)
{
    var sess = req.session;
    console.log("/code/write:"+sess.cmp_idx);
       
    var c_mcode = req.body.mcode==null?'A0000':req.body.mcode;
    var c_mname = req.body.mname==null?'A0000':req.body.mname;
    var c_name  = req.body.c_name;
    var use_yn  = req.body.use_yn;
    var cmp_id  = sess.cmp_id;
    var c_class = req.body.cateType;
    
    var datas = [c_mcode,c_mcode,c_mcode, c_mname, c_name,c_class, use_yn, cmp_id, cmp_id];
   var query = "insert into tb_code(c_code,c_mcode,c_mname, c_name, c_class,use_yn,c_level,cre_id,cre_dtime,upd_id,upd_dtime) values((SELECT concat(left(?,1),lpad(substring(ifnull(max(a.c_code),0),2,5)+1,4,0)) from tb_code a where a.c_mcode = ?),?,?,?,?,?,1,?,now(),?,now())";

   if(c_class == 'C'){
       datas = [c_mcode,c_mcode, c_mname, c_name,c_class, use_yn, cmp_id, cmp_id];
      query = "insert into tb_code(c_code,c_mcode,c_mname, c_name, c_class,use_yn,c_level,cre_id,cre_dtime,upd_id,upd_dtime) values(?,?,?,?,?,?,1,?,now(),?,now())"
   }
    console.log("data:"+datas);
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
    
    console.log("/code/delete:"+req.body.idx);
       
    var idx = req.body.idx;

    _DBPool.query("delete from tb_code where idx = ?",[idx],function(err, rows, columns) {
        //_DBPool.end();
 
        if (err) {
            res.json('failed');
        }
        res.json('success');
    });
});

router.post('/update', function(req,res,next)
{
       
    var sess = req.session;
    
    var idx = req.body.idx;
    var c_name = req.body.c_name;
    var use_yn = req.body.use_yn;
    var cmp_id  = sess.cmp_id;
    
    var datas = [c_name, use_yn, cmp_id, idx];
    
    var query = "update tb_code set c_name = ?, use_yn = ?, upd_id = ?, upd_dtime = now() where idx = ?";
   		
    _DBPool.query(query,datas,function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            res.json('failed');
        }

        res.json('success');
    });   
});

router.post('/updateTime', function(req,res,next)
{
       
    var sess = req.session;
    
    var idx = req.body.idxT;
    var c_name = req.body.c_nameT;
    var cmp_id  = sess.cmp_id;
    
    var datas = [c_name, cmp_id, idx];
    
    var query = "update tb_code set c_name = ?, upd_id = ?, upd_dtime = now() where idx = ?";
   		
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
    //console.log("idx:"+idx);
    
    _DBPool.query("select idx, c_mcode, c_mname, c_code, c_name, c_level, use_yn from tb_code where idx=?",[idx],function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            data = {result: 'failed'};
            res.json(data);
        }
        data = {result: 'success', dbdata: rows[0]};
        res.json(data);
    });   
});


router.get('/menuCount',  function(req,res,next){
    console.log(":::::::::menuCount::::::::::");

    var data ={};

    _DBPool.query("select semu_type,count(idx) as cnt from tb_semu where semu_status = 'A' group by semu_type",[],function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            data = {result: 'failed'};
           // res.json(data);
        }else{
            data = {result: 'success', dbdata: rows};
        }
        res.json(data);
    });
});

function cate1(req, res, next){
    console.log("::::::::::::::cate1:::::::::::::::::");
    var query = "select c_name, c_code from tb_code where use_yn = 'Y' and c_class = 'A' order by c_code";
    var datas = [];

    _DBPool.query(query, datas,function(err, rows, columns) {
        // A 'node-style' callback will usually be callback(error, value)
        if (err) {
            console.log("err:"+err);
        }
        console.log("rows:"+rows);
        req.cate1 =  rows;
        next();
    });
}

function cate2(req, res, next){
    console.log("::::::::::::::cate2:::::::::::::::::");
    var query = "select c_name, c_code from tb_code where use_yn = 'Y' and c_class = 'B' order by c_code";
    var datas = [];

    _DBPool.query(query, datas,function(err, rows, columns) {
        // A 'node-style' callback will usually be callback(error, value)
        if (err) {
            console.log("err:"+err);
        }
        console.log("rows:"+rows);
        req.cate2 =  rows;
        next();

    });
}

module.exports = router;
