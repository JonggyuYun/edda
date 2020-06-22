var _DBPool = require('../lib/DBPool');
var fs = require('fs');

module.exports = {

     getCode: function(mcode, callback){
        var query = "select c_name, c_code from tb_code where use_yn = 'Y' and c_mcode = ?";
        var datas = [mcode];

        _DBPool.query(query, datas,function(err, rows, columns) {
            // A 'node-style' callback will usually be callback(error, value)
            if (err) {
                console.log("err:"+err);
            }
            console.log("rows:"+rows);
            callback(rows);

        })
    },
   
   bankList: function(req, res, next) {
       console.log(":::::::::selectBankList::::::::::");

       _DBPool.query("select c_code, c_name from tb_code where use_yn = 'Y' and c_mcode = 'B0000' order by c_code asc",[], function(err, rows, columns) {
        // A 'node-style' callback will usually be callback(error, value)
           if (err) {
                console.log("err:"+err);
            }

            req.bankList = rows;
            //console.log("areaList rows:"+rows);
            next();

        });
    },
    
    categoryList: function(req, res, next) {
       console.log(":::::::::selectCategoryList::::::::::::");

       _DBPool.query("select c_code, c_name from tb_code where use_yn = 'Y' and c_mcode = 'C0000' order by c_code asc",[], function(err, rows, columns) {
        // A 'node-style' callback will usually be callback(error, value)
           if (err) {
                console.log("err:"+err);
            }

            req.categoryList = rows;
            //console.log("categoryList rows:"+rows);
            next();

        });
   },
    /* 이용약관 */
    yaggwan: function(req, res, next){
        console.log(":::::::::yaggwan::::::::::::");

       _DBPool.query("select idx, title, content from tb_board where board_idx = '5' ",[], function(err, rows, columns) {
        // A 'node-style' callback will usually be callback(error, value)
           if (err) {
                console.log("err:"+err);
            }

            req.yaggwan = rows;
            //console.log("categoryList rows:"+rows);
            next();

        });
   },
    /* 개인정보취급방침 */
    personal: function(req, res, next){
        console.log(":::::::::personal::::::::::::");

       _DBPool.query("select idx, title, content from tb_board where board_idx = '8' ",[], function(err, rows, columns) {
        // A 'node-style' callback will usually be callback(error, value)
           if (err) {
                console.log("err:"+err);
            }

            req.personal = rows;
            //console.log("categoryList rows:"+rows);
            next();

        });
    },
    
    /* 인덱스 배너 가져오기 */
    getBanner: function(req, res, next){
        console.log(":::::::::getBanner::::::::::::");

       _DBPool.query("select idx, title, position, image_path, advertiser_url from tb_banner where use_yn = 'Y' order by idx asc",[], function(err, rows, columns) {
        // A 'node-style' callback will usually be callback(error, value)
           if (err) {
                console.log("err:"+err);
            }

            req.getBanner = rows;
            //console.log("categoryList rows:"+rows);
            next();

        });
    },
    
    /* 전자상거래 기본 약관 */
    eCommerce: function(req, res, next){
        console.log(":::::::::eCommerce::::::::::::");

       _DBPool.query("select idx, title, content from tb_board where board_idx = '9' ",[], function(err, rows, columns) {
        // A 'node-style' callback will usually be callback(error, value)
           if (err) {
                console.log("err:"+err);
            }

            req.eCommerce = rows;
            //console.log("categoryList rows:"+rows);
            next();

        });
    },
    
    /* 개인정보 제 3자 제공 약관 */
    personalInfo: function(req, res, next){
        console.log(":::::::::personalInfo::::::::::::");

       _DBPool.query("select idx, title, content from tb_board where board_idx = '10' ",[], function(err, rows, columns) {
        // A 'node-style' callback will usually be callback(error, value)
           if (err) {
                console.log("err:"+err);
            }

            req.personalInfo = rows;
            //console.log("categoryList rows:"+rows);
            next();

        });
    },
    
    /* 취소 환불 규정 */
    cancelInfo: function(req, res, next){
        console.log(":::::::::personalInfo::::::::::::");
        var board_idx = req.body.board_idx;
       _DBPool.query("select idx, title, content from tb_board where board_idx = '11' and idx = 100 ",[board_idx], function(err, rows, columns) {
        // A 'node-style' callback will usually be callback(error, value)
           if (err) {
                console.log("err:"+err);
            }

            req.cancelInfo = rows;
            //console.log("categoryList rows:"+rows);
            next();

        });
    },

    /* 회원 방 참여 여부 체크 */
    roomJoinCheck: function(req, res, next){
        console.log(":::::::::roomJoinCheck::::::::::::");
        var board_idx = req.params.idx;
        var userInfo = req.user;
        console.log("board_idx:"+board_idx);
        console.log("userInfo:"+userInfo.member_id);
        var query = "select room_idx from tb_room_member where room_idx = ? and member_idx = (SELECT seq from tb_member WHERE member_id = ?) and member_status = 'S' \n" +
            "union all\n" +
            "select room_idx from tb_payment where room_idx = ? and member_id = ? and payment_status not in ('PE','RC')";
        _DBPool.query(query,[board_idx, userInfo.member_id,board_idx, userInfo.member_id], function(err, rows, columns) {
            // A 'node-style' callback will usually be callback(error, value)
            if (err) {
                console.log("err roomJoinCheck:"+err);
            }
            if(rows.length>0){
                req.roomJoinCheck = 'Y';
            }else {
                req.roomJoinCheck = 'N';
            }
             //console.log("categoryList rows:"+rows);
            next();

        });
    }


}

    