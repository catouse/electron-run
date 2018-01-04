# NodeJS CPP 模块编译和运行

## 1 安装和配置环境

### 1.1 安装 Swig

Swig 是一个将 C++ 模块编译（或转换）为其他语言平台的模块。例如将 C++ 模块转换成 PHP 模块，当然也支持将 C++ 模块编译为 NodeJS 模块。

从官方网址下载安装最新版（3.0.12） Swig http://www.swig.org/download.html。不同平台的安装方法参见文档。

安装完之后确保在命令行终端执行 `swig --version` 能正确显示 Swig 版本号。

### 1.2 安装 NodeJS

从 NodeJS 官方网站 https://nodejs.org/ 下载对应系统平台的安装包进行安装。安装完成之后确保在命令行执行 `node -v` 和 `npm -v` 能正确显示版本号。

npm 是包含在 NodeJS 中的包管理工具。

### 1.3 安装 node-gyp

[node-gyp](https://github.com/nodejs/node-gyp) 是最终将 C++ 模块编译为各个平台的 NodeJS 模块的工具，执行如下命令可以安装 node-gyp 工具：

```
npm install node-gyp -g
```

## 2 编写 C++ 模块

使用自己熟悉对工具和方式编写 C++ 模块，下面给出一个简单的例子（包括 `example.h` 和 `example.cpp` 两个文件）。

### `example.h`

```cpp
/* File : example.h */

class Shape {
public:
  Shape() {
    nshapes++;
  }
  virtual ~Shape() {
    nshapes--;
  }
  double  x, y;   
  void    move(double dx, double dy);
  virtual double area() = 0;
  virtual double perimeter() = 0;
  static  int nshapes;
};

class Circle : public Shape {
private:
  double radius;
public:
  Circle(double r) : radius(r) { }
  virtual double area();
  virtual double perimeter();
};

class Square : public Shape {
private:
  double width;
public:
  Square(double w) : width(w) { }
  virtual double area();
  virtual double perimeter();
};
```

### `example.cpp`

```cpp
/* File : example.cxx */

#include "example.h"
#define M_PI 3.14159265358979323846

/* Move the shape to a new location */
void Shape::move(double dx, double dy) {
  x += dx;
  y += dy;
}

int Shape::nshapes = 0;

double Circle::area() {
  return M_PI*radius*radius;
}

double Circle::perimeter() {
  return 2*M_PI*radius;
}

double Square::area() {
  return width*width;
}

double Square::perimeter() {
  return 4*width;
}
```

## 3 使用 Swig

### 3.1 编写 Wrap 接口文件

参考 Swig 官方文档（http://www.swig.org/Doc3.0/SWIGDocumentation.html#Introduction_nn5）编写 Swig 的接口文件（扩展名为 `.i`）。

以上节为例，接口文件编写为：

```cpp
/* File : example.i */
%module example

%{
#include "example.h"
%}

/* Let's just grab the original header file here */
%include "example.h"
```

### 3.2 使用 Swig 编译 Wrap 文件

在控制台执行 swig 命令，使用 Swig 接口文件将 C++ 模块编译为 NodeJS 中间模块。

```
$ swig -javascript -node -c++ example.i
```

## 4 使用 node-gyp 编译 NodeJS 模块

### 4.1 创建 node-gyp 配置文件

[node-gyp 配置文件](https://github.com/nodejs/node-gyp#the-bindinggyp-file) 文件名约定为 `binding.gyp`，文件内容格式为 JSON。该文件用于描述如何将 CPP 模块编译为 NodeJS 模块。

以上节例子为例，binding.gyp 文件内容如下：

```json
{
  "targets": [
    {
      "target_name": "example",
      "sources": [ "example.cxx", "example_wrap.cxx" ],
      "include_dirs": ["$srcdir"]
    }
  ]
}
```

### 4.2 编译 NodeJS 模块

编译 nodejs 模块之前首先需要调用 `node-gyp configure` 命令根据 `binding.gyp` 文件生成 makefile 及编译相关的资源 。

首次编译或者编译前 `binding.gyp` 文件发生更改时都应该重新执行此命令：

```
node-gyp configure
```

然后，可以通过node-gyp build命令进行编译：

```
node-gyp build
```

编译后完成后，就会得到一个二进制的Node.js插件（文件扩展名为 `.node`）。所生成的二进制文件位于 `./build/Release/` 目录。

以上两个命令可以使用一个命令实现：

```
node-gyp rebuild
```

### 4.3 编译 Electron 模块

[编译 Electron 模块](https://github.com/electron/electron/blob/master/docs/tutorial/using-native-node-modules.md) 与传统编译 C++ 模块略有不同。执行 node-gyp 命令时需要指定 Electron 版本号以及一些其他特殊参数。

下面的命令使用 node-gyp 将 C++ 模块编译为 Electron 1.2.8 所使用的 NodeJS 模块。

```
HOME=~/.electron-gyp node-gyp rebuild --target=1.2.8 --arch=x64 --dist-url=https://atom.io/download/electron
```

如果是在 Windows 平台上进行编译 `HOME=~/.electron-gyp` 将不会顺利执行，以上命令需要变换为如下形式：

```
set HOME=C:\Users\Catouse\.node-gyp
node-gyp rebuild --target=1.2.8 --arch=x64 --dist-url=https://atom.io/download/electron
```

## 5 运行和测试

### 5.1 直接使用 NodeJS 运行

以上节例子为例，编写 JS 测试文件 `test.js` 如下：

```js
/* File: test.js */

const example = require("./build/Release/example.node");

// ----- Object creation -----

console.log("Creating some objects:");
c = new example.Circle(10);
console.log("Created circle " + c);
s = new example.Square(10);
console.log("Created square " + s);

// ----- Access a static member -----
console.log("\nA total of " + example.Shape.nshapes + " shapes were created"); // access static member as properties of the class object

// ----- Member data access -----
// Set the location of the object.
// Note: methods in the base class Shape are used since
// x and y are defined there.

c.x = 20;
c.y = 30;
s.x = -10;
s.y = 5;

console.log("\nHere is their new position:");
console.log("Circle = (" + c.x + "," + c.y + ")");
console.log("Square = (" + s.x + "," + s.y + ")");

// ----- Call some methods -----
console.log("\nHere are some properties of the shapes:");
console.log("Circle:");
console.log("area = " + c.area() + "");
console.log("perimeter = " + c.perimeter() + "");
console.log("\n");
console.log("Square:");
console.log("area = " + s.area() + "");
console.log("perimeter = " + s.perimeter() + "");

// ----- Delete everything -----
console.log("\nGuess I'll clean up now");
// Note: this invokes the virtual destructor
delete c;
delete s;

console.log(example.Shape.nshapes + " shapes remain");

console.log("Goodbye");
```

在命令行使用 NodeJS 运行测试文件：

```
node ./test.js
```

如果顺利，结果会输出在命令窗口中。

### 5.2 在 Electron 中运行测试

当将 C++ 模块编译为 Electron 所使用的 Node 模块后，可以使用 [Electron-Run](https://github.com/catouse/electron-run) 工具来加载 node 模块文件，并编写测试脚本。
