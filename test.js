const MPromise = require('./index.js')

const query = []
function createPromise(val = 10, promise = MPromise) {
    return new promise(function(res, rej) {
        setTimeout(() => {
            res(val)
        }, 100)
    })
}
function wrapper(text, fnc) {
    return function() {
        console.log(`<--------- @example ${text} ------------->`)
        fnc()
    }
}
function done() {
    const fnc = query.shift()
    fnc && fnc()
}
function exampleFnc(text, fun) {
    query.push(wrapper(text, fun))
}

/**
 * @example
 * 基本使用
 */
exampleFnc('基本使用', () => {
    example = createPromise()
    example.then(val => {
        console.log(val)
        return val * 3
    }).then(val => {
        console.log(val)
        return val * 2
    }).finally(() => {
        done()
    })
})


 /**
  * @example
  * 异常处理
  */
 exampleFnc('异常处理', () => {
     example = createPromise()
     example.then(val => {
         throw new Error('example error')
         return val * 3
     }).then(val => {
         console.log(val)
         return val * 2
     }).catch(err => {
         console.log('catch error')
     }).finally(() => {
        done()
    })
 })


/**
 * @example
 * 当new的时候抛出异常
 * 但是同时又有resolve时候, 两者执行顺序不一样时候, 结果也会不一样
 * 
 */
exampleFnc('在new的时候抛出异常', () => {
    let d = new MPromise(function(res, rej) {
        res(10)
        throw new Error('test error') // 此时res已经执行了, 抛出的异常不会被处理

        // throw new Error('test error') // 先抛出异常, 则res不会被处理, 直接为reject态
        // res(10)
    }).then(val => {
        console.log('then resolve --> ', val)
    }, e => {
        console.log('then reject --> ', e)
    }).catch(e => {
        console.log('catch error')
    }).finally(() => {
        done()
    })
})

/**
 * 当new的时候抛出异常
 * 但是同时又有resolve时候, 两者执行顺序不一样时候, 结果也会不一样
 * @example
 * 
 */
exampleFnc('new 一个 promise时候, res, rej 只会执行第一个', () => {
    d = new MPromise(function(res, rej) {
        res(10) // 先执行了res, 则rej不会被执行, throw的错误也不会被捕获
        rej(20)
        throw new Error('test error')
    }).then(val => {
        console.log('then resolve', val)
    }).catch(e => {
        console.log('catch error')
        return 100
    }).then(val => {
        console.log(val)
    }).finally(() => {
        done()
    })
})

/**
 * throw error
 * @example
 */

 exampleFnc('异步 -> 异常捕获', () => {
     d = new MPromise(function(res, rej) {
         res(10)
     })
     d = d.then(val => {
         throw new Error('test error')
     })
     setTimeout(() => {
         d.catch(e => {
             console.log('catch error in setTimeout')
             return 100
         }).then(val => {
             console.log(val)
         }).finally(() => {
             done()
         })
     }, 1000)
 })
    


/**
 * 当then方法返回promise自身时候
 * 会出现异常警告
 * @example
 */
exampleFnc('then 方法返回自身会报错', () => {
    var a = new MPromise((res, rej) => {
        res(10)
        console.log('res')
    }).then(val => {
        console.log('then', val)
        return a
    })
    console.log('after promise')
})

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
//         console.log('do promise')
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
// d = MPromise.resolve(10)
// d.then(() => {
//     console.log('do promise then')
//     return 10
// }).then(val => {
//     console.log('after value', val)
// })
// console.log(d)

/**
 * @example
 * MPromise.reject
 */
// d = MPromise.reject('lll')
// console.log(d)
// e = d.catch(err => {
//     console.log(err)
// })


done()