# 字体速转

<p align="center"><img src="app/res/mipmap-xxxhdpi/ic_launcher.png" width="96" alt="字体速转图标"></p>

**把一段文字，一键变成一张统一的书法作品图片。**

一款完全离线、零广告、零联网权限的 Android 应用。输入或粘贴文字 → 挑一款字体 → 点生成 → 保存到相册，四步完成。长文章会自动换行、自动分页，整篇始终使用同一种字体，风格统一协调。

📦 **下载安装包**（Android 6.0 / API 23 及以上）：

- 最新版：[字体速转-v1.1.apk](./字体速转-v1.1.apk) · [GitHub Release v1.1](https://github.com/donghuaigu123/font-speed-convert/releases/tag/v1.1)
- 历史版：[v1.0](https://github.com/donghuaigu123/font-speed-convert/releases/tag/v1.0)

安装时需要允许「未知来源」。安装包已用 v1/v2/v3 三重签名，完全离线运行。

---

## 它做了什么

| 能力 | 说明 |
| --- | --- |
| 13 款字体 | 楷书、行书、草书、行楷、魏碑、灵动、**真隶书、真篆书、庆科黄油**、宋体、黑体，另有「汉隶风」「金石风」两种风格化版式 |
| 整篇统一 | 全文共用同一字体，自动按字数调整字号，自动换行、避头尾标点、自动分页 |
| **缺字自动补齐** | 真隶/真篆字库收字有限，遇到没有的字**逐字自动改用楷书**，整篇不出现方框，并在结果里提示补了几个字 |
| 高清出图 | 1080px 宽 PNG，宣纸纹理、界格 / 朱丝栏、落款、朱砂印章可选 |
| 四种纸张 | 宣纸、素白、仿古、墨拓 |
| 横排 / 竖排 | 竖排自右向左，带界格；英文数字自动横向旋转 |
| 一键下载 | 保存到系统相册 `Pictures/字体速转/`，多页长文一次全部保存 |
| 导入自有字体 | 点右上角「＋ 我的字体」，选 TTF/OTF 即可用，不上传、不联网 |
| 完全离线 | 字体全部内置在 APK 里，不需要网络，不申请 INTERNET 权限 |

**操作只有三步**：输入文字 → 点一下字体 → 生成并保存。高级设置默认收起，所有参数都已调好。

---

## v1.1：融合「百变印章」的字库

本版把同作者的开源项目 [百变印章](https://github.com/donghuaigu123/bai-bian-yin-zhang) 中的字体资源**增加、融合并复刻**进本 App，补齐了最初缺失的真隶书与真篆书：

| 新增字库 | 界面名称 | 来源 | 授权 |
| --- | --- | --- | --- |
| `lishu.ttf` | **隶书**（青柳古隶） | 青柳隷書しも V2.01 · 青柳衡山挥毫 / SIMO 制作 | 作者自由授权：可商用、可免费再分发（须随附条款与解说原文） |
| `zhuanshu.ttf` | **篆书**（说文小篆） | Shuowen Seal 子集 · [LiaBrio/seal-fonts](https://github.com/LiaBrio/seal-fonts) | SIL OFL 1.1 |
| `heiti.ttf` | **现代**（庆科黄油） | ZCOOL QingKe HuangYou · Google Fonts | SIL OFL 1.1 |

同时做了三件事：

1. **复刻缺字回退算法**：百变印章原生层用 `Paint.hasGlyph()` 逐字检测并回退楷书；本 App 是 WebView + Canvas，因此改用 `scripts/gen_coverage.py` 在构建期从字体 `cmap` 提取 **BMP 覆盖位图**（每字库 8 KB，base64 约 11 KB），前端逐字 O(1) 查询。正文、标题、落款、印章逐字检测，缺字临时切换楷书绘制，字宽也按实际绘制字体测量，保证字距匀称。
2. **同名去重**：百变印章 9 款字库中有 6 款（楷/行/草/行楷/宋韵/趣味）与本 App 已有的 Google Fonts 原版**同源同字形**（印章项目做过子集化并改名为 `BBYZ *`）。重复内置只会让 APK 变大、界面出现两个「楷书」，因此保留覆盖更全的原版，并把印章项目的界面名（马善政楷书、志莽行书等）融合到字体卡片描述里。
3. **授权合规**：青柳古隶的《使用方法》条款与《解说》doc/pdf、篆书的来源具名声明、两份 OFL 全文，全部原样打包进 `app/assets/fonts/licenses/bai-bian-yin-zhang/` 并随 APK 分发。详见 [FONTS.md](./FONTS.md)。

原来的「隶意 / 篆意」改名为「汉隶风 / 金石风」并保留为风格化版式备选，界面上以「风格」角标明确区分；带「印章」角标的三款才是真字库。

## 内置字体与授权

内置 9 款真实字库：6 款 SIL OFL 1.1 书法字体 + 上述 3 款融合字库（2 款 OFL 1.1 + 1 款作者自由授权）。详见 [FONTS.md](./FONTS.md)。

| 界面名称 | 字体 | 风格 | 来源 |
| --- | --- | --- | --- |
| 楷书 | Ma Shan Zheng 马善政毛笔楷书 | 端正浑厚 | Google Fonts |
| 行书 | Zhi Mang Xing 志莽行书 | 流畅飘逸 | Google Fonts |
| 草书 | Liu Jian Mao Cao 刘建毛草 | 纵逸奔放 | Google Fonts |
| 行楷 | Long Cang 龙藏行楷 | 温润秀雅 | Google Fonts |
| 魏碑 | ZCOOL XiaoWei 站酷小薇体 | 古拙清丽 | Google Fonts |
| 灵动 | ZCOOL KuaiLe 站酷快乐体 | 轻松活泼 | Google Fonts |
| **隶书** | 青柳隷書しも（青柳古隶） | 古隶波磔、金石手书 | 百变印章 / opentype.jp |
| **篆书** | Shuowen Seal 说文小篆 | 小篆圆转、右起竖排 | 百变印章 / seal-fonts |
| **现代** | ZCOOL QingKe HuangYou 庆科黄油 | 圆润醒目 | 百变印章 / Google Fonts |
| 宋体 / 黑体 | 系统字体 | 长篇正文清晰耐读 | Android 系统，零体积 |

6 款 Google Fonts 字库各覆盖约 7000 字；真隶书 14963 字形（日文字集，简体命中约 65%）；真篆书 4752 字形（部分常用字无篆形）。**后两者靠缺字回退保证整篇可读**，结果栏会显示「N 字以楷书补齐」。

## ⚠️ 关于名家字体（仍请读一下）

- **王羲之 / 颜真卿 / 怀素等名家集字字体几乎全部是商业版权字体**，打包进开源仓库会侵犯版权，本项目没有这么做。界面里的「马善政楷书」「志莽行书」等是开源毛笔字体的**真实名称**，不是名家真迹集字。
- **正确解法是「导入自有字体」**：如果你手上有已获授权的名家字体 TTF/OTF，点右上角「＋ 我的字体」选择文件即可立刻使用，字体只存在 App 私有目录，不上传、不外泄。
- 「汉隶风 / 金石风」是**版式模拟**（字形压扁 / 纵向拉长 + 竖排界格），不是真篆/隶字形，界面以「风格」角标标注，没有拿它充数。

---

## 自行编译

不需要 Android Studio / Gradle，只需要 **Android SDK build-tools 34.0.0 + platforms;android-34 + JDK 11+**：

```bash
git clone https://github.com/donghuaigu123/font-speed-convert.git
cd font-speed-convert
export ANDROID_HOME=/path/to/your/android-sdk
./build.sh
```

产物为根目录的 `字体速转-v1.1.apk`。`build.sh` 依次完成：

```
生成字体清单 / 覆盖位图 → aapt2 compile → aapt2 link(含 assets/字体) → javac → d8 → 组装 dex → zipalign → apksigner 签名
```

若本机装有 `fontTools`，构建时会自动重新生成 `font-coverage.js`；未安装则沿用仓库中已生成的文件，不影响构建。签名用的调试 keystore 在 `build/release.keystore`（已被 `.gitignore` 排除），**正式发布请替换为自己的密钥**。

## 技术架构

- 原生层：`MainActivity.java` 是一个 WebView 壳。它把页面、CSS、JS 和字体全部映射到同一个**虚拟 HTTPS 源** `https://appassets.fontconvert.local/`，由 `shouldInterceptRequest` 从本地 assets 返回（相当于手写的 WebViewAssetLoader）。这一步很关键：`file://` 协议下 Chromium 会把本地 `@font-face` 判为跨域资源并**污染 canvas**，导致 `toDataURL` 无法导出图片；同源 HTTPS 方案彻底规避了这个坑，且不产生任何真实网络请求。
- 保存层：图片以 base64 **分块**回传给原生层（`beginImage` / `appendImage` / `finishImage`），规避 JS 单次传超大字符串的限制；Android 10+ 用 MediaStore 写相册，Android 9 及以下用公共目录 + 媒体扫描。
- 渲染层：`app/assets/app.js` 用 Canvas 完成全部排版（自动字号、换行避头尾、分页、纸纹、界格、落款、印章），输出 1080px 宽 PNG。
- 缺字回退层：`scripts/gen_coverage.py` + `app/assets/font-coverage.js` + `hasGlyph()` / `drawOne()` / `measureOne()`，思路复刻自百变印章的 `Paint.hasGlyph()`。
- 全部逻辑离线，`AndroidManifest.xml` 未声明 INTERNET 权限。

## 已知限制

- 真隶书是日文字集、真篆书仅 4752 篆形，**简体长文中会有较多字回退到楷书**（结果栏会标出数量）；追求「每个字都是篆/隶」时，建议输入印章常用字、吉祥语或繁体传承字形，或导入自有完整字库。
- 6 款 Google Fonts 字库约 7000 字，生僻字可能回退到系统字体；长篇正文建议选「宋体」。
- 极长文本会分成多张图片，单页高度上限 3600px，避免生成超大图片导致内存问题。
- 首次生成大字体时需要加载字体，可能有 1～2 秒等待。
- 原生层（相册保存、字体导入）未在真机上实机点击验证，仅做了编译与代码审查；装机后如遇问题请提 issue 并附机型。

## 开源协议

App 代码采用 [MIT License](./LICENSE)。内置字体**各自**遵循其原始授权（SIL OFL 1.1 或青柳隷書作者自由授权），**不适用 MIT**，详见 [FONTS.md](./FONTS.md)。

> 安全提示：任何 API Token、密钥都不要写进仓库或提交信息。本项目不含任何凭据。
