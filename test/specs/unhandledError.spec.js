const MPromise = require('../../index.js')
const chai = require('chai')
const expect = chai.expect
const utils = require('../utils')

describe('promise.unhandledError', () => {
    const initVal = 1
    let promise = utils.createPromise(initVal)
    const error = new Error('test error')
    it('unhandledError, throw a warning, promise status is REJECT, and catch error', function(done) {
        promise = promise.then(val => {
            throw error
        })
        setTimeout(() => {
            promise.catch(e => {
                expect(e).to.equal(error)
                return 100
            }).then(val => {
                expect(val).to.equal(100)
                done()
            })
        }, 500)
    })
})
