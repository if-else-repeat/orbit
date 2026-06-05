// ════════════════════════════════════════════════════════════
//  ORBIT v2 — Stats Screen Module
// ════════════════════════════════════════════════════════════

const Stats = (() => {

  let currentExportStyle = 'minimal';

  function show() {
    UI.generateStarField('stats-stars', 60);
    populateStats();
    populateAchievements();
    generatePreview();
    bindExportControls();
  }

  function populateStats() {
    const d = Storage.get();
    setText('s-today',    (d.todayStudyMins  || 0) + '');
    setText('s-week',     (d.weekStudyMins   || 0) + '');
    setText('s-total',    (d.totalStudyMins  || 0) + '');
    setText('s-sessions', (d.studySessions   || 0) + '');
    setText('s-orbits',   (d.orbitSessions   || 0) + '');
    setText('s-streak',   (d.streakDays      || 0) + '');
  }

  function populateAchievements() {
    const d     = Storage.get();
    const grid  = document.getElementById('ach-grid');
    const all   = Storage.getAllAchievements();
    if (!grid) return;
    grid.innerHTML = '';
    all.forEach(ach => {
      const earned = d.achievements.includes(ach.id);
      const el     = document.createElement('div');
      el.className = 'ach-item' + (earned ? ' earned' : '');
      el.innerHTML = `
        <span class="ach-item-icon">${ach.icon}</span>
        <span class="ach-item-name">${ach.label}</span>
      `;
      grid.appendChild(el);
    });
  }

  function generatePreview() {
    const data = Export.buildData();
    Export.generate(currentExportStyle, data);
  }

  function bindExportControls() {
    document.querySelectorAll('.export-style-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.export-style-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentExportStyle = btn.dataset.style;
        generatePreview();
      };
    });

    const dlBtn = document.getElementById('btn-download-card');
    if (dlBtn) dlBtn.onclick = () => Export.download(currentExportStyle);
  }

  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  return { show };
})();
