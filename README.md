# 图片助手 ImageOps

图片助手（ImageOps）是一站式图片处理与自动化工具平台，面向 Agent 时代的图片处理自动化基础设施。

当前已上线四项核心功能：

- 图片压缩
- 格式转换
- 清晰度增强
- 添加水印

当前网页端支持拖拽上传、批量添加水印、结果下载、中英文切换、亮色/暗色模式，并已配置浏览器图标和分享预览图。后续可继续扩展 API、CLI、OCR、合规去水印、HTML 转图片等能力。

## 本地运行

安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run dev
```

默认本地地址：

```text
http://127.0.0.1:5173/
```

## 构建

生成部署文件：

```bash
npm run build
```

构建结果会输出到：

```text
dist/
```

本地预览构建结果：

```bash
npm run preview
```

## 部署文档

正式域名：

```text
https://imageops-app.tranfu.com/
```

### Vercel 部署

1. 在 Vercel 中导入 GitHub 仓库 `tranfu-labs/imageops-app`。
2. Framework Preset 选择 `Vite`。
3. Build Command 填写：

```bash
npm run build
```

4. Output Directory 填写：

```text
dist
```

5. 不需要配置环境变量。
6. 部署完成后，在 Vercel Project Settings 的 Domains 中绑定：

```text
imageops-app.tranfu.com
```

7. 在 DNS 服务商处添加对应的 CNAME 记录，指向 Vercel 提供的域名。

### Coolify Docker 部署

仓库已包含 `Dockerfile`、`compose.yml`、`nginx.conf` 和 `.dockerignore`。

1. 在 Coolify 中使用 Docker Compose 导入本仓库。
2. Domain 绑定到 `web` 服务。
3. 内部端口填写：

```text
80
```

或在 Domain 配置中使用：

```text
https://imageops-app.tranfu.com:80
```

4. 当前版本不需要配置环境变量。
5. `compose.yml` 没有暴露宿主机公网端口，Coolify/Traefik 会通过 `web:80` 访问应用。
6. 不需要开启容器级 Healthcheck。如果 Coolify UI 要求填写健康检查路径，可使用 `/healthz`，端口使用 `80`。

### 其他静态托管平台

只要平台支持静态网站即可部署：

1. 执行 `npm install`
2. 执行 `npm run build`
3. 将 `dist/` 目录作为站点根目录发布
4. 将 `imageops-app.tranfu.com` 绑定到该站点

## 发布

当前发布版本：

```text
v0.2.3
```

发布内容包括：

- 首页和四个独立工具页面
- 图片压缩、格式转换、清晰度增强
- 添加水印，支持上传水印图和批量上传待处理图片
- 桌面端整体尺寸、版心和卡片密度优化
- 工具页支持 `/watermark` 这类无 `#` 子路径访问
- 图片结果支持点击放大、左右切换和键盘切换
- 画质默认 100%
- 水印工具下载全部会输出 zip 压缩包
- 首页压缩到常见桌面窗口一屏展示
- 拖拽上传和结果下载
- 中英文切换
- 亮色/暗色模式
- 浏览器图标和分享预览图

## 验证

开发环境启动后，可以运行自动化检查：

```bash
node scripts/verify.mjs
```

检查内容包括首页渲染、语言切换、暗色模式、图片压缩、格式转换、清晰度增强、添加水印和下载结果。
