npdep
----

Automatic import NPM's main file to HTML

HTML 自动引入 NPM main 文件

## example

index.html

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf8">
  <title>npdep example</title>
  <!--npdep depend="jquery,iscroll,jhtmls"-->
  <!--/npdep-->
</head>
<body>
</body>
</html>
```

`$ npdep`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf8">
  <title>npdep example</title>
  <!--npdep depend="jquery,iscroll,jhtmls"-->
  <script src="node_modules/jquery/dist/jquery.js"></script>
  <script src="node_modules/iscroll/build/iscroll.js"></script>
  <script src="node_modules/jhtmls/jhtmls.js"></script>
  <!--/npdep-->
</head>
<body>
</body>
</html>
```