/**
 * quiz.js — 答题系统
 * 支持计时、正误反馈、积分、进度推进
 */

window.QuizModule = (function () {

  let currentQuiz   = null;
  let onComplete    = null;
  let timerInterval = null;
  let timeLeft      = 30;
  let answered      = false;

  const overlay   = document.getElementById('quiz-overlay');
  const questionEl= document.getElementById('quiz-question');
  const optionsEl = document.getElementById('quiz-options');
  const feedbackEl= document.getElementById('quiz-feedback');
  const fbIcon    = document.getElementById('quiz-feedback-icon');
  const fbText    = document.getElementById('quiz-feedback-text');
  const nextBtn   = document.getElementById('quiz-next-btn');
  const timerBar  = document.getElementById('quiz-timer-bar');

  /* ── 显示题目 ── */
  function show(quizData, callback) {
    currentQuiz = quizData;
    onComplete  = callback;
    answered    = false;
    timeLeft    = 30;

    questionEl.textContent = quizData.question;
    optionsEl.innerHTML    = '';
    feedbackEl.classList.add('hidden');

    quizData.options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.innerHTML = `<span class="option-label">${opt.label}</span><span>${opt.text}</span>`;
      btn.addEventListener('click', () => answer(opt, quizData.options));
      optionsEl.appendChild(btn);
    });

    overlay.classList.remove('hidden');
    startTimer();
  }

  /* ── 答题 ── */
  function answer(chosen, allOptions) {
    if (answered) return;
    answered = true;
    stopTimer();

    // 标记所有选项
    const btns = optionsEl.querySelectorAll('.quiz-option');
    btns.forEach((btn, i) => {
      btn.disabled = true;
      if (allOptions[i].correct) btn.classList.add('correct');
      else if (allOptions[i] === chosen && !chosen.correct) btn.classList.add('wrong');
    });

    const correct = chosen.correct;
    fbIcon.textContent = correct ? '✅' : '❌';
    fbText.innerHTML = correct
      ? `<strong style="color:#5ab86a">回答正确！</strong><br>${currentQuiz.explanation || ''}`
      : `<strong style="color:#e03030">回答错误。</strong> 正确答案是：<strong style="color:#f0cc55">${allOptions.find(o=>o.correct).text}</strong><br><br>${currentQuiz.explanation || ''}`;
    feedbackEl.classList.remove('hidden');

    // 通知引擎得分
    if (window.Engine && window.Engine.onQuizAnswer) {
      window.Engine.onQuizAnswer(correct);
    }
  }

  /* ── 计时器 ── */
  function startTimer() {
    if (timerBar) timerBar.style.transition = 'none';
    if (timerBar) timerBar.style.width = '100%';

    requestAnimationFrame(() => {
      if (timerBar) {
        timerBar.style.transition = `width ${timeLeft}s linear`;
        timerBar.style.width = '0%';
      }
    });

    timerInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        stopTimer();
        if (!answered) {
          // 超时处理
          answered = true;
          const btns = optionsEl.querySelectorAll('.quiz-option');
          btns.forEach((btn, i) => {
            btn.disabled = true;
            if (currentQuiz.options[i].correct) btn.classList.add('correct');
          });
          fbIcon.textContent = '⏰';
          fbText.innerHTML = `<strong style="color:#c07000">时间到！</strong> 正确答案是：<strong style="color:#f0cc55">${currentQuiz.options.find(o=>o.correct).text}</strong><br><br>${currentQuiz.explanation || ''}`;
          feedbackEl.classList.remove('hidden');
          if (window.Engine && window.Engine.onQuizAnswer) {
            window.Engine.onQuizAnswer(false);
          }
        }
      }
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  /* ── 关闭 ── */
  function hide() {
    stopTimer();
    overlay.classList.add('hidden');
  }

  /* ── 绑定"继续"按钮 ── */
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      hide();
      if (onComplete) onComplete();
    });
  }

  return { show, hide };

})();
