let id = 0
class Dep {
    constructor() {
        this.id = id++//属性dep要收集watcher
        this.subs = []//当前属性对应的watcher
    }
    depend() {

        Dep.target.addDep(this)//让watcher记住dep
        //this.subs.push(Dep.target)//会重复取dep
    }
    addSub(watcher) {
        this.subs.push(watcher)
    }
    notify() {
        this.subs.forEach(watcher => watcher.update())
    }
}

Dep.target = null

let stack = [];
export function pushTarget(watcher) {
    stack.push(watcher)
    Dep.target = watcher
}
export function popTarget() {
    stack.pop()
    Dep.target = stack[stack.length - 1]
}

export default Dep