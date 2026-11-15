# 内置字体授权说明

本 APK 内置 **9 款真实字库**，分属**三种授权**，**均不适用本项目代码采用的 MIT 许可**：

| 类别 | 数量 | 授权 | 附带文件 |
| --- | --- | --- | --- |
| Google Fonts 书法字体 | 6 款 | SIL Open Font License 1.1 | `licenses/*.OFL.txt`（每款独立版权声明） |
| 说文小篆 / 庆科黄油 | 2 款 | SIL Open Font License 1.1 | `licenses/bai-bian-yin-zhang/` |
| 青柳古隶（隶书） | 1 款 | 作者发布的自由使用声明（非 OFL） | `licenses/bai-bian-yin-zhang/AoyagiReisho_*` |

所有许可文件均放在 [`app/assets/fonts/licenses/`](./app/assets/fonts/licenses/) 并**随 APK 一并打包**，只拿到安装包的用户也能看到条款原文。

> 本 App 与源码仓库均**免费提供**，不存在有偿再分发；字体未单独出售，仅作为应用的一部分提供。

---

## 1. Google Fonts 的 6 款（OFL 1.1）

字体文件取自 [google/fonts](https://github.com/google/fonts) 官方仓库，未做修改（仅重命名为便于打包的短文件名）。OFL 1.1 允许自由使用、研究、修改、嵌入与再分发（含商业用途），主要要求是：不得单独售卖字体文件、随软件分发时须附带版权声明与许可文本、修改版不得沿用保留字体名。

| 文件 | 字体名 | 界面名称 | 授权文件 |
| --- | --- | --- | --- |
| `MaShanZheng.ttf` | Ma Shan Zheng / 马善政毛笔楷书 | 楷书 | [ofl/mashanzheng/OFL.txt](https://github.com/google/fonts/blob/main/ofl/mashanzheng/OFL.txt) |
| `ZhiMangXing.ttf` | Zhi Mang Xing / 志莽行书 | 行书 | [ofl/zhimangxing/OFL.txt](https://github.com/google/fonts/blob/main/ofl/zhimangxing/OFL.txt) |
| `LiuJianMaoCao.ttf` | Liu Jian Mao Cao / 刘建毛草 | 草书 | [ofl/liujianmaocao/OFL.txt](https://github.com/google/fonts/blob/main/ofl/liujianmaocao/OFL.txt) |
| `LongCang.ttf` | Long Cang / 龙藏行楷 | 行楷 | [ofl/longcang/OFL.txt](https://github.com/google/fonts/blob/main/ofl/longcang/OFL.txt) |
| `ZCOOLXiaoWei.ttf` | ZCOOL XiaoWei / 站酷小薇体 | 魏碑 | [ofl/zcoolxiaowei/OFL.txt](https://github.com/google/fonts/blob/main/ofl/zcoolxiaowei/OFL.txt) |
| `ZCOOLKuaiLe.ttf` | ZCOOL KuaiLe / 站酷快乐体 | 灵动 | [ofl/zcoolkuaile/OFL.txt](https://github.com/google/fonts/blob/main/ofl/zcoolkuaile/OFL.txt) |

完整许可文本：[OFL-1.1 全文](https://openfontlicense.org/open-font-license-official-text/)。每款覆盖约 7000 个常用汉字。

## 2. 融合自「百变印章」的 3 款

字库文件来自同作者的开源项目 [bai-bian-yin-zhang](https://github.com/donghuaigu123/bai-bian-yin-zhang)，其字体授权说明见该项目 [`docs/FONT_LICENSES.md`](https://github.com/donghuaigu123/bai-bian-yin-zhang/blob/main/docs/FONT_LICENSES.md)。

### 2.1 `zhuanshu.ttf` — 篆书（说文小篆）· OFL 1.1

- 来源：Shuowen Seal 印章专用子集 · [LiaBrio/seal-fonts](https://github.com/LiaBrio/seal-fonts)，字形源自**开元小篆**（[frankslin/kaiyuan-small-seal-font](https://github.com/frankslin/kaiyuan-small-seal-font)，OFL 1.1）与**臺灣「全字庫說文解字」**（數位發展部，[cns11643.gov.tw](https://www.cns11643.gov.tw)）。
- 依 OGDL-Taiwan-1.0 要求在此具名：**字形來源為中華民國數位發展部全字庫說文解字**。
- 依 OFL 1.1 的具名与随附要求：完整声明见 [`NOTICE-seal-fonts.md`](./app/assets/fonts/licenses/bai-bian-yin-zhang/NOTICE-seal-fonts.md)，OFL 全文见 [`OFL-1.1.txt`](./app/assets/fonts/licenses/bai-bian-yin-zhang/OFL-1.1.txt)。
- 印章项目只做了 WOFF → TTF 容器转换与子集化（保留 4752 篆形），未改动字形轮廓，衍生字体未使用「Kaiyuan」保留名称。
- 本 App 未对字形做任何改动，仅重命名为 `zhuanshu.ttf`。

### 2.2 `heiti.ttf` — 现代（庆科黄油）· OFL 1.1

- 来源：ZCOOL QingKe HuangYou · [Google Fonts](https://fonts.google.com/specimen/ZCOOL+QingKe+HuangYou)。印章项目做了 GB2312 子集化并改名为 `BBYZ Heiti`，保留 name 表中的版权与许可声明。
- OFL 全文见 [`OFL-googlefonts.txt`](./app/assets/fonts/licenses/bai-bian-yin-zhang/OFL-googlefonts.txt)。
- 本 App 未改动字形，仅重命名为 `heiti.ttf`。覆盖约 7200 字。

### 2.3 `lishu.ttf` — 隶书（青柳古隶）· 作者自由授权

- 来源：**青柳隷書しも V2.01**（JIS 第二水准版），日本书法家**青柳衡山**挥毫、**SIMO（しも）**制作，由 [opentype.jp](https://opentype.jp/aoyagireisho.htm) 官方发布。这是一款书写体古隶，笔画带波磔、有金石手书味。
- 授权依据是官方压缩包内《フォントの使用方法.txt》的作者声明，**不是 SIL OFL**：

  > 青柳隷書しもフォントは無料フォントです。使用にあたっての条件は何もありません。商用使用もＯＫです。
  > 青柳隷書しもフォントは無料でどこにでも配布することができます。ただし、再配布にあたって有料とすることはできません。
  > 青柳隷書しもフォントを配布する際には、必ずフォントの使用方法と、フォントの解説を一緒に配布するようにしてください。

  中文要点：**使用无条件、可商用；可免费在任何地方再分发（不得收费）；分发时必须同时附上《使用方法》与《解说》原文；使用与再分发无需事先联系作者**。

- 合规处理：条款原文与《解说》doc/pdf 三份文件按**原始字节**保存（未转码、未改动），随 APK 分发：
  - [`AoyagiReisho_terms_ja.txt`](./app/assets/fonts/licenses/bai-bian-yin-zhang/AoyagiReisho_terms_ja.txt)（《使用方法》，Shift-JIS 编码）
  - [`AoyagiReisho_explanation.doc`](./app/assets/fonts/licenses/bai-bian-yin-zhang/AoyagiReisho_explanation.doc)
  - [`AoyagiReisho_explanation.pdf`](./app/assets/fonts/licenses/bai-bian-yin-zhang/AoyagiReisho_explanation.pdf)
  - 在此具名标示原作者：书法 **青柳衡山**、字体制作 **SIMO**。
- 该字体保留全部 14963 个字形（含大量繁体与异体字），本 App 未做子集化、未改动字形轮廓，仅重命名为 `lishu.ttf`。
- 条款以随附的日文原文为准，上面的中文为便于理解的转述，不构成法律意见。

## 3. 为什么另外 6 款「百变印章」字库没有重复打包

百变印章的 9 款字库中有 6 款（`kaishu` / `xingshu` / `caoshu` / `xingkai` / `songti` / `quwei`）与本 App 已有的 Google Fonts 原版**同源同字形**：印章项目为控制体积做过 GB2312 子集化，并按 OFL 的 Reserved Font Name 条款把内部名改为 `BBYZ *`，但字形轮廓完全一致。

重复内置只会让 APK 变大、界面出现两个「楷书」，因此本 App 保留**覆盖更全的 Google Fonts 原版**（约 7000 字 vs 子集约 6900 字），并把印章项目的界面名（马善政楷书、志莽行书、刘建毛草、龙藏行楷、站酷小薇、站酷快乐）融合进字体卡片描述，做到来源可追溯、不重复堆砌。

## 4. 界面中的其他选项

- **宋体 / 黑体**：调用 Android 系统内置字体（通常为 Noto Serif CJK / Noto Sans CJK），不随 APK 分发，不涉及再授权。
- **汉隶风 / 金石风**：基于 `ZCOOLXiaoWei` / `MaShanZheng` 做字形缩放与版式变化，属于渲染效果，不是独立字体文件，也不是真正的隶书 / 篆书字库。界面以「风格」角标明确区分。
- **「＋ 我的字体」导入的字体**：由使用者自行提供并存于 App 私有目录，**不随本仓库分发**。使用者须自行确保所导入字体拥有合法授权；本项目不对用户自行导入字体的版权负责。

## 5. 缺字回退与字库覆盖

| 字体 | 可用字形 | 说明 |
| --- | --- | --- |
| Google Fonts 6 款 | 约 7000 | 覆盖 GB2312 简体字 + 常用繁体 |
| 庆科黄油 | 7204 | 子集化后仍覆盖 GB2312 |
| 青柳古隶 | 14963（完整保留） | 以 JIS 第二水准汉字为主，简体命中约 65% |
| 说文小篆 | 4752 | 《通用规范汉字表》一、二级字表中已有的篆形 |

真隶书与真篆书遇到无字形的字时，本 App 逐字检测并**自动改用楷书绘制该字**（正文、标题、落款、印章一致），避免方框；结果栏会显示「N 字以楷书补齐」。检测依据是构建期由 `scripts/gen_coverage.py` 从字体 `cmap` 提取的 BMP 覆盖位图，思路复刻自百变印章原生层的 `Paint.hasGlyph()`。

> 因此简体长文用真篆书时，回退字会比较多，属于预期行为，不是缺字缺陷。追求「每个字都是篆形」时建议输入吉祥语、传统姓名用字或繁体传承字形。

## 6. 关于名家字体

王羲之 / 颜真卿 / 怀素等名家集字字体绝大多数为商业授权字体，打包进开源仓库会侵犯版权，本项目没有收录。界面中的「马善政楷书」「志莽行书」等是开源毛笔字体的**真实名称**，不是名家真迹集字。如需名家字体，请用 App 内的「＋ 我的字体」导入你已获授权的字库。
