const utils = require('../utils')

describe('promise.then', () => {
    const initVal = 20
    const promise = utils.createPromise(initVal)
    it('skip resolve if not a function', function() {
        return promise.then(val => {
            expect(val).toEqual(initVal)
            return val * 2
        }).then(val => {
            expect(val).toEqual(initVal * 2)
            return val
        }).then().then(10, 20)
        .then(val => {
            expect(val).toEqual(40)
        })
    })
})
