# Promise 实现原理
[![CircleCI](https://img.shields.io/circleci/project/github/zWingz/Promise.svg)](https://circleci.com/gh/zWingz/Promise)
[![codecov](https://codecov.io/gh/zWingz/Promise/branch/master/graph/badge.svg)](https://codecov.io/gh/zWingz/Promise)
## Promise基本用法

```javascript
new Promise(function(resolve, reject) {
    resolve()
}).then(function(val) {
    return val
}, function(error) {
    catch(error)
}).catch(function(error) {
    catch(error)
})
```

Promise对象基本方法是`then`, 而`catch`是`then`的一个变形, 相当于`then(undefined, onReject)`

## 实现过程

根据Promise用法, 我们初步想到需要实现的方法是

- 构造函数
- resolve函数
- reject函数
- then函数

此时Promise原型应为

```javascript
const PENDING = 'PENDING'
const RESOLVED = 'RESOLVED'
const REJECT = 'REJECT'

class Promise {
    constructor(func) {}
    resolve(){}
    reject(){}
    then(onReslove, onReject){}
}
```

### 根据`Promise/A+规范`(以下简称规范)中所说的

- Promise有三个状态 `PENDING`, `FULFILLED`, `REJECTED`
- 状态只会从`PENDING`转换到`RESOLVED`或者`REJECTED`其中一个, 并且之后不会再改变
- 当Promise处于执行态时, 会有一个终值, 并且该值不会再改变
- 当Promise处于拒绝态时, 会有一个据因, 并且该据因不会再改变
- 当Promise由PENDING转换为RESOLVED时, 会触发`onResolve`回调, 并且只执行一次
- 当Promise由PENDING转换为REJECTED时, 会触发`onReject`回调, 并且只执行一次
- Promise状态的转换时机在于开发者何时调用promise的resolve或者reject函数

```javascript
class Promise {
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
    then(onReslove, onReject){}
}
```

这里可能有人会说Promise应该是一个异步的过程, 在上面代码中并没有看到任何的异步. 比如说: setTimeout。

解答：

其实当创建一个Promise实例的时候，整个过程是同步的。

也就是说

```javascript
const ins = new Promise(function(res, rej) {
    res(10)
})
console.log(ins)
console.log('after ins')

// 输出
// Promise {<resolved>: 10}
// after ins

```

当你执行完这一句， ins的状态会马上变成`RESOLVED`. 说明在构造方法中并没有执行异步操作。如果真的需要异步的话，则需要主动在调用`res`前，加上`setTimeout`来触发异步。

```javascript
const ins = new Promise(function(res, rej) {
    setTimeout(() => {
        res(10)
    })
})
console.log(ins)
console.log('after ins')

// 输出
// Promise {<pending>}
// after ins
```

### 还有一个`then`方法没有完成. 先看下规范怎么说

- 一个promise必须提供一个`then`方法以访问当前值, 终止和据因
- then接受两个参数`then(onResolve, onReject)`
- onResolve和onReject都是可选, 如果不是函数则被忽略
- onResolve方法在promise执行结束后被调用, 其第一个参数为promise的终值, 被调用次数不超过一次
- onReject方法在promise被拒绝后被调用, 其第一个参数为promise的据因, 同样被调用次数不超过一次
- onFulfilled 和 onRejected 只有在执行环境堆栈仅包含平台代码时才可被调用 
- 如果onResolve和onReject返回一个值x, 则执行 **Promise解决过程**
- then方法必须返回一个`promise`对象

简单说就是

- 如果promise处于pending, 则将then回调放入promise的回调列表中
- 如果promise处于resolved, 则实行then方法中的onResolve
- 如果promise处于rejected, 则执行then方法中的onReject
- then方法要确保onResolve和onReject异步执行
- onResolve和onReject返回的值都将用来解决下一个promise(后面再讲解)
- 返回新的promise(注意: 一定是新的promise)

```javascript
class Promise() {
    // ...
    then(onResolve, onReject){
        const self = this
        return new Promise(function(nextResolve, nextReject) {
            if(self.status === PENDING) {
                // 加入到任务队列
                self.onResolveCallback = onResolve
                self.onRejectCallback = onReject
            } else if(self.status === RESOLVED) {
                // 异步执行
                setTimeout(onResolve, 0, self.value)
            } else {
                // 异步执行
                setTimeout(onReject, 0, self.value)
            }
        })
    }
}
```

此时Promise已经可以完成异步操作.
但是Promise还有一个关键特点是可以链式调用. 目前是还没有实现链式调用这一步.
具体代码看`promise2.js`

### 接下来继续看下规范怎么说

Promise 解决过程

- blablabla 这里比较长

**简单说就是**

x为then方法中onResolve或者onReject中返回的值, promise2为then方法返回的新promise.

promise的解决过程是一个抽象步骤. 需要输入一个promise和一个值. 表示为`[[Resolve]](promise, x)`

- 如果x和promise2相等, 则以`TypeError`为据因拒绝执行promise2
- 如果x为Promise实例, 则让promise2接受x的状态
- 如果x为thenable对象, 则调用其`then`方法
- 如果都不满足, 则用x为参数执行promise2

继续修改then方法

```javascript
class Promise() {
    // ...
    then(nowResolve = val => val, nowReject) {
        const self = this
        /**
         * 返回一个新的promise, 用于链式调用
         */
        return new Promise(function(nextResolve, nextReject) {
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
}
```

至此一个`Promise`可以说基本完成了.(具体代码请看`promise3.js`)


### 规范外的一些东西

其实规范中定义的是`Promise`的构建和执行过程.

而我们日常用到的却不至于规范中所提到的.

比如

- catch
- finally
- Promise.resolve
- Promise.reject
- all (未实现)
- race (未实现)

那接下来就说下关于这部分的实现

#### catch

上面有提到. catch其实是`then(undefined, reject)` 的简写. 所以这里比较简单

``` javascript
class Promise() {
    // ...
    catch(reject) {
        // 相当于新加入一个then方法
        return this.then(undefined, reject)
    }
}
```

#### finally (ES2018引入标准)

finally函数作用我想大家都应该知道, 就是无论当前promise状态是如何. 都一定会执行回调.

finally方法中, 不接收任何参数, 所以并不能知道前面的Promise的状态.

同时, 他不会对promise产生影响.总是返回原来的值 所以在`finally`中的操作,应该是与状态无关, 不依赖于promise的执行结果

```javascript
class Promise() {
    // ...
    finally(fnc = () => {}) {
        return this.then(val => {
            fnc()
            return val
        }, err => {
            fnc()
            throw err
        })
    }
}
```

#### Promise.resolve和Promise.reject (这里是从ES6入门中看到的定义)

```javascript
// 调用形式
Promise.resolve(arg)
Promise.reject(arg)
```

- Promise.resolve

    根据arg的不同, 会执行不同的操作
       - arg为Promise实例, 则原封不动的返回这个实例
       - arg为thenable对象, 则会将arg转成promise, 并且立即执行`arg.then`方法(并不代表同步, 而是本轮事件循环结束时执行)
       - arg不满足上述情况, 则返回一个新的Promise实例, 状态为resolved, 终值为arg
    因此`Promise.resolve`是一个更方便的创建`Promise`实例的方法.

- Promise.reject

    这里就不会区分arg, 而是原封不动的把arg作为据因, 执行后续方法的调用.

实现代码

```javascript
class Promise() {
    // ...
    /**
     * Promise.resolve
     * 将参数转成Promise对象
     * @static
     * @param {any} val
     * @returns {MPromise}
     * @memberof MPromise
     */
    static resolve(val) {
        // 如果为MPromise实例
        // 则返回该实例
        if(val instanceof Promise) {
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
            return new Promise(function(res, rej) {
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
        return new Promise(function(res) {res(val)})
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
        return new Promise(function(res, rej) {rej(reason)})
    }
}
```

### 开发过程中遇到其他问题

#### onResolveCallBack和onRejectCallBack是否需要用数组来维护 ?

规范中有提到, 每次调用`then`方法都会返回一个新的Promise实例.

那么其实每个promise实例中的回调最多为1个, 不需要使用数组来维护.

只用一个onResolve和onReject来维护就可以.

#### node中的`unhandledRejection`和浏览器中的`Uncaught (in promise)` 提示

在Promise中产生的所有错误都会被Promise吞掉. 当没有相应的错误处理函数时候, node和浏览器分别有不同的表现.

但是这并不是一个新的错误, 因为不能用`try{} catch(){}` 捕获.

所以在浏览器端, 是一个`console.error`的错误提示, 在`node`中, 这个算是一个事件. 具体可以通过`process.on`来监听

```javascript
process.on('unhandledRejection', function (err, p) {
  throw err;
});
```

在编写代码中, 一开始卡在这一步挺久.

由于无法知道promise实例后续是否有相应的错误处理函数.

简单的判断`onReject === undefined` 是不行的.

形如:

```javascript
Promise.reject(10)
// 或者
new Promise(function(res, rej) {
    rej(10)
})
```
这类是同步执行的, `onReject === undefined` 恒为`true`.

我的做法是给promise实例添加一个`hasThenHandle`的属性, 在`then`方法中将其设为`true`

在`reject`方法中使用`setTimeout`异步判断该值是否为`true`, 如果不是则通过`console.error`抛出提示.

其实在原生Promise中, 抛出的`unhandledRejection` 也是属于异步的.

```javascript
Promise.reject(10)
console.log('after Promise.reject')
new Promise(function(res, rej) {
    rej(10)
})
console.log('after new Promise')

// 输出
// after Promise.reject
// after new Promise
// Uncaught (in promise) 10
// Uncaught (in promise) 10
```

于是这个问题也能得到很好地解决.

至此完整代码已经结束, 具体看`index.js`.

## 存在的问题

- 由于用的是setTimeout模拟, 所以优先级不能保证高于setTimeout
    - 浏览器中可以用MessageChannel(macrotask)
    - node中可以用setImmediate(优先级在某些情况下比setTimeout高一些)
    - setTimeout和setImmediate在无IO操作下,两者执行顺序不确定,但是在IO操作下,setImmediate比setTimeout优先级高. 且setImmediate只在IE下有效

## 参考

[【翻译】Promises/A+规范](http://www.ituring.com.cn/article/66566)

[ECMAScript 6入门](http://es6.ruanyifeng.com/#docs/promise#Promise-prototype-finally)

## 分享至此完结, 谢谢大家
