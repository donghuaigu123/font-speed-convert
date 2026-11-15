package com.zitisuzhuan.app;

import android.Manifest;
import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.provider.OpenableColumns;
import android.util.Base64;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * 字体速转 —— 纯离线 WebView 壳。
 *
 * 设计要点：
 * 1. 所有 assets（含字体）通过 shouldInterceptRequest 返回，并附带 CORS 头，
 *    否则 file:// 下的 @font-face 会被 Chromium 判定为跨域，
 *    进而污染 canvas，导致 toDataURL 无法导出图片。
 * 2. 图片以 base64 分块回传，规避 JavascriptInterface 单次传大字符串的限制。
 * 3. 支持导入用户自有 TTF/OTF 字体，用于扩展隶书、篆书或名家字体。
 */
public class MainActivity extends Activity {

    private static final int REQ_PICK_FONT = 1001;
    private static final int REQ_STORAGE = 1002;

    private WebView web;
    private final ByteArrayOutputStream imageBuffer = new ByteArrayOutputStream();
    private String pendingName = "字体速转";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            getWindow().setStatusBarColor(0xFF8C2F26);
        }

        web = new WebView(this);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setAllowFileAccessFromFileURLs(true);
        s.setAllowUniversalAccessFromFileURLs(true);
        s.setDefaultTextEncodingName("UTF-8");
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(false);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setMediaPlaybackRequiresUserGesture(true);
        web.setBackgroundColor(0xFFF6F0E4);
        web.addJavascriptInterface(new Bridge(), "FontApp");

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest req) {
                WebResourceResponse r = assetResponse(req.getUrl());
                return r != null ? r : super.shouldInterceptRequest(v, req);
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView v, String url) {
                WebResourceResponse r = assetResponse(Uri.parse(url));
                return r != null ? r : super.shouldInterceptRequest(v, url);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest req) {
                // 应用完全离线，屏蔽一切外部跳转
                return true;
            }
        });

        // 备用下载通道：<a download href="data:image/png;base64,...">
        web.setDownloadListener((url, userAgent, contentDisposition, mimeType, length) -> {
            if (url != null && url.startsWith("data:image")) {
                saveDataUrl(url, "字体速转");
            }
        });

        web.loadUrl("file:///android_asset/index.html");
    }

    /** 拦截 file:///android_asset/ 请求，统一补 CORS 头。 */
    private WebResourceResponse assetResponse(Uri uri) {
        if (uri == null || !"file".equals(uri.getScheme())) return null;
        String path = uri.getPath();
        if (path == null || !path.startsWith("/android_asset/")) return null;
        String rel = path.substring("/android_asset/".length());
        int q = rel.indexOf('?');
        if (q >= 0) rel = rel.substring(0, q);
        if (rel.isEmpty()) rel = "index.html";

        Map<String, String> headers = new HashMap<>();
        headers.put("Access-Control-Allow-Origin", "*");
        headers.put("Access-Control-Allow-Methods", "GET, OPTIONS");
        headers.put("Access-Control-Allow-Headers", "*");
        headers.put("Cache-Control", "no-store");

        try {
            InputStream is;
            if (rel.startsWith("userfonts/")) {
                File dir = new File(getFilesDir(), "customfonts");
                File f = new File(dir, new File(rel).getName());
                is = new FileInputStream(f);
            } else {
                is = getAssets().open(rel);
            }
            return new WebResourceResponse(mimeOf(rel), "UTF-8", 200, "OK", headers, is);
        } catch (Exception e) {
            byte[] body = ("asset not found: " + rel).getBytes();
            return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found",
                    headers, new ByteArrayInputStream(body));
        }
    }

    private static String mimeOf(String p) {
        String l = p.toLowerCase(Locale.US);
        if (l.endsWith(".ttf")) return "font/ttf";
        if (l.endsWith(".otf")) return "font/otf";
        if (l.endsWith(".woff2")) return "font/woff2";
        if (l.endsWith(".woff")) return "font/woff";
        if (l.endsWith(".html") || l.endsWith(".htm")) return "text/html";
        if (l.endsWith(".css")) return "text/css";
        if (l.endsWith(".js")) return "application/javascript";
        if (l.endsWith(".json")) return "application/json";
        if (l.endsWith(".png")) return "image/png";
        if (l.endsWith(".jpg") || l.endsWith(".jpeg")) return "image/jpeg";
        if (l.endsWith(".svg")) return "image/svg+xml";
        return "application/octet-stream";
    }

    private final class Bridge {

        /** 开始接收一张图片（分块，避免单次传超大字符串）。 */
        @JavascriptInterface
        public void beginImage(String name) {
            synchronized (imageBuffer) {
                imageBuffer.reset();
                pendingName = safeName(name);
            }
        }

        @JavascriptInterface
        public boolean appendImage(String chunk) {
            try {
                byte[] b = Base64.decode(chunk, Base64.DEFAULT);
                synchronized (imageBuffer) {
                    imageBuffer.write(b);
                }
                return true;
            } catch (Exception e) {
                return false;
            }
        }

        /** 落盘到系统相册，返回可读的保存位置。 */
        @JavascriptInterface
        public String finishImage() {
            byte[] data;
            String name;
            synchronized (imageBuffer) {
                data = imageBuffer.toByteArray();
                name = pendingName;
            }
            return saveBytes(data, name);
        }

        @JavascriptInterface
        public void toast(String msg) {
            runOnUiThread(() -> Toast.makeText(MainActivity.this, msg, Toast.LENGTH_LONG).show());
        }

        @JavascriptInterface
        public String version() {
            return "1.0";
        }

        /** 打开系统文件选择器，导入用户自有字体。 */
        @JavascriptInterface
        public void pickFont() {
            runOnUiThread(() -> {
                try {
                    Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                    i.addCategory(Intent.CATEGORY_OPENABLE);
                    i.setType("*/*");
                    i.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{
                            "font/ttf", "font/otf", "application/x-font-ttf",
                            "application/x-font-otf", "application/octet-stream"
                    });
                    i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    i.addFlags(Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
                    startActivityForResult(Intent.createChooser(i, "选择字体文件 TTF / OTF"), REQ_PICK_FONT);
                } catch (Exception e) {
                    toast("无法打开文件选择器：" + e.getMessage());
                }
            });
        }

        /** 列出已导入的自定义字体（JSON 数组）。 */
        @JavascriptInterface
        public String listCustomFonts() {
            File dir = new File(getFilesDir(), "customfonts");
            File[] fs = dir.listFiles();
            StringBuilder sb = new StringBuilder("[");
            if (fs != null) {
                boolean first = true;
                for (File f : fs) {
                    String n = f.getName();
                    if (!n.toLowerCase(Locale.US).matches(".*\\.(ttf|otf|woff2?)$")) continue;
                    if (!first) sb.append(",");
                    first = false;
                    sb.append("\"").append(n.replace("\"", "\\\"")).append("\"");
                }
            }
            return sb.append("]").toString();
        }

        @JavascriptInterface
        public void removeCustomFont(String name) {
            File f = new File(new File(getFilesDir(), "customfonts"), new File(name).getName());
            if (f.exists()) f.delete();
        }
    }

    @Override
    protected void onActivityResult(int req, int result, Intent data) {
        super.onActivityResult(req, result, data);
        if (req != REQ_PICK_FONT || result != RESULT_OK || data == null || data.getData() == null) return;
        Uri uri = data.getData();
        try {
            String display = queryDisplayName(uri);
            if (display == null) display = "custom.ttf";
            String safe = display.replaceAll("[^a-zA-Z0-9._-]", "_");
            if (!safe.toLowerCase(Locale.US).matches(".*\\.(ttf|otf|woff2?)$")) safe += ".ttf";
            File dir = new File(getFilesDir(), "customfonts");
            if (!dir.exists()) dir.mkdirs();
            File out = new File(dir, System.currentTimeMillis() + "_" + safe);
            try (InputStream in = getContentResolver().openInputStream(uri);
                 OutputStream os = new FileOutputStream(out)) {
                byte[] buf = new byte[16384];
                int n;
                while ((n = in.read(buf)) > 0) os.write(buf, 0, n);
            }
            if (out.length() < 1024) {
                out.delete();
                toast("文件太小，可能不是有效字体");
                return;
            }
            final String fn = out.getName();
            runOnUiThread(() -> web.evaluateJavascript(
                    "window.onFontImported && window.onFontImported(" + jsString(fn) + ")", null));
        } catch (Exception e) {
            toast("导入失败：" + e.getMessage());
        }
    }

    private String queryDisplayName(Uri uri) {
        Cursor c = null;
        try {
            c = getContentResolver().query(uri, null, null, null, null);
            if (c != null && c.moveToFirst()) {
                int idx = c.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                if (idx >= 0) return c.getString(idx);
            }
        } catch (Exception ignored) {
        } finally {
            if (c != null) c.close();
        }
        return null;
    }

    private void toast(String msg) {
        runOnUiThread(() -> Toast.makeText(MainActivity.this, msg, Toast.LENGTH_LONG).show());
    }

    private void saveDataUrl(String url, String name) {
        int comma = url.indexOf(',');
        if (comma < 0) return;
        try {
            byte[] b = Base64.decode(url.substring(comma + 1), Base64.DEFAULT);
            String p = saveBytes(b, name);
            toast(p.startsWith("ERR") ? p : "已保存：" + p);
        } catch (Exception e) {
            toast("下载失败：" + e.getMessage());
        }
    }

    private String saveBytes(byte[] data, String name) {
        if (data == null || data.length == 0) return "ERR:图片数据为空";
        String base = safeName(name);
        String stamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.CHINA).format(new Date());
        String fname = base + "_" + stamp + ".png";
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                ContentValues cv = new ContentValues();
                cv.put(MediaStore.Images.Media.DISPLAY_NAME, fname);
                cv.put(MediaStore.Images.Media.MIME_TYPE, "image/png");
                cv.put(MediaStore.Images.Media.RELATIVE_PATH,
                        Environment.DIRECTORY_PICTURES + "/字体速转");
                cv.put(MediaStore.Images.Media.IS_PENDING, 1);
                Uri uri = getContentResolver().insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, cv);
                if (uri == null) return "ERR:无法创建相册条目";
                OutputStream os = getContentResolver().openOutputStream(uri);
                if (os == null) return "ERR:无法写入相册";
                os.write(data);
                os.flush();
                os.close();
                ContentValues done = new ContentValues();
                done.put(MediaStore.Images.Media.IS_PENDING, 0);
                getContentResolver().update(uri, done, null, null);
                return "相册 / Pictures / 字体速转 / " + fname;
            } else {
                if (checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE)
                        != PackageManager.PERMISSION_GRANTED) {
                    requestPermissions(new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE}, REQ_STORAGE);
                    return "ERR:已申请存储权限，请再点一次保存";
                }
                File dir = new File(
                        Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES),
                        "字体速转");
                if (!dir.exists() && !dir.mkdirs()) return "ERR:无法创建目录";
                File f = new File(dir, fname);
                FileOutputStream fos = new FileOutputStream(f);
                fos.write(data);
                fos.flush();
                fos.close();
                MediaScannerConnection.scanFile(this,
                        new String[]{f.getAbsolutePath()}, new String[]{"image/png"}, null);
                return f.getAbsolutePath();
            }
        } catch (Exception e) {
            return "ERR:" + e.getMessage();
        }
    }

    private static String safeName(String s) {
        if (s == null || s.trim().isEmpty()) return "字体速转";
        String t = s.replaceAll("[\\\\/:*?\"<>|\\r\\n\\t]", "_").trim();
        if (t.length() > 24) t = t.substring(0, 24);
        return t;
    }

    private static String jsString(String s) {
        return "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"")
                .replace("\n", "\\n").replace("\r", "") + "\"";
    }

    @Override
    public void onBackPressed() {
        web.evaluateJavascript(
                "(function(){try{return window.onAndroidBack&&window.onAndroidBack()?'true':'false'}catch(e){return 'false'}})()",
                value -> {
                    if (value == null || !value.contains("true")) {
                        runOnUiThread(MainActivity.this::finish);
                    }
                });
    }
}
