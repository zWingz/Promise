const MPromise = require('../index.js')
exports.createPromise = function(val = 100, time = 100) {
    return new MPromise(function(res, rej) {
        setTimeout(() => {
            res(val)
        }, time)
    })
}