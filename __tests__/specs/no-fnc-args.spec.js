const MPromise = require('../../index.js')
const utils = require('../utils')


describe('resolver must be a function', () => {
    it('args must be a function', function(done) {
        try {
            const promise = new MPromise(10)
        } catch (e) {
            expect(e.message).toEqual('Promise resolver 10 is not a function')
            done()
        }
    })
})
