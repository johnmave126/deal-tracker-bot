const { get } = require('../agent');

module.exports = {
    name: 'KOHL\'S',
    homepage: 'https://www.kohls.com/',
    validate(url) {
        return url.hostname === "www.kohls.com" || url.hostname === "kohls.com";
    },
    async extract(url) {
        const body = await get(url.href);
        if(!body.match(/var\s+productV2JsonData\s*=/)) {
            throw "URL does not point to a valid item";
        }
        const title_match = body.match(/"productTitle"\s*:\s*"([^"]*)/),
              price_match = body.match(/"lowestApplicablePrice"\s*:\s*([^,]*)/),
              status_match = body.match(/"productStatus"\s*:\s*"([^"]*)/);

        if(!title_match || !price_match || !status_match) {
            throw "Failed to extract information of the item";
        }
        return {
            title: title_match[1],
            price: parseFloat(price_match[1]),
            status: status_match[1]
        };
    }
};
