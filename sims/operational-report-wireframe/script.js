// Operational Report Wireframe MicroSim
// Interactive wireframe showing team-level operational report structure

// Aria color scheme
const INDIGO = '#303F9F';
const INDIGO_DARK = '#1A237E';
const INDIGO_LIGHT = '#5C6BC0';
const AMBER = '#D4880F';
const AMBER_DARK = '#B06D0B';
const GOLD = '#FFD700';
const CHAMPAGNE = '#FFF8E7';

let canvasW = 900;
const canvasH = 520;
let selectedDept = 0;
let showComparison = false;
let deptButtons = [];
let compareBtn;

// Synthetic data for 6 departments
const departments = [
  { name: 'Engineering', headcount: 42, density: 0.41, avgConn: 0.38, avgReach: 0.52, brokerage: 0.18, flightRisk: 0.22, disengaged: 3, recognition: 14, changes: ['+12% cross-team interactions', '-5% internal density', '+2 recognition events'] },
  { name: 'Product', headcount: 18, density: 0.33, avgConn: 0.31, avgReach: 0.45, brokerage: 0.22, flightRisk: 0.28, disengaged: 2, recognition: 8, changes: ['-8% avg connectivity', '+15% brokerage load', 'New silo risk detected'] },
  { name: 'Sales', headcount: 35, density: 0.12, avgConn: 0.19, avgReach: 0.31, brokerage: 0.08, flightRisk: 0.35, disengaged: 6, recognition: 5, changes: ['-18% internal density (LOW)', '+4 disengagement signals', '-3 recognition events'] },
  { name: 'HR', headcount: 12, density: 0.55, avgConn: 0.48, avgReach: 0.61, brokerage: 0.15, flightRisk: 0.15, disengaged: 0, recognition: 6, changes: ['+7% avg reachability', 'Stable health metrics', '+1 recognition event'] },
  { name: 'Operations', headcount: 28, density: 0.24, avgConn: 0.27, avgReach: 0.39, brokerage: 0.19, flightRisk: 0.30, disengaged: 4, recognition: 7, changes: ['-3% avg connectivity', '+2 disengagement signals', 'Brokerage load rising'] },
  { name: 'Finance', headcount: 15, density: 0.38, avgConn: 0.35, avgReach: 0.48, brokerage: 0.12, flightRisk: 0.18, disengaged: 1, recognition: 9, changes: ['+5% internal density', 'Stable risk indicators', '+4 recognition events'] }
];

// Previous period data for comparison
const prevPeriod = [
  { density: 0.43, avgConn: 0.36, avgReach: 0.50, brokerage: 0.16, flightRisk: 0.20, disengaged: 2, recognition: 12 },
  { density: 0.36, avgConn: 0.34, avgReach: 0.47, brokerage: 0.19, flightRisk: 0.25, disengaged: 1, recognition: 7 },
  { density: 0.15, avgConn: 0.22, avgReach: 0.34, brokerage: 0.09, flightRisk: 0.31, disengaged: 4, recognition: 8 },
  { density: 0.53, avgConn: 0.46, avgReach: 0.57, brokerage: 0.14, flightRisk: 0.16, disengaged: 1, recognition: 5 },
  { density: 0.26, avgConn: 0.29, avgReach: 0.41, brokerage: 0.17, flightRisk: 0.27, disengaged: 2, recognition: 6 },
  { density: 0.36, avgConn: 0.33, avgReach: 0.46, brokerage: 0.13, flightRisk: 0.19, disengaged: 1, recognition: 5 }
];

// Sparkline data (4 periods per metric per dept)
const sparklines = departments.map((d, i) => ({
  conn: [prevPeriod[i].avgConn - 0.03, prevPeriod[i].avgConn, d.avgConn - 0.01, d.avgConn],
  reach: [prevPeriod[i].avgReach - 0.02, prevPeriod[i].avgReach, d.avgReach + 0.01, d.avgReach],
  broker: [prevPeriod[i].brokerage + 0.01, prevPeriod[i].brokerage, d.brokerage - 0.01, d.brokerage],
  density: [prevPeriod[i].density - 0.02, prevPeriod[i].density, d.density + 0.01, d.density]
}));

function updateCanvasSize() {
  let container = document.getElementById('canvas-container');
  if (container) canvasW = container.offsetWidth;
}

function setup() {
  updateCanvasSize();
  let canvas = createCanvas(canvasW, canvasH);
  canvas.parent('canvas-container');
  textFont('Arial');

  // Create department buttons
  for (let i = 0; i < departments.length; i++) {
    let btn = createButton(departments[i].name);
    btn.parent('canvas-container');
    btn.style('font-size', '11px');
    btn.style('padding', '4px 10px');
    btn.style('border', 'none');
    btn.style('border-radius', '4px');
    btn.style('cursor', 'pointer');
    btn.style('font-weight', 'bold');
    btn.mousePressed(() => { selectedDept = i; updateButtonStyles(); });
    deptButtons.push(btn);
  }

  // Compare toggle button
  compareBtn = createButton('Compare Periods');
  compareBtn.parent('canvas-container');
  compareBtn.style('font-size', '11px');
  compareBtn.style('padding', '4px 12px');
  compareBtn.style('border', 'none');
  compareBtn.style('border-radius', '4px');
  compareBtn.style('cursor', 'pointer');
  compareBtn.style('font-weight', 'bold');
  compareBtn.style('margin-left', '10px');
  compareBtn.mousePressed(() => { showComparison = !showComparison; updateButtonStyles(); });

  updateButtonStyles();
  positionButtons();
}

function windowResized() {
  updateCanvasSize();
  resizeCanvas(canvasW, canvasH);
  positionButtons();
}

function positionButtons() {
  let startX = 20;
  let y = canvasH + 6;
  for (let i = 0; i < deptButtons.length; i++) {
    deptButtons[i].position(startX, y);
    startX += deptButtons[i].elt.offsetWidth + 6;
  }
  compareBtn.position(startX + 4, y);
}

function updateButtonStyles() {
  for (let i = 0; i < deptButtons.length; i++) {
    if (i === selectedDept) {
      deptButtons[i].style('background', INDIGO);
      deptButtons[i].style('color', 'white');
    } else {
      deptButtons[i].style('background', '#ddd');
      deptButtons[i].style('color', '#333');
    }
  }
  if (showComparison) {
    compareBtn.style('background', AMBER);
    compareBtn.style('color', 'white');
    compareBtn.elt.textContent = 'This Period';
  } else {
    compareBtn.style('background', '#ddd');
    compareBtn.style('color', '#333');
    compareBtn.elt.textContent = 'Compare Periods';
  }
}

function draw() {
  background(245);
  drawHeader();
  drawHealthBars();
  drawMetricCards();
  drawRiskTable();
  drawKeyChanges();
}

function drawHeader() {
  // Section 1: Report header
  fill(INDIGO_DARK);
  noStroke();
  rect(10, 8, canvasW - 20, 40, 6);

  fill(255);
  textSize(15);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text('Organizational Health Report', 20, 28);

  textSize(11);
  textStyle(NORMAL);
  textAlign(RIGHT, CENTER);
  text('Period: Jan 15 - Feb 8, 2026', canvasW - 80, 28);

  // Overall health indicator
  let overallHealth = departments.reduce((s, d) => s + d.density, 0) / departments.length;
  let hColor = overallHealth > 0.35 ? color(60, 160, 60) : (overallHealth > 0.15 ? color(210, 160, 0) : color(200, 50, 50));
  fill(hColor);
  ellipse(canvasW - 30, 28, 20, 20);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(9);
  textStyle(BOLD);
  text(overallHealth.toFixed(2), canvasW - 30, 28);
  textStyle(NORMAL);
}

function drawHealthBars() {
  // Section 2: Communication Health by Team
  let sx = 15, sy = 58, sw = canvasW - 30, sh = 130;
  fill(CHAMPAGNE);
  noStroke();
  rect(sx, sy, sw, sh, 6);

  fill(INDIGO_DARK);
  textSize(12);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text('Communication Health by Team', sx + 10, sy + 8);
  textStyle(NORMAL);

  let barAreaX = sx + 110;
  let barAreaW = sw - 130;
  let barH = 14;
  let gap = 4;
  let barY = sy + 28;

  for (let i = 0; i < departments.length; i++) {
    let d = departments[i];
    let y = barY + i * (barH + gap);

    // Department label
    fill(i === selectedDept ? INDIGO_DARK : '#555');
    textSize(10);
    textStyle(i === selectedDept ? BOLD : NORMAL);
    textAlign(RIGHT, CENTER);
    text(d.name, barAreaX - 8, y + barH / 2);

    // Bar background
    fill(230);
    noStroke();
    rect(barAreaX, y, barAreaW, barH, 3);

    // Bar fill
    let barW = d.density * barAreaW;
    let bColor;
    if (d.density > 0.35) bColor = color(60, 160, 60);
    else if (d.density > 0.15) bColor = color(210, 160, 0);
    else bColor = color(200, 50, 50);

    if (i === selectedDept) {
      fill(INDIGO);
    } else {
      fill(bColor);
    }
    rect(barAreaX, y, barW, barH, 3);

    // Previous period overlay
    if (showComparison) {
      let prevW = prevPeriod[i].density * barAreaW;
      noFill();
      stroke(AMBER);
      strokeWeight(2);
      rect(barAreaX, y, prevW, barH, 3);
      noStroke();
    }

    // Value label
    fill(80);
    textSize(9);
    textAlign(LEFT, CENTER);
    textStyle(NORMAL);
    text(d.density.toFixed(2), barAreaX + barW + 5, y + barH / 2);

    // Health status tag
    let status = d.density > 0.35 ? 'HEALTHY' : (d.density > 0.15 ? 'MONITOR' : 'LOW');
    let tagColor = d.density > 0.35 ? color(60, 160, 60) : (d.density > 0.15 ? color(210, 160, 0) : color(200, 50, 50));
    let tagX = barAreaX + barAreaW + 35;
    fill(tagColor);
    textSize(8);
    textStyle(BOLD);
    textAlign(LEFT, CENTER);
    text(status, tagX, y + barH / 2);
  }
  textStyle(NORMAL);
}

function drawMetricCards() {
  // Section 3: Team Network Diagnostics for selected department
  let d = departments[selectedDept];
  let prev = prevPeriod[selectedDept];
  let spark = sparklines[selectedDept];
  let sx = 15, sy = 196, sw = canvasW - 30, sh = 90;

  fill(255);
  noStroke();
  rect(sx, sy, sw, sh, 6);

  fill(INDIGO_DARK);
  textSize(11);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text('Team Network Diagnostics: ' + d.name, sx + 10, sy + 6);
  textStyle(NORMAL);

  // 4 metric cards
  let metrics = [
    { label: 'Avg Connectivity', value: d.avgConn, prev: prev.avgConn, spark: spark.conn },
    { label: 'Avg Reachability', value: d.avgReach, prev: prev.avgReach, spark: spark.reach },
    { label: 'Brokerage Load', value: d.brokerage, prev: prev.brokerage, spark: spark.broker },
    { label: 'Internal Density', value: d.density, prev: prev.density, spark: spark.density }
  ];

  let cardW = (sw - 50) / 4;
  let cardH = 58;
  let cardY = sy + 24;

  for (let i = 0; i < 4; i++) {
    let m = metrics[i];
    let cx = sx + 10 + i * (cardW + 10);

    // Card background
    fill(CHAMPAGNE);
    noStroke();
    rect(cx, cardY, cardW, cardH, 5);

    // Label
    fill(INDIGO_DARK);
    textSize(9);
    textStyle(BOLD);
    textAlign(LEFT, TOP);
    text(m.label, cx + 8, cardY + 5);

    // Value
    textSize(18);
    fill(INDIGO);
    text(m.value.toFixed(3), cx + 8, cardY + 18);

    // Trend arrow
    let diff = m.value - m.prev;
    let arrowColor = diff >= 0 ? color(60, 160, 60) : color(200, 50, 50);
    fill(arrowColor);
    textSize(12);
    textAlign(RIGHT, TOP);
    text(diff >= 0 ? '\u25B2' : '\u25BC', cx + cardW - 8, cardY + 20);
    textSize(9);
    textStyle(NORMAL);
    text((diff >= 0 ? '+' : '') + diff.toFixed(3), cx + cardW - 8, cardY + 34);

    // Sparkline
    let spX = cx + 8;
    let spY = cardY + 42;
    let spW = cardW - 16;
    let spH = 12;
    let vals = m.spark;
    let minV = Math.min(...vals);
    let maxV = Math.max(...vals);
    let range = maxV - minV || 0.01;

    stroke(INDIGO_LIGHT);
    strokeWeight(1.5);
    noFill();
    beginShape();
    for (let j = 0; j < vals.length; j++) {
      let px = spX + (j / (vals.length - 1)) * spW;
      let py = spY + spH - ((vals[j] - minV) / range) * spH;
      vertex(px, py);
    }
    endShape();
    noStroke();

    // Comparison overlay
    if (showComparison) {
      fill(AMBER);
      textSize(8);
      textAlign(LEFT, TOP);
      text('prev: ' + m.prev.toFixed(3), cx + 8, cardY + 36);
    }
  }
}

function drawRiskTable() {
  // Section 4: Risk Summary table
  let sx = 15, sy = 294, sw = canvasW - 30, sh = 120;

  fill(255);
  noStroke();
  rect(sx, sy, sw, sh, 6);

  fill(INDIGO_DARK);
  textSize(11);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text('Risk Summary', sx + 10, sy + 6);

  // Table header
  let cols = ['Department', 'Headcount', 'Avg Flight Risk', 'Disengagement', 'Recognition'];
  let colX = [sx + 10, sx + 130, sx + 220, sx + 370, sx + 500];
  let colW = [110, 80, 140, 120, 100];

  let headerY = sy + 24;
  fill(INDIGO);
  noStroke();
  rect(sx + 8, headerY, sw - 16, 16, 3);

  fill(255);
  textSize(9);
  textStyle(BOLD);
  for (let c = 0; c < cols.length; c++) {
    textAlign(c === 0 ? LEFT : CENTER, CENTER);
    text(cols[c], colX[c], headerY + 8);
  }

  // Table rows
  let rowH = 14;
  for (let i = 0; i < departments.length; i++) {
    let d = departments[i];
    let ry = headerY + 18 + i * rowH;

    // Row background
    fill(i % 2 === 0 ? 250 : 242);
    noStroke();
    rect(sx + 8, ry, sw - 16, rowH);

    // Highlight selected
    if (i === selectedDept) {
      fill(INDIGO);
      rect(sx + 8, ry, 3, rowH);
    }

    textSize(9);
    textStyle(i === selectedDept ? BOLD : NORMAL);

    // Department name
    fill(i === selectedDept ? INDIGO_DARK : '#333');
    textAlign(LEFT, CENTER);
    text(d.name, colX[0], ry + rowH / 2);

    // Headcount
    fill('#333');
    textAlign(CENTER, CENTER);
    text(d.headcount, colX[1], ry + rowH / 2);

    // Flight risk (color coded)
    let riskColor = d.flightRisk > 0.3 ? color(200, 50, 50) : (d.flightRisk > 0.2 ? color(210, 160, 0) : color(60, 160, 60));
    fill(riskColor);
    text(d.flightRisk.toFixed(2), colX[2], ry + rowH / 2);

    // Disengagement
    let disColor = d.disengaged > 4 ? color(200, 50, 50) : (d.disengaged > 1 ? color(210, 160, 0) : color(60, 160, 60));
    fill(disColor);
    text(d.disengaged + ' signals', colX[3], ry + rowH / 2);

    // Recognition
    fill(d.recognition > 8 ? color(60, 160, 60) : (d.recognition > 4 ? '#333' : color(210, 160, 0)));
    text(d.recognition + ' events', colX[4], ry + rowH / 2);
  }
  textStyle(NORMAL);
}

function drawKeyChanges() {
  // Section 5: Key Changes for selected department
  let d = departments[selectedDept];
  let sx = 15, sy = 422, sw = canvasW - 30, sh = 88;

  fill(CHAMPAGNE);
  noStroke();
  rect(sx, sy, sw, sh, 6);

  fill(INDIGO_DARK);
  textSize(11);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text('Key Changes: ' + d.name, sx + 10, sy + 6);
  textStyle(NORMAL);

  textSize(10);
  fill('#333');
  for (let i = 0; i < d.changes.length; i++) {
    let cy = sy + 24 + i * 18;
    let change = d.changes[i];

    // Bullet color based on content
    let bulletColor = INDIGO;
    if (change.includes('-') || change.includes('LOW') || change.includes('risk')) bulletColor = '#C83232';
    else if (change.includes('+')) bulletColor = '#3CA03C';

    fill(bulletColor);
    textStyle(BOLD);
    text('\u2022', sx + 14, cy);
    fill('#333');
    textStyle(NORMAL);
    text(d.name + ' \u2014 ' + change, sx + 28, cy);
  }
}
