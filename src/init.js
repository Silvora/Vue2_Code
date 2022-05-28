import { initState } from "./state"

export function initMixin(Vue) {//給Vue增加init方法
    Vue.prototype._init = function (options) {//options用户选项
        const vm = this
        vm.$option = options//Vue自己的属性

        initState(vm)//初始化状态
    }
}

