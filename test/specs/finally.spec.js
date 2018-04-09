const MPromise = require('../../index.js')
const chai = require('chai')
const expect = chai.expect
const utils = require('../utils')


describe('promise.finally', () => {
    const initVal = 1
    let promise = utils.createPromise(initVal, 1500)
    it('do finally after resolve', function(done) {
        promise.then(val => val).finally(() => {
        }).then(val => {
            expect(val).to.equal(1)
            done()
        })
    })
    it('do finally after reject', function(done) {
        const err = new Error('err')
        promise.then(val => {
            throw err
        })
        .finally(() => {}).catch(val => {
            expect(val).to.equal(err)
            done()
        })
    })
})