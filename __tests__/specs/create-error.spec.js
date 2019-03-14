const MPromise = require('../../index.js')

describe('promise.create-a-error', () => {
    const error = new Error('create-a-error')
    it('throw a error before resolve', function(done) {
        let promise = new MPromise(function(res, rej) {
            throw error
            res(10)
        })
        promise.then(val => {
            expect(val).toEqual(10)
            done()
        }, e => {
            expect(e).toEqual(error)
            done()
        })
    })
    it('throw a error after resolve', function(done) {
        let promise = new MPromise(function(res, rej) {
            res(10)
            throw error
        })
        promise.then(val => {
            expect(val).toEqual(10)
            done()
        }, e => {
            expect(e).toEqual(error)
            done()
        })
    })
})
