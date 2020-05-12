# 修复umi-plugin-antd-theme 插件 umi api找不到问题，让其在umi@2.4.4版本中正常工作

<!-- @format -->

# umi-plugin-antd-theme的fork版本

[![NPM version](https://img.shields.io/npm/v/umi-plugin-antd-theme.svg?style=flat)](https://npmjs.org/package/umi-plugin-antd-theme) [![NPM downloads](http://img.shields.io/npm/dm/umi-plugin-antd-theme.svg?style=flat)](https://npmjs.org/package/umi-plugin-antd-theme)

## Usage

## 1.优先读取`config/theme.config.js`配置
`config/theme.config.js`方式可以动态加载模块，方便一些动态处理

Configure in `config/theme.config.js`,

```js
const fs = require('fs');
const Path = require('path');
const NativeModule = require('module');
const vm = require('vm');

const getModuleFromString = (bundle, filename) => {
  const m = { exports: {} };
  const wrapper = NativeModule.wrap(bundle);
  const script = new vm.Script(wrapper, {
    filename,
    displayErrors: true,
  });
  const result = script.runInThisContext(); 
  result.call(m.exports, m.exports, require, m); 
  return m;
};

module.exports = function genThemeConfig() {
  const darkString = fs.readFileSync(
    Path.join(process.cwd(), './src/themes/dark/index.js'),
    'utf-8'
  ); 

  const dark = getModuleFromString(darkString, 'dark.js');

  return {
    theme: [
      // { key: '官方暗黑', fileName: 'dark.css', theme: 'dark', className: 'theme-dark' },
      {
        key: '暗黑主题',
        fileName: 'custom-dark.css',
        className: 'theme-custom-dark',
        modifyVars: dark.exports,
      },
    ],
    // 是否压缩css
    min: true,
    // css module
    isModule: true,
    // 忽略 antd 的依赖
    ignoreAntd: false,
    // 忽略 pro-layout
    ignoreProLayout: false,
    // 不使用缓存
    cache: true,
  };
};
```
## 2.没有第一步的配置就读取`plugin option`，参数如下，最后读取`config/theme.config.json`
`plugin option`的配置会被缓存，无法热更新，所以不推荐，推荐`config/theme.config.js`和`config/theme.config.json`方式
`config/theme.config.json`方式就是静态文件，需要转换文件格式，有点麻烦

Configure in `plugin option or config/theme.config.json`,

```json
{
  "theme": [
    {
      "theme": "dark",
      "fileName": "dark.css"
    },
    {
      "fileName": "mingQing.css",
      "modifyVars": {
        "@primary-color": "#13C2C2"
      }
    }
  ],
  // 是否压缩css
  "min": true,
  // css module
  "isModule": true,
  // 忽略 antd 的依赖
  "ignoreAntd": false,
  // 忽略 pro-layout
  "ignoreProLayout": false,
  // 不使用缓存
  "cache": true
}
```

you can get config in `window.umi_plugin_ant_themeVar`

## LICENSE

MIT
