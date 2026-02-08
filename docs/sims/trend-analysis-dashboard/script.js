// Trend Analysis Dashboard MicroSim
// 4 sparklines with trend interpretation panel

const INDIGO = '#303F9F';
const INDIGO_DARK = '#1A237E';
const INDIGO_LIGHT = '#5C6BC0';
const AMBER = '#D4880F';
const GOLD = '#FFD700';
const CHAMPAGNE = '#FFF8E7';

let canvasW = 900;
const canvasH = 520;
let timeRange = 26; // weeks (default 6 months)
let hoveredPoint = null;
let compareMode = false;
let compareMetric = -1;
let timeButtons = [];
let compareBtn;

const METRICS = [
  { name: 'Collaboration Index', desc: 'Cross-team interaction density', goodDir: 1 },
  { name: 'Silo Risk', desc: 'Max community insularity', goodDir: -1 },
  { name: 'Sentiment Pulse', desc: 'Avg communication sentiment', goodDir: 1 },
  { name: 'Retention Health', desc: '% below flight risk threshold', goodDir: 1 }
];

const METRIC_COLORS = [INDIGO, '#C83232', '#2E7D32', AMBER];

// Generate 52 weeks of synthetic data with embedded patterns
let weeklyData = [];
function generateData() {
  weeklyData = [[], [], [], []];
  for (let w = 0; w < 52; w++) {
    // Collaboration: generally rising with a dip at week 30
    let collab = 0.25 + w * 0.002 + Math.sin(w * 0.3) * 0.015;
    if (w >= 28 && w <= 34) collab -= 0.04 * (1 - Math.abs(w - 31) / 4);
    if (w >= 35) collab -= 0.001 * (w - 35); // slow decline post-35
    collab += (Math.random() - 0.5) * 0.01;
    weeklyData[0].push(Math.max(0.15, Math.min(0.45, collab)));

    // Silo Risk: gradual increase starting week 35
    let silo = 0.65 + Math.sin(w * 0.2) * 0.02;
    if (w >= 35) silo += 0.005 * (w - 35);
    silo += (Math.random() - 0.5) * 0.015;
    weeklyData[1].push(Math.max(0.5, Math.min(0.95, silo)));

    // Sentiment: dip during burnout wave weeks 15-25
    let sent = 0.60 + Math.sin(w * 0.15) * 0.02;
    if (w >= 15 && w <= 25) sent -= 0.06 * (1 - Math.abs(w - 20) / 6);
    if (w >= 30 && w <= 35) sent -= 0.02;
    sent += (Math.random() - 0.5) * 0.015;
    weeklyData[2].push(Math.max(0.35, Math.min(0.75, sent)));

    // Retention: stable then dip
    let ret = 0.92 - w * 0.0005;
    if (w >= 28 && w <= 36) ret -= 0.03 * (1 - Math.abs(w - 32) / 5);
    ret += (Math.random() - 0.5) * 0.01;
    weeklyData[3].push(Math.max(0.75, Math.min(0.98, ret)));
  }
}

// Trend interpretation rules
function interpretTrends(startW, endW) {
  let trends = [];
  for (let m = 0; m < 4; m++) {
    let vals = weeklyData[m].slice(startW, endW + 1);
    let n = vals.length;
    // Linear regression
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += i; sumY += vals[i]; sumXY += i * vals[i]; sumX2 += i * i;
    }
    let slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    trends.push({ slope: slope, metric: METRICS[m].name, goodDir: METRICS[m].goodDir });
  }

  // Detect compound signals
  let signals = [];
  let collabTrend = trends[0].slope;
  let siloTrend = trends[1].slope;
  let sentTrend = trends[2].slope;
  let retTrend = trends[3].slope;

  if (collabTrend < -0.0005 && siloTrend > 0.0005) {
    signals.push({ label: 'Silent Fragmentation', severity: 'amber', text: 'Collaboration declining while Silo Risk increasing. Organization may be fragmenting gradually.' });
  }
  if (collabTrend > 0.0005 && sentTrend > 0) {
    signals.push({ label: 'Healthy Growth', severity: 'green', text: 'Collaboration rising with stable or improving sentiment. Teams communicating more without strain.' });
  }
  if (collabTrend > 0.001 && sentTrend < -0.0005) {
    signals.push({ label: 'Burnout Wave', severity: 'red', text: 'Communication volume increasing while sentiment declining. Teams may be overworked without satisfaction.' });
  }
  if (retTrend < -0.001) {
    signals.push({ label: 'Retention Pressure', severity: 'red', text: 'Retention health declining steadily. Flight risk signals accumulating across the organization.' });
  }
  if (siloTrend > 0.001) {
    signals.push({ label: 'Silo Formation', severity: 'amber', text: 'Community insularity increasing. Cross-team connections weakening over this period.' });
  }
  if (signals.length === 0) {
    signals.push({ label: 'Stable', severity: 'green', text: 'No significant compound trend signals detected in this time range. Metrics are within normal variation.' });
  }
  return { trends: trends, signals: signals };
}

function updateCanvasSize() {
  let container = document.getElementById('canvas-container');
  if (container) canvasW = container.offsetWidth;
}

function setup() {
  updateCanvasSize();
  let canvas = createCanvas(canvasW, canvasH);
  canvas.parent('canvas-container');
  textFont('Arial');

  generateData();

  // Time range buttons
  let ranges = [
    { label: '8 Weeks', val: 8 },
    { label: '3 Months', val: 13 },
    { label: '6 Months', val: 26 },
    { label: '12 Months', val: 52 }
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

  compareBtn = createButton('Compare Metrics');
  compareBtn.parent('canvas-container');
  compareBtn.style('font-size', '11px');
  compareBtn.style('padding', '3px 10px');
  compareBtn.style('border', 'none');
  compareBtn.style('border-radius', '4px');
  compareBtn.style('cursor', 'pointer');
  compareBtn.style('font-weight', 'bold');
  compareBtn.style('margin-left', '10px');
  compareBtn.mousePressed(() => { compareMode = !compareMode; updateBtnStyles(); });

  updateBtnStyles();
  positionUI();
}

function windowResized() {
  updateCanvasSize();
  resizeCanvas(canvasW, canvasH);
  positionUI();
}

function positionUI() {
  let startX = 15;
  let y = canvasH + 6;
  for (let t of timeButtons) {
    t.btn.position(startX, y);
    startX += t.btn.elt.offsetWidth + 6;
  }
  compareBtn.position(startX + 8, y);
}

function updateBtnStyles() {
  for (let t of timeButtons) {
    t.btn.style('background', t.val === timeRange ? INDIGO : '#ddd');
    t.btn.style('color', t.val === timeRange ? 'white' : '#333');
  }
  compareBtn.style('background', compareMode ? AMBER : '#ddd');
  compareBtn.style('color', compareMode ? 'white' : '#333');
}

function draw() {
  background(245);
  drawTitle();

  let startW = 52 - timeRange;
  let endW = 51;

  if (compareMode) {
    drawCombinedSparkline(startW, endW);
  } else {
    drawSparklines(startW, endW);
  }

  drawInterpretation(startW, endW);
  drawHoverTooltip();
}

function drawTitle() {
  fill(INDIGO_DARK);
  textSize(15);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text('Trend Analysis Dashboard', 15, 20);
  textStyle(NORMAL);
  fill('#666');
  textSize(10);
  textAlign(RIGHT, CENTER);
  text('Showing last ' + timeRange + ' weeks', canvasW - 15, 20);
}

function drawSparklines(startW, endW) {
  hoveredPoint = null;
  let panelH = 72;
  let gap = 6;
  let px = 15;
  let pw = canvasW - 30;

  for (let m = 0; m < 4; m++) {
    let py = 38 + m * (panelH + gap);
    let vals = weeklyData[m].slice(startW, endW + 1);

    // Background
    fill(255);
    noStroke();
    rect(px, py, pw, panelH, 6);

    // Metric label
    fill(METRIC_COLORS[m]);
    textSize(10);
    textStyle(BOLD);
    textAlign(LEFT, TOP);
    text(METRICS[m].name, px + 8, py + 4);

    // Current value
    textSize(16);
    let curVal = vals[vals.length - 1];
    text(curVal.toFixed(3), px + 8, py + 17);

    // Description
    fill('#888');
    textSize(8);
    textStyle(NORMAL);
    text(METRICS[m].desc, px + 8, py + 37);

    // Sparkline area
    let spX = px + 160;
    let spW = pw - 240;
    let spY = py + 8;
    let spH = panelH - 16;

    let minV = Math.min(...vals) * 0.995;
    let maxV = Math.max(...vals) * 1.005;
    let range = maxV - minV || 0.01;

    // Light gridlines
    stroke(240);
    strokeWeight(0.5);
    for (let g = 0; g <= 2; g++) {
      let gy = spY + (g / 2) * spH;
      line(spX, gy, spX + spW, gy);
    }

    // Confidence band (simple +-1 stddev)
    let mean = vals.reduce((a, b) => a + b) / vals.length;
    let stddev = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length);
    let bandTop = spY + spH - ((mean + stddev - minV) / range) * spH;
    let bandBot = spY + spH - ((mean - stddev - minV) / range) * spH;
    fill(METRIC_COLORS[m]);
    drawingContext.globalAlpha = 0.08;
    noStroke();
    rect(spX, bandTop, spW, bandBot - bandTop);
    drawingContext.globalAlpha = 1;

    // Trend line (linear regression)
    let n = vals.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += i; sumY += vals[i]; sumXY += i * vals[i]; sumX2 += i * i;
    }
    let slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    let intercept = (sumY - slope * sumX) / n;
    let trendY0 = spY + spH - ((intercept - minV) / range) * spH;
    let trendY1 = spY + spH - ((intercept + slope * (n - 1) - minV) / range) * spH;
    stroke(METRIC_COLORS[m]);
    strokeWeight(1);
    drawingContext.setLineDash([5, 4]);
    line(spX, trendY0, spX + spW, trendY1);
    drawingContext.setLineDash([]);

    // Data line
    stroke(METRIC_COLORS[m]);
    strokeWeight(2);
    noFill();
    beginShape();
    for (let j = 0; j < vals.length; j++) {
      let x = spX + (j / (vals.length - 1)) * spW;
      let y = spY + spH - ((vals[j] - minV) / range) * spH;
      vertex(x, y);
    }
    endShape();

    // Data points
    for (let j = 0; j < vals.length; j++) {
      let x = spX + (j / (vals.length - 1)) * spW;
      let y = spY + spH - ((vals[j] - minV) / range) * spH;
      let d = dist(mouseX, mouseY, x, y);
      if (d < 8) {
        hoveredPoint = { x: x, y: y, metric: m, week: startW + j, value: vals[j] };
        fill(AMBER);
        noStroke();
        ellipse(x, y, 8, 8);
      } else {
        fill(METRIC_COLORS[m]);
        noStroke();
        ellipse(x, y, 4, 4);
      }
    }

    // Slope annotation
    let slopePerWeek = slope;
    let arrow = '';
    let slopeColor;
    let isGood = (slopePerWeek > 0 && METRICS[m].goodDir > 0) || (slopePerWeek < 0 && METRICS[m].goodDir < 0);
    let isBad = (slopePerWeek > 0 && METRICS[m].goodDir < 0) || (slopePerWeek < 0 && METRICS[m].goodDir > 0);
    if (Math.abs(slopePerWeek) < 0.0003) {
      arrow = '\u25CF Flat';
      slopeColor = '#888';
    } else if (isGood) {
      arrow = (slopePerWeek > 0 ? '\u25B2' : '\u25BC') + ' Improving';
      slopeColor = '#2E7D32';
    } else {
      arrow = (slopePerWeek > 0 ? '\u25B2' : '\u25BC') + ' Worsening';
      slopeColor = '#C83232';
    }
    fill(slopeColor);
    textSize(10);
    textStyle(BOLD);
    textAlign(LEFT, TOP);
    text(arrow, spX + spW + 10, py + 18);
    textSize(8);
    textStyle(NORMAL);
    fill('#888');
    let slopeStr = (slopePerWeek >= 0 ? '+' : '') + (slopePerWeek * 1000).toFixed(2) + '/wk';
    text(slopeStr, spX + spW + 10, py + 32);

    // Y-axis range
    fill('#aaa');
    textSize(7);
    textAlign(LEFT, TOP);
    text(maxV.toFixed(3), spX - 35, spY);
    textAlign(LEFT, BOTTOM);
    text(minV.toFixed(3), spX - 35, spY + spH);
  }
  textStyle(NORMAL);
}

function drawCombinedSparkline(startW, endW) {
  hoveredPoint = null;
  let py = 38;
  let panelH = 265;
  let px = 15;
  let pw = canvasW - 30;

  fill(255);
  noStroke();
  rect(px, py, pw, panelH, 6);

  fill(INDIGO_DARK);
  textSize(11);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text('Combined Metric Comparison (normalized)', px + 8, py + 6);
  textStyle(NORMAL);

  let spX = px + 60;
  let spW = pw - 130;
  let spY = py + 28;
  let spH = panelH - 44;

  // Normalize all to 0-1
  for (let m = 0; m < 4; m++) {
    let vals = weeklyData[m].slice(startW, endW + 1);
    let minV = Math.min(...vals);
    let maxV = Math.max(...vals);
    let range = maxV - minV || 0.01;

    stroke(METRIC_COLORS[m]);
    strokeWeight(2);
    noFill();
    beginShape();
    for (let j = 0; j < vals.length; j++) {
      let x = spX + (j / (vals.length - 1)) * spW;
      let y = spY + spH - ((vals[j] - minV) / range) * spH;
      vertex(x, y);
    }
    endShape();
  }

  // Legend
  let legendX = spX + spW + 12;
  for (let m = 0; m < 4; m++) {
    fill(METRIC_COLORS[m]);
    noStroke();
    rect(legendX, spY + m * 18, 12, 12, 2);
    fill('#333');
    textSize(9);
    textAlign(LEFT, CENTER);
    text(METRICS[m].name, legendX + 16, spY + m * 18 + 6);
  }

  // Gridlines
  stroke(240);
  strokeWeight(0.5);
  for (let g = 0; g <= 4; g++) {
    let gy = spY + (g / 4) * spH;
    line(spX, gy, spX + spW, gy);
  }
}

function drawInterpretation(startW, endW) {
  let result = interpretTrends(startW, endW);
  let py = compareMode ? 315 : 360;
  let ph = canvasH - py - 10;
  let px = 15;
  let pw = canvasW - 30;

  fill(CHAMPAGNE);
  noStroke();
  rect(px, py, pw, ph, 6);

  fill(INDIGO_DARK);
  textSize(12);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text('Trend Interpretation', px + 10, py + 8);
  textStyle(NORMAL);

  let ty = py + 26;
  for (let sig of result.signals) {
    let badgeColor;
    if (sig.severity === 'green') badgeColor = color(60, 160, 60);
    else if (sig.severity === 'amber') badgeColor = color(210, 160, 0);
    else badgeColor = color(200, 50, 50);

    // Badge
    fill(badgeColor);
    noStroke();
    rect(px + 10, ty, textWidth(sig.label) + 16, 18, 4);
    fill(255);
    textSize(10);
    textStyle(BOLD);
    textAlign(LEFT, CENTER);
    text(sig.label, px + 18, ty + 9);

    // Description
    fill('#333');
    textSize(10);
    textStyle(NORMAL);
    textAlign(LEFT, TOP);
    text(sig.text, px + textWidth(sig.label) + 34, ty + 2);
    ty += 28;
  }
}

function drawHoverTooltip() {
  if (!hoveredPoint) return;
  let hp = hoveredPoint;

  let weekLabel = 'Week ' + (hp.week + 1);
  let valLabel = METRICS[hp.metric].name + ': ' + hp.value.toFixed(4);
  let tw = max(textWidth(weekLabel), textWidth(valLabel)) + 16;
  let th = 36;
  let tx = hp.x + 12;
  let ty = hp.y - th - 5;
  if (tx + tw > canvasW - 10) tx = hp.x - tw - 12;
  if (ty < 5) ty = hp.y + 12;

  fill(255, 255, 255, 240);
  stroke(INDIGO_LIGHT);
  strokeWeight(1);
  rect(tx, ty, tw, th, 4);

  noStroke();
  fill(INDIGO_DARK);
  textSize(9);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text(weekLabel, tx + 8, ty + 5);
  textStyle(NORMAL);
  fill('#333');
  text(valLabel, tx + 8, ty + 19);
}
