const utils = require('../utils')
describe('promise.catch', () => {
    const initVal = 20
    let promise = utils.createPromise(initVal)
    const error = new Error('test error')
    it('add a catch func, return 100', function(done) {
        promise = promise.then(val => {
            throw error
        }).catch(e => {
            expect(e).toEqual(error)
            return 100
        })
        done()
    })
    it('get the value after catch', function(done) {
        promise.then(val => {
            expect(val).toEqual(100)
            done()
        })
    })
})
