// rollup.config.js
import terser from "@rollup/plugin-terser";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import peerDepsExternal from "rollup-plugin-peer-deps-external";

import pkg from "./package.json" assert { type: "json" };

export default [
  {
    input: `src/index.jsx`,
    output: [
      {
        file: pkg.main,
        format: "esm",
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve(),
      babel({
        exclude: "node_modules/**",
        presets: ["@babel/env", "@babel/preset-react"],
      }),
      commonjs(),
      terser(),
    ],
  },
];
