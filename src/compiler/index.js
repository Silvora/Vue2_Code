import { parseHTML } from "./parse"

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;//匹配表达式变量


function genProps(attrs) {
    let str = ""
    for (let i = 0; i < attrs.length; i++) {
        let attr = attrs[i]
        if (attr.name === "style") {
            let obj = {}
            attr.value.split(";").forEach(item => {
                let [key, value] = item.split(":")
                obj[key] = value
            });
            attr.value = obj
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},`
    }
    return `{${str.slice(0, -1)}}`
}

function gen(node) {
    if (node.type === 1) {
        return codeGen(node)
    } else {
        let text = node.text
        if (!defaultTagRE.test(text)) {
            return `_v(${JSON.stringify(text)})`
        } else {
            let token = [];
            let match
            defaultTagRE.lastIndex = 0
            let lastIndex = 0
            while (match = defaultTagRE.exec(text)) {
                let index = match.index;
                if (index > lastIndex) {
                    token.push(JSON.stringify(text.slice(lastIndex, index)))
                }
                token.push(`_s(${match[1].trim()})`)
                lastIndex = index + match[0].length
            }
            if (lastIndex < text.length) {
                token.push(JSON.stringify(text.slice(lastIndex)))

            }

            return `_v(${token.join("+")})`
        }
    }
}

function genChildren(children) {
    //console.log(children)
    return children.map(child => gen(child)).join(",")
}

function codeGen(ast) {
    let children = genChildren(ast.children)
    let code = (`_c('${ast.tag}',${ast.attrs.length > 0 ? genProps(ast.attrs) : 'null'}${ast.children.length ? `,${children}` : ''})`)

    //console.log(code)
    return code
}

export function compileToFunction(template) {
    //将template 转化为ast语法树
    let ast = parseHTML(template)
    //console.log(template)
    //console.log(ast)
    //生成render方法，执行render方法，返回虚拟dom
    let code = codeGen(ast)
    //console.log(code)
    code = `with(this){return ${code}}`
    //console.log(code)
    let render = new Function(code)
    //console.log(render.toString())
    return render
}