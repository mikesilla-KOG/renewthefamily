const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelectorAll('#mobile-menu a');
const accordionButtons = document.querySelectorAll('.accordion-toggle');
const commentForm = document.getElementById('comment-form');
const commentsList = document.getElementById('comments-list');
const clearCommentsButton = document.getElementById('clear-comments');
const commentStatus = document.getElementById('comment-status');
const storageKey = 'renew-the-family-comments';
const chartPalette = Object.freeze({
  hearth: '#9C2F2F',
  olive: '#4A7043',
  ember: '#7A4937'
});
const allowedChartColors = new Set(Object.values(chartPalette));

const defaultComments = [
  {
    name: 'Miriam',
    topic: 'Marriage',
    message: 'We need more examples of marriages that stay faithful through hardship. Stability is a witness to children.',
    time: 'Just now'
  },
  {
    name: 'David',
    topic: 'Policy',
    message: 'Affordable housing and family-friendly tax policy would give young couples real breathing room to welcome children.',
    time: 'Today'
  }
];

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('hidden');
    menuToggle.setAttribute('aria-expanded', String(!open));
  });
}

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    mobileMenu?.classList.add('hidden');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

accordionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const target = document.getElementById(button.dataset.target || '');
    if (!target) return;
    const isHidden = target.classList.toggle('hidden');
    button.setAttribute('aria-expanded', String(!isHidden));
    button.textContent = isHidden ? 'Show details' : 'Hide details';
  });
});

function loadComments() {
  try {
    const storedComments = localStorage.getItem(storageKey);
    const parsed = storedComments ? JSON.parse(storedComments) : null;
    return Array.isArray(parsed) && parsed.length ? parsed : defaultComments;
  } catch {
    return defaultComments;
  }
}

function saveComments(comments) {
  localStorage.setItem(storageKey, JSON.stringify(comments));
}

function createCommentMarkup(comment) {
  return `
    <article class="comment-card">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="font-semibold text-ink">${escapeHtml(comment.name)}</p>
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-hearth">${escapeHtml(comment.topic)}</p>
        </div>
        <p class="text-sm text-ink/50">${escapeHtml(comment.time)}</p>
      </div>
      <p class="mt-4 text-sm leading-7 text-ink/80">${escapeHtml(comment.message)}</p>
    </article>
  `;
}

function renderComments() {
  const comments = loadComments();
  commentsList.innerHTML = comments.map(createCommentMarkup).join('');
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

if (commentForm) {
  commentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(commentForm);
    const comment = {
      name: String(formData.get('name') || '').trim(),
      topic: String(formData.get('topic') || 'Discussion').trim(),
      message: String(formData.get('message') || '').trim(),
      time: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };

    if (!comment.name || !comment.message) {
      commentStatus.textContent = 'Please add both your name and a comment.';
      return;
    }

    const comments = [comment, ...loadComments()];
    saveComments(comments);
    renderComments();
    commentForm.reset();
    commentStatus.textContent = 'Your comment was saved locally in this browser.';
  });
}

clearCommentsButton?.addEventListener('click', () => {
  localStorage.removeItem(storageKey);
  renderComments();
  commentStatus.textContent = 'Demo comments reset.';
});

function buildCharts() {
  const familyOutcomesCanvas = document.getElementById('familyOutcomesChart');
  const fertilityCanvas = document.getElementById('fertilityChart');

  if (typeof Chart === 'undefined') {
    renderFallbackChart(
      familyOutcomesCanvas,
      [
        ['Poverty exposure gap', 72, chartPalette.hearth],
        ['School stability advantage', 64, chartPalette.olive],
        ['Behavioral risk reduction', 58, chartPalette.ember],
        ['Economic mobility lift', 74, chartPalette.olive]
      ]
    );
    renderFallbackChart(
      fertilityCanvas,
      [
        ['United States · 1.62', 77, chartPalette.hearth],
        ['France · 1.79', 85, chartPalette.olive],
        ['Hungary · 1.55', 74, chartPalette.ember],
        ['Japan · 1.26', 60, chartPalette.hearth],
        ['South Korea · 0.72', 34, chartPalette.hearth]
      ],
      'Bars are normalized so 100 represents replacement fertility (about 2.1 births per woman).'
    );
    return;
  }

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#2F2623',
          font: { family: 'Inter', weight: '600' }
        }
      },
      tooltip: {
        backgroundColor: '#2F2623',
        titleFont: { family: 'Inter', weight: '700' },
        bodyFont: { family: 'Inter' }
      }
    },
    scales: {
      x: {
        ticks: { color: '#5b4c45', font: { family: 'Inter' } },
        grid: { display: false }
      },
      y: {
        ticks: { color: '#5b4c45', font: { family: 'Inter' } },
        grid: { color: 'rgba(47,38,35,0.08)' }
      }
    }
  };

  if (familyOutcomesCanvas) {
    new Chart(familyOutcomesCanvas, {
      type: 'bar',
      data: {
        labels: ['Poverty exposure', 'School disruption', 'Behavioral risk', 'Economic mobility'],
        datasets: [
          {
            label: 'Stable married biological home',
            data: [12, 16, 18, 74],
            backgroundColor: chartPalette.olive,
            borderRadius: 12
          },
          {
            label: 'Single-parent / disrupted home',
            data: [31, 29, 33, 46],
            backgroundColor: chartPalette.hearth,
            borderRadius: 12
          }
        ]
      },
      options: {
        ...commonOptions,
        scales: {
          ...commonOptions.scales,
          y: {
            ...commonOptions.scales.y,
            beginAtZero: true,
            suggestedMax: 80,
            title: {
              display: true,
              text: 'Illustrative index / percent',
              color: '#5b4c45'
            }
          }
        }
      }
    });
  }

  if (fertilityCanvas) {
    new Chart(fertilityCanvas, {
      type: 'line',
      data: {
        labels: ['United States', 'France', 'Hungary', 'Japan', 'South Korea'],
        datasets: [
          {
            label: 'Recent fertility rate',
            data: [1.62, 1.79, 1.55, 1.26, 0.72],
            borderColor: chartPalette.hearth,
            backgroundColor: 'rgba(156,47,47,0.14)',
            fill: true,
            tension: 0.35,
            pointBackgroundColor: chartPalette.hearth,
            pointRadius: 5
          },
          {
            label: 'Replacement level',
            data: [2.1, 2.1, 2.1, 2.1, 2.1],
            borderColor: chartPalette.olive,
            borderDash: [7, 7],
            pointRadius: 0,
            tension: 0
          }
        ]
      },
      options: {
        ...commonOptions,
        scales: {
          ...commonOptions.scales,
          y: {
            ...commonOptions.scales.y,
            beginAtZero: true,
            suggestedMax: 2.5,
            title: {
              display: true,
              text: 'Children per woman',
              color: '#5b4c45'
            }
          }
        }
      }
    });
  }
}

function renderFallbackChart(canvas, rows, note = 'Fallback view shown while Chart.js is unavailable.') {
  if (!canvas?.parentElement) return;
  const wrapper = document.createElement('div');
  wrapper.className = 'chart-fallback';
  wrapper.setAttribute('role', 'img');
  wrapper.setAttribute('aria-label', 'Static fallback chart');

  rows.forEach(([label, value, color]) => {
    const row = document.createElement('div');
    row.className = 'chart-fallback-row';

    const labels = document.createElement('div');
    labels.className = 'chart-fallback-labels';

    const labelText = document.createElement('span');
    labelText.textContent = String(label);

    const valueText = document.createElement('strong');
    valueText.textContent = String(value);

    labels.append(labelText, valueText);

    const track = document.createElement('div');
    track.className = 'chart-fallback-track';

    const bar = document.createElement('div');
    bar.className = 'chart-fallback-bar';
    bar.style.width = `${safeChartPercent(value)}%`;
    bar.style.background = safeChartColor(color);

    track.appendChild(bar);
    row.append(labels, track);
    wrapper.appendChild(row);
  });

  const noteText = document.createElement('p');
  noteText.className = 'text-sm leading-7 text-ink/60';
  noteText.textContent = note;
  wrapper.appendChild(noteText);

  canvas.parentElement.replaceChildren(wrapper);
}

function safeChartColor(color) {
  return allowedChartColors.has(color) ? color : chartPalette.ember;
}

function safeChartPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(number, 100));
}

renderComments();
buildCharts();
