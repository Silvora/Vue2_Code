import { mergeOptions } from "./utils"

export function initGlobalAPI(Vue) {//合并

    Vue.options = { _base: Vue }
    Vue.mixin = function (mixin) {
        this.options = mergeOptions(this.options, mixin)
        return this
    }

    Vue.extend = function (options) {//模版渲染
        function Sub(options = {}) {
            this._init(options)
        }
        Sub.prototype = Object.create(Vue.prototype)
        Sub.prototype.constructor = Sub
        Sub.options = mergeOptions(Vue.options, options)

        return Sub
    }
    Vue.options.component = {}
    Vue.component = function (id, definition) {
        definition = typeof definition === "function" ? definition : Vue.extend(definition)

        Vue.options.component[id] = definition
    }
}