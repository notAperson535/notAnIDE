import { nodeResolve } from "@rollup/plugin-node-resolve"
export default {
    input: "./editor.mjs",
    output: {
        file: "./editor.bundle.js",
        format: "iife",
        name: "bundle",
        inlineDynamicImports: true
    },
    plugins: [nodeResolve()]
}