const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`);//开始标签

const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);//闭合标签
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>]+)))?/;//匹配属性
const startTagClose = /^\s*(\/?)>/;//自定义或闭合标签
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;//匹配表达式变量


export function parseHTML(html) {
    const ELEMENT_TYPE = 1
    const TEXT_TYPE = 3;
    const stack = [];
    let currentParent;
    let root
    //栈结构，创建ast节点
    function createASTElement(tag, attrs) {
        return {
            tag,
            type: ELEMENT_TYPE,
            children: [],
            attrs,
            parent: null
        }
    }

    function start(tag, attrs) {
        let node = createASTElement(tag, attrs)
        if (!root) {//是否是父元素
            root = node
        }
        if (currentParent) {
            node.parent = currentParent;
            currentParent.children.push(node)
        }
        stack.push(node);
        currentParent = node//栈的最后一个

    }
    function chars(text) {
        text = text.replace(/\s/g, "")
        text && currentParent.children.push({
            type: TEXT_TYPE,
            text,
            parent: currentParent
        })
    }
    function end() {
        stack.pop()//弹出最后一个
        currentParent = stack[stack.length - 1]
    }



    function advance(n) {
        html = html.substring(n)
    }

    function parseStartTag() {
        const start = html.match(startTagOpen)
        if (start) {
            const match = {
                tagName: start[1],//标签名
                attrs: []
            }
            advance(start[0].length)
            //如果不是开始的结束标签，就要一直匹配
            let attr;
            let end;
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                advance(attr[0].length)
                match.attrs.push({
                    name: attr[1],
                    value: attr[3] || attr[4] || attr[5] || true
                })
            }
            if (end) {
                advance(end[0].length)
            }
            return match
        }

        return false
    }
    //console.log(html)
    while (html) {
        //如果textEnd为0，说明是一个开始或结束标签，>0,文本结束位置
        let textEnd = html.indexOf("<")
        if (textEnd == 0) {
            const startTagMatch = parseStartTag()
            if (startTagMatch) {
                start(startTagMatch.tagName, startTagMatch.attrs)
                continue
            }
            let endTagMatch = html.match(endTag)
            if (endTagMatch) {
                advance(endTagMatch[0].length)
                end()
                continue
            }
        }

        if (textEnd >= 0) {//文本
            let text = html.substring(0, textEnd)//文本内容
            if (text) {
                chars(text)
                advance(text.length)
            }
        }
    }

    return root
}