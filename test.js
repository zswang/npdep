var readInstalled = require('read-installed');
var deasync = require('deasync');
var url = require('url');
var path = require('path');
var fs = require('fs');
var cbml = require('cbml');

var readInstalledSync = deasync(function(path, options, callback) {
  readInstalled(path, options, callback);
});
var root = readInstalledSync('./example', {
  dev: false
});

var tokens = cbml.parse(fs.readFileSync('./example/index.html'));

function build(node) {
  if (!node) {
    return '';
  }
  if (node.type === 'text') { // 文本节点直接返回
    return node.value;
  }
  var value = node.value;
  if (node.type === 'block' && node.tag === 'npdep') {
    var space = (node.content.match(/^([^\S\n]+)/m) || [0, ''])[1];
    var result = node.prefix;
    String(node.attrs.depend || '').split(/\s*,\s*/).forEach(function (name) {
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
  } else {
    node.nodes.forEach(function(item) {
      var text = build(item);
      value += text;
    });
  }
  return value;
}

console.log(build(tokens));

// var depend = 'read-installed,deasync';
// depend = depend.split(/,/);
// var files = {};

// function scan(packageInfo) {
//   if (!packageInfo) {
//     return;
//   }
//   if (!packageInfo.main) {
//     return;
//   }
//   var filename = url.format(
//     path.relative(
//       root.realPath, path.join(packageInfo.realPath, packageInfo.main)
//     )
//   );
//   Object.keys(packageInfo.dependencies).forEach(function(key) {
//     scan(packageInfo.dependencies[key]);
//   });
//   files[filename] = (files[filename] || 0) + 1;
// }
// depend.forEach(function(item) {
//   scan(root.dependencies[item]);
// });

// console.log(files)