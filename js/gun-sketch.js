/*
 * 甲式／乙式獵槍「立體素描」互動圖（p5.js）
 *
 * 每把槍拆成幾個外觀部位（閉合多邊形，座標依實物照片描出，單位是原照片素）。
 * 每個部位：沿主軸做圓柱狀明暗漸層 → 暗面鉛筆排線 → 兩次微抖的素描外框 → 投影。
 * 互動：
 *   - 滑鼠移動：各部位依深度做視差位移（2.5D）
 *   - 點選部位／上方按鈕：選取並在下方說明框比較兩把槍
 *   - 「分離」：把外觀部位沿各自方向拉開（示意，不代表實際拆解）
 *   - 「原照」：把原始照片疊在下面，核對描線位置
 * 線稿只畫照片看得到的外觀；被手遮住的區域以斜線標「手部遮擋」。
 */
(function () {
  const NAMES = { barrel: '槍管', receiver: '槍身', guard: '扳機護圈', stock: '槍托' };

  // 部位幾何（原照片座標）
  const GUNS = {
    A: {
      w: 800, h: 450, img: 'assets/A_titv_0009.jpg', view: [20, 92, 690, 278],
      parts: [
        { key: 'stock', depth: -0.6, off: [-60, 14], tone: 0.62, flat: false,
          poly: [[67,240],[120,221],[170,206],[205,197],[226,188],[232,195],[236,215],[240,237],[245,257],[212,266],[185,270],[160,265],[120,258],[82,250]],
          hatch: [[90,247],[100,236],[142,227],[140,245],[105,252]] },
        { key: 'forend', depth: 0.3, off: [40, 22], tone: 0.6, flat: false,
          poly: [[337,190],[480,180],[492,183],[498,193],[495,204],[470,216],[440,228],[400,238],[372,244],[340,248]],
          hatch: [[368,192],[478,183],[480,200],[420,206],[368,206]] },
        { key: 'barrel', depth: 0.7, off: [75, -30], tone: 0.42, cyl: true,
          poly: [[340,176],[648,159],[651,170],[495,184],[480,180],[337,190]] },
        { key: 'barrel', depth: 0.7, off: [75, -30], tone: 0.38, cyl: true,
          poly: [[495,184],[648,169],[650,182],[497,200],[498,193],[492,183]] },
        { key: 'barrel', depth: 0.7, off: [75, -30], tone: 0.3, cyl: true,
          poly: [[345,171],[645,154],[648,159],[345,176]] },
        { key: 'receiver', depth: 0, off: [0, 0], tone: 0.34, cyl: false,
          poly: [[232,195],[229,186],[242,178],[345,176],[340,191],[340,250],[300,253],[245,257],[240,237],[236,215]] },
        { key: 'receiver', depth: 0, off: [0, 0], tone: 0.3, cyl: false,
          poly: [[242,170],[345,166],[345,175],[242,178]] },
        { key: 'guard', depth: 0.9, off: [0, 60], tone: 0.3, cyl: false,
          poly: [[138,292],[146,305],[160,312],[180,313],[196,308],[206,296],[210,282],[211,268],[202,268],[202,282],[198,295],[186,304],[170,305],[155,299]] },
      ],
      muzzles: [[[649,164],5,4.5],[[650,176],5,5.5]],
      occluders: [
        { label: '手部遮擋', at: [392, 230], poly: [[372,200],[395,193],[420,192],[445,197],[458,208],[462,225],[440,240],[400,255],[372,262],[352,250],[356,226]] },
        { label: '手部遮擋', at: [40, 300], poly: [[0,212],[50,225],[90,248],[128,262],[146,274],[134,292],[110,305],[60,318],[0,330]] },
      ],
      arrows: { barrel: [[585,163],[625,124]], receiver: [[290,222],[300,120]], guard: [[208,285],[300,338]], stock: [[160,238],[100,150]] },
    },
    B: {
      w: 800, h: 600, img: 'assets/B_cna_UB114001.jpg', view: [0, 110, 800, 430],
      parts: [
        { key: 'stock', depth: -0.6, off: [-55, 25], tone: 0.66, flat: true,
          poly: [[0,178],[150,188],[300,199],[440,212],[460,222],[487,210],[530,202],[553,204],[545,222],[530,247],[522,270],[523,300],[520,322],[523,330],[518,341],[500,347],[475,346],[458,337],[455,324],[440,330],[300,410],[150,500],[28,600],[0,600]] },
        { key: 'other', depth: 0.2, off: [0, 30], tone: 0.3, cyl: true,
          poly: [[520,273],[570,266],[570,270],[520,277]] },
        { key: 'receiver', depth: 0, off: [0, -45], tone: 0.5, cyl: false,
          poly: [[553,204],[592,208],[628,222],[642,246],[636,252],[578,244],[545,222]] },
        { key: 'other', depth: 0.6, off: [0, 40], tone: 0.32, cyl: false,
          poly: [[586,258],[588,272],[592,283],[596,281],[597,266],[595,257]] },
        { key: 'guard', depth: 0.8, off: [0, 58], tone: 0.36, cyl: false,
          poly: [[545,252],[549,265],[556,281],[566,291],[580,296],[594,294],[603,287],[612,280],[613,262],[606,253],[600,258],[601,272],[599,286],[590,291],[581,287],[575,276],[571,262],[565,254]] },
        { key: 'forend', depth: 0.3, off: [25, -30], tone: 0.6, cyl: true,
          poly: [[627,220],[660,226],[690,232],[708,240],[707,256],[690,262],[660,256],[640,248]] },
        { key: 'barrel', depth: 0.7, off: [45, -15], tone: 0.55, cyl: true,
          poly: [[705,240],[740,245],[768,251],[769,255],[740,256],[707,256]] },
      ],
      muzzles: [],
      stamp: { ellipse: [231, 260, 60, 50], lines: [['花　警', 203, 248, 24], ['特獵魚械', 197, 288, 22], ['UB114001', 180, 350, 30]] },
      occluders: [],
      arrows: { barrel: [[745,250],[720,170]], receiver: [[600,226],[600,140]], guard: [[577,293],[650,360]], stock: [[100,330],[110,470]] },
    },
  };

  // ---------- 共用狀態 ----------
  const state = { active: null, explode: 0, photo: 0, listeners: [] };
  window.GunSketch = {
    select(k) { state.active = state.active === k ? null : k; state.listeners.forEach(f => f(state.active)); },
    setExplode(v) { state.explode = v; },
    setPhoto(v) { state.photo = v; },
    onSelect(f) { state.listeners.push(f); },
  };

  // ---------- 幾何工具 ----------
  function axisOf(poly) {             // 主成分軸：決定明暗漸層方向
    let mx = 0, my = 0; poly.forEach(([x, y]) => { mx += x; my += y; }); mx /= poly.length; my /= poly.length;
    let sxx = 0, syy = 0, sxy = 0; poly.forEach(([x, y]) => { const dx = x - mx, dy = y - my; sxx += dx * dx; syy += dy * dy; sxy += dx * dy; });
    const ang = 0.5 * Math.atan2(2 * sxy, sxx - syy);
    const ux = Math.cos(ang), uy = Math.sin(ang), nx = -uy, ny = ux;
    let lo = Infinity, hi = -Infinity, alo = Infinity, ahi = -Infinity;
    poly.forEach(([x, y]) => { const t = (x - mx) * nx + (y - my) * ny, a = (x - mx) * ux + (y - my) * uy; lo = Math.min(lo, t); hi = Math.max(hi, t); alo = Math.min(alo, a); ahi = Math.max(ahi, a); });
    if (ny < 0) return { mx, my, ux: -ux, uy: -uy, nx: -nx, ny: -ny, lo: -hi, hi: -lo, alo: -ahi, ahi: -alo };  // 讓光從上方來
    return { mx, my, ux, uy, nx, ny, lo, hi, alo, ahi };
  }
  function inPoly(x, y, poly) {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  }
  function rand(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

  // ---------- 單一畫布 ----------
  function makeSketch(id, hostId) {
    const G = GUNS[id];
    G.parts.forEach((p, i) => { p.ax = axisOf(p.poly); p.seed = i * 97 + (id === 'A' ? 1 : 500); });
    return new p5((p) => {
      let s = 1, img = null, hover = null, par = [0, 0], parT = [0, 0], ex = 0;

      p.preload = () => { img = p.loadImage(G.img); };
      p.setup = () => {
        const c = p.createCanvas(10, 10); c.parent(hostId);
        c.elt.setAttribute('role', 'img');
        c.elt.setAttribute('aria-label', id === 'A' ? '甲式自製獵槍立體素描，可點選槍管、槍身、扳機護圈、槍托' : '乙式自製獵槍立體素描，可點選槍管、槍身、扳機護圈、槍托');
        fit();
        GunSketch.onSelect(() => p.redraw && 0);
      };
      function fit() {
        const w = document.getElementById(hostId).clientWidth;
        s = w / G.view[2]; p.resizeCanvas(w, Math.round(G.view[3] * s));
      }
      p.windowResized = fit;

      function offOf(part) {
        const e = ex, d = part.depth;
        return [part.off[0] * e + par[0] * d, part.off[1] * e + par[1] * d];
      }

      function drawPart(part, ctx) {
        const [ox, oy] = offOf(part), A = part.ax;
        const sel = state.active === part.key, dim = state.active && !sel && NAMES[part.key];
        const path = () => { ctx.beginPath(); part.poly.forEach(([x, y], i) => i ? ctx.lineTo(x + ox, y + oy) : ctx.moveTo(x + ox, y + oy)); ctx.closePath(); };

        // 投影
        ctx.save(); path();
        ctx.shadowColor = 'rgba(29,33,38,0.28)'; ctx.shadowBlur = 10 * s; ctx.shadowOffsetX = 3 * s; ctx.shadowOffsetY = 7 * s;
        ctx.fillStyle = '#888'; ctx.fill('evenodd'); ctx.restore();

        // 明暗漸層（圓柱：暗－亮－中－暗；平面：柔和）
        const x0 = A.mx + A.nx * A.lo + ox, y0 = A.my + A.ny * A.lo + oy, x1 = A.mx + A.nx * A.hi + ox, y1 = A.my + A.ny * A.hi + oy;
        const g = ctx.createLinearGradient(x0, y0, x1, y1);
        const base = part.tone * 255;
        const col = (k) => { const v = Math.max(0, Math.min(255, base * k)); return sel ? `rgb(${Math.min(255, v * 1.12 + 40)},${v * 0.72},${v * 0.6})` : `rgb(${v},${v},${v * 1.02})`; };
        if (part.flat) { g.addColorStop(0, col(1.35)); g.addColorStop(0.5, col(1.15)); g.addColorStop(1, col(0.82)); }
        else if (part.cyl) { g.addColorStop(0, col(0.75)); g.addColorStop(0.22, col(1.9)); g.addColorStop(0.42, col(1.35)); g.addColorStop(0.85, col(0.7)); g.addColorStop(1, col(0.55)); }
        else { g.addColorStop(0, col(1.6)); g.addColorStop(0.35, col(1.25)); g.addColorStop(1, col(0.7)); }
        ctx.save(); path(); ctx.fillStyle = g; ctx.globalAlpha = dim ? 0.45 : 1; ctx.fill('evenodd');

        // 暗面排線：平行主軸，越靠暗面越密、越深
        ctx.clip('evenodd');
        const r = rand(part.seed), span = A.hi - A.lo, len = (A.ahi - A.alo) + 20;
        ctx.lineWidth = 0.7; ctx.lineCap = 'round';
        const step = Math.max(1.6, 2.6 / s);
        for (let t = A.lo; t <= A.hi; t += step) {
          const u = (t - A.lo) / span;
          const a = u < 0.5 ? 0 : (u - 0.5) * 2;
          if (a <= 0.02 && !part.flat) continue;
          const alpha = part.flat ? 0.05 + 0.18 * a : 0.07 + 0.35 * a;
          ctx.strokeStyle = `rgba(20,20,22,${alpha})`;
          const cx = A.mx + A.nx * t + ox, cy = A.my + A.ny * t + oy;
          const st = A.alo - 10 + r() * 6, en = A.alo - 10 + len - r() * 8;
          ctx.beginPath();
          ctx.moveTo(cx + A.ux * st, cy + A.uy * st);
          ctx.lineTo(cx + A.ux * en + (r() - 0.5) * 1.2, cy + A.uy * en + (r() - 0.5) * 1.2);
          ctx.stroke();
        }
        // 最暗處交叉排線
        ctx.strokeStyle = 'rgba(20,20,22,0.12)';
        for (let k = -len; k < len; k += step * 2.2) {
          const t = A.lo + span * 0.82;
          const cx = A.mx + A.nx * t + A.ux * k + ox, cy = A.my + A.ny * t + A.uy * k + oy;
          ctx.beginPath(); ctx.moveTo(cx - A.nx * span * 0.2 - A.ux * 4, cy - A.ny * span * 0.2 - A.uy * 4); ctx.lineTo(cx + A.nx * span * 0.3 + A.ux * 4, cy + A.ny * span * 0.3 + A.uy * 4); ctx.stroke();
        }
        // 方格紋（握把、護木）
        if (part.hatch) {
          ctx.restore(); ctx.save();
          ctx.beginPath(); part.hatch.forEach(([x, y], i) => i ? ctx.lineTo(x + ox, y + oy) : ctx.moveTo(x + ox, y + oy)); ctx.closePath(); ctx.clip();
          ctx.strokeStyle = 'rgba(20,20,22,0.35)'; ctx.lineWidth = 0.6;
          for (let k = -80; k < 200; k += 3) { ctx.beginPath(); ctx.moveTo(part.hatch[0][0] + ox + k, part.hatch[0][1] + oy - 60); ctx.lineTo(part.hatch[0][0] + ox + k + 60, part.hatch[0][1] + oy + 60); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(part.hatch[0][0] + ox + k, part.hatch[0][1] + oy + 60); ctx.lineTo(part.hatch[0][0] + ox + k + 60, part.hatch[0][1] + oy - 60); ctx.stroke(); }
        }
        ctx.restore();

        // 高光細線（受光邊）
        if (part.cyl || !part.flat) {
          ctx.save(); path(); ctx.clip('evenodd');
          const t = A.lo + span * 0.2;
          ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = Math.max(0.8, span * 0.06);
          ctx.beginPath(); ctx.moveTo(A.mx + A.nx * t + A.ux * (A.alo + 4) + ox, A.my + A.ny * t + A.uy * (A.alo + 4) + oy);
          ctx.lineTo(A.mx + A.nx * t + A.ux * (A.ahi - 4) + ox, A.my + A.ny * t + A.uy * (A.ahi - 4) + oy); ctx.stroke(); ctx.restore();
        }

        // 素描外框：兩筆、微抖
        const r2 = rand(part.seed + 7);
        for (let pass = 0; pass < 2; pass++) {
          ctx.beginPath();
          part.poly.forEach(([x, y], i) => { const jx = (r2() - 0.5) * 1.1, jy = (r2() - 0.5) * 1.1; i ? ctx.lineTo(x + ox + jx, y + oy + jy) : ctx.moveTo(x + ox + jx, y + oy + jy); });
          ctx.closePath();
          ctx.strokeStyle = sel ? 'rgba(170,40,20,0.95)' : `rgba(25,25,28,${pass ? 0.35 : 0.85})`;
          ctx.lineWidth = (pass ? 0.6 : 1.1) * (sel ? 1.6 : 1);
          ctx.stroke();
        }
      }

      function drawLabel(key, ctx) {
        const a = G.arrows[key]; if (!a) return;
        const part = G.parts.find(q => q.key === key); const [ox, oy] = offOf(part);
        const tip = [a[0][0] + ox, a[0][1] + oy], lab = [a[1][0] + ox, a[1][1] + oy];
        const on = state.active === key, fs = 23;
        ctx.font = `700 ${fs}px "Noto Sans TC", sans-serif`;
        const w = ctx.measureText(NAMES[key]).width + 22, h = fs + 14;
        const ang = Math.atan2(tip[1] - lab[1], tip[0] - lab[0]);
        const sx = lab[0] + Math.cos(ang) * w / 2, sy = lab[1] + Math.sin(ang) * h / 2;
        ctx.strokeStyle = '#1d2126'; ctx.fillStyle = '#1d2126'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(tip[0] - Math.cos(ang) * 6, tip[1] - Math.sin(ang) * 6); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(tip[0], tip[1]);
        ctx.lineTo(tip[0] - 12 * Math.cos(ang - 0.42), tip[1] - 12 * Math.sin(ang - 0.42));
        ctx.lineTo(tip[0] - 12 * Math.cos(ang + 0.42), tip[1] - 12 * Math.sin(ang + 0.42)); ctx.closePath(); ctx.fill();
        // 卡片風格標籤：黑框＋偏移陰影
        ctx.fillStyle = 'rgba(29,33,38,0.16)'; roundRect(ctx, lab[0] - w / 2 + 3, lab[1] - h / 2 + 3, w, h, 7); ctx.fill();
        ctx.fillStyle = on ? '#1d2126' : '#fffdf8'; roundRect(ctx, lab[0] - w / 2, lab[1] - h / 2, w, h, 7); ctx.fill();
        ctx.strokeStyle = '#1d2126'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = on ? '#fffdf8' : '#1d2126'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(NAMES[key], lab[0], lab[1] + 1);
        ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
      }
      function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

      p.draw = () => {
        const ctx = p.drawingContext;
        // 視差：滑鼠在畫布上時，部位依深度微移
        const inside = p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height;
        parT = inside && state.photo === 0 ? [(p.mouseX / p.width - 0.5) * 14, (p.mouseY / p.height - 0.5) * 10] : [0, 0];
        par = [p.lerp(par[0], parT[0], 0.08), p.lerp(par[1], parT[1], 0.08)];
        ex = p.lerp(ex, state.photo > 0 ? 0 : state.explode, 0.12);

        p.clear();
        ctx.save(); ctx.scale(s, s); ctx.translate(-G.view[0], -G.view[1]);
        ctx.fillStyle = '#ece8de'; ctx.fillRect(0, 0, G.w, G.h);
        // 紙紋格線
        ctx.strokeStyle = 'rgba(120,105,75,0.10)'; ctx.lineWidth = 1 / s;
        for (let x = 0; x < G.w; x += 28) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, G.h); ctx.stroke(); }
        for (let y = 0; y < G.h; y += 28) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(G.w, y); ctx.stroke(); }
        if (state.photo > 0 && img) { ctx.globalAlpha = state.photo * 0.9; ctx.drawImage(img.canvas || img.elt, 0, 0, G.w, G.h); ctx.globalAlpha = state.photo > 0.5 ? 0.55 : 1; }

        // 依深度由後往前畫
        [...G.parts].sort((a, b) => a.depth - b.depth).forEach(part => drawPart(part, ctx));
        ctx.globalAlpha = 1;
        G.muzzles.forEach(([[x, y], rx, ry]) => {
          const part = G.parts.find(q => q.key === 'barrel'); const [ox, oy] = offOf(part);
          ctx.fillStyle = '#2a2a2c'; ctx.beginPath(); ctx.ellipse(x + ox, y + oy, rx * 0.5, ry, 0, 0, Math.PI * 2); ctx.fill();
        });
        if (G.stamp) {
          const part = G.parts.find(q => q.key === 'stock'); const [ox, oy] = offOf(part);
          ctx.strokeStyle = 'rgba(30,30,30,0.55)'; ctx.lineWidth = 1.4;
          const [cx, cy, rx, ry] = G.stamp.ellipse; ctx.beginPath(); ctx.ellipse(cx + ox, cy + oy, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = 'rgba(30,30,30,0.6)';
          G.stamp.lines.forEach(([t, x, y, f]) => { ctx.font = `500 ${f}px "Noto Sans TC", sans-serif`; ctx.fillText(t, x + ox, y + oy); });
        }
        // 手部遮擋：斜線區塊，不畫出被遮住的部位
        G.occluders.forEach(o => {
          ctx.save(); ctx.beginPath(); o.poly.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath();
          ctx.fillStyle = 'rgba(236,232,222,0.92)'; ctx.fill(); ctx.clip();
          ctx.strokeStyle = 'rgba(117,118,122,0.35)'; ctx.lineWidth = 1;
          for (let k = -400; k < 900; k += 7) { ctx.beginPath(); ctx.moveTo(k, 0); ctx.lineTo(k + 450, 450); ctx.stroke(); }
          ctx.restore();
          ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(117,118,122,0.7)'; ctx.beginPath(); o.poly.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle = '#4f5054'; ctx.font = '500 15px "Noto Sans TC", sans-serif'; ctx.fillText(o.label, o.at[0], o.at[1]);
        });
        Object.keys(NAMES).forEach(k => drawLabel(k, ctx));
        // 角標
        const vx = G.view[0], vy = G.view[1];
        ctx.fillStyle = '#1d2126'; roundRect(ctx, vx + 12, vy + 12, 92, 28, 5); ctx.fill();
        ctx.fillStyle = '#fffdf8'; ctx.font = '500 15px "Noto Sans TC", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('手繪示意', vx + 58, vy + 31); ctx.textAlign = 'start';
        ctx.restore();

        // 滑過可點的部位 → 手指游標
        hover = pick(p.mouseX / s + G.view[0], p.mouseY / s + G.view[1]);
        p.cursor(hover ? p.HAND : p.ARROW);
      };

      function pick(x, y) {
        const sorted = [...G.parts].sort((a, b) => b.depth - a.depth);
        for (const part of sorted) {
          if (!NAMES[part.key]) continue;
          const [ox, oy] = offOf(part);
          if (inPoly(x - ox, y - oy, part.poly)) return part.key;
        }
        for (const k of Object.keys(G.arrows)) {      // 標籤也能點
          const part = G.parts.find(q => q.key === k); const [ox, oy] = offOf(part); const [lx, ly] = G.arrows[k][1];
          if (Math.abs(x - lx - ox) < 45 && Math.abs(y - ly - oy) < 22) return k;
        }
        return null;
      }
      p.mousePressed = () => {
        if (p.mouseX < 0 || p.mouseX > p.width || p.mouseY < 0 || p.mouseY > p.height) return;
        const k = pick(p.mouseX / s + G.view[0], p.mouseY / s + G.view[1]); if (k) GunSketch.select(k);
      };
    });
  }

  makeSketch('A', 'stageA');
  makeSketch('B', 'stageB');
})();
