/**
 * AI-Based Sign Language Recognition and Learning System
 * Student & User Dashboard Analytics Module
 */

const DashboardModule = (() => {
  let progressChart = null;

  const init = () => {
    renderUserStats();
    initProgressChart();
  };

  const renderUserStats = () => {
    const user = AuthModule.getUser() || {
      name: 'Alex Johnson',
      level: 'Intermediate (Level 4)',
      completedLessons: 18,
      totalLessons: 26,
      accuracyAvg: 94.2,
      streakDays: 7
    };

    const welcomeName = document.getElementById('dash-welcome-name');
    const levelBadge = document.getElementById('dash-level-badge');
    const lessonsCount = document.getElementById('dash-lessons-count');
    const lessonsBar = document.getElementById('dash-lessons-bar');
    const accuracyVal = document.getElementById('dash-accuracy-val');
    const streakVal = document.getElementById('dash-streak-val');

    if (welcomeName) welcomeName.textContent = user.name;
    if (levelBadge) levelBadge.textContent = user.level;
    if (lessonsCount) lessonsCount.textContent = `${user.completedLessons} / ${user.totalLessons}`;
    if (lessonsBar) lessonsBar.style.width = `${Math.round((user.completedLessons / user.totalLessons) * 100)}%`;
    if (accuracyVal) accuracyVal.textContent = `${user.accuracyAvg}%`;
    if (streakVal) streakVal.textContent = `${user.streakDays} Days 🔥`;
  };

  const initProgressChart = () => {
    const ctx = document.getElementById('dashboard-progress-canvas');
    if (!ctx) return;

    if (progressChart) {
      progressChart.destroy();
    }

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = '#16130E';
    const gridColor = 'rgba(22,19,14,0.18)';

    progressChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Accuracy %',
            data: [82, 88, 85, 91, 89, 94, 96],
            borderColor: '#16130E',
            backgroundColor: 'rgba(22,19,14,0.08)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointBackgroundColor: '#16130E',
            pointRadius: 3
          },
          {
            label: 'Signs Practiced (Qty)',
            data: [35, 42, 28, 55, 48, 62, 70],
            borderColor: '#2E3B2A',
            backgroundColor: 'transparent',
            tension: 0.4,
            borderWidth: 2,
            borderDash: [5, 5],
            pointBackgroundColor: '#2E3B2A',
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { color: textColor, font: { family: "'Plus Jakarta Sans', sans-serif", weight: '600' } }
          },
          tooltip: {
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            titleColor: isDark ? '#ffffff' : '#0f172a',
            bodyColor: isDark ? '#cbd5e1' : '#475569',
            borderColor: '#6366f1',
            borderWidth: 1,
            padding: 10,
            boxPadding: 4
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: textColor }
          },
          y: {
            grid: { color: gridColor },
            ticks: { color: textColor },
            min: 20,
            max: 100
          }
        }
      }
    });
  };

  return {
    init,
    renderUserStats,
    initProgressChart
  };
})();
