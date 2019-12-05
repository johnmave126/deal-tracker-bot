const request = require('request');

const options = {
    headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        'Accept-Language': 'en-US,en;q=0.9,ja-JP;q=0.8,ja;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
    },
    gzip: true,
    forever: true
};

function make_request(options) {
    return new Promise((resolve, reject) => {
        request(options, (err, res, body) => {
            if (err) {
                return reject(`Request Failed with message ${err.message}`);
            }
            const { statusCode } = res;
            if (statusCode !== 200) {
                return reject(`Request Failed with Status Code ${statusCode}`);
            }
            return resolve(body);
        });
    });
}

module.exports = {
    get(url) {
        return make_request({
            url: url,
            method: 'GET',
            ...options
        });
    },
    post(url, form) {
        return make_request({
            url: url,
            method: 'POST',
            form: form,
            ...options
        });
    }
};
