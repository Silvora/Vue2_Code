import { createElementVNode, createTextVNode } from "../vdom/index"
import Watcher from "./watcher"
import { patch } from "../vdom/path"



export function initLifeCycle(Vue) {
    Vue.prototype._update = function (vNode) {
        //有初始化和更新的功能
        const vm = this
        const el = vm.$el
        const preVNode = vm._vNode
        vm._vNode = vNode
        if (preVNode) {//判断是否dom，diff算法
            vm.$el = patch(preVNode, vNode)

        } else {
            vm.$el = patch(el, vNode)

        }

    }
    Vue.prototype._c = function () {
        return createElementVNode(this, ...arguments)
    }
    Vue.prototype._v = function () {
        return createTextVNode(this, ...arguments)
    }
    Vue.prototype._s = function (value) {
        if (typeof value !== "object") return value
        return JSON.stringify(value)
    }
    Vue.prototype._render = function () {
        //const vm = this
        //渲染时，会从实例取值
        return this.$options.render.call(this)
    }

}


export function mountComponent(vm, el) {
    vm.$el = el
    //调用render方法产生虚拟节点

    // new Watcher(vm, () => {
    //     vm._update(vm._render())
    // })
    const updateComponent = () => {
        vm._update(vm._render())
    }

    new Watcher(vm, updateComponent, true)
    //根据虚拟dom产生真实dom
    //插入el中
}