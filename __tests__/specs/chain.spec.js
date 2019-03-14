const utils = require('../utils')

describe('promise.chain', () => {
    const initVal = 1
    let promise = utils.createPromise(initVal)
    const error = new Error('test error')
    it('chain', function() {
        return promise.then(val => {
            expect(val).toEqual(1)
            return val + 1
        }).then(val => {
            expect(val).toEqual(2)
            return val + 2
        }).then(val => {
            expect(val).toEqual(4)
            throw error
            return val + 3
        }).then(val => {
            expect(val).toEqual(7)
            return val + 4
        }).catch(e => {
            expect(e).toEqual(error)
            return 100
        }).then(val => {
            expect(val).toEqual(100)
        })
    })
})
