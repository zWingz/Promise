const Promise = require('../../index.js')
describe("Promises/A+ Tests", function () {
    require("promises-aplus-tests").mocha(Promise);
});
