/**
 * map.js — 交互式长征路线地图
 * 底图使用真实《中国工农红军长征路线图》（1052 × 757），
 * 所有地点坐标按该图原始像素精确标注；支持拖拽、缩放、点击、悬停预览。
 */

window.MapModule = (function () {

  const MAP_SRC = 'assets/map/route-terrain.webp';
  const MAP_W = 1052, MAP_H = 757;

  /* ── 地图数据：坐标 = 底图像素 ÷ 底图尺寸（逐点精确对位） ── */
  const PLACES = [
    { id: 'ruijin', name: '瑞金', type: 'start',
      rx: 748 / MAP_W, ry: 640 / MAP_H, time: '1934年10月',
      desc: '中央红军长征出发地。中华苏维埃共和国临时中央政府所在地，被称为“红色故都”。',
      geo: '位于江西省东南部、武夷山脉西麓，山地丘陵为主，地势起伏、林木茂密，天然利于游击战。',
      img: 'assets/photo/assembly.webp' },

    { id: 'xiangjiang', name: '湘江战役', type: 'battle',
      rx: 560 / MAP_W, ry: 650 / MAP_H, time: '1934年11月',
      desc: '红军突破第四道封锁线强渡湘江，损失惨重，由出发时的 8.6 万人锐减到 3 万余人。',
      geo: '湘江是长江重要支流，发源于广西，自南向北纵贯湖南；河面宽、流速急，两岸丘陵便于敌军封锁火力。',
      img: 'assets/event/xiangjiang-map.webp' },

    { id: 'tongdao', name: '通道转兵', type: 'meeting',
      rx: 445 / MAP_W, ry: 602 / MAP_H, time: '1934年12月',
      desc: '中央红军在此放弃北上湘西的原定计划，改向敌人力量薄弱的贵州，史称“通道转兵”。',
      geo: '位于湖南省西南部，与贵州、广西接壤，地形以山地为主，是湘桂黔交界的交通孔道。',
      img: 'assets/map/route-simple.webp' },

    { id: 'liping', name: '黎平会议', type: 'meeting',
      rx: 412 / MAP_W, ry: 596 / MAP_H, time: '1934年12月',
      desc: '政治局会议，正式决定向贵州腹地转移，为遵义会议作了直接准备。',
      geo: '位于贵州省黔东南苗族侗族自治州，地处云贵高原东缘，山地地形，苗侗村寨密布。',
      img: 'assets/event/four-crossings.webp' },

    { id: 'wujiang', name: '强渡乌江', type: 'battle',
      rx: 392 / MAP_W, ry: 560 / MAP_H, time: '1935年1月',
      desc: '红军扎竹筏、架浮桥强渡乌江天险，打开了通往遵义的大门。',
      geo: '乌江是贵州最大河流，发源于威宁草海，多峡谷险滩，自古有“天堑”之称。',
      img: 'assets/event/river-crossing.webp' },

    { id: 'zunyi', name: '遵义会议', type: 'meeting',
      rx: 348 / MAP_W, ry: 550 / MAP_H, time: '1935年1月',
      desc: '中共中央政治局扩大会议，党的历史上一个生死攸关的转折点，也是党从幼年走向成熟的标志。',
      geo: '遵义位于贵州北部大娄山南麓，是贵州第二大城市、川黔交通要冲，素有“黔北咽喉”之称。',
      img: 'assets/photo/zunyi-site-old.webp' },

    { id: 'chishui', name: '四渡赤水', type: 'route',
      rx: 302 / MAP_W, ry: 528 / MAP_H, time: '1935年1—3月',
      desc: '毛泽东指挥红军四次渡过赤水河，声东击西、忽南忽北，打乱了敌人的“追剿”计划。',
      geo: '赤水河是长江上游南岸支流，发源于云南，因河水含铁质呈红色而得名，全长 444 千米。',
      img: 'assets/event/four-crossings.webp' },

    { id: 'jinshajiang', name: '巧渡金沙江', type: 'battle',
      rx: 78 / MAP_W, ry: 588 / MAP_H, time: '1935年5月',
      desc: '红军在禄劝皎平渡仅靠 7 只小船，昼夜不停用了 9 天 9 夜渡过金沙江，跳出敌人重围。',
      geo: '金沙江是长江上游干流，流经横断山区，河谷深切、水流湍急，是川滇之间的天然屏障。',
      img: 'assets/event/jinsha-river.webp' },

    { id: 'luding_daduhe', name: '强渡大渡河', type: 'battle',
      rx: 162 / MAP_W, ry: 478 / MAP_H, time: '1935年5月',
      desc: '红军在安顺场强渡大渡河，十七勇士冒着枪林弹雨打开通路，粉碎蒋介石“石达开第二”的妄想。',
      geo: '大渡河是岷江最大支流，发源于青藏高原，流经横断山区，山高谷深、落差巨大、水流湍急。',
      img: 'assets/event/force-dadu.webp' },

    { id: 'luding', name: '飞夺泸定桥', type: 'battle',
      rx: 228 / MAP_W, ry: 452 / MAP_H, time: '1935年5月',
      desc: '红军一昼夜奔袭 240 里，22 名勇士攀着 13 根铁索飞夺泸定桥，打开北上通道。',
      geo: '大渡河泸定段河谷深切、两岸悬崖壁立；泸定桥建于 1706 年，13 根铁链横跨大渡河，是茶马古道要津。',
      img: 'assets/event/luding-bridge.webp' },

    { id: 'xueshancaodi', name: '雪山草地', type: 'route',
      rx: 194 / MAP_W, ry: 358 / MAP_H, time: '1935年6—8月',
      desc: '红军翻越夹金山等大雪山、穿越松潘草地，以野菜皮带充饥，付出巨大牺牲。',
      geo: '夹金山海拔 4114 米，属横断山系；松潘草地海拔约 3500 米，是高寒沼泽湿地，也是黄河上游重要水源地。',
      img: 'assets/event/snow-mountain.webp' },

    { id: 'lazikouluzi', name: '突破腊子口', type: 'battle',
      rx: 258 / MAP_W, ry: 282 / MAP_H, time: '1935年9月',
      desc: '红军正面强攻、侧后攀崖奇袭，一举突破甘南天险腊子口，打开了进入陕甘的大门。',
      geo: '腊子口位于甘肃省迭部县，两侧峭壁高达数百米，宽仅 30 余米，只有一条小路通过。',
      img: 'assets/event/lazikou.webp' },

    { id: 'wuqizhen', name: '吴起镇会师', type: 'route',
      rx: 418 / MAP_W, ry: 108 / MAP_H, time: '1935年10月',
      desc: '中央红军到达陕北吴起镇，与陕北红军会师，中央红军历时一年的长征胜利结束。',
      geo: '吴起镇（今吴起县）位于陕西省延安市，地处黄土高原腹地，沟壑纵横、水土流失严重。',
      img: 'assets/photo/wuqi-town.webp', tall: true },   // tall：竖构图，卡片里按完整图显示（不裁切）

    { id: 'huining', name: '会宁会师', type: 'end',
      rx: 300 / MAP_W, ry: 165 / MAP_H, time: '1936年10月',
      desc: '红军三大主力（红一、红二、红四方面军）在甘肃会宁、将台堡会师，长征宣告胜利结束。',
      geo: '会宁位于甘肃省中部，地处黄土高原与内蒙古高原过渡地带，气候干旱，年均降水约 320 毫米。',
      img: 'assets/event/join-forces.webp' },
  ];

  /* 路线节点顺序（按历史进程连线） */
  const ROUTE_IDS = [
    'ruijin', 'xiangjiang', 'tongdao', 'liping', 'wujiang',
    'zunyi', 'chishui', 'jinshajiang', 'luding_daduhe', 'luding',
    'xueshancaodi', 'lazikouluzi', 'wuqizhen', 'huining'
  ];

  /* 标签方位：避开密集区互相压字（b下 t上 l左 r右） */
  const LABEL_POS = {
    ruijin: 'r', xiangjiang: 'b', tongdao: 't', liping: 'l', wujiang: 'r',
    zunyi: 'b', chishui: 'l', jinshajiang: 'r', luding_daduhe: 'l', luding: 'r',
    xueshancaodi: 'l', lazikouluzi: 'r', wuqizhen: 't', huining: 'b'
  };

  let highlightId = null;
  let unlockedIdx = 0;

  let state = { tx: 0, ty: 0, scale: 1 };
  let dragging = false, dragStart = { x: 0, y: 0 }, stateStart = null, movedPx = 0;

  let canvas, ctx, tooltip, W = 0, H = 0;
  let animFrame = null, pulseT = 0;

  /* 底图在画布中的适配矩形（等比、居中） */
  const fit = { x: 0, y: 0, w: 0, h: 0, scale: 1 };
  let mapImg = null, mapReady = false;

  const COLOR = {
    route:     '#e6392b',
    routeGlow: 'rgba(255,96,72,.55)',
    routeDim:  'rgba(130,132,142,.55)',
    battle:    '#e8622a',
    meeting:   '#e2b13c',
    start:     '#d92b3a',
    end:       '#3fa85a',
    routeDot:  '#2f6fb5',
    current:   '#19d97a',
    label:     '#ffffff',
    labelDim:  'rgba(255,255,255,.45)',
  };

  /* ── 初始化 ── */
  function init() {
    canvas  = document.getElementById('map-canvas');
    tooltip = document.getElementById('map-tooltip');
    if (!canvas) return;

    loadMapImage();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup',   onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('click', onClick);

    document.getElementById('map-zoom-in') ?.addEventListener('click', () => zoom(1.25));
    document.getElementById('map-zoom-out')?.addEventListener('click', () => zoom(0.8));
    document.getElementById('map-reset')  ?.addEventListener('click', resetView);

    startAnim();
  }

  function loadMapImage() {
    const img = new Image();
    img.onload = () => { mapImg = img; mapReady = true; };
    img.onerror = () => { mapReady = false; };
    img.src = MAP_SRC;
  }

  function resizeCanvas() {
    const container = document.getElementById('scene-map');
    if (!container) return;
    W = container.clientWidth;
    H = container.clientHeight;
    canvas.width  = W;
    canvas.height = H;
    ctx = canvas.getContext('2d');
    computeFit();
  }

  function computeFit() {
    if (!W || !H) return;
    const imgAspect = MAP_W / MAP_H, canvasAspect = W / H;
    if (canvasAspect > imgAspect) { fit.h = H; fit.w = H * imgAspect; }
    else { fit.w = W; fit.h = W / imgAspect; }
    fit.x = (W - fit.w) / 2;
    fit.y = (H - fit.h) / 2;
    fit.scale = fit.w / MAP_W;
  }

  function worldOf(rx, ry) { return { x: fit.x + rx * fit.w, y: fit.y + ry * fit.h }; }

  /* ── 绘制 ── */
  function startAnim() {
    const tick = (t) => { pulseT = t; drawAll(); animFrame = requestAnimationFrame(tick); };
    animFrame = requestAnimationFrame(tick);
  }

  function drawAll() {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#070a0e';
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(state.tx, state.ty);
    ctx.scale(state.scale, state.scale);

    drawBaseMap();
    drawRoutes();
    drawPlaces();

    ctx.restore();
  }

  function drawBaseMap() {
    if (mapReady && mapImg) {
      ctx.drawImage(mapImg, fit.x, fit.y, fit.w, fit.h);
      ctx.fillStyle = 'rgba(4,8,14,.16)';
      ctx.fillRect(fit.x, fit.y, fit.w, fit.h);
      ctx.strokeStyle = 'rgba(216,176,98,.45)';
      ctx.lineWidth = 1.5 / state.scale;
      ctx.strokeRect(fit.x, fit.y, fit.w, fit.h);
    } else {
      ctx.fillStyle = '#101822';
      ctx.fillRect(fit.x, fit.y, fit.w, fit.h);
      ctx.fillStyle = 'rgba(255,255,255,.5)';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('正在载入长征路线图…', fit.x + fit.w / 2, fit.y + fit.h / 2);
      ctx.textAlign = 'left';
    }
  }

  function drawRoutes() {
    for (let i = 0; i < ROUTE_IDS.length - 1; i++) {
      const a = PLACES.find(p => p.id === ROUTE_IDS[i]);
      const b = PLACES.find(p => p.id === ROUTE_IDS[i + 1]);
      if (!a || !b) continue;
      const unlocked = i < unlockedIdx;
      const A = worldOf(a.rx, a.ry), B = worldOf(b.rx, b.ry);

      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      const cx1 = A.x + (B.x - A.x) * 0.35 + (B.y - A.y) * 0.12;
      const cy1 = A.y + (B.y - A.y) * 0.35 - (B.x - A.x) * 0.12;
      ctx.quadraticCurveTo(cx1, cy1, B.x, B.y);

      if (unlocked) {
        ctx.strokeStyle = COLOR.routeGlow;
        ctx.lineWidth = 9 / state.scale;
        ctx.globalAlpha = 0.5;
        ctx.stroke();
        ctx.strokeStyle = COLOR.route;
        ctx.lineWidth = 3.5 / state.scale;
        ctx.globalAlpha = 0.95;
        ctx.stroke();
      } else {
        ctx.strokeStyle = COLOR.routeDim;
        ctx.lineWidth = 2 / state.scale;
        ctx.setLineDash([6 / state.scale, 7 / state.scale]);
        ctx.globalAlpha = 0.5;
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      if (unlocked) {
        const t = ((pulseT / 1400) % 1);
        const px = A.x + (B.x - A.x) * t + (cx1 - A.x) * t * (1 - t) * 2;
        const py = A.y + (B.y - A.y) * t + (cy1 - A.y) * t * (1 - t) * 2;
        ctx.beginPath();
        ctx.arc(px, py, 4.5 / state.scale, 0, Math.PI * 2);
        ctx.fillStyle = '#ffd27a';
        ctx.globalAlpha = 0.9;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  }

  function drawPlaces() {
    const pulse = Math.sin(pulseT / 420) * 0.4 + 0.6;
    const k = 1 / state.scale;

    PLACES.forEach((p) => {
      const P = worldOf(p.rx, p.ry);
      const idx = ROUTE_IDS.indexOf(p.id);
      const isUnlocked = unlockedIdx >= ROUTE_IDS.length || idx < 0 || idx < unlockedIdx;
      const isCurrent = (idx === unlockedIdx - 1);
      const isHighlight = (p.id === highlightId);

      let dotColor, dotR;
      switch (p.type) {
        case 'start':   dotColor = COLOR.start;   dotR = 7;   break;
        case 'end':     dotColor = COLOR.end;     dotR = 8;   break;
        case 'battle':  dotColor = COLOR.battle;  dotR = 6.5; break;
        case 'meeting': dotColor = COLOR.meeting; dotR = 7;   break;
        default:        dotColor = COLOR.routeDot; dotR = 5.5;
      }

      ctx.globalAlpha = isUnlocked ? 1 : 0.4;

      if (isCurrent || isHighlight) {
        const r = (dotR + 8 * pulse) * k;
        ctx.beginPath(); ctx.arc(P.x, P.y, r, 0, Math.PI * 2);
        ctx.fillStyle = isCurrent ? 'rgba(25,217,122,.22)' : 'rgba(255,210,122,.25)';
        ctx.fill();
        ctx.strokeStyle = isCurrent ? 'rgba(25,217,122,.85)' : 'rgba(255,210,122,.9)';
        ctx.lineWidth = 1.6 * k; ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(P.x, P.y, (isCurrent ? dotR * (0.9 + pulse * 0.25) : dotR) * k, 0, Math.PI * 2);
      ctx.fillStyle = isHighlight ? '#ffffff' : (isCurrent ? COLOR.current : dotColor);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.7)';
      ctx.lineWidth = 1.8 * k;
      ctx.stroke();

      /* 标签 */
      const fs = (isHighlight || isCurrent ? 13.5 : 12.5) * k;
      const off = LABEL_POS[p.id] || 'b';
      ctx.font = `${isHighlight || isCurrent ? '700' : '600'} ${fs}px "Noto Sans SC","PingFang SC",sans-serif`;
      const tw = ctx.measureText(p.name).width;
      const gap = (dotR + 5) * k;
      let lx = P.x, ly;
      if (off === 'l') { lx = P.x - gap - tw / 2; ly = P.y + fs * 0.35; }
      else if (off === 'r') { lx = P.x + gap + tw / 2; ly = P.y + fs * 0.35; }
      else if (off === 't') { ly = P.y - gap - fs * 0.6; }
      else { ly = P.y + gap + fs * 1.1; }

      ctx.fillStyle = 'rgba(6,10,16,.8)';
      roundRect(lx - tw / 2 - 5 * k, ly - fs * 0.85, tw + 10 * k, fs * 1.5, 3 * k);
      ctx.fill();
      if (isHighlight || isCurrent) {
        ctx.strokeStyle = isHighlight ? 'rgba(255,210,122,.95)' : 'rgba(25,217,122,.85)';
        ctx.lineWidth = 1 * k; ctx.stroke();
      }
      ctx.fillStyle = isHighlight ? '#ffe6b0' : (isUnlocked ? COLOR.label : COLOR.labelDim);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.name, lx, ly);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.globalAlpha = 1;
    });
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /* ── 交互 ── */
  function onMouseDown(e) {
    dragging = true; movedPx = 0;
    dragStart = { x: e.clientX, y: e.clientY };
    stateStart = { ...state };
    canvas.style.cursor = 'grabbing';
  }

  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    if (dragging) {
      const dx = e.clientX - dragStart.x, dy = e.clientY - dragStart.y;
      movedPx = Math.abs(dx) + Math.abs(dy);
      state.tx = stateStart.tx + dx;
      state.ty = stateStart.ty + dy;
      clampPan();
      hideTooltip();
    } else {
      const hit = hitTest(mx, my);
      if (hit) { showTooltip(hit); canvas.style.cursor = 'pointer'; }
      else { hideTooltip(); canvas.style.cursor = 'grab'; }
    }
  }

  function onMouseUp() { dragging = false; canvas.style.cursor = 'grab'; }

  function onWheel(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    zoomAt(e.deltaY < 0 ? 1.12 : 0.88, e.clientX - rect.left, e.clientY - rect.top);
  }

  function onClick(e) {
    if (movedPx > 6) { movedPx = 0; return; }
    const rect = canvas.getBoundingClientRect();
    const hit = hitTest(e.clientX - rect.left, e.clientY - rect.top);
    if (hit && window.Engine && window.Engine.onMapClick) window.Engine.onMapClick(hit.id, hit);
  }

  function hitTest(mx, my) {
    const wx = (mx - state.tx) / state.scale;
    const wy = (my - state.ty) / state.scale;
    let best = null, bestD = 22 / state.scale;
    for (const p of PLACES) {
      const P = worldOf(p.rx, p.ry);
      const d = Math.hypot(P.x - wx, P.y - wy);
      if (d < bestD) { bestD = d; best = p; }
    }
    return best;
  }

  /* 已显示的地点 id：鼠标在地点上移动时不重建内容，避免闪烁与图片重载 */
  let tipId = null;
  let tipFixA = null, tipFixB = null;

  /** 把卡片摆到地点旁边
   *  定位完全用固定量计算，不读取实测尺寸——
   *  实测值在首次渲染后的几百毫秒里会因图片/文本换行而变化，
   *  一旦拿它参与定位，卡片就会「落位漂移」。 */
  function positionTooltip(place) {
    const P = screenPosOf(place.id);
    const M = 10;                 // 左右 / 底部边距
    const MT = 96;                // 顶部边距：让开署名横幅(32) + HUD(58)
    const TW = 320;               // 卡片固定宽度（与 CSS 一致）
    const TH = 350;               // 标称高度（实际 300~400，含竖图时更高）

    let x = P.x + 22;                                     // 默认放地点右侧
    if (x + TW > W - M) x = P.x - TW - 22;                // 右边放不下 → 翻到左侧
    x = Math.max(M, Math.min(W - TW - M, x));

    let y = P.y - TH / 2;                                 // 垂直居中于地点
    if (y + TH > H - M) y = H - TH - M;                   // 底部放不下 → 贴底
    y = Math.max(MT, y);          // 卡片不要钻到横幅/HUD 底下

    tooltip.style.left = Math.round(x) + 'px';
    tooltip.style.top  = Math.round(y) + 'px';
  }

  function showTooltip(place) {
    if (!tooltip) return;

    /* 关键：只有「换到另一个地点」时才重建内容并定位。
       鼠标在同一个地点上移动不会触发任何重排 → 卡片纹丝不动，不会抽搐 */
    if (tipId !== place.id) {
      tipId = place.id;
      clearTimeout(tipFixA); clearTimeout(tipFixB);

      tooltip.innerHTML =
        `<div class="tt-head">
           <span class="tt-name">${place.name}</span>
           <span class="tt-time">${place.time || ''}</span>
         </div>
         ${place.img ? `<img class="tt-img${place.tall ? ' tt-img--tall' : ''}" src="${place.img}" alt="${place.name}" draggable="false">` : ''}
         <div class="tt-desc">${place.desc}</div>
         <div class="tt-geo"><span class="tt-geo-tag">地理</span>${place.geo}</div>`;

      tooltip.classList.add('visible');
      positionTooltip(place);

      /* 图片/字体落定后再各校一次，消掉首帧的高度偏差 */
      const fix = () => { if (tipId === place.id) positionTooltip(place); };
      requestAnimationFrame(fix);
      tipFixA = setTimeout(fix, 120);
      tipFixB = setTimeout(fix, 420);
    }

    /* 悬停卡片出现时，暂时收起右下角的操作提示 */
    const tip = document.getElementById('map-tip');
    if (tip) tip.style.opacity = '0';
  }

  function hideTooltip() {
    tooltip?.classList.remove('visible');
    tipId = null;
    clearTimeout(tipFixA); clearTimeout(tipFixB);
    const tip = document.getElementById('map-tip');
    if (tip) tip.style.opacity = '';
  }

  /* ── 缩放 ── */
  function zoom(factor) { zoomAt(factor, W / 2, H / 2); }
  function zoomAt(factor, cx, cy) {
    const newScale = Math.max(1, Math.min(5, state.scale * factor));
    const ratio = newScale / state.scale;
    state.tx = cx - ratio * (cx - state.tx);
    state.ty = cy - ratio * (cy - state.ty);
    state.scale = newScale;
    clampPan();
  }
  /* 按底图实际渲染范围约束平移：装得下就居中，装不下就限制在边界内 */
  function clampPan() {
    const mw = fit.w * state.scale, mh = fit.h * state.scale;
    if (mw <= W) state.tx = (W - mw) / 2 - fit.x;
    else state.tx = Math.min(-fit.x, Math.max(W - fit.x - mw, state.tx));
    if (mh <= H) state.ty = (H - mh) / 2 - fit.y;
    else state.ty = Math.min(-fit.y, Math.max(H - fit.y - mh, state.ty));
  }

  function resetView() { state = { tx: 0, ty: 0, scale: 1 }; }

  /* ── 公开 API ── */
  function setHighlight(id) {
    highlightId = id;
    if (id) { const p = PLACES.find(pl => pl.id === id); if (p) focusOn(p.rx, p.ry); }
  }
  function focusOn(rx, ry) {
    const targetScale = 1.45;
    const w = worldOf(rx, ry);
    state.scale = targetScale;
    state.tx = W / 2 - w.x * targetScale;
    state.ty = H / 2 - w.y * targetScale;
    clampPan();
  }
  function setUnlockedIdx(idx) { unlockedIdx = idx; }
  /** 查询某个地点当前在画布上的像素位置（已含拖拽缩放） */
  function screenPosOf(id) {
    const p = PLACES.find(x => x.id === id);
    if (!p) return null;
    const w = worldOf(p.rx, p.ry);
    return { x: w.x * state.scale + state.tx, y: w.y * state.scale + state.ty, scale: state.scale };
  }
  function getPlaceById(id) { return PLACES.find(p => p.id === id) || null; }
  function destroy() { if (animFrame) cancelAnimationFrame(animFrame); }

  return { init, setHighlight, setUnlockedIdx, getPlaceById, screenPosOf, focusOn, resetView, destroy, PLACES };

})();
