const utils = require('../utils')
const MPromise = require('../../index')
describe('new promise', () => {
    const promise = utils.createPromise(10, 500)
    it('create a new promise', function(done) {
        expect(promise.status).toEqual(MPromise.PENDING)
        done()
    })
    it('change status', function(done) {
        setTimeout(function() {
            expect(promise.status).toEqual(MPromise.RESOLVED)
            done()
        }, 1500)
    })
})
