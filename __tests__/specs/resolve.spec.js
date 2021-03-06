const MPromise = require('../../index.js')
const utils = require('../utils')


describe('exec MPromise.resolve', () => {
    const initVal = 1
    let promise = utils.createPromise(initVal)
    it('resolve a promise', function(done) {
        const tmp = MPromise.resolve(promise)
        expect(tmp).toEqual(promise)
        done()
    })
    it('resolve a thenable', function(done) {
        const thenable = {
            then(res, rej) {
                res(100)
            }
        }
        MPromise.resolve(thenable).then(val => {
            expect(val).toEqual(100)
            done()
        })
    })
    it('resolve a static value', function(done) {
        MPromise.resolve(100).then(val => {
            expect(val).toEqual(100)
            done()
        })
    })
})
