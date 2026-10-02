/**
 * summary.js — 课堂小结：长征事件排序活动
 */

window.SummaryModule = (function () {

  /* 正确答案（按时间先后） */
  const ANSWER = [
    '开始长征（1934.10）',
    '突破四道封锁线（1934.11）',
    '血战湘江（1934.11—12）',
    '强渡乌江·攻占遵义（1935.01）',
    '四渡赤水（1935.01—03）',
    '巧渡金沙江（1935.04—05）',
    '强渡大渡河·飞夺泸定桥（1935.05）',
    '翻雪山·过草地（1935.06—08）',
    '突破腊子口·吴起镇会师（1935.09—10）',
    '会宁会师（1936.10）'
  ];

  let picked = [];
  let pool, slots, hint;

  function init() {
    pool  = document.getElementById('sortPool');
    slots = document.getElementById('sortSlots');
    hint  = document.getElementById('sortHint');
    document.getElementById('sortCheck')?.addEventListener('click', () => check());
    document.getElementById('sortReset')?.addEventListener('click', reset);
    reset();
  }

  function reset() {
    if (!pool || !slots) return;
    picked = [];
    pool.innerHTML = '';
    slots.innerHTML = '';
    if (hint) {
      hint.textContent = `按时间先后，依次点击下面的卡片（共 ${ANSWER.length} 项）。`;
      hint.style.color = '';
    }

    /* 洗牌后铺开 */
    const shuffled = ANSWER.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    shuffled.forEach(txt => {
      const b = document.createElement('button');
      b.className = 'chip';
      b.dataset.value = txt;
      b.textContent = txt;
      b.addEventListener('click', () => pick(txt));
      pool.appendChild(b);
    });

    for (let i = 0; i < ANSWER.length; i++) {
      const li = document.createElement('li');
      li.innerHTML = '<span class="slotval">—</span>';
      slots.appendChild(li);
    }
  }

  function pick(txt) {
    if (picked.includes(txt)) return;
    const chip = [...pool.children].find(c => c.dataset.value === txt && !c.classList.contains('is-used'));
    if (!chip) return;
    chip.classList.add('is-used');
    picked.push(txt);
    repaint();
    if (picked.length === ANSWER.length) check(true);
  }

  function repaint() {
    [...slots.children].forEach((li, i) => {
      li.className = '';
      li.dataset.value = '';
      li.innerHTML = '<span class="slotval">—</span>';
      const v = picked[i];
      if (!v) return;
      li.dataset.value = v;
      li.querySelector('.slotval').textContent = v;
      const undo = document.createElement('button');
      undo.textContent = '移除';
      undo.addEventListener('click', () => {
        const k = picked.indexOf(v);
        if (k < 0) return;
        picked.splice(k, 1);
        [...pool.children].find(c => c.dataset.value === v)?.classList.remove('is-used');
        repaint();
      });
      li.appendChild(undo);
    });
  }

  function check(auto = false) {
    if (picked.length < ANSWER.length) {
      if (!auto && hint) { hint.textContent = `还差 ${ANSWER.length - picked.length} 项没有排序`; hint.style.color = '#e0857c'; }
      return;
    }
    let right = 0;
    [...slots.children].forEach((li, i) => {
      const ok = li.dataset.value === ANSWER[i];
      li.classList.toggle('is-ok', ok);
      li.classList.toggle('is-bad', !ok);
      if (ok) right++;
    });
    if (hint) {
      if (right === ANSWER.length) {
        hint.textContent = '全部正确 ✓　长征的进程：出发 → 血战湘江 → 遵义会议 → 四渡赤水 → 巧渡金沙江 → 强渡大渡河·飞夺泸定桥 → 翻雪山过草地 → 腊子口 → 吴起镇·会宁会师';
        hint.style.color = '#8fd0a5';
      } else {
        hint.textContent = `正确 ${right} / ${ANSWER.length} 项，红色的位置再想一想`;
        hint.style.color = '#e0857c';
      }
    }
  }

  return { init, reset, check };

})();
