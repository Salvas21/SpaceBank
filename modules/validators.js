const { body } = require('express-validator/check');

module.exports = {
    validateSignup: function () {
        return [
            body('firstName', 'The first name must be filled.').exists({checkNull: true, checkFalsy: true}),
            body('lastName', 'The last name must be filled.').exists({checkNull: true, checkFalsy: true}),
            body('email', 'The E-mail must be filled.').exists({checkNull: true, checkFalsy: true}),
            body('email', 'Invalid E-mail.').isEmail(),
            body('password', 'The password must be filled.').exists({checkNull: true, checkFalsy: true})
        ]
    },
    validateLogin: function () {
        return [
            body('email', 'The E-mail must be filled.').exists({checkNull: true, checkFalsy: true}),
            body('email', 'Invalid E-mail.').isEmail(),
            body('password', 'The password must be filled.').exists({checkNull: true, checkFalsy: true})
        ]
    },
    validateAddFunds: function () {
        return [
            body('card', 'The card number must be filled.').exists({checkNull: true, checkFalsy: true}),
            body('card', 'The card number is invalid.').custom(value => {
                let regex = /^[0-9]{16}$/
                return regex.test(value);
            }),
            body('exp', 'The expiration date must be filled.').exists({checkNull: true, checkFalsy: true}),
            body('exp', 'The expiration date is invalid.').custom(value => {
                let regex = /^([0-9]{2})-?(0[1-9]|1[0-2])$/;
                return regex.test(value);
            }),
            body('ccv', 'The CVV must be filled.').exists({checkNull: true, checkFalsy: true}),
            body('ccv', 'The CVV is invalid.').custom(value => {
               let regex = /^[0-9]{3}$/;
               return regex.test(value);
            }),
            body('amount', 'The amount must be filled.').exists({checkNull: true, checkFalsy: true}),
            body('amount', 'The amount is invalid.').isDecimal()
        ]
    },
    validateTransfer: function () {
        return [
            body('wallet', 'The wallet ID must be filled.').exists({checkNull: true, checkFalsy: true}),
            body('amount', 'The amount must be filled.').exists({checkNull: true, checkFalsy: true}),
            body('amount', 'The amount is invalid.').isDecimal()
        ]
    }
};

