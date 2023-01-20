
module.exports = {
    formValidationErrors: function (route, req, res, errors) {
        let errorMessages = [];
        errors.array().forEach((error) => {
            errorMessages.push(error.msg);
        })
        req.flash('error', errorMessages);
        res.redirect(route);
    },
    errorMessage: function (route, req, res, message) {
        req.flash('error', message);
        res.redirect(route);
    },
    successMessage: function (route, req, res, message) {
        req.flash('success', message);
        res.redirect(route);
    }
};