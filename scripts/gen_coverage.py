#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成 app/assets/font-coverage.js —— 各字库的 Unicode 覆盖位图。

复刻自「百变印章」的缺字自动回退思路：原生层用 Paint.hasGlyph() 逐字检测，
本 App 是 WebView + Canvas，因此改为在构建时提取字体 cmap，生成一个紧凑的
覆盖位图，前端逐字 O(1) 查询；缺字时临时改用楷书绘制，避免整篇文章出现方框。

编码：
  - BMP（U+0000–U+FFFF）用 65536 bit = 8192 B 位图，base64 后约 11 KB；
  - 补充平面（> U+FFFF）的码位用十六进制区间字符串列出。
只有需要缺字回退的字库才生成（真隶书、真篆书、庆科黄油），其余保持原样。

依赖：fontTools（`pip install fonttools`）
用法：python3 scripts/gen_coverage.py
"""
import base64
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT_DIR = os.path.join(ROOT, "app", "assets", "fonts")
OUT = os.path.join(ROOT, "app", "assets", "font-coverage.js")

# 需要逐字缺字检测的字体（字库覆盖有限）
TARGETS = {
    "lishu.ttf": "FS-Lishu",
    "zhuanshu.ttf": "FS-Zhuan",
    "heiti.ttf": "FS-HuangYou",
}

BMP_BITS = 0x10000 // 8  # 8192


def ranges(cps):
    """把有序码位列表合并成 [start, end] 区间。"""
    out = []
    if not cps:
        return out
    s = p = cps[0]
    for c in cps[1:]:
        if c == p + 1:
            p = c
        else:
            out.append((s, p))
            s = p = c
    out.append((s, p))
    return out


def build(path):
    from fontTools.ttLib import TTFont

    font = TTFont(path, lazy=True)
    cps = sorted(font.getBestCmap().keys())
    font.close()

    bmp = bytearray(BMP_BITS)
    extra = []
    for cp in cps:
        if cp < 0x10000:
            bmp[cp >> 3] |= 1 << (7 - (cp & 7))
        else:
            extra.append(cp)

    seg = ",".join(
        "%X-%X" % (a, b) if a != b else "%X" % (a,)
        for a, b in ranges(extra)
    )
    return {
        "bmp": base64.b64encode(bytes(bmp)).decode("ascii"),
        "extra": seg,
        "count": len(cps),
    }


def main():
    data = {}
    for fn, fam in TARGETS.items():
        p = os.path.join(FONT_DIR, fn)
        if not os.path.exists(p):
            raise SystemExit("缺少字体文件: " + p)
        d = build(p)
        data[fam] = {"bmp": d["bmp"], "extra": d["extra"]}
        print("  %-14s %-16s cmap=%-6d BMP位图=%d B  补充区间=%s"
              % (fam, fn, d["count"], BMP_BITS, d["extra"] or "无"))

    lines = [
        "/* 由 scripts/gen_coverage.py 生成，请勿手工编辑。",
        " * 字体 cmap → BMP 覆盖位图（base64, 8192 B）+ 补充平面区间。",
        " * 前端逐字查询，缺字自动回退到楷书，避免方框 / 豆腐块。",
        " * 思路来自开源项目「百变印章」的 Paint.hasGlyph() 缺字回退。 */",
        "window.FONT_COVERAGE = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";",
    ]
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print("✅ 已生成 %s（%.1f KB）" % (OUT, os.path.getsize(OUT) / 1024))


if __name__ == "__main__":
    main()
