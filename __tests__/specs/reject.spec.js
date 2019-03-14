const MPromise = require('../../index.js')
const utils = require('../utils')


describe('exec MPromise.reject', () => {
    const initVal = 1
    let promise = utils.createPromise(initVal)
    it('reject a static reason', function(done) {
        MPromise.reject('test error').catch(err => {
            expect(err).toEqual('test error')
            done()
        })
    })
    it('reject a object', function(done) {
        const obj = {
            then() {}
        }
        MPromise.reject(obj).catch(err => {
            expect(err).toEqual(obj)
            done()
        })
    })
})
