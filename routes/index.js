const express = require('express');
let router = express.Router();
const validator = require('../modules/validators');
const flash = require('../modules/flash');
const { validationResult } = require('express-validator/check');
const mongoHelper = require('../modules/mongoHelper');
const userModel = require('../modules/user');

let database;
mongoHelper.connect(function (err, client) {
    if (err) {
        console.log(err);
    }
    database = mongoHelper.getDatabase();
});

router.get('/', (req, res, next) => {
    res.render('index', { title: 'Login' });
});

router.post('/', validator.validateLogin(), function (req, res, next) {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return flash.formValidationErrors('/', req, res, errors);
    }
    let email = userModel.encryptField({email: req.body.email});
    database.collection('user').find({email: email.email}).toArray(function(err, result) {
        if (err) throw err;
        if (result.length === 0) {
            return flash.errorMessage('/', req, res, "Invalid credentials.");
        }
        userModel.authenticate(userModel.decryptField({password: result[0].password}).password, req.body.password, function (isPasswordCorrect) {
            if (isPasswordCorrect) {
                result[0].transactions.reverse();
                req.session.user = userModel.decrypt(result[0]);
                return res.redirect('/home');
            }
            flash.errorMessage('/', req, res, "Invalid credentials.");
        });
    });
});

module.exports = router;