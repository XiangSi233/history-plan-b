/**
 * scene3d.js — Three.js 三维互动场景（ES Module，本地 three.js，无需联网）
 *   zunyi_meeting  遵义会议室：木质房间、长桌地图、油灯、参会人物
 *   luding_bridge  泸定桥：峡谷激流、13 根铁索、对岸火光、雨幕
 *   snow_mountain  雪山：连绵雪峰、风雪、行军队伍
 *
 * 交互：拖拽旋转 · 滚轮缩放 · 双击复位
 */

import * as THREE from '../vendor/three.module.js';

/* ===========================================================
   程序化纹理（不依赖任何外部贴图）
   =========================================================== */
function cv(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return { c, x: c.getContext('2d') }; }
const rnd = (a, b) => a + Math.random() * (b - a);
function tex(c, rx = 1, ry = 1, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.anisotropy = 4;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const cl = (v) => Math.min(255, Math.max(0, v));
  return `rgb(${cl((n >> 16) + amt)},${cl(((n >> 8) & 255) + amt)},${cl((n & 255) + amt)})`;
}

function woodTex(base = '#4e3320', dark = '#2a1a0c', rep = [4, 3]) {
  const { c, x } = cv(512, 512);
  x.fillStyle = base; x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 8; i++) {
    const y = i * 64;
    x.fillStyle = shade(base, rnd(-14, 14)); x.fillRect(0, y, 512, 62);
    for (let g = 0; g < 42; g++) {
      x.strokeStyle = `rgba(${20 + rnd(0, 40) | 0},${12 + rnd(0, 26) | 0},${6 + rnd(0, 16) | 0},${rnd(.05, .2)})`;
      x.lineWidth = rnd(.6, 1.7);
      x.beginPath();
      const yy = y + rnd(2, 58);
      x.moveTo(0, yy);
      for (let px = 0; px <= 512; px += 32) x.lineTo(px, yy + Math.sin((px + g * 40) * .03) * rnd(1, 4));
      x.stroke();
    }
    x.fillStyle = dark; x.globalAlpha = .85; x.fillRect(0, y + 62, 512, 2); x.globalAlpha = 1;
  }
  for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(0,0,0,${rnd(.01, .06)})`; x.fillRect(rnd(0, 512), rnd(0, 512), rnd(1, 40), rnd(1, 3)); }
  return tex(c, rep[0], rep[1]);
}

function plasterTex(rep = [3, 2]) {
  const { c, x } = cv(512, 512);
  x.fillStyle = '#6a6558'; x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 240; i++) {
    const g = x.createRadialGradient(rnd(0, 512), rnd(0, 512), 1, rnd(0, 512), rnd(0, 512), rnd(30, 140));
    g.addColorStop(0, `rgba(${rnd(30, 70) | 0},${rnd(28, 62) | 0},${rnd(22, 50) | 0},${rnd(.05, .2)})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 512, 512);
  }
  return tex(c, rep[0], rep[1]);
}

function brickTex(rep = [4, 2]) {
  const { c, x } = cv(512, 512);
  x.fillStyle = '#2b2f35'; x.fillRect(0, 0, 512, 512);
  const bw = 86, bh = 38, gap = 5;
  for (let row = 0, y = 0; y < 512; y += bh + gap, row++) {
    const off = (row % 2) * (bw + gap) / 2;
    for (let bx = -bw; bx < 512 + bw; bx += bw + gap) {
      x.fillStyle = shade('#4a4d52', rnd(-10, 12));
      x.fillRect(bx + off, y, bw, bh);
      x.fillStyle = `rgba(255,255,255,${rnd(.01, .05)})`; x.fillRect(bx + off, y, bw, 3);
      x.fillStyle = `rgba(0,0,0,${rnd(.05, .16)})`; x.fillRect(bx + off, y + bh - 3, bw, 3);
    }
  }
  return tex(c, rep[0], rep[1]);
}

function paperTex(rep = [1, 1]) {
  const { c, x } = cv(256, 256);
  x.fillStyle = '#d8cbaa'; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 600; i++) {
    x.fillStyle = `rgba(${rnd(120, 190) | 0},${rnd(100, 170) | 0},${rnd(70, 130) | 0},${rnd(.03, .12)})`;
    x.fillRect(rnd(0, 256), rnd(0, 256), rnd(2, 30), rnd(1, 6));
  }
  return tex(c, rep[0], rep[1]);
}

function rockTex(rep = [3, 3]) {
  const { c, x } = cv(512, 512);
  x.fillStyle = '#4a4238'; x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 300; i++) {
    const g = x.createRadialGradient(rnd(0, 512), rnd(0, 512), 1, rnd(0, 512), rnd(0, 512), rnd(20, 120));
    g.addColorStop(0, `rgba(${rnd(60, 110) | 0},${rnd(52, 96) | 0},${rnd(42, 80) | 0},${rnd(.08, .3)})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 512, 512);
  }
  for (let i = 0; i < 60; i++) {
    x.strokeStyle = `rgba(20,16,12,${rnd(.15, .4)})`; x.lineWidth = rnd(.5, 2);
    x.beginPath();
    let px = rnd(0, 512), py = rnd(0, 512);
    x.moveTo(px, py);
    for (let s = 0; s < 10; s++) { px += rnd(-40, 40); py += rnd(-30, 40); x.lineTo(px, py); }
    x.stroke();
  }
  return tex(c, rep[0], rep[1]);
}

function snowTex(rep = [6, 6]) {
  const { c, x } = cv(256, 256);
  x.fillStyle = '#dfe8f2'; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 500; i++) {
    x.fillStyle = `rgba(${rnd(200, 255) | 0},${rnd(210, 255) | 0},${rnd(225, 255) | 0},${rnd(.05, .35)})`;
    x.fillRect(rnd(0, 256), rnd(0, 256), rnd(2, 22), rnd(1, 6));
  }
  for (let i = 0; i < 200; i++) {
    x.fillStyle = `rgba(140,160,190,${rnd(.03, .14)})`;
    x.fillRect(rnd(0, 256), rnd(0, 256), rnd(1, 14), rnd(1, 3));
  }
  return tex(c, rep[0], rep[1]);
}

function waterTex() {
  const { c, x } = cv(512, 512);
  const g = x.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, '#123b52'); g.addColorStop(.5, '#0d2b3d'); g.addColorStop(1, '#0a2030');
  x.fillStyle = g; x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 260; i++) {
    x.strokeStyle = `rgba(190,225,245,${rnd(.05, .3)})`;
    x.lineWidth = rnd(.8, 2.4);
    x.beginPath();
    const y0 = rnd(0, 512);
    x.moveTo(0, y0);
    for (let px = 0; px <= 512; px += 24) x.lineTo(px, y0 + Math.sin((px + i * 30) * .05) * rnd(3, 10));
    x.stroke();
  }
  return tex(c, 3, 3);
}

function nightWindowTex() {
  const { c, x } = cv(256, 256);
  const g = x.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#16304f'); g.addColorStop(.55, '#0e2038'); g.addColorStop(1, '#071324');
  x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  x.fillStyle = 'rgba(4,10,18,.9)';
  x.beginPath(); x.moveTo(0, 210);
  for (let px = 0; px <= 256; px += 16) x.lineTo(px, 200 - Math.sin(px * .06) * 22 - rnd(0, 12));
  x.lineTo(256, 256); x.lineTo(0, 256); x.closePath(); x.fill();
  for (let i = 0; i < 70; i++) { x.fillStyle = `rgba(220,235,255,${rnd(.15, .7)})`; x.fillRect(rnd(0, 256), rnd(0, 150), rnd(.8, 1.8), rnd(.8, 1.8)); }
  const t = tex(c, 1, 1); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t;
}

function glowTex(inner = 'rgba(255,205,140,.95)', mid = 'rgba(255,150,60,.35)') {
  const { c, x } = cv(128, 128);
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, inner); g.addColorStop(.35, mid); g.addColorStop(1, 'rgba(255,120,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function dotTex() {
  const { c, x } = cv(32, 32);
  const g = x.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 32, 32);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/* ===========================================================
   引擎
   =========================================================== */
let renderer, scene, camera, animId = null;
let currentScene = null;
let clock = null;
let updaters = [];                 // 每个场景的逐帧更新函数
const canvas = document.getElementById('canvas-3d');

/* ── 可互动人物（自由探索 / 自动模式共用） ── */
let actors = [];                   // [{ id, name, pos, ry, fig, el }]
let hoverId = null;                // 鼠标悬停到的人物
let activeId = null;               // 正在发言的人物
let interactive = false;           // 是否允许点击人物
let pickCb = null;                 // 点击回调（由 engine 注入）
const actorLayer = document.getElementById('actor-layer');
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let limitBase = 0, limitRange = Math.PI;   // 当前允许的水平旋转范围

/* 简化轨道控制（带阻尼） */
const orbit = {
  theta: 0.35, phi: Math.PI / 3, radius: 7,
  tTheta: 0.35, tPhi: Math.PI / 3, tRadius: 7,
  target: new THREE.Vector3(0, 0.6, 0),
  tTarget: new THREE.Vector3(0, 0.6, 0),
  drag: null,
};

function init() {
  if (!canvas || renderer) return;
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(52, 1, 0.1, 300);
  clock = new THREE.Clock();

  initOrbit();
  resize();
  window.addEventListener('resize', resize);
  animate();
}

function resize() {
  if (!renderer || !canvas) return;
  const w = canvas.clientWidth || canvas.offsetWidth || 800;
  const h = canvas.clientHeight || canvas.offsetHeight || 500;
  renderer.setSize(w, h, false);
  if (camera) { camera.aspect = w / h; camera.updateProjectionMatrix(); }
  mobileHint();
}

function animate() {
  animId = requestAnimationFrame(animate);
  if (!renderer || !scene || !camera) return;
  const dt = Math.min(0.05, clock.getDelta());
  const t = clock.elapsedTime;

  /* 阻尼 */
  orbit.theta += (orbit.tTheta - orbit.theta) * Math.min(1, dt * 8);
  orbit.phi   += (orbit.tPhi   - orbit.phi)   * Math.min(1, dt * 8);
  orbit.radius+= (orbit.tRadius- orbit.radius)* Math.min(1, dt * 8);
  orbit.target.lerp(orbit.tTarget, Math.min(1, dt * 6));

  const r = orbit.radius;
  camera.position.set(
    r * Math.sin(orbit.phi) * Math.sin(orbit.theta),
    r * Math.cos(orbit.phi),
    r * Math.sin(orbit.phi) * Math.cos(orbit.theta)
  );
  camera.lookAt(orbit.target);

  for (const fn of updaters) fn(dt, t);
  updateLabels();
  renderer.render(scene, camera);
}

/* ===========================================================
   人物名牌：把三维人物的头顶投影到屏幕上的 HTML 标签
   =========================================================== */
function buildLabels() {
  if (!actorLayer) return;
  actorLayer.innerHTML = '';
  for (const a of actors) {
    const d = document.createElement('div');
    d.className = 'actor-tag';
    d.dataset.id = a.id;
    d.innerHTML = `<span class="actor-tag__dot"></span><span class="actor-tag__name">${a.name}</span>`;
    d.addEventListener('click', (e) => {
      e.stopPropagation();
      if (interactive && pickCb) pickCb(a.id);
    });
    d.addEventListener('mouseenter', () => { if (interactive) markHot(a.id); });
    d.addEventListener('mouseleave', () => { if (interactive) markHot(hoverId === a.id ? null : hoverId); });
    actorLayer.appendChild(d);
    a.el = d;
    /* 名牌默认悬在头顶，个别人物会互相压住，用 off 微调 */
    const off = a.off || { x: 0, y: 0 };
    a.head = new THREE.Vector3(a.pos.x, a.pos.y + 1.46, a.pos.z);
    a.tagOff = off;
  }
  markHot(activeId);
}

function updateLabels() {
  if (!actorLayer || !actors.length || !canvas) return;
  const vis = !!currentScene && actorLayer.offsetParent !== null;
  const W = canvas.clientWidth, H = canvas.clientHeight;
  for (const a of actors) {
    if (!a.el) continue;
    if (!vis || !a.enabled) { a.el.style.display = 'none'; continue; }
    const v = a.head.clone().project(camera);
    if (v.z > 1 || !isFinite(v.x)) { a.el.style.display = 'none'; continue; }
    const x = (v.x * .5 + .5) * W, y = (-v.y * .5 + .5) * H;
    if (x < -120 || x > W + 120 || y < -60 || y > H + 60) { a.el.style.display = 'none'; continue; }
    a.el.style.display = '';
    const ox = a.tagOff?.x || 0, oy = a.tagOff?.y || 0;
    a.el.style.transform = `translate(-50%,-100%) translate(${(x + ox).toFixed(1)}px,${(y + oy).toFixed(1)}px)`;
  }
}

function markHot(id) {
  hoverId = id;
  for (const a of actors) {
    if (!a.el) continue;
    a.el.classList.toggle('is-hot', a.id === hoverId && interactive);
    a.el.classList.toggle('is-active', a.id === activeId);
    a.el.classList.toggle('is-off', interactive && !a.enabled);
  }
  if (canvas) canvas.style.cursor = interactive ? (hoverId ? 'pointer' : 'grab') : 'grab';
}

/** 屏幕坐标 → 人物 id（射线拾取，带放大的隐形拾取盒） */
function pickAt(clientX, clientY) {
  if (!actors.length || !canvas || !renderer) return null;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(ndc, camera);
  const boxes = actors.filter(a => a.enabled).map(a => a.hit);
  const hits = raycaster.intersectObjects(boxes, false);
  return hits.length ? hits[0].object.userData.actorId : null;
}

function initOrbit() {
  if (!canvas) return;
  const down = (e) => {
    orbit.drag = { x: e.clientX, y: e.clientY, theta: orbit.tTheta, phi: orbit.tPhi, moved: 0 };
    canvas.style.cursor = 'grabbing';
  };
  const move = (e) => {
    if (!orbit.drag) {
      /* 未拖拽时做悬停拾取 */
      if (interactive) markHot(pickAt(e.clientX, e.clientY));
      return;
    }
    const dx = e.clientX - orbit.drag.x, dy = e.clientY - orbit.drag.y;
    orbit.drag.moved += Math.abs(dx) + Math.abs(dy);
    orbit.tTheta = Math.max(limitBase - limitRange, Math.min(limitBase + limitRange, orbit.drag.theta - dx * 0.005));
    orbit.tPhi = Math.max(0.18, Math.min(Math.PI * 0.92, orbit.drag.phi + dy * 0.005));
  };
  const up = (e) => {
    const d = orbit.drag;
    orbit.drag = null;
    canvas.style.cursor = interactive ? (hoverId ? 'pointer' : 'grab') : 'grab';
    /* 位移很小 → 当作一次点击 */
    if (d && d.moved < 8 && e && typeof e.clientX === 'number') {
      const id = pickAt(e.clientX, e.clientY);
      if (id && pickCb) { markHot(id); pickCb(id); }
    }
  };

  canvas.addEventListener('mousedown', down);
  canvas.addEventListener('mousemove', move);
  canvas.addEventListener('mouseup', up);
  canvas.addEventListener('mouseleave', (e) => { up(e); markHot(null); });
  canvas.addEventListener('dblclick', () => resetView());
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    orbit.tRadius = Math.max(2.5, Math.min(30, orbit.tRadius + e.deltaY * 0.01));
  }, { passive: false });

  /* 触摸 */
  let pinch = null;
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) down(e.touches[0]);
    else if (e.touches.length === 2) {
      pinch = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    }
  }, { passive: true });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (e.touches.length === 1) move(e.touches[0]);
    else if (e.touches.length === 2 && pinch != null) {
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      orbit.tRadius = Math.max(2.5, Math.min(30, orbit.tRadius + (pinch - d) * 0.03));
      pinch = d;
    }
  }, { passive: false });
  canvas.addEventListener('touchend', (e) => { pinch = null; up(e.changedTouches && e.changedTouches[0]); });

  canvas.style.cursor = 'grab';
}

/** 恢复当前场景默认的水平旋转范围 */
function resetLimits() {
  const d = DESCR[currentScene];
  limitBase = d?.theta ?? 0;
  limitRange = d?.thetaRange ?? Math.PI;
}

function resetView() {
  orbit.tTheta = DESCR[currentScene]?.theta ?? 0.35;
  orbit.tPhi = DESCR[currentScene]?.phi ?? Math.PI / 3;
  orbit.tRadius = DESCR[currentScene]?.radius ?? 7;
  const tg = DESCR[currentScene]?.target;
  if (tg) orbit.tTarget.set(tg[0], tg[1], tg[2]);
  resetLimits();
  activeId = null;
  buildLabels();
}

const DESCR = {
  zunyi_meeting: { theta: 0.0, phi: 1.34, radius: 6.2, target: [0, 1.15, 0], thetaRange: 1.5 },
  luding_bridge: { theta: 0.26, phi: 1.30, radius: 17, target: [0, 2.0, 0], thetaRange: 0.7 },
  snow_mountain: { theta: 0.02, phi: 1.29, radius: 23, target: [0, 6, -36], thetaRange: 0.8 },
};

/* ===========================================================
   公共零件
   =========================================================== */
/** 渐变天空穹顶（物理尺寸很大，只提供背景） */
function skyDome(top, bottom) {
  const { c, x } = cv(4, 256);
  const g = x.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, top); g.addColorStop(0.55, bottom); g.addColorStop(1, bottom);
  x.fillStyle = g; x.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(
    new THREE.SphereGeometry(200, 24, 16),
    new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, fog: false, depthWrite: false })
  );
}

/** 垂直渐隐贴图：上方不透明、下方透明，用来把背景幕融进地面 */
function fadeAlphaTexture(fadeFrom = 0.58) {
  const { c, x } = cv(4, 256);
  const g = x.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(fadeFrom, '#ffffff');
  g.addColorStop(1, '#000000');
  x.fillStyle = g; x.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}

/** 带崎岖山脊的山峰（锥体顶点随机扰动） */
function makePeak(radius, height, segs = 14, jag = 0.26) {
  const g = new THREE.ConeGeometry(radius, height, segs, 5);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    const t = (y + height / 2) / height;          // 0=山脚 1=山顶
    const k = 1 + (Math.random() - .5) * jag * (1.15 - t * .6);
    p.setX(i, p.getX(i) * k);
    p.setZ(i, p.getZ(i) * k);
  }
  g.computeVertexNormals();
  return g;
}
function box(w, h, d) { return new THREE.BoxGeometry(w, h, d); }

/** 坐姿人物（低多边形，几何头部） */
function makeFigure(cfg = {}) {
  const g = new THREE.Group();
  const body = new THREE.Group();
  g.add(body);
  g.userData.body = body;

  const uniColor = new THREE.Color(cfg.uniform || '#767b80');
  const M = {
    uni: new THREE.MeshStandardMaterial({ color: uniColor, roughness: .93, metalness: .02 }),
    dark: new THREE.MeshStandardMaterial({ color: uniColor.clone().multiplyScalar(.72), roughness: .95 }),
    skin: new THREE.MeshStandardMaterial({ color: 0x9d7a5c, roughness: .88 }),
    boot: new THREE.MeshStandardMaterial({ color: 0x2b2620, roughness: .95 }),
    cap: new THREE.MeshStandardMaterial({ color: uniColor.clone().multiplyScalar(.72), roughness: .9 }),
    star: new THREE.MeshStandardMaterial({ color: 0xa81f27, roughness: .6, emissive: 0x2a0507 }),
  };
  const add = (geo, mat, x, y, z, rx = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z); m.rotation.x = rx;
    m.castShadow = true; m.receiveShadow = true;
    body.add(m); return m;
  };
  for (const s of [-1, 1]) {
    add(box(.14, .44, .15), M.dark, s * .105, .26, .42);
    add(box(.16, .16, .44), M.uni, s * .105, .475, .20);
    add(box(.15, .09, .26), M.boot, s * .105, .045, .46);
  }
  add(box(.32, .16, .30), M.uni, 0, .50, .02);
  add(box(.42, .54, .28), M.uni, 0, .80, -.01, .06);
  add(box(.435, .055, .295), M.dark, 0, .565, -.01, .06);
  for (const s of [-1, 1]) {
    add(box(.13, .15, .19), M.uni, s * .245, 1.115, 0);
    add(box(.12, .33, .14), M.uni, s * .25, .955, .06, -.55);
    add(box(.11, .30, .12), M.uni, s * .23, .80, .29, -1.25);
    add(box(.10, .08, .13), M.skin, s * .22, .70, .44);
  }
  add(new THREE.CylinderGeometry(.05, .056, .10, 10), M.skin, 0, 1.075, .02);
  const head = add(new THREE.SphereGeometry(.105, 18, 16), M.skin, 0, 1.20, .015);
  head.scale.set(1, 1.08, 1.02);
  if (cfg.cap !== false) {
    add(new THREE.CylinderGeometry(.118, .122, .07, 18), M.cap, 0, 1.29, .005);
    add(box(.19, .02, .09), M.cap, 0, 1.262, .10);
    add(box(.038, .038, .02), M.star, 0, 1.292, .118);
  } else {
    const hair = add(new THREE.SphereGeometry(.109, 18, 16), M.dark, 0, 1.215, .008);
    hair.scale.set(1.02, .8, 1.03);
  }
  if (cfg.glasses) add(box(.16, .026, .012), M.boot, 0, 1.212, .106);
  return g;
}

/** 站立人物（用于室外场景的远景队伍） */
function makeStandingFigure(color = '#3b4a3a') {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color, roughness: .95 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(.13, .17, .72, 7), mat);
  body.position.y = .36; g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.11, 10, 8), mat);
  head.position.y = .84; g.add(head);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(.125, .13, .07, 12), mat);
  cap.position.y = .91; g.add(cap);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}

/** 椅子 */
function makeChair(mat) {
  const g = new THREE.Group();
  const add = (w, h, d, x, y, z) => {
    const m = new THREE.Mesh(box(w, h, d), mat);
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; g.add(m);
  };
  add(.44, .055, .42, 0, .44, 0);
  add(.44, .40, .05, 0, .66, -.19);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(.05, .43, .05, sx * .19, .215, sz * .18);
  return g;
}

/** 飘浮粒子（尘埃 / 雪 / 雨） */
function makeParticles(count, spread, opts = {}) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const spd = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - .5) * spread[0];
    pos[i * 3 + 1] = Math.random() * spread[1] + (opts.y0 || 0);
    pos[i * 3 + 2] = (Math.random() - .5) * spread[2];
    spd[i] = opts.speed ? opts.speed[0] + Math.random() * (opts.speed[1] - opts.speed[0]) : .02 + Math.random() * .03;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    map: opts.map || dotTex(), size: opts.size || .03, transparent: true,
    opacity: opts.opacity ?? .5, blending: opts.blending ?? THREE.AdditiveBlending,
    depthWrite: false, sizeAttenuation: true, color: opts.color ?? 0xffffff,
  });
  const pts = new THREE.Points(geo, mat);
  return {
    pts,
    update(dt, t) {
      const p = geo.attributes.position.array;
      for (let i = 0; i < count; i++) {
        p[i * 3 + 1] += spd[i] * dt * (opts.fall ? -1 : 1);
        if (opts.drift) p[i * 3] += Math.sin(t * .4 + i) * opts.drift;
        if (opts.fall) {
          if (p[i * 3 + 1] < (opts.y0 || 0)) p[i * 3 + 1] = spread[1] + (opts.y0 || 0);
        } else if (p[i * 3 + 1] > spread[1] + (opts.y0 || 0)) {
          p[i * 3 + 1] = (opts.y0 || 0);
        }
      }
      geo.attributes.position.needsUpdate = true;
    }
  };
}

/* ===========================================================
   场景 1：遵义会议室
   =========================================================== */
function buildZunyiMeeting() {
  scene.background = new THREE.Color(0x04060a);
  scene.fog = new THREE.FogExp2(0x05070c, 0.038);

  const W = 13, D = 11, H = 3.7;
  const hw = W / 2, hd = D / 2;
  const root = new THREE.Group();
  scene.add(root);

  /* 材质 */
  const floorMat = new THREE.MeshStandardMaterial({ map: woodTex('#4e3320', '#2a1a0c', [4, 3]), roughness: .82, metalness: .04 });
  const ceilMat  = new THREE.MeshStandardMaterial({ map: plasterTex([3, 3]), color: 0x6a6455, roughness: 1 });
  const wallMat  = new THREE.MeshStandardMaterial({ map: plasterTex([3, 2]), color: 0x8a8272, roughness: .98 });
  const brickMat = new THREE.MeshStandardMaterial({ map: brickTex([4, 2]), color: 0x8f939a, roughness: .96 });
  const woodMat  = new THREE.MeshStandardMaterial({ map: woodTex('#5d3d22', '#33200e', [1, 1]), roughness: .7, metalness: .05 });
  const chairMat = new THREE.MeshStandardMaterial({ color: 0x4a3320, roughness: .85 });

  /* 地面 / 顶 */
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), floorMat);
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; root.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), ceilMat);
  ceil.rotation.x = Math.PI / 2; ceil.position.y = H; root.add(ceil);

  /* 墙 */
  const wall = (geo, x, y, z, ry, mat = wallMat) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true; root.add(m); return m;
  };
  wall(new THREE.PlaneGeometry(W, H), 0, H / 2, -hd, 0);
  wall(new THREE.PlaneGeometry(D, H), -hw, H / 2, 0, Math.PI / 2);
  wall(new THREE.PlaneGeometry(D, H), hw, H / 2, 0, -Math.PI / 2, brickMat);
  wall(new THREE.PlaneGeometry(W, H), 0, H / 2, hd, Math.PI);

  /* 窗（后墙三扇）+ 冷光 */
  const winTex = nightWindowTex();
  const winMat = new THREE.MeshStandardMaterial({ map: winTex, emissive: 0x8fb6ee, emissiveMap: winTex, emissiveIntensity: .55, roughness: 1 });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x3a2c1e, roughness: .85 });
  for (const wx of [-3.0, 0, 3.0]) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.35), winMat);
    w.position.set(wx, 2.25, -hd + .03); root.add(w);
    const fr = new THREE.Group();
    const bar = (bw, bh, bd, bx, by) => { const m = new THREE.Mesh(box(bw, bh, bd), frameMat); m.position.set(bx, by, 0); fr.add(m); };
    bar(1.78, .09, .08, 0, .72); bar(1.78, .09, .08, 0, -.72);
    bar(.09, 1.52, .08, -.86, 0); bar(.09, 1.52, .08, .86, 0);
    bar(.05, 1.35, .05, 0, 0); bar(1.6, .05, .05, 0, 0);
    fr.position.set(wx, 2.25, -hd + .05); root.add(fr);
  }

  /* 门 */
  const doorMat = new THREE.MeshStandardMaterial({ map: woodTex('#3a2616', '#1e1209', [1, 1]), roughness: .8 });
  const door = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 2.25), doorMat);
  door.position.set(-hw + .03, 1.13, -1.6); door.rotation.y = Math.PI / 2; root.add(door);

  /* 长桌 */
  const TY = .76, TL = 3.7, TW = 1.5;
  const table = new THREE.Group();
  const top = new THREE.Mesh(box(TL, .085, TW), woodMat);
  top.position.y = TY; top.castShadow = true; top.receiveShadow = true; table.add(top);
  const apron = new THREE.Mesh(box(TL - .2, .12, TW - .2), woodMat);
  apron.position.y = TY - .1; table.add(apron);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const leg = new THREE.Mesh(box(.1, TY - .04, .1), woodMat);
    leg.position.set(sx * (TL / 2 - .18), (TY - .04) / 2, sz * (TW / 2 - .16));
    leg.castShadow = true; table.add(leg);
  }
  root.add(table);

  /* 桌上：地图、纸张、茶碗、油灯 */
  const paperMat = new THREE.MeshStandardMaterial({ map: paperTex(), color: 0xbfb49b, roughness: .95, side: THREE.DoubleSide });
  const mapTex = new THREE.TextureLoader().load('assets/map/route-terrain.webp');
  mapTex.colorSpace = THREE.SRGBColorSpace;
  const mapPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.05, .76),
    new THREE.MeshStandardMaterial({ map: mapTex, color: 0xa79b85, roughness: .95 }));
  mapPlane.rotation.x = -Math.PI / 2; mapPlane.rotation.z = rnd(-.12, .12);
  mapPlane.position.set(-.42, TY + .045, .06); mapPlane.receiveShadow = true;
  root.add(mapPlane);
  for (let i = 0; i < 7; i++) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(.30, .22), paperMat);
    p.rotation.x = -Math.PI / 2; p.rotation.z = rnd(-.55, .55);
    p.position.set(.35 + rnd(-.75, .75), TY + .045 + i * .001, rnd(-.45, .45));
    p.receiveShadow = true; root.add(p);
  }
  const cupMat = new THREE.MeshStandardMaterial({ color: 0xd9d2c4, roughness: .35 });
  for (let i = 0; i < 4; i++) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(.045, .035, .06, 14), cupMat);
    c.position.set(-1.35 + i * .92, TY + .075, (i % 2 ? .48 : -.48));
    c.castShadow = true; root.add(c);
  }

  /* 油灯 */
  const lampGroup = new THREE.Group();
  const brass = new THREE.MeshStandardMaterial({ color: 0x9a7434, roughness: .45, metalness: .75 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(.10, .13, .05, 20), brass); base.position.y = TY + .07; lampGroup.add(base);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(.022, .03, .18, 12), brass); stem.position.y = TY + .18; lampGroup.add(stem);
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(.055, .038, .05, 16), brass); bowl.position.y = TY + .28; lampGroup.add(bowl);
  const glassMat = new THREE.MeshStandardMaterial({ color: 0xffcf90, emissive: 0xff9a3c, emissiveIntensity: 1.9, transparent: true, opacity: .92, roughness: .2 });
  const glass = new THREE.Mesh(new THREE.SphereGeometry(.085, 18, 14), glassMat); glass.position.y = TY + .36; lampGroup.add(glass);
  lampGroup.position.set(1.15, 0, -.12); root.add(lampGroup);

  const lampLight = new THREE.PointLight(0xffa855, 15, 20, 2);
  lampLight.position.set(1.15, TY + .42, -.12);
  lampLight.castShadow = true;
  lampLight.shadow.mapSize.set(1024, 1024);
  lampLight.shadow.camera.near = .05; lampLight.shadow.camera.far = 14;
  lampLight.shadow.bias = -0.0025;
  root.add(lampLight);

  const glowMat = new THREE.SpriteMaterial({ map: glowTex(), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: .55 });
  const glow = new THREE.Sprite(glowMat);
  glow.scale.set(1.25, 1.25, 1); glow.position.copy(lampLight.position); root.add(glow);

  /* 环境光 */
  scene.add(new THREE.AmbientLight(0x33405e, .78));
  scene.add(new THREE.HemisphereLight(0x3a4e78, 0x1e1509, .52));
  const winLight = new THREE.DirectionalLight(0x7ea2d8, 1.05);
  winLight.position.set(-1.2, 2.9, -hd + .4);
  winLight.target.position.set(0, .8, 1.2);
  scene.add(winLight, winLight.target);
  const fill = new THREE.PointLight(0xff9c4a, 9, 14, 2);
  fill.position.set(-2.3, 1.65, 2.1); scene.add(fill);

  /* 墙上挂图 */
  const wallMapTex = new THREE.TextureLoader().load('assets/map/route-simple.webp');
  wallMapTex.colorSpace = THREE.SRGBColorSpace;
  const wm = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 1.85),
    new THREE.MeshStandardMaterial({ map: wallMapTex, roughness: .95 }));
  wm.position.set(hw - .04, 1.95, -1.4); wm.rotation.y = -Math.PI / 2; root.add(wm);

  /* 参会人物（几何头部）：id 与剧情台词一一对应 */
  const CAST = [
    { id: 'bogu',  name: '博古',   seat: [-2.05, 0, Math.PI / 2],  uniform: '#6f7681', cap: true,  glasses: true,  off: { x: -18, y: 0 } },
    { id: 'lide',  name: '李德',   seat: [-0.85, -0.98, 0],        uniform: '#7c8288', cap: true },
    { id: 'zhou',  name: '周恩来', seat: [0.32, -0.98, 0],         uniform: '#767b80', cap: false },
    { id: 'mao',   name: '毛泽东', seat: [1.45, -0.98, 0],         uniform: '#727981', cap: true },
    { id: 'zhang', name: '张闻天', seat: [1.92, 0.98, Math.PI],    uniform: '#787f86', cap: true,  glasses: true,  off: { x: 10, y: -6 } },
    { id: 'wang',  name: '王稼祥', seat: [-1.42, 0.98, Math.PI],   uniform: '#5f6874', cap: false, glasses: true,  off: { x: 4, y: -34 } },
  ];
  const figures = [];
  for (const c of CAST) {
    const [px, pz, ry] = c.seat;
    const chair = makeChair(chairMat);
    chair.position.set(px, 0, pz); chair.rotation.y = ry; root.add(chair);
    const fig = makeFigure(c);
    fig.position.set(px, 0, pz); fig.rotation.y = ry; root.add(fig);
    figures.push({ fig, phase: Math.random() * 6.28 });

    /* 放大一点的隐形拾取盒：手机上也点得中 */
    const hit = new THREE.Mesh(box(.66, 1.55, .66),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
    hit.position.set(px, .78, pz);
    hit.userData.actorId = c.id;
    root.add(hit);

    actors.push({
      id: c.id, name: c.name, ry, enabled: true, fig, hit, off: c.off,
      pos: new THREE.Vector3(px, 0, pz),
    });
  }
  /* 背景旁听者 */
  for (const [px, pz, ry] of [[2.62, -.62, Math.PI * .78], [2.68, .62, Math.PI * 1.2],
                              [-3.2, -.78, Math.PI * .32], [-3.25, .82, Math.PI * -.3]]) {
    const chair = makeChair(chairMat);
    chair.position.set(px, 0, pz); chair.rotation.y = ry; root.add(chair);
    const f = makeFigure({ uniform: '#4b525c', cap: true });
    f.position.set(px, 0, pz); f.rotation.y = ry;
    f.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });
    root.add(f);
  }

  /* 浮尘 */
  const dust = makeParticles(240, [W * .9, H, D * .9], { size: .028, opacity: .5 });
  root.add(dust.pts);

  /* 逐帧 */
  updaters.push((dt, t) => {
    const flick = 1 + Math.sin(t * 11.3) * .045 + Math.sin(t * 7.1 + 1.7) * .035 + Math.sin(t * 23.7) * .018;
    lampLight.intensity = 15 * flick;
    glassMat.emissiveIntensity = 1.9 * flick;
    glowMat.opacity = .48 + .1 * flick;
    fill.intensity = 9 * (.96 + .04 * flick);
    dust.update(dt, t);
    /* 人物呼吸 */
    figures.forEach((f, i) => {
      const b = f.fig.userData.body;
      b.position.y = Math.sin(t * 1.35 + i * 1.7) * .007;
      b.rotation.x = .012 + Math.sin(t * .9 + i * 1.7) * .006;
      b.rotation.y = Math.sin(t * .7 + i * 3.4) * .02;
    });
  });

  applyDefaultView('zunyi_meeting');
}

/* ===========================================================
   场景 2：泸定桥
   =========================================================== */
function buildLudingBridge() {
  scene.fog = new THREE.FogExp2(0x2a3a52, 0.0086);

  const root = new THREE.Group();
  scene.add(root);
  root.add(skyDome('#1a2942', '#2a3a52'));   // 地平线颜色 = 雾色，远山才能化进天色里

  /* ── 尺度（单位：米） ── */
  const SPAN   = 12;      // 铁索两端锚固点间距
  const DECK_Y = 3.0;     // 桥面两端高度
  const SAG    = 1.35;    // 铁索悬垂
  const HALF_W = 1.25;    // 桥面半宽（9 根铁索铺开 2.5 米）
  const deckYAt = (t) => DECK_Y - Math.sin(Math.PI * t) * SAG;

  /* 只有压到雾里的远景山影：不挡桥、也不会在取景框中间顶出一块亮三角 */
  const farRock = new THREE.MeshStandardMaterial({ map: rockTex([2, 2]), color: 0x2c3a4e, roughness: 1 });
  for (let i = 0; i < 6; i++) {
    const h = 60 + Math.random() * 34, r = 40 + Math.random() * 16;
    const m = new THREE.Mesh(makePeak(r, h, 9, .26), farRock);
    m.position.set(-170 + i * 68, h / 2 - 34, -182 - Math.random() * 40);
    m.rotation.y = Math.random() * Math.PI * 2;
    root.add(m);
  }

  /* ── 峡谷两岸 ── */
  const rockMat  = new THREE.MeshStandardMaterial({ map: rockTex([6, 6]), color: 0xb2a794, roughness: .95 });
  const rockDark = new THREE.MeshStandardMaterial({ map: rockTex([5, 5]), color: 0x8d8374, roughness: 1 });
  for (const sign of [-1, 1]) {
    const wall = new THREE.Mesh(box(24, 34, 74), rockMat);
    wall.position.set(sign * 21, 4, -8);
    wall.rotation.y = sign * 0.05;
    wall.castShadow = true; wall.receiveShadow = true;
    root.add(wall);
    const foot = new THREE.Mesh(box(8, 14, 70), rockDark);
    foot.position.set(sign * 10, -3, -8);
    foot.receiveShadow = true;
    root.add(foot);
  }

  /* ── 两端桥台（铁索就锚在这里） ── */
  const stoneMat = new THREE.MeshStandardMaterial({ map: brickTex([2, 2]), color: 0xbcb2a0, roughness: .95 });
  const capMat   = new THREE.MeshStandardMaterial({ color: 0x5c4a30, roughness: .9 });
  for (const sign of [-1, 1]) {
    const base = new THREE.Mesh(box(3.0, 8.5, 4.4), stoneMat);
    base.position.set(sign * 7.6, 0.8, 0);
    base.castShadow = true; base.receiveShadow = true;
    root.add(base);
    const cap = new THREE.Mesh(box(3.8, .55, 5.2), capMat);
    cap.position.set(sign * 7.6, 5.2, 0);
    cap.castShadow = true;
    root.add(cap);
    /* 锚碇石台 */
    const anchor = new THREE.Mesh(box(2.4, 1.4, 3.4), rockDark);
    anchor.position.set(sign * 6.2, DECK_Y - .2, 0);
    root.add(anchor);
  }

  /* ── 河水（沿河谷 Z 向流动） ── */
  const wTex = waterTex();
  const waterMat = new THREE.MeshStandardMaterial({
    map: wTex, color: 0x5aa8cc, roughness: .28, metalness: .18,
    transparent: true, opacity: .97, emissive: 0x14587e, emissiveIntensity: .55,
  });
  const water = new THREE.Mesh(new THREE.PlaneGeometry(15, 130), waterMat);
  water.rotation.x = -Math.PI / 2; water.position.y = -2.2;
  root.add(water);
  const foam = makeParticles(440, [13, 1.8, 90], { size: .6, opacity: .32, y0: -2.0, color: 0xe8f6ff });
  root.add(foam.pts);

  /* ── 13 根铁索 ── */
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x6a6f77, roughness: .5, metalness: .82 });
  const railMat = new THREE.MeshStandardMaterial({ color: 0x5d626a, roughness: .55, metalness: .8 });

  /** 画一根悬垂的铁索（返回采样点，供挂木板用） */
  function chainAt(z, yBase, sagAmt, mat, r) {
    const pts = [];
    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      pts.push(new THREE.Vector3(-SPAN / 2 + t * SPAN, yBase - Math.sin(Math.PI * t) * sagAmt, z));
    }
    const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 56, r, 6, false), mat);
    m.castShadow = true;
    root.add(m);
    return pts;
  }

  /* 9 根桥面索：横向铺开 2.5 米 */
  for (let i = 0; i < 9; i++) {
    const z = -HALF_W + (i / 8) * HALF_W * 2;
    chainAt(z, DECK_Y, SAG, ironMat, .036);
  }
  /* 4 根扶手索：两侧各 2 根，高 1 米 */
  for (const z of [-HALF_W - .04, -HALF_W - .22, HALF_W + .04, HALF_W + .22]) {
    chainAt(z, DECK_Y + 1.0, SAG * .82, railMat, .03);
  }

  /* ── 桥面木板：只铺了靠西岸的一段，其余被守军抽走 ── */
  const plankMat = new THREE.MeshStandardMaterial({ map: woodTex('#7a5628', '#3f2810', [1, 1]), roughness: .92 });
  const PLANK_N = 30, PLANK_FROM = 0.06, PLANK_TO = 0.38;   // 只覆盖 6% ~ 38% 的跨度
  for (let i = 0; i < PLANK_N; i++) {
    const t = PLANK_FROM + (i / (PLANK_N - 1)) * (PLANK_TO - PLANK_FROM);
    const x = -SPAN / 2 + t * SPAN;
    const plank = new THREE.Mesh(box(0.26, .06, HALF_W * 2 + .12), plankMat);
    plank.position.set(x, deckYAt(t) + .05, 0);
    plank.rotation.z = -.045;                                // 顺着索的坡度微微倾斜
    plank.castShadow = true; plank.receiveShadow = true;
    root.add(plank);
  }
  /* 断口处的几块残板 */
  for (let i = 0; i < 4; i++) {
    const t = 0.40 + i * 0.03 + Math.random() * .01;
    const x = -SPAN / 2 + t * SPAN;
    const p = new THREE.Mesh(box(0.22, .05, HALF_W * 2 + .1), plankMat);
    p.position.set(x + Math.random() * .2 - .1, deckYAt(t) + .04, (Math.random() - .5) * .5);
    p.rotation.z = -.05; p.rotation.y = (Math.random() - .5) * .5;
    root.add(p);
  }

  /* ── 对岸大火 ── */
  const fireGroup = new THREE.Group();
  const fireLight = new THREE.PointLight(0xff6a24, 58, 36, 2);
  fireLight.position.set(7.2, 6.4, 0);
  root.add(fireLight);
  const fireLight2 = new THREE.PointLight(0xffaa44, 26, 22, 2);
  fireLight2.position.set(5.0, 5.0, 1.6);
  root.add(fireLight2);
  const fireGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex('rgba(255,205,140,.98)', 'rgba(255,100,25,.5)'),
    blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: .9 }));
  fireGlow.scale.set(9, 9, 1); fireGlow.position.copy(fireLight.position); root.add(fireGlow);
  for (let i = 0; i < 6; i++) {
    const f = new THREE.Mesh(new THREE.SphereGeometry(.3, 8, 6),
      new THREE.MeshBasicMaterial({ color: 0xff9a3a, transparent: true, opacity: .9 }));
    f.position.set(5.4 + Math.random() * 2.8, 5.4 + Math.random() * 1.4, -1.8 + Math.random() * 3.6);
    root.add(f); fireGroup.add(f);
  }

  /* ── 攀索突击的勇士 ── */
  const soldiers = [];
  for (let i = 0; i < 6; i++) {
    const s = makeStandingFigure('#4a5340');
    s.scale.setScalar(.9);
    root.add(s);
    soldiers.push({ g: s, t: 0.15 + i * 0.075, i });
  }

  /* ── 灯光 ── */
  scene.add(new THREE.AmbientLight(0x7d94b4, 1.5));
  scene.add(new THREE.HemisphereLight(0xa8c0e0, 0x4a5158, 1.25));
  const moon = new THREE.DirectionalLight(0xd6e6ff, 1.6);
  moon.position.set(-16, 26, 14);
  moon.castShadow = true;
  moon.shadow.mapSize.set(1024, 1024);
  moon.shadow.camera.left = -22; moon.shadow.camera.right = 22;
  moon.shadow.camera.top = 22; moon.shadow.camera.bottom = -22;
  scene.add(moon);
  const key = new THREE.DirectionalLight(0xf0f6ff, 1.7);
  key.position.set(7, 13, 20);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x8fb4e8, .75);
  rim.position.set(14, 10, -18);
  scene.add(rim);

  /* ── 雨 ── */
  const rain = makeParticles(1000, [40, 30, 40], { size: .12, opacity: .35, speed: [13, 20], y0: -3, fall: true, color: 0xcfe2f5 });
  root.add(rain.pts);

  updaters.push((dt, t) => {
    wTex.offset.y = (t * 0.42) % 1;
    wTex.offset.x = Math.sin(t * .5) * .02;
    waterMat.emissiveIntensity = .42 + Math.sin(t * 1.6) * .1;
    foam.update(dt, t);
    rain.update(dt, t);

    const flick = 1 + Math.sin(t * 13.1) * .13 + Math.sin(t * 7.7) * .09;
    fireLight.intensity = 58 * flick;
    fireLight2.intensity = 26 * (1 + Math.sin(t * 9.3 + 1) * .15);
    fireGlow.material.opacity = .8 + .16 * flick;
    fireGroup.children.forEach((f, i) => {
      f.position.y = 5.4 + Math.sin(t * 4 + i) * .3;
      f.scale.setScalar(.85 + Math.sin(t * 6 + i * 2) * .2);
    });

    /* 勇士们沿铁索向对岸匍匐前进 */
    soldiers.forEach((s) => {
      s.t += dt * 0.010;
      if (s.t > 1) s.t = 0.12;
      s.g.position.set(-SPAN / 2 + s.t * SPAN,
                       deckYAt(s.t) + .16 + Math.abs(Math.sin(t * 3 + s.i)) * .04,
                       (s.i % 2 ? .34 : -.34));
      s.g.rotation.z = -.055;
    });
  });

  applyDefaultView('luding_bridge');
}

/* ===========================================================
   场景 3：雪山
   =========================================================== */
function buildSnowMountain() {
  /* 远景用《翻越雪山》油画，前景用 3D 雪坡一路爬升接上去，
     关键是「人和雪坡共用同一个高度函数」，队伍才像走在山上而不是飘在雪面上 */
  scene.background = new THREE.Color(0xc7d6e8);          // 风雪白茫茫的天色
  scene.fog = new THREE.Fog(0xd9e4f2, 58, 210);

  const root = new THREE.Group();
  scene.add(root);

  /* ── 地形高度函数（越远越高，带几道山脊起伏） ── */
  const H = (x, z) => {
    const d = Math.max(0, -z);
    return d * 0.225
      + Math.sin(x * .052 + 1.2) * 2.8
      + Math.sin(x * .019 - .6) * 4.0
      + Math.sin((x + z) * .031) * 1.0;
  };

  /* ── 油画背景幕：山脚被前面的雪坡山脊挡住，只留画里的主峰 ── */
  const bgTex = new THREE.TextureLoader().load('assets/event/snow-mountain.webp');
  bgTex.colorSpace = THREE.SRGBColorSpace;
  const backdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(360, 160),
    new THREE.MeshBasicMaterial({
      map: bgTex, fog: true, color: 0xd2dded,
      transparent: true, alphaMap: fadeAlphaTexture(0.34),
      depthWrite: false,
    })
  );
  backdrop.position.set(0, -10, -92);
  root.add(backdrop);

  /* 侧幕：转身也还在雪山里。用纯渐变的雪雾幕，不再复用油画——
     油画的近景人物一旦露在侧面会跟 3D 比例打架 */
  const hazeTex = (() => {
    const { c, x } = cv(4, 256);
    const g = x.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, '#a9bed8'); g.addColorStop(.45, '#cfdeef'); g.addColorStop(1, '#eef4fb');
    x.fillStyle = g; x.fillRect(0, 0, 4, 256);
    const t2 = new THREE.CanvasTexture(c); t2.colorSpace = THREE.SRGBColorSpace; return t2;
  })();
  for (const [px, pz, ry] of [[-160, -30, Math.PI / 2.4], [160, -30, -Math.PI / 2.4]]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(280, 150),
      new THREE.MeshBasicMaterial({ map: hazeTex, fog: true, color: 0xdde7f4 }));
    m.position.set(px, 12, pz); m.rotation.y = ry;
    root.add(m);
  }

  /* ── 雪坡 ── */
  const groundGeo = new THREE.PlaneGeometry(440, 340, 130, 100);
  const gp = groundGeo.attributes.position;
  for (let i = 0; i < gp.count; i++) gp.setZ(i, H(gp.getX(i), -gp.getY(i)));
  groundGeo.computeVertexNormals();
  const snowMat = new THREE.MeshStandardMaterial({ map: snowTex([12, 12]), color: 0xf7fbff, roughness: .82 });
  const snowGround = new THREE.Mesh(groundGeo, snowMat);
  snowGround.rotation.x = -Math.PI / 2;
  snowGround.receiveShadow = true;
  root.add(snowGround);

  /* ── 露出雪面的岩石，给前景一点尺度感（近处也放几块，别让前景空着） ── */
  /* 注意：rockTex 本身很暗，再乘一个亮色还是黑的，所以这里不加贴图、改用平面着色 */
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x94a0b0, roughness: .95, flatShading: true });
  for (let i = 0; i < 26; i++) {
    const x = rnd(-86, 86), z = rnd(30, -70);
    const sz = rnd(.8, 2.4);
    const m = new THREE.Mesh(new THREE.DodecahedronGeometry(sz, 0), rockMat);
    m.position.set(x, H(x, z) - sz * .22, z);      // 只埋一点点，看着像从雪里顶出来
    m.rotation.set(rnd(0, 3), rnd(0, 3), rnd(0, 3));
    m.scale.y = .72;
    m.castShadow = true;
    root.add(m);
  }

  /* ── 沿雪坡蜿蜒上行的一列队伍（脚下就是 H()，不会脱地） ── */
  const column = [];
  for (let i = 0; i < 24; i++) {
    const t = i / 23;
    const x = -17 + t * 31 + Math.sin(t * 4.6) * 2.4;
    const z = 15 - t * 66;
    const y = H(x, z);
    const sFigure = makeStandingFigure(i % 4 === 0 ? '#39442f' : '#48543a');
    sFigure.position.set(x, y, z);
    sFigure.scale.setScalar(1.9 - t * 1.25);
    sFigure.rotation.y = Math.PI * .92 + Math.sin(t * 4) * .22;
    sFigure.rotation.z = .07;                       // 顶着风前倾
    root.add(sFigure);
    column.push({ g: sFigure, phase: i * .55, baseX: x, baseY: y, baseRotY: sFigure.rotation.y });
  }

  /* 风雪 */
  const snow = makeParticles(1700, [150, 80, 150], { size: .42, opacity: .75, speed: [2.2, 5.5], y0: -4, fall: true, color: 0xffffff, blending: THREE.NormalBlending });
  root.add(snow.pts);
  const drift = makeParticles(800, [140, 34, 140], { size: .28, opacity: .5, speed: [3.5, 8], y0: 0, color: 0xffffff, blending: THREE.NormalBlending });
  root.add(drift.pts);

  /* 光：冷调环境 + 暖阳，制造明暗对比 */
  scene.add(new THREE.AmbientLight(0xc6d8ec, 1.0));
  scene.add(new THREE.HemisphereLight(0xf4f8ff, 0xa9b8c8, 1.2));
  const sun = new THREE.DirectionalLight(0xfff2d8, 1.85);
  sun.position.set(48, 52, 30);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -60; sun.shadow.camera.right = 60;
  sun.shadow.camera.top = 60; sun.shadow.camera.bottom = -60;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xc6dcf5, .7);
  fill.position.set(-34, 20, -24);
  scene.add(fill);

  updaters.push((dt, t) => {
    snow.update(dt, t);
    drift.update(dt, t);
    column.forEach((c, i) => {
      /* 走路起伏 + 左右微摆 */
      c.g.position.y = c.baseY + Math.abs(Math.sin(t * 2.1 + c.phase)) * .2;
      c.g.rotation.z = .07 + Math.sin(t * 2.1 + c.phase) * .05;
      c.g.rotation.y = c.baseRotY + Math.sin(t * 2.1 + c.phase) * .05;
      c.g.position.x = c.baseX + Math.sin(t * .6 + i) * .16;
    });
  });

  applyDefaultView('snow_mountain');
}

/* ===========================================================
   对外 API
   =========================================================== */
function clearStage() {
  updaters = [];
  actors = [];
  hoverId = null;
  activeId = null;
  interactive = false;
  if (actorLayer) actorLayer.innerHTML = '';
  if (!scene) return;
  scene.traverse(o => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) {
      const ms = Array.isArray(o.material) ? o.material : [o.material];
      ms.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
    }
  });
  while (scene.children.length) scene.remove(scene.children[0]);
  scene.fog = null;
}

/** 应用某个场景的默认机位（切场景时直接就位） */
function applyDefaultView(key) {
  const d = DESCR[key] || {};
  if (d.theta != null) orbit.theta = orbit.tTheta = d.theta;
  if (d.phi != null) orbit.phi = orbit.tPhi = d.phi;
  if (d.radius != null) orbit.radius = orbit.tRadius = d.radius;
  if (d.target) { orbit.target.set(d.target[0], d.target[1], d.target[2]); orbit.tTarget.copy(orbit.target); }
  activeId = null;
  resetLimits();
  buildLabels();
}

/** 把镜头拉到某个人物（自动模式 / 自由探索共用）
 *  注意：轨道机位是以世界原点为圆心算的，所以先把「想要的机位」换成球坐标 */
function focusActor(id, dist = 1.22) {
  const a = actors.find(x => x.id === id);
  if (!a) return false;
  const fx = Math.sin(a.ry), fz = Math.cos(a.ry);
  const tgt = new THREE.Vector3(a.pos.x, 1.06, a.pos.z);          // 看他的胸口
  const camPos = new THREE.Vector3(a.pos.x + fx * dist, 1.48, a.pos.z + fz * dist);
  const r = Math.max(0.6, camPos.length());
  orbit.tRadius = r;
  orbit.tPhi = Math.acos(Math.max(-1, Math.min(1, camPos.y / r)));
  orbit.tTheta = Math.atan2(camPos.x, camPos.z);
  orbit.tTarget.copy(tgt);
  limitBase = orbit.tTheta;
  limitRange = 1.05;
  activeId = id;
  markHot(id);
  return true;
}

/** 回到全场广角 */
function wideView() {
  const d = DESCR[currentScene];
  if (!d) return;
  orbit.tTheta = d.theta; orbit.tPhi = d.phi; orbit.tRadius = d.radius;
  orbit.tTarget.set(d.target[0], d.target[1], d.target[2]);
  activeId = null;
  resetLimits();
  markHot(hoverId);
}

/**
 * 登记本场可互动的人物：只让剧本里出现的人可点，其余名牌淡出
 * cast: [{ id, name }]
 */
function setActors(cast) {
  const list = cast || [];
  for (const a of actors) {
    const c = list.find(x => x.id === a.id);
    a.enabled = !!c;
    if (c && c.name && a.el) {
      const n = a.el.querySelector('.actor-tag__name');
      if (n) n.textContent = c.name;
      a.name = c.name;
    }
  }
  mobileHint();
  markHot(hoverId);
}

/** 手机上没地方摆六个名牌时，名牌改成小圆点（仍可点） */
function mobileHint() {
  const small = (canvas && canvas.clientWidth < 620) || window.innerWidth < 620;
  if (actorLayer) actorLayer.classList.toggle('is-compact', small);
}

function setInteractive(on) {
  interactive = !!on;
  markHot(interactive ? hoverId : null);
}

/** 离开现场：撤掉名牌，避免看不见的标签继续吃点击 */
function clearActors() {
  interactive = false;
  hoverId = null;
  activeId = null;
  actors = [];
  if (actorLayer) actorLayer.innerHTML = '';
}

function loadScene(name) {
  if (!renderer) init();
  if (!scene) return;
  clearStage();
  currentScene = name;
  switch (name) {
    case 'luding_bridge': buildLudingBridge(); break;
    case 'snow_mountain': buildSnowMountain(); break;
    case 'zunyi_meeting':
    default: buildZunyiMeeting(); break;
  }
}

function show(sceneName, label) {
  const el = document.getElementById('scene-3d-name');
  if (el) el.textContent = label || '';
  loadScene(sceneName);
  resize();          // 场景容器此时才真正有尺寸
}

function hide() { /* 保留渲染循环，切走时由 CSS 隐藏 */ }

window.Scene3D = {
  init, show, hide, loadScene, resetView,
  /* 互动现场 API */
  setActors, setInteractive, clearActors, focus: focusActor, wide: wideView,
  onPick: (cb) => { pickCb = cb; },
  actorIds: () => actors.filter(a => a.enabled).map(a => a.id),
};

