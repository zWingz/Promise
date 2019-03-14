const MPromise = require('../../index.js')
const utils = require('../utils')


describe('return a promise/thenable', () => {
    const initVal = 1
    let promise = utils.createPromise(initVal)
    it('return a promise', function() {
        return promise.then(val => {
            return new MPromise(function(res) {
                setTimeout(function() {
                    res(val * 100)
                }, 500)
            })
        }).then(val => {
            expect(val).toEqual(100)
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
            expect(val).toEqual(200)
        })
    })
    it('throw error in thenable', function() {
        const a = new MPromise(res => {
            res({
                then() {
                    throw new Error('test')
                }
            })
        })
        return expect(a).rejects.toThrow('test')
    })
})
