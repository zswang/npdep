/*<jdists encoding="ejs" data="../package.json">*/
/**
 * @file <%- name %>
 *
 * <%- description %>
 * @author
     <% (author instanceof Array ? author : [author]).forEach(function (item) { %>
 *   <%- item.name %> (<%- item.url %>)
     <% }); %>
 * @version <%- version %>
     <% var now = new Date() %>
 * @date <%- [
      now.getFullYear(),
      now.getMonth() + 101,
      now.getDate() + 100
    ].join('-').replace(/-1/g, '-') %>
 */
/*</jdists>*/

var fs = require('fs');
var path = require('path');
var colors = require('colors/safe');
var cbml = require('cbml');
var url = require('url');
var readInstalled = require('read-installed');
var deasync = require('deasync');
var readInstalledSync = deasync(function (path, options, callback) {
  readInstalled(path, options, callback);
});

/**
 * 编译 HTML 文件
 *
 * @param {string} filename 文件名或者是内容
 * @param {Object} argv 配置项
 */
function build(filename, argv) {
  filename = path.resolve('', filename || '');
  if (!fs.existsSync(filename)) {
    console.warn(
      colors.blue('File "%s" not exists.'), filename
    );
    return;
  }
  var dirname = path.dirname(filename);
  var root = readInstalledSync(dirname, {
    dev: false
  });
  while (!root.name && !(/^\.?$/.test(dirname))) {
    dirname = path.dirname(dirname);
    root = readInstalledSync(dirname, {
      dev: false
    });
  }
  var content = String(fs.readFileSync(filename));
  if (!root.name) {
    return content;
  }

  var tokens = cbml.parse(content);
  function buildBlock(node) {
    if (!node) {
      return '';
    }
    if (node.type === 'text') { // 文本节点直接返回
      return node.value;
    }
    var value = '';
    if (node.type === 'block' && node.tag === 'npdep') {
      var space = (node.content.match(/^([^\S\n]+)/m) || [0, ''])[1];
      var result = node.prefix;
      var files;
      if (node.attrs.file === '*') {
        files = Object.keys(root.dependencies);
      } else {
        files = String(node.attrs.file || '').split(/\s*,\s*/);
      }
      files.forEach(function (name) {
        var packageInfo = root.dependencies[name];
        if (!packageInfo) {
          return;
        }
        var filename = url.format(
          path.relative(
            root.realPath, path.join(packageInfo.realPath, packageInfo.main)
          )
        );
        result += '\n' + space + '<script src="' + filename + '"></script>';
      });
      return result + '\n' + space + node.suffix;
    }

    if (!node.nodes) {
      value = '';
    }
    else {
      node.nodes.forEach(function (item) {
        var text = buildBlock(item);
        value += text;
      });
    }
    return value;
  }

  return buildBlock(tokens);
}

exports.build = build;