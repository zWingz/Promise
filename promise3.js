const PENDING = 'PENDING'
const RESOLVED = 'RESOLVED'
const REJECT = 'REJECT'
function _isFunction(val) {
    return typeof val === 'function'
}
class Promise3 {
    constructor(func) {
        this.value = null // 终值或者据因
        this.status = PENDING // 状态
        this.onResolveCallBack = [] // resolved 回调
        this.onRejectCallBack = [] // rejected 回调
        try {
            func(this.resolve.bind(this), this.reject.bind(this))
        } catch (e) {
            this.reject(e)
        }
    }
    resolve(val){
        if(this.status === PENDING) {
            this.value = val // 设置终值
            this.status = RESOLVED // 设置状态
            this.onResolveCallBack.forEach(each => {
                each(val) // 执行回调
            })
        }
    }
    reject(reason){
        if(this.status === PENDING) {
            this.value = reason // 设置据因
            this.status = REJECT // 设置状态
            this.onRejectCallBack.forEach(each => {
                each(reason) // 执行回调
            })
        }
    }
    then(nowResolve = val => val, nowReject) {
        const self = this
        /**
         * 返回一个新的promise, 用于链式调用
         */
        return new Promise3(function(nextResolve, nextReject) {
            // console.log(this)
            /**
             * 将当前promise的value作为参数,执行回调方法
             * @param {Object} arg
             */
            function execute(arg) {
                try {
                    // 获取当前then的结果, 包括成功与失败
                    // 如果arg是函数, 则以promise的值调用该函数
                    // 否则将此函数作为值继续执行
                    return _isFunction(arg) ? arg(self.value) : arg
                } catch (e) {
                    // 如果出错
                    // 则传递给下一个promise,执行reject
                    return nextReject(e)
                }
            }
            /**
             * 判断当前then方法处理后的结果是一个thenable对象还是一个值
             * 如果是thenable对象, 则触发该对象的then方法
             * 如果是一个值, 则直接调用resolve解析这个值
             * @param {Object} val 当前then方法的返回结果
             */
            function handlePromise(val) {
                // 判断是否有then方法
                if(val && val.then && _isFunction(val.then)) {
                    val.then(nextResolve, nextReject)
                } else {
                    // 没有then方法, 则用此值调用nextResolve
                    nextResolve(val)
                }
            }
            // 执行resolve方法
            const doResolve = function() {
                handlePromise(execute(nowResolve))
            }
            // 执行reject方法
            // 如果当前then没有相应的reject回调
            const doReject = function() {
                handlePromise(execute(nowReject || nextReject))
            }
            if(self.status === PENDING) {
                // 如果当前promise还未执行完毕, 则设置回调
                self.onResolveCallBack.push(doResolve)
                self.onRejectCallBack.push(doReject)
            } else if(self.status === RESOLVED){
                // 如果为RESOLVE, 则异步执行resolve
                setTimeout(doResolve, 0)
            } else {
                // 如果为REJECT, 则异步执行reject
                setTimeout(doReject, 0)
            }
        })
    }
}


let a = new Promise3(function(res, rej) {
    res(10)
}).then(val => {
    console.log(val)
    throw new Error('test error')
    return 20
}).then(val => {
    console.log(val * 4)
}, err => {
    console.log(err.message)
})
console.log('after promise')