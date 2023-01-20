const express = require('express');
let router = express.Router();
const validator = require('../modules/validators');
const flash = require('../modules/flash');
const userModel = require('../modules/user');
const { validationResult } = require('express-validator/check');
const mongoHelper = require('../modules/mongoHelper');

let database;
mongoHelper.connect(function (err, client) {
    if (err) {
        console.log(err);
    }
    database = mongoHelper.getDatabase();
});

router.get('/', function(req, res, next) {
    res.render('signup', { title: 'Sign up' });
});

router.post('/', validator.validateSignup(), function(req, res, next) {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return flash.formValidationErrors('/signup', req, res, errors);
    }
    database.collection('user').find({email: req.body.email}).toArray(function(err, result) {
        if (err) throw err;
        if (result.length > 0) {
            flash.errorMessage('/signup', req, res, "This email is already in use.");
            return;
        }
        userModel .create(req.body.firstName, req.body.lastName, req.body.email, req.body.password, function (user) {
            database.collection('user').insertOne(user, function (err, result) {
                if (err) throw err;
                flash.successMessage("/", req, res, "You have been successfully signed up.");
            });
        });
    });
});

module.exports = router;