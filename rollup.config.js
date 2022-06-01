import babel from "rollup-plugin-babel"
import resolve from "@rollup/plugin-node-resolve"

export default {
    input: "./src/index.js",
    output: {
        file: "./dist/vue.js",
        name: "Vue",//global.Vue
        format: "umd",
        sourcemap: true,
    },
    plugins: [
        resolve(),
        babel({
            exclude: "node_modules/**",
        }),
        //
    ]
}