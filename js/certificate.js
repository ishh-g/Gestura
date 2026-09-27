/**
 * AI-Based Sign Language Recognition and Learning System
 * Certificate of Completion Generator
 */

const CertificateModule = (() => {
  const init = () => {
    // Ready
  };

  const openModal = () => {
    const modal = document.getElementById('certificate-modal');
    if (modal) {
      modal.classList.add('modal-open');
      renderCertificateCanvas();
    }
  };

  const closeModal = () => {
    const modal = document.getElementById('certificate-modal');
    if (modal) modal.classList.remove('modal-open');
  };

  const renderCertificateCanvas = () => {
    const canvas = document.getElementById('certificate-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 800;

    const user = AuthModule.getUser() || { name: 'Alex Johnson' };
    const recipientName = user.name;
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const certId = `SIGNAI-${Math.floor(100000 + Math.random() * 900000)}`;

    // 1. Background
    ctx.fillStyle = '#F2E2D0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Outer ink border
    ctx.strokeStyle = '#16130E';
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    // Inner Border
    ctx.strokeStyle = '#16130E';
    ctx.lineWidth = 1;
    ctx.strokeRect(45, 45, canvas.width - 90, canvas.height - 90);

    // 3. Corner Ornaments
    ctx.fillStyle = '#2E3B2A';
    const corners = [
      [50, 50], [canvas.width - 50, 50],
      [50, canvas.height - 50], [canvas.width - 50, canvas.height - 50]
    ];
    corners.forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. Header & Badge
    ctx.textAlign = 'center';
    ctx.fillStyle = '#16130E';
    ctx.font = '500 22px Jost, sans-serif';
    ctx.fillText('GESTURA — SIGN LANGUAGE STUDIO', canvas.width / 2, 120);

    ctx.fillStyle = '#2E3B2A';
    ctx.font = '500 13px Jost, sans-serif';
    ctx.fillText('BOTANICA EDITION • PRACTICE COMPLETION', canvas.width / 2, 150);

    // 5. Title
    ctx.fillStyle = '#16130E';
    ctx.font = '400 54px Fraunces, serif';
    ctx.fillText('Certificate of Practice', canvas.width / 2, 230);

    ctx.fillStyle = '#3E342A';
    ctx.font = 'italic 20px Fraunces, serif';
    ctx.fillText('This is warmly presented to', canvas.width / 2, 280);

    // 6. Recipient Name
    ctx.fillStyle = '#16130E';
    ctx.font = '500 44px Fraunces, serif';
    ctx.fillText(recipientName, canvas.width / 2, 345);

    // Underline
    ctx.strokeStyle = '#16130E';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 250, 365);
    ctx.lineTo(canvas.width / 2 + 250, 365);
    ctx.stroke();

    // 7. Body Text
    ctx.fillStyle = '#3E342A';
    ctx.font = '18px Jost, sans-serif';
    ctx.fillText('for gentle practice in hand signs — numbers 0–9, hello,', canvas.width / 2, 420);
    ctx.fillText('everyday phrases, and kind, steady communication.', canvas.width / 2, 455);

    // 8. Seal Medal
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 570, 52, 0, Math.PI * 2);
    ctx.fillStyle = '#2E3B2A';
    ctx.fill();
    ctx.strokeStyle = '#16130E';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#F2E2D0';
    ctx.font = '600 15px Jost, sans-serif';
    ctx.fillText('GESTURA', canvas.width / 2, 565);
    ctx.font = '500 11px Jost, sans-serif';
    ctx.fillText('STUDIO', canvas.width / 2, 585);

    // 9. Signatures and Date
    ctx.textAlign = 'left';
    ctx.fillStyle = '#3E342A';
    ctx.font = '15px Jost, sans-serif';
    ctx.fillText(`Shared on: ${dateStr}`, 100, 680);
    ctx.fillText(`Note no: ${certId}`, 100, 710);

    ctx.textAlign = 'right';
    ctx.font = 'italic 22px Fraunces, cursive';
    ctx.fillStyle = '#16130E';
    ctx.fillText('Gestura Studio', canvas.width - 100, 675);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width - 280, 685);
    ctx.lineTo(canvas.width - 100, 685);
    ctx.stroke();
    ctx.font = '14px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Project Supervisor & AI Lead', canvas.width - 100, 710);
  };

  const downloadCertificate = () => {
    const canvas = document.getElementById('certificate-canvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `SignAI_Certificate_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    AppModule.showToast('Certificate Downloaded', 'Your certificate has been saved in high-resolution PNG format.', 'success');
  };

  return {
    init,
    openModal,
    closeModal,
    renderCertificateCanvas,
    downloadCertificate
  };
})();
