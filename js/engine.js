/**
 * engine.js — 主引擎
 * 场景切换 · 剧情推进 · 积分系统 · 背景/人物图片装配
 */

window.Engine = (function () {

  /* ── 状态 ── */
  let chapterIdx = 0;
  let stepIdx    = 0;
  let score      = 0;
  let isTyping   = false;
  let typeTimer  = null;
  let typeFull   = '';
  let typeDone   = null;
  let typeFired  = false;
  let pendingGeo = null;
  let waitingMap = false;
  let mapTimer = null;
  let liveSession = null;      // 当前正在进行的「三维现场会话」
  let autoMode = false;        // 自动通读（按 A 切换）
  let autoTimer = null;
  let mapPreview = false;      // 结局后「继续预览路线图」
  let bgmOn = true;            // 背景音乐开关（记住上次选择）
  let bgmFade = null;

  const chapters = window.STORY.chapters;

  /* ===========================================================
     背景图映射：把原来的 CSS 渐变全部换成真实图片
     =========================================================== */
  const BG_IMAGES = {
    /* 出发与部队 */
    autumn_forest:    'assets/photo/see-off.webp',         // 于都河送别红军（油画）
    command_room:     'assets/photo/assembly.webp',        // 红军部队集会（历史照片）
    /* 战斗 */
    battle_field:     'assets/event/break-blockade.webp',  // 突破封锁线（油画）
    river_night:      'assets/event/river-crossing.webp',  // 渡河作战（油画）
    river_blood:      'assets/event/break-blockade.webp',  // 血战（油画）
    /* 贵州与遵义 */
    guizhou_mist:     'assets/event/river-crossing.webp',  // 乌江峡谷（油画）
    meeting_room:     'assets/photo/zunyi-site-old.webp',  // 遵义会议会址（历史照片）
    /* 川滇黔 */
    mountain_river:   'assets/event/jinsha-river.webp',    // 巧渡金沙江（油画）
    golden_river:     'assets/event/jinsha-river.webp',
    /* 大渡河与泸定桥 */
    sichuan_mountain: 'assets/event/force-dadu.webp',      // 强渡大渡河（油画）
    luding_bridge_bg: 'assets/event/luding-bridge.webp',   // 飞夺泸定桥（油画）
    /* 雪山草地 */
    snow_mountain_bg: 'assets/event/snow-mountain.webp',   // 翻越雪山（油画）
    grassland_bg:     'assets/event/grassland.webp',       // 过草地（油画）
    /* 陕甘 */
    loess_plateau:    'assets/photo/mao-zhou.webp',        // 到达陕北
    huining_bg:       'assets/event/join-forces.webp',     // 三军会师（油画）
    victory_bg:       'assets/painting/song-red-army.webp',
  };


  /* ===========================================================
     人物立绘映射
     =========================================================== */
  const CHAR_IMAGES = {
    mao:     { img: 'assets/chara/mao.webp',     name: '毛泽东' },
    zhou:    { img: 'assets/chara/zhou.webp',    name: '周恩来' },
    bolin:   { img: 'assets/chara/bogu.webp',    name: '博古' },
    lide:    { img: 'assets/chara/lide.webp',    name: '李德' },
    zhang:   { img: 'assets/chara/luofu.webp',   name: '张闻天' },
    wang:    { img: 'assets/chara/wang.webp',    name: '王稼祥' },
    chiang:  { img: 'assets/chara/chiang.webp',  name: '蒋介石' },
    soldier: { img: 'assets/chara/soldier.webp', name: '红军战士' },
  };

  /* ── DOM ── */
  const $ = (id) => document.getElementById(id);
  const screenTitle = $('screen-title'), screenGame = $('screen-game'), screenEnd = $('screen-end');
  const screenSum = $('screen-summary');
  let sumFrom = null;          // 从哪个画面打开的小结
  const sceneMap = $('scene-map'), scene3D = $('scene-3d'), sceneDialog = $('scene-dialog');
  const dialogBox = $('dialog-box'), speakerName = $('dialog-speaker-name'),
        speakerRole = $('dialog-speaker-role'), dialogText = $('dialog-text'),
        dialogCursor = $('dialog-cursor'), dialogChoices = $('dialog-choices');
  const charLeft = $('char-left'), charRight = $('char-right'), dialogBg = $('dialog-bg');
  const btnStart = $('btn-start'), btnRestart = $('btn-restart'), hudAuto = $('hud-auto');
  const bgm = $('bgm'), hudBgm = $('hud-bgm');
  const hudChapterNum = $('hud-chapter-num'), hudChapterName = $('hud-chapter-name'),
        hudProgressFill = $('hud-progress-fill'), hudProgressText = $('hud-progress-text'),
        hudScoreVal = $('hud-score-val');
  const chapterUnlock = $('chapter-unlock'), unlockText = $('chapter-unlock-text');
  const geoOverlay = $('geo-card-overlay'), geoTitle = $('geo-card-title'),
        geoIcon = $('geo-card-icon'), geoBody = $('geo-card-body'), geoClose = $('geo-card-close');

  /* ── 初始化 ── */
  function init() {
    btnStart?.addEventListener('click', startGame);
    btnRestart?.addEventListener('click', restart);
    geoClose?.addEventListener('click', closeGeo);

    /* 课堂小结：结局页按钮、HUD 按钮、返回、重开 */
    $('btn-summary')?.addEventListener('click', () => openSummary(screenEnd));
    $('btn-map')?.addEventListener('click', previewMap);          // 结局后继续看路线图
    /* 注意要包一层：直接把 exitPreview 当监听器会把 click 事件当成 silent 参数 */
    $('map-back')?.addEventListener('click', () => exitPreview());
    $('hud-summary')?.addEventListener('click', () => openSummary(screenGame));
    $('sum-back')?.addEventListener('click', closeSummary);
    $('sum-restart')?.addEventListener('click', () => {
      if (sumFrom) { sumFrom.classList.remove('active'); sumFrom = null; }
      restart();
    });

    dialogBox?.addEventListener('click', (e) => {
      if (e.target.closest('.choice-btn')) return;
      clearTimeout(autoTimer);
      if (liveSession) { liveSession.click(); return; }
      if (isTyping) { finishTyping(); return; }   // 第一次点：先把字打完
      nextStep();                                 // 已经打完：翻到下一页
    });

    /* 自动通读：HUD 按钮 或 键盘 A */
    hudAuto?.addEventListener('click', () => setAuto(!autoMode));

    /* 背景音乐 */
    initBgm();

    /* 三维现场：模式选择卡 + 模式切换条 */
    document.querySelectorAll('#scene-3d-pick [data-mode]').forEach(b =>
      b.addEventListener('click', () => Session.start(b.dataset.mode)));
    document.querySelectorAll('#scene-3d-modes [data-mode]').forEach(b =>
      b.addEventListener('click', () => Session.start(b.dataset.mode)));
    $('mode-replay')?.addEventListener('click', () => Session.open(Session.step, true));
    if (window.Scene3D) window.Scene3D.onPick((id) => {
      if (liveSession && liveSession.mode === 'free') liveSession.speak(id);
    });

    /* 键盘：空格 / 回车 / → 翻页，A 自动通读，Esc 关弹层 */
    document.addEventListener('keydown', (e) => {
      if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      /* 大图优先：Esc 先关大图 */
      if (viewer && !viewer.classList.contains('hidden')) {
        if (['Escape', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); closeViewer(); }
        return;
      }
      if (!geoOverlay.classList.contains('hidden')) {
        if ([' ', 'Enter', 'Escape'].includes(e.key)) { e.preventDefault(); closeGeo(); }
        return;
      }
      if (!$('quiz-overlay').classList.contains('hidden')) return;   // 答题面板自己处理
      if (mapPreview && e.key === 'Escape') { e.preventDefault(); exitPreview(); return; }
      if (e.key.toLowerCase() === 'a' || e.key === 'A') {            // A：自动通读开关
        e.preventDefault(); setAuto(!autoMode); return;
      }
      if (![' ', 'Enter', 'ArrowRight'].includes(e.key)) return;
      e.preventDefault();
      clearTimeout(autoTimer);
      if (liveSession) { liveSession.click(); return; }
      if (sceneDialog.classList.contains('active')) {
        if (isTyping) finishTyping();
        else nextStep();
      }
    });

    /* 预加载背景与立绘，避免切换时闪白 */
    Object.values(BG_IMAGES).forEach(src => { const i = new Image(); i.src = src; });
    Object.values(CHAR_IMAGES).forEach(c => { const i = new Image(); i.src = c.img; });

    initViewer();
    if (window.MapModule)    window.MapModule.init();
    if (window.Scene3D)      window.Scene3D.init();
    if (window.SummaryModule) window.SummaryModule.init();
  }

  /* ── 开始 / 重开 ── */
  function clearFlow() {
    clearTimeout(mapTimer);
    clearTimeout(autoTimer);
    waitingMap = false;
    pendingGeo = false;
  }
  function startGame() {
    clearFlow();
    exitPreview(true);
    playBgm();
    chapterIdx = 0; stepIdx = 0; score = 0;
    updateScore(0);
    switchScreen(screenTitle, screenGame);
    setTimeout(() => showChapterUnlock(chapters[0]), 400);
  }
  function restart() {
    /* 从小结页或结局页重开都要能正确淡出 */
    clearFlow();
    mapPreview = false;
    $('map-back')?.classList.add('hidden');
    teardownSession();
    const from = screenSum.classList.contains('active') ? screenSum : screenEnd;
    sumFrom = null;
    switchScreen(from, screenTitle);
    chapterIdx = 0; stepIdx = 0; score = 0;
  }

  function teardownSession() {
    if (liveSession) { liveSession.stop(); liveSession = null; }
    $('scene-3d-pick')?.classList.add('hidden');
    $('scene-3d-modes')?.classList.add('hidden');
    dialogChoices.classList.add('hidden');
    dialogChoices.classList.remove('is-grid');
    dialogChoices.innerHTML = '';
    dialogBox.classList.remove('on-3d');
    dialogBox.classList.add('hidden');
    dialogCursor.classList.remove('is-ready');
    window.Scene3D?.setInteractive(false);
    window.Scene3D?.clearActors();
  }

  /* ── 课堂小结 ── */
  function openSummary(from) {
    clearTimeout(autoTimer);
    sumFrom = from || screenEnd;
    window.SummaryModule?.reset();
    sumFrom.classList.add('fade-out');
    setTimeout(() => {
      sumFrom.classList.remove('active', 'fade-out');
      screenSum.classList.add('active');
      screenSum.scrollTop = 0;
    }, 220);
  }

  /* ── 结局后：自由预览长征路线图 ── */
  function previewMap() {
    clearFlow();
    teardownSession();
    mapPreview = true;
    showScene('map');
    dialogBox.classList.add('hidden');
    dialogChoices.classList.add('hidden');
    switchScreen(screenEnd, screenGame);
    /* HUD 换成「自由回顾」，进度拉满 */
    hudChapterNum.textContent = '自由回顾';
    hudChapterName.textContent = '长征路线图';
    hudProgressFill.style.width = '100%';
    hudProgressText.textContent = '100%';
    if (window.MapModule) {
      window.MapModule.setHighlight(null);
      window.MapModule.setUnlockedIdx(999);      // 全部地点都可看
      window.MapModule.resetView();
    }
    const inst = $('map-instruction');
    if (inst) inst.remove();
    const tip = $('map-tooltip');
    if (tip) tip.classList.remove('visible');
    $('map-back').classList.remove('hidden');
  }

  function exitPreview(silent) {
    if (!mapPreview) return;
    mapPreview = false;
    $('map-back')?.classList.add('hidden');
    const tip = $('map-tooltip');
    if (tip) tip.classList.remove('visible');
    if (!silent) switchScreen(screenGame, screenEnd);
    else screenGame.classList.remove('active');
  }

  function closeSummary() {
    const back = sumFrom || screenEnd;
    screenSum.classList.add('fade-out');
    setTimeout(() => {
      screenSum.classList.remove('active', 'fade-out');
      back.classList.add('active');
      sumFrom = null;
    }, 220);
  }

  /* ── 章节过场 ── */
  function showChapterUnlock(chapter) {
    unlockText.innerHTML =
      `<div class="unlock-sub">${chapter.subtitle}</div><div class="unlock-title">${chapter.title}</div>`;
    chapterUnlock.classList.remove('hidden');
    setTimeout(() => {
      chapterUnlock.classList.add('hidden');
      updateHUD();
      runStep();
    }, 2400);
  }

  /* ── 步骤推进 ── */
  function nextStep() {
    const chapter = chapters[chapterIdx];
    stepIdx++;
    if (stepIdx >= chapter.steps.length) {
      chapterIdx++; stepIdx = 0;
      if (chapterIdx >= chapters.length) { endGame(); return; }
      showChapterUnlock(chapters[chapterIdx]);
      return;
    }
    runStep();
  }

  function runStep() {
    const chapter = chapters[chapterIdx];
    const step = chapter.steps[stepIdx];
    updateHUD();
    /* 离开三维现场：收起模式条 / 名牌 / 会话（可重复调用） */
    if (step.type !== 'scene3d') teardownSession();
    /* 一离开地图步就撤掉它的兜底计时器，免得十几秒后在别的地方冒出来推进剧情 */
    if (step.type !== 'map') { clearTimeout(mapTimer); waitingMap = false; }
    switch (step.type) {
      case 'narrate': showNarrate(step); break;
      case 'dialog':  showDialog(step);  break;
      case 'quiz':    showQuiz(step);    break;
      case 'geo':     showGeo(step);     break;
      case 'map':     showMapStep(step); break;
      case 'scene3d': show3DStep(step);  break;
      default: nextStep();
    }
  }

  /* ── 旁白 ── */
  function showNarrate(step) {
    setBg(step.bg);
    showScene('dialog');
    hideCharacters();
    speakerName.textContent = '旁白';
    speakerRole.textContent = chapters[chapterIdx].subtitle;
    dialogChoices.classList.add('hidden');
    dialogBox.classList.remove('hidden');
    dialogBox.classList.add('narration');
    typeText(step.text, readyNext);
  }

  /* ── 对话 ── */
  function showDialog(step) {
    setBg(step.bg);
    showScene('dialog');
    dialogBox.classList.remove('narration');
    speakerName.textContent = step.speaker || '';
    speakerRole.textContent = step.role || '';
    dialogChoices.classList.add('hidden');
    dialogBox.classList.remove('hidden');
    updateCharacter(charLeft,  step.charLeft,  'left');
    updateCharacter(charRight, step.charRight, 'right');
    typeText(step.text, readyNext);
  }

  /* ── 答题 ── */
  function showQuiz(step) {
    window.QuizModule.show(step, nextStep);
  }

  /* ── 地理知识卡（支持配图） ── */
  function showGeo(step) {
    geoTitle.textContent = step.title;
    geoIcon.textContent = step.icon || '🌏';
    const imgs = step.images || [];
    let html = '';
    if (imgs.length) {
      html += `<div class="geo-imgs${imgs.length > 1 ? ' geo-imgs--two' : ''}">` +
        imgs.map(s => `<img src="${s}" alt="${step.title}" draggable="false">`).join('') +
        `</div>`;
    }
    html += `<div class="geo-text">${step.content || ''}</div>`;
    /* 只有一张配图时用左右分栏：图在左边吸顶，正文立刻能看到 */
    geoBody.className = imgs.length === 1 ? 'geo-split' : '';
    geoBody.innerHTML = html;
    geoBody.scrollTop = 0;
    geoOverlay.classList.remove('hidden');
    pendingGeo = true;
  }
  function closeGeo() {
    geoOverlay.classList.add('hidden');
    if (pendingGeo) { pendingGeo = false; nextStep(); }
  }

  /* ── 地图互动 ── */
  function showMapStep(step) {
    showScene('map');
    dialogBox.classList.add('hidden');
    if (window.MapModule) {
      window.MapModule.setHighlight(step.highlight);
      const idx = chapters.slice(0, chapterIdx + 1)
        .reduce((s, ch) => s + ch.steps.filter(st => st.type === 'map').length, 0);
      window.MapModule.setUnlockedIdx(idx * 2 + 1);
    }
    showMapInstruction(step.instruction);
    waitingMap = true;
    /* 兜底自动推进：留足时间让学生悬停查看地点卡片；一旦点击地点会立即取消 */
    clearTimeout(mapTimer);
    mapTimer = setTimeout(() => { if (waitingMap) { waitingMap = false; nextStep(); } }, 14000);
  }

  /* ── 看大图 ── */
  const viewer = $('img-viewer'), viewerImg = $('img-viewer-img'),
        viewerCap = $('img-viewer-cap'), viewerZoom = $('img-viewer-zoom');
  let pan = { x: 0, y: 0 }, panStart = null;

  function openViewer(src, cap) {
    if (!viewer || !src) return;
    viewerImg.src = src;
    viewerImg.alt = cap || '';
    viewerCap.textContent = cap || '';
    setZoom(false);
    viewer.classList.remove('hidden');
  }
  function setZoom(actual) {
    viewer.classList.toggle('is-actual', !!actual);
    pan = { x: 0, y: 0 };
    viewerImg.style.transform = '';
    viewerZoom.textContent = actual ? '🖥 适应屏幕' : '🔍 原图大小';
  }
  function closeViewer() {
    if (!viewer || viewer.classList.contains('hidden')) return;
    viewer.classList.add('hidden');
    viewerImg.removeAttribute('src');
    setZoom(false);
  }

  function initViewer() {
    if (!viewer) return;
    /* 知识卡配图、小结里的文物 / 画作：点一下就看大图 */
    document.addEventListener('click', (e) => {
      const img = e.target.closest?.('#geo-card-body img, #screen-summary img');
      if (!img) return;
      const fig = img.closest('figure');
      openViewer(img.currentSrc || img.src, img.alt || fig?.querySelector('figcaption')?.textContent || '');
    });
    viewerImg.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      setZoom(!viewer.classList.contains('is-actual'));
    });
    viewerZoom.addEventListener('click', (e) => {
      e.stopPropagation();
      setZoom(!viewer.classList.contains('is-actual'));
    });
    $('img-viewer-close')?.addEventListener('click', (e) => { e.stopPropagation(); closeViewer(); });
    viewer.addEventListener('click', () => closeViewer());          // 点空白处关闭
    viewerImg.addEventListener('click', (e) => e.stopPropagation());

    /* 原图大小模式下拖动查看 */
    viewerImg.addEventListener('mousedown', (e) => {
      if (!viewer.classList.contains('is-actual')) return;
      e.preventDefault();
      panStart = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      viewer.classList.add('is-panning');
    });
    window.addEventListener('mousemove', (e) => {
      if (!panStart) return;
      pan.x = e.clientX - panStart.x;
      pan.y = e.clientY - panStart.y;
      viewerImg.style.transform = `translate(${pan.x}px,${pan.y}px)`;
    });
    window.addEventListener('mouseup', () => { panStart = null; viewer.classList.remove('is-panning'); });
  }

  /* ── 三维现场：进入现场先选模式，两种模式都在会场里完成 ── */
  function show3DStep(step) {
    Session.open(step);
  }

  /* ===========================================================
     三维现场会话
       · 自动模式：镜头依次对准发言人，台词自动播放（适合投屏）
       · 自由探索：自己转视角，点击人物听他们各自的主张
     两种模式都留在三维会场内，随时可在右上角切换
     =========================================================== */
  const Session = {
    step: null, mode: null, heard: new Set(),
    lines: [], li: 0, timer: null, playing: false, atPrompt: false,
    ended: false, climaxed: false, after: null,

    /* 打开现场（replay=true 表示重来） */
    open(step) {
      this.stop();
      if (step) this.step = step;
      const s = this.step;
      if (!s) return;
      liveSession = this;
      this.heard = new Set();
      this.mode = null; this.ended = false; this.climaxed = false; this.atPrompt = false;
      this.lines = []; this.li = 0;

      showScene('3d');
      dialogBox.classList.add('hidden');
      dialogBox.classList.add('on-3d');
      dialogChoices.classList.add('hidden');
      dialogChoices.classList.remove('is-grid');
      dialogChoices.innerHTML = '';
      dialogCursor.classList.remove('is-ready');
      const nameEl = $('scene-3d-name');
      if (nameEl) nameEl.textContent = s.label || '';

      if (window.Scene3D) {
        window.Scene3D.show(s.sceneName, s.label);
        window.Scene3D.setActors(s.cast || []);
        window.Scene3D.setInteractive(false);
      }

      /* 模式选择卡 */
      const cast = s.cast || [];
      $('pick-sub').textContent = chapters[chapterIdx]?.subtitle || '';
      $('pick-title').textContent = s.label || '';
      $('pick-desc').textContent = s.enterText || s.caption || '';
      $('pick-free').style.display = cast.length ? '' : 'none';
      $('pick-foot').textContent = cast.length
        ? '两种模式随时可以在右上角切换'
        : '本场没有需要点选的人物，可以用自动模式听讲解，也可以自由环视现场';
      $('scene-3d-pick').classList.remove('hidden');
      $('scene-3d-modes').classList.add('hidden');
    },

    /* 选择模式并开始 */
    start(mode) {
      const s = this.step;
      if (!s) return;
      const cast = s.cast || [];
      this.mode = mode;
      this.heard = new Set();
      this.ended = false; this.climaxed = false; this.atPrompt = false;
      clearTimeout(this.timer);
      $('scene-3d-pick').classList.add('hidden');
      const bar = $('scene-3d-modes');
      bar.classList.remove('hidden');
      bar.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('is-on', b.dataset.mode === mode));
      $('mode-free').style.display = cast.length ? '' : 'none';
      window.Scene3D?.setInteractive(mode === 'free' && cast.length > 0);

      if (mode === 'auto') this.playLines(this.buildAuto(), () => this.finish());
      else this.runFree();
    },

    buildAuto() {
      const s = this.step, out = [];
      (s.intro || []).forEach(l => out.push({ cam: 'wide', ...l }));
      (s.cast || []).forEach(c => (c.lines || []).forEach(l => out.push({ ...l, cam: c.id })));
      (s.climax || []).forEach(l => out.push({ cam: l.cam || 'wide', ...l }));
      return out;
    },

    /* ── 自由探索 ── */
    runFree() {
      const s = this.step;
      const intro = s.intro || [];
      if (!(s.cast || []).length) {
        /* 没有人物可点的户外现场：先自由环视，再听讲解 */
        window.Scene3D?.wide();
        this.showLookPrompt();
        return;
      }
      window.Scene3D?.wide();
      this.playLines(intro.map(l => ({ cam: 'wide', ...l })), () => this.taskPrompt());
    },

    showLookPrompt() {
      const s = this.step;
      this.atPrompt = true; this.playing = false;
      dialogBox.classList.add('narration');
      dialogBox.classList.remove('hidden');
      speakerName.textContent = s.label || '现场';
      speakerRole.textContent = '自由环视';
      dialogText.textContent = s.freeText || '拖动鼠标环视现场，滚轮可以推近拉远。';
      dialogCursor.style.display = 'none';
      dialogChoices.classList.remove('hidden');
      dialogChoices.classList.add('is-grid');
      dialogChoices.innerHTML =
        `<button class="choice-btn choice-btn--wide" data-act="narrate"><i>▶</i><span><b>听本场讲解</b>：${s.caption || ''}</span></button>`;
      dialogChoices.querySelector('[data-act="narrate"]')
        .addEventListener('click', () => {
          this.atPrompt = false;
          dialogChoices.classList.add('hidden');
          dialogChoices.innerHTML = '';
          this.climaxed = true;
          this.playLines(s.climax || [], () => this.finish());
        });
    },

    taskPrompt() {
      const s = this.step, cast = s.cast || [];
      const need = s.require || cast.map(c => c.id);
      const n = need.filter(id => this.heard.has(id)).length;
      this.atPrompt = true; this.playing = false;
      dialogBox.classList.remove('narration');
      dialogBox.classList.remove('hidden');
      speakerName.textContent = '会场';
      speakerRole.textContent = '自由探索';
      dialogText.innerHTML =
        `${s.task || '点击人物听他发言'}　<b class="vn-count">${n} / ${need.length}</b>` +
        `<br><span class="vn-dim">（${s.hint || '也可以直接点击画面里的人物，或拖动鼠标环视会场'}）</span>`;
      dialogCursor.style.display = 'none';
      dialogChoices.classList.remove('hidden');
      dialogChoices.classList.add('is-grid');
      dialogChoices.innerHTML = cast.map(c => {
        const done = this.heard.has(c.id);
        return `<button class="choice-btn${done ? ' is-done' : ''}" data-cast="${c.id}">
          <i>${done ? '✓' : '▶'}</i><span><b>${c.name}</b>：${c.stance}</span></button>`;
      }).join('') +
        (n < need.length
          ? `<button class="choice-btn choice-btn--wide is-skip" data-act="skip"><i>⏭</i><span>听够了，直接进入会议结论</span></button>`
          : '');
      dialogChoices.querySelectorAll('[data-cast]').forEach(b =>
        b.addEventListener('click', () => this.speak(b.dataset.cast)));
      dialogChoices.querySelector('[data-act="skip"]')?.addEventListener('click', () => {
        need.forEach(id => this.heard.add(id));
        this.afterSpeak();
      });
      window.Scene3D?.setInteractive(true);
    },

    speak(id) {
      const s = this.step;
      if (!s || this.mode !== 'free' || this.playing) return;
      const c = (s.cast || []).find(x => x.id === id);
      if (!c || !c.lines?.length) return;
      const first = !this.heard.has(id);
      this.heard.add(id);
      this.atPrompt = false;
      window.Scene3D?.setInteractive(false);
      dialogChoices.classList.add('hidden');
      dialogChoices.innerHTML = '';
      const lines = first ? c.lines : c.lines.slice(-1);      // 再点同一人只重复最后一句
      this.playLines(lines.map(l => ({ ...l, cam: id })), () => this.afterSpeak());
    },

    afterSpeak() {
      const s = this.step;
      const need = s.require || (s.cast || []).map(c => c.id);
      if (need.every(id => this.heard.has(id)) && !this.climaxed) {
        this.climaxed = true;
        this.playLines(s.climax || [], () => this.finish());
      } else {
        this.taskPrompt();
      }
    },

    /* ── 播放一串台词（自动模式与自由探索共用） ── */
    playLines(list, done) {
      this.lines = (list || []).slice();
      this.li = 0;
      this.after = done || null;
      this.playing = true;
      this.atPrompt = false;
      this.next();
    },

    next() {
      clearTimeout(this.timer);
      if (!this.playing) return;
      if (this.li >= this.lines.length) {
        this.playing = false;
        const f = this.after; this.after = null;
        if (f) f();
        return;
      }
      const line = this.lines[this.li++];
      this.say(line, () => {
        if (!this.playing) return;
        this.timer = setTimeout(() => this.next(), 800 + Math.min(2100, (line.text || '').length * 34));
      });
    },

    say(line, onDone) {
      if (line.cam && line.cam !== 'wide') window.Scene3D?.focus(line.cam);
      else if (line.cam === 'wide') window.Scene3D?.wide();
      dialogBox.classList.toggle('narration', !!line.narr);
      dialogBox.classList.remove('hidden');
      speakerName.textContent = line.speaker || '旁白';
      speakerRole.textContent = line.role || '';
      dialogChoices.classList.add('hidden');
      dialogChoices.innerHTML = '';
      typeText(line.text, onDone);
    },

    /* 点击对话框 / 按空格：先补完打字 → 跳到下一句 → 结束后继续下一页 */
    click() {
      if (isTyping) { finishTyping(); return; }
      if (this.playing) { clearTimeout(this.timer); this.next(); return; }
      if (this.ended) this.continueBtn();
    },

    /* 本场结束：停留最后一幕，等老师点【继续】 */
    finish() {
      this.playing = false;
      this.ended = true;
      window.Scene3D?.setInteractive(false);
      readyNext();                 // 显示「▼ 点击继续」，开了自动通读就自己往下走
    },

    continueBtn() {
      clearTimeout(autoTimer);
      this.stop();
      liveSession = null;
      dialogCursor.classList.remove('is-ready');
      nextStep();
    },

    stop() {
      clearTimeout(this.timer); this.timer = null;
      this.playing = false;
      this.atPrompt = false;
      this.lines = []; this.li = 0;
    },
  };

  /* ── 地图点击 ── */
  function onMapClick(id, place) {
    if (mapPreview) {                    // 自由回顾：点一下就把镜头推到那一站
      if (window.MapModule && place) window.MapModule.focusOn(place.rx, place.ry);
      return;
    }
    if (!waitingMap) return;
    waitingMap = false;
    clearTimeout(mapTimer);
    const tip = $('map-tooltip');
    if (tip) {
      tip.innerHTML =
        `<div class="tt-head"><span class="tt-name">${place.name}</span><span class="tt-time">${place.time || ''}</span></div>
         ${place.img ? `<img class="tt-img" src="${place.img}" alt="${place.name}" draggable="false">` : ''}
         <div class="tt-desc">${place.desc}</div>
         <div class="tt-geo"><span class="tt-geo-tag">地理</span>${place.geo}</div>`;
      tip.classList.add('visible');
    }
    setTimeout(nextStep, 1500);
  }

  /* ── 计分 ── */
  function onQuizAnswer(correct) { if (correct) updateScore(score + 20); }

  /* ── 打字机 ── */
  function typeText(text, onDone) {
    clearTimeout(typeTimer);
    isTyping = true;
    typeFull = text || '';
    typeDone = onDone || null;
    typeFired = false;
    dialogText.textContent = '';
    dialogCursor.style.display = 'none';       // 打字时不显示「点击继续」
    dialogCursor.classList.remove('is-ready');
    let i = 0;
    const tick = () => {
      if (i < typeFull.length) {
        dialogText.textContent += typeFull[i++];
        typeTimer = setTimeout(tick, 26);
      } else {
        isTyping = false;
        fireTypeDone();
      }
    };
    tick();
  }

  function fireTypeDone() {
    if (typeFired) return;
    typeFired = true;
    const fn = typeDone; typeDone = null;
    fn?.();
  }

  /** 把当前台词一次性打完（返回是否确实在打字） */
  function finishTyping() {
    if (!isTyping) return false;
    clearTimeout(typeTimer);
    isTyping = false;
    dialogText.textContent = typeFull;
    fireTypeDone();
    return true;
  }

  /* 一句话打完：亮出「▼ 点击继续」，自动通读时排下一次翻页 */
  function readyNext() {
    dialogCursor.style.display = 'inline';
    dialogCursor.classList.add('is-ready');
    scheduleAuto(1100 + Math.min(2400, (typeFull || '').length * 30));
  }

  /* ── 自动通读（A 键 / HUD 按钮） ── */
  function setAuto(on) {
    autoMode = !!on;
    hudAuto?.classList.toggle('is-on', autoMode);
    clearTimeout(autoTimer);
    if (!autoMode) return;
    /* 三维现场里按 A：直接用「自动模式」把这一场播完 */
    if (liveSession) {
      if (!liveSession.ended && liveSession.mode !== 'auto') Session.start('auto');
      else if (liveSession.ended) scheduleAuto(500);
      return;
    }
    if (sceneDialog.classList.contains('active') && !isTyping) scheduleAuto(500);
  }

  /* ── 背景音乐 ── */
  function initBgm() {
    if (!bgm) return;
    bgm.volume = 0.32;
    try { bgmOn = localStorage.getItem('cc-bgm') !== 'off'; } catch (e) { bgmOn = true; }
    syncBgmBtn();
    /* 浏览器不支持这个格式时不报错，直接把按钮收起来 */
    bgm.addEventListener('error', () => { hudBgm?.classList.add('hidden'); });
    hudBgm?.addEventListener('click', () => setBgm(!bgmOn));
    /* 切到别的标签页就先安静下来，回来再续上 */
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) bgm.pause();
      else if (bgmOn && screenGame.classList.contains('active')) playBgm();
    });
  }

  function syncBgmBtn() {
    if (!hudBgm) return;
    hudBgm.textContent = bgmOn ? '🔊 音乐' : '🔇 音乐';
    hudBgm.classList.toggle('is-off', !bgmOn);
  }

  function playBgm() {
    if (!bgm || !bgmOn) return;
    clearInterval(bgmFade);
    const target = 0.32;
    if (bgm.paused) {
      bgm.volume = 0;
      const p = bgm.play();
      if (p && p.catch) p.catch(() => {});          // 自动播放被拦就安静等着
    }
    bgmFade = setInterval(() => {
      const v = Math.min(target, bgm.volume + target / 12);
      bgm.volume = v;
      if (v >= target) clearInterval(bgmFade);
    }, 60);
  }

  function stopBgm() {
    if (!bgm) return;
    clearInterval(bgmFade);
    bgmFade = setInterval(() => {
      const v = Math.max(0, bgm.volume - 0.32 / 8);
      bgm.volume = v;
      if (v <= 0.001) { clearInterval(bgmFade); bgm.pause(); bgm.volume = 0.32; }
    }, 50);
  }

  function setBgm(on) {
    bgmOn = !!on;
    try { localStorage.setItem('cc-bgm', bgmOn ? 'on' : 'off'); } catch (e) { /* 忽略 */ }
    syncBgmBtn();
    if (bgmOn) playBgm(); else stopBgm();
  }

  function scheduleAuto(delay) {
    clearTimeout(autoTimer);
    if (!autoMode) return;
    autoTimer = setTimeout(() => {
      if (!autoMode) return;
      if (liveSession) liveSession.click();
      else nextStep();
    }, delay);
  }

  /* ── 辅助 ── */
  function setBg(bgKey) {
    const src = BG_IMAGES[bgKey];
    if (!dialogBg) return;
    dialogBg.style.backgroundImage = src ? `url("${src}")` : 'none';
  }

  function showScene(which) {
    sceneMap.classList.toggle('active', which === 'map');
    scene3D.classList.toggle('active', which === '3d');
    sceneDialog.classList.toggle('active', which === 'dialog');
  }

  function hideCharacters() {
    charLeft.classList.add('hidden');
    charRight.classList.add('hidden');
  }

  /** 把 CSS 剪影换成真人立绘 */
  function updateCharacter(el, id, side) {
    if (!el) return;
    const info = CHAR_IMAGES[id];
    if (!id || !info) { el.classList.add('hidden'); el.innerHTML = ''; return; }
    el.className = 'character char-' + (side || 'left');
    el.innerHTML = `<img src="${info.img}" alt="${info.name}" draggable="false">
                    <span class="char-name">${info.name}</span>`;
    el.classList.remove('hidden');
    el.classList.add('char-in');
  }

  function showMapInstruction(text) {
    let el = $('map-instruction');
    if (!el) {
      el = document.createElement('div');
      el.id = 'map-instruction';
      sceneMap.appendChild(el);
    }
    el.textContent = text;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = 'fadeInOut 6s ease forwards';
  }

  function updateHUD() {
    const chapter = chapters[chapterIdx];
    if (!chapter) return;
    const nums = ['一', '二', '三', '四', '五', '六', '七', '八'];
    hudChapterNum.textContent = `第${nums[chapterIdx] || (chapterIdx + 1)}幕`;
    hudChapterName.textContent = chapter.title;

    const totalSteps = chapters.reduce((s, ch) => s + ch.steps.length, 0);
    const doneSteps = chapters.slice(0, chapterIdx).reduce((s, ch) => s + ch.steps.length, 0) + stepIdx;
    const pct = Math.round(doneSteps / totalSteps * 100);
    hudProgressFill.style.width = pct + '%';
    hudProgressText.textContent = pct + '%';

    if (window.MapModule) window.MapModule.setUnlockedIdx(chapterIdx * 2 + 1);
  }

  function updateScore(val) {
    score = val;
    hudScoreVal.textContent = score;
    $('end-score-num').textContent = score;
  }

  function switchScreen(from, to) {
    from.classList.add('fade-out');
    setTimeout(() => {
      from.classList.remove('active', 'fade-out');
      to.classList.add('active');
    }, 220);
  }

  function endGame() {
    updateScore(score);
    $('end-score-num').textContent = score;
    switchScreen(screenGame, screenEnd);
  }

  return { init, onMapClick, onQuizAnswer };

})();

document.addEventListener('DOMContentLoaded', () => window.Engine.init());
