const utils = require('../utils')

describe('promise.error', () => {
    const initVal = 20
    let promise = utils.createPromise(initVal)
    const error = new Error('test error')
    it('catch a error, and do reject, return 100', function() {
        promise = promise.then(val => {
            throw error
            return val
        }).then((val) => {
            return val
        }, e => {
            expect(e).toEqual(error)
            return 100
        })
        return promise
    })
    it('get the value after catch error, promise status is resolve', function(done) {
        setTimeout(() => {
            promise.then(val => {
                expect(val).toEqual(100)
                done()
            })
        }, 1000)
    })
})
