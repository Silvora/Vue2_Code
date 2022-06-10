import { isSameVNode } from "../vdom/index.js"

export function patchProps(el, oldProps = {}, props = {}) {

    let oldStyle = oldProps.style
    let newStyle = props.style

    for (let key in oldStyle) {
        if (!newStyle[key]) {
            el.style[key] = ""
        }
    }
    for (let key in oldProps) {
        if (!props[key]) {
            el.removeAttribute(key)
        }
    }
    for (let key in props) {

        if (key === "style") {
            for (let styleName in props.style) {
                el.style[styleName] = props.style[styleName]
            }
        } else {
            el.setAttribute(key, props[key])
        }


    }


}

function createComponent(vNode) {
    let v = vNode.data
    if ((v = v.hook) && (v = v.init)) {
        v(vNode)
    }
    if (vNode.componentInstance) {
        return true
    }
}
export function createElm(vNode) {//创建dom
    //debugger;
    let { tag, data, children, text } = vNode
    console.log(tag, vNode)
    if (typeof tag === "string") {

        if (createComponent(vNode)) {
            return vNode.componentInstance.$el
        }
        vNode.el = document.createElement(tag)
        patchProps(vNode.el, {}, data)
        //debugger;

        children.forEach(item => {
            console.log(item)
            vNode.el.appendChild(createElm(item))


        });
    } else {
        vNode.el = document.createTextNode(text)
    }

    return vNode.el
}

export function patch(oldVNode, vNode) {

    if (!oldVNode) { return createElm(vNode) }

    const isRealElement = oldVNode.nodeType

    if (isRealElement) {//渲染dom
        const elm = oldVNode//获取真实dom
        const parentElm = elm.parentNode//父元素

        let newElm = createElm(vNode)

        parentElm.insertBefore(newElm, elm.nextSibling)
        parentElm.removeChild(elm)//删除老节点

        return newElm

    } else {//diff算法
        //同级比较，判断key

        patchVNode(oldVNode, vNode)



    }
}

function patchVNode(oldVNode, vNode) {
    if (isSameVNode(oldVNode, vNode)) {//父节点判断
        let el = createElm(vNode)
        oldVNode.el.parentNode.removeChild(el, oldVNode.el)
        return el
    }

    let el = vNode.el = oldVNode.el//复用父节点
    if (!oldVNode.tag) {//判断文本
        if (oldVNode.text !== vNode.text) {
            el.textContent = vNode.text
        }
    }

    patchProps(el, oldVNode.data, vNode.data)//判断标签

    //比较儿子
    let oldChildren = oldVNode.children || []
    let newChildren = vNode.children || []

    if (oldChildren > 0 && newChildren > 0) {//都有儿子
        updateChildren(el, oldChildren, newChildren)
    } else if (newChildren > 0) {//只有新儿子
        mountChildren(el, newChildren)
    } else if (oldChildren > 0) {//只有老儿子
        unmountChildren(el, oldChildren)
    }
    return el
}
function updateChildren(el, oldChildren, newChildren) {
    let oldStartIndex = 0
    let newStartIndex = 0
    let oldEndIndex = oldChildren.length - 1
    let newEndIndex = newChildren.length - 1

    let oldStartVNode = oldChildren[0]
    let newStartVNode = newChildren[0]
    let oldEndVNode = oldChildren[oldEndIndex]
    let newEndVNode = newChildren[newEndIndex]

    function makeIndexByKey(children) {
        let map = {}
        children.forEach((child, index) => {
            map[child.key] = index
        })
        return map
    }
    let map = makeIndexByKey(oldChildren)

    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {

        if (!oldStartVNode) {
            oldStartVNode = oldChildren[++oldStartIndex]
        } else if (!oldEndVNode) {
            oldEndVNode = oldChildren[--oldEndIndex]
        } else if (isSameVNode(oldStartVNode, newStartVNode)) {
            patchVNode(oldStartVNode, newStartVNode)
            oldStartVNode = oldChildren[++oldStartIndex]
            newStartVNode = newChildren[++newStartIndex]
        } else if (isSameVNode(oldEndVNode, newEndVNode)) {
            patchVNode(oldEndVNode, newEndVNode)
            oldEndVNode = oldChildren[--oldEndIndex]
            newEndVNode = newChildren[--newEndIndex]
        } else if (isSameVNode(oldEndVNode, newStartVNode)) {
            patchVNode(oldEndVNode, newStartVNode)
            el.insertBefore(oldEndVNode.el, oldStartVNode.el)
            oldEndVNode = oldChildren[--oldEndIndex]
            newStartVNode = newChildren[++newStartIndex]

        } else if (isSameVNode(oldStartVNode, newEndVNode)) {
            patchVNode(oldStartVNode, newEndVNode)
            el.insertBefore(oldStartVNode.el, oldEndVNode.el.nextSibling)
            oldStartVNode = oldChildren[++oldStartIndex]
            newEndVNode = newChildren[--newEndIndex]

        } else {
            let moveIndex = map[newStartVNode.key]
            if (moveIndex != undefined) {
                let moveVNode = oldChildren[moveIndex]
                el.insertBefore(moveVNode.el, oldStartVNode.el)
                oldChildren[moveIndex] = undefined
                patchVNode(moveVNode, newStartVNode)
            } else {
                el.insertBefore(createElm(newStartVNode), oldStartVNode.el)
            }
            newStartVNode = newChildren[++newStartIndex]
        }


    }

    if (newStartIndex <= newEndIndex) {//新的多余
        for (let i = newStartIndex; i <= newEndIndex; i++) {
            let child = createElm(newChildren[i])
            //el.appendChild(child)
            let anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null
            el.insertBefore(child, anchor)
        }
    }

    if (oldStartIndex <= oldEndIndex) {//老的多余
        for (let i = oldStartIndex; i <= oldEndIndex; i++) {
            if (oldChildren[i]) {
                let child = oldChildren[i].el
                el.removeChild(child)
            }
        }
    }



}

function mountChildren(el, newChildren) {
    for (let i = 0; i < newChildren.length; i++) {
        let child = newChildren[i]
        el.appendChild(createElm(child))

    }
}
function unmountChildren(el, newChildren) {
    el.innerHTML = ""
}