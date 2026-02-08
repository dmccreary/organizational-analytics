// Process Discovery Flow MicroSim
// Shows how event logs are analyzed to discover actual business process flows
// Two views: event log data and discovered process map
// Built-in p5.js controls
// MicroSim template version 2026.02

let canvasWidth = 400;
let drawHeight = 490;
let controlHeight = 50;
let canvasHeight = drawHeight + controlHeight;
let margin = 15;
let defaultTextSize = 16;

// Hiring process event log data
let eventLog = [
  { caseId: 'H-001', activity: 'Post Job', timestamp: '2026-01-05', actor: 'HR-Kim' },
  { caseId: 'H-001', activity: 'Screen Apps', timestamp: '2026-01-12', actor: 'HR-Kim' },
  { caseId: 'H-001', activity: 'Interview', timestamp: '2026-01-20', actor: 'Mgr-Lopez' },
  { caseId: 'H-001', activity: 'Decision', timestamp: '2026-01-22', actor: 'Mgr-Lopez' },
  { caseId: 'H-001', activity: 'Offer', timestamp: '2026-01-25', actor: 'HR-Kim' },
  { caseId: 'H-001', activity: 'Onboard', timestamp: '2026-02-10', actor: 'HR-Patel' },
  { caseId: 'H-002', activity: 'Post Job', timestamp: '2026-01-08', actor: 'HR-Kim' },
  { caseId: 'H-002', activity: 'Screen Apps', timestamp: '2026-01-15', actor: 'HR-Patel' },
  { caseId: 'H-002', activity: 'Interview', timestamp: '2026-01-25', actor: 'Mgr-Chen' },
  { caseId: 'H-002', activity: 'Decision', timestamp: '2026-01-28', actor: 'Mgr-Chen' },
  { caseId: 'H-002', activity: 'Offer', timestamp: '2026-02-01', actor: 'HR-Kim' },
  { caseId: 'H-002', activity: 'Onboard', timestamp: '2026-02-15', actor: 'HR-Patel' },
  { caseId: 'H-003', activity: 'Post Job', timestamp: '2026-01-10', actor: 'HR-Patel' },
  { caseId: 'H-003', activity: 'Interview', timestamp: '2026-01-22', actor: 'Mgr-Lopez' },  // skipped screening!
  { caseId: 'H-003', activity: 'Decision', timestamp: '2026-01-24', actor: 'Mgr-Lopez' },
  { caseId: 'H-003', activity: 'Offer', timestamp: '2026-01-27', actor: 'HR-Kim' },
  { caseId: 'H-003', activity: 'Onboard', timestamp: '2026-02-12', actor: 'HR-Patel' },
  { caseId: 'H-004', activity: 'Post Job', timestamp: '2026-01-15', actor: 'HR-Kim' },
  { caseId: 'H-004', activity: 'Screen Apps', timestamp: '2026-01-22', actor: 'HR-Kim' },
  { caseId: 'H-004', activity: 'Interview', timestamp: '2026-02-01', actor: 'Mgr-Chen' },
  { caseId: 'H-004', activity: 'Decision', timestamp: '2026-02-05', actor: 'Mgr-Chen' },
  { caseId: 'H-004', activity: 'Interview', timestamp: '2026-02-10', actor: 'Mgr-Lopez' },  // loop back!
  { caseId: 'H-004', activity: 'Decision', timestamp: '2026-02-12', actor: 'Mgr-Lopez' },
  { caseId: 'H-004', activity: 'Offer', timestamp: '2026-02-15', actor: 'HR-Kim' },
  { caseId: 'H-004', activity: 'Onboard', timestamp: '2026-03-01', actor: 'HR-Patel' }
];

// Process map nodes (activities)
let activities = ['Post Job', 'Screen Apps', 'Interview', 'Decision', 'Offer', 'Onboard'];

// Process map edges (discovered transitions)
let transitions = [
  { from: 'Post Job', to: 'Screen Apps', count: 3, normal: true },
  { from: 'Post Job', to: 'Interview', count: 1, normal: false },  // deviation
  { from: 'Screen Apps', to: 'Interview', count: 3, normal: true },
  { from: 'Interview', to: 'Decision', count: 5, normal: true },
  { from: 'Decision', to: 'Offer', count: 4, normal: true },
  { from: 'Decision', to: 'Interview', count: 1, normal: false },  // loop back
  { from: 'Offer', to: 'Onboard', count: 4, normal: true }
];

// State
let discovered = false;
let discoverProgress = 0;
let highlightedEvent = -1;
let showIdealProcess = false;
let scrollOffset = 0;

// Controls
let discoverButton, idealToggle;

// Node positions for process map (will be calculated)
let nodePositions = {};

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent(document.querySelector('main'));

  discoverButton = createButton('Discover Process');
  discoverButton.position(10, drawHeight + 10);
  discoverButton.mousePressed(startDiscovery);
  discoverButton.style('font-size', '13px');
  discoverButton.style('padding', '5px 14px');
  discoverButton.style('border-radius', '6px');
  discoverButton.style('cursor', 'pointer');
  discoverButton.style('background-color', '#303F9F');
  discoverButton.style('color', 'white');
  discoverButton.style('border', '1px solid #303F9F');
  discoverButton.style('font-weight', 'bold');

  idealToggle = createButton('Show Ideal Process');
  idealToggle.position(160, drawHeight + 10);
  idealToggle.mousePressed(toggleIdeal);
  idealToggle.style('font-size', '13px');
  idealToggle.style('padding', '5px 14px');
  idealToggle.style('border-radius', '6px');
  idealToggle.style('cursor', 'pointer');
  idealToggle.style('background-color', '#D4880F');
  idealToggle.style('color', 'white');
  idealToggle.style('border', '1px solid #D4880F');

  describe('Interactive process discovery simulation showing how event log data is analyzed to build a process map of a hiring workflow, revealing deviations from the ideal process.', LABEL);
}

function startDiscovery() {
  if (!discovered) {
    discoverProgress = 0;
    discovered = true;
    discoverButton.html('Reset');
  } else {
    discovered = false;
    discoverProgress = 0;
    highlightedEvent = -1;
    showIdealProcess = false;
    idealToggle.html('Show Ideal Process');
    discoverButton.html('Discover Process');
  }
}

function toggleIdeal() {
  showIdealProcess = !showIdealProcess;
  idealToggle.html(showIdealProcess ? 'Hide Ideal Process' : 'Show Ideal Process');
}

function draw() {
  updateCanvasSize();

  // Background
  fill('aliceblue');
  stroke('silver');
  strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);

  // Control area
  fill('white');
  stroke('silver');
  rect(0, drawHeight, canvasWidth, controlHeight);

  // Title
  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(18);
  text('Process Discovery Flow', canvasWidth / 2, 6);

  // Subtitle
  textSize(12);
  fill('#666');
  text('Hiring Process — 4 Cases, 25 Events', canvasWidth / 2, 26);

  // Layout: event log on left, process map on right
  let dividerX = canvasWidth * 0.38;
  let contentY = 44;

  // Draw event log panel
  drawEventLog(margin, contentY, dividerX - margin - 5, drawHeight - contentY - 10);

  // Draw divider
  stroke('#ddd');
  strokeWeight(1);
  line(dividerX, contentY, dividerX, drawHeight - 5);

  // Draw process map panel
  drawProcessMap(dividerX + 5, contentY, canvasWidth - dividerX - margin - 5, drawHeight - contentY - 10);

  // Animate discovery
  if (discovered && discoverProgress < eventLog.length) {
    discoverProgress += 0.08;
    highlightedEvent = floor(discoverProgress);
  }
}

function drawEventLog(x, y, w, h) {
  // Panel header
  noStroke();
  fill('#303F9F');
  textAlign(LEFT, TOP);
  textSize(13);
  textStyle(BOLD);
  text('Event Log', x + 2, y);
  textStyle(NORMAL);

  // Column headers
  let headerY = y + 18;
  let colW = [45, 58, 55];
  let cols = ['Case', 'Activity', 'Actor'];
  textSize(10);
  fill('#666');
  textStyle(BOLD);
  for (let c = 0; c < cols.length; c++) {
    let cx = x + 2;
    for (let k = 0; k < c; k++) cx += colW[k];
    text(cols[c], cx, headerY);
  }
  textStyle(NORMAL);

  // Draw separator
  stroke('#ddd');
  strokeWeight(1);
  line(x, headerY + 14, x + w, headerY + 14);

  // Event rows
  let rowH = 16;
  let startRow = headerY + 18;
  let visibleRows = floor((h - 40) / rowH);

  for (let i = 0; i < min(eventLog.length, visibleRows); i++) {
    let evt = eventLog[i];
    let ry = startRow + i * rowH;

    // Highlight current event during discovery
    let isHighlighted = discovered && i === highlightedEvent;
    let isProcessed = discovered && i < highlightedEvent;

    if (isHighlighted) {
      fill('#E8EAF6');
      noStroke();
      rect(x, ry - 2, w, rowH, 2);
    }

    noStroke();
    textSize(9);
    fill(isProcessed ? '#999' : (isHighlighted ? '#303F9F' : '#333'));

    let cx = x + 2;
    text(evt.caseId, cx, ry);
    cx += colW[0];
    // Mark deviations
    let isDeviation = (evt.caseId === 'H-003' && evt.activity === 'Interview' && i === 13) ||
                      (evt.caseId === 'H-004' && evt.activity === 'Interview' && i === 21);
    if (isDeviation) fill('#E53935');
    text(evt.activity, cx, ry);
    if (isDeviation) fill(isProcessed ? '#999' : '#333');
    cx += colW[1];
    text(evt.actor, cx, ry);
  }
}

function drawProcessMap(x, y, w, h) {
  // Panel header
  noStroke();
  fill('#303F9F');
  textAlign(LEFT, TOP);
  textSize(13);
  textStyle(BOLD);
  text('Discovered Process', x + 2, y);
  textStyle(NORMAL);

  let mapY = y + 22;
  let mapH = h - 25;

  // Calculate node positions
  let nodeW = min(80, w * 0.6);
  let nodeH = 28;
  let centerX = x + w / 2;
  let gapY = (mapH - 10) / (activities.length - 1);

  for (let i = 0; i < activities.length; i++) {
    nodePositions[activities[i]] = {
      x: centerX,
      y: mapY + 10 + i * gapY,
      w: nodeW,
      h: nodeH
    };
  }

  // Only draw if discovery has started
  if (!discovered) {
    noStroke();
    fill('#aaa');
    textAlign(CENTER, CENTER);
    textSize(12);
    text('Press "Discover\nProcess" to begin', centerX, mapY + mapH / 2);
    return;
  }

  // Draw ideal process overlay if enabled
  if (showIdealProcess) {
    for (let i = 0; i < activities.length - 1; i++) {
      let fromPos = nodePositions[activities[i]];
      let toPos = nodePositions[activities[i + 1]];
      stroke(200, 200, 200, 150);
      strokeWeight(6);
      line(fromPos.x, fromPos.y + nodeH / 2, toPos.x, toPos.y - nodeH / 2);
    }
    // Ideal label
    noStroke();
    fill(180);
    textSize(9);
    textAlign(LEFT, TOP);
    text('(gray = ideal)', x + 2, mapY + mapH - 12);
  }

  // Draw discovered edges (transitions)
  let visibleTransitions = floor(discoverProgress / 3);
  for (let t = 0; t < min(transitions.length, visibleTransitions + 1); t++) {
    let tr = transitions[t];
    let fromPos = nodePositions[tr.from];
    let toPos = nodePositions[tr.to];

    if (!fromPos || !toPos) continue;

    let edgeColor = tr.normal ? color('#303F9F') : color('#E53935');
    let thickness = map(tr.count, 1, 5, 1.5, 4);

    // Determine if edge needs curve (for backward edges)
    if (activities.indexOf(tr.from) >= activities.indexOf(tr.to)) {
      // Backward edge — draw curved
      stroke(edgeColor);
      strokeWeight(thickness);
      noFill();
      let curveOffset = 35;
      let midY = (fromPos.y + toPos.y) / 2;
      bezier(
        fromPos.x + nodeW / 2, fromPos.y,
        fromPos.x + nodeW / 2 + curveOffset, fromPos.y,
        toPos.x + nodeW / 2 + curveOffset, toPos.y,
        toPos.x + nodeW / 2, toPos.y
      );
      // Arrowhead
      fill(edgeColor);
      noStroke();
      let ax = toPos.x + nodeW / 2;
      let ay = toPos.y;
      triangle(ax + 2, ay - 4, ax + 2, ay + 4, ax - 3, ay);
    } else {
      // Forward edge — straight line
      stroke(edgeColor);
      strokeWeight(thickness);
      let startY = fromPos.y + nodeH / 2;
      let endY = toPos.y - nodeH / 2;

      // Offset non-standard edges slightly to right
      let offsetX = tr.normal ? 0 : -nodeW / 3;
      line(fromPos.x + offsetX, startY, toPos.x + offsetX, endY);

      // Arrowhead
      fill(edgeColor);
      noStroke();
      triangle(toPos.x + offsetX - 4, endY - 6, toPos.x + offsetX + 4, endY - 6, toPos.x + offsetX, endY);
    }

    // Edge count label
    noStroke();
    fill(tr.normal ? '#303F9F' : '#E53935');
    textSize(9);
    textAlign(LEFT, CENTER);
    let labelX = tr.normal ? fromPos.x + nodeW / 2 + 5 : fromPos.x + nodeW / 2 + 38;
    let labelY = (fromPos.y + toPos.y) / 2;
    text('×' + tr.count, labelX, labelY);
  }

  // Draw nodes
  let visibleNodes = floor(discoverProgress / 2) + 1;
  for (let i = 0; i < min(activities.length, visibleNodes); i++) {
    let act = activities[i];
    let pos = nodePositions[act];

    // Check hover
    let isHovered = mouseX > pos.x - pos.w / 2 && mouseX < pos.x + pos.w / 2 &&
                    mouseY > pos.y - pos.h / 2 && mouseY < pos.y + pos.h / 2;

    stroke('#303F9F');
    strokeWeight(isHovered ? 3 : 2);
    fill(isHovered ? '#E8EAF6' : 'white');
    rect(pos.x - pos.w / 2, pos.y - pos.h / 2, pos.w, pos.h, 6);

    noStroke();
    fill('#303F9F');
    textSize(10);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(act, pos.x, pos.y);
    textStyle(NORMAL);
  }

  // Legend
  if (discoverProgress >= eventLog.length) {
    noStroke();
    textSize(9);
    textAlign(LEFT, TOP);

    fill('#303F9F');
    rect(x + 2, mapY + mapH - 28, 8, 3);
    fill('#444');
    text('Normal flow', x + 14, mapY + mapH - 30);

    fill('#E53935');
    rect(x + 2, mapY + mapH - 16, 8, 3);
    fill('#444');
    text('Deviation', x + 14, mapY + mapH - 18);
  }
}

function mouseWheel(event) {
  // Could add scroll for event log if needed
  return false;
}

function windowResized() {
  updateCanvasSize();
  resizeCanvas(canvasWidth, canvasHeight);
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  canvasWidth = Math.floor(container.width);
}
