const PENDING = 'PENDING'
const RESOLVED = 'RESOLVED'
const REJECT = 'REJECT'

class MPromiseError extends Error {
    constructor(e) {
        super(e)
        this.name = 'UnhandledPromiseRejectionWarning'
    }
}

module.exports = class MPromise {
    constructor(fn) {
        // 当前promise状态
        this.status = PENDING
        // RESOLVE回调
        this.onResolveCallback = []
        // REJECT回调
        this.onRejectCallback = []
        // 保存当前promise的值
        this.value = null
        pro = this
        try {
            // 进行异步
            setTimeout(() => {
                fn(this.resolve.bind(this), this.reject.bind(this))
            })
        } catch (e) {
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
            // 如果reject回调为空,则抛出错误
            if(this.onRejectCallback.length) {
                this.onRejectCallback.forEach(each => {
                    each(this.value)
                })
            } else {
                throw new MPromiseError(e)
            }
        }
    }
    /**
     * then方法
     * @param {Function} res 当前then的resolve函数, 当promise为RESOLVE时,处理当前结果 
     * @param {Function} rej 当前then的reject函数, 当promise被REJECT时调用
     */
    then(nowResolve = val => val, nowReject) {
        /**
         * 返回一个新的promise, 用于链式调用
         */
        return new MPromise((nextResolve, nextReject) => {
            // console.log(this)
            const self = this
            /**
             * 判断当前then方法处理后的结果是一个thenable对象还是一个值
             * 如果是thenable对象, 则触发该对象的then方法
             * 如果是一个值, 则直接调用resolve解析这个值
             * @param {Object} val 当前then方法的返回结果
             */
            function handlePromise(val) {
                if(val && val.then) {
                    val.then(nextResolve, nextReject)
                } else {
                    nextResolve(val)
                }
            }
            /**
             * 将当前promise的value作为参数,执行回调方法
             * @param {Function} fnc 
             */
            function execute(fnc) {
                try {
                    // 获取当前then的结果, 包括成功与失败
                    return fnc(self.value)
                } catch (e) {
                    // 当fnc抛出的错误是UnhandledPromiseRejectionWarning的话,需要再次抛出
                    // 否则会继续进入REJECT, 此时promise状态为REJECT, 将不会继续执行
                    // 所以此处需要重新将错误抛出
                    if(e instanceof MPromiseError) {
                        throw e
                    }
                    // console.log('catch a error', e)
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
            } else if(status === RESOLVED){
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