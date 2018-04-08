const MPromise = require('./index.js')

let exampleCount = 0
function createPromise(val = 10, promise = MPromise) {
    return new promise(function(res, rej) {
        setTimeout(() => {
            res(val)
        }, 100)
    })
}

// function exampleFnc(fun) {
//     console.log(`<--------- @example ${exampleCount} ------------->`)
//     fun()
// }

/**
 * @example
 * 基本使用
 */
// exampleFnc(() => {
//     example = createPromise()
//     example.then(val => {
//         console.log(val)
//         return val * 3
//     }).then(val => {
//         console.log(val)
//         return val * 2
//     })
// })


 /**
  * @example
  * 异常处理
  */
//  exampleFnc(() => {
//      example = createPromise()
//      example.then(val => {
//          throw new Error('example error')
//          return val * 3
//      }).then(val => {
//          console.log(val)
//          return val * 2
//      }).catch(err => {
//          console.log('catch error')
//      })
//  })


/**
 * @example
 * 当new的时候抛出异常
 * 但是同时又有resolve时候, 两者执行顺序不一样时候, 结果也会不一样
 * 
 */
// let d = new MPromise(function(res, rej) {
//     rej(10)
// })
// d.then(val => {
//     console.log('then resolve', val)
// }, e => {
//     console.log('then reject', e)
// }).catch(e => {
//     console.log(111)
// })

/**
 * 当new的时候抛出异常
 * 但是同时又有resolve时候, 两者执行顺序不一样时候, 结果也会不一样
 * @example
 * 
 */
// d = new MPromise(function(res, rej) {
//     rej(20)
//     res(10)
//     throw new Error('test error')
// }).then(val => {
//     console.log('then resolve', val)
// }).catch(e => {
//     console.log('catch error')
//     return 100
// }).then(val => {
//     console.log(val)
// })
// console.log('sync', d)

/**
 * throw error
 * @example
 */
// d = new MPromise(function(res, rej) {
//     console.log('new promise')
//     res(10)
// })
// d = d.then(val => {
//     throw new Error('test error')
// })
// setTimeout(() => {
//     d.catch(e => {
//         console.log('catch error in setTimeout')
//         return 100
//     }).then(val => {
//         console.log(val)
//     })
// }, 1000)
    


/**
 * 当then方法返回promise自身时候
 * 会出现异常警告
 * @example
 */
// d = new MPromise(function(res, rej) {
//     setTimeout(function() {
//         res(10)
//     }, 1000)
// })
// c = new MPromise(function(res, rej) {
//     // setTimeout(function() {
//         res(1000)
//     // }, 0)
// })
// c.then(val => {
//     console.log(d.status)
//     return d
// }).then(val => {
//     console.log(val)
// })

/**
 * 返回thenable
 * @example
 */

// d = new Promise(function(res, rej) {
//     res(10)
// })
// d.then(val => {
//     return new Promise(function(res, rej) {
//         res(20)
//     })
// })
// .then(val => ({
//     then(res, rej) {
//         res(val * 2)
//     }
// }))
// .then(val => ({
//     then: 40 // then不为方法, 则用{then}为值执行promise
// }))
// .then(val => {
//     console.log(val)
// })


/**
 * @example
 * MPromise.resolve
 * thenable
 */
// d = MPromise.resolve({
//     then(res) {
//         console.log('do promise', res)
//         res(10)
//     }
// })

// d.then(val => {
//     console.log('do promise then', val)
// })
// console.log(d)


/**
 * @example
 * MPromise.resolve
 * value or empty
 */
// d = MPromise.resolve()
// d.then(() => {
//     console.log('do promise then')
//     return 10
// }).then(val => {
//     console.log('after value', val)
// })

/**
 * @example
 * MPromise.reject
 */
// d = Promise.reject('lll')
// e = d.catch(err => {
//     console.log(err)
// })
// console.log(d === e, d, e)

