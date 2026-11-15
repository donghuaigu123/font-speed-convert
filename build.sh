#!/usr/bin/env bash
# 字体速转 —— 一键构建脚本
# 不依赖 Gradle / Android Studio，直接使用 Android SDK build-tools：
#   aapt2 (资源) -> javac (字节码) -> d8 (dex) -> zipalign -> apksigner (签名)
#
# 用法：
#   export ANDROID_HOME=/path/to/android-sdk
#   ./build.sh
# 产物：./字体速转-v1.1.apk

set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
APP="$ROOT/app"
BUILD="$ROOT/build"
OUT="$ROOT/字体速转-v1.1.apk"

ANDROID_HOME="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$ROOT/.android-sdk}}"
BT_VERSION="${BT_VERSION:-34.0.0}"
BT="$ANDROID_HOME/build-tools/$BT_VERSION"
PLATFORM="$ANDROID_HOME/platforms/android-34/android.jar"

fail() { echo "❌ $*" >&2; exit 1; }

[ -f "$PLATFORM" ]   || fail "找不到 android.jar：$PLATFORM"
[ -x "$BT/aapt2" ]   || fail "找不到 aapt2：$BT/aapt2（请安装 build-tools;$BT_VERSION 与 platforms;android-34）"
command -v javac     >/dev/null || fail "缺少 javac (JDK 11+)"
command -v keytool   >/dev/null || fail "缺少 keytool (JDK)"
command -v zip       >/dev/null || fail "缺少 zip"

echo "▶ SDK: $ANDROID_HOME"
rm -rf "$BUILD"
mkdir -p "$BUILD/gen" "$BUILD/classes" "$BUILD/dex"

# ---------------------------------------------------------------- 1. 字体清单
echo "▶ [1/7] 生成字体清单 fonts.js"
python3 - "$APP/assets/fonts" "$APP/assets/fonts.js" <<'PY'
import os, sys
d, out = sys.argv[1], sys.argv[2]
names = sorted(f for f in os.listdir(d) if f.lower().endswith((".ttf", ".otf", ".woff", ".woff2")))
lines = ["/* 由 build.sh 自动生成：列出实际打包进 APK 的字体文件。 */", "window.FONT_FILES = {"]
for i, n in enumerate(names):
    lines.append('  "%s": 1%s' % (n, "," if i < len(names) - 1 else ""))
lines.append("};")
open(out, "w", encoding="utf-8").write("\n".join(lines) + "\n")
print("   内置字体 %d 款，共 %.2f MB" % (len(names), sum(os.path.getsize(os.path.join(d, n)) for n in names) / 1048576))
PY

# 可选：本机装了 fontTools 就重新生成字库覆盖位图（缺字回退用）。
# 未安装也不影响构建——仓库已附带生成好的 font-coverage.js。
if python3 -c "import fontTools" 2>/dev/null; then
  python3 "$ROOT/scripts/gen_coverage.py" | sed 's/^/   /'
else
  echo "   （未安装 fontTools，沿用仓库中已生成的 font-coverage.js）"
fi

# ---------------------------------------------------------------- 2. 编译资源
echo "▶ [2/7] aapt2 compile"
"$BT/aapt2" compile --dir "$APP/res" -o "$BUILD/res.zip"

# ---------------------------------------------------------------- 3. 链接资源 + assets
echo "▶ [3/7] aapt2 link（打包 assets 与字体）"
"$BT/aapt2" link \
  -o "$BUILD/base.apk" \
  -I "$PLATFORM" \
  --manifest "$APP/AndroidManifest.xml" \
  -A "$APP/assets" \
  --java "$BUILD/gen" \
  --min-sdk-version 23 \
  --target-sdk-version 34 \
  --version-code 2 \
  --version-name "1.1" \
  --auto-add-overlay \
  "$BUILD/res.zip"

# ---------------------------------------------------------------- 4. 编译 Java
echo "▶ [4/7] javac"
find "$APP/java" "$BUILD/gen" -name "*.java" -print > "$BUILD/sources.txt"
javac --release 11 -encoding UTF-8 -nowarn \
  -classpath "$PLATFORM" \
  -d "$BUILD/classes" \
  @"$BUILD/sources.txt"

# ---------------------------------------------------------------- 5. dex
echo "▶ [5/7] d8"
mapfile -t CLASS_FILES < <(find "$BUILD/classes" -name "*.class" | sort)
"$BT/d8" --lib "$PLATFORM" --min-api 23 --output "$BUILD/dex" "${CLASS_FILES[@]}"

# ---------------------------------------------------------------- 6. 组装 + 对齐
echo "▶ [6/7] 组装 classes.dex 并 zipalign"
cp "$BUILD/base.apk" "$BUILD/unsigned.apk"
(cd "$BUILD/dex" && zip -q -u "$BUILD/unsigned.apk" classes.dex)
"$BT/zipalign" -f -p 4 "$BUILD/unsigned.apk" "$BUILD/aligned.apk"

# ---------------------------------------------------------------- 7. 签名
echo "▶ [7/7] 生成签名并打包"
KS="$BUILD/release.keystore"
STORE_PASS="zitisuzhuan2024"
if [ ! -f "$KS" ]; then
  keytool -genkeypair -noprompt \
    -keystore "$KS" -alias zitisuzhuan \
    -keyalg RSA -keysize 2048 -validity 10950 \
    -storepass "$STORE_PASS" -keypass "$STORE_PASS" \
    -dname "CN=FontSpeedConvert, OU=OpenSource, O=OpenSource, L=Shenzhen, ST=Guangdong, C=CN" \
    >/dev/null 2>&1
fi
"$BT/apksigner" sign \
  --ks "$KS" --ks-key-alias zitisuzhuan \
  --ks-pass "pass:$STORE_PASS" --key-pass "pass:$STORE_PASS" \
  --v1-signing-enabled true --v2-signing-enabled true --v3-signing-enabled true \
  --out "$OUT" "$BUILD/aligned.apk"

# apksigner 会附带生成 v4 签名辅助文件，不属于交付物
rm -f "$OUT.idsig"

"$BT/apksigner" verify --verbose "$OUT" > "$BUILD/verify.txt" 2>&1 || { cat "$BUILD/verify.txt"; fail "签名校验失败"; }

echo ""
echo "✅ 构建完成：$OUT"
ls -lh "$OUT"
echo ""
echo "APK 内容抽查："
unzip -l "$OUT" | grep -E 'classes\.dex|AndroidManifest\.xml|assets/(index\.html|app\.js|app\.css|fonts\.js|font-coverage\.js)|assets/fonts/' | head -24
echo ""
echo "签名信息："
grep -E 'Verified using|Signer #1 certificate' "$BUILD/verify.txt" | head -5
