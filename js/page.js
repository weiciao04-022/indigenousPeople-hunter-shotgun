/* 頁面互動：閱讀進度、點陣圖、年齡長條、兩把槍控制列 */
(function () {
  const bar = document.getElementById('progress');
  const onScroll = () => { const h = document.documentElement; bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%'; };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  function grid(id, kinds) {
    const el = document.getElementById(id); if (!el) return;
    kinds.forEach(([cls, n, label]) => { for (let i = 0; i < n; i++) { const d = document.createElement('i'); if (cls) d.className = cls; d.title = `${label}`; el.appendChild(d); } });
  }
  // 32 件意外（研究表 5-1-3）
  grid('acc', [['k-quasi', 23, '準後膛槍（喜得釘）'], ['k-muzzle', 2, '前膛槍'], ['k-breech', 1, '制式散彈後膛槍'], ['', 6, '槍型不詳']]);
  // 學習管道（研究表 8-3-1）
  grid('learn', [['k-tribe', 12, '族人教'], ['k-family', 11, '家人教'], ['', 3, '自己學']]);

  // 年齡（研究表 8-3-1）
  const ages = [['40歲以下', 1], ['40–49歲', 13], ['50–59歲', 9], ['60–69歲', 9], ['70歲以上', 2]];
  const ag = document.getElementById('ages');
  if (ag) ages.forEach(([l, n]) => { ag.insertAdjacentHTML('beforeend', `<div class="bar-row" title="${l}：${n} 人"><span>${l}</span><span class="t"><span style="width:${n / 13 * 100}%"></span></span><span class="v">${n}</span></div>`); });

  // 一半具合法槍證（受訪者描述，示意 10 人）
  const half = document.getElementById('half');
  if (half) for (let i = 0; i < 10; i++) { const d = document.createElement('i'); if (i < 5) d.className = 'on'; half.appendChild(d); }

  // 兩把槍
  const chips = document.querySelectorAll('#guns .tabs button');
  chips.forEach(c => c.addEventListener('click', () => GunSketch.select(c.dataset.part)));
  GunSketch.onSelect(k => chips.forEach(c => c.setAttribute('aria-pressed', c.dataset.part === k)));
  const ex = document.getElementById('explode'), ph = document.getElementById('photo');
  ex.addEventListener('input', () => { GunSketch.setExplode(ex.value / 100); if (+ex.value > 0) { ph.value = 0; GunSketch.setPhoto(0); } });
  ph.addEventListener('input', () => { GunSketch.setPhoto(ph.value / 100); if (+ph.value > 0) { ex.value = 0; GunSketch.setExplode(0); } });
})();
/* 圖卡進場：捲到畫面時往上浮出 */
(function () {
  const cards = document.querySelectorAll('.step .card');
  if (!('IntersectionObserver' in window)) { cards.forEach(c => c.classList.add('in')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }), { threshold: 0.3 });
  cards.forEach(c => io.observe(c));
})();
