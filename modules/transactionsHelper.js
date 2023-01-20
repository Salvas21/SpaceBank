
module.exports = {
    getDate: function () {
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth()+1;
        let day = date.getDate();
        if (day < 10) {
            day = '0' + day;
        }
        if (month < 10) {
            month = '0' + month;
        }
        return day + '-' + month + '-' + year;
    },
    formatCard: function (card) {
        let formattedCard = "XXXX XXXX XXXX ";
        for (let i = card.length - 4; i < card.length; i++) {
            formattedCard = formattedCard.concat(card[i]);
        }
        return formattedCard;
    },
    formatWalletId: function (walletId) {
        let formattedWalletId = "SPBA";
        for (let i = 0; i < 26; i++) {
            formattedWalletId = formattedWalletId.concat("X");
        }
        for (let i = walletId.length - 6; i < walletId.length; i++) {
            formattedWalletId = formattedWalletId.concat(walletId[i]);
        }
        return formattedWalletId;
    }
}