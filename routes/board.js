var express = require('express');
var router = express.Router();
var path =  require('path');
var mysql = require('mysql');
var _DBPool = require('../lib/DBPool');
var config = require('../lib/config');
var fs = require('fs');
var s3 = require('../lib/S3Manager');
var multer  = require('multer');	
var S3FS = require('s3fs');
var async = require('async');
var bucketPath = 'ydi.company';
const upload = require('../lib/local_upload_util');
var client_id = config.naver_client_id;//개발자센터에서 발급받은 Client ID
var client_secret = config.naver_client_secret; //개발자센터에서 발급받은 Client Secret
var code = "0";



router.get('/list/:data/:cur', function (req, res, next) {


    var boardMasterName = req.params.data;
    var searchGubun = req.params.searchGubun;
    var searchTxt = req.params.searchT;
    var searchType = req.params.searchType;
    //console.log("boardMasterName:"+boardMasterName+"  searchGubun:"+searchGubun+"  searchTxt:"+searchTxt+" searchType:"+searchType);
    //페이지당 게시물 수 : 한 페이지 당 10개 게시물
    var page_size = 10;
    //페이지의 갯수 : 1 ~ 10개 페이지
    var page_list_size = 10;
    //limit 변수
    var no = "";
    //전체 게시물의 숫자
    var totalPageCount = 0;



    //console.log("boardMasterName:"+boardMasterName);
    var boardIdx = 1;
    var boardTitle = "공지사항";
    var leftTitle = "포럼&세미나";
    var rightTitle = "연구보고서";
    var render = "story_list";
    var leftLink = "data010501";
    var rightLink = "data010301";
    var keyword = "";
    var description = "";
    //칼럼&기고 : column, 이슈브리프 : issue, 연구보고서 : report, 포럼&세미나 : forum
    var boardGubun = "issue";
    if(boardMasterName == 'notice') { //최근 발간물
        boardIdx = 1;
        boardTitle = "공지사항";
        render = "story_list";
        keyword = "";
        description = "";
    }else if(boardMasterName == 'counseling'){ //이슈 브리프
        boardIdx = 2;
        boardTitle = "무료상담실";
        render = "counseling_list";
        keyword = "";
        description = "";
    }else if(boardMasterName == 'story'){ //이슈 브리프
        boardIdx = 3;
        boardTitle = "세무잇다이야기";
        render = "story_list";
        keyword = "";
        description = "";

    }else if(boardMasterName == 'myconsulting'){ //이슈 브리프
        boardIdx = 2;
        boardTitle = "세무잇다이야기";
        render = "story_list";
        keyword = "";
        description = "";
    }

    var queryString = 'select count(*) as cnt from tb_board where board_idx in (?) ';

    _DBPool.query(queryString,[boardIdx],function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            console.log("QUERY ERROR: " + err);
        } else {

            totalPageCount = rows[0].cnt;

            var curPage = req.params.cur;

            //console.log("현재 페이지 : " + curPage, "전체 페이지 : " + totalPageCount);


            //전체 페이지 갯수
            if (totalPageCount < 0) {
                totalPageCount = 0
            }

            var totalPage = Math.ceil(totalPageCount / page_size);// 전체 페이지수
            var totalSet = Math.ceil(totalPage / page_list_size); //전체 세트수
            var curSet = Math.ceil(curPage / page_list_size) // 현재 셋트 번호
            var startPage = ((curSet - 1) * 10) + 1 //현재 세트내 출력될 시작 페이지
            var endPage = (startPage + page_list_size) - 1; //현재 세트내 출력될 마지막 페이지


            //현재페이지가 0 보다 작으면
            if (curPage < 0) {
                no = 0
            } else {
            //0보다 크면 limit 함수에 들어갈 첫번째 인자 값 구하기
                no = (curPage - 1) * 10
            }

            //console.log('[0] curPage : ' + curPage + ' | [1] page_list_size : ' + page_list_size + ' | [2] page_size : ' + page_size + ' | [3] totalPage : ' + totalPage + ' | [4] totalSet : ' + totalSet + ' | [5] curSet : ' + curSet + ' | [6] startPage : ' + startPage + ' | [7] endPage : ' + endPage)

            var result2 = {
                "curPage": curPage,
                "page_list_size": page_list_size,
                "page_size": page_size,
                "totalPage": totalPage,
                "totalSet": totalSet,
                "curSet": curSet,
                "startPage": startPage,
                "endPage": endPage,
                "totalPageCount":totalPageCount
            };

            var queryString = "select idx, member_idx, board_idx, title, title2, content, a_date,(select cate_name from tb_cate where code_idx = board_gubun) as board_gubun, main_image_path, text1, text2, text3, text4, text5, top_fix, date_format(start_date, '%Y-%m-%d') as start_date, date_format(end_date, '%Y-%m-%d') as end_date, start_time, end_time, apply_url, if(char_length(cre_name) >3, concat(left(cre_name,2), '*', right(cre_name,1)), concat(left(cre_name,1), '*', right(cre_name,1))) as cre_name, date_format(cre_dtime, '%Y.%m.%d') as cre_dtime, cre_dtime as cretime, hit, secret_yn,reply_yn, ifnull((select user_name from tb_board_comment a where a.board_idx = c.idx order by cre_dtime desc limit 1),'-') as comment_name from tb_board c where board_idx in (?) order by top_fix DESC,  cretime desc limit ?,? ";

            //console.log("queryString:"+queryString);

            var fileList = [];
            _DBPool.query(queryString,[boardIdx, no, page_size],function(err, rows, result) {
                //_DBPool.end();
                if (err) {
                    console.log("QUERY ERROR: " + err);
                } else {






                    res.render(render, {
                        title: boardTitle,
                        leftTitle: leftTitle,
                        rightTitle: rightTitle,
                        leftLink: leftLink,
                        rightLink: rightLink,
                        boardIdx: boardIdx,
                        boardGubun: boardGubun,
                        top3List: req.top3List,
                        data: rows,
                        fileList: req.getFileImg,
                        pasing: result2,
                        boardMasterName: boardMasterName,
                        keyword: keyword,
                        description: description
                    });
                }

            });

        }
    });


});


router.post('/list', function (req, res, next) {


    var boardMasterName = req.body.boardMasterName;
    var searchGubun = "search";
    var searchTxt = req.body.searchT;
    var searchType = req.body.searchType;
    //console.log("boardMasterName:"+boardMasterName+"  searchGubun:"+searchGubun+"  searchTxt:"+searchTxt+" searchType:"+searchType);


    //페이지당 게시물 수 : 한 페이지 당 10개 게시물
    var page_size = 10;
    //페이지의 갯수 : 1 ~ 10개 페이지
    var page_list_size = 10;
    //limit 변수
    var no = "";
    //전체 게시물의 숫자
    var totalPageCount = 0;



    //console.log("boardMasterName:"+boardMasterName);
    var boardIdx = 1;
    var boardTitle = "최근 발간물";
    var leftTitle = "포럼&세미나";
    var rightTitle = "연구보고서";
    var render = "data_010101";
    var leftLink = "data010501";
    var rightLink = "data010301";
    var keyword = "";
    var description = "";
    //칼럼&기고 : column, 이슈브리프 : issue, 연구보고서 : report, 포럼&세미나 : forum
    var boardGubun = "issue";
    if(boardMasterName == 'notice') { //최근 발간물
        boardIdx = 1;
        boardTitle = "공지사항";
        render = "story_list";
        keyword = "";
        description = "";
    }else if(boardMasterName == 'counseling'){ //이슈 브리프
        boardIdx = 2;
        boardTitle = "무료상담실";
        render = "counseling_list";
        keyword = "";
        description = "";
    }else if(boardMasterName == 'story'){ //이슈 브리프
        boardIdx = 3;
        boardTitle = "세무잇다이야기";
        render = "story_list";
        keyword = "";
        description = "";
    }

    var subQuery = "";

    var queryString = 'select count(*) as cnt from tb_board where board_idx in (?) ';

    if(searchGubun == 'menu'){
        if(searchTxt != 'all'){
        queryString  += " and board_gubun = "+searchTxt+ " ";
        }
    }

    if(searchGubun == 'search'){

        if(searchType == 'title'){
            queryString  += " and title like '%"+searchTxt+ "%' ";
        }else if(searchType == 'content'){
            queryString  += " and content like '%"+searchTxt+ "%' ";
        }else{
            queryString  += " and (title like '%"+searchTxt+ "%' or title like '%"+searchTxt+ "%') ";
        }

    }

    //console.log("queryString:"+queryString);

    _DBPool.query(queryString,[boardIdx],function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            console.log("QUERY ERROR: " + err);
        } else {

            totalPageCount = rows[0].cnt;

            var curPage = req.body.cur==null?1:req.body.cur;

            //console.log("현재 페이지 : " + curPage, "전체 페이지 : " + totalPageCount);


            //전체 페이지 갯수
            if (totalPageCount < 0) {
                totalPageCount = 0
            }

            var totalPage = Math.ceil(totalPageCount / page_size);// 전체 페이지수
            var totalSet = Math.ceil(totalPage / page_list_size); //전체 세트수
            var curSet = Math.ceil(curPage / page_list_size) // 현재 셋트 번호
            var startPage = ((curSet - 1) * 10) + 1 //현재 세트내 출력될 시작 페이지
            var endPage = (startPage + page_list_size) - 1; //현재 세트내 출력될 마지막 페이지


            //현재페이지가 0 보다 작으면
            if (curPage < 0) {
                no = 0
            } else {
                //0보다 크면 limit 함수에 들어갈 첫번째 인자 값 구하기
                no = (curPage - 1) * 10
            }

            //console.log('[0] curPage : ' + curPage + ' | [1] page_list_size : ' + page_list_size + ' | [2] page_size : ' + page_size + ' | [3] totalPage : ' + totalPage + ' | [4] totalSet : ' + totalSet + ' | [5] curSet : ' + curSet + ' | [6] startPage : ' + startPage + ' | [7] endPage : ' + endPage)

            var result2 = {
                "curPage": curPage,
                "page_list_size": page_list_size,
                "page_size": page_size,
                "totalPage": totalPage,
                "totalSet": totalSet,
                "curSet": curSet,
                "startPage": startPage,
                "endPage": endPage,
                "totalPageCount":totalPageCount,
                "searchTxt": searchTxt,
                "searchType": searchType,
                "searchGubun": searchGubun


            };

            var queryString = "select  idx, member_idx, board_idx, \n" +
                "case when board_idx in (1,2,3,4) then '자료실'\n" +
                "when board_idx in (5,6,7) then '소식'\n" +
                "when board_idx = 9  then '소통'\n" +
                "end as tt, \n" +
                "(select board_name from tb_board_master a where a.board_idx = c.board_idx) as board_name, title, title2, \n" +
                "a_date,(select cate_name from tb_cate where code_idx = board_gubun) as board_gubun, content, main_image_path, text1, \n" +
                "text2, text3, text4, text5, top_fix, start_date, end_date, start_time, end_time, apply_url, if(char_length(cre_name) >3, concat(left(cre_name,2), '*', right(cre_name,1)), concat(left(cre_name,1), '*', right(cre_name,1))) as cre_name, \n" +
                "date_format(cre_dtime, '%Y.%m.%d') as cre_dtime, cre_dtime as cretime, hit, secret_yn, reply_yn from tb_board c where board_idx in (?) ";

            if(searchGubun == 'menu'){
                if(searchTxt != 'all'){
                    queryString  += " and board_gubun = "+searchTxt+ " ";
                }
            }

            if(searchGubun == 'search'){

                if(searchType == 'title'){
                    queryString  += " and title like '%"+searchTxt+ "%' ";
                }else if(searchType == 'content'){
                    queryString  += " and content like '%"+searchTxt+ "%' ";
                }else{
                    queryString  += " and (title like '%"+searchTxt+ "%' or title like '%"+searchTxt+ "%') ";
                }

            }

            queryString += " order by cretime desc limit ?,? ";

            var fileList = [];
            _DBPool.query(queryString,[boardIdx, no, page_size],function(err, rows, result) {
                //_DBPool.end();
                if (err) {
                    console.log("QUERY ERROR: " + err);
                } else {






                    res.render(render, {
                        title: boardTitle,
                        boardIdx: boardIdx,
                        boardGubun: boardGubun,
                        data: rows,
                        fileList: req.getFileImg,
                        pasing: result2,
                        boardMasterName: boardMasterName,
                        keyword: keyword,
                        description: description
                    });
                }

            });

        }
    });


});

router.post('/listAjax', getImg, function (req, res, next) {


    var boardMasterName = req.body.boardMasterName;
    var searchGubun = req.body.searchGubun;
    var searchTxt = req.body.searchT;
    var searchType = req.body.searchType;
    //console.log("boardMasterName:"+boardMasterName+"  searchGubun:"+searchGubun+"  searchTxt:"+searchTxt+" searchType:"+searchType);


    //페이지당 게시물 수 : 한 페이지 당 10개 게시물
    var page_size = 10;
    //페이지의 갯수 : 1 ~ 10개 페이지
    var page_list_size = 10;
    //limit 변수
    var no = "";
    //전체 게시물의 숫자
    var totalPageCount = 0;



    //console.log("boardMasterName:"+boardMasterName);
    var boardIdx = 1;
    var boardTitle = "최근 발간물";
    var leftTitle = "포럼&세미나";
    var rightTitle = "연구보고서";
    var render = "data_010101";
    var leftLink = "data010501";
    var rightLink = "data010301";
    var keyword = "";
    var description = "";
    //칼럼&기고 : column, 이슈브리프 : issue, 연구보고서 : report, 포럼&세미나 : forum
    var boardGubun = "issue";
    if(boardMasterName == 'data010101') { //최근 발간물
        boardIdx = 1;
        boardTitle = "최근 발간물";
        leftTitle = "포럼&세미나";
        rightTitle = "연구보고서";
        render = "data_010101";
        leftLink = "data010501";
        rightLink = "data010301";
        keyword = "";
        description = "";
    }else if(boardMasterName == 'data010201'){ //이슈 브리프
        boardIdx = 1;
        boardTitle = "이슈브리프";
        leftTitle = "포럼&세미나";
        rightTitle = "연구보고서";
        render = "data_010101";
        leftLink = "data010501";
        rightLink = "data010301";
        boardGubun = "issue";
        keyword = "이슈브리프, 동향과 분석, 주간분석, 정책서포트";
        description = "자유한국당 정당정책연구소 여의도연구원에서 발간하는 정기간행물입니다. 경제, 안보를 비롯한 국민생활과 맞닿은 각종 이슈를 정책적으로 분석하여 전망, 대책을 마련합니다.";
    }else if(boardMasterName == 'data010301'){ //연구 보고서
        boardIdx = 2;
        boardTitle = "연구보고서";
        leftTitle = "이슈브리프";
        rightTitle = "칼럼&기고";
        render = "data_010101";
        leftLink = "data010201";
        rightLink = "data010401";
        boardGubun = "report";
        keyword = "연구보고서, 현안분석, 중장기연구";
        description = "여의도연구원에서 생산하는 분야별 정책연구보고서입니다.";
    }else if(boardMasterName == 'data010401'){ //칼럼&기고
        boardIdx = 3;
        boardTitle = "칼럼&기고";
        leftTitle = "연구보고서";
        rightTitle = "포럼&세미나";
        render = "data_010101";
        leftLink = "data010301";
        rightLink = "data010501";
        boardGubun = "column";
        keyword = "정기간행물";
        description = "여의도연구원에서 발행하는 정기간행물입니다.";
    }else if(boardMasterName == 'data010501'){ //포럼&세미나
        boardIdx = 4;
        boardTitle = "포럼&세미나";
        leftTitle = "정기간행물";
        rightTitle = "이슈브리프";
        render = "data_010101";
        leftLink = "data010401";
        rightLink = "data010201";
        boardGubun = "forum";
        keyword = "포럼&세미나, 포럼&세미나자료집, 자료집";
        description = "여의도연구원과 외부기관이 함께하는 공동연구 포럼&세미나 자료입니다.";
    }else if(boardMasterName == 'notice_01'){ //공지사항
        boardIdx = 5;
        boardTitle = "공지사항";
        leftTitle = "일정";
        rightTitle = "언론보도";
        render = "notice_01";
        leftLink = "schedule_01";
        rightLink = "media_01";
        boardGubun = "forum";
        keyword = "공지사항, 채용안내";
        description = "여의도연구원의 소식을 발 빠르게 전해드립니다.";
    }else if(boardMasterName == 'media_01'){ //언론보도
        boardIdx = 6;
        boardTitle = "언론보도";
        leftTitle = "공지사항";
        rightTitle = "일정";
        render = "media_01";
        leftLink = "notice_01";
        rightLink = "schedule_01";
        boardGubun = "forum";
        keyword = "언론보도, 보도자료";
        description = "여의도연구원에 대한 주요 언론기사 모음입니다.";
    }else if(boardMasterName == 'schedule_01'){ //스케쥴
        boardIdx = 7;
        boardTitle = "일정";
        leftTitle = "언론보도";
        rightTitle = "공지사항";
        render = "schedule_01";
        leftLink = "media_01";
        rightLink = "notice_01";
        boardGubun = "forum";
        keyword = "세미나일정, 행사일정, 포럼일정, 여의도연구원일정";
        description = "여의도연구원의 일정을 전해드립니다.";
    }else if(boardMasterName == 'suggest'){ //정책제안
        boardIdx = 8;
        boardTitle = "정책제안";
        rightTitle = "자유게시판";
        render = "suggest";
        rightLink = "board_01";
        boardGubun = "forum";
        keyword = "정책제안, 정치정책제안";
        description = "정책아이디어를 제안하는 공간입니다.";
    }else if(boardMasterName == 'board_01'){ //자유게시판
        boardIdx = 9;
        boardTitle = "자유게시판";
        leftTitle = "정책제안";
        render = "board_01";
        leftLink = "suggest";
        boardGubun = "forum";
        keyword = "자유게시판";
        description = "국민의 목소리, 마음 깊이 새기겠습니다.";
    }else if(boardMasterName == 'search'){ //검색
        boardIdx = 1,2,3,4,5,6,7,9;
        boardTitle = "자유게시판";
        leftTitle = "정책제안";
        render = "search_detail";
        leftLink = "suggest";
        boardGubun = "forum";
        page_size = 1000;
    }

    var subQuery = "";

    var queryString = 'select count(*) as cnt from tb_board where board_idx in (?) ';

    if(searchGubun == 'menu'){
        if(searchTxt != 'all'){
            queryString  += " and board_gubun = "+searchTxt+ " ";
        }
    }

    if(searchGubun == 'search'){

        if(searchType == 'title'){
            queryString  += " and title like '%"+searchTxt+ "%' ";
        }else if(searchType == 'content'){
            queryString  += " and content like '%"+searchTxt+ "%' ";
        }else{
            queryString  += " and (title like '%"+searchTxt+ "%' or title like '%"+searchTxt+ "%') ";
        }

    }

    //console.log("queryString:"+queryString);

    _DBPool.query(queryString,[boardIdx],function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            console.log("QUERY ERROR: " + err);
        } else {

            totalPageCount = rows[0].cnt;

            var curPage = req.body.cur==null?1:req.body.cur;

            //console.log("현재 페이지 : " + curPage, "전체 페이지 : " + totalPageCount);


            //전체 페이지 갯수
            if (totalPageCount < 0) {
                totalPageCount = 0
            }

            var totalPage = Math.ceil(totalPageCount / page_size);// 전체 페이지수
            var totalSet = Math.ceil(totalPage / page_list_size); //전체 세트수
            var curSet = Math.ceil(curPage / page_list_size) // 현재 셋트 번호
            var startPage = ((curSet - 1) * 10) + 1 //현재 세트내 출력될 시작 페이지
            var endPage = (startPage + page_list_size) - 1; //현재 세트내 출력될 마지막 페이지


            //현재페이지가 0 보다 작으면
            if (curPage < 0) {
                no = 0
            } else {
                //0보다 크면 limit 함수에 들어갈 첫번째 인자 값 구하기
                no = (curPage - 1) * 10
            }

           // console.log('[0] curPage : ' + curPage + ' | [1] page_list_size : ' + page_list_size + ' | [2] page_size : ' + page_size + ' | [3] totalPage : ' + totalPage + ' | [4] totalSet : ' + totalSet + ' | [5] curSet : ' + curSet + ' | [6] startPage : ' + startPage + ' | [7] endPage : ' + endPage)

            var result2 = {
                "curPage": curPage,
                "page_list_size": page_list_size,
                "page_size": page_size,
                "totalPage": totalPage,
                "totalSet": totalSet,
                "curSet": curSet,
                "startPage": startPage,
                "endPage": endPage,
                "totalPageCount":totalPageCount,
                "searchTxt": searchTxt,
                "searchType": searchType,
                "searchGubun": searchGubun


            };

            var queryString = "select idx, board_idx, \n" +
                "case when board_idx in (1,2,3,4) then '자료실'\n" +
                "when board_idx in (5,6,7) then '소식'\n" +
                "when board_idx = 9  then '소통'\n" +
                "end as tt, \n" +
                "(select board_name from tb_board_master a where a.board_idx = c.board_idx) as board_name, title, title2, \n" +
                "a_date,(select cate_name from tb_cate where code_idx = board_gubun) as board_gubun, content, main_image_path, text1, \n" +
                "text2, text3, text4, text5, top_fix, start_date, end_date, start_time, end_time, apply_url, cre_name, \n" +
                "date_format(cre_dtime, '%Y.%m.%d') as cre_dtime, cre_dtime as cretime, hit, reply_yn from tb_board c where board_idx in (?) ";

            if(searchGubun == 'menu'){
                if(searchTxt != 'all'){
                    queryString  += " and board_gubun = "+searchTxt+ " ";
                }
            }

            if(searchGubun == 'search'){

                if(searchType == 'title'){
                    queryString  += " and title like '%"+searchTxt+ "%' ";
                }else if(searchType == 'content'){
                    queryString  += " and content like '%"+searchTxt+ "%' ";
                }else{
                    queryString  += " and (title like '%"+searchTxt+ "%' or title like '%"+searchTxt+ "%') ";
                }

            }

            queryString += " order by top_fix desc, a_date desc,cretime desc limit ?,? ";

            var fileList = [];
            _DBPool.query(queryString,[boardIdx, no, page_size],function(err, rows, result) {
                //_DBPool.end();
                if (err) {
                    console.log("QUERY ERROR: " + err);
                    data = {result: 'failed'};
                } else {





                     data = {result: 'success', list : rows, fileList: req.getFileImg};
                    res.json(data);
                }

            });

        }
    });


});


router.get('/detail/:data/:boardIdx', updateHit, getFileImg,getBeforeBoard,getAfterBoard, comment_list, function (req, res, next) {

    var sess = req.session;

    var boardIdx = req.params.boardIdx;
    var boardMasterName = req.params.data;
    //console.log("boardMasterName:"+boardMasterName);
    //console.log("boardIdx:"+boardIdx);
    var boardTitle = "최근 발간물";
    var leftTitle = "포럼&세미나";
    var rightTitle = "연구보고서";
    var render = "data_010102";
    var leftLink = "data010501";
    var rightLink = "data010301";
    var boardGubun = "issue";
    var keyword = "";
    var description = "";

    if(boardMasterName == 'notice') { //최근 발간물
        boardTitle = "공지사항";
        render = "story_view";
        keyword = "";
        description = "";
    }else if(boardMasterName == 'counseling'){ //이슈 브리프
        boardTitle = "무료상담실";
        render = "counseling_view";
        keyword = "";
        description = "";
    }else if(boardMasterName == 'story'){ //이슈 브리프
        boardTitle = "세무잇다이야기";
        render = "story_view";
        keyword = "";
        description = "";
    }

    var queryString = "select idx, member_idx, board_idx, title, title2, a_date,(select cate_name from tb_cate where code_idx = board_gubun) as board_gubun, content, main_image_path, text1, text2, text3, text4, text5, start_date, start_time, end_date, end_time, apply_url, if(char_length(cre_name) >3, concat(left(cre_name,2), '*', right(cre_name,1)), concat(left(cre_name,1), '*', right(cre_name,1))) as cre_name, hit, date_format(cre_dtime, '%Y.%m.%d') as cre_dtime, reply_yn, (select count(*) from tb_board_comment where board_idx = c.idx) as comment_count from tb_board c where idx = ? ";


    _DBPool.query(queryString,[boardIdx],function(err, rows, result) {
        //_DBPool.end();
        if (err) {
            console.log("QUERY ERROR: " + err);
        } else {


            res.render(render, {
                title: boardTitle,
                leftTitle: leftTitle,
                rightTitle: rightTitle,
                leftLink: leftLink,
                rightLink: rightLink,
                boardIdx: boardIdx,
                boardGubun: boardGubun,
                boardData: rows[0],
                fileList: req.getFileImgs,
                getBeforeBoard: req.getBeforeBoard,
                getAfterBoard: req.getAfterBoard,
                boardMasterName: boardMasterName,
                keyword:keyword,
                description:description,
                comment_list:req.comment_list, member_idx:sess.member_idx
            });
        }

    });


})



/* 채팅방 이미지 */
function getImg(req, res, next){
    var boardMasterName = req.params.data;

    //console.log("boardMasterName:"+boardMasterName);
    var boardIdx = 1;

    if(boardMasterName == 'data010101') { //최근 발간물
        boardIdx = "1,2,3,4";

    }else if(boardMasterName == 'data010201'){ //이슈 브리프
        boardIdx = 1;

    }else if(boardMasterName == 'data010301'){ //연구 보고서
        boardIdx = 2;

    }else if(boardMasterName == 'data010401'){ //정기간행물
        boardIdx = 3;

    }else if(boardMasterName == 'data010501'){ //포럼&세미나
        boardIdx = 4;
    }else if(boardMasterName == 'notice_01'){ //공지사
        boardIdx = 5;
    }else if(boardMasterName == 'media_01'){ //언론보도
        boardIdx = 6;
    }
    var datas = [boardIdx];
    var queryString = "select board_idx, originalname, path from tb_board_file where board_idx in (select idx from tb_board where board_idx = ?)";
    _DBPool.query(queryString,datas,function(err, rows, result) {

        if(err){

            console.log("QUERY ERROR: " + err);
        } else {


            req.getFileImg = rows;
            next();
        }


    })

}

router.get('/write', function(req,res,next) {

    console.log("get write!");

    var title = "자유게시판";
    var keyword = "자유게시판";
    var description = "국민의 목소리, 마음 깊이 새기겠습니다.";

    var api_url = 'https://openapi.naver.com/v1/captcha/nkey?code=' + code;
    var request = require('request');
    var options = {
        url: api_url,
        headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
    };
    request.get(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {

            var obj = JSON.parse(body);
            //console.log(obj.key);
            var boardData = "";
            res.render('board_03',{key: obj.key, mode:"write", boardData:boardData, title:title, keyword:keyword, description:description});

        } else {
            //res.status(response.statusCode).end();
            console.log('error = ' + response.statusCode);
        }
    });



});

router.post('/write', function (req,res,next) {

    code = 1;

    var cre_name = req.body.cre_name;
    var cre_pwd = req.body.cre_pwd;
    var title = req.body.title;
    var content = req.body.content;
        content = content.replace(/\n/gi, '<br/>');
    var data = {};
    var api_url = 'https://openapi.naver.com/v1/captcha/nkey?code=' + code + '&key=' + req.body.key + '&value=' + req.body.captcha;
    var request = require('request');
    var options = {
        url: api_url,
        headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
    };
    request.get(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {





            var datas = [cre_name, cre_pwd, title,  content];
            var query  = "insert into tb_board(board_idx,cre_name, cre_pwd, title, content, cre_dtime";
            query += ") values(9, ?,password(?),?,?, now()";
            query += ")";

            //console.log("datas:"+datas);
            //console.log("query:"+query);


            _DBPool.query(query,datas,function(err, rows, columns) {
                //_DBPool.end();

                if (err) {
                    data = {result:'failed', reson:'error'}
                    res.json(data);
                }

                data = {result:'success', reson:''}
                res.json(data);
            });




        } else {
            data = {result:'failed', reson:'captcha'}
            res.json(data);
            console.log('error = ' + response.statusCode);
        }
    });

})


router.get('/modify/:boardIdx', function(req,res,next) {

    console.log("get modify!"+req.params.boardIdx);


            var datas = [req.params.boardIdx];
            var queryString = "select idx, board_idx, title, title2, secret_yn, a_date,(select cate_name from tb_cate where code_idx = board_gubun) as board_gubun, content, main_image_path, text1, text2, text3, text4, text5, start_date, start_time, end_date, end_time, apply_url, cre_name, file1_orgname, file2_orgname, date_format(cre_dtime, '%Y.%m.%d') as cre_dtime from tb_board where idx = ? ";
            _DBPool.query(queryString,datas,function(err, rows, result) {

                if(err){

                    console.log("QUERY ERROR: " + err);
                } else {


                    res.render('counseling_write',{mode:"modify", boardData:rows[0]});
                }


            })


});

router.post('/modify', function (req,res,next) {

    code = 1;

    var boardIdx = req.body.boardIdx;
    var cre_name = req.body.cre_name;
    var cre_pwd = req.body.cre_pwd;
    var title = req.body.title;
    var content = req.body.content;
    content = content.replace(/\n/gi, '<br/>');
    var data = {};

            var datas = [cre_name, cre_pwd, title,  content, boardIdx];
            var query  = "update tb_board set cre_name = ?, cre_pwd = password(?), title = ?, content = ?, upd_dtime = now() where idx = ?";


            //console.log("datas:"+datas);
            //console.log("query:"+query);


            _DBPool.query(query,datas,function(err, rows, columns) {
                //_DBPool.end();

                if (err) {
                    data = {result:'failed', reson:'error'}
                    res.json(data);
                }

                data = {result:'success', reson:''}
                res.json(data);
            });





})

router.get('/captcha/image', function(req,res,next) {

    var api_url = 'https://openapi.naver.com/v1/captcha/ncaptcha.bin?key=' + req.query.key;
    var request = require('request');
    var options = {
        url: api_url,
        headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
    };
    //console.log("{__dirname:"+__dirname);
    var writeStream = fs.createWriteStream(__dirname+'/captcha.jpg');
    var _req = request.get(options).on('response', function(response) {
        //console.log("dir:"+JSON.stringify(writeStream)) // 200
        //console.log("path:"+writeStream.path);
    });



    //_req.pipe(writeStream); // file로 출력
    _req.pipe(res); // 브라우저로 출력




})

router.get('/checkCaptcha', function (req, res) {

    //console.log("checkCaptcha:"+req.query.key+"  req.query.value:"+req.query.value);
    code = "1";
    var api_url = 'https://openapi.naver.com/v1/captcha/nkey?code=' + code + '&key=' + req.query.key + '&value=' + req.query.value;
    var request = require('request');
    var options = {
        url: api_url,
        headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
    };
    request.get(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //console.log("success!!!");
            res.json("success");
            res.end(body);
        } else {
            res.json("failed");
            res.status(response.statusCode).end();
            //console.log('error = ' + response.statusCode);
        }
    });
});


/* 채팅방 이미지 */
function getFileImg(req, res, next){
    var boardIdx= req.params.boardIdx;

    //console.log("boardIdx:"+boardIdx);

    var datas = [boardIdx];
    var queryString = "select idx, board_idx, originalname, path from tb_board_file where board_idx = ?";
    _DBPool.query(queryString,datas,function(err, rows, result) {

        if(err){

            console.log("QUERY ERROR: " + err);
        } else {


            req.getFileImgs = rows;
            next();
        }


    })

}

router.post('/checkPwd', function (req, res, next) {

        var sess = req.session;

        var member_id = sess.member_id;

         var cre_pwd = req.body.cre_pwd;
        var data = {};
       // console.log("checkPwd:"+boardIdx+" pwd:"+cre_pwd);
        var queryString = "select member_id from tb_member where member_id = ? and password = password(?) ";
    _DBPool.query(queryString,[member_id, cre_pwd],function(err, rows, result) {

        if(err){

            console.log("QUERY ERROR: " + err);
        } else {

            if(rows[0]){
                data = {result:'success', pwdCheck:'OK'}
                res.json(data);
            }else{
                data = {result:'success', pwdCheck:''}
                res.json(data);
            }

        }


    })



})

router.post('/suggest_write', fileUpload, function (req, res, next) {



    var image_name;
    var image_org_name;
    var image_size;
    var image_path;

    var cre_name = req.body.cre_name;
    var cre_email = req.body.cre_email;
    var title = req.body.title;
    var board_gubun = req.body.board_gubun;
    var content = req.body.content;
    var content2 = req.body.content2;
    var content3 = req.body.content3;


    var datas = [cre_name, cre_email, title,  board_gubun, content, content2, content3];
    var query  = "insert into tb_board(board_idx,cre_name, cre_email, title, board_gubun, content, content2, content3, cre_dtime";
        query += ") values(8, ?,?,?,?,?,?,?, now()";
        query += ")";

    if(req.file){

        image_name = req.file.filename;
        image_org_name = req.file.originalname;
        image_size = req.file.size;
        image_path = upload.changeDBPath(req.file.path);

        datas = [cre_name, cre_email, title,  board_gubun, content, content2, content3, image_name, image_path, image_org_name];

        query  = "insert into tb_board(board_idx,cre_name, cre_email, title, board_gubun, content, content2, content3, main_image_name, main_image_path, main_image_orgname, cre_dtime";
        query += ") values(8, ?,?,?,?,?,?,?,?,?,?, now()";
        query += ")";
    }


    //console.log("datas:"+datas);
    //console.log("query:"+query);


    _DBPool.query(query,datas,function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            res.json('failed');
        }
        res.json('success');
    });


});

/* 채팅방 이미지 */
function getBeforeBoard(req, res, next){
    var boardIdx= req.params.boardIdx;

    //console.log("boardIdx:"+boardIdx);

    var datas = [boardIdx,boardIdx];
    var queryString = "select idx, board_idx, title from tb_board where  board_idx = (select board_idx from tb_board where idx = ?) and idx < ? order by idx desc limit 1";
    _DBPool.query(queryString,datas,function(err, rows, result) {

        if(err){

            console.log("QUERY ERROR: " + err);
        } else {


            req.getBeforeBoard = rows[0];
            next();
        }


    })

}


router.get("/delete", function (req,res,next) {


    var idx     = req.query.boardIdx;

    var query = "delete FROM tb_board where idx=?";
    var datas = [idx];

    _DBPool.query(query,datas,function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            console.log("QUERY ERROR: " + err);
            res.json('failed');
        }

        res.json('success');
    });

})

function getAfterBoard(req, res, next){
    var boardIdx= req.params.boardIdx;

    //console.log("boardIdx:"+boardIdx);

    var datas = [boardIdx,boardIdx];
    var queryString = "select idx, board_idx, title from tb_board where  board_idx = (select board_idx from tb_board where idx = ?) and idx > ? limit 1";
    _DBPool.query(queryString,datas,function(err, rows, result) {

        if(err){

            console.log("QUERY ERROR: " + err);
        } else {


            req.getAfterBoard = rows[0];
            next();
        }


    })

}

//룸 정보
function top3List(req, res, next){
    console.log(":::::::::top3List::::::::::");

    var boardMasterName = req.body.boardMasterName==null?req.params.data:req.body.boardMasterName;
    var searchGubun = req.body.searchGubun;
    var searchTxt = req.body.searchT;
    var searchType = req.body.searchType;
    //console.log("boardMasterName:"+boardMasterName+"  searchGubun:"+searchGubun+"  searchTxt:"+searchTxt+" searchType:"+searchType);

    //console.log("boardMasterName:"+boardMasterName);
    var boardIdx = 1;

    if(boardMasterName == 'data010101') { //최근 발간물
        boardIdx = "1,2,3,4";

    }else if(boardMasterName == 'data010201'){ //이슈 브리프
        boardIdx = 1;

    }else if(boardMasterName == 'data010301'){ //연구 보고서
        boardIdx = 2;

    }else if(boardMasterName == 'data010401'){ //정기간행물
        boardIdx = 3;

    }else if(boardMasterName == 'data010501'){ //포럼&세미나
        boardIdx = 4;
    }


    
    var query = "select idx, board_idx, case when length(title) > 20 then concat(left(title,20),'')  else title end as title, title2, a_date,(select cate_name from tb_cate where code_idx = board_gubun) as board_gubun, main_image_path, text1, text2, text3, text4, text5 from tb_board where board_idx in (?) ";

    if(searchGubun == 'menu' && searchTxt != 'all' && searchTxt != null){
        query += " and board_gubun = "+ searchTxt;
    }

        query += " order by a_date desc,cre_dtime desc limit 3 ";

    //console.log(query);

    var datas = [boardIdx];
    
    _DBPool.query(query,datas,function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            console.log("QUERY ERROR: " + err);
        } else {

            req.top3List = rows;
           // console.log("top3List : " , rows);
            next();           
        }
    });   
}




function updateHit(req, res, next){

    console.log("updateHit");

    var seq = req.params.boardIdx;


    var query = "update tb_board set hit = hit+1 where idx = ?";


    datas = [seq];


    _DBPool.query(query, datas,function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            console.log("err:"+err);
        }


        next();
    });


}



// function sendPush(id, title, body){
//
//     console.log("::::::::::::::sendPush:::::::::::::::::");
//
//     _DBPool.query("select token from tb_token where member_seq =? order by cre_date desc limit 1",[id],function(err, rows, columns) {
//
//         //_DBPool.end();
//
//         if (err) {
//           console.log("QUERY ERROR: " + err);
//         }
//
//         if(rows != ''){
//
//             console.log("member_token:"+rows[0].token);
//
//
//                 var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
//                     to: rows[0].token,
//                     collapse_key: '',
//
//                     notification: {
//                         title: title,
//                         body: body
//                     },
//
//                     data: {  //you can send only notification or only data(or include both)
//                         my_key: '',
//                         my_another_key: ''
//                     }
//                 };
//
//                 //보내기만 하는 전송
//                 fcm.send(message)
//                     .then(function(response){
//                         console.log("Successfully sent with response: ", response);
//                     })
//                     .catch(function(err){
//                         console.log("Something has gone wrong!");
//                         console.error(err);
//                     });
//             }
//
//      });
//
//
//
// }

function fileUpload(req,res,next){

    console.log("fileUpload!!");
    const uploadInit = upload.multerInitImg('board').single('file');
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

function comment_list(req,res,next){

    var board_idx = req.params.boardIdx;

    console.log(":::::::::comment_list::::::::::" + board_idx);
    _DBPool.query("SELECT idx, board_idx, top_idx, replace(comment,'<br/>','\n') as comment FROM tb_board_comment where board_idx = ? order by cre_dtime desc",[board_idx],function(err, rows, columns) {
        //_DBPool.end();

        if (err) {
            return res.end("QUERY ERROR: " + err);
        }

        req.comment_list = rows;
        next();

    });

}

module.exports = router;
