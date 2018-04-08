# Promise/A+ 规范

```
英 ['prɒmɪs]  美 ['prɑmɪs]
n. 许诺，允诺；希望
vt. 允诺，许诺；给人以…的指望或希望
vi. 许诺；有指望，有前途
```

## 术语

- Promise 一个拥有then方法的对象或者函数, 他的行为满足Promise/A+规范
- thenable 一个定义了then方法的对象或者函数(鸭子类型)
    ```
    鸭子类型（duck typing）
    如果它走起路来像鸭子，叫起来也是鸭子，那么它就是鸭子。
    只关注对象的行为，不关注对象本身面向接口编型 ，而不是面向实现编程，是设计模式中最重要的思想
    ```
- 值（value） Promise被执行后得到的值，可以是任何合法值,包括undefined, thenable 和 promise
- 异常（exception） 使用throw所抛出的Error
- 据因（reason） 异常的原因，既Promise被拒绝的原因

## 要求

- Promise状态
    - 等待态(Pending) 可以转换成执行态或者拒绝态
    - 执行态(Fulfilled) 此时Promise不能转换至其他态, 必须拥有一个不可变的终止
    - 拒绝态(Rejected) 此时Promise处于拒绝态, 不可能转换至其他态, 且拥有不可变的原因

- Then方法
    - Promise必须提供一个then方法访问其当前值, 终值以及据因
    - promise.then(onFulfilled, onReject)
    - onFulfilled 会在Promise执行结束后调用, 其第一个参数为promise的终值
    - onReject 会在Promise被拒绝后调用, 其第一个参数为Promise的据因
    - onFulfilled 和 onReject 调用次数不可以超过一次
    - then方法必须返回一个新的promise对象


## Promise 解决过程

Promise 解决过程是一个抽象的操作, 其需要输入一个promise和一个值, 表示为`[[Resolve]](promise, x)`,

如果x有then方法而且看上去像一个Promise, 则尝试使promise接受x的状态, 否则使用x的值来执行promise.


运行`[[Resolve]](promise, x)`需要遵循以下步骤

- 如果x与promise相对, 则说明两者为同一个对象, 用TypeError为据因拒绝执行promise。

- 如果x为promise，则使promise接受x的状态(简单说就是, 一旦返回的是promise, 则用新的promise来执行接下来的步骤)
    - 如果x处于等待态, 则promise保持为等待态, 直到x被执行或者拒绝
    - 如果x处于执行态, 则相同的值执行promise
    - 如果x处于拒绝态, 则相同的据因拒绝promise


- x 为对象或函数(thenable, 鸭子类型)
    - 把 x.then 赋值给 then
    - 如果取 x.then 的值时抛出错误 e ，则以 e 为据因拒绝 promise
    - 如果 then 是函数，将 x 作为函数的作用域 this 调用之。传递两个回调函数作为参数，第一个参数叫做 resolvePromise ，第二个参数叫做 rejectPromise:
        - 如果 resolvePromise 以值 y 为参数被调用，则运行 `[[Resolve]](promise, y)`
        - 如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise
        - 如果 resolvePromise 和 rejectPromise 均被调用，或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用 `注1`
        - 如果调用 then 方法抛出了异常 e：
            - 如果 resolvePromise 或 rejectPromise 已经被调用，则忽略之 `注2`
            - 否则以 e 为据因拒绝 promise
        - 如果 then 不是函数，以 x 为参数执行 promise `注3`
    ``` javascript
        /**
         * @example
         */
        promise.then(val => ({
            then(res, rej) {
                // 只优先采用首次调用, 另一个将会被忽略
                res() // 注1
                rej() // 注1
                throw new Error() // 注2: 忽略
            })
        }).then(val => ({
            then: {a: 1} // 注3, 相当于返回了一个{then: {a: 1}} 对象
        }))
    ```
- 如果 x 不为对象或者函数，以 x 为参数执行 promise


如果一个 promise 被一个循环的 thenable 链中的对象解决，而 `[[Resolve]](promise, thenable)` 的递归性质又使得其被再次调用，根据上述的算法将会陷入无限递归之中。算法虽不强制要求，但也鼓励施者检测这样的递归是否存在，若检测到存在则以一个可识别的 TypeError 为据因来拒绝 promise。


## 其余

当promise抛出异常.但是没有相应的handle去处理的时候.(既没有调用`catch`)

这时候promise本身并不会将异常抛出. 而是以`console.error`形式提示

例如:

node 中会提示 `UnhandledPromiseRejectionWarning`

浏览器中会提示 `Uncaught (in promise)`

这两个仅通过`console.error`提示, 并不能在try catch中捕获到


## 尚未解决问题

- 由于用的是setTimeout模拟, 所以优先级不能保证高于setTimeout
    - 浏览器中可以用MessageChannel(macrotask)
    - node中可以用setImmediate(优先级在某些情况下比setTimeout高一些)
    - setTimeout和setImmediate在无IO操作下,两者执行顺序不确定,但是在IO操作下,setImmediate比setTimeout优先级高. 且setImmediate只在IE下有效

- 没有维护特定的任务队列, 所以在在调用Promise.reject(arg)后, 不能确定后续是否有对应的catch方法, 无法抛出`UnhandledPromiseRejectionWarning` 警告

- all、race方法未实现