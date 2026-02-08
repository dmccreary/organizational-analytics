// Executive Dashboard MicroSim
// 6 KPI cards with drill-down capability, progressive disclosure

const INDIGO = '#303F9F';
const INDIGO_DARK = '#1A237E';
const INDIGO_LIGHT = '#5C6BC0';
const AMBER = '#D4880F';
const AMBER_DARK = '#B06D0B';
const GOLD = '#FFD700';
const CHAMPAGNE = '#FFF8E7';

let canvasW = 900;
const canvasH = 580;
let selectedKPI = -1;
let showComparison = false;
let timeRange = 8;
let timeButtons = [];
let compareBtn;
let hoverKPI = -1;

// KPI definitions
const kpis = [
  { name: 'Collaboration\nIndex', value: 0.31, target: 0.25, status: 'green', unit: '', desc: 'Cross-team interaction density' },
  { name: 'Network\nResilience', value: 0.82, target: 0.85, status: 'amber', unit: '', desc: '1 - (SPOF count / total)' },
  { name: 'Silo Risk', value: 0.77, target: 0.80, status: 'green', unit: '', desc: 'Max community insularity' },
  { name: 'Retention\nHealth', value: 0.88, target: 0.90, status: 'amber', unit: '%', desc: '% below flight risk threshold' },
  { name: 'Innovation\nFlow', value: 0.34, target: 0.30, status: 'green', unit: '', desc: 'Cross-community idea propagation' },
  { name: 'Sentiment\nPulse', value: 0.58, target: 0.55, status: 'green', unit: '', desc: 'Avg communication sentiment' }
];

// Previous quarter values
const prevQuarter = [0.27, 0.86, 0.72, 0.91, 0.29, 0.61];

// Sparkline data for each KPI (8-12 weeks)
const sparkData = [
  [0.24, 0.26, 0.27, 0.28, 0.27, 0.29, 0.30, 0.29, 0.31, 0.30, 0.32, 0.31],
  [0.87, 0.86, 0.85, 0.84, 0.84, 0.83, 0.83, 0.82, 0.82, 0.81, 0.82, 0.82],
  [0.71, 0.72, 0.73, 0.74, 0.74, 0.75, 0.76, 0.76, 0.77, 0.77, 0.76, 0.77],
  [0.92, 0.91, 0.91, 0.90, 0.90, 0.89, 0.89, 0.88, 0.88, 0.87, 0.88, 0.88],
  [0.25, 0.27, 0.28, 0.29, 0.30, 0.31, 0.32, 0.33, 0.33, 0.34, 0.34, 0.34],
  [0.62, 0.61, 0.60, 0.60, 0.59, 0.59, 0.58, 0.58, 0.57, 0.58, 0.58, 0.58]
];

// Department breakdown for each KPI
const deptBreakdown = {
  depts: ['Engineering', 'Product', 'Sales', 'HR', 'Operations', 'Finance'],
  data: [
    [0.38, 0.33, 0.18, 0.42, 0.28, 0.35],  // Collaboration
    [0.85, 0.88, 0.72, 0.92, 0.78, 0.90],  // Resilience
    [0.65, 0.72, 0.88, 0.55, 0.82, 0.60],  // Silo Risk
    [0.90, 0.85, 0.78, 0.95, 0.86, 0.92],  // Retention
    [0.42, 0.38, 0.20, 0.30, 0.35, 0.25],  // Innovation
    [0.62, 0.55, 0.48, 0.68, 0.56, 0.60]   // Sentiment
  ]
};

function updateCanvasSize() {
  let container = document.getElementById('canvas-container');
  if (container) canvasW = container.offsetWidth;
}

function setup() {
  updateCanvasSize();
  let canvas = createCanvas(canvasW, canvasH);
  canvas.parent('canvas-container');
  textFont('Arial');

  // Time range buttons
  let ranges = [
    { label: '4-week', val: 4 },
    { label: '8-week', val: 8 },
    { label: '12-week', val: 12 }
  ];
  for (let r of ranges) {
    let btn = createButton(r.label);
    btn.parent('canvas-container');
    btn.style('font-size', '11px');
    btn.style('padding', '3px 10px');
    btn.style('border', 'none');
    btn.style('border-radius', '4px');
    btn.style('cursor', 'pointer');
    btn.style('font-weight', 'bold');
    btn.mousePressed(() => { timeRange = r.val; updateBtnStyles(); });
    timeButtons.push({ btn: btn, val: r.val });
  }

  // Compare button
  compareBtn = createButton('vs. Last Quarter');
  compareBtn.parent('canvas-container');
  compareBtn.style('font-size', '11px');
  compareBtn.style('padding', '3px 10px');
  compareBtn.style('border', 'none');
  compareBtn.style('border-radius', '4px');
  compareBtn.style('cursor', 'pointer');
  compareBtn.style('font-weight', 'bold');
  compareBtn.mousePressed(() => { showComparison = !showComparison; updateBtnStyles(); });

  updateBtnStyles();
  positionUI();
}

function windowResized() {
  updateCanvasSize();
  resizeCanvas(canvasW, canvasH);
  positionUI();
}

function positionUI() {
  let startX = 20;
  let y = canvasH + 6;
  for (let t of timeButtons) {
    t.btn.position(startX, y);
    startX += t.btn.elt.offsetWidth + 6;
  }
  compareBtn.position(startX + 8, y);
}

function updateBtnStyles() {
  for (let t of timeButtons) {
    if (t.val === timeRange) {
      t.btn.style('background', INDIGO);
      t.btn.style('color', 'white');
    } else {
      t.btn.style('background', '#ddd');
      t.btn.style('color', '#333');
    }
  }
  compareBtn.style('background', showComparison ? AMBER : '#ddd');
  compareBtn.style('color', showComparison ? 'white' : '#333');
}

function draw() {
  background(245);
  drawTitle();
  drawKPICards();
  drawDetailPanel();

  // Check hover
  hoverKPI = -1;
  let cardW = (canvasW - 50) / 3;
  let cardH = 115;
  for (let i = 0; i < 6; i++) {
    let row = Math.floor(i / 3);
    let col = i % 3;
    let cx = 15 + col * (cardW + 10);
    let cy = 42 + row * (cardH + 8);
    if (mouseX >= cx && mouseX <= cx + cardW && mouseY >= cy && mouseY <= cy + cardH) {
      hoverKPI = i;
    }
  }
}

function drawTitle() {
  fill(INDIGO_DARK);
  textSize(15);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text('Executive Dashboard', 15, 22);

  textSize(10);
  textStyle(NORMAL);
  fill('#666');
  textAlign(RIGHT, CENTER);
  text('Updated: Feb 8, 2026  |  Time range: ' + timeRange + ' weeks', canvasW - 15, 22);
}

function drawKPICards() {
  let cardW = (canvasW - 50) / 3;
  let cardH = 115;

  for (let i = 0; i < 6; i++) {
    let row = Math.floor(i / 3);
    let col = i % 3;
    let cx = 15 + col * (cardW + 10);
    let cy = 42 + row * (cardH + 8);
    let kpi = kpis[i];
    let isSelected = (i === selectedKPI);
    let isHovered = (i === hoverKPI);

    // Card background
    if (isSelected) {
      fill(INDIGO);
      stroke(INDIGO_DARK);
      strokeWeight(2);
    } else if (isHovered) {
      fill(255);
      stroke(INDIGO_LIGHT);
      strokeWeight(2);
    } else {
      fill(CHAMPAGNE);
      noStroke();
    }
    rect(cx, cy, cardW, cardH, 8);
    noStroke();

    // Status indicator circle
    let statusColor;
    if (kpi.status === 'green') statusColor = color(60, 160, 60);
    else if (kpi.status === 'amber') statusColor = color(210, 160, 0);
    else statusColor = color(200, 50, 50);
    fill(statusColor);
    ellipse(cx + cardW - 16, cy + 16, 12, 12);

    // KPI name
    fill(isSelected ? 255 : INDIGO_DARK);
    textSize(11);
    textStyle(BOLD);
    textAlign(LEFT, TOP);
    let lines = kpi.name.split('\n');
    for (let l = 0; l < lines.length; l++) {
      text(lines[l], cx + 12, cy + 8 + l * 13);
    }

    // KPI value
    textSize(28);
    let displayVal = kpi.unit === '%' ? Math.round(kpi.value * 100) + '%' : kpi.value.toFixed(2);
    fill(isSelected ? GOLD : INDIGO);
    text(displayVal, cx + 12, cy + 36);

    // Target line
    textSize(9);
    textStyle(NORMAL);
    fill(isSelected ? '#ccc' : '#888');
    let targetDisp = kpi.unit === '%' ? Math.round(kpi.target * 100) + '%' : kpi.target.toFixed(2);
    text('Target: ' + targetDisp, cx + 12, cy + 66);

    // Comparison
    if (showComparison) {
      let prevDisp = kpi.unit === '%' ? Math.round(prevQuarter[i] * 100) + '%' : prevQuarter[i].toFixed(2);
      fill(isSelected ? GOLD : AMBER);
      textSize(9);
      text('Last Q: ' + prevDisp, cx + 100, cy + 66);
    }

    // Sparkline
    let spData = sparkData[i];
    let startIdx = Math.max(0, spData.length - timeRange);
    let vals = spData.slice(startIdx);
    let spX = cx + 12;
    let spY = cy + 80;
    let spW = cardW - 24;
    let spH = 26;

    let minV = Math.min(...vals) * 0.98;
    let maxV = Math.max(...vals) * 1.02;
    let range = maxV - minV || 0.01;

    // Sparkline background
    fill(isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.03)');
    noStroke();
    rect(spX, spY, spW, spH, 3);

    // Target line on sparkline
    let targetY = spY + spH - ((kpi.target - minV) / range) * spH;
    if (targetY > spY && targetY < spY + spH) {
      stroke(isSelected ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.15)');
      strokeWeight(1);
      drawingContext.setLineDash([3, 3]);
      line(spX, targetY, spX + spW, targetY);
      drawingContext.setLineDash([]);
    }

    // Sparkline
    stroke(isSelected ? GOLD : INDIGO);
    strokeWeight(2);
    noFill();
    beginShape();
    for (let j = 0; j < vals.length; j++) {
      let px = spX + (j / (vals.length - 1)) * spW;
      let py = spY + spH - ((vals[j] - minV) / range) * spH;
      vertex(px, py);
    }
    endShape();

    // End dot
    let endX = spX + spW;
    let endY = spY + spH - ((vals[vals.length - 1] - minV) / range) * spH;
    fill(isSelected ? GOLD : AMBER);
    noStroke();
    ellipse(endX, endY, 6, 6);

    // Trend arrow
    let trend = vals[vals.length - 1] - vals[0];
    let arrowChar;
    if (i === 2) { // Silo Risk: lower is better
      arrowChar = trend > 0.01 ? '\u25B2' : (trend < -0.01 ? '\u25BC' : '\u25CF');
      fill(trend > 0.01 ? color(200, 50, 50) : (trend < -0.01 ? color(60, 160, 60) : '#888'));
    } else {
      arrowChar = trend > 0.01 ? '\u25B2' : (trend < -0.01 ? '\u25BC' : '\u25CF');
      fill(trend > 0.01 ? color(60, 160, 60) : (trend < -0.01 ? color(200, 50, 50) : '#888'));
    }
    if (isSelected) fill(255);
    textSize(11);
    textAlign(RIGHT, CENTER);
    text(arrowChar, cx + cardW - 12, cy + 45);
    noStroke();
  }
  textStyle(NORMAL);
}

function drawDetailPanel() {
  if (selectedKPI < 0) {
    // Instruction text
    fill('#999');
    textSize(11);
    textAlign(CENTER, CENTER);
    textStyle(ITALIC);
    text('Click any KPI card above to see department-level breakdown', canvasW / 2, 320);
    textStyle(NORMAL);
    return;
  }

  let panelY = 290;
  let panelH = canvasH - panelY - 10;
  let panelX = 15;
  let panelW = canvasW - 30;

  // Panel background
  fill(255);
  noStroke();
  rect(panelX, panelY, panelW, panelH, 8);

  let kpi = kpis[selectedKPI];
  let kpiName = kpi.name.replace('\n', ' ');

  // Panel title
  fill(INDIGO_DARK);
  textSize(12);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text(kpiName + ' by Department', panelX + 12, panelY + 10);
  textStyle(NORMAL);

  // Close button
  fill('#999');
  textSize(14);
  textAlign(RIGHT, TOP);
  text('\u00D7', panelX + panelW - 10, panelY + 6);

  // Department bar chart
  let depts = deptBreakdown.depts;
  let data = deptBreakdown.data[selectedKPI];
  let barAreaX = panelX + 100;
  let barAreaW = panelW - 140;
  let barH = 22;
  let gap = 8;
  let startY = panelY + 32;

  for (let i = 0; i < depts.length; i++) {
    let y = startY + i * (barH + gap);
    let val = data[i];

    // Label
    fill('#444');
    textSize(10);
    textStyle(NORMAL);
    textAlign(RIGHT, CENTER);
    text(depts[i], barAreaX - 10, y + barH / 2);

    // Bar background
    fill(240);
    noStroke();
    rect(barAreaX, y, barAreaW, barH, 4);

    // Bar fill
    let barW = val * barAreaW;
    let barColor;
    if (selectedKPI === 2) { // Silo Risk: lower is better
      barColor = val > 0.80 ? color(200, 50, 50) : (val > 0.65 ? color(210, 160, 0) : color(60, 160, 60));
    } else {
      let target = kpi.target;
      barColor = val >= target ? color(60, 160, 60) : (val >= target * 0.85 ? color(210, 160, 0) : color(200, 50, 50));
    }
    fill(barColor);
    rect(barAreaX, y, barW, barH, 4);

    // Value label
    fill('#333');
    textSize(10);
    textStyle(BOLD);
    textAlign(LEFT, CENTER);
    let dispVal = kpi.unit === '%' ? Math.round(val * 100) + '%' : val.toFixed(2);
    text(dispVal, barAreaX + barW + 6, y + barH / 2);

    // Target line
    let targetX = barAreaX + kpi.target * barAreaW;
    stroke('#999');
    strokeWeight(1);
    drawingContext.setLineDash([4, 3]);
    line(targetX, y, targetX, y + barH);
    drawingContext.setLineDash([]);
    noStroke();
  }

  // Target label
  fill('#999');
  textSize(8);
  textAlign(LEFT, TOP);
  textStyle(ITALIC);
  let targetLabel = kpi.unit === '%' ? Math.round(kpi.target * 100) + '%' : kpi.target.toFixed(2);
  text('Target: ' + targetLabel + ' (dashed line)', barAreaX, startY + 6 * (barH + gap) + 4);
  textStyle(NORMAL);
}

function mousePressed() {
  let cardW = (canvasW - 50) / 3;
  let cardH = 115;

  // Check KPI card clicks
  for (let i = 0; i < 6; i++) {
    let row = Math.floor(i / 3);
    let col = i % 3;
    let cx = 15 + col * (cardW + 10);
    let cy = 42 + row * (cardH + 8);
    if (mouseX >= cx && mouseX <= cx + cardW && mouseY >= cy && mouseY <= cy + cardH) {
      selectedKPI = (selectedKPI === i) ? -1 : i;
      return;
    }
  }

  // Check close button
  if (selectedKPI >= 0) {
    let closeX = canvasW - 25;
    let closeY = 296;
    if (dist(mouseX, mouseY, closeX, closeY) < 15) {
      selectedKPI = -1;
    }
  }
}
