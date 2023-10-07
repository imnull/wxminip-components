# WXMC CLI

```bash
npm install @imnull/wxmc
```

# CLI Commands

```sh
% wxmc
Usage: wxmc [options] [command]

Options:
  -h, --help                                    display help for command

Commands:
  list                                          列出所有可用组件
  install <component-name> [sub-package]        安装组件到本地小程序项目
  use <component-name> <page-route> [tag-name]  在当前项目中植入组件
  remove <tag-name> <page-route>                在当前项目页面中移除tag对应组件
  scan                                          扫描当前项目组件使用情况
  ref                                           扫描当前项目已安装组件引用情况
  help [command]                                display help for command
```

## wxmc list

Show all valid components

```sh
% wxmc list

 - c-checkbox
 - c-page-body
 - c-page-head

```

## wxmc install

Install a c-component into current miniprogram project.

And, you should be in the project root dir to operate it.

```sh
% wxmc install c-checkbox

组件'c-checkbox'安装成功！
 - wxmc-components/c-checkbox/check-circle.svg
 - wxmc-components/c-checkbox/check-fill-bold.svg
 - wxmc-components/c-checkbox/check-fill-thin.svg
 - wxmc-components/c-checkbox/check-fill.svg
 - wxmc-components/c-checkbox/check-on.svg
 - wxmc-components/c-checkbox/check.svg
 - wxmc-components/c-checkbox/check2.svg
 - wxmc-components/c-checkbox/index.json
 - wxmc-components/c-checkbox/index.scss
 - wxmc-components/c-checkbox/index.ts
 - wxmc-components/c-checkbox/index.wxml

```

To install to a sub-package, use the second argument.

```sh
% wxmc install c-checkbox packageA

组件'c-checkbox'安装成功！
 - packageA/wxmc-components/c-checkbox/check-circle.svg
 - packageA/wxmc-components/c-checkbox/check-fill-bold.svg
 - packageA/wxmc-components/c-checkbox/check-fill-thin.svg
 - packageA/wxmc-components/c-checkbox/check-fill.svg
 - packageA/wxmc-components/c-checkbox/check-on.svg
 - packageA/wxmc-components/c-checkbox/check.svg
 - packageA/wxmc-components/c-checkbox/check2.svg
 - packageA/wxmc-components/c-checkbox/index.json
 - packageA/wxmc-components/c-checkbox/index.scss
 - packageA/wxmc-components/c-checkbox/index.ts
 - packageA/wxmc-components/c-checkbox/index.wxml

```

## wxmc use

Plug a component into a page-route. If not install yet, it will install it.

```sh
% wxmc use c-page-head pages/index/index

组件'c-page-head'安装成功！
 - wxmc-components/c-page-head/back-home.svg
 - wxmc-components/c-page-head/back.svg
 - wxmc-components/c-page-head/index.json
 - wxmc-components/c-page-head/index.scss
 - wxmc-components/c-page-head/index.ts
 - wxmc-components/c-page-head/index.wxml

页面'pages/index/index'植入组件'c-page-head:<c-page-head>'成功。

```

## wxmc scan

Scan pages to find the c-component using.

```sh
% wxmc scan                             

 > pages/index/index 
  | (0) c-page-head <c-page-head>
  | (0) c-page-body <c-page-body>

```

The code `(0) c-page-head <c-page-head>` means the component `c-page-head` is using as tag `<c-page-head>`, and be used `0` times.

## wxmc ref

Scan c-components to find the reffering.

```sh
% wxmc ref

[c-checkbox] /wxmc-components/c-checkbox/index (0)

[c-page-body] /wxmc-components/c-page-body/index (0)
   <c-page-body> pages/index/index (0)

[c-page-head] /wxmc-components/c-page-head/index (0)
   <c-page-head> pages/index/index (0)

```