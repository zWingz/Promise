const MPromise = require('./index.js')


function createPromise(val = 100, promise) {
    return new MPromise(function(res, rej) {
        setTimeout(() => {
            res(val)
        }, 100)
    })
}

function test(promise) {
    console.log(`<----- ${promise === MPromise ? 'MPromise' : 'Promise'} ------>`)
    const pro = createPromise(100)
    const error = new Error('test error')
    pro.then(val => {
        throw error
        return val
    }).then((val) => {
        return val
    })
    // .catch(e => {
        // console.log(e)
    // })
}

/**
 * 当new的时候抛出异常
 * 但是同时又有resolve时候, 两者执行顺序不一样时候, 结果也会不一样
 * @example
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
//     res(10)
// })
// d.then(val => {
//     throw new Error('test error')
//     console.log('then resolve', val)
// }).catch(e => {
//     console.log('catch error')
//     return 100
// }).then(val => {
//     console.log(val)
// })

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
 * return self
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
 * return thenable
 * @example
 */

d = new Promise(function(res, rej) {
    res(10)
})
d.then(val => {
    return new Promise(function(res, rej) {
        res(20)
    })
})
.then(val => ({
    then(res, rej) {
        res(val * 2)
    }
}))
.then(val => ({
    then: 40 // then不为方法, 则用{then}为值执行promise
}))
.then(val => {
    console.log(val)
})