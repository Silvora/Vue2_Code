import { initState } from "./state"
import { compileToFunction } from "./compiler/index"
import { mountComponent } from "./observe/lifecycle"
export function initMixin(Vue) {//給Vue增加init方法
    Vue.prototype._init = function (options) {//options用户选项
        const vm = this
        vm.$options = options//Vue自己的属性

        initState(vm)//初始化状态

        if (options.el) {
            vm.$mount(options.el)//数据挂载
        }
    }

    Vue.prototype.$mount = function (el) {
        let vm = this
        el = document.querySelector(el);
        let ops = vm.$options
        if (!ops.render) {//查找是否有render函数
            let template

            //是否有内外两部分的template
            if (!ops.template && el) {//没有模版，但有el
                template = el.outerHTML
            } else {
                if (el) {
                    template = ops.template//如果有el，采用模版内容
                }
            }
            if (template) {//是否有template，有就用
                const render = compileToFunction(template)
                ops.render = render
            }
        }
        mountComponent(vm, el)//组件挂载
    }
}

