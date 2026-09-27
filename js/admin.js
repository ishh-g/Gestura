/**
 * AI-Based Sign Language Recognition and Learning System
 * Admin Dashboard & System Monitoring Module
 */

const AdminModule = (() => {
  let modelAccuracyChart = null;
  let datasetChart = null;

  let mockUsers = [
    { id: 1, name: 'Alex Johnson', email: 'alex.j@example.com', role: 'Student', lessons: '18/26', accuracy: '94.2%', status: 'Active' },
    { id: 2, name: 'Priya Sharma', email: 'priya.s@example.com', role: 'Student', lessons: '24/26', accuracy: '97.8%', status: 'Active' },
    { id: 3, name: 'Marcus Chen', email: 'marcus.c@example.com', role: 'Student', lessons: '08/26', accuracy: '86.5%', status: 'Inactive' },
    { id: 4, name: 'Elena Rostova', email: 'elena.r@example.com', role: 'Student', lessons: '26/26', accuracy: '99.1%', status: 'Certified' },
    { id: 5, name: 'David Kim', email: 'david.k@example.com', role: 'Student', lessons: '12/26', accuracy: '91.0%', status: 'Active' }
  ];

  const init = () => {
    renderUserTable();
    initAdminCharts();
  };

  const renderUserTable = (filterText = '') => {
    const tbody = document.getElementById('admin-users-table-body');
    if (!tbody) return;

    const filtered = mockUsers.filter(u => 
      u.name.toLowerCase().includes(filterText.toLowerCase()) || 
      u.email.toLowerCase().includes(filterText.toLowerCase())
    );

    tbody.innerHTML = filtered.map(u => `
      <tr>
        <td style="font-weight: 700;">${u.name}</td>
        <td class="text-muted">${u.email}</td>
        <td><span class="pill-badge pill-primary">${u.role}</span></td>
        <td>${u.lessons}</td>
        <td style="font-weight: 700; color: var(--accent-emerald);">${u.accuracy}</td>
        <td>
          <span class="pill-badge pill-${u.status === 'Active' ? 'emerald' : u.status === 'Certified' ? 'cyan' : 'amber'}">
            ${u.status}
          </span>
        </td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="AdminModule.deleteUser(${u.id})" title="Delete User">
            <i class="fa-solid fa-trash text-rose"></i>
          </button>
        </td>
      </tr>
    `).join('');
  };

  const deleteUser = (id) => {
    mockUsers = mockUsers.filter(u => u.id !== id);
    renderUserTable();
    AppModule.showToast('User Removed', 'User record has been safely deleted.', 'info');
  };

  const initAdminCharts = () => {
    const textColor = '#16130E';
    const gridColor = 'rgba(22,19,14,0.18)';

    // 1. Model Accuracy Benchmark
    const ctx1 = document.getElementById('admin-accuracy-canvas');
    if (ctx1) {
      if (modelAccuracyChart) modelAccuracyChart.destroy();
      modelAccuracyChart = new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: ['Hello', 'Numbers 0-5', 'Numbers 6-9', 'Phrases'],
          datasets: [{
            label: 'Mirror steadiness (%)',
            data: [92, 90, 84, 88],
            backgroundColor: ['#16130E', '#2E3B2A', '#8A7A64', '#C9AE8C'],
            borderRadius: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: { grid: { color: gridColor }, ticks: { color: textColor } },
            y: { grid: { color: gridColor }, ticks: { color: textColor }, min: 50, max: 100 }
          }
        }
      });
    }

    // 2. Dataset Distribution Pie
    const ctx2 = document.getElementById('admin-dataset-canvas');
    if (ctx2) {
      if (datasetChart) datasetChart.destroy();
      datasetChart = new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: ['Numbers 0-10', 'Hello & manners', 'Everyday', 'Help cards'],
          datasets: [{
            data: [22, 18, 16, 12],
            backgroundColor: ['#16130E', '#2E3B2A', '#8A7A64', '#E2C2A4'],
            borderWidth: 1,
            borderColor: '#16130E'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: textColor, font: { size: 11 } }
            }
          }
        }
      });
    }
  };

  return {
    init,
    renderUserTable,
    deleteUser,
    initAdminCharts
  };
})();
