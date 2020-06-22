var express = require('express');
var router = express.Router();
var _DBPool = require('../../lib/DBPool');
var config = require('../../lib/config');
var async = require('async');
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

/* GET users listing. */
router.get('/:board_idx', function(req, res, next) {
    // 그냥 board/ 로 접속할 경우 전체 목록 표시로 리다이렉팅
    var board_idx = req.params.board_idx;
	console.log('##############');
	console.log(board_idx);
	console.log('##############');
    res.redirect('/manager/community/list/'+board_idx);
});

// 리스트 전체 보기 GET
router.get('/list/:board_idx',  cate_info, board_list, board_info, board_render);

//게시글 저장 POST
router.post('/write', fileUpload, writeBoard, writeFile);

//게시글 수정 POST
router.post('/update', fileUpload, modifyBoard, writeFile);

//게시글 삭제 POST
router.post('/delete', deleteBoard );

//게시글 파일삭제 POST
router.post('/deleteFile', deleteFile);

//게시글 블라인드 처리 POST
router.post('/contentAdminDelete', deleteAdminBoard );

//게시글 읽기 POST
router.post('/read', board_file_list, comment_list, function(req,res,next){
    console.log(":::::::::read::::::::::");
     
    var idx = req.body.idx;
       
    _DBPool.query("select idx, cre_id, upd_id, board_idx, title, title2, board_gubun, a_date, text1, text2, text3, text4, text5, secret_yn, top_fix, start_date, start_time, end_date, end_time, apply_url, content2, content3, cre_name, cre_email, cre_pwd, memo, tag, replace(content,'<br/>','\n') as content, main_image_name, main_image_path, date_format(cre_dtime,'%Y-%m-%d %H:%i:%s') cre_dtime, hit, ios_url, android_url FROM tb_board where idx=?",[idx],function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            data = {result: 'failed'};
            res.json(data);
        }
        data = {result: 'success', dbdata: rows[0], fileData: req.fileList, commentData: req.comment_list};
        console.log("datarow[0]:"+rows[0]);
        res.json(data);
    });   
});


router.post('/commentList', function(req, res, next){
             
    console.log(":::::::::commentList:::::::::");

    var idx = req.body.idx;

    console.log("idx:"+idx);

    var query = "select idx, comment, date_format(cre_dtime,'%Y-%m-%d %H:%i:%s') AS cre_dtime, depth, top_idx, cre_id FROM tb_board_comment where board_idx = ?  order by  idx desc";
    var data = "";

    _DBPool.query(query,[idx],function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            console.log("err:"+err);
            res.json('failed');
        } else {

            data = {result: 'success', commentList: rows};
            res.json(data);
        }
    });   
});

router.post('/commentFList', function(req, res, next){
                     
    console.log(":::::::::commentFList:::::::::");

    var idx = req.body.idx;

    console.log("idx:"+idx);

    var query = "select idx, comment, date_format(cre_dtime,'%Y-%m-%d %H:%i:%s') AS cre_dtime, depth, top_idx, cre_id FROM tb_board_comment where board_idx = ? and depth = 0   order by  idx asc";
    var data = "";


    _DBPool.query(query,[idx],function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            console.log("err:"+err);
            res.json('failed');
        } else {

            data = {result: 'success', commentList: rows};
            res.json(data);
        }
    });   
});


router.post('/commentDetail', function(req, res, next){
             
            
    console.log(":::::::::commentDetail:::::::::");

    var idx = req.body.idx;

    console.log("idx:"+idx);

    var query = "select idx, replace(comment,'<br/>','\n') as comment, date_format(cre_dtime,'%Y-%m-%d %H:%i:%s') AS cre_dtime, depth, top_idx, cre_id FROM tb_board_comment where idx = ?";
    var data = "";


    _DBPool.query(query,[idx],function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            console.log("err:"+err);
            res.json('failed');
        } else {

            data = {result: 'success', commentDetail: rows[0]};
            res.json(data);
        }
    });   
});


router.post('/commentWrite', function(req, res, next){
                     
    console.log(":::::::::commentWrite:::::::::");

    var idx = req.body.idx;
    var comment = req.body.comment;
    comment = comment.replace(/\n/gi, '<br/>');
    console.log("idx:"+idx);

    var query = "insert INTO tb_board_comment (board_idx, top_idx, depth, cre_id, user_name, comment, cre_dtime) select board_idx, top_idx, 0, 'admin', '관리자',?, NOW() FROM tb_board_comment a where idx = ?";
    var data = "";

    _DBPool.query(query,[comment, idx],function(err, rows, columns) {
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


router.post('/commentFWrite', function(req, res, next){        
            
    console.log(":::::::::commentFWrite:::::::::");

    var sidx = req.body.sidx;
    var didx = req.body.didx;
    var comment = req.body.comment;
    comment = comment.replace(/\n/gi, '<br/>');
    console.log("idx:"+sidx);

    var query = "INSERT INTO tb_board_comment (board_idx, cre_id, name, comment, cre_dtime) VALUES (?,'admin','관리자',?, now())";
    var data = "";

    _DBPool.query(query,[sidx, comment],function(err, rows, columns) {
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


router.post('/commentFModify', function(req, res, next){
                   
    console.log(":::::::::commentFModify:::::::::");

    var sidx = req.body.idx;
    var didx = req.body.didx;
    var comment = req.body.comment;
    comment = comment.replace(/\n/gi, '<br/>');
    console.log("idx:"+sidx);

    var query = "update tb_board_comment set comment = ? where idx = ?";
    var data = "";

    _DBPool.query(query,[comment, sidx],function(err, rows, columns) {
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



function deleteAdminBoard(req, res, next){
    console.log("::::::::::::::deleteAdminBoard:::::::::::::::::");
    
    var idx = req.body.idx;
    var sess  = req.session;
    var cmpId = sess.cmp_id;

    var query = "update tb_board set admin_del_yn='Y', upd_id=?, upd_dtime=now() where idx = ?";

     _DBPool.query(query,[cmpId, idx],function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            console.log("err:"+err);
            res.json('failed');
        } else {

            var query1 = "update tb_board_comment set admin_del_yn='Y', upd_id=?, upd_dtime=now() where idx = ?";

            _DBPool.query(query1,[cmpId, idx],function(err, rows, columns) {
                //_DBPool.end();

                if (err) {
                    console.log("err:"+err);
                    res.json('failed');
                } else {

                    data = {result: 'success'};
                    res.json(data);
                }
            });    
        }
    });   
}

router.post('/commentDelete', function(req, res, next){
                
    console.log(":::::::::commentDelete:::::::::");

    var idx = req.body.idx;
    console.log("idx:"+idx);

    var query = "delete FROM tb_board_comment where idx = ?";


    _DBPool.query(query,[idx],function(err, rows, columns) {
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

router.post('/ckeditor/upload', imageUpload, function (req, res,next) {


    if(req.file){

        var image_name = req.file.filename;
        var image_org_name = req.file.originalname;
        var image_size = req.file.size;
        var image_path = upload.changeDBPath(req.file.path);
        console.log("file upload success!!"+image_path);
        //res.write("<script type='text/javascript'>\nwindow.parent.CKEDITOR.tools.callFunction(1, '" + image_path + "', '');\n</script>")
        //res.end();
        res.json({fileName: image_org_name, uploaded:1, url:image_path});
    }


})

function imageUpload(req,res,next){

    console.log("fileUpload!!");
    const uploadInit = upload.multerInitImg('board').single('upload');
    uploadInit(req, res, (err) => {
        if (err) return next(err);

    next();
});

};


router.post('/commentFDelete', function(req, res, next){       
            
    console.log(":::::::::commentFDelete:::::::::");

    var sidx = req.body.sIdx;
    var didx = req.body.dIdx;

    console.log("sidx:"+sidx+" didx:"+didx);

    var query = "delete FROM tb_board_comment where idx in (?,?)";


    _DBPool.query(query,[sidx,didx],function(err, rows, columns) {
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

function board_file_list(req,res,next){
     console.log(":::::::::board_file_list::::::::::");
     var idx = req.body.idx;
     console.log("idx:"+idx);
    
      _DBPool.query("SELECT idx, board_idx, filename, originalname, mimetype, path, size FROM tb_board_file where board_idx = ?",[idx],function(err, rows, columns) {
        //_DBPool.end();
 
        if (err) {
          return res.end("QUERY ERROR: " + err);
        }
        
        req.fileList = rows;
        next();
   });
}


function board_list(req,res,next){
    
    var board_idx = req.params.board_idx;
    console.log(":::::::::board_list::::::::::");
    
    _DBPool.query("SELECT b.idx, b.board_idx, b.cre_id, b.title, b.title2, (select cate_name from tb_cate where code_idx = b.board_gubun) as board_gubun, b.content, date_format(b.upd_dtime,'%Y-%m-%d %H:%i:%s') as upd_dtime, b.hit, (SELECT COUNT(*) FROM tb_board_comment where board_idx = b.idx) as comment_cnt, b.admin_del_yn, ifnull(c.admin_del_yn,'') as comment_admin_del_yn, b.cre_name FROM tb_board b left outer join tb_board_comment c on b.idx = c.board_idx where b.board_idx = ? order by b.idx asc",[board_idx],function(err, rows, columns) {
        //_DBPool.end(); c
 
        if (err) {
          return res.end("QUERY ERROR: " + err);
        }
        
        req.boardList = rows;
		//console.log("BOARD_LIST : " , rows);
        next();
   });
    
}


function comment_list(req,res,next){
    
    var board_idx = req.body.idx;

    console.log(":::::::::comment_list::::::::::" + board_idx);
    _DBPool.query("SELECT idx, board_idx, top_idx, replace(comment,'<br/>','\n') as comment FROM tb_board_comment where board_idx = ? ",[board_idx],function(err, rows, columns) {
        //_DBPool.end();
 
        if (err) {
            return res.end("QUERY ERROR: " + err);
        }
        
        req.comment_list = rows;
        next();

   });
    
} 


function board_render(req,res){
    
    console.log(":::::::::board_render::::::::::")
    res.render('manager/community/list',{title : "게시판 리스트",
                         boardList : req.boardList,
                         boardInfo : req.boardInfo,
                         cateList : req.cateList
    }); 
    
}

function board_info(req,res,next){
    console.log("::::::::::::::board_info:::::::::::::::::");
    var board_idx = req.params.board_idx;
    console.log(board_idx);
    console.log("::::::::::::::board_info:::::::::::::::::");
    _DBPool.query("SELECT board_idx, board_type, board_name, file_yn, file_num, comment_yn, cre_dtime FROM tb_board_master where board_idx=?",[board_idx],function(err, rows, columns) {
        //_DBPool.end();
 
        if (err) {
          return res.end("QUERY ERROR: " + err);
        }
        
        req.boardInfo = rows[0];
		console.log('Board_info : ', rows[0])
        next();
    });   
}

function cate_info(req,res,next){
    console.log("::::::::::::::cate_info:::::::::::::::::");
    var board_idx = req.params.board_idx;
    console.log(board_idx);
    console.log("::::::::::::::cate_info:::::::::::::::::");
    _DBPool.query("SELECT code_idx, cate_code,cate_name FROM tb_cate where board_idx=?",[board_idx],function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            return res.end("QUERY ERROR: " + err);
        }

        req.cateList = rows;
        console.log('cate_info : ', rows);
        next();
    });
}

function writeBoard(req, res, next){
    console.log("::::::::::::::writeBoard:::::::::::::::::");
    
    var board_idx = req.body.board_idx;
    var boardType = req.body.boardType;
    var cre_id = "admin";

    var title = req.body.title;
    var title2 = req.body.title2;
    var content = req.body.content;
    var boardGubun = req.body.boardGubun;
    var text1 = req.body.text1;
    var text2 = req.body.text2;
    var text3 = req.body.text3;
    var text4 = req.body.text4;
    var text5 = req.body.text5;

    var startDate = req.body.startDate;
    var startTime = req.body.startTime;
    var endDate = req.body.endDate;
    var endTime = req.body.endTime;
    var applyUrl = req.body.applyUrl;

    var content1 = req.body.content1;
    var content2 = req.body.content2;
    var content3 = req.body.content3;
    var creName = req.body.creName;
    var creEmail = req.body.creEmail;
    var crePwd = req.body.crePwd;

    var memo = req.body.memo;
    var tag = req.body.tag;


    if(boardType == 'D'){
        content = content1;
    }

    var topFix = req.body.topFix==null?"N":req.body.topFix;
    var comment = req.body.comment;
    var comment_idx = req.body.comment_idx;

    var a_date = req.body.a_date;

    //content = content.replace(/\n/gi, '<br/>');
    console.log("::::::::::::::board_idx:::::::::::::::::"+board_idx);
    var main_img_name = "";
    var main_img_path = "";
    var main_img_org = "";

    var datas = new Array;
    var query = "";

    if (req.files){
    if (req.files['main_image'])
    {
        main_img_name = req.files['main_image'][0].filename;
        main_img_path = upload.changeDBPath(req.files['main_image'][0].path);
        main_img_org = req.files['main_image'][0].originalname;

        console.log("main_img_name:"+main_img_name);
    }
    }

    datas = [board_idx, title, title2, boardGubun, a_date, content, main_img_name, main_img_path, main_img_org, text1, text2, text3, text4, text5, topFix, startDate, startTime, endDate, endTime, applyUrl,content2, content3, creName, creEmail, crePwd, memo,tag, cre_id,  cre_id];



    query  = "insert into tb_board(board_idx, title, title2, board_gubun, a_date, content, main_image_name, main_image_path, main_image_orgname, text1, text2, text3, text4, text5, top_fix, start_date, start_time, end_date, end_time, apply_url, content2, content3, cre_name, cre_email, cre_pwd, memo, tag, cre_id, cre_dtime,  upd_id, upd_dtime ";

    query += ") values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,password(?),?,?,?, now(), ?, now() ";

    query += ")";

    console.log("datas1:"+datas);


    async.waterfall([
        function (callback) {
            console.log('::::insert into tb_board::::');

            _DBPool.query(query,datas,function(err, rows, columns) {
                //_DBPool.end();

                if (err) {
                    console.log("QUERY ERROR: " + err);
                    callback("error");
                }
                req.board_key = rows.insertId;
                console.log("req.board_key:"+req.board_key);
                callback(null);
            });


        },
        function (callback) {
            // Use the connection
            // _DBPool.query("update tb_member set alaram_count = alaram_count+1",[],function(err, rows, columns) {
            //     //_DBPool.end();
            //
            //     if (err) {
            //         console.log("err:"+err);
            //         callback("error");
            //     }

                callback(null);

            // });

        }

    ], function (err) {



        if (err) {
            next();
        } else {
            next();
        }
    });
}

function modifyBoard(req, res, next){
    console.log("::::::::::::::modifyBoard:::::::::::::::::");
    var idx = req.body.idx;
    var board_idx = req.body.board_idx;
    var boardType = req.body.boardType;
    var cre_id = "admin";

    var title = req.body.title;
    var title2 = req.body.title2;
    var content = req.body.content;
    var boardGubun = req.body.boardGubun;
    var text1 = req.body.text1;
    var text2 = req.body.text2;
    var text3 = req.body.text3;
    var text4 = req.body.text4;
    var text5 = req.body.text5;

    var startDate = req.body.startDate;
    var startTime = req.body.startTime;
    var endDate = req.body.endDate;
    var endTime = req.body.endTime;
    var applyUrl = req.body.applyUrl;

    var content1 = req.body.content1;
    var content2 = req.body.content2;
    var content3 = req.body.content3;
    var creName = req.body.creName;
    var creEmail = req.body.creEmail;
    var crePwd = req.body.crePwd;

    var memo = req.body.memo;
    var tag = req.body.tag;
    if(boardType == 'D'){
        content = content1;
    }

    var topFix = req.body.topFix==null?"N":req.body.topFix;
    var secretYn = req.body.secretYn==null?"N":req.body.secretYn;
    var comment = req.body.comment;
    var comment_idx = req.body.comment_idx;

    var a_date = req.body.a_date;

    console.log("board_idx:"+board_idx);
    var datas = new Array;
    var datas2 = new Array;
    var datas3 = new Array;
    //console.log("content1:"+content);
    //content = content.replace(/\n/gi, '<br/>');
    //comment = comment.replace(/\n/gi, '<br/>');
    var main_img_name = "";
    var main_img_path = "";
    var main_img_org  = "";

    console.log("board_idx2:"+board_idx);
    if(req.files) {
    if(req.files['main_image']) {

        console.log("main_image yes!");


        var f_img1 = req.body.b_main_img;

        console.log("f_img1:" + f_img1);

        // Create a bucket and upload something into it
        if (f_img1 != '' && f_img1 != null) {
            fileDelete(req, res, next);
        }

        main_img_name = req.files['main_image'][0].filename;
        main_img_path = upload.changeDBPath(req.files['main_image'][0].path);
        main_img_org = req.files['main_image'][0].originalname;

        datas = [cre_id, title, title2, content, boardGubun, main_img_name, main_img_org, main_img_path,  cre_id, text1, text2, text3, text4, text5, secretYn, topFix, startDate, startTime, endDate, endTime, applyUrl, content2, content3, creName, creEmail, memo, tag, a_date];

    }else{
        console.log("board_idx3:"+board_idx);
        datas = [cre_id, title, title2, content, boardGubun,  cre_id, text1, text2, text3, text4, text5, secretYn, topFix, startDate, startTime, endDate, endTime, applyUrl, content2, content3, creName, creEmail, memo, tag, a_date];

    }
    }else{
        console.log("board_idx3:"+board_idx);
        datas = [cre_id, title, title2, content, boardGubun,  cre_id, text1, text2, text3, text4, text5, secretYn, topFix, startDate, startTime, endDate, endTime, applyUrl, content2, content3, creName, creEmail, memo, tag, a_date];

    }
    console.log("board_idx222:"+board_idx);

    datas3 = [idx];

    datas = datas.concat(datas2, datas3);

    console.log("data:"+datas);
        
    var query = "update tb_board set cre_id=?, title=?, title2=?, content=?, board_gubun = ?";
    
    if(req.files) {
        if (req.files['main_image']) {
            query += ", main_image_name = ?, main_image_orgname = ?, main_image_path = ?"
        }
    }
    query += ", upd_id=?, text1 = ?, text2 = ?, text3 = ?, text4 = ?, text5 = ?, secret_yn = ?, top_fix = ?, start_date = ?, start_time = ?, end_date = ?, end_time = ?, apply_url = ?, content2 = ?, content3 = ?, cre_name = ?, cre_email = ?, memo = ?, tag = ?, a_date = ?, upd_dtime=now() where idx = ?";
    
    console.log("query:"+query);
    
    _DBPool.query(query,datas,function(err, rows, columns) {
        //_DBPool.end();

        if (err) { 
            console.log("err:"+err);
            res.json('failed');
        } else {
                        
            if(comment != ""){
                console.log(":::::::::::: comment insert :::::::::::");
                
                if(comment_idx != "") {
                    var datas = [comment,  comment_idx];
                    var query = " UPDATE tb_board_comment SET comment = ? WHERE idx = ? ";


                    _DBPool.query(query,datas,function(err, rows, columns) {
                       //_DBPool.end();

                        if (err) {
                            console.log("err:"+err);
                            res.json('failed');
                        }
                    });	

                } else {

                    var datas = [idx, "admin", "관리자", comment];
                    var query = " INSERT INTO tb_board_comment (board_idx, cre_id, user_name, comment, cre_dtime) VALUES (?,?,?,?,now())";

                    _DBPool.query(query,datas,function(err, rows, columns) {
                       //_DBPool.end();

                        if (err) {
                            console.log("err:"+err);
                            res.json('failed');
                        }
                        console.log("insertId:"+rows.insertId);

                                
                        if(rows.inserId != '' && rows.insertId != null){

                            query = "update tb_board_comment set top_idx = ? where idx = ?";

                            _DBPool.query(query,[rows.insertId, rows.insertId],function(err, rows, columns) {
                                //_DBPool.end();

                                if (err) {
                                    console.log("err:"+err);
                                    res.json('failed');
                                }

                            });
                        }
                    });	
                            
                }
							
            }
            req.board_key = idx;   
            next();
        }
    });   
}

function deleteBoard(req, res, next){

    var idx = req.body.idx;

    async.waterfall([
        function (callback) {
            console.log('::::select file_order::::');
              
            _DBPool.query("select filename FROM tb_board_file where board_idx=?",[idx],function(err, rows, columns) {
                //_DBPool.end();

                if (err) {
                    console.log("err:"+err);
                    callback("error");
                }
             
                console.log(rows.length);
             
                if(rows.length > 0) {
					for(var i=0;i<rows.length;i++){
					    var filename = rows[i].filename;
				        console.log("path1:"+filename);
						fileD(filename);
					}
				}
                    
                callback(null);

            }); 


        },
        function (callback) {
            // Use the connection
            _DBPool.query("delete FROM tb_board_comment where board_idx=?",[idx],function(err, rows, columns) {
                //_DBPool.end();

                if (err) {
                    console.log("err:"+err);
                    callback("error");
                }

                callback(null); 

            });
                
        },
        function (callback) {
            // Use the connection
            _DBPool.query("delete FROM tb_board where idx=?",[idx],function(err, rows, columns) {
                //_DBPool.end();

                if (err) {
                    console.log("err:"+err);
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
    
}
      

function fileD(path){
    
    console.log("fileD:"+path);
    var f_img = config.root+config.boardFilePath+path;
    console.log("f_img:"+f_img);
    upload.fileDelete(f_img);
    
}

function deleteFile(req,res, next){
    console.log("::::::::::::::deleteFile:::::::::::::::::");
    console.log("board_key:"+req.body.idx);
    var idx = req.body.idx;
    
    
    _DBPool.query("select filename FROM tb_board_file where idx = ?",[idx],function(err, rows, columns) {
        //_DBPool.end();
 
        if (err) {
            console.log("QUERY ERROR: " + err);
            res.json("failed");
        }

        if(rows != ''){

            console.log("rows:"+rows[0].filename);

            var f_img = config.root+config.boardFilePath+rows[0].filename;
            console.log("f_img:"+f_img);
             upload.fileDelete(f_img);
            }



        
     });
         
    _DBPool.query("delete FROM tb_board_file where idx = ?",[idx],function(err, rows, columns) {
    //_DBPool.end();
 
        if (err) {
            console.log("QUERY ERROR: " + err);
            res.json("failed");
        }
        
        res.json("success");
    });   
}

function writeFile(req, res, next){
    console.log("::::::::::::::writeFile:::::::::::::::::");
    console.log("board_key:"+req.board_key);
    var board_key = req.board_key;
    var datas = "";  
    var fileName = "";
    var originalName = "";
    var mimetype = "";
    var size = 0;
    var path = "";
    var board_size = 0;
    var keyName = "";
    var keyBody = "";
    var sess = req.session;
    var cmpId = sess.cmp_id;
    var file_order = 1;
    if(req.files){
    if(req.files["uploadFiles"]) {
        board_size = req.files['uploadFiles'].length;

        console.log("board_size:" + board_size);

        if (req.files['uploadFiles'].length > 0) {

            async.waterfall([
                function (callback) {
                    console.log('::::select file_order::::');
                    var sqlForDeleteFile = "select file_order FROM tb_board_file where board_idx = ? order by file_order desc limit 1";

                    _DBPool.query(sqlForDeleteFile, [board_key], function (err, rows, columns) {
                        //_DBPool.end();

                        if (err) {
                            callback('select file_order error!');
                        }

                        if (rows != '') {
                            console.log("rows[0].file_order:" + rows[0].file_order);
                            file_order = file_order + rows[0].file_order;
                            console.log("row is not null:" + file_order);
                            callback(null, file_order);
                        } else {
                            callback(null, file_order);
                        }

                    });
                },
                function (arg1, callback) {
                    // Use the connection
                    var sqlForInsertBoard = "insert into tb_board_file(board_idx,filename,originalname,mimetype,path,size,file_order) values(?,?,?,?,?,?,?)";


                    //파일 개수만큼 돌면서 디비에 인서트
                    for (var i = 0; i < board_size; i++) {

                        fileName = req.files['uploadFiles'][i].filename;
                        originalName = req.files['uploadFiles'][i].originalname;
                        size = req.files['uploadFiles'][i].size;
                        path = upload.changeDBPath(req.files['uploadFiles'][i].path);
                        mimetype = req.files['uploadFiles'][i].mimetype;
                        console.log("file_order:" + file_order);
                        file_order = arg1 + i;

                        console.log("file_order:" + file_order);

                        datas = [board_key, fileName, originalName, mimetype, path, size, file_order];

                        console.log("datas:" + i);
                        _DBPool.query(sqlForInsertBoard, datas, function (err, rows, columns) {
                            //_DBPool.end();

                            if (err) {
                                callback('Insert Board_file ERROR');
                            }

                        });
                    }
                    callback(null);
                }

            ], function (err) {

                if (err) {
                    res.json('failed');
                } else {
                    res.json('success');
                }
            });

        }
    }else{
        res.json('success');
    }
    }else{
        res.json('success');
    }
}

function fileUpload(req,res,next){


    const uploadInit = upload.multerInitFile('board').fields([{ name: 'main_image', maxCount: 1 }, { name: 'uploadFiles', maxCount: 5 }]);
    console.log("fileUpload!!");
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
    var f_img = config.root+config.boardFilePath+req.body.f_img;
    console.log("f_img:"+f_img);


    // Create a bucket and upload something into it
    if(req.body.f_img != '' && req.body.f_img != null){

        upload.fileDelete(f_img);


    }

}


module.exports = router;
