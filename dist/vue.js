(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

    //重新数组的部分方法

    let oldArrayProto = Array.prototype;

    //newArrayProto.__proto__ = oldArrayProto,不用担心原数组方法被重写
    let newArrayProto = Object.create(oldArrayProto);

    let methods = [//快速找到重写方法
        "push",
        "pop",
        "shift",
        "unshift",
        "reverse",
        "sort",
        "splice"
    ];

    methods.forEach(method => {
        newArrayProto[method] = function (...args) {//重写数组方法
            //this指向arr
            const result = oldArrayProto[method].call(this, ...args);//内部调原来方法，

            //对新增的属性进行劫持，拿到observeArray
            let inserted;
            let ob = this.__ob__;
            // if (method === "push" || method === "unshift") {
            //     inserted = args
            // }
            // if (method === "splice") {
            //     inserted = args.slice(2)
            // }

            switch (method) {//获取新加的属性
                case "push":
                case "unshift":
                    inserted = args;
                    break;
                case "splice":
                    inserted = args.slice(2);
            }

            if (inserted) {
                ob.observe(inserted);
            }

            return result
        };
    });

    class Observe {
        constructor(data) {
            Object.defineProperty(data, "__ob__", {//设置不可枚举的__ob__,不然会爆站
                value: this,
                enumerable: false
            });

            //data.__ob__ = this//給数据加了一个标识，如果数据上有__ob__,就代表劫持过了，不能在这里写
            //defineProperty只能劫持已经存在的
            //遍历data
            if (Array.isArray(data)) {//判断是数组还是对象
                data.__proto__ = newArrayProto;//重写数组的部分（7个）方法,保留数组原有的方法

                this.observeArray(data);
            } else {
                this.walk(data);
            }
        }
        walk(data) {
            //重新定义，性能差
            Object.keys(data).forEach(key => {
                defineReactive(data, key, data[key]);//属性劫持
            });
        }
        observeArray(data) {
            data.forEach(item => {
                observe(item);//数组遍历劫持
            });
        }
    }

    function defineReactive(target, key, value) {//闭包
        observe(value);//值是对象，再次进行属性劫持
        Object.defineProperty(target, key, {
            get() {//取值
                return value
            },
            set(newValue) {//设置值
                if (newValue === value) return
                observe(value);
                value = newValue;
            }
        });
    }

    function observe(data) {
        //对对象进行数据劫持
        //判断是否是对象
        if (typeof data != "object" || data == null) {
            return
        }
        if (data.__ob__ instanceof Observe) {//说明对象被代理过
            return data.__ob__
        }

        return new Observe(data)
    }

    //import (observer)

    function initState(vm) {
        const opts = vm.$option;
        if (opts.data) {
            initData(vm);
        }
    }
    function proxy(vm, target, key) {
        Object.defineProperty(vm, key, {
            get() {
                return vm[target][key]
            },
            set(newValue) {
                vm[target][key] = newValue;
            }
        });
    }

    function initData(vm) {
        let data = vm.$option.data;//用户数据,data可能是函数，或对象
        data = typeof data === "function" ? data.call(vm) : data;
        //console.log(data)

        vm._data = data;//返回对象到_data

        observe(data);//defineProperty劫持

        //将vm._data用vm代理
        for (let key in data) {
            proxy(vm, "_data", key);
        }
    }

    function initMixin(Vue) {//給Vue增加init方法
        Vue.prototype._init = function (options) {//options用户选项
            const vm = this;
            vm.$option = options;//Vue自己的属性

            initState(vm);//初始化状态
        };
    }

    function Vue(options) {//options用户选项
        this._init(options);
    }

    initMixin(Vue);//扩展init方法

    return Vue;

}));
//# sourceMappingURL=vue.js.map
