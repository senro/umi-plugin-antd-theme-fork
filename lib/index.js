'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = _default;

var _path = require('path');
var _fse = require('fse');

var _serveStatic = _interopRequireDefault(require('serve-static'));

var _rimraf = _interopRequireDefault(require('rimraf'));

var _fs = require('fs');

var _defaultTheme = _interopRequireDefault(require('./defaultTheme'));

var themeConfigJs = require(_path.join(process.cwd(), 'config/theme.config'));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly)
      symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    keys.push.apply(keys, symbols);
  }
  return keys;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    if (i % 2) {
      ownKeys(Object(source), true).forEach(function(key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }
  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

var buildCss = require('antd-pro-merge-less');

var winPath = require('slash2');

function _default(api) {
  api.modifyDefaultConfig(function(config) {
    config.cssLoaderOptions = {
      modules: true,
      getLocalIdent: function getLocalIdent(context, _, localName) {
        if (
          context.resourcePath.includes('node_modules') ||
          context.resourcePath.includes('ant.design.pro.less') ||
          context.resourcePath.includes('global.less')
        ) {
          return localName;
        }

        var match = context.resourcePath.match(/src(.*)/);

        if (match && match[1]) {
          var antdProPath = match[1].replace('.less', '');
          var arr = winPath(antdProPath)
            .split('/')
            .map(function(a) {
              return a.replace(/([A-Z])/g, '-$1');
            })
            .map(function(a) {
              return a.toLowerCase();
            });
          return 'antd-pro'
            .concat(arr.join('-'), '-')
            .concat(localName)
            .replace(/--/g, '-');
        }

        return localName;
      },
    };
    return config;
  }); // 给一个默认的配置

  var options = _defaultTheme.default; // 从固定的路径去读取配置，而不是从 config 中读取
  var fsOps = {
    encoding: 'utf8',
  };
  var themeConfigPath = winPath((0, _path.join)(api.paths.cwd, 'config/theme.config.json'));

  var configPluginOptions = null;
  api.config.plugins.forEach(plugin => {
    if (plugin[0] === 'umi-plugin-antd-theme-fork') {
      configPluginOptions = plugin[1];
    }
  });

  var themeConfig = themeConfigJs();
  //console.log(themeConfig);

  if (themeConfig) {
    options = themeConfig;
  } else if (configPluginOptions) {
    options = configPluginOptions;
  } else if ((0, _fs.existsSync)(themeConfigPath)) {
    options = require(themeConfigPath);
  }

  var _api$paths = api.paths,
    cwd = _api$paths.cwd,
    absOutputPath = _api$paths.absOutputPath,
    absNodeModulesPath = _api$paths.absNodeModulesPath;
  var outputPath = absOutputPath;
  var themeTemp = winPath((0, _path.join)(absOutputPath, '')); // 增加中间件

  console.log('themeTemp:', themeTemp);

  api.addMiddlewareAhead(function() {
    return (0, _serveStatic.default)(themeTemp);
  }); // 增加一个对象，用于 layout 的配合

  api.addHTMLHeadScript(function() {
    return [
      {
        content: 'window.umi_plugin_ant_themeVar = '.concat(JSON.stringify(options.theme)),
      },
    ];
  });

  // var preOptionsPath = winPath(
  //   (0, _path.join)(absNodeModulesPath, '.plugin-theme/preOptions.json')
  // );
  //
  // console.log('preOptionsPath:', preOptionsPath);
  // //缓存当前配置文件
  // _fs.writeFileSync(preOptionsPath, JSON.stringify(options), fsOps);
  var themeOutputPath = _path.join(outputPath, 'theme');

  // 编译完成之后
  api.onBuildSuccess(function(_ref) {
    var err = _ref.err;

    if (err) {
      return;
    }

    console.log('💄  onBuildSuccess build theme');

    // if (_fs.existsSync(preOptionsPath)) {
    //   var preOptions = _fs.readFileSync(preOptionsPath);
    //
    //   //console.log('preOptions:',preOptions);
    //   if (preOptions === JSON.stringify(options)) {
    //     console.log('💄  build theme success ,use cache');
    //     return;
    //   } else {
    //     console.log('💄  options not equal preOptions');
    //   }
    // } else {
    //   console.log('💄  preOptions file not exist');
    // }

    try {
      if (_fs.existsSync(themeOutputPath)) {
        _fse.rmdirSync(themeOutputPath);
      }
      (0, _fse.mkdirSync)(themeOutputPath);
    } catch (error) {
      console.log(error);
    }

    buildCss(
      cwd,
      options.theme.map(
        function(theme) {
          return _objectSpread({}, theme, {
            fileName: winPath((0, _path.join)(outputPath, 'theme', theme.fileName)),
          });
        },
        _objectSpread(
          {
            min: true,
          },
          options
        )
      )
    )
      .then(function() {
        console.log('🎊  build theme success');
      })
      .catch(function(e) {
        console.log(e);
      });
  });

  // dev 之后
  api.onDevCompileDone(function() {
    console.log('cache in :' + themeTemp);
    console.log('💄  onDevCompileDone build theme'); // 建立相关的临时文件夹

    // if (_fs.existsSync(preOptionsPath)) {
    //   var preOptions = _fs.readFileSync(preOptionsPath);
    //
    //   //console.log('preOptions:',preOptions);
    //   if (preOptions === JSON.stringify(options)) {
    //     console.log('💄  build theme success ,use cache');
    //     return;
    //   } else {
    //     console.log('💄  options not equal preOptions');
    //   }
    // } else {
    //   console.log('💄  preOptions file not exist');
    // }

    try {
      if (_fs.existsSync(themeOutputPath)) {
        _fse.rmdirSync(themeOutputPath);
      }
      (0, _fse.mkdirSync)(themeOutputPath);
    } catch (error) {
      console.log(error);
    }

    themeConfig = themeConfigJs();
    if (themeConfig) {
      options = themeConfig;
    }

    //console.log(options.theme[0].modifyVars);

    buildCss(
      cwd,
      options.theme.map(function(theme) {
        return _objectSpread({}, theme, {
          fileName: winPath((0, _path.join)(themeTemp, 'theme', theme.fileName)),
        });
      }),
      _objectSpread(
        {
          min: true,
        },
        options
      )
    )
      .then(function() {
        console.log('🎊  build theme success');
      })
      .catch(function(e) {
        console.log(e);
      });
  });
}
