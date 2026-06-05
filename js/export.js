// ════════════════════════════════════════════════════════════
//  ORBIT v2 — Export Module
//  Generates downloadable achievement images via Canvas
//  Styles: minimal · poster · square
// ════════════════════════════════════════════════════════════

const Export = (() => {

  const COLORS = {
    bg:       '#070B1A',
    bgMid:    '#0D1530',
    cyan:     '#6EE7FF',
    gold:     '#FFD166',
    lavender: '#B794F4',
    mint:     '#8AFFC1',
    dimText:  '#4A6080',
    text:     '#E8F4FF',
  };

  // ── Helpers ─────────────────────────────────────────────────

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawStars(ctx, w, h, count = 120) {
    for (let i = 0; i < count; i++) {
      const x  = Math.random() * w;
      const y  = Math.random() * h;
      const r  = Math.random() * 1.2 + 0.2;
      const a  = Math.random() * 0.6 + 0.1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 220, 255, ${a})`;
      ctx.fill();
    }
  }

  function drawGlow(ctx, x, y, color, radius, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, color.replace(')', `, ${alpha})`).replace('rgb', 'rgba'));
    g.addColorStop(1, 'transparent');
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();
  }

  function drawOrbitDiagram(ctx, cx, cy, r, orbAngle) {
    // Orbit path
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(110, 231, 255, 0.2)'; ctx.lineWidth = 1; ctx.stroke();

    // Star
    const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 10);
    sg.addColorStop(0, '#FFFFFF'); sg.addColorStop(0.4, COLORS.cyan); sg.addColorStop(1, 'transparent');
    ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.fillStyle = sg; ctx.fill();

    // Orb
    const ox = cx + Math.cos(orbAngle) * r;
    const oy = cy + Math.sin(orbAngle) * r;
    drawGlow(ctx, ox, oy, 'rgb(110, 231, 255)', 16, 0.3);
    const og = ctx.createRadialGradient(ox, oy, 0, ox, oy, 5);
    og.addColorStop(0, '#fff'); og.addColorStop(0.5, COLORS.cyan); og.addColorStop(1, 'transparent');
    ctx.beginPath(); ctx.arc(ox, oy, 5, 0, Math.PI * 2); ctx.fillStyle = og; ctx.fill();

    // Fragment
    const fa  = orbAngle + 0.9;
    const fx  = cx + Math.cos(fa) * r * 0.7;
    const fy  = cy + Math.sin(fa) * r * 0.7;
    drawGlow(ctx, fx, fy, 'rgb(255, 209, 102)', 10, 0.4);
    ctx.beginPath(); ctx.arc(fx, fy, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.gold; ctx.fill();
  }

  // ── Stat row helper ──────────────────────────────────────────

  function statRow(ctx, x, y, label, value, labelColor, valueColor, fontSize = 13) {
    ctx.font        = `${fontSize * 0.75}px 'Space Mono', monospace`;
    ctx.fillStyle   = labelColor;
    ctx.textAlign   = 'left';
    ctx.fillText(label.toUpperCase(), x, y);
    ctx.font        = `bold ${fontSize}px 'Space Mono', monospace`;
    ctx.fillStyle   = valueColor;
    ctx.textAlign   = 'right';
    ctx.fillText(value, x + 220, y);
    ctx.textAlign   = 'left';
  }

  // ── STYLE: MINIMAL ───────────────────────────────────────────

  function drawMinimal(canvas, data) {
    canvas.width = 800; canvas.height = 400;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;

    // Background
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#070B1A'); bg.addColorStop(1, '#0D1530');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    drawStars(ctx, w, h, 90);

    // Top accent line
    const line = ctx.createLinearGradient(0, 0, w, 0);
    line.addColorStop(0, 'transparent'); line.addColorStop(0.5, COLORS.cyan); line.addColorStop(1, 'transparent');
    ctx.fillStyle = line; ctx.fillRect(0, 0, w, 1);

    // ORBIT wordmark
    ctx.font = 'bold 11px Space Mono, monospace';
    ctx.fillStyle = 'rgba(110,231,255,0.5)';
    ctx.letterSpacing = '0.3em';
    ctx.textAlign = 'left';
    ctx.fillText('ORBIT  ·  FOCUS RITUAL', 48, 50);

    // Orbit diagram (left)
    drawOrbitDiagram(ctx, 160, h / 2, 70, -0.6);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(280, 60); ctx.lineTo(280, h - 60); ctx.stroke();

    // Rank
    ctx.font = '32px Cormorant Garamond, Georgia, serif';
    ctx.fillStyle = COLORS.cyan;
    ctx.textAlign = 'left';
    ctx.fillText(data.rank, 310, 120);

    // Stats
    const sy = 160;
    statRow(ctx, 310, sy,       'Harmony',    String(data.harmony),     COLORS.dimText, COLORS.gold);
    statRow(ctx, 310, sy + 30,  'Fragments',  String(data.fragments),   COLORS.dimText, COLORS.text);
    statRow(ctx, 310, sy + 60,  'Breath Sync',data.breathSync + '%',    COLORS.dimText, COLORS.mint);
    statRow(ctx, 310, sy + 90,  'Study Today',data.studyToday + ' min', COLORS.dimText, COLORS.text);
    statRow(ctx, 310, sy + 120, 'Streak',     data.streak + ' days',    COLORS.dimText, COLORS.lavender);

    // Date
    ctx.font = '10px Space Mono, monospace';
    ctx.fillStyle = COLORS.dimText;
    ctx.textAlign = 'right';
    ctx.fillText(new Date().toDateString(), w - 48, h - 30);

    // Bottom line
    ctx.fillStyle = line; ctx.fillRect(0, h - 1, w, 1);
  }

  // ── STYLE: POSTER ────────────────────────────────────────────

  function drawPoster(canvas, data) {
    canvas.width = 600; canvas.height = 900;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;

    // Deep space bg
    const bg = ctx.createRadialGradient(w/2, h*0.35, 0, w/2, h*0.35, h*0.8);
    bg.addColorStop(0, '#0D1A3A'); bg.addColorStop(0.5, '#080D20'); bg.addColorStop(1, '#070B1A');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    drawStars(ctx, w, h, 180);

    // Nebula
    const neb = ctx.createRadialGradient(w*0.7, h*0.2, 0, w*0.7, h*0.2, 280);
    neb.addColorStop(0, 'rgba(113,63,240,0.07)'); neb.addColorStop(1, 'transparent');
    ctx.fillStyle = neb; ctx.fillRect(0, 0, w, h);

    // Large orbit diagram
    const diag_y = h * 0.32;
    drawGlow(ctx, w/2, diag_y, 'rgb(110,231,255)', 120, 0.08);
    drawOrbitDiagram(ctx, w/2, diag_y, 110, -0.5);

    // Outer ring decoration
    ctx.beginPath(); ctx.arc(w/2, diag_y, 140, 0, Math.PI*2);
    ctx.strokeStyle = 'rgba(183,148,244,0.1)'; ctx.lineWidth = 1;
    ctx.setLineDash([4, 12]); ctx.stroke(); ctx.setLineDash([]);

    // ORBIT title
    ctx.font = 'bold 52px Syncopate, sans-serif';
    ctx.fillStyle = COLORS.text;
    ctx.textAlign = 'center';
    ctx.letterSpacing = '0.3em';
    // Glow effect
    ctx.shadowColor = COLORS.cyan; ctx.shadowBlur = 30;
    ctx.fillText('ORBIT', w/2, diag_y * 1.75);
    ctx.shadowBlur = 0;

    ctx.font = '14px Space Mono, monospace';
    ctx.fillStyle = 'rgba(110,231,255,0.4)';
    ctx.fillText('FOCUS RITUAL', w/2, diag_y * 1.75 + 30);

    // Divider
    const div = ctx.createLinearGradient(0, 0, w, 0);
    div.addColorStop(0, 'transparent'); div.addColorStop(0.5, 'rgba(110,231,255,0.3)'); div.addColorStop(1, 'transparent');
    ctx.fillStyle = div; ctx.fillRect(60, diag_y * 1.75 + 50, w - 120, 1);

    // Rank badge
    const ry = diag_y * 1.75 + 100;
    ctx.font = 'italic 28px Cormorant Garamond, Georgia, serif';
    ctx.fillStyle = COLORS.cyan;
    ctx.textAlign = 'center';
    ctx.shadowColor = COLORS.cyan; ctx.shadowBlur = 20;
    ctx.fillText(data.rank, w/2, ry);
    ctx.shadowBlur = 0;

    // Stats grid
    const gx = 80, gy = ry + 50, gw = w - 160;
    const stats = [
      { label: 'HARMONY',     value: String(data.harmony),      color: COLORS.gold },
      { label: 'FRAGMENTS',   value: String(data.fragments),    color: COLORS.text },
      { label: 'BREATH SYNC', value: data.breathSync + '%',     color: COLORS.mint },
      { label: 'STUDY TODAY', value: data.studyToday + ' min',  color: COLORS.text },
      { label: 'TOTAL STUDY', value: data.totalStudy + ' min',  color: COLORS.lavender },
      { label: 'STREAK',      value: data.streak + ' days',     color: COLORS.lavender },
    ];

    stats.forEach((s, i) => {
      const col  = i % 2;
      const row  = Math.floor(i / 2);
      const sx   = gx + col * (gw / 2);
      const sy   = gy + row * 80;
      const bw   = gw / 2 - 16;

      roundRect(ctx, sx, sy, bw, 62, 2);
      ctx.fillStyle = 'rgba(16,25,53,0.5)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = '9px Space Mono, monospace';
      ctx.fillStyle = COLORS.dimText;
      ctx.textAlign = 'left';
      ctx.fillText(s.label, sx + 12, sy + 22);

      ctx.font = 'bold 20px Space Mono, monospace';
      ctx.fillStyle = s.color;
      ctx.fillText(s.value, sx + 12, sy + 46);
    });

    // Date + tagline
    const by = gy + Math.ceil(stats.length / 2) * 80 + 40;
    ctx.font = '11px Space Mono, monospace';
    ctx.fillStyle = COLORS.dimText;
    ctx.textAlign = 'center';
    ctx.fillText(new Date().toDateString(), w/2, by);
    ctx.fillText('Relax · Breathe · Return stronger', w/2, by + 22);
  }

  // ── STYLE: SQUARE (WhatsApp-friendly) ───────────────────────

  function drawSquare(canvas, data) {
    canvas.width = 600; canvas.height = 600;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;

    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#0A0F25'); bg.addColorStop(1, '#070B1A');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    drawStars(ctx, w, h, 100);

    // Center orbit
    drawGlow(ctx, w/2, h*0.38, 'rgb(110,231,255)', 80, 0.1);
    drawOrbitDiagram(ctx, w/2, h*0.38, 75, -0.4);

    // Rank
    ctx.font = 'italic 30px Cormorant Garamond, Georgia, serif';
    ctx.fillStyle = COLORS.cyan;
    ctx.textAlign = 'center';
    ctx.shadowColor = COLORS.cyan; ctx.shadowBlur = 18;
    ctx.fillText(data.rank, w/2, h * 0.64);
    ctx.shadowBlur = 0;

    // Quick stats row
    const items = [
      { v: String(data.harmony),      l: 'Harmony',  c: COLORS.gold },
      { v: data.breathSync + '%',      l: 'Breath',   c: COLORS.mint },
      { v: data.studyToday + 'm',      l: 'Today',    c: COLORS.lavender },
      { v: data.streak + 'd',          l: 'Streak',   c: COLORS.text },
    ];

    const cellW = w / items.length;
    items.forEach((item, i) => {
      const cx = cellW * i + cellW / 2;
      const cy = h * 0.78;

      ctx.font = 'bold 24px Space Mono, monospace';
      ctx.fillStyle = item.c;
      ctx.textAlign = 'center';
      ctx.fillText(item.v, cx, cy);

      ctx.font = '9px Space Mono, monospace';
      ctx.fillStyle = COLORS.dimText;
      ctx.fillText(item.l.toUpperCase(), cx, cy + 18);
    });

    // ORBIT wordmark bottom
    ctx.font = '11px Space Mono, monospace';
    ctx.fillStyle = 'rgba(110,231,255,0.35)';
    ctx.letterSpacing = '0.25em';
    ctx.textAlign = 'center';
    ctx.fillText('ORBIT · ' + new Date().toDateString(), w/2, h - 28);

    // Corner accent lines
    const accent = 'rgba(110,231,255,0.15)';
    ctx.strokeStyle = accent; ctx.lineWidth = 1;
    [[0,0,40,0],[0,0,0,40],[w,0,w-40,0],[w,0,w,40],
     [0,h,40,h],[0,h,0,h-40],[w,h,w-40,h],[w,h,w,h-40]].forEach(([x1,y1,x2,y2]) => {
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    });
  }

  // ── Generate & Preview ───────────────────────────────────────

  function generate(style, data) {
    const canvas = document.getElementById('export-canvas');
    switch (style) {
      case 'minimal': drawMinimal(canvas, data); break;
      case 'poster':  drawPoster(canvas, data);  break;
      case 'square':  drawSquare(canvas, data);  break;
      default:        drawMinimal(canvas, data);
    }

    const preview = document.getElementById('export-preview');
    if (preview) {
      preview.innerHTML = '';
      const img = new Image();
      img.src = canvas.toDataURL('image/png');
      img.style.cssText = 'width:100%;height:auto;display:block;';
      preview.appendChild(img);
    }

    return canvas;
  }

  function download(style) {
    const data  = buildData();
    const canvas = generate(style, data);
    const link   = document.createElement('a');
    link.download = `orbit-${style}-${Date.now()}.png`;
    link.href     = canvas.toDataURL('image/png');
    link.click();
  }

  function buildData() {
    const store = Storage.get();
    return {
      rank:       store.bestRank || 'Gentle Explorer',
      harmony:    store.bestHarmony || 0,
      fragments:  store.allTimeFragments || 0,
      breathSync: 0,  // last session filled in separately
      studyToday: store.todayStudyMins || 0,
      totalStudy: store.totalStudyMins || 0,
      streak:     store.streakDays || 0,
    };
  }

  // For end screen quick-save
  function downloadFromSession(sessionStats) {
    const store = Storage.get();
    const data  = {
      rank:       sessionStats.rank,
      harmony:    sessionStats.harmony,
      fragments:  sessionStats.collected,
      breathSync: sessionStats.breathSync,
      studyToday: store.todayStudyMins || 0,
      totalStudy: store.totalStudyMins || 0,
      streak:     store.streakDays || 0,
    };
    const canvas = document.getElementById('export-canvas');
    drawMinimal(canvas, data);
    const link = document.createElement('a');
    link.download = `orbit-session-${Date.now()}.png`;
    link.href     = canvas.toDataURL('image/png');
    link.click();
  }

  return { generate, download, downloadFromSession, buildData };
})();
