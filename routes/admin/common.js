var _DBPool = require('../../lib/DBPool');
var fs = require('fs');

module.exports = {

     getCode: function(req, res, next){
        var query = "select c_name, c_code from tb_code where use_yn = 'Y' and c_class = ? order by c_code";
        var datas = [req.params.cateType];

        _DBPool.query(query, datas,function(err, rows, columns) {
            // A 'node-style' callback will usually be callback(error, value)
            if (err) {
                console.log("err:"+err);
            }
            console.log("rows:"+rows);
            req.cateCode = rows;
            next();

        })
    },
   
   areaList: function(req, res, next) {
       console.log(":::::::::selectAreaList::::::::::");

       _DBPool.query("select c_code, c_name from tb_code where use_yn = 'Y' and c_mcode = 'A0000'",[], function(err, rows, columns) {
        // A 'node-style' callback will usually be callback(error, value)
           if (err) {
                console.log("err:"+err);
            }

            req.areaList = rows;
            console.log("areaList rows:"+rows);
            next();

        });
    },
    
    categoryList: function(req, res, next) {
       console.log(":::::::::selectCategoryList::::::::::::");

       _DBPool.query("select c_code, c_name from tb_code where use_yn = 'Y' and c_mcode = 'C0000'",[], function(err, rows, columns) {
        // A 'node-style' callback will usually be callback(error, value)
           if (err) {
                console.log("err:"+err);
            }

            req.categoryList = rows;
            console.log("categoryList rows:"+rows);
            next();

        });
    },
	
	addr1List: function(req, res, next) {
       console.log(":::::::::selectAddr1List::::::::::::");

       _DBPool.query("select c_code, c_name from tb_addr_code where use_yn = 'Y' and c_mcode = 'A0000' order by c_code asc ",[], function(err, rows, columns) {
        // A 'node-style' callback will usually be callback(error, value)
           if (err) {
                console.log("err:"+err);
            }

            req.addr1List = rows;
            console.log("addr1List rows:"+rows);
            next();

        });
    }
	
}

    