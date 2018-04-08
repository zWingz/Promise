const MPromise = require('../../index.js')
const chai = require('chai')
const expect = chai.expect
const utils = require('../utils')

describe('new promise', () => {
    const promise = utils.createPromise(10, 150)
    it('create a new promise', function(done) {
        expect(promise.status).to.equal(MPromise.PENDING)
        done()
    })
    it('change status', function(done) {
        setTimeout(function() {
            expect(promise.status).to.equal(MPromise.RESOLVED)
            done()
        }, 1500)
    })
})