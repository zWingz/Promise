const MPromise = require('../../index.js')
const chai = require('chai')
const expect = chai.expect
const utils = require('../utils')

describe('promise.then', () => {
    const initVal = 20
    const promise = utils.createPromise(initVal)
    it('resolve a value 20', function() {
        return promise.then(val => {
            expect(val).to.equal(initVal)
            return val * 2
        }).then(val => {
            expect(val).to.equal(initVal * 2)
        }).then().then(10, 20)
        .then(val => {
            expect(val).to.equal(10)
        })
    })
})