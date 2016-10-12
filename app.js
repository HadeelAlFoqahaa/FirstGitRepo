var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('./config');
var _ = require('lodash')

var session = require('express-session');



var db = require('./db')(config);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.db = db;
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  
  next();
});

// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public/cloudview')));



app.use(session({
  secret: 'OxXJyarbCm50IkZEjSgN4LKMOiwS7O01',
  resave: true,
  saveUninitialized: true
}));

var requestHandler = require('./helper/requestHandler')(app);

var allowedRequests = {
  hadeel: ['brand', 'category', 'customer', 'item', 'item_property', 'oder_details', 'order', 'property'],
  dana: ['collage', 'course', 'material', 'registered_course', 'student', 'teacher'],
  rawan: ['borrower', 'class', 'element', 'supplier', "borrowing"]
}

// app.get('/', function(req, res) {
//   res.setHeader('Content-Type', 'text/html');
//   res.send('index')
// });

app.post('/login', function(req, res) {
  var email = req.body.email,
    password = req.body.password;

  db.query('select * from user where email = ? and password = ?', [email, password], function(err, result) {
    console.log(this.sql)
    if (err || result.length == 0) {
      return res.send(401);
    } else {
      var user = result[0];
      delete user.password;

      req.session.user = result[0];
      res.send(req.session.user);
    }
  });
});


app.all(['/:girl/:tbl_name/:id', '/:girl/:tbl_name/'], function(req, res) {

  /*if (_.isEmpty(req.session.user)) {
    return res.send(401)
  }*/
  var girl = req.param('girl');
  var tbl_name = req.param('tbl_name');
  if (!allowedRequests[girl]) {
    return res.send(404)
  }

  if (allowedRequests[girl].indexOf(tbl_name) == -1) {
    return res.send(404);
  }
  var method = req.method.toLowerCase();

  requestHandler[method](req, function(err, data) {
    if (err) {
      return res.send(err)
    }

    return res.send(data)
      // res.send('wellcome' + req.param('girl'));
  })

})

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


module.exports = app;