/* eslint-disable no-new-require */
/* eslint-disable new-cap */

const path = require('path');
const fs = require('fs');
const multer = require('multer');
const crypto = require('crypto');
const config = require('./config');

const uploadFolder = '/upload/';


/**
 * TODO: 디렉토리가 존재하는지 체크
 * @param {String} 절대 경로
 */
const dirExists = (absolutePath) => {
  try {
    return fs.statSync(absolutePath).isDirectory();
  } catch (err) {
    // console.log('dirExists err', err); // NOTE: 폴더가 존재하지 않으면 'ENOENT' 에러를 반환함.
    return false;
  }
};

/**
 * TODO: 파일이 있는지 체크
 * @param {Array} 절대 경로
 */
const fileExists = (files) => {
  let result = true;
  for (let i = 0; i < files.length; i += 1) {
    try {
      fs.statSync(files[i]).isFile();
    } catch (err) {
      // console.log('fileExists err', err);
      result = false;
      break;
    }
  }
  return result;
};
/**
 * TODO: multer 기본 세팅
 * @param {String} 업로드할 폴더명
 */
const multerInitImg = (folder) => {
  if (!folder) return false;
  const storage = multer.diskStorage({
    destination: (req, file, callback) => {
    const uploadRoot = '/home/bitnami/htdocs/edda/public/upload/';
  const uploadPath = `/home/bitnami/htdocs/edda/public/upload/${folder}`;
      if (!dirExists(uploadRoot)) fs.mkdirSync(uploadRoot); // NOTE: 업로드 폴더 체크 후 생성.
      if (!dirExists(uploadPath)) fs.mkdirSync(uploadPath); // NOTE: 업로드 폴더 체크 후 생성.
      callback(null, uploadPath);
    },
    filename: (req, file, callback) => { // NOTE: 파일명 변환
      callback(null, `${Date.now()}.${file.mimetype.split('/')[1]}`);
    },
  });
  return multer({
    storage,
    limits: { fileSize: 200097152 }, // NOTE: 업로드 파일은 2mb 제한
    fileFilter: (req, file, callback) => {
      if (file.mimetype.indexOf('image') === -1) {
        return callback(new Error('이미지 파일만 업로드 가능'));
      }
      return callback(null, true);
    },
  });
};

/**
 * TODO: multer 기본 세팅
 * @param {String} 업로드할 폴더명
 */
const multerInitFile = (folder) => {
  if (!folder) return false;
  const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      const uploadRoot = '/home/bitnami/htdocs/edda/public/upload/';
      const uploadPath = `/home/bitnami/htdocs/edda/public/upload/${folder}`;
      if (!dirExists(uploadRoot)) fs.mkdirSync(uploadRoot); // NOTE: 업로드 폴더 체크 후 생성.
      if (!dirExists(uploadPath)) fs.mkdirSync(uploadPath); // NOTE: 업로드 폴더 체크 후 생성.
      callback(null, uploadPath);
    },
    filename: (req, file, callback) => { // NOTE: 파일명 변환
      callback(null, `${Date.now()}.${file.mimetype.split('/')[1]}`);
    },
  });
  return multer({
    storage,
    limits: { fileSize: 200097152 }
  });
};

/**
 * TODO: db에 저장할 path 만들기.
 * @param {*} filePath
 */
const changeDBPath = (filePath) => {
  const origin = filePath;
  const start = origin.match(uploadFolder).index;
  let result = '';
  for (let i = start; i < origin.length; i += 1) {
    result += origin[i];
  }
  return result;
};

/**
 * TODO: db에 저장된 path를 실제 업로드 path로 변경.
 * @param {*} dbPath
 */
const changeUploadPath = (dbPath) => path.join(config.root, `/public${dbPath}`);

/**
 * TODO: req.files에서 path, name, originalName만 가지고 오기
 * @description db 저장용
 * @param {Array} files req.files
 */
const convertMulterData = (files) => {
  if (files.length === 0) return false;
  try {
    const uploadPaths = files.map((file) => changeDBPath(file.path));
    const fileName = files.map((file) => file.filename);
    const fileOriginalName = files.map((file) => file.originalname);
    return { uploadPaths, fileName, fileOriginalName };
  } catch (err) {
    console.log('convertMulterData err', err);
    return false;
  }
};


const fileDelete = (filePath) => {
  console.log(":::::::::::::fileDelete:::::::::::::::::::");
  var f_img = filePath;
  console.log("f_img:"+f_img);


  // Create a bucket and upload something into it
  if(f_img != '' && f_img != null){
    fs.unlink(f_img, function(err){
      if( err ) console.log("file delete err");
      console.log('file deleted');
    });


  }

}

/**
 * TODO: 여러 파일을 다운받아야 할 경우엔 zip으로 묶어서 넘긴다.
 * @param {Array} uploadPath db에 저장된 업로드 경로
 * @param {Array} originalname db에 저장된 원래 파일명
 */
const zipDownload = (dbPath, originalname) => new Promise((resolve, reject) => {
  if (!dbPath || !originalname) return reject(new Error('다운로드에 필요한 파라미터 누락'));
  if (dbPath.length !== originalname.length) return reject(new Error('다운로드 파리미터 확인'));
  if (!Array.isArray(dbPath) || !Array.isArray(originalname)) return reject(new Error('다운로드 파일 타입 체크'));
  const uploadPath = dbPath.map((p) => changeUploadPath(p)); // NOTE: dbpath -> uploadpath
  if (!fileExists(uploadPath)) return reject(new Error('업로드된 파일이 존재 하지 않음'));
  const zip = new require('node-zip')();
  for (let i = 0; i < uploadPath.length; i += 1) {
    zip.file(originalname[i], fs.readFileSync(uploadPath[i]));
  }
  const zipDownloadRoot = path.join(config.root, '/public/upload/zip');
  if (!dirExists(zipDownloadRoot)) fs.mkdirSync(zipDownloadRoot); // NOTE: zip 만들 폴더 체크 후 생성.
  const zipPath = `${zipDownloadRoot}/${Date.now()}_${crypto.randomBytes(8).toString('hex')}.zip`;
  const addZip = zip.generate({ base64: false, compression: 'DEFLATE' }); // NOTE: zip 파일 생성.
  fs.writeFileSync(zipPath, addZip, 'binary'); // NOTE: zip 파일 저장
  return resolve(zipPath);
});

exports.changeDBPath = changeDBPath;
exports.changeUploadPath = changeUploadPath;
exports.multerInitImg = multerInitImg;
exports.convertMulterData = convertMulterData;
exports.zipDownload = zipDownload;
exports.fileDelete = fileDelete;
exports.multerInitFile = multerInitFile;
