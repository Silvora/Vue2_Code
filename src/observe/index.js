import { newArrayProto } from "./array"

class Observe {
    constructor(data) {
        Object.defineProperty(data, "__ob__", {//设置不可枚举的__ob__,不然会爆站
            value: this,
            enumerable: false
        })

        //data.__ob__ = this//給数据加了一个标识，如果数据上有__ob__,就代表劫持过了，不能在这里写
        //defineProperty只能劫持已经存在的
        //遍历data
        if (Array.isArray(data)) {//判断是数组还是对象
            data.__proto__ = newArrayProto//重写数组的部分（7个）方法,保留数组原有的方法

            this.observeArray(data)
        } else {
            this.walk(data)
        }
    }
    walk(data) {
        //重新定义，性能差
        Object.keys(data).forEach(key => {
            defineReactive(data, key, data[key])//属性劫持
        })
    }
    observeArray(data) {
        data.forEach(item => {
            observe(item)//数组遍历劫持
        })
    }
}

export function defineReactive(target, key, value) {//闭包
    observe(value)//值是对象，再次进行属性劫持
    Object.defineProperty(target, key, {
        get() {//取值
            return value
        },
        set(newValue) {//设置值
            if (newValue === value) return
            observe(value)
            value = newValue
        }
    })
}

export function observe(data) {
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