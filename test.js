const MPromise = require('./index.js')

function a(val, promise) {
    return new promise(function(resolve, reject) {
        setTimeout(function() {
            // throw new Error('promisee error')
            resolve(val)
        }, 500)
    })
}


function test(promise) {
    console.log(`<----- ${promise === MPromise ? 'MPromise' : 'Promise'} ------>`)
    b = a(10, promise)
    b = b.then(val => {
        throw new Error('test promise')
        console.log('success first')
        return val * 2
    })
    .then(val => {
        console.log('success second')
        return new promise(function(resolve, reject) {
            setTimeout(() => {
                resolve('reject')
            }, 1000)
        })
    })
    .then(val => {
        console.log('success third')
        return val * 3
    })
    // .then(val => {
    //     console.log('finish -->', val, val * 3)
    // })
    // .catch(e => {
    //     console.log(e)
    // })
}

test(MPromise)
// test(Promise)
