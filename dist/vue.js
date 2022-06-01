(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); //开始标签

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); //闭合标签

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>]+)))?/; //匹配属性

  var startTagClose = /^\s*(\/?)>/; //自定义或闭合标签

  function parseHTML(html) {
    var ELEMENT_TYPE = 1;
    var TEXT_TYPE = 3;
    var stack = [];
    var currentParent;
    var root; //栈结构，创建ast节点

    function createASTElement(tag, attrs) {
      return {
        tag: tag,
        type: ELEMENT_TYPE,
        children: [],
        attrs: attrs,
        parent: null
      };
    }

    function start(tag, attrs) {
      var node = createASTElement(tag, attrs);

      if (!root) {
        //是否是父元素
        root = node;
      }

      if (currentParent) {
        node.parent = currentParent;
        currentParent.children.push(node);
      }

      stack.push(node);
      currentParent = node; //栈的最后一个
    }

    function chars(text) {
      text = text.replace(/\s/g, "");
      text && currentParent.children.push({
        type: TEXT_TYPE,
        text: text,
        parent: currentParent
      });
    }

    function end() {
      stack.pop(); //弹出最后一个

      currentParent = stack[stack.length - 1];
    }

    function advance(n) {
      html = html.substring(n);
    }

    function parseStartTag() {
      var start = html.match(startTagOpen);

      if (start) {
        var match = {
          tagName: start[1],
          //标签名
          attrs: []
        };
        advance(start[0].length); //如果不是开始的结束标签，就要一直匹配

        var attr;

        var _end;

        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5] || true
          });
        }

        if (_end) {
          advance(_end[0].length);
        }

        return match;
      }

      return false;
    } //console.log(html)


    while (html) {
      //如果textEnd为0，说明是一个开始或结束标签，>0,文本结束位置
      var textEnd = html.indexOf("<");

      if (textEnd == 0) {
        var startTagMatch = parseStartTag();

        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }

        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end();
          continue;
        }
      }

      if (textEnd >= 0) {
        //文本
        var text = html.substring(0, textEnd); //文本内容

        if (text) {
          chars(text);
          advance(text.length);
        }
      }
    }

    return root;
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; //匹配表达式变量

  function genProps(attrs) {
    var str = "";

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];

      if (attr.name === "style") {
        (function () {
          var obj = {};
          attr.value.split(";").forEach(function (item) {
            var _item$split = item.split(":"),
                _item$split2 = _slicedToArray(_item$split, 2),
                key = _item$split2[0],
                value = _item$split2[1];

            obj[key] = value;
          });
          attr.value = obj;
        })();
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    }

    return "{".concat(str.slice(0, -1), "}");
  }

  function gen(node) {
    if (node.type === 1) {
      return codeGen(node);
    } else {
      var text = node.text;

      if (!defaultTagRE.test(text)) {
        return "_v(".concat(JSON.stringify(text), ")");
      } else {
        var token = [];
        var match;
        defaultTagRE.lastIndex = 0;
        var lastIndex = 0;

        while (match = defaultTagRE.exec(text)) {
          var index = match.index;

          if (index > lastIndex) {
            token.push(JSON.stringify(text.slice(lastIndex, index)));
          }

          token.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }

        if (lastIndex < text.length) {
          token.push(JSON.stringify(text.slice(lastIndex)));
        }

        return "_v(".concat(token.join("+"), ")");
      }
    }
  }

  function genChildren(children) {
    //console.log(children)
    return children.map(function (child) {
      return gen(child);
    }).join(",");
  }

  function codeGen(ast) {
    var children = genChildren(ast.children);
    var code = "_c('".concat(ast.tag, "',").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : 'null').concat(ast.children.length ? ",".concat(children) : '', ")"); //console.log(code)

    return code;
  }

  function compileToFunction(template) {
    //将template 转化为ast语法树
    var ast = parseHTML(template); //console.log(template)
    //console.log(ast)
    //生成render方法，执行render方法，返回虚拟dom

    var code = codeGen(ast); //console.log(code)

    code = "with(this){return ".concat(code, "}"); //console.log(code)

    var render = new Function(code); //console.log(render.toString())

    return render;
  }

  var id$1 = 0;

  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);

      this.id = id$1++; //属性dep要收集watcher

      this.subs = []; //当前属性对应的watcher
    }

    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        Dep.target.addDep(this); //让watcher记住dep
        //this.subs.push(Dep.target)//会重复取dep
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      }
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          return watcher.update();
        });
      }
    }]);

    return Dep;
  }();

  Dep.target = null;
  var stack = [];
  function pushTarget(watcher) {
    stack.push(watcher);
    Dep.target = watcher;
  }
  function popTarget() {
    stack.pop();
    Dep.target = stack[stack.length - 1];
  }

  //重新数组的部分方法
  var oldArrayProto = Array.prototype; //newArrayProto.__proto__ = oldArrayProto,不用担心原数组方法被重写

  var newArrayProto = Object.create(oldArrayProto);
  var methods = [//快速找到重写方法
  "push", "pop", "shift", "unshift", "reverse", "sort", "splice"];
  methods.forEach(function (method) {
    newArrayProto[method] = function () {
      var _oldArrayProto$method;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      //重写数组方法
      //this指向arr
      var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args)); //内部调原来方法，
      //对新增的属性进行劫持，拿到observeArray


      var inserted;
      var ob = this.__ob__; // if (method === "push" || method === "unshift") {
      //     inserted = args
      // }
      // if (method === "splice") {
      //     inserted = args.slice(2)
      // }

      switch (method) {
        //获取新加的属性
        case "push":
        case "unshift":
          inserted = args;
          break;

        case "splice":
          inserted = args.slice(2);
      }

      if (inserted) {
        ob.observeArray(inserted);
      }

      ob.dep.notify();
      return result;
    };
  });

  var Observe = /*#__PURE__*/function () {
    function Observe(data) {
      _classCallCheck(this, Observe);

      this.dep = new Dep(); //给每个对象添加dep

      Object.defineProperty(data, "__ob__", {
        //设置不可枚举的__ob__,不然会爆站
        value: this,
        enumerable: false
      }); //data.__ob__ = this//給数据加了一个标识，如果数据上有__ob__,就代表劫持过了，不能在这里写
      //defineProperty只能劫持已经存在的
      //遍历data

      if (Array.isArray(data)) {
        //判断是数组还是对象
        data.__proto__ = newArrayProto; //重写数组的部分（7个）方法,保留数组原有的方法

        this.observeArray(data);
      } else {
        this.walk(data);
      }
    }

    _createClass(Observe, [{
      key: "walk",
      value: function walk(data) {
        //重新定义，性能差
        Object.keys(data).forEach(function (key) {
          defineReactive(data, key, data[key]); //属性劫持
        });
      }
    }, {
      key: "observeArray",
      value: function observeArray(data) {
        data.forEach(function (item) {
          observe$1(item); //数组遍历劫持
        });
      }
    }]);

    return Observe;
  }();

  function dependArray(value) {
    for (var i = 0; i < value.length; i++) {
      var current = value[i];
      current.__ob__ && current.__ob__.dep.depend();

      if (Array.isArray(current)) {
        dependArray(current);
      }
    }
  }

  function defineReactive(target, key, value) {
    //闭包
    var childOb = observe$1(value); //值是对象，再次进行属性劫持

    var dep = new Dep(); //对应的dep，每个属性都有dep

    Object.defineProperty(target, key, {
      get: function get() {
        //取值
        if (Dep.target) {
          dep.depend();

          if (childOb) {
            childOb.dep.depend(); //让对象和数组进行依赖收集

            if (Array.isArray(value)) {
              dependArray(value);
            }
          }
        }

        return value;
      },
      set: function set(newValue) {
        //设置值
        if (newValue === value) return;
        observe$1(value);
        value = newValue;
        dep.notify(); //通知更新
      }
    });
  }
  function observe$1(data) {
    //对对象进行数据劫持
    //判断是否是对象
    if (_typeof(data) != "object" || data == null) {
      return;
    }

    if (data.__ob__ instanceof Observe) {
      //说明对象被代理过
      return data.__ob__;
    }

    return new Observe(data);
  }

  var id = 0;

  var Watcher = /*#__PURE__*/function () {
    function Watcher(vm, exprOrFn, options, cb) {
      _classCallCheck(this, Watcher);

      //console.log([...arguments][2])
      this.vm = vm;
      this.id = id++;
      this.renderWatcher = options; //渲染watcher
      //console.log(typeof exprOrFn)

      if (typeof exprOrFn === "string") {
        this.getter = function () {
          //console.log(vm[exprOrFn])
          return vm[exprOrFn];
        }; //this.run()

      } else {
        this.getter = exprOrFn;
      } // console.log(exprOrFn, options)


      this.cb = cb;
      this.deps = [];
      this.depsID = new Set();
      this.lazy = options.lazy;
      this.dirty = this.lazy;
      this.user = options.user;
      this.value = this.lazy ? undefined : this.get(); // if (this.value) {
      //     this.run()
      // }
      // console.log(options.update)

      if (options) {
        this.run();
      } //console.log(options.update)

    }

    _createClass(Watcher, [{
      key: "get",
      value: function get() {
        //Dep.target = this//只有一份
        //console.log(this.user, "123456")
        pushTarget(this);
        var value = this.getter.call(this.vm); //去vm取值
        // Dep.target = null

        popTarget();
        return value;
      }
    }, {
      key: "evaluate",
      value: function evaluate() {
        //计算属性
        this.value = this.get();
        this.dirty = false;
      }
    }, {
      key: "addDep",
      value: function addDep(dep) {
        var id = dep.id;

        if (!this.depsID.has(id)) {
          this.deps.push(dep);
          this.depsID.add(id);
          dep.addSub(this);
        }
      }
    }, {
      key: "update",
      value: function update() {
        //console.log(this.user, "123456")
        if (this.lazy) {
          this.dirty = true;
        } else {
          //this.get()//从新渲染
          //console.log(this.user, "123456")
          queueWatcher(this); //把当前watcher暂存,然后全部更新
        }
      }
    }, {
      key: "depend",
      value: function depend() {
        var i = this.deps.length;

        while (i--) {
          this.deps[i].depend();
        }
      }
    }, {
      key: "run",
      value: function run() {
        console.log(this);
        var oldVal = this.value;
        var newVal = this.get();

        if (this.user) {
          //console.log(this.cb)
          this.cb.call(this.vm, newVal, oldVal);
        }
      }
    }]);

    return Watcher;
  }();

  var queue = [];
  var has = {};
  var pending = false;

  function flushSchedulerQueue() {
    var flushQueue = queue.slice(0);
    queue = [];
    has = {};
    pending = false;
    flushQueue.forEach(function (item) {
      return item.run();
    });
  }

  function queueWatcher(watcher) {
    //console.log(watcher)
    //const id = watcher.id
    if (!has[id]) {
      queue.push(watcher);
      has[id] = true;

      if (!pending) {
        setTimeout(flushSchedulerQueue, 0);
        pending = true;
      }
    }
  }

  var callback = [];
  var waiting = false;

  function flushCallbacks() {
    var cbs = callback.slice(0);
    waiting = true;
    callback = [];
    cbs.forEach(function (cb) {
      return cb();
    });
  } //nextTick没有使用api，而是采用降级的方式


  var timeFunc;

  if (Promise) {
    timeFunc = function timeFunc() {
      Promise.resolve().then(flushCallbacks());
    };
  } else if (MutationObserver) {
    var observe = new MutationObserver(flushCallbacks);
    var textNode = document.createTextNode(1);
    observe.observe(textNode, {
      characterData: true
    });

    timeFunc = function timeFunc() {
      textNode.textContent = 2;
    };
  } else if (setImmediate) {
    timeFunc = function timeFunc() {
      setImmediate(flushCallbacks);
    };
  } else {
    setTimeout(flushCallbacks);
  }

  function nextTick(cb) {
    //不是创建一个异步任务
    callback.push(cb);

    if (!waiting) {
      timeFunc();
      waiting = false;
    }
  }

  function initState(vm) {
    var opts = vm.$options;

    if (opts.data) {
      initData(vm);
    }

    if (opts.computed) {
      initComputed(vm);
    }

    if (opts.watch) {
      initWatch(vm);
    }
  }

  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(newValue) {
        vm[target][key] = newValue;
      }
    });
  }

  function initData(vm) {
    var data = vm.$options.data; //用户数据,data可能是函数，或对象

    data = typeof data === "function" ? data.call(vm) : data; //console.log(data)

    vm._data = data; //返回对象到_data

    observe$1(data); //defineProperty劫持
    //将vm._data用vm代理

    for (var key in data) {
      proxy(vm, "_data", key);
    }
  }

  function initComputed(vm) {
    var computed = vm.$options.computed;
    var watchers = vm._computedWatchers = {};

    for (var key in computed) {
      var userDef = computed[key];
      var fn = typeof userDef === "function" ? userDef : userDef.get;
      watchers[key] = new Watcher(vm, fn, {
        lazy: true
      });
      defineComputed(vm, key, userDef);
    }
  }

  function defineComputed(target, key, userDef) {
    typeof userDef === "function" ? userDef : userDef.get;

    var setter = userDef.set || function () {};

    Object.defineProperty(target, key, {
      get: createComputedGetter(key),
      set: setter
    });
  }

  function createComputedGetter(key) {
    return function () {
      var watcher = this._computedWatchers[key];

      if (watcher.dirty) {
        watcher.evaluate();
      }

      if (Dep.target) {
        watcher.depend();
      }

      return watcher.value;
    };
  }

  function initWatch(vm) {
    var watch = vm.$options.watch;

    for (var key in watch) {
      var handler = watch[key];

      if (Array.isArray(handler)) {
        for (var i = 0; i < handler.length; i++) {
          createWatcher(vm, key, handler[i]);
        }
      } else {
        createWatcher(vm, key, handler);
      }
    }
  }

  function createWatcher(vm, key, handler) {
    //console.log(key, handler)
    if (typeof handler === "string") {
      handler = vm[handler];
    }

    return vm.$watch(key, handler);
  }

  function initStateMixin(Vue) {
    Vue.prototype.$nextTick = nextTick;

    Vue.prototype.$watch = function (exprOrFn, cb) {
      //console.log(exprOrFn, cb)
      new Watcher(this, exprOrFn, {
        user: true
      }, cb);
    };
  }

  //_h,_c
  function createElementVNode(vm, tag, data) {
    if (data == null) {
      data = {};
    }

    var key = data.key;

    if (key) {
      delete data.key;
    }

    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }

    return vNode(vm, tag, key, data, children);
  } //_v

  function createTextVNode(vm, text) {
    return vNode(vm, undefined, undefined, undefined, undefined, text);
  }

  function vNode(vm, tag, key, data, children, text) {
    return {
      vm: vm,
      tag: tag,
      key: key,
      data: data,
      children: children,
      text: text
    };
  }

  function isSameVNode(oldNode, newNode) {
    return oldNode.tag === newNode.key && oldNode.key === newNode.key;
  }

  function patchProps(el) {
    var oldProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var props = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var oldStyle = oldProps.style;
    var newStyle = props.style;

    for (var key in oldStyle) {
      if (!newStyle[key]) {
        el.style[key] = "";
      }
    }

    for (var _key in oldProps) {
      if (!props[_key]) {
        el.removeAttribute(_key);
      }
    }

    for (var _key2 in props) {
      if (_key2 === "style") {
        for (var styleName in props.style) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(_key2, props[_key2]);
      }
    }
  }
  function createElm(vNode) {
    //创建dom
    var tag = vNode.tag,
        data = vNode.data,
        children = vNode.children,
        text = vNode.text;

    if (typeof tag === "string") {
      vNode.el = document.createElement(tag);
      patchProps(vNode.el, {}, data);
      children.forEach(function (item) {
        vNode.el.appendChild(createElm(item));
      });
    } else {
      vNode.el = document.createTextNode(text);
    }

    return vNode.el;
  }
  function patch(oldVNode, vNode) {
    var isRealElement = oldVNode.nodeType;

    if (isRealElement) {
      //渲染dom
      var elm = oldVNode; //获取真实dom

      var parentElm = elm.parentNode; //父元素

      var newElm = createElm(vNode);
      parentElm.insertBefore(newElm, elm.nextSibling);
      parentElm.removeChild(elm); //删除老节点

      return newElm;
    } else {
      //diff算法
      //同级比较，判断key
      patchVNode(oldVNode, vNode);
    }
  }

  function patchVNode(oldVNode, vNode) {
    if (isSameVNode(oldVNode, vNode)) {
      //父节点判断
      var _el = createElm(vNode);

      oldVNode.el.parentNode.removeChild(_el, oldVNode.el);
      return _el;
    }

    var el = vNode.el = oldVNode.el; //复用父节点

    if (!oldVNode.tag) {
      //判断文本
      if (oldVNode.text !== vNode.text) {
        el.textContent = vNode.text;
      }
    }

    patchProps(el, oldVNode.data, vNode.data); //判断标签
    //比较儿子

    var oldChildren = oldVNode.children || [];
    var newChildren = vNode.children || [];

    if (oldChildren > 0 && newChildren > 0) {
      //都有儿子
      updateChildren(el, oldChildren, newChildren);
    } else if (newChildren > 0) {
      //只有新儿子
      mountChildren(el, newChildren);
    } else if (oldChildren > 0) {
      //只有老儿子
      unmountChildren(el);
    }

    return el;
  }

  function updateChildren(el, oldChildren, newChildren) {
    var oldStartIndex = 0;
    var newStartIndex = 0;
    var oldEndIndex = oldChildren.length - 1;
    var newEndIndex = newChildren.length - 1;
    var oldStartVNode = oldChildren[0];
    var newStartVNode = newChildren[0];
    var oldEndVNode = oldChildren[oldEndIndex];
    var newEndVNode = newChildren[newEndIndex];

    function makeIndexByKey(children) {
      var map = {};
      children.forEach(function (child, index) {
        map[child.key] = index;
      });
      return map;
    }

    var map = makeIndexByKey(oldChildren);

    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
      if (!oldStartVNode) {
        oldStartVNode = oldChildren[++oldStartIndex];
      } else if (!oldEndVNode) {
        oldEndVNode = oldChildren[--oldEndIndex];
      } else if (isSameVNode(oldStartVNode, newStartVNode)) {
        patchVNode(oldStartVNode, newStartVNode);
        oldStartVNode = oldChildren[++oldStartIndex];
        newStartVNode = newChildren[++newStartIndex];
      } else if (isSameVNode(oldEndVNode, newEndVNode)) {
        patchVNode(oldEndVNode, newEndVNode);
        oldEndVNode = oldChildren[--oldEndIndex];
        newEndVNode = newChildren[--newEndIndex];
      } else if (isSameVNode(oldEndVNode, newStartVNode)) {
        patchVNode(oldEndVNode, newStartVNode);
        el.insertBefore(oldEndVNode.el, oldStartVNode.el);
        oldEndVNode = oldChildren[--oldEndIndex];
        newStartVNode = newChildren[++newStartIndex];
      } else if (isSameVNode(oldStartVNode, newEndVNode)) {
        patchVNode(oldStartVNode, newEndVNode);
        el.insertBefore(oldStartVNode.el, oldEndVNode.el.nextSibling);
        oldStartVNode = oldChildren[++oldStartIndex];
        newEndVNode = newChildren[--newEndIndex];
      } else {
        var moveIndex = map[newStartVNode.key];

        if (moveIndex != undefined) {
          var moveVNode = oldChildren[moveIndex];
          el.insertBefore(moveVNode.el, oldStartVNode.el);
          oldChildren[moveIndex] = undefined;
          patchVNode(moveVNode, newStartVNode);
        } else {
          el.insertBefore(createElm(newStartVNode), oldStartVNode.el);
        }

        newStartVNode = newChildren[++newStartIndex];
      }
    }

    if (newStartIndex <= newEndIndex) {
      //新的多余
      for (var i = newStartIndex; i <= newEndIndex; i++) {
        var child = createElm(newChildren[i]); //el.appendChild(child)

        var anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null;
        el.insertBefore(child, anchor);
      }
    }

    if (oldStartIndex <= oldEndIndex) {
      //老的多余
      for (var _i = oldStartIndex; _i <= oldEndIndex; _i++) {
        if (oldChildren[_i]) {
          var _child = oldChildren[_i].el;
          el.removeChild(_child);
        }
      }
    }
  }

  function mountChildren(el, newChildren) {
    for (var i = 0; i < newChildren.length; i++) {
      var child = newChildren[i];
      el.appendChild(createElm(child));
    }
  }

  function unmountChildren(el, newChildren) {
    el.innerHTML = "";
  }

  function initLifeCycle(Vue) {
    Vue.prototype._update = function (vNode) {
      //有初始化和更新的功能
      var vm = this;
      var el = vm.$el;
      vm.$el = patch(el, vNode);
    };

    Vue.prototype._c = function () {
      return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    Vue.prototype._v = function () {
      return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    Vue.prototype._s = function (value) {
      if (_typeof(value) !== "object") return value;
      return JSON.stringify(value);
    };

    Vue.prototype._render = function () {
      //const vm = this
      //渲染时，会从实例取值
      return this.$options.render.call(this);
    };
  }
  function mountComponent(vm, el) {
    vm.$el = el; //调用render方法产生虚拟节点
    // new Watcher(vm, () => {
    //     vm._update(vm._render())
    // })

    var updateComponent = function updateComponent() {
      vm._update(vm._render());
    };

    new Watcher(vm, updateComponent, true); //根据虚拟dom产生真实dom
    //插入el中
  }

  function initMixin(Vue) {
    //給Vue增加init方法
    Vue.prototype._init = function (options) {
      //options用户选项
      var vm = this;
      vm.$options = options; //Vue自己的属性

      initState(vm); //初始化状态

      if (options.el) {
        vm.$mount(options.el); //数据挂载
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = document.querySelector(el);
      var ops = vm.$options;

      if (!ops.render) {
        //查找是否有render函数
        var template; //是否有内外两部分的template

        if (!ops.template && el) {
          //没有模版，但有el
          template = el.outerHTML;
        } else {
          if (el) {
            template = ops.template; //如果有el，采用模版内容
          }
        }

        if (template) {
          //是否有template，有就用
          var render = compileToFunction(template);
          ops.render = render;
        }
      }

      mountComponent(vm, el); //组件挂载
    };
  }

  function Vue(options) {
    //options用户选项
    this._init(options);
  }

  initMixin(Vue); //扩展init方法

  initLifeCycle(Vue); //模版渲染

  initStateMixin(Vue); //nextTick，Watch
  //------------------------------

  var r1 = compileToFunction("  <ul>\n<li key=\"a\">a</li>\n<li key=\"b\">b</li>\n<li key=\"c\">c</li>\n<li key=\"d\">d</li>\n<li key=\"e\">e</li>\n</ul>");
  var r2 = compileToFunction("  <ul>\n<li key=\"c\">c</li>\n<li key=\"a\">a</li>\n<li key=\"p\">p</li>\n<li key=\"d\">d</li>\n<li key=\"e\">e</li>\n<li key=\"i\">i</li>\n</ul>");
  var v1 = new Vue({
    data: {
      name: "1"
    }
  });
  var p1 = r1.call(v1);
  var e1 = createElm(p1);
  document.body.appendChild(e1);
  var v2 = new Vue({
    data: {
      name: "2"
    }
  });
  var p2 = r2.call(v2);
  setTimeout(function () {
    var e2 = createElm(p2);
    e1.parentNode.replaceChild(e2, e1);
  }, 5000);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
