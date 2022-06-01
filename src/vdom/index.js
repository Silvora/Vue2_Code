//_h,_c
export function createElementVNode(vm, tag, data, ...children) {

    if (data == null) {
        data = {}
    }
    let key = data.key
    if (key) {
        delete data.key
    }
    return vNode(vm, tag, key, data, children)
}

//_v
export function createTextVNode(vm, text) {
    return vNode(vm, undefined, undefined, undefined, undefined, text)
}

function vNode(vm, tag, key, data, children, text) {
    return {
        vm,
        tag,
        key,
        data,
        children,
        text
    }
}

export function isSameVNode(oldNode, newNode) {

    return oldNode.tag === newNode.key && oldNode.key === newNode.key

}
