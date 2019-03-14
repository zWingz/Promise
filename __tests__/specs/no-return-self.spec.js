const utils = require('../utils')
const MPromise = require('../../index')
describe(`can't return self`, () => {
  it('test', function() {
    let a
    a = new MPromise((res, rej) => {
      setTimeout(() => {
        res(a)
      }, 1000)
    })
    return expect(a).rejects.toThrow('Chaining cycle detected for promise')
  })
})
