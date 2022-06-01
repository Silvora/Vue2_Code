import Dep from "./observe/dep";
import { observe } from "./observe/index";
import Watcher, { nextTick } from "./observe/watcher";

//import (observer)

export function initState(vm) {
    const opts = vm.$options;
    if (opts.data) {
        initData(vm)
    }
    if (opts.computed) {
        initComputed(vm)
    }
    if (opts.watch) {
        initWatch(vm)
    }
}
function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
        get() {
            return vm[target][key]
        },
        set(newValue) {
            vm[target][key] = newValue
        }
    })
}

function initData(vm) {
    let data = vm.$options.data;//用户数据,data可能是函数，或对象
    data = typeof data === "function" ? data.call(vm) : data;
    //console.log(data)

    vm._data = data//返回对象到_data

    observe(data)//defineProperty劫持

    //将vm._data用vm代理
    for (let key in data) {
        proxy(vm, "_data", key)
    }
}

function initComputed(vm) {
    const computed = vm.$options.computed
    const watchers = vm._computedWatchers = {}
    for (let key in computed) {
        let userDef = computed[key]

        let fn = typeof userDef === "function" ? userDef : userDef.get

        watchers[key] = new Watcher(vm, fn, { lazy: true })

        defineComputed(vm, key, userDef)
    }
}

function defineComputed(target, key, userDef) {
    typeof userDef === "function" ? userDef : userDef.get
    const setter = userDef.set || (() => { })
    Object.defineProperty(target, key, {
        get: createComputedGetter(key),
        set: setter
    })
}

function createComputedGetter(key) {
    return function () {
        const watcher = this._computedWatchers[key]
        if (watcher.dirty) {
            watcher.evaluate()
        }
        if (Dep.target) {
            watcher.depend()
        }

        return watcher.value
    }
}

function initWatch(vm) {
    let watch = vm.$options.watch
    for (let key in watch) {
        const handler = watch[key]
        if (Array.isArray(handler)) {
            for (let i = 0; i < handler.length; i++) {
                createWatcher(vm, key, handler[i])
            }
        } else {
            createWatcher(vm, key, handler)
        }
    }
}

function createWatcher(vm, key, handler) {
    //console.log(key, handler)
    if (typeof handler === "string") {
        handler = vm[handler]
    }


    return vm.$watch(key, handler)

}

export function initStateMixin(Vue) {
    Vue.prototype.$nextTick = nextTick

    Vue.prototype.$watch = function (exprOrFn, cb) {
        //console.log(exprOrFn, cb)
        new Watcher(this, exprOrFn, { user: true }, cb)
    }
}