const express = require('express');
let router = express.Router();
const user = require('../modules/user');

router.get('/', function(req, res, next) {
    if (req.session.user) {
        res.render('transaction', {
            title: 'Transactions',
            userBalance: req.session.user.balance,
            userWalletId: req.session.user.walletId,
            userTransactions: req.session.user.transactions
        });
    } else {
        res.redirect('/');
    }
});

module.exports = router;




