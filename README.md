# 远程门铃物联网实验 (Remote Doorbell IoT Lab)

这是一个面向八年级学生的 React 应用程序，模拟物联网 (IoT) 智能门铃的工作原理。它通过可视化的 MQTT 协议流（发布者、代理、订阅者）帮助学生理解数据传输过程，并内置了基于 Gemini API 的 AI 实验室助手。

## 🚀 快速开始

### 1. 安装依赖

确保你已经安装了 Node.js，然后在项目根目录下运行：

```bash
npm install
```

### 2. 配置 API 密钥

本项目使用 Google Gemini API 提供 AI 助手功能。你需要一个 API 密钥。

在根目录下创建一个 `.env` 文件：

```env
VITE_API_KEY=你的_GOOGLE_GEMINI_API_KEY
```

> **注意**: 不要将包含真实 API 密钥的 `.env` 文件提交到 GitHub！

### 3. 运行开发服务器

```bash
npm run dev
```

打开浏览器访问显示的本地地址（通常是 http://localhost:5173）。

## 📦 部署到 GitHub Pages

1. 在 GitHub 上创建一个新的仓库。
2. 初始化 git 并推送代码：

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

3. 配置 GitHub Actions (可选自动化部署):
   - 在仓库中创建 `.github/workflows/deploy.yml`
   - 配置构建步骤 (npm install -> npm run build -> deploy to gh-pages)
   - **重要**: 在 GitHub 仓库设置 (Settings -> Secrets and variables -> Actions) 中添加 `VITE_API_KEY` 密钥，否则 AI 功能在部署后将无法工作。

## 🛠️ 技术栈

- **React 19**: UI 框架
- **Tailwind CSS**: 样式系统
- **Vite**: 构建工具
- **Google GenAI SDK**: AI 智能助手集成
- **Lucide React**: 图标库

## 📚 核心概念

本实验演示了 MQTT 协议的核心概念：
- **发布者 (Publisher)**: 智能门铃
- **代理 (Broker)**: 中间服务器
- **订阅者 (Subscriber)**: 手机 App
