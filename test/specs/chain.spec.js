const MPromise = require('../../index.js')
const chai = require('chai')
const expect = chai.expect
const utils = require('../utils')

describe('promise.chain', () => {
    const initVal = 1
    let promise = utils.createPromise(initVal)
    const error = new Error('test error')
    it('chain', function() {
        return promise.then(val => {
            expect(val).to.equal(1)
            return val + 1
        }).then(val => {
            expect(val).to.equal(2)
            return val + 2
        }).then(val => {
            expect(val).to.equal(4)
            throw error
            return val + 3
        }).then(val => {
            expect(val).to.equal(7)
            return val + 4
        }).catch(e => {
            expect(e).to.equal(error)
            return 100
        }).then(val => {
            expect(val).to.equal(100)
        })
    })
})

