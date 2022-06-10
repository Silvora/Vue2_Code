//_h,_c

const isReservedTag = (tag) => {
    return ["a", "div", "p", "button", "span"].includes(tag)
}

export function createElementVNode(vm, tag, data, ...children) {

    if (data == null) {
        data = {}
    }
    let key = data.key
    if (key) {
        delete data.key
    }

    if (isReservedTag(tag)) {
        return vNode(vm, tag, key, data, children)
    } else {

        let Ctor = vm.$options.components[tag]
        //return vNode(vm, tag, key, data, children)
        return createComponentVNode(vm, tag, key, data, children, Ctor)
    }
}
function createComponentVNode(vm, tag, key, data, children, Ctor) {
    if (typeof Ctor === "object") {
        Ctor = vm.$options._base.extend(Ctor)
    }
    //debugger;
    data.hook = {
        init(vNode) {
            let instance = vNode.componentInstance = new vNode.componentOptions.Ctor
            instance.$mount()
        }
    }

    return vNode(vm, tag, key, data, children, null, { Ctor })
}

//_v
export function createTextVNode(vm, text) {
    return vNode(vm, undefined, undefined, undefined, undefined, text)
}

function vNode(vm, tag, key, data, children, text, componentOptions) {
    return {
        vm,
        tag,
        key,
        data,
        children,
        text,
        componentOptions
    }
}

export function isSameVNode(oldNode, newNode) {

    return oldNode.tag === newNode.key && oldNode.key === newNode.key

}
