import { observe } from "./observe/index";

//import (observer)

export function initState(vm) {
    const opts = vm.$option;
    if (opts.data) {
        initData(vm)
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
    let data = vm.$option.data;//用户数据,data可能是函数，或对象
    data = typeof data === "function" ? data.call(vm) : data;
    //console.log(data)

    vm._data = data//返回对象到_data

    observe(data)//defineProperty劫持

    //将vm._data用vm代理
    for (let key in data) {
        proxy(vm, "_data", key)
    }
}