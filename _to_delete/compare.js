/* 甲式／乙式外觀部位互動比較。線稿座標在 data/shapes.js（依照片描繪，單位為原照片素）。 */
(function(){
const DATA = window.SHAPES;
const NAMES = {barrel:'槍管',receiver:'槍身',guard:'扳機護圈',stock:'槍托'};
const KEY = {'槍管':'barrel','槍身':'receiver','扳機護圈':'guard','槍托':'stock'};
const OFFSET = {
  A:{barrel:[70,-30],forend:[40,-12],receiver:[0,0],guard:[0,55],stock:[-60,12]},
  B:{barrel:[45,-15],forend:[25,-30],receiver:[0,-45],guard:[0,55],trigger:[0,40],stock:[-55,25],other:[0,30]}
};
const INFO = {
  barrel:{law:'公告列為獵槍主要組成零件。',
    A:'照片可見上下兩根槍管，上方有通風槽。法規要求甲式為後膛中折式霰彈槍，口徑二十鉛徑，單管或雙管，滑膛無膛線。',
    B:'照片中槍管在畫面遠端，可見為單管。法規要求乙式口徑十六毫米以下、單槍管、槍管長度九十公分以下。'},
  receiver:{law:'公告列為獵槍主要組成零件。',
    A:'照片可見黑色金屬機匣，頂部裝有導軌。內部的撞針、槍機等零件在照片中看不到。',
    B:'照片可見金屬機匣，位於槍托前方。法規另規定乙式彈藥室直徑六點九一毫米以下、長度三十毫米以下，照片無法確認這些尺寸。'},
  guard:{law:'不在公告的主要組成零件清單內，但辦法第4條要求甲、乙式的扳機都應裝置護弓。',
    A:'照片中護圈大半被射擊者右手手指遮住，只看得到下緣和前緣環框。框內的扳機看不到。',
    B:'照片可見完整環框，框內有扳機。箭頭指的是外圍環框，不是扳機。'},
  stock:{law:'不在公告的主要組成零件清單內。',
    A:'照片只看得到靠近機匣的槍托前段與握把方格紋，後段被手遮住，尾端在畫面外。',
    B:'照片中槍托佔大半畫面，側面烙有「花警 特獵魚械」與「UB114001」字樣；尾端在畫面外。'}
};
const NS='http://www.w3.org/2000/svg';
function el(t,a,p){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e}
function smooth(pts){ // Catmull-Rom -> cubic bezier for a hand-drawn feel
  if(pts.length<3) return 'M'+pts.map(p=>p.join(',')).join(' L');
  let d='M'+pts[0].join(',');
  for(let i=0;i<pts.length-1;i++){
    const p0=pts[i-1]||pts[i],p1=pts[i],p2=pts[i+1],p3=pts[i+2]||p2;
    const c1=[p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6],c2=[p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6];
    d+=` C${c1} ${c2} ${p2}`;
  }
  return d;
}
const stages={};
function build(id){
  const D=DATA[id], root=document.getElementById('stage'+id);
  const svg=el('svg',{viewBox:`0 0 ${D.w} ${D.h}`,role:'img','aria-label':id==='A'?'甲式獵槍手繪線稿':'乙式獵槍手繪線稿'},root);
  const img=el('image',{href:D.img,x:0,y:0,width:D.w,height:D.h,opacity:0},svg);
  const groups={};
  // hatch (checkering) belongs to stock / forend
  for(const [k,P] of Object.entries(D.parts)){
    const g=el('g',{class:'grp'},svg); const pg=el('g',{class:'part'+(NAMES[k]?'':' static'),'data-part':k},g);
    for(const L of P.lines){el('path',{class:'ln',d:smooth(L)},pg);}
    for(const L of P.lines){el('path',{class:'hit',d:smooth(L)},pg);}
    groups[k]={g,pg};
  }
  if(id==='A'){ // checkering hatch + rib ticks
    const pat=el('pattern',{id:'hx'+id,width:5,height:5,patternUnits:'userSpaceOnUse',patternTransform:'rotate(45)'},el('defs',{},svg));
    el('path',{d:'M0 0 L0 5 M0 0 L5 0',stroke:'#9b978f','stroke-width':.8},pat);
    el('polygon',{points:D.hatch[0].join(' '),fill:`url(#hx${id})`},groups.stock.pg);
    el('polygon',{points:D.hatch[1].join(' '),fill:`url(#hx${id})`},groups.forend.pg);
    for(const [x,y] of D.ticks) el('path',{class:'ln',d:`M${x},${y} L${x},${y+4}`},groups.barrel.pg);
  }
  if(D.stamp){const [x0,y0,x1,y1]=D.stamp.ellipse;
    el('ellipse',{cx:(x0+x1)/2,cy:(y0+y1)/2,rx:(x1-x0)/2,ry:(y1-y0)/2,fill:'none',stroke:'#9b978f','stroke-width':1.2},groups.stock.pg);
    const t=(s,x,y,f)=>{const e=el('text',{x,y,'font-size':f,fill:'#9b978f'},groups.stock.pg);e.textContent=s};
    t('花　警',203,248,24);t('特獵魚械',197,288,22);t('UB114001',180,350,30);}
  for(const [[x,y],s] of D.occl){const e=el('text',{x,y,'font-size':15,fill:'#8d8a84'},svg);e.textContent=s}
  // labels + arrows, each moves with its part
  const fs=D.w/800*24;
  for(const [name,{tip,lab}] of Object.entries(D.arrows)){
    const k=KEY[name], lg=el('g',{class:'lbl','data-part':k},groups[k].g);
    const w=name.length*fs+18,h=fs+14;
    const ang=Math.atan2(tip[1]-lab[1],tip[0]-lab[0]);
    const sx=lab[0]+Math.cos(ang)*(w/2), sy=lab[1]+Math.sin(ang)*(h/2);
    el('line',{x1:sx,y1:sy,x2:tip[0]-Math.cos(ang)*5,y2:tip[1]-Math.sin(ang)*5},lg);
    const a=0.42,hl=11;
    el('polygon',{points:`${tip} ${tip[0]-hl*Math.cos(ang-a)},${tip[1]-hl*Math.sin(ang-a)} ${tip[0]-hl*Math.cos(ang+a)},${tip[1]-hl*Math.sin(ang+a)}`,fill:'var(--acc)'},lg);
    el('rect',{x:lab[0]-w/2,y:lab[1]-h/2,width:w,height:h,rx:6},lg);
    const t=el('text',{x:lab[0],y:lab[1]+fs*0.36,'font-size':fs,'text-anchor':'middle'},lg);t.textContent=name;
  }
  el('rect',{x:10,y:10,width:92,height:28,rx:4,fill:'#3c3c3c'},svg);
  const tg=el('text',{x:56,y:30,'font-size':16,fill:'#fff','text-anchor':'middle'},svg);tg.textContent='手繪示意';
  stages[id]={svg,img,groups};
}
build('A');build('B');

let active=null;
function select(k){
  active=(active===k)?null:k;
  document.querySelectorAll('.chip').forEach(c=>c.setAttribute('aria-pressed',c.dataset.part===active));
  document.querySelectorAll('.part').forEach(p=>{p.classList.toggle('on',p.dataset.part===active);p.classList.toggle('dim',!!active&&p.dataset.part!==active)});
  document.querySelectorAll('.lbl').forEach(l=>l.classList.toggle('on',l.dataset.part===active));
  const box=document.getElementById('info');
  if(!active){box.innerHTML='<p style="margin:0;color:var(--muted)">點選線稿上的部位，或上方的部位按鈕，比較兩件樣本。</p>';return}
  const I=INFO[active];
  box.innerHTML=`<h3>${NAMES[active]}</h3><p class="law">${I.law}</p><div class="cmp"><div><b>甲式樣本</b>${I.A}</div><div class="b"><b>乙式樣本</b>${I.B}</div></div>`;
}
document.querySelectorAll('.chip').forEach(c=>c.addEventListener('click',()=>select(c.dataset.part)));
document.querySelectorAll('.part:not(.static), .lbl').forEach(p=>p.addEventListener('click',()=>select(p.dataset.part)));
const exS=document.getElementById('explode'), phS=document.getElementById('photo');
function setPhoto(v){for(const id of ['A','B']) stages[id].img.setAttribute('opacity',v/100*0.85)}
function setExplode(v){
  const t=v/100;
  for(const id of ['A','B']) for(const [k,{g}] of Object.entries(stages[id].groups)){
    const [dx,dy]=OFFSET[id][k]||[0,0]; g.style.transform=`translate(${dx*t}px,${dy*t}px)`;
  }
}
// 分離與原照互斥：疊照片核對時，線稿要回到原位
exS.addEventListener('input',e=>{setExplode(e.target.value); if(+e.target.value>0){phS.value=0;setPhoto(0)}});
phS.addEventListener('input',e=>{setPhoto(e.target.value); if(+e.target.value>0){exS.value=0;setExplode(0)}});
select(null);
})();
