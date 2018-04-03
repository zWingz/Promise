# Promise/A+

``` plan
英 ['prɒmɪs]  美 ['prɑmɪs]
n. 许诺，允诺；希望
vt. 允诺，许诺；给人以…的指望或希望
vi. 许诺；有指望，有前途
```

## 术语

- Promise 一个拥有then方法的对象或者函数, 他的行为满足Promise/A+规范
- thenable 一个定义了then方法的对象或者函数(鸭子类型)
    ``` plan
    鸭子类型（duck typing
    如果它走起路来像鸭子，叫起来也是鸭子，那么它就是鸭子。
    只关注对象的行为，不关注对象本身面向接口编型 ，而不是面向实现编程，是设计模式中最重要的思想
    ```
- 值 Promise被执行后得到的值，可以是任何合法值,包括undefined, thenable 和 promise
- 异常 使用throw所抛出的Error
- 据因 异常的原因，既Promise被拒绝的原因

## 要求

- Promise状态
    - 等待态(Pending) 可以转换成执行态或者拒绝态
    - 执行态(Fulfilled) 此时Promise不能转换至其他态, 必须拥有一个不可变的终止
    - 拒绝态(Rejected) 此时Promise处于拒绝太, 不可能转换至其他态, 且拥有不可变的原因

- Then方法
    - Promise必须提供一个then方法访问其当前值, 终值以及据因
    - promise.then(onFulfilled, onReject)
    - onFulfilled 会在Promise执行结束后调用, 其第一个参数为promise的终值
    - onReject 会在Promise被拒绝后调用, 其第一个参数为Promise的据因
    - onFulfilled 和 onReject 调用次数不可以超过一次
    - then方法必须返回一个新的promise对象






## 其余

当promise抛出异常.但是没有catch去捕获的时候.
这时候promise本身并不会将异常抛出. 而是以console.error形式提示