$(document).ready(function () {
    $('#copyToClipboard').click(function () {
        let text = $(this).text();
        text = text.replace("Wallet ID : ", "");
        let textarea = document.createElement("input");
        document.body.appendChild(textarea);
        textarea.setAttribute('id', 'textCopy');
        document.getElementById("textCopy").value=text;
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        alert("Wallet ID copied to clipboard.");
    });
});