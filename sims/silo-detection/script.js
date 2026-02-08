// Silo Detection Dashboard
// Two-panel display: network graph (left) + heatmap (right)

let canvasWidth, canvasHeight = 550;
let leftPanelWidth, rightPanelWidth;
let titleHeight = 40;
let controlHeight = 60;

// Aria color scheme
const INDIGO = [48, 63, 159];
const INDIGO_DARK = [26, 35, 126];
const INDIGO_LIGHT = [92, 107, 192];
const AMBER = [212, 136, 15];
const AMBER_DARK = [176, 109, 11];
const AMBER_LIGHT = [245, 193, 75];
const GOLD = [255, 215, 0];
const CHAMPAGNE = [255, 248, 231];
const SILO_RED = [198, 40, 40];

// Department definitions
const departments = [
  { name: 'Engineering', abbr: 'ENG', color: [66, 133, 244] },
  { name: 'Product',     abbr: 'PROD', color: [52, 168, 83] },
  { name: 'Sales',       abbr: 'SALES', color: [251, 188, 4] },
  { name: 'HR',          abbr: 'HR', color: [234, 67, 53] },
  { name: 'Operations',  abbr: 'OPS', color: [154, 110, 219] },
  { name: 'Finance',     abbr: 'FIN', color: [0, 172, 193] }
];

// Employees and edges
let employees = [];
let edges = [];
let interDeptVolume = []; // 6x6 matrix of interaction volumes
let interDeptSentiment = []; // 6x6 matrix of sentiment scores
let insularity = []; // per-department insularity score

// Interaction state
let selectedDept = -1;
let thresholdValue = 0.85;
let sliderDragging = false;
let viewMode = 'volume'; // 'volume' or 'sentiment'

// Layout positions for department clusters
let deptCenters = [];
let nodePositions = [];

function updateCanvasSize() {
  let container = document.getElementById('canvas-container');
  canvasWidth = container.offsetWidth;
  if (canvasWidth > 900) canvasWidth = 900;
  leftPanelWidth = floor(canvasWidth * 0.55);
  rightPanelWidth = canvasWidth - leftPanelWidth;
}

function setup() {
  updateCanvasSize();
  let cnv = createCanvas(canvasWidth, canvasHeight);
  cnv.parent('canvas-container');
  textFont('Arial');

  generateData();
  computeLayout();
  computeInsularity();
}

function generateData() {
  // Create 5 employees per department
  employees = [];
  for (let d = 0; d < 6; d++) {
    for (let i = 0; i < 5; i++) {
      employees.push({ dept: d, id: employees.length });
    }
  }

  // Cross-department volume matrix (symmetric)
  // Higher diagonal = more internal comm
  // Engineering (0) and Finance (5) are silos - very low cross-dept
  // HR (3) is connector - high cross-dept
  interDeptVolume = [
    [55, 2, 1, 3, 1, 1],  // Engineering: very high internal, minimal external (silo)
    [2, 30, 8, 10, 6, 2],  // Product: moderate cross-team
    [1, 8, 28, 9, 7, 1],   // Sales: moderate
    [3, 10, 9, 22, 11, 3],  // HR: connector - high external
    [1, 6, 7, 11, 26, 1],  // Operations: moderate
    [1, 2, 1, 3, 1, 52]    // Finance: very high internal, minimal external (silo)
  ];

  // Sentiment matrix (0-1 scale, higher = more positive)
  interDeptSentiment = [
    [0.82, 0.45, 0.35, 0.60, 0.40, 0.30],
    [0.45, 0.78, 0.70, 0.75, 0.65, 0.50],
    [0.35, 0.70, 0.80, 0.72, 0.68, 0.42],
    [0.60, 0.75, 0.72, 0.85, 0.78, 0.55],
    [0.40, 0.65, 0.68, 0.78, 0.76, 0.48],
    [0.30, 0.50, 0.42, 0.55, 0.48, 0.88]
  ];

  // Generate individual edges from the volume matrix
  edges = [];
  for (let d1 = 0; d1 < 6; d1++) {
    for (let d2 = d1; d2 < 6; d2++) {
      let vol = interDeptVolume[d1][d2];
      let numEdges = (d1 === d2) ? floor(vol / 3) : floor(vol / 2);
      for (let e = 0; e < numEdges; e++) {
        let src = d1 * 5 + floor(random(5));
        let tgt = d2 * 5 + floor(random(5));
        if (src !== tgt) {
          edges.push({ src: src, tgt: tgt, deptSrc: d1, deptTgt: d2 });
        }
      }
    }
  }
}

function computeLayout() {
  // Position department clusters in left panel
  let graphArea = {
    x: 20,
    y: titleHeight + 30,
    w: leftPanelWidth - 40,
    h: canvasHeight - titleHeight - controlHeight - 50
  };

  let cx = graphArea.x + graphArea.w / 2;
  let cy = graphArea.y + graphArea.h / 2;
  let radius = min(graphArea.w, graphArea.h) * 0.35;

  deptCenters = [];
  for (let d = 0; d < 6; d++) {
    let angle = (TWO_PI * d / 6) - HALF_PI;
    deptCenters.push({
      x: cx + cos(angle) * radius,
      y: cy + sin(angle) * radius
    });
  }

  // Position individual nodes around cluster centers
  nodePositions = [];
  for (let i = 0; i < employees.length; i++) {
    let d = employees[i].dept;
    let idx = i % 5;
    let clusterRadius = 28;
    let angle = (TWO_PI * idx / 5) + random(-0.3, 0.3);
    let r = clusterRadius * (0.5 + random(0.5));
    nodePositions.push({
      x: deptCenters[d].x + cos(angle) * r,
      y: deptCenters[d].y + sin(angle) * r
    });
  }
}

function computeInsularity() {
  insularity = [];
  for (let d = 0; d < 6; d++) {
    let internal = interDeptVolume[d][d];
    let total = 0;
    for (let j = 0; j < 6; j++) {
      total += interDeptVolume[d][j];
    }
    insularity.push(internal / total);
  }
}

function draw() {
  background(245);

  drawTitle();
  drawNetworkPanel();
  drawHeatmapPanel();
  drawControls();
}

function drawTitle() {
  noStroke();
  fill(INDIGO);
  textSize(16);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  text('Silo Detection Dashboard', canvasWidth / 2, titleHeight / 2);
  textStyle(NORMAL);
}

function drawNetworkPanel() {
  let px = 8;
  let py = titleHeight;
  let pw = leftPanelWidth - 16;
  let ph = canvasHeight - titleHeight - controlHeight - 10;

  // Panel background
  fill(255);
  stroke(200);
  strokeWeight(1);
  rect(px, py, pw, ph, 6);

  // Panel title
  noStroke();
  fill(INDIGO_DARK);
  textSize(12);
  textAlign(CENTER, TOP);
  textStyle(BOLD);
  text('Network Graph', px + pw / 2, py + 6);
  textStyle(NORMAL);

  // Draw inter-department edges (thicker = more volume)
  for (let d1 = 0; d1 < 6; d1++) {
    for (let d2 = d1 + 1; d2 < 6; d2++) {
      let vol = interDeptVolume[d1][d2];
      if (vol > 0) {
        let sw = map(vol, 0, 15, 0.5, 5);
        let alpha = map(vol, 0, 15, 30, 150);
        stroke(120, 120, 120, alpha);
        strokeWeight(sw);
        line(deptCenters[d1].x, deptCenters[d1].y,
             deptCenters[d2].x, deptCenters[d2].y);
      }
    }
  }

  // Draw individual edges within departments (subtle)
  for (let e of edges) {
    if (e.deptSrc === e.deptTgt) {
      stroke(180, 180, 180, 40);
      strokeWeight(0.5);
      line(nodePositions[e.src].x, nodePositions[e.src].y,
           nodePositions[e.tgt].x, nodePositions[e.tgt].y);
    }
  }

  // Draw department cluster circles and silo indicators
  for (let d = 0; d < 6; d++) {
    let isSilo = insularity[d] >= thresholdValue;
    let isSelected = (d === selectedDept);

    // Cluster background circle
    let clusterR = 52;
    if (isSilo) {
      fill(SILO_RED[0], SILO_RED[1], SILO_RED[2], 25);
      stroke(SILO_RED);
      strokeWeight(2.5);
      ellipse(deptCenters[d].x, deptCenters[d].y, clusterR * 2, clusterR * 2);
    } else if (isSelected) {
      fill(AMBER[0], AMBER[1], AMBER[2], 20);
      stroke(AMBER);
      strokeWeight(2);
      ellipse(deptCenters[d].x, deptCenters[d].y, clusterR * 2, clusterR * 2);
    } else {
      fill(departments[d].color[0], departments[d].color[1], departments[d].color[2], 15);
      stroke(departments[d].color[0], departments[d].color[1], departments[d].color[2], 60);
      strokeWeight(1);
      ellipse(deptCenters[d].x, deptCenters[d].y, clusterR * 2, clusterR * 2);
    }

    // Draw employee nodes
    for (let i = d * 5; i < d * 5 + 5; i++) {
      let c = departments[d].color;
      fill(c[0], c[1], c[2]);
      noStroke();
      let nodeSize = isSelected ? 10 : 8;
      ellipse(nodePositions[i].x, nodePositions[i].y, nodeSize, nodeSize);
    }

    // Department label
    noStroke();
    fill(40);
    textSize(10);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    text(departments[d].abbr, deptCenters[d].x, deptCenters[d].y + clusterR + 10);
    textStyle(NORMAL);

    // Silo badge label
    if (isSilo) {
      let badgeX = deptCenters[d].x;
      let badgeY = deptCenters[d].y - clusterR + 8;
      fill(SILO_RED[0], SILO_RED[1], SILO_RED[2]);
      noStroke();
      rect(badgeX - 20, badgeY - 8, 40, 16, 4);
      fill(255);
      textSize(10);
      textStyle(BOLD);
      textAlign(CENTER, CENTER);
      text('SILO', badgeX, badgeY);
      textStyle(NORMAL);
    }

    // Insularity score
    fill(100);
    textSize(9);
    text(nf(insularity[d], 1, 2), deptCenters[d].x, deptCenters[d].y + clusterR + 22);
  }
}

function drawHeatmapPanel() {
  let px = leftPanelWidth + 4;
  let py = titleHeight;
  let pw = rightPanelWidth - 12;
  let ph = canvasHeight - titleHeight - controlHeight - 10;

  // Panel background
  fill(255);
  stroke(200);
  strokeWeight(1);
  rect(px, py, pw, ph, 6);

  // Panel title
  noStroke();
  fill(INDIGO_DARK);
  textSize(12);
  textAlign(CENTER, TOP);
  textStyle(BOLD);
  let titleStr = viewMode === 'volume' ? 'Interaction Volume Heatmap' : 'Interaction Sentiment Heatmap';
  text(titleStr, px + pw / 2, py + 6);
  textStyle(NORMAL);

  // Heatmap area
  let margin = 55;
  let topMargin = 60;
  let hx = px + margin;
  let hy = py + topMargin;
  let hw = pw - margin - 20;
  let hh = ph - topMargin - 80;
  let cellW = hw / 6;
  let cellH = hh / 6;

  let dataMatrix = viewMode === 'volume' ? interDeptVolume : interDeptSentiment;
  let maxVal = 0;
  let minVal = Infinity;
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      if (dataMatrix[i][j] > maxVal) maxVal = dataMatrix[i][j];
      if (i !== j && dataMatrix[i][j] < minVal) minVal = dataMatrix[i][j];
    }
  }

  // Draw cells
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      let val = dataMatrix[r][c];
      let t = map(val, minVal, maxVal, 0, 1);
      t = constrain(t, 0, 1);

      // Amber-to-indigo gradient
      let cr = lerp(AMBER_LIGHT[0], INDIGO[0], t);
      let cg = lerp(AMBER_LIGHT[1], INDIGO[1], t);
      let cb = lerp(AMBER_LIGHT[2], INDIGO[2], t);

      // Highlight selected department row/column
      let isHighlighted = (selectedDept >= 0 && (r === selectedDept || c === selectedDept));

      fill(cr, cg, cb);
      if (isHighlighted) {
        stroke(GOLD);
        strokeWeight(2);
      } else {
        stroke(255);
        strokeWeight(1);
      }
      rect(hx + c * cellW, hy + r * cellH, cellW, cellH);

      // Value text
      noStroke();
      // Choose text color based on brightness
      let brightness = (cr + cg + cb) / 3;
      fill(brightness > 140 ? 40 : 240);
      textSize(9);
      textAlign(CENTER, CENTER);
      if (viewMode === 'volume') {
        text(floor(val), hx + c * cellW + cellW / 2, hy + r * cellH + cellH / 2);
      } else {
        text(nf(val, 1, 2), hx + c * cellW + cellW / 2, hy + r * cellH + cellH / 2);
      }
    }
  }

  // Row labels (left side)
  noStroke();
  fill(40);
  textSize(9);
  textAlign(RIGHT, CENTER);
  for (let r = 0; r < 6; r++) {
    let labelColor = (r === selectedDept) ? AMBER : [40, 40, 40];
    fill(labelColor);
    textStyle((r === selectedDept) ? BOLD : NORMAL);
    text(departments[r].abbr, hx - 6, hy + r * cellH + cellH / 2);
  }

  // Column labels (top, rotated)
  textAlign(CENTER, BOTTOM);
  for (let c = 0; c < 6; c++) {
    let labelColor = (c === selectedDept) ? AMBER : [40, 40, 40];
    fill(labelColor);
    textStyle((c === selectedDept) ? BOLD : NORMAL);
    push();
    translate(hx + c * cellW + cellW / 2, hy - 4);
    rotate(-HALF_PI / 2);
    text(departments[c].abbr, 0, 0);
    pop();
  }
  textStyle(NORMAL);

  // Color legend
  let legendY = hy + hh + 16;
  let legendW = hw * 0.7;
  let legendH = 12;
  let legendX = hx + (hw - legendW) / 2;

  for (let i = 0; i < legendW; i++) {
    let t = i / legendW;
    let cr = lerp(AMBER_LIGHT[0], INDIGO[0], t);
    let cg = lerp(AMBER_LIGHT[1], INDIGO[1], t);
    let cb = lerp(AMBER_LIGHT[2], INDIGO[2], t);
    stroke(cr, cg, cb);
    line(legendX + i, legendY, legendX + i, legendY + legendH);
  }
  noStroke();
  fill(80);
  textSize(8);
  textAlign(LEFT, TOP);
  text('Low', legendX, legendY + legendH + 3);
  textAlign(RIGHT, TOP);
  text('High', legendX + legendW, legendY + legendH + 3);
  textAlign(CENTER, TOP);
  text(viewMode === 'volume' ? 'Interaction Volume' : 'Sentiment Score', legendX + legendW / 2, legendY + legendH + 14);
}

function drawControls() {
  let cy = canvasHeight - controlHeight;

  // Control area background
  fill(CHAMPAGNE);
  noStroke();
  rect(0, cy, canvasWidth, controlHeight);

  // Divider line
  stroke(200);
  strokeWeight(1);
  line(0, cy, canvasWidth, cy);

  // --- Insularity Threshold Slider (left side) ---
  let sliderX = 30;
  let sliderY = cy + 22;
  let sliderW = leftPanelWidth - 70;

  noStroke();
  fill(INDIGO_DARK);
  textSize(11);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  text('Insularity Threshold: ' + nf(thresholdValue, 1, 2), sliderX, cy + 6);
  textStyle(NORMAL);

  // Slider track
  stroke(180);
  strokeWeight(2);
  line(sliderX, sliderY, sliderX + sliderW, sliderY);

  // Slider filled portion
  let handleX = map(thresholdValue, 0.50, 1.00, sliderX, sliderX + sliderW);
  stroke(INDIGO);
  strokeWeight(3);
  line(sliderX, sliderY, handleX, sliderY);

  // Slider handle
  fill(INDIGO);
  noStroke();
  ellipse(handleX, sliderY, 16, 16);
  fill(255);
  ellipse(handleX, sliderY, 6, 6);

  // Slider range labels
  fill(100);
  textSize(9);
  noStroke();
  textAlign(LEFT, TOP);
  text('0.50', sliderX, sliderY + 10);
  textAlign(RIGHT, TOP);
  text('1.00', sliderX + sliderW, sliderY + 10);

  // Count silos at current threshold
  let siloCount = 0;
  for (let d = 0; d < 6; d++) {
    if (insularity[d] >= thresholdValue) siloCount++;
  }
  textAlign(CENTER, TOP);
  fill(siloCount > 0 ? SILO_RED : [100, 100, 100]);
  textSize(10);
  text(siloCount + ' silo' + (siloCount !== 1 ? 's' : '') + ' detected', sliderX + sliderW / 2, sliderY + 22);

  // --- View Toggle Button (right side) ---
  let btnW = 130;
  let btnH = 30;
  let btnX = leftPanelWidth + (rightPanelWidth - btnW) / 2;
  let btnY = cy + 15;

  // Button background
  fill(INDIGO);
  noStroke();
  rect(btnX, btnY, btnW, btnH, 6);

  // Button text
  fill(255);
  textSize(11);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  let btnLabel = viewMode === 'volume' ? 'Sentiment View' : 'Volume View';
  text(btnLabel, btnX + btnW / 2, btnY + btnH / 2);
  textStyle(NORMAL);

  // Store button bounds for click detection
  this._btnBounds = { x: btnX, y: btnY, w: btnW, h: btnH };
  this._sliderBounds = { x: sliderX, y: sliderY - 10, w: sliderW, h: 20, sx: sliderX, sw: sliderW };
}

function mousePressed() {
  // Check slider
  let sb = this._sliderBounds;
  if (sb && mouseY >= sb.y && mouseY <= sb.y + sb.h &&
      mouseX >= sb.sx - 10 && mouseX <= sb.sx + sb.sw + 10) {
    sliderDragging = true;
    updateSlider();
    return;
  }

  // Check toggle button
  let bb = this._btnBounds;
  if (bb && mouseX >= bb.x && mouseX <= bb.x + bb.w &&
      mouseY >= bb.y && mouseY <= bb.y + bb.h) {
    viewMode = viewMode === 'volume' ? 'sentiment' : 'volume';
    return;
  }

  // Check department cluster clicks
  for (let d = 0; d < 6; d++) {
    let dx = mouseX - deptCenters[d].x;
    let dy = mouseY - deptCenters[d].y;
    if (sqrt(dx * dx + dy * dy) < 52) {
      selectedDept = (selectedDept === d) ? -1 : d;
      return;
    }
  }

  // Click anywhere else deselects
  if (mouseY < canvasHeight - controlHeight) {
    selectedDept = -1;
  }
}

function mouseDragged() {
  if (sliderDragging) {
    updateSlider();
  }
}

function mouseReleased() {
  sliderDragging = false;
}

function updateSlider() {
  let sb = this._sliderBounds;
  if (!sb) return;
  let val = map(mouseX, sb.sx, sb.sx + sb.sw, 0.50, 1.00);
  thresholdValue = constrain(val, 0.50, 1.00);
  thresholdValue = round(thresholdValue * 100) / 100;
}

function windowResized() {
  updateCanvasSize();
  resizeCanvas(canvasWidth, canvasHeight);
  computeLayout();
}
