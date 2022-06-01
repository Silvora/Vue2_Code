<!-- @format -->

### 配置详情

- npm 包

  ```js
      "@babel/core": "转换语法",
      "@babel/preset-env": "根据指定的执行环境提供语法装换",
      "rollup": "轻量级webpack打包工具",
      "rollup-plugin-babel": "rollup转义语法插件"
  ```

- rollup.config.js 配置

  ```js
  import babel from "rollup-plugin-babel";
  export default {
  	input: "./src/index.js",
  	output: {
  		file: "./dist/vue.js",
  		name: "Vue", //global.Vue
  		format: "umd",
  		sourcemap: true,
  	},
  	plugins: {
  		babel: {
  			exclude: "node_modules/**",
  		},
  	},
  };
  ```

- .babelrc 配置

  ```js
  { "presets": [ "@babel/preset-evt" ] }
  ```

- 运行配置
  ```js
  "scripts": {
  "dev": "rollup -c",
  },
  ```

### 数据初始化

```js
//index.js
import { initMixin } from "./init";

function Vue(options) {
	//options用户选项
	this._init(options);
}

initMixin(Vue); //扩展init方法

export default Vue;
```

```js
//init.js
import { initState } from "./state";

export function initMixin(Vue) {
	//給Vue增加init方法
	Vue.prototype._init = function (options) {
		//options用户选项
		const vm = this;
		vm.$option = options; //Vue自己的属性

		initState(vm); //初始化状态
	};
}
```

### 对象的数据劫持

```js
export function initState(vm) {
	const opts = vm.$option;
	if (opts.data) {
		//判断用户传入data的数据
		initData(vm);
	}
}
function proxy(vm, target, key) {
	Object.defineProperty(vm, key, {
		get() {
			return vm[target][key];
		},
		set(newValue) {
			vm[target][key] = newValue;
		},
	});
}
```

```js
function initData(vm) {
	let data = vm.$option.data; //用户数据,data 可能是函数，或对象
	data = typeof data === "function" ? data.call(vm) : data;

	vm._data = data; //返回对象到_data，把数据挂载到实例上

	observe(data); //使用defineProperty劫持

	//将vm._data用vm代理
	for (let key in data) {
		proxy(vm, "_data", key); ///給每一项属性进行数据劫持
	}
}
```

```js
import { newArrayProto } from "./array";

class Observe {
	constructor(data) {
		Object.defineProperty(data, "__ob__", {
			//设置不可枚举的__ob__,不然会爆站,也是为了数组能够拿到当前实例
			value: this,
			enumerable: false,
		});

		//data.__ob__ = this//給数据加了一个标识，如果数据上有__ob__,就代表劫持过了，不能在这里写,必须设置不可枚举属性
		//defineProperty只能劫持已经存在的
		//判断是数组还是对象，遍历data
		if (Array.isArray(data)) {
			data.__proto__ = newArrayProto; //重写数组的部分（7个）方法,保留数组原有的方法

			this.observeArray(data);
		} else {
			this.walk(data);
		}
	}
	walk(data) {
		//重新定义，性能差
		Object.keys(data).forEach((key) => {
			defineReactive(data, key, data[key]); //属性劫持
		});
	}
	observeArray(data) {
		data.forEach((item) => {
			observe(item); //数组遍历劫持
		});
	}
}

export function defineReactive(target, key, value) {
	//闭包
	observe(value); //值是对象，再次进行属性劫持
	Object.defineProperty(target, key, {
		get() {
			//取值
			return value;
		},
		set(newValue) {
			//设置值
			if (newValue === value) return;
			observe(value);
			value = newValue;
		},
	});
}

export function observe(data) {
	//对对象进行数据劫持
	//判断是否是对象
	if (typeof data != "object" || data == null) {
		return;
	}
	if (data.__ob__ instanceof Observe) {
		//給劫持过的数据加上__ob__属性，如果有说明对象被代理过
		return data.__ob__;
	}

	return new Observe(data);
}
```

- 重写数组方法

```js
//重新数组的部分方法
let oldArrayProto = Array.prototype;

//newArrayProto.__proto__ = oldArrayProto,不用担心原数组方法被重写
let newArrayProto = Object.create(oldArrayProto);

let methods = [
	//快速找到重写方法
	"push",
	"pop",
	"shift",
	"unshift",
	"reverse",
	"sort",
	"splice",
];

methods.forEach((method) => {
	newArrayProto[method] = function (...args) {
		//重写数组方法
		//this 指向 arr
		const result = oldArrayProto[method].call(this, ...args); //内部调原来方法，

		//对新增的属性进行劫持，拿到observeArray
		let inserted;
		let ob = this.__ob__; //获取当前的实例
		// if (method === "push" || method === "unshift") {
		//     inserted = args
		// }
		// if (method === "splice") {
		//     inserted = args.slice(2)
		// }

		switch (
			method //获取新加的属性
		) {
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
			//对新增的数据进行数据劫持
			ob.observe(inserted);
		}

		return result;
	};
});

export { newArrayProto };
```
