const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const validator = require('express-validator');
require('dotenv').config()
const redis = require('redis')
const session = require('express-session')
const RedisStore = require('connect-redis')(session)
let redisClient = redis.createClient({host: 'spacebank-redis'})


var indexRouter = require('./routes/index');
var signupRouter = require('./routes/signup');
var homeRouter = require('./routes/home');
var transactionsRouter = require('./routes/transactions');
var transferRouter = require('./routes/transfer');
var fundsRouter = require('./routes/addFunds');

var app = express();
app.use(express.urlencoded({ extended: true}));

app.use(
    session({
        store: new RedisStore( {client: redisClient} ),
        secret: '18 naked cowboys in the showers at ram ranch',
        resave: false,
        saveUninitialized: false
    })
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(validator());
app.use(require('express-flash')());

app.use('/', indexRouter);
app.use('/signup', signupRouter);
app.use('/home', homeRouter);
app.use('/home/transactions', transactionsRouter);
app.use('/home/transfer', transferRouter);
app.use('/home/add-funds', fundsRouter);

app.use(function(req, res, next) {
    // next(createError(404));
    res.render('404', {title: "404"});
});

app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
