var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash'); // use passport flash message
var cors = require('cors');
var http = require('http');
var https = require('https');
var engine = require('ejs-mate');


var index = require('./routes/index');
var board = require('./routes/board');
var banner = require('./routes/admin/banner');
var community = require('./routes/admin/community');
var admin_index = require('./routes/admin/index');
var company = require('./routes/admin/company');
var users = require('./routes/admin/users');
var code = require('./routes/admin/code');
var semu = require('./routes/admin/semu');
// var about = require('./routes/about');
// var alram = require('./routes/alram');
// var mypage = require('./routes/mypage');
// var survey = require('./routes/survey');
// var health = require('./routes/health');


var app = express();

app.use(session({
    secret: '12312dajfj23rj2po4$#%@#',
    resave: false,
    saveUninitialized: true,
    cookie:{_expires : 6000000 * 60 * 24 * 30}
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());

app.engine('ejs', engine);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 80);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'routes')));

app.use('/', index);
app.use('/board', board);
app.use('/manager/index', admin_index);
app.use('/manager/community', community);
app.use('/manager/banner', banner);
app.use('/manager/company', company);
app.use('/manager/users', users);
app.use('/manager/code', code);
app.use( '/manager/semu', semu);

// app.use('/about', about);
// app.use('/alram', alram);
// app.use('/mypage', mypage);
// app.use('/survey', survey);
// app.use('/health', health);
// app.use('/health', health);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var server	= http.createServer(app).listen(app.get('port'));



/*io.use(bundle.cookieParser());
io.use(bundle.session({secret: '12312dajfj23rj2po4$#%@#'}))
io.use(ioPassport.initialize());
io.use(ioPassport.session());*/
module.exports = app;
