const express = require('express');
let router = express.Router();
const { validationResult } = require('express-validator/check');
const validator = require('../modules/validators');
const flash = require('../modules/flash');
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
        res.render('transfer', {
            title: 'Transfer funds',
            userBalance: req.session.user.balance,
            userWalletId: req.session.user.walletId
        });
    } else {
        res.redirect('/');
    }
});

router.post('/', validator.validateTransfer(), function (req, res, next) {
    if (req.session.user) {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return flash.formValidationErrors('/home/transfer', req, res, errors);
        }
        if (req.session.user.walletId === req.body.wallet) {
            return flash.errorMessage('/home/transfer', req, res, "Invalid wallet ID.");
        }
        if (parseFloat(req.session.user.balance) < parseFloat(req.body.amount)) {
            return flash.errorMessage('/home/transfer', req, res, "You don't have enough money to complete this transfer.");
        }
        let receiverWalletId = userModel.encryptField({walletId: req.body.wallet.toUpperCase()}).walletId;
        database.collection('user').find({walletId: receiverWalletId}).toArray(async function(err, result) {
            if (err) throw err;
            if (result.length === 0) {
                return flash.errorMessage('/home/transfer', req, res, "Invalid wallet ID.");
            }
            let receiver = userModel.decrypt(result[0]);
            let senderBalance = (parseFloat(req.session.user.balance) - parseFloat(req.body.amount)).toString();
            let receiverBalance = (parseFloat(receiver.balance) + parseFloat(req.body.amount)).toString();
            let encSenderBalance = userModel.encryptField({balance: senderBalance}).balance;
            let encReceiverBalance = userModel.encryptField({balance: receiverBalance}).balance;

            let encSenderWalletId = userModel.encryptField({walletId: req.session.user.walletId}).walletId;
            let encReceiverWalletId = userModel.encryptField({walletId: receiver.walletId}).walletId;

            await database.collection('user').updateOne(
                {walletId: encSenderWalletId},
                {$set: {balance: encSenderBalance}}
            );
            await database.collection('user').updateOne(
                {walletId: encReceiverWalletId},
                {$set: {balance: encReceiverBalance}}
            );

            await database.collection('user').updateOne({walletId: encSenderWalletId}, {$push: {
                    transactions: userModel.encryptTransaction({
                        date: transactionsHelper.getDate(),
                        type: "Sent funds to user",
                        identifier: transactionsHelper.formatWalletId(receiver.walletId),
                        amount: req.body.amount.toString(),
                        currentBalance: senderBalance.toString()
                    })
            }});
            await database.collection('user').updateOne({walletId: encReceiverWalletId}, {$push: {
                    transactions: userModel.encryptTransaction({
                        date: transactionsHelper.getDate(),
                        type: "Received funds from user",
                        identifier: transactionsHelper.formatWalletId(req.session.user.walletId),
                        amount: req.body.amount.toString(),
                        currentBalance: receiverBalance.toString()
                    })
            }});
            database.collection('user').find({walletId: encSenderWalletId}).toArray(function(err, result) {
                if (err) throw err;
                if (result.length === 0) {
                    flash.errorMessage('/', req, res, "An error has occurred, contact service.");
                    return;
                }
                result[0].transactions.reverse();
                req.session.user = userModel.decrypt(result[0]);
                return flash.successMessage('/home/transfer', req, res, "You have successfully sent " + req.body.amount + " BTC to wallet ID " + receiver.walletId);
            });
        });
    } else {
        res.redirect('/');
    }
});

module.exports = router;