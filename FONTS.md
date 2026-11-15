# 内置字体授权说明

本 APK 内置的 6 款中文书法字体**全部**采用 [SIL Open Font License 1.1](https://openfontlicense.org/open-font-license-official-text/)（OFL 1.1）授权。OFL 允许自由使用、研究、修改、嵌入和再分发（含商业用途），主要要求是：不得单独售卖字体文件、随软件分发时须附带版权声明与 OFL 许可文本、修改版不得沿用保留字体名。

完整许可文本见：[OFL-1.1 全文](https://openfontlicense.org/open-font-license-official-text/)。每款字体**各自的版权声明 + 许可全文**存放在 [`app/assets/fonts/licenses/`](./app/assets/fonts/licenses/) 目录（6 个 `*.OFL.txt`），并已随 APK 一并打包，以满足 OFL 的附带声明要求。

| 文件 | 字体名 | Google Fonts | 授权文件 |
| --- | --- | --- | --- |
| `MaShanZheng.ttf` | Ma Shan Zheng / 马善政毛笔楷书 | https://fonts.google.com/specimen/Ma+Shan+Zheng | [ofl/mashanzheng/OFL.txt](https://github.com/google/fonts/blob/main/ofl/mashanzheng/OFL.txt) |
| `ZhiMangXing.ttf` | Zhi Mang Xing / 志莽行书 | https://fonts.google.com/specimen/Zhi+Mang+Xing | [ofl/zhimangxing/OFL.txt](https://github.com/google/fonts/blob/main/ofl/zhimangxing/OFL.txt) |
| `LiuJianMaoCao.ttf` | Liu Jian Mao Cao / 刘建毛草 | https://fonts.google.com/specimen/Liu+Jian+Mao+Cao | [ofl/liujianmaocao/OFL.txt](https://github.com/google/fonts/blob/main/ofl/liujianmaocao/OFL.txt) |
| `LongCang.ttf` | Long Cang / 龙藏体 | https://fonts.google.com/specimen/Long+Cang | [ofl/longcang/OFL.txt](https://github.com/google/fonts/blob/main/ofl/longcang/OFL.txt) |
| `ZCOOLXiaoWei.ttf` | ZCOOL XiaoWei / 站酷小薇体 | https://fonts.google.com/specimen/ZCOOL+XiaoWei | [ofl/zcoolxiaowei/OFL.txt](https://github.com/google/fonts/blob/main/ofl/zcoolxiaowei/OFL.txt) |
| `ZCOOLKuaiLe.ttf` | ZCOOL KuaiLe / 站酷快乐体 | https://fonts.google.com/specimen/ZCOOL+KuaiLe | [ofl/zcoolkuaile/OFL.txt](https://github.com/google/fonts/blob/main/ofl/zcoolkuaile/OFL.txt) |

字体文件取自 [google/fonts](https://github.com/google/fonts) 官方仓库，未做修改（仅重命名为便于打包的短文件名）。每款覆盖约 6763 个常用汉字。

## 界面中的其他选项

- **宋体 / 黑体**：调用 Android 系统内置字体（通常为 Noto Serif CJK / Noto Sans CJK），不随 APK 分发，不涉及再授权。
- **隶意 / 篆意**：基于上表的 `ZCOOLXiaoWei` / `MaShanZheng` 做字形缩放与版式变化，属于渲染效果，不是独立字体文件，也不是真正的隶书 / 篆书字库。
- **「＋ 我的字体」导入的字体**：由使用者自行提供并存于 App 私有目录，**不随本仓库分发**。使用者须自行确保所导入字体拥有合法授权；本项目不对用户自行导入字体的版权负责。

## 为什么没有收录真篆书、真隶书和名家字体

这类字体绝大多数为商业授权字体，且开源的篆书字库普遍收字严重不全（无法覆盖现代白话文本），不适合打包进开源项目或宣称「整篇文章统一」。本项目选择用明确的风格化版式 + 自定义字体导入来解决，而不是侵犯版权或提供会大量缺字的功能。详见 [README.md](./README.md)。
