//重新数组的部分方法

let oldArrayProto = Array.prototype

//newArrayProto.__proto__ = oldArrayProto,不用担心原数组方法被重写
let newArrayProto = Object.create(oldArrayProto)

let methods = [//快速找到重写方法
    "push",
    "pop",
    "shift",
    "unshift",
    "reverse",
    "sort",
    "splice"
]

methods.forEach(method => {
    newArrayProto[method] = function (...args) {//重写数组方法
        //this指向arr
        const result = oldArrayProto[method].call(this, ...args)//内部调原来方法，

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
            default:
                break;
        }

        if (inserted) {
            ob.observe(inserted)
        }

        return result
    }
})

export {
    newArrayProto
}