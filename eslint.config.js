import globals from "globals";
import tsEslintParser from "@typescript-eslint/parser";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import pluginReact from "eslint-plugin-react";
import reactRefresh from "eslint-plugin-react-refresh";
import hooksPlugin from "eslint-plugin-react-hooks";
import eslintPluginPrettier from "eslint-plugin-prettier";

export default [
  {
    // 指定适用于哪些文件
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      // 使用 TypeScript 解析器
      parser: tsEslintParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // 开启 JSX 语法支持
          tsx: true,
        },
      },
      // 定义全局变量，适配浏览器环境
      globals: {
        ...globals.browser,
      },
      sourceType: "module", // 使用模块化方式，支持 ES6 模块导入/导出
    },
    plugins: {
      // 启用 React 插件
      react: pluginReact,
      // 启用 React Hooks 插件
      "react-hooks": hooksPlugin,
      // 启用 React Refresh 插件（用于热更新）
      "react-refresh": reactRefresh,
      // 启用 TypeScript ESLint 插件
      "@typescript-eslint": typescriptEslint,
    },
    rules: {
      // React 规则
      "react/jsx-indent": [1, 2], // 强制 JSX 标签使用 2 个空格缩进

      // React Hooks 规则：确保正确使用 Hooks（遵循推荐规则）
      ...hooksPlugin.configs.recommended.rules,

      // React Refresh 规则：建议仅导出 React 组件以支持热更新
      "react-refresh/only-export-components": "warn",

      // 通用规则
      "arrow-body-style": ["error", "as-needed"], // 推荐使用简化版箭头函数，例如直接返回值，不使用 `{}` 包裹
      "prefer-arrow-callback": "error", // 强制使用箭头函数作为回调函数，避免使用 `function()` 语法
      "@typescript-eslint/no-explicit-any": "warn", // 警告使用 `any` 类型，但不强制报错，鼓励使用更明确的类型
      "no-magic-numbers": "warn", // 警告硬编码的魔法数字（例如：`const x = 3`），建议使用常量代替
    },
  },
];
