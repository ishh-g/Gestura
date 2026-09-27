/**
 * AI-Based Sign Language Recognition and Learning System
 * Final Year Major Project Report & Viva Voce Q&A Module
 */

const ReportModule = (() => {
  const init = () => {
    // Ready
  };

  const openReportModal = () => {
    const modal = document.getElementById('report-modal');
    if (modal) modal.classList.add('modal-open');
  };

  const closeReportModal = () => {
    const modal = document.getElementById('report-modal');
    if (modal) modal.classList.remove('modal-open');
  };

  const switchReportTab = (tabId) => {
    document.querySelectorAll('.report-tab-pane').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.report-nav-btn').forEach(btn => btn.classList.remove('active'));

    const target = document.getElementById(`report-pane-${tabId}`);
    if (target) target.style.display = 'block';

    const activeBtn = document.querySelector(`.report-nav-btn[data-tab="${tabId}"]`);
    if (activeBtn) activeBtn.classList.add('active');
  };

  return {
    init,
    openReportModal,
    closeReportModal,
    switchReportTab
  };
})();
