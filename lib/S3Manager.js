var AWS = require('aws-sdk');
var config = require('../lib/config.json');
var multer  = require('multer');
var multerS3 = require('multer-s3');

AWS.config.update({
	aaccessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
	"region": config.region
});


var s3 = new AWS.S3();
var path = "";


exports.storage = function(r){
    var storage = multerS3({
        s3: s3,
        bucket: 'neane',
        acl: 'public-read',
        metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname});
        },
        key: function (req, file, cb) {
            var sess = req.session;
            var cmpId = sess.cmp_id;

            file.uploadedFile = {
                name: file.originalname,
                ext: file.mimetype.split('/')[1]
            };
            cb(null, 'neaneFront/'+r+'/'+Date.now()+'_'+file.uploadedFile.name);
        }
    }); 
    return storage;
}

