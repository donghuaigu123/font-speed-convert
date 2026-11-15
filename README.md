# 字体速转

<p align="center"><img src="app/res/mipmap-xxxhdpi/ic_launcher.png" width="96" alt="字体速转图标"></p>

**把一段文字，一键变成一张统一的书法作品图片。**

一款完全离线、零广告、零联网权限的 Android 应用。输入或粘贴文字 → 挑一款字体 → 点生成 → 保存到相册，四步完成。长文章会自动换行、自动分页，整篇始终使用同一种字体，风格统一协调。

📦 **[下载安装包：字体速转-v1.0.apk](./字体速转-v1.0.apk)**（Android 6.0 / API 23 及以上）

---

## 它做了什么

| 能力 | 说明 |
| --- | --- |
| 多种书体 | 楷书、行书、草书、行楷、魏碑、灵动体、宋体、黑体，另有「隶意」「篆意」两种风格化版式 |
| 整篇统一 | 全文共用同一字体，自动按字数调整字号，自动换行、避头尾标点、自动分页 |
| 高清出图 | 1080px 宽 PNG，宣纸纹理、界格 / 朱丝栏、落款、朱砂印章可选 |
| 四种纸张 | 宣纸、素白、仿古、墨拓 |
| 横排 / 竖排 | 竖排自右向左，带界格；英文数字自动横向旋转 |
| 一键下载 | 保存到系统相册 `Pictures/字体速转/`，多页长文一次全部保存 |
| 导入自有字体 | 点右上角「＋ 我的字体」，选 TTF/OTF 即可用，不上传、不联网 |
| 完全离线 | 字体全部内置在 APK 里，不需要网络，不申请 INTERNET 权限 |

**操作只有三步**：输入文字 → 点一下字体 → 生成并保存。高级设置默认收起，所有参数都已调好。

---

## 内置字体与授权

所有内置字体均为 **SIL Open Font License 1.1** 开源字体，可自由使用、嵌入与再分发。详见 [FONTS.md](./FONTS.md)。

| 界面名称 | 字体 | 风格 | 来源 |
| --- | --- | --- | --- |
| 楷书 | Ma Shan Zheng 马善政毛笔楷书 | 端正浑厚（颜体风） | Google Fonts |
| 行书 | Zhi Mang Xing 志莽行书 | 流畅飘逸（羲之风） | Google Fonts |
| 草书 | Liu Jian Mao Cao 刘建毛草 | 纵逸奔放（怀素风） | Google Fonts |
| 行楷 | Long Cang 龙藏体 | 温润秀雅 | Google Fonts |
| 魏碑 | ZCOOL XiaoWei 站酷小薇体 | 古拙清丽 | Google Fonts |
| 灵动 | ZCOOL KuaiLe 站酷快乐体 | 轻松活泼 | Google Fonts |
| 宋体 / 黑体 | 系统字体（思源宋 / 思源黑） | 长篇正文清晰耐读 | Android 系统，零体积 |

每款内置中文书法字体覆盖约 **6763 个常用汉字**（GB2312 范围），日常诗词文章基本不会缺字。

## ⚠️ 关于隶书、篆书与名家字体（请务必读一下）

这是本项目最需要说明清楚的地方，我不想用「假字体」糊弄使用者：

- **「隶意」「篆意」是风格化排版，不是真正的隶书 / 篆书字库。** 它们在真实开源字体基础上做字形压扁（隶书扁方波磔）或纵向拉长 + 竖排界格 + 朱砂色（篆书圆转），营造书体意境，但**字形本身不是篆文或隶书**。界面与文档均已明确标注。
- **真篆书、真隶书、以及王羲之 / 颜真卿 / 怀素等名家集字字体，几乎全部是商业版权字体**，且篆书开源字库普遍收字不全、无法覆盖现代汉语文本。把它们打包进一个开源仓库会侵犯版权，因此本项目没有这么做。
- **正确解法是「导入自有字体」**：如果你手上有已获授权的名家字体、隶书或篆书 TTF/OTF，点右上角「＋ 我的字体」选择文件即可立刻使用，字体文件只保存在本 App 私有目录，不会上传、不会外泄。这样既能用到你想要的字库，授权也干净。
- 界面中的「颜体风」「羲之风」「怀素风」只是**风格描述**，表示用开源毛笔字体近似那种气质，并非名家真迹集字。

---

## 自行编译

不需要 Android Studio / Gradle，只需要 **Android SDK build-tools 34.0.0 + platforms;android-34 + JDK 11+**：

```bash
git clone https://github.com/donghuaigu123/font-speed-convert.git
cd font-speed-convert
export ANDROID_HOME=/path/to/your/android-sdk
./build.sh
```

产物为根目录的 `字体速转-v1.0.apk`。`build.sh` 依次完成：

```
aapt2 compile → aapt2 link(含 assets/字体) → javac → d8 → 组装 dex → zipalign → apksigner 签名
```

签名用的调试 keystore 在 `build/release.keystore`（已被 `.gitignore` 排除）。**正式发布请替换为自己的密钥并妥善保管**，不要提交私钥。

## 技术架构

- 原生层：`MainActivity.java` 是一个 WebView 壳。它通过 `shouldInterceptRequest` 拦截 `file:///android_asset/` 请求并补上 CORS 头——这一步很关键，否则 Chromium 会把本地 `@font-face` 判为跨域资源并**污染 canvas**，导致 `toDataURL` 无法导出图片。
- 保存层：图片以 base64 **分块**回传给原生层（`beginImage` / `appendImage` / `finishImage`），规避 JS 单次传超大字符串的限制；Android 10+ 用 MediaStore 写相册，Android 9 及以下用公共目录 + 媒体扫描。
- 渲染层：`app/assets/app.js` 用 Canvas 完成全部排版（自动字号、换行避头尾、分页、纸纹、界格、落款、印章），输出 1080px 宽 PNG。
- 全部逻辑离线，`AndroidManifest.xml` 未声明 INTERNET 权限。

## 已知限制

- 内置书法字体收字约 6763 个（GB2312），**生僻字、部分繁体字可能显示为系统回退字体**；长篇正文建议选「宋体」，字库最全。
- 「隶意 / 篆意」为版式模拟，不是真篆/隶字形，见上文说明。
- 极长文本会分成多张图片，单页高度上限 3600px，避免生成超大图片导致内存问题。
- 首次生成大字体时需要加载字体，可能有 1～2 秒等待。

## 开源协议

App 代码采用 [MIT License](./LICENSE)。内置字体各自遵循 SIL OFL 1.1，详见 [FONTS.md](./FONTS.md)。

> 安全提示：任何 API Token、密钥都不要写进仓库或提交信息。本项目不含任何凭据。
