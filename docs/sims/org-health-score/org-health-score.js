// Organizational Health Score Dashboard MicroSim
// Dashboard with circular gauge, radar chart, dimension bars, sparkline, and alerts
// MicroSim template version 2026.02

// ---- Canvas dimensions ----
let canvasWidth = 400;
let drawHeight = 500;
let controlHeight = 50;
let canvasHeight = drawHeight + controlHeight;
let margin = 25;
let sliderLeftMargin = 160;
let defaultTextSize = 16;

// ---- Aria palette ----
const INDIGO       = '#303F9F';
const INDIGO_DARK  = '#1A237E';
const INDIGO_LIGHT = '#5C6BC0';
const AMBER        = '#D4880F';
const AMBER_DARK   = '#B06D0B';
const AMBER_LIGHT  = '#F5C14B';
const GOLD         = '#FFD700';

// ---- Health score data ----
const dimensions = [
  { name: 'Connectivity',     current: 78, previous: 74, weight: 0.25 },
  { name: 'Info Flow',        current: 65, previous: 68, weight: 0.20 },
  { name: 'Community Health', current: 61, previous: 57, weight: 0.20 },
  { name: 'Sentiment',        current: 72, previous: 70, weight: 0.20 },
  { name: 'Resilience',       current: 55, previous: 58, weight: 0.15 }
];

// Sparkline: 12 months of composite scores
const sparklineData = [62, 60, 63, 65, 64, 67, 68, 66, 69, 70, 70, 72];

const alerts = [
  { text: 'Resilience dropped 3 pts - 2 new SPOFs detected', level: 'warn' },
  { text: 'Community Health improving - cross-team collab up 12%', level: 'good' }
];

// ---- State ----
let viewSelect;
let hoveredDim = -1;
let mouseOverCanvas = false;
let pulsePhase = 0;

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent(document.querySelector('main'));

  canvas.mouseOver(() => mouseOverCanvas = true);
  canvas.mouseOut(() => mouseOverCanvas = false);

  // View selector
  viewSelect = createSelect();
  viewSelect.parent(document.querySelector('main'));
  viewSelect.option('Organization');
  viewSelect.option('Department');
  viewSelect.option('Team');
  viewSelect.selected('Organization');
  viewSelect.position(sliderLeftMargin, drawHeight + 12);
  viewSelect.style('font-size', '14px');
  viewSelect.style('padding', '4px 8px');

  describe('Organizational health score dashboard with circular gauge, radar chart, dimension bars, sparkline, and alerts panel.', LABEL);
}

function draw() {
  updateCanvasSize();

  // Background
  fill(INDIGO_DARK);
  noStroke();
  rect(0, 0, canvasWidth, drawHeight);

  // Control area
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  // Animate pulse
  if (mouseOverCanvas) {
    pulsePhase += 0.03;
  }

  // Compute composite score
  let composite = 0;
  for (let d of dimensions) {
    composite += d.current * d.weight;
  }
  composite = Math.round(composite * 10) / 10;

  // Title
  noStroke();
  fill(255);
  textAlign(CENTER, TOP);
  textSize(16);
  textStyle(BOLD);
  text('Organizational Health Score', canvasWidth / 2, 8);
  textStyle(NORMAL);

  // ---- Layout sections ----
  let topRowY = 32;
  let topRowH = 165;
  let barSectionY = topRowY + topRowH + 8;
  let barSectionH = 120;
  let bottomRowY = barSectionY + barSectionH + 8;
  let bottomRowH = drawHeight - bottomRowY - 8;

  let halfW = (canvasWidth - margin * 2 - 10) / 2;

  // ==== TOP LEFT: Circular Gauge ====
  drawGauge(margin + halfW / 2, topRowY + topRowH / 2 + 10, min(halfW, topRowH) * 0.4, composite);

  // ==== TOP RIGHT: Radar Chart ====
  drawRadar(margin + halfW + 10 + halfW / 2, topRowY + topRowH / 2 + 10, min(halfW, topRowH) * 0.35);

  // ==== MIDDLE: Dimension Bars ====
  drawDimensionBars(margin, barSectionY, canvasWidth - margin * 2, barSectionH);

  // ==== BOTTOM LEFT: Sparkline ====
  drawSparkline(margin, bottomRowY, halfW, bottomRowH - 4);

  // ==== BOTTOM RIGHT: Alerts ====
  drawAlerts(margin + halfW + 10, bottomRowY, halfW, bottomRowH - 4);

  // ---- Control label ----
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('View: ' + viewSelect.value(), 10, drawHeight + 25);

  viewSelect.position(sliderLeftMargin, drawHeight + 12);
}

// ==== Circular Gauge ====
function drawGauge(cx, cy, radius, score) {
  let startAngle = PI * 0.75;
  let endAngle = PI * 2.25;
  let scoreAngle = map(score, 0, 100, startAngle, endAngle);

  // Background arc
  noFill();
  stroke(80);
  strokeWeight(12);
  arc(cx, cy, radius * 2, radius * 2, startAngle, endAngle);

  // Color zones
  let zones = [
    { from: 0,  to: 40, col: '#F44336' },
    { from: 40, to: 60, col: AMBER },
    { from: 60, to: 80, col: '#4CAF50' },
    { from: 80, to: 100, col: GOLD }
  ];

  for (let z of zones) {
    let a1 = map(z.from, 0, 100, startAngle, endAngle);
    let a2 = map(z.to, 0, 100, startAngle, endAngle);
    stroke(z.col);
    strokeWeight(12);
    arc(cx, cy, radius * 2, radius * 2, a1, a2);
  }

  // Needle
  let needleLen = radius * 0.85;
  let nx = cx + cos(scoreAngle) * needleLen;
  let ny = cy + sin(scoreAngle) * needleLen;
  stroke(GOLD);
  strokeWeight(3);
  line(cx, cy, nx, ny);

  // Center circle
  fill(INDIGO_DARK);
  noStroke();
  ellipse(cx, cy, 16, 16);

  // Score text
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(22);
  textStyle(BOLD);
  noStroke();
  text(Math.round(score), cx, cy + radius * 0.45);
  textSize(10);
  textStyle(NORMAL);
  text('/ 100', cx, cy + radius * 0.45 + 16);
}

// ==== Radar Chart ====
function drawRadar(cx, cy, radius) {
  let n = dimensions.length;
  let angleStep = TWO_PI / n;

  // Grid rings
  for (let r = 0.25; r <= 1.0; r += 0.25) {
    stroke(80, 80, 120);
    strokeWeight(0.5);
    noFill();
    beginShape();
    for (let i = 0; i < n; i++) {
      let a = -HALF_PI + i * angleStep;
      vertex(cx + cos(a) * radius * r, cy + sin(a) * radius * r);
    }
    endShape(CLOSE);
  }

  // Axis lines and labels
  for (let i = 0; i < n; i++) {
    let a = -HALF_PI + i * angleStep;
    let ex = cx + cos(a) * radius;
    let ey = cy + sin(a) * radius;

    stroke(80, 80, 120);
    strokeWeight(0.5);
    line(cx, cy, ex, ey);

    // Label
    let lx = cx + cos(a) * (radius + 14);
    let ly = cy + sin(a) * (radius + 14);
    noStroke();
    fill(200);
    textAlign(CENTER, CENTER);
    textSize(8);
    text(dimensions[i].name, lx, ly);
  }

  // Previous period polygon (dashed)
  drawRadarPolygon(cx, cy, radius, dimensions.map(d => d.previous), INDIGO_LIGHT, true);

  // Current period polygon
  drawRadarPolygon(cx, cy, radius, dimensions.map(d => d.current), AMBER, false);
}

function drawRadarPolygon(cx, cy, radius, values, col, dashed) {
  let n = values.length;
  let angleStep = TWO_PI / n;

  if (dashed) {
    drawingContext.setLineDash([4, 4]);
  }

  stroke(col);
  strokeWeight(2);
  fill(red(color(col)), green(color(col)), blue(color(col)), 40);

  beginShape();
  for (let i = 0; i < n; i++) {
    let a = -HALF_PI + i * angleStep;
    let r = map(values[i], 0, 100, 0, radius);
    vertex(cx + cos(a) * r, cy + sin(a) * r);
  }
  endShape(CLOSE);

  if (dashed) {
    drawingContext.setLineDash([]);
  }

  // Dots on current
  if (!dashed) {
    for (let i = 0; i < n; i++) {
      let a = -HALF_PI + i * angleStep;
      let r = map(values[i], 0, 100, 0, radius);
      fill(col);
      noStroke();
      ellipse(cx + cos(a) * r, cy + sin(a) * r, 6, 6);
    }
  }
}

// ==== Dimension Bars ====
function drawDimensionBars(bx, by, bw, bh) {
  let n = dimensions.length;
  let barH = 16;
  let gap = (bh - n * barH) / (n + 1);
  let labelW = 100;
  let barAreaW = bw - labelW - 40;

  // Section label
  noStroke();
  fill(180);
  textAlign(LEFT, TOP);
  textSize(10);
  textStyle(BOLD);
  text('DIMENSIONS', bx, by);
  textStyle(NORMAL);

  hoveredDim = -1;

  for (let i = 0; i < n; i++) {
    let d = dimensions[i];
    let barY = by + 14 + gap + i * (barH + gap);
    let barX = bx + labelW;
    let filledW = map(d.current, 0, 100, 0, barAreaW);

    // Hit detection
    if (mouseX >= bx && mouseX <= bx + bw && mouseY >= barY - 2 && mouseY <= barY + barH + 2) {
      hoveredDim = i;
    }

    // Label
    noStroke();
    fill(200);
    textAlign(RIGHT, CENTER);
    textSize(10);
    text(d.name, barX - 8, barY + barH / 2);

    // Background bar
    fill(50, 50, 70);
    noStroke();
    rect(barX, barY, barAreaW, barH, 3);

    // Filled bar with color coding
    let barColor;
    if (d.current < 40) barColor = '#F44336';
    else if (d.current < 60) barColor = AMBER;
    else barColor = '#4CAF50';

    fill(barColor);
    rect(barX, barY, filledW, barH, 3);

    // Score value
    noStroke();
    fill(255);
    textAlign(LEFT, CENTER);
    textSize(11);
    textStyle(BOLD);
    text(d.current, barX + barAreaW + 6, barY + barH / 2);
    textStyle(NORMAL);

    // Trend arrow
    let trend = d.current - d.previous;
    let arrowX = barX + barAreaW + 30;
    let arrowY = barY + barH / 2;
    noStroke();
    if (trend > 0) {
      fill('#4CAF50');
      triangle(arrowX, arrowY - 5, arrowX - 4, arrowY + 3, arrowX + 4, arrowY + 3);
    } else if (trend < 0) {
      fill('#F44336');
      triangle(arrowX, arrowY + 5, arrowX - 4, arrowY - 3, arrowX + 4, arrowY - 3);
    } else {
      fill(150);
      rect(arrowX - 4, arrowY - 1, 8, 2);
    }
  }
}

// ==== Sparkline ====
function drawSparkline(sx, sy, sw, sh) {
  // Section label
  noStroke();
  fill(180);
  textAlign(LEFT, TOP);
  textSize(10);
  textStyle(BOLD);
  text('12-MONTH TREND', sx, sy);
  textStyle(NORMAL);

  let chartX = sx + 4;
  let chartY = sy + 16;
  let chartW = sw - 8;
  let chartH = sh - 20;

  // Chart background
  fill(30, 30, 50);
  noStroke();
  rect(chartX, chartY, chartW, chartH, 4);

  // Grid lines
  stroke(60);
  strokeWeight(0.5);
  for (let v = 50; v <= 80; v += 10) {
    let gy = map(v, 50, 80, chartY + chartH - 4, chartY + 4);
    line(chartX + 4, gy, chartX + chartW - 4, gy);
    noStroke();
    fill(100);
    textAlign(RIGHT, CENTER);
    textSize(7);
    text(v, chartX + chartW - 2, gy);
    stroke(60);
    strokeWeight(0.5);
  }

  // Sparkline
  let n = sparklineData.length;
  stroke(INDIGO_LIGHT);
  strokeWeight(2);
  noFill();
  beginShape();
  for (let i = 0; i < n; i++) {
    let px = map(i, 0, n - 1, chartX + 10, chartX + chartW - 16);
    let py = map(sparklineData[i], 50, 80, chartY + chartH - 4, chartY + 4);
    vertex(px, py);
  }
  endShape();

  // Current month dot
  let lastX = map(n - 1, 0, n - 1, chartX + 10, chartX + chartW - 16);
  let lastY = map(sparklineData[n - 1], 50, 80, chartY + chartH - 4, chartY + 4);
  let pulse = sin(pulsePhase) * 2 + 8;
  fill(AMBER);
  noStroke();
  ellipse(lastX, lastY, pulse, pulse);
}

// ==== Alerts Panel ====
function drawAlerts(ax, ay, aw, ah) {
  // Section label
  noStroke();
  fill(180);
  textAlign(LEFT, TOP);
  textSize(10);
  textStyle(BOLD);
  text('ALERTS', ax, ay);
  textStyle(NORMAL);

  let panelY = ay + 16;
  let panelH = ah - 20;

  fill(30, 30, 50);
  noStroke();
  rect(ax, panelY, aw, panelH, 4);

  for (let i = 0; i < alerts.length; i++) {
    let a = alerts[i];
    let ay2 = panelY + 8 + i * 36;

    // Alert icon
    let iconCol = (a.level === 'warn') ? '#F44336' : '#4CAF50';
    fill(iconCol);
    noStroke();
    ellipse(ax + 12, ay2 + 10, 8, 8);

    // Alert text
    fill(220);
    textAlign(LEFT, TOP);
    textSize(9);
    noStroke();
    text(a.text, ax + 22, ay2 + 2, aw - 30, 32);
  }
}

function windowResized() {
  updateCanvasSize();
  resizeCanvas(canvasWidth, canvasHeight);
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  canvasWidth = Math.floor(container.width);
}
