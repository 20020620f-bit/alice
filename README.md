# 记账

晴账是一款面向手机使用的轻量记账 PWA。项目是纯静态页面，可以直接部署到 GitHub Pages，也可以在 iPhone Safari 里添加到主屏幕使用。

## 在线访问

当前 GitHub Pages 地址：

```text
https://20020620f-bit.github.io/alice/
```

如果手机上看到旧页面，先刷新网页；如果已经添加到主屏幕，重新打开几次或等待浏览器缓存更新。

## 主要功能

- 月度支出、收入、预算进度展示
- 首页消费卡片列表
- 支出和收入记账
- 分类分组：购物、吃喝、交通、娱乐、生活、收入
- 分类名称和图标自定义
- 数字键盘录入金额
- 备注弹窗和历史备注
- 流水搜索、筛选、编辑、删除
- 图表分析和分类支出排行
- 数据保存在当前设备浏览器本地

## 本地运行

在项目目录打开 PowerShell：

```powershell
powershell -ExecutionPolicy Bypass -File .\serve.ps1 -Port 5173
```

电脑浏览器访问：

```text
http://localhost:5173/
```

iPhone 和电脑连接同一个 Wi-Fi 时，可以用终端里显示的局域网地址访问，例如：

```text
http://192.168.x.x:5173/
```

## 本地调试工作台

调 UI 时先打开：

```text
http://localhost:5173/ui-tuner.html
```

这个页面只做本地预览，不会直接改正式 App 代码。推荐流程：

1. 在 `ui-tuner.html` 里调整字号、间距、圆环和手机宽度。
2. 满意后复制参数给 Codex，让 Codex 落到 `styles.css`。
3. 再打开 `http://localhost:5173/` 检查正式页面。
4. 本地确认没问题后再 `git commit` 和 `git push`。

手机真机调试：

1. 电脑和 iPhone 连接同一个 Wi-Fi。
2. 运行 `serve.ps1` 后，终端会显示 `Phone on same Wi-Fi` 下的 `Workbench` 地址。
3. 用 iPhone Safari 打开这个地址，例如：

```text
http://192.168.x.x:5173/ui-tuner.html
```

在手机上打开时，预览会占满手机屏幕，调试面板会变成底部抽屉，可以收起或展开。

## iPhone 安装到主屏幕

1. 用 iPhone Safari 打开网页地址。
2. 点击 Safari 底部分享按钮。
3. 选择“添加到主屏幕”。
4. 以后从桌面图标打开即可。

## 手动更新并发布

每次修改文件后，按这个顺序推送：

```powershell
git status
git add .
git status
git commit -m "描述这次改了什么"
git push
```

推送成功后，GitHub Pages 会自动部署。可以在仓库的 `Deployments` 或 `Actions` 页面查看是否有绿色对勾。

## GitHub Pages 设置

仓库第一次部署时需要设置：

1. 打开仓库 `Settings`
2. 进入 `Pages`
3. `Source` 选择 `Deploy from a branch`
4. `Branch` 选择 `main`
5. 目录选择 `/(root)`
6. 保存并等待部署完成

## 数据说明

当前版本没有后端服务器和账号系统。每个人打开网站后，账本数据保存在自己设备的浏览器本地，不会自动同步到别人手机，也不会同步到云端。

如果清除浏览器数据、换手机、换浏览器，原来的本地账本可能不会保留。后续如果要多设备同步，需要再接入服务器或云数据库。

## 文件结构

```text
index.html              主页面结构
styles.css              页面样式
app.js                  记账逻辑和本地数据
sw.js                   PWA 缓存
manifest.webmanifest    添加到主屏幕配置
assets/                 图标资源
serve.ps1               本地静态服务器脚本
ui-tuner.html           本地 UI 调试工作台
```
