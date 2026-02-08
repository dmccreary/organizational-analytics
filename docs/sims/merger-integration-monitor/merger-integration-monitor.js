// Merger Integration Monitor MicroSim
// Animated visualization showing evolution of cross-legacy communication
// over 18 months post-merger with force-directed graph layout
// Built-in p5.js controls
// MicroSim template version 2026.02

let canvasWidth = 400;
let drawHeight = 460;
let controlHeight = 80;
let canvasHeight = drawHeight + controlHeight;
let margin = 25;
let sliderLeftMargin = 180;
let defaultTextSize = 16;

// Aria color theme
const INDIGO = [48, 63, 159];
const AMBER = [212, 136, 15];
const GOLD = [255, 215, 0];
const CHAMPAGNE = [255, 248, 231];

// Physics constants
const REPULSION = 2000;
const SPRING_LENGTH = 80;
const SPRING_K = 0.005;
const DAMPING = 0.85;
const GRAVITY = 0.002;

// Graph data
let nodes = [];
let allEdges = [];       // master edge list with month of appearance
let activeEdges = [];    // edges visible at current month
let hoveredNode = null;
let draggedNode = null;
let dragOffsetX = 0, dragOffsetY = 0;

// Animation state
let currentMonth = 0;
let isPlaying = false;
let frameCounter = 0;
let framesPerMonth = 60;

// Controls
let playButton, resetButton;
let monthSlider;
let bridgeCheckbox;

// Names for nodes
let orgANames = [
  'A1-Chen', 'A2-Patel', 'A3-Kim', 'A4-Lopez', 'A5-Singh',
  'A6-Wang', 'A7-Park', 'A8-Nguyen', 'A9-Lee', 'A10-Garcia',
  'A11-Sato', 'A12-Das', 'A13-Ali', 'A14-Tanaka', 'A15-Gupta'
];
let orgBNames = [
  'B1-Miller', 'B2-Jones', 'B3-Wilson', 'B4-Brown', 'B5-Davis',
  'B6-Taylor', 'B7-Moore', 'B8-White', 'B9-Clark', 'B10-Hall',
  'B11-Adams', 'B12-Baker', 'B13-Young', 'B14-King', 'B15-Scott'
];

// Bridge node indices (these connect early across orgs)
let bridgeIndicesA = [2, 6];    // A3-Kim, A7-Park
let bridgeIndicesB = [19, 26];  // B5-Davis, B12-Baker

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  canvasWidth = Math.floor(container.width);
}

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent(document.querySelector('main'));

  buildData();
  createControls();

  describe('Animated force-directed graph showing two merged organizations gradually forming cross-legacy communication bridges over 18 months.', LABEL);
}

function createControls() {
  // Row 1: Play/Pause button, Month slider
  playButton = createButton('Play');
  playButton.position(10, drawHeight + 8);
  playButton.mousePressed(togglePlay);
  styleButton(playButton, '#303F9F');

  // Month label drawn on canvas, slider positioned after label
  monthSlider = createSlider(0, 18, 0, 1);
  monthSlider.position(sliderLeftMargin, drawHeight + 10);
  monthSlider.size(canvasWidth - sliderLeftMargin - margin);
  monthSlider.input(onMonthSliderChange);

  // Row 2: Highlight Bridges checkbox, Reset button
  bridgeCheckbox = createCheckbox(' Highlight Bridges', false);
  bridgeCheckbox.position(10, drawHeight + 46);
  bridgeCheckbox.style('font-size', '13px');
  bridgeCheckbox.style('font-family', 'Arial, sans-serif');
  bridgeCheckbox.style('color', '#333');
  bridgeCheckbox.style('cursor', 'pointer');

  resetButton = createButton('Reset');
  resetButton.position(sliderLeftMargin, drawHeight + 44);
  resetButton.mousePressed(resetSim);
  styleButton(resetButton, '#D4880F');
}

function styleButton(btn, bgColor) {
  btn.style('font-size', '13px');
  btn.style('padding', '4px 14px');
  btn.style('border-radius', '6px');
  btn.style('cursor', 'pointer');
  btn.style('background-color', bgColor);
  btn.style('color', 'white');
  btn.style('border', '1px solid ' + bgColor);
}

function togglePlay() {
  isPlaying = !isPlaying;
  playButton.html(isPlaying ? 'Pause' : 'Play');
}

function onMonthSliderChange() {
  currentMonth = monthSlider.value();
  updateActiveEdges();
}

function resetSim() {
  isPlaying = false;
  currentMonth = 0;
  monthSlider.value(0);
  playButton.html('Play');
  frameCounter = 0;
  updateActiveEdges();
  // Reset node positions
  initNodePositions();
}

// ---- Data Generation ----

function buildData() {
  nodes = [];

  // Create Org A nodes (indices 0-14)
  for (let i = 0; i < 15; i++) {
    nodes.push({
      id: i,
      name: orgANames[i],
      org: 'A',
      x: 0, y: 0,
      vx: 0, vy: 0,
      crossCount: 0
    });
  }

  // Create Org B nodes (indices 15-29)
  for (let i = 0; i < 15; i++) {
    nodes.push({
      id: i + 15,
      name: orgBNames[i],
      org: 'B',
      x: 0, y: 0,
      vx: 0, vy: 0,
      crossCount: 0
    });
  }

  initNodePositions();
  generateEdges();
  updateActiveEdges();
}

function initNodePositions() {
  let cx = canvasWidth / 2;
  let cy = drawHeight / 2;

  // Org A starts left, Org B starts right
  for (let i = 0; i < 15; i++) {
    let angle = (i / 15) * TWO_PI + random(-0.3, 0.3);
    let r = 60 + random(0, 40);
    nodes[i].x = cx - 130 + cos(angle) * r;
    nodes[i].y = cy + sin(angle) * r;
    nodes[i].vx = 0;
    nodes[i].vy = 0;
  }
  for (let i = 15; i < 30; i++) {
    let angle = ((i - 15) / 15) * TWO_PI + random(-0.3, 0.3);
    let r = 60 + random(0, 40);
    nodes[i].x = cx + 130 + cos(angle) * r;
    nodes[i].y = cy + sin(angle) * r;
    nodes[i].vx = 0;
    nodes[i].vy = 0;
  }
}

function generateEdges() {
  allEdges = [];

  // Intra-Org A edges (month 0) - ~20 edges
  let intraA = [
    [0,1], [0,2], [0,3], [1,4], [1,5], [2,3], [2,6], [3,7],
    [4,5], [4,8], [5,9], [6,7], [6,10], [7,11], [8,9],
    [9,12], [10,11], [10,13], [11,14], [12,13]
  ];
  for (let e of intraA) {
    allEdges.push({ from: e[0], to: e[1], month: 0, type: 'intra-A' });
  }

  // Intra-Org B edges (month 0) - ~20 edges
  let intraB = [
    [15,16], [15,17], [15,18], [16,19], [16,20], [17,18], [17,21], [18,22],
    [19,20], [19,23], [20,24], [21,22], [21,25], [22,26], [23,24],
    [24,27], [25,26], [25,28], [26,29], [27,28]
  ];
  for (let e of intraB) {
    allEdges.push({ from: e[0], to: e[1], month: 0, type: 'intra-B' });
  }

  // Cross-legacy edges appearing over months 1-18
  // Bridge nodes connect early: A3(2), A7(6), B5(19), B12(26)
  let crossEdges = [
    // Month 1-3: Bridge nodes make first contact
    { from: 2, to: 19, month: 1 },   // A3-Kim <-> B5-Davis (early bridge)
    { from: 6, to: 26, month: 2 },   // A7-Park <-> B12-Baker (early bridge)
    { from: 2, to: 26, month: 3 },   // A3-Kim <-> B12-Baker

    // Month 4-6: Bridges expand, a few new connectors
    { from: 6, to: 19, month: 4 },   // A7-Park <-> B5-Davis
    { from: 0, to: 15, month: 5 },   // A1-Chen <-> B1-Miller (leadership)
    { from: 2, to: 17, month: 5 },   // A3-Kim <-> B3-Wilson
    { from: 6, to: 20, month: 6 },   // A7-Park <-> B6-Taylor

    // Month 7-9: More cross connections forming
    { from: 1, to: 16, month: 7 },   // A2-Patel <-> B2-Jones
    { from: 3, to: 19, month: 7 },   // A4-Lopez <-> B5-Davis
    { from: 5, to: 21, month: 8 },   // A6-Wang <-> B7-Moore
    { from: 8, to: 23, month: 9 },   // A9-Lee <-> B9-Clark
    { from: 4, to: 18, month: 9 },   // A5-Singh <-> B4-Brown

    // Month 10-12: Integration accelerates
    { from: 9, to: 24, month: 10 },  // A10-Garcia <-> B10-Hall
    { from: 7, to: 22, month: 10 },  // A8-Nguyen <-> B8-White
    { from: 10, to: 25, month: 11 }, // A11-Sato <-> B11-Adams
    { from: 11, to: 26, month: 11 }, // A12-Das <-> B12-Baker
    { from: 12, to: 27, month: 12 }, // A13-Ali <-> B13-Young
    { from: 2, to: 22, month: 12 },  // A3-Kim <-> B8-White (bridge expands)

    // Month 13-15: Widespread integration
    { from: 13, to: 28, month: 13 }, // A14-Tanaka <-> B14-King
    { from: 14, to: 29, month: 13 }, // A15-Gupta <-> B15-Scott
    { from: 6, to: 15, month: 14 },  // A7-Park <-> B1-Miller
    { from: 3, to: 24, month: 14 },  // A4-Lopez <-> B10-Hall
    { from: 0, to: 19, month: 15 },  // A1-Chen <-> B5-Davis (leadership-bridge)

    // Month 16-18: Deep integration, secondary connections
    { from: 5, to: 28, month: 16 },  // A6-Wang <-> B14-King
    { from: 8, to: 17, month: 16 },  // A9-Lee <-> B3-Wilson
    { from: 11, to: 29, month: 17 }, // A12-Das <-> B15-Scott
    { from: 4, to: 26, month: 18 },  // A5-Singh <-> B12-Baker
  ];

  for (let e of crossEdges) {
    allEdges.push({ from: e.from, to: e.to, month: e.month, type: 'cross' });
  }
}

function updateActiveEdges() {
  activeEdges = allEdges.filter(e => e.month <= currentMonth);

  // Recompute cross-legacy counts for each node
  for (let n of nodes) {
    n.crossCount = 0;
  }
  for (let e of activeEdges) {
    if (e.type === 'cross') {
      nodes[e.from].crossCount++;
      nodes[e.to].crossCount++;
    }
  }
}

// ---- Force-Directed Layout ----

function applyForces() {
  let cx = canvasWidth / 2;
  let cy = drawHeight / 2;

  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i] === draggedNode) continue;

    let fx = 0, fy = 0;

    // Repulsion from all other nodes
    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue;
      let dx = nodes[i].x - nodes[j].x;
      let dy = nodes[i].y - nodes[j].y;
      let d = Math.sqrt(dx * dx + dy * dy);
      if (d < 1) d = 1;
      let force = REPULSION / (d * d);
      fx += (dx / d) * force;
      fy += (dy / d) * force;
    }

    // Spring force for connected edges
    for (let e of activeEdges) {
      let other = -1;
      if (e.from === i) other = e.to;
      else if (e.to === i) other = e.from;
      if (other < 0) continue;

      let dx = nodes[other].x - nodes[i].x;
      let dy = nodes[other].y - nodes[i].y;
      let d = Math.sqrt(dx * dx + dy * dy);
      if (d < 1) d = 1;
      let displacement = d - SPRING_LENGTH;
      fx += (dx / d) * displacement * SPRING_K;
      fy += (dy / d) * displacement * SPRING_K;
    }

    // Gravity toward center
    fx += (cx - nodes[i].x) * GRAVITY;
    fy += (cy - nodes[i].y) * GRAVITY;

    nodes[i].vx = (nodes[i].vx + fx) * DAMPING;
    nodes[i].vy = (nodes[i].vy + fy) * DAMPING;
  }

  // Apply velocities and constrain
  for (let node of nodes) {
    if (node === draggedNode) continue;
    node.x += node.vx;
    node.y += node.vy;

    let r = nodeRadius(node);
    node.x = constrain(node.x, r + 10, canvasWidth - r - 10);
    node.y = constrain(node.y, r + 10, drawHeight - r - 10);
  }
}

// ---- Node Sizing ----

function nodeRadius(node) {
  // Base 8px, +2px per cross-legacy connection
  return 8 + node.crossCount * 2;
}

function isBridgeNode(node) {
  return node.crossCount >= 2;
}

// ---- Drawing ----

function draw() {
  updateCanvasSize();

  // Handle animation
  if (isPlaying) {
    frameCounter++;
    if (frameCounter >= framesPerMonth) {
      frameCounter = 0;
      if (currentMonth < 18) {
        currentMonth++;
        monthSlider.value(currentMonth);
        updateActiveEdges();
      } else {
        isPlaying = false;
        playButton.html('Play');
      }
    }
  }

  // Apply physics
  applyForces();

  // Draw area background
  fill(245);
  noStroke();
  rect(0, 0, canvasWidth, drawHeight);

  // Control area background
  fill(255);
  stroke(220);
  strokeWeight(1);
  rect(0, drawHeight, canvasWidth, controlHeight);

  let showBridgesOnly = bridgeCheckbox.checked();

  // Draw edges
  drawEdges(showBridgesOnly);

  // Draw nodes
  drawNodes(showBridgesOnly);

  // Draw hover tooltip
  if (hoveredNode && !draggedNode) {
    drawTooltip(hoveredNode);
  }

  // Draw metrics panel
  drawMetricsPanel();

  // Draw legend
  drawLegend();

  // Draw title
  noStroke();
  fill(30);
  textAlign(CENTER, TOP);
  textSize(16);
  textStyle(BOLD);
  text('Merger Integration Monitor', canvasWidth / 2, 8);
  textStyle(NORMAL);

  // Draw month label next to slider
  noStroke();
  fill(50);
  textSize(13);
  textAlign(LEFT, CENTER);
  text('Month: ' + currentMonth + '/18', 75, drawHeight + 18);

  // Find hovered node
  updateHover();
}

function drawEdges(showBridgesOnly) {
  for (let e of activeEdges) {
    let fromN = nodes[e.from];
    let toN = nodes[e.to];

    if (e.type === 'cross') {
      // Cross-legacy edges: gold, thicker
      let alpha = 200;
      if (showBridgesOnly && !isBridgeNode(fromN) && !isBridgeNode(toN)) {
        alpha = 30;
      }
      stroke(255, 215, 0, alpha);
      strokeWeight(2.5);
    } else {
      // Intra-org edges: matching org color, transparent
      let col;
      if (e.type === 'intra-A') {
        col = INDIGO;
      } else {
        col = AMBER;
      }
      let alpha = 100;
      if (showBridgesOnly) {
        alpha = 25;
      }
      stroke(col[0], col[1], col[2], alpha);
      strokeWeight(1.2);
    }
    line(fromN.x, fromN.y, toN.x, toN.y);
  }
}

function drawNodes(showBridgesOnly) {
  for (let n of nodes) {
    let r = nodeRadius(n);
    let isHovered = (hoveredNode === n);

    // Determine opacity based on bridge mode
    let alpha = 255;
    if (showBridgesOnly && !isBridgeNode(n)) {
      alpha = 77; // 30% opacity
    }

    // Glow for hovered node
    if (isHovered) {
      noStroke();
      fill(255, 215, 0, 80);
      ellipse(n.x, n.y, r * 2 + 16);
    }

    // Bridge ring
    if (isBridgeNode(n) && showBridgesOnly) {
      noFill();
      stroke(255, 215, 0, 220);
      strokeWeight(2.5);
      ellipse(n.x, n.y, r * 2 + 8);
    }

    // Node body
    let col;
    if (n.org === 'A') {
      col = INDIGO;
    } else {
      col = AMBER;
    }
    stroke(isHovered ? [255, 215, 0] : [80, 80, 80, alpha]);
    strokeWeight(isHovered ? 2 : 1);
    fill(col[0], col[1], col[2], alpha);
    ellipse(n.x, n.y, r * 2);

    // Name label inside larger nodes or on hover
    if (r >= 10 || isHovered) {
      fill(255, 255, 255, alpha);
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(constrain(r * 0.65, 7, 11));
      // Show short label: first 2 chars of name
      let shortLabel = n.name.split('-')[0];
      text(shortLabel, n.x, n.y);
    }
  }
}

function drawTooltip(n) {
  let tw = 210;
  let th = 78;
  let tx = n.x + nodeRadius(n) + 14;
  let ty = n.y - th / 2;

  // Keep on screen
  if (tx + tw > canvasWidth - 10) tx = n.x - nodeRadius(n) - tw - 14;
  if (ty < 10) ty = 10;
  if (ty + th > drawHeight - 10) ty = drawHeight - th - 10;

  // Shadow
  noStroke();
  fill(0, 0, 0, 20);
  rect(tx + 3, ty + 3, tw, th, 8);

  // Background
  fill(255, 252, 240);
  stroke(180);
  strokeWeight(1);
  rect(tx, ty, tw, th, 8);

  // Content
  noStroke();
  fill(30);
  textAlign(LEFT, TOP);
  textSize(13);
  textStyle(BOLD);
  text(n.name, tx + 10, ty + 8);
  textStyle(NORMAL);

  // Org badge
  textSize(11);
  let orgLabel = n.org === 'A' ? 'Legacy Org A' : 'Legacy Org B';
  let orgCol = n.org === 'A' ? INDIGO : AMBER;
  fill(orgCol[0], orgCol[1], orgCol[2]);
  noStroke();
  ellipse(tx + 16, ty + 38, 10);
  fill(80);
  textAlign(LEFT, CENTER);
  text(orgLabel, tx + 24, ty + 38);

  // Cross-legacy count
  textAlign(LEFT, TOP);
  fill(80);
  textSize(11);
  text('Cross-legacy connections: ', tx + 10, ty + 52);
  fill(orgCol[0], orgCol[1], orgCol[2]);
  textStyle(BOLD);
  text(n.crossCount, tx + 170, ty + 52);
  textStyle(NORMAL);
}

function drawMetricsPanel() {
  let pw = 195;
  let ph = 90;
  let px = canvasWidth - pw - 12;
  let py = 32;

  // Background
  noStroke();
  fill(255, 255, 255, 210);
  rect(px, py, pw, ph, 8);
  stroke(200);
  strokeWeight(1);
  noFill();
  rect(px, py, pw, ph, 8);

  // Compute metrics
  let totalEdges = activeEdges.length;
  let crossEdges = activeEdges.filter(e => e.type === 'cross').length;
  let crossPct = totalEdges > 0 ? Math.round((crossEdges / totalEdges) * 100) : 0;

  // Status label
  let status, statusCol;
  if (crossPct < 10) {
    status = 'Silos persist';
    statusCol = [220, 50, 50];
  } else if (crossPct < 25) {
    status = 'Progressing';
    statusCol = [212, 136, 15];
  } else {
    status = 'Integrating well';
    statusCol = [46, 125, 50];
  }

  noStroke();
  textAlign(LEFT, TOP);

  fill(50);
  textSize(12);
  textStyle(BOLD);
  text('Month ' + currentMonth + ' / 18', px + 10, py + 8);
  textStyle(NORMAL);

  fill(80);
  textSize(11);
  text('Total Edges: ' + totalEdges, px + 10, py + 28);
  text('Cross-Legacy: ' + crossEdges + ' (' + crossPct + '%)', px + 10, py + 44);

  fill(80);
  text('Status: ', px + 10, py + 64);
  fill(statusCol[0], statusCol[1], statusCol[2]);
  textStyle(BOLD);
  text(status, px + 60, py + 64);
  textStyle(NORMAL);
}

// ---- Legend ----

function drawLegend() {
  // Drawn in the bottom-left corner of draw area
  let lx = 12;
  let ly = drawHeight - 60;

  fill(255, 252, 240, 220);
  noStroke();
  rect(lx - 4, ly - 4, 140, 55, 6);

  fill(INDIGO[0], INDIGO[1], INDIGO[2]);
  noStroke();
  ellipse(lx + 8, ly + 10, 12);
  fill(60);
  textAlign(LEFT, CENTER);
  textSize(10);
  text('Org A (Indigo)', lx + 18, ly + 10);

  fill(AMBER[0], AMBER[1], AMBER[2]);
  ellipse(lx + 8, ly + 28, 12);
  fill(60);
  text('Org B (Amber)', lx + 18, ly + 28);

  stroke(255, 215, 0);
  strokeWeight(2.5);
  line(lx + 2, ly + 44, lx + 14, ly + 44);
  noStroke();
  fill(60);
  text('Cross-legacy edge', lx + 18, ly + 44);
}

// ---- Interaction ----

function updateHover() {
  hoveredNode = null;
  for (let n of nodes) {
    let d = dist(mouseX, mouseY, n.x, n.y);
    if (d < nodeRadius(n) + 4) {
      hoveredNode = n;
      break;
    }
  }
}

function mousePressed() {
  // Only handle clicks in the draw area
  if (mouseY > drawHeight || mouseY < 0) return;

  for (let n of nodes) {
    let d = dist(mouseX, mouseY, n.x, n.y);
    if (d < nodeRadius(n) + 4) {
      draggedNode = n;
      dragOffsetX = n.x - mouseX;
      dragOffsetY = n.y - mouseY;
      return;
    }
  }
}

function mouseDragged() {
  if (draggedNode) {
    draggedNode.x = mouseX + dragOffsetX;
    draggedNode.y = mouseY + dragOffsetY;
    draggedNode.vx = 0;
    draggedNode.vy = 0;
  }
}

function mouseReleased() {
  draggedNode = null;
}

function windowResized() {
  updateCanvasSize();
  resizeCanvas(canvasWidth, canvasHeight);
  monthSlider.size(canvasWidth - sliderLeftMargin - margin);
}
