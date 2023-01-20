const express = require('express');
let router = express.Router();

router.get('/', function(req, res, next) {
    if (req.session.user) {
        res.redirect("/home/transactions")
    } else {
        res.redirect('/');
    }
});

router.get('/log-out', function (req, res, next) {
    req.session.destroy(function () {
        res.redirect('/');
    });
});

module.exports = router;