let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

module.exports = {
    post: function (url, stringArgs, cb) {
        let request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (request.readyState == 4 && request.status == 200) {
                let response = JSON.parse(request.responseText);
                cb(response);
            }
        };
        request.open("POST", url, true);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send(stringArgs);
    }
}