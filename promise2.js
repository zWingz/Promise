const PENDING = 'PENDING'
const RESOLVED = 'RESOLVED'
const REJECT = 'REJECT'
class Promise2 {
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
    then(onResolve, onReject){
        const self = this
        return new Promise2(function(nextResolve, nextReject) {
            if(self.status === PENDING) {
                // 加入到任务队列
                self.onResolveCallback.push(onResolve)
                self.onRejectCallback.push(onReject)
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


let a = new Promise(function(res, rej) {
    res(10)
})
a = a.then(val => {
    console.log(val)
    return 20
})
console.log('after promise', a)