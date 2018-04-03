const MPromise = require('../../index.js')
const chai = require('chai')
const expect = chai.expect
const utils = require('../utils')

describe('promise.create-a-error', () => {
    const initVal = 20
    const error = new Error('create-a-error')
    it('throw a error before resolve', function(done) {
        let promise = new MPromise(function(res, rej) {
            throw error
            res(10)
        })
        promise.then(val => {
            expect(val).to.equal(10)
            done()
        }, e => {
            expect(e).to.equal(error)
            done()
        })
    })
    it('throw a error after resolve', function(done) {
        let promise = new MPromise(function(res, rej) {
            res(10)
            throw error
        })
        promise.then(val => {
            expect(val).to.equal(10)
            done()
        }, e => {
            expect(e).to.equal(error)
            done()
        })
    })
})



