const PENDING = 'PENDING'
const RESOLVED = 'RESOLVED'
const REJECT = 'REJECT'

function _isFunction(val) {
    return typeof val === 'function'
}

class MPromise {
    constructor(fn) {
        // 当前promise状态
        this.status = PENDING
        // RESOLVE回调
        this.onResolveCallback = []
        // REJECT回调
        this.onRejectCallback = []
        // 保存当前promise的值
        this.value = null
        try {
            fn(this.resolve.bind(this), this.reject.bind(this))
        } catch (e) {
            /**
             * 在new MPromise时候抛出的异常会被此处捕获到
             * @example
             * new MPromise(function(res, rej) {
             *      throw new Error('test') // 此时会执行
             *      res(10) // 此时res不会执行
             * })
             * new MPromise(function(res, rej) {
             *      res(10) // 此时res会执行
             *      throw new Error('test') // 此时不会执行, 因为promise状态已经是RESOLVED
             * })
             */
            this.reject(e)
        }
    }
    resolve(val) {
        // 使用setTimeout进行异步
        setTimeout(() => {
            // 只有当状态为PENDING时候才执行
            // 确保Promise只会被执行一次
            if(this.status === PENDING) {
                // 记录当前的值
                this.value = val
                // 修改状态
                this.status = RESOLVED
                // 执行回调
                this.onResolveCallback.forEach(each => {
                    each(this.value)
                })
            }
        })
    }
    reject(e) {
        // 使用setTimeout进行异步
        setTimeout(() => {
            // 只有当前状态为PENDING的时候才执行
            // 确保Promise只会被执行一次
            if(this.status === PENDING) {
                this.value = e
                this.status = REJECT
                // 如果reject回调不为空, 则遍历并循环
                if(this.onRejectCallback.length) {
                    this.onRejectCallback.forEach(each => {
                        each(this.value)
                    })
                } else {
                    // 如果reject回调为空, 则提示警告
                    // 此处不需要抛出异常, 即使抛出, 也会被try catch掉
                    console.error('UnhandledPromiseRejectionWarning')
                }
            }
        })
    }
    /**
     * then方法
     * @param {Function} res 当前then的resolve函数, 当promise为RESOLVE时,处理当前结果 
     * @param {Function} rej 当前then的reject函数, 当promise被REJECT时调用
     */
    then(nowResolve = val => val, nowReject) {
        const self = this
        /**
         * 返回一个新的promise, 用于链式调用
         */
        return new MPromise(function(nextResolve, nextReject) {
            // console.log(this)
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
                // 如果当前promise还未执行完毕, 则加入到回调列表中
                self.onResolveCallback.push(doResolve)
                self.onRejectCallback.push(doReject)
            } else if(self.status === RESOLVED){
                // 如果为RESOLVE, 则直接执行resolve
                doResolve()
            } else {
                // 如果为REJECT, 则直接执行reject
                doReject()
            }
        })
    }
    catch(reject) {
        // 相当于新加入一个then方法
        return this.then(undefined, reject)
    }
}
MPromise.PENDING = PENDING
MPromise.RESOLVED = RESOLVED
MPromise.REJECT = REJECT
module.exports = MPromise