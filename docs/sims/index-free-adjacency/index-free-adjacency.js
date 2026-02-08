// Index-Free Adjacency MicroSim
// Animated comparison: graph database pointer follows vs relational index lookups

let containerWidth;
let canvasWidth = 400;
let drawHeight = 500;
let controlHeight = 0;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 25;

// Aria color theme
const INDIGO = '#303F9F';
const INDIGO_DARK = '#1A237E';
const INDIGO_LIGHT = '#5C6BC0';
const AMBER = '#D4880F';
const AMBER_DARK = '#B06D0B';
const AMBER_LIGHT = '#F5C14B';
const GOLD = '#FFD700';
const CHAMPAGNE = '#FFF8E7';
const ALICEBLUE = '#F0F8FF';

// Network: 6 people in a small org
const people = [
  { id: 0, name: 'Maria',  short: 'M' },
  { id: 1, name: 'James',  short: 'J' },
  { id: 2, name: 'Aisha',  short: 'A' },
  { id: 3, name: 'Carlos', short: 'C' },
  { id: 4, name: 'Li',     short: 'L' },
  { id: 5, name: 'Priya',  short: 'P' }
];

// Adjacency: directed edges (from -> to)
const edges = [
  [0, 1], // Maria -> James
  [1, 2], // James -> Aisha
  [2, 3], // Aisha -> Carlos
  [3, 4], // Carlos -> Li
  [4, 5], // Li -> Priya
  [0, 2], // Maria -> Aisha (shortcut)
  [1, 4]  // James -> Li (shortcut)
];

// The traversal path: Maria -> James -> Aisha -> Carlos -> Li -> Priya (5 hops)
const traversalPath = [0, 1, 2, 3, 4, 5];
const traversalEdges = [0, 1, 2, 3, 4]; // edge indices for the path

// Node positions (normalized 0-1)
const nodePos = [
  { x: 0.18, y: 0.22 }, // Maria
  { x: 0.55, y: 0.12 }, // James
  { x: 0.85, y: 0.35 }, // Aisha
  { x: 0.75, y: 0.70 }, // Carlos
  { x: 0.38, y: 0.78 }, // Li
  { x: 0.10, y: 0.55 }  // Priya
];

// State
let currentHop = 0; // 0 = start (no hops yet), max = 5
let graphAnimPhase = 0; // 0 = idle, 1 = animating pointer follow
let tableAnimPhase = 0; // 0 = idle, 1 = scanning index, 2 = found
let animTimer = 0;
let graphHopDone = false;
let tableHopDone = false;

// Timing accumulators
let graphTotalTime = 0;
let tableTotalTime = 0;
const GRAPH_HOP_TIME = 15; // constant ms per hop (graph)
const TABLE_BASE_TIME = 40; // base ms per index lookup
const TABLE_GROWTH = 25;    // additional ms per hop depth

// Index tree animation
let indexScanRow = -1;
let indexScanComplete = false;

// Buttons
let nextHopBtn = {};
let resetBtn = {};

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(containerWidth, containerHeight);
  var mainElement = document.querySelector('main');
  canvas.parent(mainElement);
  textFont('Arial');
  describe('Animated side-by-side comparison of graph database index-free adjacency pointer follows versus relational database index lookups for multi-hop traversals.');
}

function draw() {
  updateCanvasSize();
  background(ALICEBLUE);

  let halfW = canvasWidth / 2;
  let fontSize = constrain(canvasWidth * 0.022, 10, 15);
  let headerH = 32;
  let hopDisplayH = 30;
  let timerBarH = 60;
  let buttonAreaH = 50;
  let panelTop = headerH + hopDisplayH;
  let panelBottom = drawHeight - timerBarH - buttonAreaH;
  let panelH = panelBottom - panelTop;

  // --- Headers ---
  noStroke();
  fill(INDIGO);
  rect(0, 0, halfW - 1, headerH);
  fill(AMBER);
  rect(halfW + 1, 0, halfW - 1, headerH);

  fill('white');
  textAlign(CENTER, CENTER);
  textSize(fontSize + 2);
  textStyle(BOLD);
  text('Graph Database', halfW / 2, headerH / 2);
  text('Relational Database', halfW + halfW / 2, headerH / 2);
  textStyle(NORMAL);

  // Subtitles
  fill(INDIGO_DARK);
  textSize(fontSize * 0.75);
  textAlign(CENTER, CENTER);
  text('Direct Pointer Follows', halfW / 2, headerH + hopDisplayH / 2 - 2);
  fill(AMBER_DARK);
  text('Index Lookup per Hop', halfW + halfW / 2, headerH + hopDisplayH / 2 - 2);

  // --- Divider ---
  stroke('#ccc');
  strokeWeight(1);
  line(halfW, 0, halfW, drawHeight - buttonAreaH);

  // --- Hop counter ---
  noStroke();
  fill(INDIGO_DARK);
  textSize(fontSize + 1);
  textAlign(CENTER, TOP);
  textStyle(BOLD);
  let hopLabel = currentHop === 0 ? 'Ready - Click "Next Hop" to begin' :
                 currentHop <= 5 ? 'Hop ' + currentHop + ' of 5' : 'Traversal Complete!';
  text(hopLabel, canvasWidth / 2, headerH + hopDisplayH + 2);
  textStyle(NORMAL);

  // --- Left panel: Graph Database ---
  drawGraphPanel(margin, panelTop + 22, halfW - margin * 2, panelH - 22, fontSize);

  // --- Right panel: Relational Database ---
  drawTablePanel(halfW + margin, panelTop + 22, halfW - margin * 2, panelH - 22, fontSize);

  // --- Timer bars ---
  drawTimerBars(margin, drawHeight - timerBarH - buttonAreaH + 5, canvasWidth - margin * 2, timerBarH - 10, fontSize);

  // --- Buttons ---
  drawButtons(drawHeight - buttonAreaH + 5, buttonAreaH - 10, fontSize);

  // --- Run animation ---
  runAnimation();
}

// ================ GRAPH PANEL ================
function drawGraphPanel(px, py, pw, ph, fontSize) {
  let nodeR = constrain(pw * 0.06, 12, 22);

  // Draw all edges (faded)
  for (let i = 0; i < edges.length; i++) {
    let fromP = graphNodeScreen(edges[i][0], px, py, pw, ph);
    let toP = graphNodeScreen(edges[i][1], px, py, pw, ph);
    stroke(200, 200, 210);
    strokeWeight(1);
    drawArrow(fromP.x, fromP.y, toP.x, toP.y, nodeR, color(200, 200, 210), false);
  }

  // Draw traversed edges (highlighted)
  for (let h = 0; h < min(currentHop, 5); h++) {
    let ei = traversalEdges[h];
    let fromP = graphNodeScreen(edges[ei][0], px, py, pw, ph);
    let toP = graphNodeScreen(edges[ei][1], px, py, pw, ph);
    drawArrow(fromP.x, fromP.y, toP.x, toP.y, nodeR, color(AMBER), true);
  }

  // Animating current hop edge
  if (graphAnimPhase === 1 && currentHop > 0 && currentHop <= 5) {
    let ei = traversalEdges[currentHop - 1];
    let fromP = graphNodeScreen(edges[ei][0], px, py, pw, ph);
    let toP = graphNodeScreen(edges[ei][1], px, py, pw, ph);
    let progress = min(animTimer / 20, 1);
    drawPartialArrow(fromP.x, fromP.y, toP.x, toP.y, nodeR, progress);
  }

  // Draw all nodes
  for (let i = 0; i < people.length; i++) {
    let pos = graphNodeScreen(i, px, py, pw, ph);
    let isTraversed = false;
    let isCurrent = false;
    let isNext = false;

    if (currentHop > 0) {
      // Nodes up to current hop in path are traversed
      for (let h = 0; h <= min(currentHop, 5); h++) {
        if (traversalPath[h] === i) isTraversed = true;
      }
      if (traversalPath[min(currentHop, 5)] === i) isCurrent = true;
    } else {
      // Before start, highlight starting node
      if (i === 0) isCurrent = true;
    }

    // Node shadow
    noStroke();
    fill(0, 0, 0, 20);
    ellipse(pos.x + 1, pos.y + 1, nodeR * 2 + 2);

    // Node fill
    if (isCurrent) {
      fill(AMBER);
      stroke(AMBER_DARK);
    } else if (isTraversed) {
      fill(AMBER_LIGHT);
      stroke(AMBER);
    } else {
      fill(INDIGO_LIGHT);
      stroke(INDIGO);
    }
    strokeWeight(2);
    ellipse(pos.x, pos.y, nodeR * 2);

    // "ptr" labels on edges coming out of current node for next hop
    // (shows pointer concept)

    // Node label
    noStroke();
    fill('white');
    textAlign(CENTER, CENTER);
    textSize(constrain(fontSize * 0.75, 8, 12));
    textStyle(BOLD);
    text(people[i].short, pos.x, pos.y);
    textStyle(NORMAL);

    // Name below node
    fill(isCurrent ? AMBER_DARK : isTraversed ? AMBER : '#555');
    textSize(constrain(fontSize * 0.65, 7, 10));
    text(people[i].name, pos.x, pos.y + nodeR + 10);
  }

  // Pointer follow label during animation
  if (graphAnimPhase === 1 && currentHop > 0) {
    noStroke();
    fill(AMBER_DARK);
    textAlign(CENTER, CENTER);
    textSize(fontSize * 0.8);
    textStyle(BOLD);
    text('pointer follow: O(1)', px + pw / 2, py + ph - 5);
    textStyle(NORMAL);
  } else if (graphHopDone && currentHop > 0) {
    noStroke();
    let c = color(AMBER_DARK);
    fill(red(c), green(c), blue(c), 180);
    textAlign(CENTER, CENTER);
    textSize(fontSize * 0.75);
    text(GRAPH_HOP_TIME + ' ms', px + pw / 2, py + ph - 5);
  }
}

function graphNodeScreen(nodeIdx, px, py, pw, ph) {
  return {
    x: px + nodePos[nodeIdx].x * pw,
    y: py + nodePos[nodeIdx].y * (ph - 20)
  };
}

function drawArrow(x1, y1, x2, y2, nodeR, col, thick) {
  let angle = atan2(y2 - y1, x2 - x1);
  let sx = x1 + cos(angle) * nodeR;
  let sy = y1 + sin(angle) * nodeR;
  let ex = x2 - cos(angle) * nodeR;
  let ey = y2 - sin(angle) * nodeR;

  stroke(col);
  strokeWeight(thick ? 2.5 : 1);
  line(sx, sy, ex, ey);

  // Arrowhead
  if (thick) {
    fill(col);
    noStroke();
    push();
    translate(ex, ey);
    rotate(angle);
    triangle(0, 0, -8, -4, -8, 4);
    pop();
  }
}

function drawPartialArrow(x1, y1, x2, y2, nodeR, progress) {
  let angle = atan2(y2 - y1, x2 - x1);
  let sx = x1 + cos(angle) * nodeR;
  let sy = y1 + sin(angle) * nodeR;
  let ex = x2 - cos(angle) * nodeR;
  let ey = y2 - sin(angle) * nodeR;

  let cx = lerp(sx, ex, progress);
  let cy = lerp(sy, ey, progress);

  stroke(AMBER);
  strokeWeight(3);
  line(sx, sy, cx, cy);

  // Moving dot
  fill(GOLD);
  noStroke();
  ellipse(cx, cy, 8, 8);
}

// ================ TABLE PANEL ================
function drawTablePanel(px, py, pw, ph, fontSize) {
  let rowH = constrain(fontSize * 1.8, 18, 26);
  let tableW = pw;
  let tableX = px;
  let colWidths = [tableW * 0.12, tableW * 0.20, tableW * 0.20, tableW * 0.48];
  let cols = ['ID', 'Name', 'Next', 'Ptr'];
  let tableY = py + 5;

  // Table title
  noStroke();
  fill(INDIGO_DARK);
  textAlign(CENTER, TOP);
  textSize(fontSize * 0.8);
  textStyle(BOLD);
  text('EMPLOYEE_ADJACENCY Table', px + pw / 2, py - 12);
  textStyle(NORMAL);

  // Column headers
  noStroke();
  fill(INDIGO);
  rect(tableX, tableY, tableW, rowH, 4, 4, 0, 0);
  fill('white');
  textAlign(CENTER, CENTER);
  textSize(constrain(fontSize * 0.7, 7, 11));
  textStyle(BOLD);
  let cx = tableX;
  for (let c = 0; c < cols.length; c++) {
    text(cols[c], cx + colWidths[c] / 2, tableY + rowH / 2);
    cx += colWidths[c];
  }
  textStyle(NORMAL);

  // Adjacency data rows - show each person with their "next" in the traversal path
  // For the table, we show the adjacency list as a foreign-key lookup table
  let tableData = [
    { id: 'E001', name: 'Maria',  next: 'E002', ptr: '-> idx[E002]' },
    { id: 'E002', name: 'James',  next: 'E003', ptr: '-> idx[E003]' },
    { id: 'E003', name: 'Aisha',  next: 'E004', ptr: '-> idx[E004]' },
    { id: 'E004', name: 'Carlos', next: 'E005', ptr: '-> idx[E005]' },
    { id: 'E005', name: 'Li',     next: 'E006', ptr: '-> idx[E006]' },
    { id: 'E006', name: 'Priya',  next: '--',    ptr: '(end)' }
  ];

  for (let r = 0; r < tableData.length; r++) {
    let ry = tableY + rowH * (r + 1);
    let isTraversed = false;
    let isCurrent = false;
    let isScanning = false;

    if (currentHop > 0 && r < currentHop) isTraversed = true;
    if (currentHop > 0 && r === currentHop - 1 && !tableHopDone) {
      // This is the row being looked up
    }
    if (currentHop > 0 && r === min(currentHop, 5)) isCurrent = true;
    if (currentHop === 0 && r === 0) isCurrent = true;

    // During table animation, show scanning
    if (tableAnimPhase === 1 && r <= indexScanRow) {
      isScanning = true;
    }

    // Row background
    noStroke();
    if (isCurrent && (tableHopDone || currentHop === 0)) {
      fill(255, 215, 0, 100);
    } else if (isTraversed) {
      fill(255, 236, 179, 80);
    } else if (isScanning && r === indexScanRow) {
      fill(INDIGO_LIGHT + '44');
    } else {
      fill(r % 2 === 0 ? 'white' : color(245, 245, 252));
    }
    rect(tableX, ry, tableW, rowH);

    // Row border
    stroke('#ddd');
    strokeWeight(0.5);
    line(tableX, ry + rowH, tableX + tableW, ry + rowH);

    // Row data
    noStroke();
    fill(isCurrent ? INDIGO_DARK : isTraversed ? AMBER_DARK : '#444');
    textSize(constrain(fontSize * 0.65, 7, 10));
    textAlign(CENTER, CENTER);
    let vals = [tableData[r].id, tableData[r].name, tableData[r].next, tableData[r].ptr];
    cx = tableX;
    for (let c = 0; c < vals.length; c++) {
      text(vals[c], cx + colWidths[c] / 2, ry + rowH / 2);
      cx += colWidths[c];
    }
  }

  // Table border
  stroke('#bbb');
  strokeWeight(1);
  noFill();
  rect(tableX, tableY + rowH, tableW, rowH * tableData.length);

  // Index tree visualization below table
  let treeY = tableY + rowH * 7 + 15;
  let treeH = ph - (treeY - py) - 10;
  if (treeH > 40) {
    drawIndexTree(px, treeY, pw, treeH, fontSize);
  }

  // Status label
  if (tableAnimPhase === 1 && currentHop > 0) {
    noStroke();
    fill(INDIGO);
    textAlign(CENTER, CENTER);
    textSize(fontSize * 0.8);
    textStyle(BOLD);
    text('index lookup: O(log n)', px + pw / 2, py + ph - 5);
    textStyle(NORMAL);
  } else if (tableHopDone && currentHop > 0) {
    noStroke();
    let hopTime = TABLE_BASE_TIME + TABLE_GROWTH * currentHop;
    fill(INDIGO);
    textAlign(CENTER, CENTER);
    textSize(fontSize * 0.75);
    text(hopTime + ' ms', px + pw / 2, py + ph - 5);
  }
}

function drawIndexTree(px, py, pw, ph, fontSize) {
  // Draw a simplified B-tree index diagram
  let treeW = pw * 0.8;
  let treeX = px + (pw - treeW) / 2;
  let nodeW = constrain(treeW / 5, 24, 50);
  let nodeH = constrain(ph / 4, 14, 22);
  let treeTextSize = constrain(fontSize * 0.6, 6, 9);

  // Title
  noStroke();
  fill(INDIGO);
  textAlign(CENTER, TOP);
  textSize(fontSize * 0.7);
  textStyle(BOLD);
  text('B-Tree Index', px + pw / 2, py - 2);
  textStyle(NORMAL);

  // Level 0: root
  let rootX = treeX + treeW / 2;
  let rootY = py + nodeH;
  let isActive = (tableAnimPhase === 1);

  drawTreeNode(rootX, rootY, nodeW * 1.2, nodeH, 'E001..E006', treeTextSize,
    isActive && animTimer > 2);

  // Level 1: two internal nodes
  let l1y = rootY + nodeH * 2;
  let l1x1 = treeX + treeW * 0.25;
  let l1x2 = treeX + treeW * 0.75;

  // Lines from root to children
  stroke(isActive ? INDIGO : '#ccc');
  strokeWeight(isActive ? 1.5 : 1);
  line(rootX, rootY + nodeH / 2, l1x1, l1y - nodeH / 2);
  line(rootX, rootY + nodeH / 2, l1x2, l1y - nodeH / 2);

  drawTreeNode(l1x1, l1y, nodeW, nodeH, 'E001-E003', treeTextSize,
    isActive && animTimer > 8);
  drawTreeNode(l1x2, l1y, nodeW, nodeH, 'E004-E006', treeTextSize,
    isActive && animTimer > 8);

  // Level 2: leaf nodes
  let l2y = l1y + nodeH * 2;
  let leafPositions = [
    treeX + treeW * 0.12,
    treeX + treeW * 0.38,
    treeX + treeW * 0.62,
    treeX + treeW * 0.88
  ];
  let leafLabels = ['E001-2', 'E003', 'E004-5', 'E006'];
  let showLeaves = l2y + nodeH / 2 < py + ph;

  if (showLeaves) {
    stroke(isActive ? INDIGO_LIGHT : '#ccc');
    strokeWeight(isActive ? 1.5 : 1);
    line(l1x1, l1y + nodeH / 2, leafPositions[0], l2y - nodeH / 2);
    line(l1x1, l1y + nodeH / 2, leafPositions[1], l2y - nodeH / 2);
    line(l1x2, l1y + nodeH / 2, leafPositions[2], l2y - nodeH / 2);
    line(l1x2, l1y + nodeH / 2, leafPositions[3], l2y - nodeH / 2);

    for (let i = 0; i < 4; i++) {
      drawTreeNode(leafPositions[i], l2y, nodeW * 0.8, nodeH, leafLabels[i],
        treeTextSize, isActive && animTimer > 14);
    }
  }

  // Animated search highlight path through tree
  if (isActive && currentHop > 0) {
    let targetIdx = min(currentHop, 5);
    let targetLeft = targetIdx < 3;

    // Highlight path
    stroke(GOLD);
    strokeWeight(2.5);
    noFill();

    if (animTimer > 4) {
      line(rootX, rootY + nodeH / 2,
        targetLeft ? l1x1 : l1x2,
        l1y - nodeH / 2);
    }
    if (animTimer > 10 && showLeaves) {
      let leafIdx = targetLeft ? (targetIdx < 2 ? 0 : 1) : (targetIdx < 5 ? 2 : 3);
      line(targetLeft ? l1x1 : l1x2, l1y + nodeH / 2,
        leafPositions[leafIdx], l2y - nodeH / 2);
    }
  }
}

function drawTreeNode(cx, cy, w, h, label, fontSize, highlight) {
  noStroke();
  if (highlight) {
    fill(GOLD + 'AA');
    stroke(AMBER);
    strokeWeight(1.5);
  } else {
    fill(240, 240, 250);
    stroke('#bbb');
    strokeWeight(1);
  }
  rect(cx - w / 2, cy - h / 2, w, h, 3);

  noStroke();
  fill(highlight ? INDIGO_DARK : '#666');
  textAlign(CENTER, CENTER);
  textSize(fontSize);
  text(label, cx, cy);
}

// ================ TIMER BARS ================
function drawTimerBars(bx, by, bw, bh, fontSize) {
  // Background
  noStroke();
  fill(245, 245, 250);
  rect(bx, by, bw, bh, 5);

  let barMaxW = bw * 0.45;
  let barH = 14;
  let labelW = bw * 0.22;
  let barX = bx + labelW;
  let maxPossibleTime = 0;
  for (let h = 1; h <= 5; h++) {
    maxPossibleTime += TABLE_BASE_TIME + TABLE_GROWTH * h;
  }

  // Graph time bar
  let gBarW = map(graphTotalTime, 0, maxPossibleTime, 0, barMaxW);
  fill(AMBER);
  rect(barX, by + 6, max(gBarW, 0), barH, 3);

  fill(AMBER_DARK);
  textAlign(RIGHT, CENTER);
  textSize(fontSize * 0.8);
  textStyle(BOLD);
  text('Graph:', barX - 5, by + 6 + barH / 2);
  textStyle(NORMAL);

  fill(AMBER_DARK);
  textAlign(LEFT, CENTER);
  textSize(fontSize * 0.75);
  text(graphTotalTime + ' ms', barX + max(gBarW, 0) + 5, by + 6 + barH / 2);

  // Table time bar
  let tBarW = map(tableTotalTime, 0, maxPossibleTime, 0, barMaxW);
  fill(INDIGO);
  rect(barX, by + 6 + barH + 6, max(tBarW, 0), barH, 3);

  fill(INDIGO_DARK);
  textAlign(RIGHT, CENTER);
  textSize(fontSize * 0.8);
  textStyle(BOLD);
  text('Relational:', barX - 5, by + 6 + barH + 6 + barH / 2);
  textStyle(NORMAL);

  fill(INDIGO_DARK);
  textAlign(LEFT, CENTER);
  textSize(fontSize * 0.75);
  text(tableTotalTime + ' ms', barX + max(tBarW, 0) + 5, by + 6 + barH + 6 + barH / 2);

  // Speedup badge
  if (currentHop > 0 && tableTotalTime > 0) {
    let speedup = (tableTotalTime / max(graphTotalTime, 1)).toFixed(1);
    let badgeX = bx + bw - 75;
    let badgeY = by + bh / 2;
    noStroke();
    fill(GOLD);
    rect(badgeX - 5, badgeY - 13, 80, 26, 5);
    fill(INDIGO_DARK);
    textAlign(CENTER, CENTER);
    textSize(fontSize * 0.85);
    textStyle(BOLD);
    text(speedup + 'x faster', badgeX + 35, badgeY);
    textStyle(NORMAL);
  }
}

// ================ BUTTONS ================
function drawButtons(by, bh, fontSize) {
  let btnH = constrain(bh * 0.7, 26, 36);
  let btnW = constrain(canvasWidth * 0.22, 80, 140);
  let gap = 15;
  let totalW = btnW * 2 + gap;
  let startX = (canvasWidth - totalW) / 2;
  let btnY = by + (bh - btnH) / 2;

  // Next Hop button
  let canAdvance = currentHop < 5 && graphHopDone && tableHopDone || currentHop === 0;
  let isComplete = currentHop >= 5;

  noStroke();
  if (canAdvance && !isComplete) {
    fill(AMBER);
  } else {
    fill(180, 180, 190);
  }
  rect(startX, btnY, btnW, btnH, 6);

  fill('white');
  textAlign(CENTER, CENTER);
  textSize(constrain(fontSize * 0.85, 9, 13));
  textStyle(BOLD);
  text('Next Hop', startX + btnW / 2, btnY + btnH / 2);
  textStyle(NORMAL);

  nextHopBtn = { x: startX, y: btnY, w: btnW, h: btnH };

  // Reset button
  let resetX = startX + btnW + gap;
  noStroke();
  fill(INDIGO);
  rect(resetX, btnY, btnW, btnH, 6);

  fill('white');
  textAlign(CENTER, CENTER);
  textSize(constrain(fontSize * 0.85, 9, 13));
  textStyle(BOLD);
  text('Reset', resetX + btnW / 2, btnY + btnH / 2);
  textStyle(NORMAL);

  resetBtn = { x: resetX, y: btnY, w: btnW, h: btnH };
}

// ================ ANIMATION ================
function runAnimation() {
  if (graphAnimPhase === 1) {
    animTimer += 1;
    // Graph animation is quick - done in ~20 frames
    if (animTimer >= 20) {
      graphAnimPhase = 2; // done
      graphHopDone = true;
      graphTotalTime += GRAPH_HOP_TIME;
    }
  }

  if (tableAnimPhase === 1) {
    animTimer += 1;
    // Table scanning takes longer based on hop depth
    let scanDuration = 20 + currentHop * 12; // progressively slower
    indexScanRow = floor(map(animTimer, 0, scanDuration * 0.7, 0, 5));
    indexScanRow = constrain(indexScanRow, 0, 5);

    if (animTimer >= scanDuration) {
      tableAnimPhase = 2; // done
      tableHopDone = true;
      let hopTime = TABLE_BASE_TIME + TABLE_GROWTH * currentHop;
      tableTotalTime += hopTime;
      indexScanRow = -1;
    }
  }

  // Both done for this hop
  if (graphAnimPhase === 2 && tableAnimPhase === 2) {
    graphAnimPhase = 0;
    tableAnimPhase = 0;
  }
}

function startNextHop() {
  if (currentHop >= 5) return;
  currentHop++;
  graphAnimPhase = 1;
  tableAnimPhase = 1;
  animTimer = 0;
  graphHopDone = false;
  tableHopDone = false;
  indexScanRow = -1;
}

function resetSim() {
  currentHop = 0;
  graphAnimPhase = 0;
  tableAnimPhase = 0;
  animTimer = 0;
  graphHopDone = false;
  tableHopDone = false;
  graphTotalTime = 0;
  tableTotalTime = 0;
  indexScanRow = -1;
}

// ================ INPUT ================
function mousePressed() {
  // Next Hop button
  if (mouseX >= nextHopBtn.x && mouseX <= nextHopBtn.x + nextHopBtn.w &&
      mouseY >= nextHopBtn.y && mouseY <= nextHopBtn.y + nextHopBtn.h) {
    let canAdvance = (currentHop < 5) && (graphAnimPhase === 0 && tableAnimPhase === 0);
    if (canAdvance) {
      startNextHop();
    }
  }

  // Reset button
  if (mouseX >= resetBtn.x && mouseX <= resetBtn.x + resetBtn.w &&
      mouseY >= resetBtn.y && mouseY <= resetBtn.y + resetBtn.h) {
    resetSim();
  }
}

function windowResized() {
  updateCanvasSize();
  resizeCanvas(containerWidth, containerHeight);
  redraw();
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  containerWidth = Math.floor(container.width);
  canvasWidth = containerWidth;
  canvasHeight = drawHeight + controlHeight;
  containerHeight = canvasHeight;
}
