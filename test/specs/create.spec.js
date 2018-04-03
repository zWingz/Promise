const MPromise = require('../../index.js')
const chai = require('chai')
const expect = chai.expect
const utils = require('../utils')

describe('new promise', () => {
    const promise = utils.createPromise(10, 500)
    it('create a new promise', function() {
        expect(promise.status).to.equal(MPromise.PENDING)
    })
    it('change status', function() {
        setTimeout(function() {
            expect(promise.status).to.equal(MPromise.RESOLVED)
        }, 500)
    })
})