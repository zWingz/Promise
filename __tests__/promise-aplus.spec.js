const Promise = require('../index.js')
// 用于promise-aplus-tests测试的adapter
Promise.deferred = function() {
    const deferred = {}
    deferred.promise = new Promise((res, rej) => {
      deferred.resolve = res
      deferred.reject = rej
    })
    return deferred
  }
describe("Promises/A+ Tests", function () {
    require("promises-aplus-tests").mocha(Promise);
});
