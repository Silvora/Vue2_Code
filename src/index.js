import { compileToFunction } from "./compiler"
import { initMixin } from "./init"
import { initLifeCycle } from "./observe/lifecycle"
//import Watcher, { nextTick } from "./observe/watcher"
import { initStateMixin } from "./state.js"
import { createElm, patch } from "./vdom/path"
import { initGlobalAPI } from "./globalAPI.js"
function Vue(options) {//options用户选项
    this._init(options)
}




initMixin(Vue)//扩展init方法
initLifeCycle(Vue)//模版渲染


initStateMixin(Vue)//nextTick，Watch

initGlobalAPI(Vue)




//------------------------------

// let r1 = compileToFunction(`  <ul>
// <li key="a">a</li>
// <li key="b">b</li>
// <li key="c">c</li>
// <li key="d">d</li>
// <li key="e">e</li>
// </ul>`)
// let r2 = compileToFunction(`  <ul>
// <li key="c">c</li>
// <li key="a">a</li>
// <li key="p">p</li>
// <li key="d">d</li>
// <li key="e">e</li>
// <li key="i">i</li>
// </ul>`)

// let v1 = new Vue({ data: { name: "1" } })
// let p1 = r1.call(v1)
// let e1 = createElm(p1)
// document.body.appendChild(e1)

// let v2 = new Vue({ data: { name: "2" } })
// let p2 = r2.call(v2)


// setTimeout(() => {
//     let e2 = createElm(p2)
//     e1.parentNode.replaceChild(e2, e1)
// }, 5000)


export default Vue