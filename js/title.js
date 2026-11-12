/*
 * 標題動畫：紙上的法律｜山裡的現實
 * p5.js instance mode，畫在 #title-canvas 裡。
 *
 * 想改的地方大多在 CONFIG：文字、顏色、動畫時間。
 * - 左半「紙上的法律」：明體、墨色漸層，底下有公文格線，一道光慢慢掃過。
 * - 右半「山裡的現實」：「山」換成三座山峰；「裡」上方有一個腳印；
 *   「現」填入雲豹雲紋（程式即時生成，不用照片）；「實」右下垂著一條有環紋的尾巴。
 * - 中間一條線從「公文直線」慢慢變成「山稜線」，代表兩個平行時空。
 * - 點一下畫面會重播進場動畫；系統設定「減少動態」時直接顯示靜態畫面。
 */
(function () {
  const CONFIG = {
    left: '紙上的法律',
    rightRest: '裡的現實',     // 「山」由圖形取代
    subtitle: '原民獵槍新制上路後的平行時空',
    serif: '"Noto Serif TC", "Songti TC", "PMingLiU", serif',
    sans: '"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif',
    ink: '#1d1d1d',
    brown: '#5b2e28',
    green: '#3f7a35',
    greenDark: '#2d5a26',
    fur: '#c9a46c',
    spot: '#2a1d15',
    tail: '#9a968f',
    paper: '#ffffff',
    introMs: 2600,
  };

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const sketch = (p) => {
    let W, H, L = {};           // L: 版面計算結果
    let furG;                   // 雲紋圖層
    let t0 = 0;                 // 進場動畫起點
    let hover = 0;              // 滑鼠在右半時 → 尾巴擺動加快

    // ---------- 版面 ----------
    function measure(font, weight, str) {
      p.drawingContext.font = `${weight} 100px ${font}`;
      return p.drawingContext.measureText(str).width / 100;   // 1px 字級時的寬度
    }

    function layout() {
      const host = document.getElementById('title-canvas');
      W = host.clientWidth;
      if (L.hyunG) L.hyunG.remove();
      if (furG) { furG.remove(); furG = null; }
      const stacked = W < 640;
      const wL = measure(CONFIG.serif, 700, CONFIG.left);
      const wR = measure(CONFIG.sans, 900, CONFIG.rightRest);
      const mtn = 1.0, gap = 0.32;                            // 以字級為單位
      const pad = W * 0.04;
      L = { stacked, pad };
      if (!stacked) {
        const S = (W - pad * 2) / (wL + gap + mtn + 0.05 + wR * 0.98 + 0.25);
        L.S = S; L.SR = S * 0.98;
        L.y1 = S * 1.1;
        L.xL = pad; L.wL = wL * S;
        L.xM = pad + L.wL + gap * S; L.mW = mtn * S;
        L.xR = L.xM + L.mW + 0.05 * S; L.wR = wR * L.SR;
        L.yLine = L.y1 + S * 0.32;
        L.subS = Math.min(S * 0.6, (L.xR + L.wR - pad) / measure(CONFIG.sans, 500, CONFIG.subtitle));
        L.ySub = L.yLine + L.subS * 1.25;
        H = L.ySub + L.subS * 0.55;
      } else {
        const S1 = (W - pad * 2) / wL;
        const S2 = (W - pad * 2) / (mtn + 0.05 + wR * 0.98 + 0.3);
        L.S = Math.min(S1, S2); L.SR = L.S * 0.98;
        L.xL = pad; L.wL = wL * L.S; L.y1 = L.S * 1.05;
        L.xM = pad; L.mW = mtn * L.S;
        L.xR = pad + L.mW + 0.05 * L.S; L.wR = wR * L.SR;
        L.y2 = L.y1 + L.S * 1.25;
        L.yLine = L.y2 + L.S * 0.3;
        L.subS = (W - pad * 2) / measure(CONFIG.sans, 500, CONFIG.subtitle);
        L.ySub = L.yLine + L.subS * 1.4;
        H = L.ySub + L.subS * 0.6;
      }
      L.yR = L.stacked ? L.y2 : L.y1;
      buildFur();                       // 先建好雲紋，resizeCanvas 可能立刻觸發重繪
      p.resizeCanvas(W, Math.ceil(H));
    }

    // ---------- 雲豹雲紋（程式生成，不用照片） ----------
    function buildFur() {
      const s = L.SR;
      furG = p.createGraphics(Math.ceil(s * 1.2), Math.ceil(s * 1.2));
      const g = furG;
      g.pixelDensity(p.pixelDensity());
      g.background(CONFIG.fur);
      g.randomSeed(14); g.noiseSeed(14);
      // 毛色深淺
      g.noStroke();
      for (let i = 0; i < 300; i++) {
        g.fill(255, 240, 210, g.random(10, 30));
        g.ellipse(g.random(g.width), g.random(g.height), g.random(2, 6), g.random(8, 18));
      }
      // 雲狀斑塊：深色外緣、較淺內芯
      const n = 9;
      for (let i = 0; i < n; i++) {
        const cx = g.random(-0.1, 1.1) * g.width, cy = g.random(-0.1, 1.1) * g.height;
        const r = s * g.random(0.12, 0.2);
        blob(g, cx, cy, r, CONFIG.spot, i);
        blob(g, cx, cy, r * 0.62, '#9c7646', i + 50);
      }
      for (let i = 0; i < 30; i++) {
        g.fill(CONFIG.spot);
        g.ellipse(g.random(g.width), g.random(g.height), s * 0.035, s * 0.035);
      }
    }
    function blob(g, cx, cy, r, col, seed) {
      g.fill(col); g.beginShape();
      for (let a = 0; a < p.TWO_PI; a += 0.25) {
        const k = 0.7 + 0.5 * g.noise(seed, Math.cos(a) + 1, Math.sin(a) + 1);
        g.curveVertex(cx + Math.cos(a) * r * k * 1.25, cy + Math.sin(a) * r * k);
      }
      g.endShape(p.CLOSE);
    }

    // ---------- 繪製元件 ----------
    const ease = (x) => 1 - Math.pow(1 - p.constrain(x, 0, 1), 3);
    const back = (x) => { x = p.constrain(x, 0, 1); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };

    function drawLeft(e) {
      const ctx = p.drawingContext, S = L.S;
      // 公文格線
      p.stroke(0, 18); p.strokeWeight(1);
      for (let k = -2; k <= 0; k++) {
        const y = L.y1 + k * S * 0.42;
        p.line(L.xL, y, L.xL + L.wL * ease(e * 1.4), y);
      }
      // 墨色漸層＋掃光
      const sweep = (p.millis() / 4500) % 1.6 - 0.3;
      const grd = ctx.createLinearGradient(L.xL, 0, L.xL + L.wL, 0);
      grd.addColorStop(0, '#111');
      grd.addColorStop(p.constrain(sweep - 0.18, 0.01, 0.98), '#333');
      grd.addColorStop(p.constrain(sweep, 0.02, 0.99), '#c9c9c9');
      grd.addColorStop(p.constrain(sweep + 0.18, 0.03, 1), '#444');
      grd.addColorStop(1, '#111');
      ctx.font = `700 ${S}px ${CONFIG.serif}`;
      ctx.textBaseline = 'alphabetic';
      const chars = [...CONFIG.left];
      let x = L.xL;
      chars.forEach((c, i) => {
        const a = ease((e * chars.length * 1.2) - i);
        ctx.globalAlpha = a;
        ctx.fillStyle = grd;
        ctx.fillText(c, x, L.y1 + (1 - a) * S * 0.08);
        x += ctx.measureText(c).width;
      });
      ctx.globalAlpha = 1;
    }

    function drawMountain(e, t) {
      const S = L.S, x = L.xM, w = L.mW, base = L.yR, h = S * 0.92 * ease(e);
      if (h < 1) return;
      // 三座山峰，中間最高，像「山」字
      const peak = (px, ph, pw) => {
        p.vertex(px - pw, base);
        p.bezierVertex(px - pw * 0.8, base - ph * 0.62, px - pw * 0.42, base - ph, px, base - ph);
        p.bezierVertex(px + pw * 0.42, base - ph, px + pw * 0.8, base - ph * 0.62, px + pw, base);
      };
      p.noStroke();
      p.fill(CONFIG.green);
      p.beginShape();
      p.vertex(x, base);
      peak(x + w * 0.2, h * 0.66, w * 0.2);
      peak(x + w * 0.5, h, w * 0.22);
      peak(x + w * 0.8, h * 0.74, w * 0.2);
      p.vertex(x + w, base); p.vertex(x + w, base + S * 0.02); p.vertex(x, base + S * 0.02);
      p.endShape(p.CLOSE);
      // 底部厚實的山體
      p.rect(x, base - h * 0.3, w, h * 0.3 + S * 0.02, S * 0.04, S * 0.04, S * 0.06, S * 0.06);
      // 山的層次：較深的前景稜線，緩慢起伏
      p.fill(CONFIG.greenDark);
      p.beginShape();
      p.vertex(x, base + S * 0.02);
      for (let k = 0; k <= 20; k++) {
        const u = k / 20, sx = x + u * w;
        const wave = reduceMotion ? 0 : Math.sin(t / 1500 + u * 6) * h * 0.015;
        p.vertex(sx, base - h * (0.12 + 0.06 * Math.sin(u * Math.PI * 3)) + wave);
      }
      p.vertex(x + w, base + S * 0.02);
      p.endShape(p.CLOSE);
    }

    function drawRight(e) {
      const ctx = p.drawingContext, S = L.SR;
      ctx.font = `900 ${S}px ${CONFIG.sans}`;
      ctx.textBaseline = 'alphabetic';
      const chars = [...CONFIG.rightRest];
      let x = L.xR;
      L.charBoxes = [];
      chars.forEach((c, i) => {
        const cw = ctx.measureText(c).width;
        const k = back((e * chars.length * 1.1) - i - 0.6);
        L.charBoxes.push({ x, w: cw });
        if (k <= 0.01) { x += cw; return; }
        ctx.save();
        ctx.translate(x + cw / 2, L.yR - S * 0.38);
        ctx.scale(k, k);
        ctx.translate(-(x + cw / 2), -(L.yR - S * 0.38));
        if (c === '現') {
          // 用雲紋填字：先在圖層上畫字，再用 source-in 疊上雲紋
          if (!L.hyunG) {               // 每次版面改變只做一次
            const g = p.createGraphics(Math.ceil(cw + 4), Math.ceil(S * 1.25));
            g.pixelDensity(p.pixelDensity());
            g.drawingContext.font = ctx.font;
            g.drawingContext.fillStyle = '#000';
            g.drawingContext.fillText(c, 2, S * 1.05);
            g.drawingContext.globalCompositeOperation = 'source-in';
            g.image(furG, 0, 0, g.width, g.height);
            L.hyunG = g;
          }
          p.image(L.hyunG, x - 2, L.yR - S * 1.05);
        } else {
          ctx.fillStyle = CONFIG.brown;
          ctx.fillText(c, x, L.yR);
        }
        ctx.restore();
        x += cw;
      });
      L.rightEnd = x;
    }

    function drawPaw(e) {
      if (!L.charBoxes || !L.charBoxes[0]) return;
      const S = L.SR, b = L.charBoxes[0];
      const a = ease((e - 0.82) * 6);
      if (a <= 0) return;
      const cx = b.x + b.w * 0.18, cy = L.yR - S * 0.98, r = S * 0.15;
      p.push();
      p.translate(cx, cy); p.rotate(-0.25); p.scale(0.6 + 0.4 * back((e - 0.82) * 6));
      p.noStroke();
      p.fill(CONFIG.brown);
      p.ellipse(0, 0, r * 2.15, r * 2.15);
      p.fill(196, 150, 140, 255 * a);
      p.ellipse(0, r * 0.25, r * 0.95, r * 0.8);                 // 掌墊
      [[-0.55, -0.45], [-0.18, -0.68], [0.2, -0.68], [0.56, -0.45]].forEach(([dx, dy]) => p.ellipse(dx * r, dy * r, r * 0.38, r * 0.45));
      p.pop();
    }

    function drawTail(e, t) {
      if (!L.charBoxes || L.charBoxes.length < 4) return;
      const S = L.SR, last = L.charBoxes[3];
      const a = ease((e - 0.7) * 3);
      if (a <= 0) return;
      const sway = reduceMotion ? 0 : Math.sin(t / (900 - hover * 450)) * S * 0.05 * (1 + hover);
      const x0 = last.x + last.w * 0.86, y0 = L.yR - S * 0.05;
      const len = (L.stacked ? (L.yLine - y0 - S * 0.02) : (L.ySub - y0 + L.subS * 0.15)) * a;
      // 尾巴路徑：往下，再勾起來
      const pts = [];
      const N = 40;
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        const hook = u > 0.7 ? (u - 0.7) / 0.3 : 0;
        const px = x0 + Math.sin(u * 1.2) * S * 0.05 + sway * u * u - Math.sin(hook * Math.PI * 0.9) * S * 0.32;
        const py = y0 + u * len - Math.sin(hook * Math.PI * 0.5) * len * 0.12;
        pts.push([px, py]);
      }
      p.noFill(); p.strokeCap(p.ROUND);
      // 底色
      p.stroke(CONFIG.tail); p.strokeWeight(S * 0.15);
      p.beginShape(); pts.forEach(q => p.curveVertex(q[0], q[1])); p.endShape();
      // 環紋
      p.stroke(CONFIG.spot); p.strokeWeight(S * 0.15); p.strokeCap(p.SQUARE);
      for (let i = 5; i < N - 2; i += 5) {
        const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
        p.line(ax, ay, ax + (bx - ax) * 0.45, ay + (by - ay) * 0.45);
      }
      p.strokeCap(p.ROUND);
      // 尾尖
      const tip = pts[N];
      p.stroke(CONFIG.spot); p.strokeWeight(S * 0.15);
      p.point(tip[0], tip[1]);
    }

    function drawParallelLine(e) {
      // 左邊是筆直的公文線，往右漸漸長成山稜線：同一條時間線，兩種現實
      const x0 = L.pad, x1 = L.stacked ? W - L.pad : (L.rightEnd || W - L.pad), y = L.yLine;
      const end = x0 + (x1 - x0) * ease(e * 1.1);
      p.noFill(); p.stroke(CONFIG.ink); p.strokeWeight(1.4);
      p.beginShape();
      for (let x = x0; x <= end; x += 3) {
        const u = (x - x0) / (x1 - x0);
        const m = p.constrain((u - 0.45) / 0.4, 0, 1);       // 0 = 直線，1 = 稜線
        const ridge = (p.noise(x * 0.012) - 0.5) * L.S * 0.35 + Math.sin(x * 0.03) * L.S * 0.04;
        p.vertex(x, y + ridge * m * m);
      }
      p.endShape();
    }

    function drawSubtitle(e) {
      const ctx = p.drawingContext;
      ctx.font = `500 ${L.subS}px ${CONFIG.sans}`;
      ctx.globalAlpha = ease((e - 0.55) * 3);
      ctx.fillStyle = CONFIG.ink;
      ctx.fillText(CONFIG.subtitle, L.pad, L.ySub);
      ctx.globalAlpha = 1;
    }

    // ---------- p5 生命週期 ----------
    p.setup = function () {
      const c = p.createCanvas(10, 10);
      c.parent('title-canvas');
      c.elt.setAttribute('role', 'img');
      c.elt.setAttribute('aria-label', `${CONFIG.left}，山${CONFIG.rightRest}：${CONFIG.subtitle}`);
      p.noLoop();
      const ready = document.fonts ? Promise.all([
        document.fonts.load(`700 40px ${CONFIG.serif}`, CONFIG.left),
        document.fonts.load(`900 40px ${CONFIG.sans}`, CONFIG.rightRest),
        document.fonts.load(`500 40px ${CONFIG.sans}`, CONFIG.subtitle),
      ]).catch(() => {}) : Promise.resolve();
      ready.then(() => { layout(); t0 = p.millis(); p.loop(); });
    };

    p.draw = function () {
      if (!L.S || !furG) return;
      const t = p.millis();
      const e = reduceMotion ? 1 : (t - t0) / CONFIG.introMs;
      hover = p.lerp(hover, (p.mouseX > W * 0.5 && p.mouseY > 0 && p.mouseY < H) ? 1 : 0, 0.05);
      p.background(CONFIG.paper);
      drawParallelLine(e);
      drawLeft(e);
      drawMountain((e - 0.35) * 2.2, t);
      drawRight((e - 0.45) * 1.6);
      drawPaw(e);
      drawTail(e, t);
      drawSubtitle(e);
    };

    p.windowResized = function () { if (L.S) layout(); };
    p.mousePressed = function () {
      if (p.mouseX >= 0 && p.mouseX <= W && p.mouseY >= 0 && p.mouseY <= H) t0 = p.millis();
    };
  };

  new p5(sketch);
})();
