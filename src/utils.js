const starts = {}
const LIFECYCLE = [
    "beforeCreate",
    "created"
]
LIFECYCLE.forEach(hook => {
    starts[hook] = function (p, c) {
        if (c) {
            if (p) {
                return p.concat(c)
            } else {
                return [c]
            }
        } else {
            return p
        }
    }
})

starts.components = function (parentVal, childVal) {
    //debugger;
    const res = parentVal ? Object.create(parentVal) : {}
    if (childVal) {
        for (let key in childVal) {
            res[key] = childVal[key]
        }
    }

    return res
}

export function mergeOptions(parent, child) {
    const options = {}
    for (let key in parent) {
        mergeField(key)
    }
    for (let key in child) {
        if (!parent.hasOwnProperty(key)) {
            mergeField(key)
        }
    }

    function mergeField(key) {
        if (starts[key]) {
            options[key] = starts[key](parent[key], child[key])
        } else {
            options[key] = child[key] || parent[key]
        }
    }
    return options

}