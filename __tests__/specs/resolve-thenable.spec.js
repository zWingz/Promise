const MPromise = require('../..')
describe('resolve-thenable', () => {
  it('resolve a new promise', () => {
    const value = 1111
    const b = new MPromise(res => {
      setTimeout(() => {
        res(value)
      }, 150)
    })
    const a = new MPromise(res => {
      res(b)
    }).then(r => {
      expect(r).toEqual(value)
    })
    return a
  })
  it('resolve a Promise.resolve', () => {
    const value = 1111
    return new MPromise(res => {
      res(MPromise.resolve(value))
    }).then(r => {
      expect(r).toEqual(value)
    })
  })
  it('resolve a thenable', () => {
    const value = 1111
    return new MPromise(res => {
      res({
        then(r) {
          r(value)
        }
      })
    }).then(r => {
      expect(r).toEqual(value)
    })
  })
  it('resolve a then, but not function', () => {
    const value = {
      then: 1000
    }
    return new MPromise(res => {
      res(value)
    }).then(r => {
      expect(r).toEqual(value)
    })
  })
  it('resolve a multi thenable', () => {
    const value = 1000
    return new MPromise(res => {
      // resolve new Promise
      res(new Promise(r => {
        // resolve Promise.resolve
        r(MPromise.resolve(({
          // resolve a thenable
          then(rr) {
            // resolve a value
            rr(value)
          }
        })))
      }))
    }).then(r => {
      expect(r).toEqual(value)
    })
  })
})
