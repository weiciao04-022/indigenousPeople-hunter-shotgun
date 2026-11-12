/* 專題圖表：登記數字卡、縣市地圖（分布／事故）、訓練開課狀態、到課交通、族群與狩獵時節、實例與提案
   所有數字都來自 data/*.csv，這裡是同一份資料的程式版本。 */
(function () {
  const G = window.TW_GEO;
  const NS = 'http://www.w3.org/2000/svg';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = (t, a = {}, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const PDF = '內政部警政署委託研究〈原住民得合法使用制式獵槍狩獵政策之研究〉（2017）';

  function baseMap(svg, cls = '') {
    const [x0, y0, x1, y1] = G.bbox;
    svg.setAttribute('viewBox', `${x0 - 6} ${y0 - 4} ${x1 - x0 + 12} ${y1 - y0 + 8}`);
    const g = el('g', { class: 'counties ' + cls }, svg);
    const paths = {};
    for (const [name, c] of Object.entries(G.counties)) { paths[name] = el('path', { d: c.d, 'data-name': name, class: 'county' }, g); }
    if (G.comp) el('path', { d: G.comp, class: 'comp' }, svg);
    return paths;
  }

  /* ---------- 縣市地圖：分布／事故 ---------- */
  const REG = { '臺北市': 1, '新北市': 47, '桃園市': 196, '臺中市': 65, '臺南市': 1, '高雄市': 322, '基隆市': 4, '新竹市': 1, '新竹縣': 450, '苗栗縣': 105, '彰化縣': 1, '南投縣': 995, '嘉義縣': 124, '屏東縣': 548, '宜蘭縣': 79, '花蓮縣': 1278, '臺東縣': 869, '連江縣': 1 };
  const ACC = { '花蓮縣': 3, '桃園市': 1, '苗栗縣': 5, '臺東縣': 2, '南投縣': 5, '新北市': 2, '屏東縣': 1, '新竹縣': 1, '臺中市': 1, '高雄市': 1, '宜蘭縣': 1 };
  const ACC_UNKNOWN = 9;
  const BINS = [[1, 9, '#d3e6dc'], [10, 99, '#9cc7b0'], [100, 499, '#5e9c7e'], [500, 999, '#2f6b4f'], [1000, 1e9, '#173d2c']];
  const binOf = v => BINS.find(b => v >= b[0] && v <= b[1]);

  function countyMap() {
    const svg = document.getElementById('cmap'); if (!svg) return;
    const paths = baseMap(svg);
    const defs = el('defs', {}, svg);
    const pat = el('pattern', { id: 'nodata', width: 5, height: 5, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    el('rect', { width: 5, height: 5, fill: '#ece8de' }, pat); el('line', { x1: 0, y1: 0, x2: 0, y2: 5, stroke: '#b3ac9c', 'stroke-width': 1.4 }, pat);
    const dots = el('g', { class: 'dots' }, svg);
    const panel = document.getElementById('cmap-panel'), legend = document.getElementById('cmap-legend'), cap = document.getElementById('cmap-cap');
    let mode = 'reg', sel = null;

    function show(name) {
      sel = name;
      Object.values(paths).forEach(p => p.classList.toggle('on', p.dataset.name === name));
      if (!name) { panel.innerHTML = mode === 'reg' ? '<b>點選縣市</b>' : `<b>點選縣市</b>　地點不明 ${ACC_UNKNOWN} 件未上圖`; return; }
      if (mode === 'reg') {
        const v = REG[name];
        panel.innerHTML = v ? `<b>${name}</b>　${v.toLocaleString()} 枝<br><small>警政署列管之原住民自製獵槍｜截至 2017 年 9 月｜p.55</small>` : `<b>${name}</b>　來源未列出<br><small>截至 2017 年 9 月｜p.55</small>`;
      } else {
        const v = ACC[name] || 0;
        panel.innerHTML = `<b>${name}</b>　${v} 件<br><small>研究收錄的意外案例｜2007–2017｜表 5-1-1，p.107–109</small>`;
      }
    }
    function render() {
      dots.innerHTML = '';
      for (const [name, p] of Object.entries(paths)) {
        if (mode === 'reg') { const v = REG[name]; p.style.fill = v ? binOf(v)[2] : 'url(#nodata)'; }
        else p.style.fill = '#ece8de';
      }
      if (mode === 'acc') {
        for (const [name, v] of Object.entries(ACC)) {
          const c = G.counties[name]; const r = 3 + Math.sqrt(v) * 5.2;
          const g = el('g', { class: 'adot', 'data-name': name }, dots);
          el('circle', { cx: c.cx, cy: c.cy, r, fill: 'rgba(154,90,44,.85)', stroke: '#fffdf8', 'stroke-width': 1.5 }, g);
          const t = el('text', { x: c.cx, y: c.cy + 3.5, 'text-anchor': 'middle', class: 'adot-t' }, g); t.textContent = v;
          g.addEventListener('click', () => show(name));
        }
        legend.innerHTML = '<span><i class="sw" style="background:rgba(154,90,44,.85)"></i>圓內數字＝研究收錄的意外件數</span>';
        cap.textContent = `資料：${PDF}，表 5-1-1（p.107–109）。為該研究從判決書與新聞報導蒐集的 32 件案例，非完整統計；未計算風險率。`;
      } else {
        legend.innerHTML = BINS.map(b => `<span><i class="sw sq" style="background:${b[2]}"></i>${b[1] > 1e8 ? b[0].toLocaleString() + ' 以上' : b[0] + '–' + b[1]}</span>`).join('') + '<span><i class="sw sq nod"></i>來源未列出</span>';
        cap.textContent = `資料：${PDF}，p.55，警政署列管之原住民自製獵槍，截至 2017 年 9 月，共 5,087 枝；單位：枝。`;
      }
      show(sel);
    }
    Object.values(paths).forEach(p => p.addEventListener('click', () => show(p.dataset.name)));
    document.querySelectorAll('#cmap-mode button').forEach(b => b.addEventListener('click', () => {
      mode = b.dataset.mode; document.querySelectorAll('#cmap-mode button').forEach(x => x.setAttribute('aria-pressed', x === b)); render();
    }));
    render();
  }

  /* ---------- 訓練開課狀態 ---------- */
  function training() {
    const box = document.getElementById('train'); if (!box) return;
    const months = []; for (let y = 2025; y <= 2026; y++) for (let m = 1; m <= 12; m++) months.push([y, m]);
    const pos = (y, m, d = 1) => (((y - 2025) * 12 + (m - 1)) + (d - 1) / 30) / 24 * 100;
    const items = [
      { y: 2025, m: 6, d: 2, w: 0.3, label: '第一梯次｜桃園、新北｜參訓 50 人', st: 'done' },
      { y: 2025, m: 9, d: 22, w: 0.3, label: '第二梯次｜嘉義市｜正取 50、備取 20', st: 'done' },
      { y: 2026, m: 7, d: 1, w: 6, label: '規劃 40 場（實際開辦數待查）', st: 'plan' },
      { y: 2026, m: 8, d: 15, w: 0.3, label: '台東場：最快 8 月中', st: 'plan' },
    ];
    let html = '<div class="tr-axis">' + months.map(([y, m]) => `<span class="${m === 1 ? 'yr' : ''}">${m === 1 ? y : m}</span>`).join('') + '</div><div class="tr-rows">';
    items.forEach(it => {
      const l = pos(it.y, it.m, it.d), w = Math.max(1.2, it.w / 24 * 100);
      html += `<div class="tr-row"><span class="tr-bar ${it.st}" style="left:${l}%;width:${w}%"></span><span class="tr-lab" style="left:${Math.min(l, 58)}%">${it.label}</span></div>`;
    });
    html += '</div><div class="legend"><span><i class="sw sq" style="background:var(--ink)"></i>已辦理或已公告</span><span><i class="sw sq dash"></i>規劃中</span><span>2025 年通過訓練：98 人</span></div>';
    box.innerHTML = html;
  }

  /* ---------- 到課交通 ---------- */
  const ORIGINS = [
    { id: 'ali', name: '嘉義縣阿里山鄉', note: '鄒族受訪者，部落待確認', pt: '阿里山鄉', st: '嘉義站', color: '#2a78d6' },
    { id: 'tp', name: '南投縣信義鄉東埔部落', note: '布農族受訪者', pt: '東埔部落', st: '水里站', color: '#eb6834' },
    { id: 'nms', name: '高雄市那瑪夏區南沙魯里', note: '布農族受訪者', pt: '那瑪夏區', st: '高雄站', color: '#1baf7a' },
    { id: 'tt', name: '臺東', note: '卑南族受訪者，部落待確認', pt: '臺東市', st: '臺東站', color: '#eda100' },
  ];
  const ROUTES = {
    ali: { cy: { via: [], rail: 0, train: '起點車站即嘉義', tx: '—' }, il: { via: ['嘉義站', '臺北站', '宜蘭站'], rail: 339, train: '自強 270｜05:52→11:31', tx: '直達' } },
    tp: { cy: { via: ['水里站', '二水站', '嘉義站'], rail: 111, train: '區間快 2702→3005｜05:42→07:33', tx: '二水轉乘 1 次（等 27 分）' }, il: { via: ['水里站', '二水站', '臺北站', '宜蘭站'], rail: 447, train: '區間 2704→2154→普悠瑪 228｜07:05→14:32', tx: '二水、臺北轉乘 2 次' } },
    nms: { cy: { via: ['高雄站', '嘉義站'], rail: 124, train: '區間 3118｜05:03→07:07', tx: '直達' }, il: { via: ['高雄站', '臺東站', '花蓮站', '宜蘭站'], rail: 327, train: '自強 411｜05:34→11:01', tx: '直達' } },
    tt: { cy: { via: ['臺東站', '高雄站', '嘉義站'], rail: 191, train: '自強 162｜05:52→09:03', tx: '直達' }, il: { via: ['臺東站', '花蓮站', '宜蘭站'], rail: 159, train: '普悠瑪 401｜04:58→07:37', tx: '直達' } },
  };
  const hm = m => m === 0 ? '0 分' : `${Math.floor(m / 60) ? Math.floor(m / 60) + ' 時 ' : ''}${m % 60} 分`;

  function routes() {
    const svg = document.getElementById('rmap'); if (!svg) return;
    baseMap(svg, 'muted');
    const P = G.points;
    const lines = el('g', {}, svg), marks = el('g', {}, svg);
    // 目的地
    const dest = [['嘉義站', '嘉義｜2025-09 已辦理', 'solid'], ['宜蘭站', '宜蘭｜地點未確認', 'dash']];
    dest.forEach(([k, t, s]) => { const [x, y] = P[k]; el('rect', { x: x - 5, y: y - 5, width: 10, height: 10, class: 'dest ' + s }, marks); const right = k === '宜蘭站'; const tx = el('text', { x: right ? x - 9 : x + 9, y: y + 4, class: 'dlab', 'text-anchor': right ? 'end' : 'start' }, marks); tx.textContent = t; });
    const items = {};
    ORIGINS.forEach(o => {
      const [ox, oy] = P[o.pt];
      const g = el('g', { class: 'route', 'data-id': o.id }, lines);
      ['cy', 'il'].forEach(k => {
        const r = ROUTES[o.id][k];
        const pts = [[ox, oy], ...r.via.map(v => P[v])];
        if (k === 'cy' && !r.via.length) pts.push(P['嘉義站']);
        const access = el('path', { d: `M${ox},${oy}L${pts[1][0]},${pts[1][1]}`, class: 'leg access', stroke: o.color }, g);
        const rail = el('path', { d: 'M' + pts.slice(1).map(p => p.join(',')).join('L'), class: 'leg rail ' + (k === 'il' ? 'dash' : ''), stroke: o.color }, g);
        items[o.id + k] = { access, rail };
      });
      el('circle', { cx: ox, cy: oy, r: 4.5, fill: o.color, stroke: '#fffdf8', 'stroke-width': 1.5 }, marks);
    });
    const panel = document.getElementById('rpanel');
    function play(id) {
      document.querySelectorAll('#rsel button').forEach(b => b.setAttribute('aria-pressed', b.dataset.id === id));
      lines.querySelectorAll('.route').forEach(g => g.classList.toggle('dim', g.dataset.id !== id));
      const o = ORIGINS.find(x => x.id === id), R = ROUTES[id];
      ['cy', 'il'].forEach((k, i) => {
        const { access, rail } = items[id + k];
        [access, rail].forEach((p, j) => {
          const L = p.getTotalLength();
          if (reduce) { p.style.strokeDashoffset = 0; p.style.strokeDasharray = ''; return; }
          p.style.transition = 'none'; p.style.strokeDasharray = `${L} ${L}`; p.style.strokeDashoffset = L;
          p.getBoundingClientRect();
          p.style.transition = `stroke-dashoffset ${j ? 1.6 : .5}s ease ${j ? .5 + i * .3 : i * .3}s`;
          p.style.strokeDashoffset = 0;
          if (p.classList.contains('dash')) setTimeout(() => { p.style.transition = 'none'; p.style.strokeDasharray = ''; }, (2.4 + i * .3) * 1000);
        });
      });
      const row = (lab, r, solid) => `<div class="rrow"><b>${lab}</b><span class="seg">社區→車站<em>待查</em></span><span class="seg">鐵路${r.rail ? `<em>${hm(r.rail)}</em><small>${r.train}；${r.tx}</small>` : '<em>—</em><small>起點車站即嘉義</small>'}</span><span class="seg">到站→場地<em>${solid ? '待查' : '不計'}</em></span></div>`;
      setTimeout(() => {
        panel.innerHTML = `<p class="rhead"><i class="sw" style="background:${o.color}"></i>${o.name}（${o.note}）→ 參考車站：${o.st}</p>` + row('到嘉義（已辦理）', R.cy, true) + row('到宜蘭（地點未確認，情境估算）', R.il, false);
      }, reduce ? 0 : 1600);
    }
    document.querySelectorAll('#rsel button').forEach(b => b.addEventListener('click', () => play(b.dataset.id)));
    const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { play('tt'); io.disconnect(); } }, { threshold: .5 });
    io.observe(svg);
    // 靜態比較表
    const tb = document.getElementById('rtable');
    tb.innerHTML = '<thead><tr><th>起點（參考車站）</th><th>目的地</th><th>代表班次</th><th>鐵路時間</th><th>轉乘</th></tr></thead><tbody>' +
      ORIGINS.map(o => ['cy', 'il'].map(k => { const r = ROUTES[o.id][k]; return `<tr><td>${o.name}（${o.st.replace('站', '')}）</td><td>${k === 'cy' ? '嘉義（已辦理）' : '宜蘭（未確認）'}</td><td>${r.train}</td><td>${r.rail ? hm(r.rail) : '—'}</td><td>${r.tx}</td></tr>`; }).join('')).join('') + '</tbody>';
  }

  /* ---------- 族群背景與受訪社群位置 ---------- */
  function tribeMap() {
    const svg = document.getElementById('tmap'); if (!svg) return;
    baseMap(svg, 'muted');
    const P = G.points;
    [['阿里山鄉', '鄒族受訪者（阿里山鄉，部落待確認）'], ['東埔部落', '布農族｜信義鄉東埔'], ['那瑪夏區', '布農族｜那瑪夏南沙魯里'], ['臺東市', '卑南族受訪者（部落待確認）']].forEach(([k, t], i) => {
      const [x, y] = P[k];
      el('circle', { cx: x, cy: y, r: 4.5, class: 'idot' }, svg);
      const tx = el('text', { x: x + 8, y: y + 4 + (i === 0 ? -10 : 0), class: 'dlab' }, svg); tx.textContent = t;
    });
  }

  /* ---------- 狩獵時節 ---------- */
  const SEAS = { '阿美族': [7, 8], '泰雅族': [7, 11], '排灣族': [7, 8], '布農族': [4, 5, 7], '卑南族': [1, 12], '鄒族': [2], '魯凱族': [5], '賽夏族': [10], '達悟族': [3, 5], '邵族': [8], '噶瑪蘭族': [2], '太魯閣族': [10], '撒奇萊雅族': [12], '賽德克族': [10, 11], '拉阿魯哇族': [1, 2, 3, 4, 9, 10, 11, 12], '卡那卡那富族': [1, 2, 3, 4, 9, 10, 11, 12] };
  function seasons() {
    const box = document.getElementById('seas'); if (!box) return;
    let h = '<div class="sg"><span></span>' + Array.from({ length: 12 }, (_, i) => `<button class="mh" data-m="${i + 1}">${i + 1}月</button>`).join('');
    for (const [t, ms] of Object.entries(SEAS)) {
      h += `<button class="tn" data-t="${t}">${t}</button>` + Array.from({ length: 12 }, (_, i) => `<i class="${ms.includes(i + 1) ? 'on' : ''}" data-m="${i + 1}" data-t="${t}"></i>`).join('');
    }
    box.innerHTML = h + '</div>';
    const out = document.getElementById('seas-out');
    const clear = () => box.querySelectorAll('.hl,.dim').forEach(x => x.classList.remove('hl', 'dim'));
    box.querySelectorAll('.mh').forEach(b => b.addEventListener('click', () => {
      clear(); const m = +b.dataset.m; const who = Object.entries(SEAS).filter(([, ms]) => ms.includes(m)).map(([t]) => t);
      box.querySelectorAll('.tn').forEach(x => x.classList.toggle('dim', !who.includes(x.dataset.t)));
      box.querySelectorAll(`i[data-m="${m}"]`).forEach(x => x.classList.add('hl'));
      out.textContent = `${m} 月：${who.length ? who.join('、') : '來源未標示'}`;
    }));
    box.querySelectorAll('.tn').forEach(b => b.addEventListener('click', () => {
      clear(); const t = b.dataset.t; box.querySelectorAll(`i[data-t="${t}"]`).forEach(x => x.classList.add('hl'));
      out.textContent = `${t}：${SEAS[t].join('、')} 月｜族群層級，未區分部落`;
    }));
  }

  countyMap(); training(); routes(); tribeMap(); seasons();
})();
