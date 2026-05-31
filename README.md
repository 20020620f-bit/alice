# 晴账

一款可直接在 iPhone Safari 中添加到主屏幕的移动端记账 PWA。

## 本机运行

```powershell
powershell -ExecutionPolicy Bypass -File .\serve.ps1 -Port 5173
```

电脑和 iPhone 连接同一个 Wi-Fi 后，在 iPhone Safari 打开终端里显示的局域网地址，例如：

```text
http://192.168.124.22:5173
```

然后使用 Safari 分享按钮，选择“添加到主屏幕”。

## 功能

- 月度收入、支出、结余和预算进度
- 新增、编辑、删除流水
- 支出/收入分类、搜索和筛选
- 分类占比图、最近 7 天趋势、支出排行
- 本地浏览器保存数据

## 说明

当前版本不依赖 Node、Xcode 或后端服务。想发布成 TestFlight/App Store 原生安装包时，可以把这套界面迁移到 Expo/React Native，或用 Capacitor 封装成 iOS 项目后在 Mac 上打包。

## 部署到 GitHub Pages

1. 在 GitHub 新建一个公开仓库，例如 `qing-ledger`。
2. 在本项目目录执行：

```powershell
git remote add origin https://github.com/你的用户名/qing-ledger.git
git branch -M main
git push -u origin main
```

3. 打开 GitHub 仓库：

```text
Settings -> Pages -> Build and deployment
```

4. Source 选择 `Deploy from a branch`，Branch 选择 `main`，目录选择 `/root`，保存。
5. 等 GitHub Actions/Pages 构建完成后，访问：

```text
https://你的用户名.github.io/qing-ledger/
```

如果页面没有立即更新，等 1-3 分钟后刷新。iPhone 上用 Safari 打开这个地址后，可以添加到主屏幕。
