# 🔧 开发工具包

基于Vue 3和Vite构建的现代化开发工具网页，包含URL编码/解码、Unix时间戳转换和二维码生成功能。

## ✨ 功能特性

### 🔗 URL编码/解码
- **URL编码**：将特殊字符转换为URL安全的格式
- **URL解码**：将编码后的URL转换回原始格式
- **实时转换**：支持一键编码/解码操作
- **错误处理**：完善的错误提示和验证

### 🔐 Base64编码/解码
- **Base64编码**：将文本转换为Base64格式
- **Base64解码**：解码Base64字符串
- **实时转换**：支持快捷键操作

### 🔒 Hash编码
- **多种Hash算法**：支持MD5、SHA-1、SHA-256、SHA-512
- **实时计算**：输入即时显示Hash结果
- **安全应用**：密码加密、数据完整性校验

### ⏰ Unix时间戳转换
- **时间戳转日期**：将Unix时间戳转换为可读的日期时间
- **当前时间戳**：一键获取当前时间的Unix时间戳
- **多种格式**：支持本地时间、UTC时间、ISO格式显示
- **毫秒支持**：同时显示秒级和毫秒级时间戳

### 📱 二维码生成
- **文本转二维码**：将任意文本内容生成二维码
- **URL二维码**：生成网址的二维码，方便手机扫描访问
- **下载功能**：支持将生成的二维码下载为PNG图片
- **高质量输出**：清晰的二维码图像，支持多种尺寸

### 📄 JSON格式化
- **JSON格式化**：美化JSON数据，使其易于阅读
- **JSON压缩**：压缩JSON数据，减少体积
- **树视图**：以树形结构展示JSON数据
  - 支持折叠/展开节点
  - 语法高亮显示
  - 显示数据类型（对象、数组、字符串、数字等）
  - 显示数组/对象大小
  - 一键全部展开/折叠
- **文本视图**：传统的文本格式显示
- **错误提示**：清晰的JSON语法错误提示

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 🎨 界面特性

- **现代化设计**：采用渐变背景和卡片式布局
- **响应式布局**：完美适配桌面端和移动端
- **交互动画**：悬停效果和按钮动画
- **用户友好**：清晰的操作提示和错误信息

## ⌨️ 快捷键

- **Ctrl+Enter** (Windows) 或 **Cmd+Enter** (Mac)：快速执行当前工具的主要功能
- **点击输出区域**：自动复制结果到剪贴板

## 🛠️ 技术栈

- **Vue 3**：使用Composition API和响应式系统
- **Vite**：快速的构建工具和开发服务器
- **QRCode.js**：二维码生成库
- **CryptoJS**：加密算法库
- **CSS3**：Flexbox、Grid布局、渐变、动画

## 📁 项目结构

```
src/
├── components/
│   ├── UrlEncoder.vue           # URL编码/解码组件
│   ├── Base64Encoder.vue        # Base64编码/解码组件
│   ├── HashEncoder.vue          # Hash编码组件
│   ├── TimestampConverter.vue   # 时间戳转换组件
│   ├── QrCodeGenerator.vue      # 二维码生成组件
│   └── JsonFormatter.vue        # JSON格式化组件（含树视图）
├── App.vue                      # 主应用组件
├── main.js                      # 应用入口
└── style.css                    # 全局样式
```

## 🔧 自定义配置

### 修改二维码样式
在 `QrCodeGenerator.vue` 组件中可以修改二维码的样式：

```javascript
await QRCode.toCanvas(this.$refs.qrCanvas, this.inputText, {
  width: 200,        // 二维码尺寸
  margin: 2,         // 边距
  color: {
    dark: '#000000',   // 二维码颜色
    light: '#FFFFFF'   // 背景颜色
  }
})
```

### 修改主题颜色
在 `src/style.css` 中修改CSS变量来改变主题颜色：

```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
}
```

## 📱 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🚀 部署

### 构建生产版本
```bash
npm run build
```

构建完成后，`dist` 目录包含所有静态文件，可以直接部署到任何静态文件服务器。

### 部署到GitHub Pages
1. 构建项目：`npm run build`
2. 将 `dist` 目录的内容推送到GitHub仓库的 `gh-pages` 分支
3. 在GitHub仓库设置中启用GitHub Pages

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个工具！

## 📄 许可证

MIT License - 可自由使用和修改

## 📞 联系方式

如有问题或建议，请通过GitHub Issues联系。 