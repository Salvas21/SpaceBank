const bcrypt = require('bcrypt');
const crypto = require('crypto');
const th = require('./transactionsHelper');
const CryptoObject = require('crypto-object');
const userEncryptor = new CryptoObject({
    password: process.env.ENCRYPT_KEY,
    keys: ['firstName', 'lastName', 'email', 'password', 'walletId', 'balance']
});
const transactionsEncryptor = new CryptoObject({
    password: process.env.ENCRYPT_KEY,
    keys: ['date', 'type', 'identifier', 'amount', 'currentBalance']
});

module.exports = {
    create: function (firstName, lastName, email, password, callback) {
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(password + process.env.PASSWORD_PEPPER, salt, function (err, hash) {
                let walletId = crypto.createHash('md5').update(new Date() + email).digest('hex').toUpperCase();
                callback(userEncryptor.encrypt({
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password: hash,
                    walletId: process.env.WALLET_ID_CODE + walletId,
                    balance: 0.00.toString(),
                    transactions: [transactionsEncryptor.encrypt({date: th.getDate(), type: "Account opening", identifier: "", amount: 0.0.toString(), currentBalance: 0.0.toString()})]
                }));
            });
        });
    },
    authenticate: function (hash, password, callback) {
        bcrypt.compare(password + process.env.PASSWORD_PEPPER, hash, function (err, res) {
            callback(res);
        });
    },
    encryptField: function(field) {
        return userEncryptor.encrypt(field);
    },
    decryptField: function(field) {
        return userEncryptor.decrypt(field);
    },
    decrypt: function (user) {
        let transactions = user.transactions;
        let decUser = userEncryptor.decrypt(user);
        let decTransactions = [];
        for (transaction of transactions) {
            decTransactions.push(transactionsEncryptor.decrypt(transaction));
        }
        decUser.transactions = decTransactions;
        return decUser;
    },
    encrypt: function (user) {
        let transactions = user.transactions;
        let encUser = userEncryptor.encrypt(user);
        let encTransactions = [];
        for (transaction of transactions) {
            encTransactions.push(transactionsEncryptor.encrypt(transaction));
        }
        encUser.transactions = encTransactions;
        return encUser;
    },
    encryptTransaction: function(transaction) {
        return transactionsEncryptor.encrypt(transaction);
    }
}
