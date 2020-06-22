
const path = require('path');

const rootPath = path.normalize(`${__dirname}/..`);
const env = process.env.NODE_ENV || 'development';

const config = {
    development: {
        bannerFilePath: "/public/upload/banner/",
        boardFilePath: "/public/upload/board/",
        suggestFilePath: "/public/upload/suggest/",
        naver_client_id: "F31LbtvSz47IjskuJhJX",
        naver_client_secret: "K0TbOJ7mvz",
        root: rootPath,
        app: {
            name: 'edda',
        },
        port: process.env.PORT || 8002,
        db: 'nodejs-003.cafe24.com',
        db_nm: 'ydilkp',
        db_id: 'ydilkp',
        db_pw: 'ydimysql123!'
    },

    test: {
        bannerFilePath: "/public/upload/banner/",
        boardFilePath: "/public/upload/board/",
        suggestFilePath: "/public/upload/suggest/",
        naver_client_id: "F31LbtvSz47IjskuJhJX",
        naver_client_secret: "K0TbOJ7mvz",
        root: rootPath,
        app: {
            name: 'uploads',
        },
        port: process.env.PORT || 8002,
        db: 'nodejs-003.cafe24.com',
        db_nm: 'ydilkp',
        db_id: 'ydilkp',
        db_pw: 'ydimysql123!'
    },

    production: {
        bannerFilePath: "/public/upload/banner/",
        boardFilePath: "/public/upload/board/",
        suggestFilePath: "/public/upload/suggest/",
        naver_client_id: "OqcXJ1CiJqpQgVEvIZIc",
        naver_client_secret: "7kTrSCrKnU",
        root: rootPath,
        app: {
            name: 'uploads',
        },
        port: process.env.PORT || 8002,
        db: 'mongodb://localhost/uploads-production',
        db: 'nodejs-003.cafe24.com',
        db_nm: 'ydilkp',
        db_id: 'ydilkp',
        db_pw: 'ydimysql123!'
    },
};

module.exports = config[env];
