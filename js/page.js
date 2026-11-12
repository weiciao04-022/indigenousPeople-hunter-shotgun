/* 頁面互動：閱讀進度、意外點陣、兩把槍的控制列與說明框 */
(function () {
  // 閱讀進度
  const bar = document.getElementById('progress');
  const onScroll = () => { const h = document.documentElement; bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%'; };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // 32 件意外點陣（依研究表 5-1-3）
  const acc = document.getElementById('acc');
  const kinds = [['k-quasi', 23, '準後膛槍（喜得釘）'], ['k-muzzle', 2, '前膛槍'], ['k-breech', 1, '制式散彈後膛槍'], ['', 6, '槍型不詳']];
  kinds.forEach(([cls, n, label]) => { for (let i = 0; i < n; i++) { const d = document.createElement('i'); if (cls) d.className = cls; d.title = label; acc.appendChild(d); } });

  // 部位說明
  const NAMES = { barrel: '槍管', receiver: '槍身', guard: '扳機護圈', stock: '槍托' };
  const INFO = {
    barrel: { law: '公告列為獵槍主要組成零件。',
      A: '照片可見上下兩根槍管，上方有通風槽。辦法要求甲式為後膛中折式霰彈槍，口徑二十鉛徑，單管或雙管，滑膛。',
      B: '槍管在畫面遠端，可見為單管。辦法要求乙式口徑十六毫米以下、單槍管、槍管長度九十公分以下。' },
    receiver: { law: '公告列為獵槍主要組成零件。',
      A: '照片可見黑色金屬機匣，頂部裝有導軌。內部的撞針、槍機在照片中看不到。',
      B: '照片可見金屬機匣，接在槍托前方。辦法另規定乙式彈藥室直徑 6.91 毫米以下、長度 30 毫米以下；花蓮另兩把送驗槍就是因為彈藥室尺寸不符被退回。' },
    guard: { law: '不在公告的主要組成零件清單內，但辦法第 4 條要求甲、乙式的扳機都要裝護弓，也都要有手動保險。',
      A: '護圈大半被射擊者的手指遮住，只看得到下緣和前緣環框；框內的扳機看不到。',
      B: '照片可見完整的環框，框內有扳機。箭頭指的是外圍環框，不是扳機。' },
    stock: { law: '不在公告的主要組成零件清單內。',
      A: '只看得到靠近機匣的槍托前段和握把方格紋，後段被手遮住，尾端在畫面外。',
      B: '槍托佔了大半畫面，側面烙有「花警 特獵魚械」與「UB114001」字樣，尾端在畫面外。' },
  };
  const box = document.getElementById('info');
  const chips = document.querySelectorAll('#guns .tabs button');
  function render(k) {
    chips.forEach(c => c.setAttribute('aria-pressed', c.dataset.part === k));
    if (!k) { box.innerHTML = '<p class="hint" style="margin:0">點素描上的部位，或上方按鈕，比較兩把槍。</p>'; return; }
    const I = INFO[k];
    box.innerHTML = `<h3>${NAMES[k]}</h3><p class="law">${I.law}</p><div class="cmp"><div><b class="a">甲式樣本</b>${I.A}</div><div class="bb"><b class="b">乙式樣本</b>${I.B}</div></div>`;
  }
  chips.forEach(c => c.addEventListener('click', () => GunSketch.select(c.dataset.part)));
  GunSketch.onSelect(render); render(null);

  const ex = document.getElementById('explode'), ph = document.getElementById('photo');
  ex.addEventListener('input', () => { GunSketch.setExplode(ex.value / 100); if (+ex.value > 0) { ph.value = 0; GunSketch.setPhoto(0); } });
  ph.addEventListener('input', () => { GunSketch.setPhoto(ph.value / 100); if (+ph.value > 0) { ex.value = 0; GunSketch.setExplode(0); } });
})();
