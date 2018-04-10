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
        this.onResolveCallback = null
        // REJECT回调
        this.onRejectCallback = null
        // 保存当前promise的值
        this.value = null
        // 判断当前promise是否有then回调
        // 用来判断是否需要抛出unHandledPromiseRejectionWarning
        this.hasThenHandle = false
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
    /**
     * promise执行函数
     * 将promise状态由PENDING转换为RESOLVED
     * 并且设置终值, 执行回调
     * @param {any} val 终值
     * @memberof MPromise
     */
    resolve(val) {
        // 只有当状态为PENDING时候才执行
        // 确保Promise只会被执行一次
        if(this.status === PENDING) {
            // 记录当前的值
            this.value = val
            // 修改状态
            this.status = RESOLVED
            // 执行回调
            this.onResolveCallback && this.onResolveCallback()
        }
    }
    /**
     * promise拒绝函数
     * 将promise状态由PENDING转换为REJECT
     * 并且设置据因, 执行回调
     * @param {any} e 据因 
     * @memberof MPromise
     */
    reject(e) {
        // 只有当前状态为PENDING的时候才执行
        // 确保Promise只会被执行一次
        if(this.status === PENDING) {
            // 设置据因
            this.value = e
            // 设置状态为REJECT
            this.status = REJECT
            // 如果reject回调不为空, 则遍历并循环
            this.onRejectCallback && this.onRejectCallback()
            // 延迟判断是否有then处理
            // 否则抛出警告
            setTimeout(() => {
                if(!this.hasThenHandle) {
                    console.error('UnhandledPromiseRejectionWarning --->', e.message || e)
                }
            })
        }
    }
    /**
     * then方法
     * @param {Function} [nowResolve=val => val] 前then的resolve函数, 当promise为RESOLVE时,处理当前结果 
     * @param {Function} nowReject 当前then的reject函数, 当promise被REJECT时调用
     * @returns {MPromise}
     * @memberof MPromise
     */
    then(nowResolve = val => val, nowReject) {
        const self = this
        // 如果有then方法调用, 则将hasThenHandle设为true
        self.hasThenHandle = true
        /**
         * 返回一个新的promise, 用于链式调用
         */
        return new MPromise(function(nextResolve, nextReject) {
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
                if(val === self) {
                    console.error('不能返回自身')
                }
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
                self.onResolveCallback = doResolve
                self.onRejectCallback = doReject
            } else if(self.status === RESOLVED){
                // 如果为RESOLVE, 则异步执行resolve
                setTimeout(doResolve, 0)
            } else {
                // 如果为REJECT, 则异步执行reject
                setTimeout(doReject, 0)
            }
        })
    }
    /**
     * 捕获异常
     * 相当于加入一个then方法
     * 只不过这个then方法只有onReject
     * @param {Function} reject 
     * @returns {MPromise}
     * @memberof MPromise
     */
    catch(reject) {
        // 相当于新加入一个then方法
        return this.then(undefined, reject)
    }
    /**
     * 非标准中定义
     * 不关心promise状态, 只管执行操作
     * 
     * @param {any} [fnc=() => {}] 
     * @returns {MPromise}
     * @memberof MPromise
     */
    finally(fnc = () => {}) {
        return this.then(val => {
            fnc()
            return val
        }, err => {
            fnc()
            throw err
        })
    }
    /**
     * Promise.resolve
     * 将参数转成Promise对象
     * 
     * @static
     * @param {any} val 
     * @returns {MPromise}
     * @memberof MPromise
     */
    static resolve(val) {
        // 如果为MPromise实例
        // 则返回该实例
        if(val instanceof MPromise) {
            return val
        } else if(val && val.then && _isFunction(val.then)) {
            // 如果为具有then方法的对象
            // 则转为MPromise对象, 并且执行thenable
            /**
             * @example
             * MPromise.resolve({
             *      then(res) {
             *          console.log('do promise')
             *          res(10)
             *      }
             *  })
             */
            return new MPromise(function(res, rej) {
                // 执行异步
                setTimeout(function() {
                    val.then(res, rej)
                }, 0)
            })
        }
        // 如果val为一个原始值,或者不具有then方法的对象
        // 则返回一个新的MPromise对象,状态为resolved
        /**
         * @example
         * MPromise.resolve()
         */
        return new MPromise(function(res) {res(val)})
    }
    /**
     * reject方法参数会原封不动的作为据因而变成后续方法的参数
     * 且初始状态为REJECT
     * 不存在判别thenable
     * @static
     * @param {any} reason 
     * @returns 
     * @memberof MPromise
     */
    static reject(reason) {
        /**
         * @example
         * MPromise.reject('some error')
         */
        return new MPromise(function(res, rej) {rej(reason)})
    }
}
MPromise.PENDING = PENDING
MPromise.RESOLVED = RESOLVED
MPromise.REJECT = REJECT
module.exports = MPromise