const MPromise = require('../../index.js')
const chai = require('chai')
const expect = chai.expect
const utils = require('../utils')


describe('return a promise/thenable', () => {
    const initVal = 1
    let promise = utils.createPromise(initVal)
    it('return a promise', function() {
        return promise.then(val => {
            return new Promise(function(res) {
                setTimeout(function() {
                    res(val * 100)
                }, 500)
            })
        }).then(val => {
            expect(val).to.equal(100)
        })
    })
    it('return a thenable', function() {
        return promise.then(val => {
            return {
                then(res, rje) {
                    setTimeout(() => {
                        res(200)
                    }, 500)
                }
            }
        }).then(val => {
            expect(val).to.equal(200)
        })
    })
})