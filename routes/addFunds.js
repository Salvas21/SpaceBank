const express = require('express');
let router = express.Router();
const { validationResult } = require('express-validator/check');
const validator = require('../modules/validators');
const flash = require('../modules/flash');
const ajax = require('../modules/ajax');
const transactionsHelper = require('../modules/transactionsHelper');
const userModel = require('../modules/user');

let database;
const mongoHelper = require('../modules/mongoHelper');
mongoHelper.connect(function (err, client) {
    if (err) {
        console.log(err);
    }
    database = mongoHelper.getDatabase();
});

router.get('/', function(req, res, next) {
    if (req.session.user) {
        res.render('add-funds', {
            title: 'Add funds',
            userBalance: req.session.user.balance,
            userWalletId: req.session.user.walletId
        });
    } else {
        res.redirect('/');
    }
});

router.post('/', validator.validateAddFunds(), function (req, res, next) {
    if (req.session.user) {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return flash.formValidationErrors('/home/add-funds', req, res, errors);
        }
        let cardNumber = req.body.card.replace(/ /g, '');
        let url = "http://credit.cegeplabs.qc.ca/api/withdraw/" + cardNumber
        let args = "amt=" + req.body.amount + "&exp=" + req.body.exp;
        ajax.post(url, args,  async function (response) {
            if (response.status === "success") {
                let newBalance = parseFloat(req.session.user.balance) + parseFloat(req.body.amount);
                let encBalance = userModel.encryptField({balance: newBalance.toString()}).balance;
                let encWalletId = userModel.encryptField({walletId: req.session.user.walletId}).walletId;
                await database.collection('user').updateOne({walletId: encWalletId}, {$set: {balance: encBalance}});
                await database.collection('user').updateOne({walletId: encWalletId}, {$push: {
                    transactions: userModel.encryptTransaction({
                        date: transactionsHelper.getDate(),
                        type: "Added funds from credit card",
                        identifier: transactionsHelper.formatCard(cardNumber),
                        amount: req.body.amount.toString(),
                        currentBalance: newBalance.toString()
                    })
                }});
                database.collection('user').find({walletId: encWalletId}).toArray(function(err, result) {
                    if (err) throw err;
                    if (result.length === 0) {
                        flash.errorMessage('/', req, res, "An error has occurred, contact service.");
                        return;
                    }
                    result[0].transactions.reverse();
                    req.session.user = userModel.decrypt(result[0]);
                    return flash.successMessage('/home/add-funds', req, res, response.message);
                });
            } else {
                return flash.errorMessage('/home/add-funds', req, res, response.message);
            }
        });

    } else {
        res.redirect('/');
    }
});

module.exports = router;