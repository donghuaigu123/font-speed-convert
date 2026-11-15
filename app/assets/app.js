/* 字体速转 —— 排版渲染引擎
 * 纯前端实现：Canvas 智能排版 + 高清 PNG 导出。
 * 所有字体均离线内置，不联网。
 */
(function () {
  'use strict';

  // ---------------------------------------------------------------- 字体表
  // real: 真实开源字体；stylized: 基于真实字体的风格化排版（非真篆/隶字库）
  var BUILTIN = [
    { id: 'kai',     name: '楷书',   desc: '端正浑厚 · 颜体风',   family: 'FS-Kai',     cls: 'f-kai',     file: 'MaShanZheng.ttf',   real: true,  sample: '永', verticalDefault: false },
    { id: 'xing',    name: '行书',   desc: '流畅飘逸 · 羲之风',   family: 'FS-Xing',    cls: 'f-xing',    file: 'ZhiMangXing.ttf',   real: true,  sample: '永', verticalDefault: false },
    { id: 'cao',     name: '草书',   desc: '纵逸奔放 · 怀素风',   family: 'FS-Cao',     cls: 'f-cao',     file: 'LiuJianMaoCao.ttf', real: true,  sample: '永', verticalDefault: false },
    { id: 'xingkai', name: '行楷',   desc: '温润秀雅 · 龙藏体',   family: 'FS-XingKai', cls: 'f-xingkai', file: 'LongCang.ttf',      real: true,  sample: '永', verticalDefault: false },
    { id: 'weibei',  name: '魏碑',   desc: '古拙清丽 · 站酷小薇', family: 'FS-WeiBei',  cls: 'f-weibei',  file: 'ZCOOLXiaoWei.ttf',  real: true,  sample: '永', verticalDefault: false },
    { id: 'kuaile',  name: '灵动',   desc: '轻松活泼 · 站酷快乐', family: 'FS-KuaiLe',  cls: 'f-kuaile',  file: 'ZCOOLKuaiLe.ttf',   real: true,  sample: '永', verticalDefault: false },
    { id: 'song',    name: '宋体',   desc: '长篇正文 · 清晰耐读', family: 'serif',      cls: 'f-song',    file: null,                real: true,  sample: '永', verticalDefault: false, system: true },
    { id: 'hei',     name: '黑体',   desc: '现代简洁 · 系统字体', family: 'sans-serif', cls: 'f-hei',     file: null,                real: true,  sample: '永', verticalDefault: false, system: true },
    { id: 'lishu',   name: '隶意',   desc: '扁方波磔 · 风格化',   family: 'FS-WeiBei',  cls: 'f-weibei',  file: 'ZCOOLXiaoWei.ttf',  real: false, sample: '永', verticalDefault: false, transform: 'li' },
    { id: 'zhuan',   name: '篆意',   desc: '圆转竖排 · 风格化',   family: 'FS-Kai',     cls: 'f-kai',     file: 'MaShanZheng.ttf',   real: false, sample: '永', verticalDefault: true,  transform: 'zhuan' }
  ];

  var THEMES = {
    xuan:  { name: '宣纸', c1: '#f8f1dd', c2: '#eee0c0', ink: '#2b2622', sub: '#6b5c46', line: 'rgba(150,120,75,.20)', grid: 'rgba(160,125,70,.16)', dot: '#a83a2c' },
    bai:   { name: '素白', c1: '#ffffff', c2: '#f7f5ef', ink: '#24211e', sub: '#7a7268', line: 'rgba(120,110,95,.18)', grid: 'rgba(130,120,100,.13)', dot: '#a52f26' },
    fanggu:{ name: '仿古', c1: '#e9d6ae', c2: '#d6b984', ink: '#3b2b18', sub: '#6d5432', line: 'rgba(110,80,40,.24)', grid: 'rgba(110,80,40,.20)', dot: '#93301f' },
    mota:  { name: '墨拓', c1: '#2b2825', c2: '#1b1917', ink: '#eee3c8', sub: '#b8ab8d', line: 'rgba(230,215,180,.16)', grid: 'rgba(230,215,180,.10)', dot: '#c8564a' }
  };

  var NO_START = '，。！？；：、）】》」』”’,.!?;:%)]}〉》」』';
  var NO_END   = '（【《「『“‘([{〈《「『';

  // 由构建脚本生成：window.FONT_FILES = { "MaShanZheng.ttf": 1, ... }
  var AVAILABLE = window.FONT_FILES || {};

  var state = {
    font: null,
    paper: 'xuan',
    vertical: false,
    size: 0,             // 0 = 自动
    sign: '',
    seal: true,
    grid: true,
    title: false,
    titleText: '',
    pages: [],
    baseName: '字体速转',
    customFonts: []
  };

  // ---------------------------------------------------------------- 工具
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  var toastTimer = null;
  function toast(msg) {
    var t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2600);
    if (window.FontApp && FontApp.toast && msg.indexOf('已保存') === 0) {
      try { FontApp.toast(msg); } catch (e) {}
    }
  }
  function nextFrame() { return new Promise(function (r) { requestAnimationFrame(function () { setTimeout(r, 0); }); }); }
  function chunk(arr, n) {
    var out = [];
    for (var i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
    return out;
  }
  function hash(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return Math.abs(h).toString(36);
  }
  function cleanText(raw) {
    return (raw || '').replace(/\r\n?/g, '\n').replace(/\t/g, '  ').replace(/[ \u3000]+\n/g, '\n').trim();
  }
  function autoSize(len) {
    if (len <= 12) return 118;
    if (len <= 30) return 100;
    if (len <= 70) return 84;
    if (len <= 160) return 70;
    if (len <= 400) return 58;
    return 50;
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // ---------------------------------------------------------------- 字体就绪
  async function ensureFont(family, text) {
    if (!family || family === 'serif' || family === 'sans-serif' || family === 'monospace') return family;
    try {
      if (document.fonts && document.fonts.load) {
        await document.fonts.load('72px "' + family + '"', (text || '').slice(0, 3000) + '字体速转永和风月山水');
        await document.fonts.ready;
        if (document.fonts.check('72px "' + family + '"')) return '"' + family + '"';
      }
    } catch (e) {}
    // 回退：给一点加载时间后仍使用原 family（WebView 会在绘制时回退到系统字体）
    await new Promise(function (r) { setTimeout(r, 350); });
    return '"' + family + '"';
  }

  // ---------------------------------------------------------------- 文本分行
  function wrapHorizontal(m, text, maxW) {
    var lines = [];
    var paras = text.split('\n');
    for (var p = 0; p < paras.length; p++) {
      var para = paras[p];
      if (!para) { lines.push(''); continue; }
      var cur = '';
      for (var i = 0; i < para.length; i++) {
        var ch = para[i];
        var test = cur + ch;
        if (m.measureText(test).width <= maxW || cur === '') {
          cur = test;
        } else if (NO_START.indexOf(ch) >= 0) {
          cur = test;                      // 避头尾：标点挤进行末
        } else {
          lines.push(cur);
          cur = ch;
        }
      }
      if (cur) lines.push(cur);
    }
    return lines.length ? lines : [''];
  }

  function wrapVertical(m, text, maxChars) {
    var cols = [];
    var paras = text.split('\n');
    for (var p = 0; p < paras.length; p++) {
      var para = paras[p];
      if (!para) { cols.push([]); continue; }
      var col = [];
      for (var i = 0; i < para.length; i++) {
        if (col.length >= maxChars) { cols.push(col); col = []; }
        col.push(para[i]);
      }
      if (col.length) cols.push(col);
    }
    return cols.length ? cols : [[]];
  }

  // ---------------------------------------------------------------- 纸张
  function drawPaper(ctx, W, H, th) {
    var g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, th.c1); g.addColorStop(1, th.c2);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // 稳定的纸纹噪点（固定种子，保证多页纹理一致）
    var seed = 20241115, rnd = function () {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    var count = Math.min(9000, Math.floor(W * H / 700));
    for (var i = 0; i < count; i++) {
      ctx.fillStyle = 'rgba(120,95,60,' + (rnd() * 0.055).toFixed(3) + ')';
      ctx.fillRect(rnd() * W, rnd() * H, rnd() * 2.2 + 0.4, rnd() * 2.2 + 0.4);
    }
    // 淡纤维
    ctx.strokeStyle = 'rgba(130,105,70,.045)'; ctx.lineWidth = 1;
    for (var k = 0; k < 60; k++) {
      var y = rnd() * H, x = rnd() * W, len = 40 + rnd() * 160;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y + (rnd() - .5) * 8); ctx.stroke();
    }
    // 四周内框
    ctx.strokeStyle = th.line; ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, W - 60, H - 60);
    ctx.lineWidth = 1; ctx.strokeRect(38, 38, W - 76, H - 76);
  }

  // ---------------------------------------------------------------- 印章
  function drawSeal(ctx, x, y, size, family, th) {
    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = th.dot;
    roundRect(ctx, x, y, size, size, size * 0.10);
    ctx.fill();
    // 内圈细线
    ctx.strokeStyle = 'rgba(255,245,225,.55)'; ctx.lineWidth = Math.max(2, size * 0.018);
    roundRect(ctx, x + size * .07, y + size * .07, size * .86, size * .86, size * .07);
    ctx.stroke();
    // 阴文 2x2
    ctx.fillStyle = th.c1;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = (size * 0.38) + 'px ' + family;
    var chars = ['字', '体', '速', '转'];
    var cell = size * 0.44;
    for (var i = 0; i < 4; i++) {
      var cx = x + size * .28 + (i % 2) * cell;
      var cy = y + size * .28 + Math.floor(i / 2) * cell;
      ctx.fillText(chars[i], cx, cy);
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------- 单字绘制
  function drawGlyph(ctx, ch, cx, cy, transform) {
    ctx.save();
    if (transform === 'li') {
      ctx.translate(cx, cy); ctx.scale(1.12, 0.82); ctx.fillText(ch, 0, 0);
    } else if (transform === 'zhuan') {
      ctx.translate(cx, cy); ctx.scale(0.90, 1.16); ctx.fillText(ch, 0, 0);
    } else {
      ctx.fillText(ch, cx, cy);
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------- 绘制一页
  function drawPage(part, pageIndex, pageCount, o, fixedH) {
    var W = 1080;
    var th = THEMES[o.paper];
    var family = o.familyCss;
    var fs = o.fontSize;
    var padX = 104, padTop = 128, padBottom = 120;
    var contentW = W - padX * 2;
    var titleH = o.title && o.titleText ? fs * 1.9 : 0;
    var footerH = fs * 2.6;
    var lineH = fs * (o.vertical ? 1.16 : 1.78);
    var letterSpacing = fs * (o.transform === 'li' ? 0.16 : 0.055);
    var colW = fs * (o.vertical ? 1.62 : 0);

    var bodyH = o.vertical ? o.vertBodyH : part.length * lineH;
    var H = fixedH || Math.max(1000, Math.ceil(padTop + titleH + bodyH + footerH + padBottom));

    var cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    var ctx = cv.getContext('2d');
    drawPaper(ctx, W, H, th);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = th.ink;

    // 标题
    var top = padTop;
    if (titleH) {
      ctx.save();
      ctx.font = (fs * 1.22) + 'px ' + family;
      ctx.fillStyle = th.ink;
      var tChars = Array.from(o.titleText);
      var tw = 0;
      tChars.forEach(function (c) { tw += ctx.measureText(c).width + fs * 0.16; });
      var tx = o.vertical ? W - padX - tw / 2 - fs : (W - tw) / 2;
      tChars.forEach(function (c) {
        var w = ctx.measureText(c).width + fs * 0.16;
        ctx.fillText(c, tx + w / 2, top + fs * 0.7);
        tx += w;
      });
      ctx.restore();
      top += titleH;
    }

    // 界格
    if (o.grid) {
      ctx.save();
      ctx.strokeStyle = th.grid; ctx.lineWidth = 1.5;
      if (o.vertical) {
        for (var c = 0; c <= part.length; c++) {
          var gx = W - padX - c * colW;
          if (gx < padX - 1) break;
          ctx.beginPath(); ctx.moveTo(gx, top); ctx.lineTo(gx, top + o.vertBodyH); ctx.stroke();
        }
      } else {
        for (var l = 0; l <= part.length; l++) {
          var gy = top + l * lineH;
          ctx.beginPath(); ctx.moveTo(padX, gy); ctx.lineTo(W - padX, gy); ctx.stroke();
        }
      }
      ctx.restore();
    }

    // 正文
    ctx.font = fs + 'px ' + family;
    ctx.fillStyle = th.ink;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

    if (!o.vertical) {
      for (var i = 0; i < part.length; i++) {
        var line = part[i];
        var x = padX;
        var y = top + lineH * (i + 0.5);
        for (var j = 0; j < line.length; j++) {
          var ch = line[j];
          var w = ctx.measureText(ch).width + letterSpacing;
          drawGlyph(ctx, ch, x + w / 2, y, o.transform);
          x += w;
        }
      }
    } else {
      // 竖排：列自右向左
      for (var ci = 0; ci < part.length; ci++) {
        var col = part[ci];
        var cx = W - padX - colW * (ci + 0.5);
        for (var ri = 0; ri < col.length; ri++) {
          var cch = col[ri];
          var cy = top + fs * 0.62 + ri * lineH;
          // 连续 ASCII 竖排时旋转 90° 更自然
          if (/[A-Za-z0-9]/.test(cch)) {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(Math.PI / 2);
            ctx.fillText(cch, 0, 0);
            ctx.restore();
          } else {
            drawGlyph(ctx, cch, cx, cy, o.transform);
          }
        }
      }
    }

    // 落款 + 印章
    var sealSize = fs * 1.28;
    var signY = H - padBottom - footerH + fs * 0.9;
    ctx.save();
    ctx.fillStyle = th.sub;
    ctx.font = (fs * 0.42) + 'px ' + family;
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    var signText = (o.sign || '') + (pageCount > 1 ? '  ·  ' + (pageIndex + 1) + '/' + pageCount : '');
    if (signText.trim()) {
      ctx.fillText(signText, W - padX - (o.seal ? sealSize + 24 : 0), signY);
    }
    ctx.restore();
    if (o.seal) {
      drawSeal(ctx, W - padX - sealSize, signY - sealSize * 0.22, sealSize, family, th);
    }

    return cv.toDataURL('image/png');
  }

  // ---------------------------------------------------------------- 渲染全部页
  function renderPages(text, o) {
    var m = document.createElement('canvas').getContext('2d');
    m.font = o.fontSize + 'px ' + o.familyCss;

    var W = 1080, padX = 104, padTop = 128, padBottom = 120;
    var contentW = W - padX * 2;
    var fs = o.fontSize;
    var titleH = o.title && o.titleText ? fs * 1.9 : 0;
    var footerH = fs * 2.6;
    var MAX_H = 3600;

    if (o.vertical) {
      // 竖排采用接近传统条幅的比例（约 1:1.7），避免短句被拉成细长条
      var VH = 1800;
      var lineH = fs * 1.16;
      var avail = Math.max(600, VH - padTop - padBottom - titleH - footerH);
      var maxChars = Math.max(4, Math.floor(avail / lineH));
      var cols = wrapVertical(m, text, maxChars);
      var colW = fs * 1.62;
      var colsPerPage = Math.max(1, Math.floor(contentW / colW));
      var groups = chunk(cols, colsPerPage);
      var actualMax = 1;
      for (var gi = 0; gi < cols.length; gi++) {
        if (cols[gi].length > actualMax) actualMax = cols[gi].length;
      }
      var fullBody = Math.min(avail, Math.ceil(maxChars * lineH));
      // 单页按实际字数收紧；多页统一使用满页高度，保证一套作品尺寸一致
      var fixedH = groups.length > 1
        ? Math.ceil(padTop + titleH + fullBody + footerH + padBottom) : 0;
      o.vertBodyH = fixedH ? fullBody : Math.min(avail, Math.ceil(actualMax * lineH));
      return groups.map(function (g, i) { return drawPage(g, i, groups.length, o, fixedH); });
    }

    var lh = fs * 1.78;
    var lines = wrapHorizontal(m, text, contentW);
    var maxLines = Math.max(1, Math.floor((MAX_H - padTop - padBottom - titleH - footerH) / lh));
    var pages = chunk(lines, maxLines);
    var fullH = pages.length > 1
      ? Math.ceil(padTop + titleH + maxLines * lh + footerH + padBottom) : 0;
    return pages.map(function (p, i) { return drawPage(p, i, pages.length, o, fullH); });
  }

  // ---------------------------------------------------------------- UI 渲染
  function fontAvailable(f) {
    if (!f.file) return true;
    if (Object.keys(AVAILABLE).length === 0) return true;  // 浏览器直接打开时宽松处理
    return !!AVAILABLE[f.file];
  }

  function renderFontGrid() {
    var grid = $('fontGrid');
    grid.innerHTML = '';
    var all = BUILTIN.concat(state.customFonts);
    all.forEach(function (f) {
      var ok = fontAvailable(f);
      var card = el('div', 'font-card' + (state.font && state.font.id === f.id ? ' on' : '') + (ok ? '' : ' off') + (f.user ? ' user' : ''));
      var badge = f.user ? '自有' : (f.real ? '开源' : '风格');
      card.innerHTML =
        '<span class="font-badge">' + badge + '</span>' +
        '<div class="font-sample ' + (f.cls || '') + '" style="' + (f.inline || '') + '">' +
          (f.sample || '永') + '</div>' +
        '<div class="font-name">' + f.name + '</div>' +
        '<div class="font-desc">' + f.desc + '</div>';
      if (!ok) {
        card.addEventListener('click', function () { toast('该字体文件缺失，可点右上角导入自有字体'); });
      } else {
        card.addEventListener('click', function () { selectFont(f); });
      }
      grid.appendChild(card);
    });
    var missing = BUILTIN.filter(function (f) { return !fontAvailable(f); }).length;
    $('fontNotice').textContent = missing
      ? '有 ' + missing + ' 款字体在当前安装包中不可用，已置灰。'
      : '共 ' + all.length + ' 款可选。带「风格」标记的是版式模拟效果，非真篆/隶字库；点右上角「＋ 我的字体」可导入你拥有授权的字体。';
  }

  function selectFont(f) {
    state.font = f;
    if (f.verticalDefault != null) {
      state.vertical = !!f.verticalDefault;
      renderChips();
    }
    renderFontGrid();
    try { localStorage.setItem('fs_font', f.id); } catch (e) {}
  }

  function renderChips() {
    var pc = $('paperChips'); pc.innerHTML = '';
    Object.keys(THEMES).forEach(function (k) {
      var t = THEMES[k];
      var b = el('button', 'chip' + (state.paper === k ? ' on' : ''),
        '<span class="dot" style="background:' + t.c1 + '"></span>' + t.name);
      b.type = 'button';
      b.onclick = function () { state.paper = k; renderChips(); try { localStorage.setItem('fs_paper', k); } catch (e) {} };
      pc.appendChild(b);
    });
    var lc = $('layoutChips'); lc.innerHTML = '';
    [['横排', false], ['竖排（右起）', true]].forEach(function (p) {
      var b = el('button', 'chip' + (state.vertical === p[1] ? ' on' : ''), p[0]);
      b.type = 'button';
      b.onclick = function () { state.vertical = p[1]; renderChips(); };
      lc.appendChild(b);
    });
  }

  // ---------------------------------------------------------------- 结果层
  function showResult() { $('resultLayer').classList.remove('hidden'); }
  function hideResult() { $('resultLayer').classList.add('hidden'); }
  window.onAndroidBack = function () {
    if (!$('resultLayer').classList.contains('hidden')) { hideResult(); return true; }
    return false;
  };

  function showPages(pages) {
    var box = $('resultScroll');
    box.innerHTML = '';
    pages.forEach(function (url, i) {
      if (pages.length > 1) box.appendChild(el('div', 'page-label', '第 ' + (i + 1) + ' 页 / 共 ' + pages.length + ' 页'));
      var img = el('img');
      img.src = url;
      img.setAttribute('alt', '书法作品第 ' + (i + 1) + ' 页');
      box.appendChild(img);
    });
    $('resultInfo').textContent = '共 ' + pages.length + ' 张 · 1080px 高清';
    $('saveHint').textContent = '点下方按钮，全部图片会一次性保存到系统相册的「字体速转」文件夹。';
    $('btnSaveAll').disabled = false;
  }

  async function generate() {
    var text = cleanText($('textInput').value);
    if (!text) { toast('请先输入或粘贴文字'); return; }
    if (!state.font) state.font = BUILTIN[0];
    if (text.length > 20000) { toast('文字太长了，建议分成几段生成'); return; }

    state.baseName = text.replace(/[\n\r]/g, '').slice(0, 8) || '字体速转';
    var size = state.size > 0 ? Math.round(40 + state.size * 1.0) : autoSize(text.length);
    var o = {
      familyCss: await ensureFont(state.font.family, text),
      fontSize: size,
      paper: state.paper,
      vertical: state.vertical,
      transform: state.font.transform || null,
      sign: $('signInput').value.trim(),
      seal: $('optSeal').checked,
      grid: $('optGrid').checked,
      title: $('optTitle').checked,
      titleText: $('titleInput').value.trim()
    };

    showResult();
    $('btnSaveAll').disabled = true;
    $('resultScroll').innerHTML = '';
    $('resultInfo').textContent = '正在排版…';
    await nextFrame();

    try {
      state.pages = renderPages(text, o);
      if (!state.pages.length) throw new Error('未生成任何页面');
      showPages(state.pages);
    } catch (e) {
      $('resultInfo').textContent = '生成失败';
      toast('生成失败：' + e.message);
      console.error(e);
    }
  }

  // ---------------------------------------------------------------- 保存
  function saveAll() {
    var pages = state.pages;
    if (!pages || !pages.length) { toast('请先生成图片'); return; }
    var hasBridge = !!(window.FontApp && FontApp.beginImage && FontApp.appendImage && FontApp.finishImage);
    var ok = 0, fail = 0, last = '';
    var CH = 512 * 1024;   // 4 的倍数，保证每段 base64 可独立解码

    pages.forEach(function (url, i) {
      var b64 = url.substring(url.indexOf(',') + 1);
      var name = pages.length > 1 ? state.baseName + '_' + (i + 1) : state.baseName;
      if (hasBridge) {
        try {
          FontApp.beginImage(name);
          var good = true;
          for (var j = 0; j < b64.length; j += CH) {
            if (!FontApp.appendImage(b64.substring(j, j + CH))) { good = false; break; }
          }
          if (!good) { fail++; return; }
          var r = FontApp.finishImage();
          if (typeof r === 'string' && r.indexOf('ERR') === 0) { fail++; last = r; }
          else { ok++; last = r || '相册'; }
        } catch (e) { fail++; }
      } else {
        // 浏览器预览时的降级通道
        var a = document.createElement('a');
        a.href = url; a.download = name + '.png';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        ok++;
      }
    });

    if (fail) toast('已保存 ' + ok + ' 张，失败 ' + fail + ' 张。' + (last || ''));
    else toast('已保存 ' + ok + ' 张图片：' + last);
    $('saveHint').textContent = last ? ('保存位置：' + last) : '';
  }

  // ---------------------------------------------------------------- 自定义字体
  function registerUserFont(filename) {
    var fam = 'FS-U-' + hash(filename);
    var st = document.createElement('style');
    st.textContent = '@font-face{font-family:"' + fam + '";src:url("userfonts/' + filename + '") format("truetype");font-display:block}';
    document.head.appendChild(st);
    var f = {
      id: 'user_' + hash(filename),
      name: filename.replace(/^\d+_/, '').replace(/\.(ttf|otf|woff2?)$/i, '').slice(0, 6) || '自有',
      desc: '我导入的字体',
      family: fam,
      familyCss: '"' + fam + '"',
      cls: '',
      file: null,
      real: true,
      user: true,
      sample: '永'
    };
    f.inline = 'font-family:"' + fam + '"';
    state.customFonts.push(f);
    renderFontGrid();
    selectFont(f);
    toast('字体已导入，可以直接用了');
  }

  window.onFontImported = function (filename) { registerUserFont(filename); };

  function loadUserFonts() {
    if (!window.FontApp || !FontApp.listCustomFonts) return;
    try {
      var arr = JSON.parse(FontApp.listCustomFonts() || '[]');
      arr.forEach(registerUserFontSilent);
      if (arr.length) renderFontGrid();
    } catch (e) {}
  }
  function registerUserFontSilent(filename) {
    var fam = 'FS-U-' + hash(filename);
    var st = document.createElement('style');
    st.textContent = '@font-face{font-family:"' + fam + '";src:url("userfonts/' + filename + '") format("truetype")}';
    document.head.appendChild(st);
    state.customFonts.push({
      id: 'user_' + hash(filename),
      name: filename.replace(/^\d+_/, '').replace(/\.(ttf|otf|woff2?)$/i, '').slice(0, 6) || '自有',
      desc: '我导入的字体', family: fam, familyCss: '"' + fam + '"',
      cls: '', file: null, real: true, user: true, sample: '永',
      inline: 'font-family:"' + fam + '"'
    });
  }

  // ---------------------------------------------------------------- 初始化
  var SAMPLE = '春江潮水连海平，海上明月共潮生。\n滟滟随波千万里，何处春江无月明！\n\n江流宛转绕芳甸，月照花林皆似霰；\n空里流霜不觉飞，汀上白沙看不见。';

  function init() {
    // 恢复上次选择
    try {
      var pf = localStorage.getItem('fs_font');
      if (pf) state.font = BUILTIN.filter(function (f) { return f.id === pf; })[0] || null;
      var pp = localStorage.getItem('fs_paper');
      if (pp && THEMES[pp]) state.paper = pp;
    } catch (e) {}
    if (!state.font) state.font = BUILTIN.filter(fontAvailable)[0] || BUILTIN[0];

    renderChips();
    renderFontGrid();
    loadUserFonts();

    $('textInput').addEventListener('input', function () {
      $('charCount').textContent = cleanText(this.value).length + ' 字';
    });
    $('btnSample').onclick = function () {
      $('textInput').value = SAMPLE;
      $('charCount').textContent = cleanText(SAMPLE).length + ' 字';
      toast('已填入示例，可直接生成');
    };
    $('btnClear').onclick = function () {
      $('textInput').value = ''; $('charCount').textContent = '0 字';
    };
    $('btnToggleAdv').onclick = function () {
      var p = $('advPanel');
      var hidden = p.classList.toggle('hidden');
      this.textContent = hidden ? '高级设置 ▾' : '收起 ▴';
    };
    $('optTitle').onchange = function () {
      $('titleField').hidden = !this.checked;
    };
    $('sizeRange').oninput = function () {
      state.size = parseInt(this.value, 10) || 0;
      $('sizeHint').textContent = state.size === 0 ? '自动' : (40 + state.size) + ' px';
    };
    $('btnImport').onclick = function () {
      if (window.FontApp && FontApp.pickFont) FontApp.pickFont();
      else toast('导入字体需在安装 APK 后使用');
    };
    $('btnGenerate').onclick = generate;
    $('btnRegen').onclick = generate;
    $('btnBack').onclick = hideResult;
    $('btnSaveAll').onclick = saveAll;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
