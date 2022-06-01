import Dep, { popTarget, pushTarget } from "./dep";

let id = 0

class Watcher {
    constructor(vm, exprOrFn, options, cb) {
        //console.log([...arguments][2])
        this.vm = vm
        this.id = id++;
        this.renderWatcher = options; //渲染watcher
        //console.log(typeof exprOrFn)
        if (typeof exprOrFn === "string") {
            this.getter = function () {
                //console.log(vm[exprOrFn])
                return vm[exprOrFn]
            };
            //this.run()

        } else {
            this.getter = exprOrFn;

        }
        // console.log(exprOrFn, options)
        this.cb = cb;
        this.deps = [];
        this.depsID = new Set();
        this.lazy = options.lazy;
        this.dirty = this.lazy;

        this.user = options.user
        this.value = this.lazy ? undefined : this.get()
        // if (this.value) {
        //     this.run()
        // }
        // console.log(options.update)
        if (options) {
            this.run()
        }
        //console.log(options.update)


    }
    get() {
        //Dep.target = this//只有一份
        //console.log(this.user, "123456")
        pushTarget(this)
        let value = this.getter.call(this.vm)//去vm取值
        // Dep.target = null
        popTarget()
        return value
    }
    evaluate() {//计算属性
        this.value = this.get()
        this.dirty = false
    }
    addDep(dep) {
        let id = dep.id
        if (!this.depsID.has(id)) {
            this.deps.push(dep)
            this.depsID.add(id)
            dep.addSub(this)
        }
    }
    update() {
        //console.log(this.user, "123456")
        if (this.lazy) {
            this.dirty = true
        } else {
            //this.get()//从新渲染
            //console.log(this.user, "123456")
            queueWatcher(this)//把当前watcher暂存,然后全部更新
        }

    }
    depend() {
        let i = this.deps.length
        while (i--) {
            this.deps[i].depend()
        }
    }
    run() {
        console.log(this)
        let oldVal = this.value
        let newVal = this.get()
        if (this.user) {
            //console.log(this.cb)
            this.cb.call(this.vm, newVal, oldVal)
        }
    }
}

let queue = []
let has = {}
let pending = false

function flushSchedulerQueue() {
    let flushQueue = queue.slice(0)
    queue = []
    has = {}
    pending = false
    flushQueue.forEach(item => item.run())
}


function queueWatcher(watcher) {
    //console.log(watcher)
    //const id = watcher.id
    if (!has[id]) {
        queue.push(watcher)
        has[id] = true
        if (!pending) {
            setTimeout(flushSchedulerQueue, 0);
            pending = true
        }
    }
}

let callback = []
let waiting = false

function flushCallbacks() {
    let cbs = callback.slice(0)
    waiting = true
    callback = []
    cbs.forEach(cb => cb())
}
//nextTick没有使用api，而是采用降级的方式

let timeFunc;

if (Promise) {
    timeFunc = () => {
        Promise.resolve().then(flushCallbacks())
    }
} else if (MutationObserver) {
    let observe = new MutationObserver(flushCallbacks)
    let textNode = document.createTextNode(1)
    observe.observe(textNode, {
        characterData: true
    })
    timeFunc = () => {
        textNode.textContent = 2
    }
} else if (setImmediate) {
    timeFunc = () => {
        setImmediate(flushCallbacks)
    }
} else {
    setTimeout(flushCallbacks)
}

export function nextTick(cb) {//不是创建一个异步任务
    callback.push(cb)
    if (!waiting) {
        timeFunc()
        waiting = false
    }
}

export default Watcher