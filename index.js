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
        if(!_isFunction(fn)) {
            throw new Error(`Promise resolver ${fn} is not a function`)
        }
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
    }
    reject(e) {
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
                // 如果为RESOLVE, 则异步执行resolve
                setTimeout(doResolve, 0)
            } else {
                // 如果为REJECT, 则异步执行reject
                setTimeout(doReject, 0)
            }
        })
    }
    catch(reject) {
        // 相当于新加入一个then方法
        return this.then(undefined, reject)
    }
    static resolve(val) {
        // 如果为MPromise实例
        // 则返回该实例
        if(val instanceof MPromise) {
            return val
        } else if(val && val.then && _isFunction(val.then)) {
            // 如果为具有then方法的对象
            // 则转为MPromise对象, 并且执行thenable
            return new MPromise(function(res, rej) {
                // 执行异步
                setTimeout(function() {
                    val.then(res, rej)
                }, 0)
            })
        }
        // 如果val为一个原始值,或者不具有then方法的对象
        // 则返回一个新的MPromise对象,状态为resolved
        const ret = new MPromise(function() {}) // 此处什么都不做
        ret.status = RESOLVED // 需要将状态改成RESOLVED
        ret.value = val // 设置val
        return ret
    }
    // reject方法参数会原封不动的作为据因而变成后续方法的参数
    // 且初始状态为REJECT
    // 不存在判别thenable
    static reject(reason) {
        const ret = new MPromise(function() {}) // 此处什么都不做
        ret.status = REJECT // 需要将状态改成REJECT
        ret.value = reason // 设置reason
        return ret
    }
}
MPromise.PENDING = PENDING
MPromise.RESOLVED = RESOLVED
MPromise.REJECT = REJECT
module.exports = MPromise