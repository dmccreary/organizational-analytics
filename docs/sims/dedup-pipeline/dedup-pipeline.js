// Deduplication Pipeline MicroSim
// Three-column visualization: Incoming Events -> Identity Resolution -> Graph Result
// Canvas-based controls only (no p5.js DOM functions)
// MicroSim template version 2026.02

let canvasWidth = 400;
let drawHeight = 450;
let controlHeight = 50;
let canvasHeight = drawHeight + controlHeight;
let margin = 12;
let defaultTextSize = 16;

// Aria color scheme
const INDIGO = '#303F9F';
const AMBER = '#D4880F';
const CHAMPAGNE = '#FFF8E7';
const GOLD = '#FFD700';

// Source system colors
const SOURCE_COLORS = {
  Email: '#303F9F',
  Slack: '#D4880F',
  HRIS: '#2E7D32',
  Jira: '#7B1FA2'
};

const EVENT_TYPES = {
  Email: ['sent', 'received', 'forwarded'],
  Slack: ['posted', 'reacted', 'replied'],
  HRIS: ['updated', 'reviewed', 'submitted'],
  Jira: ['assigned', 'resolved', 'commented']
};

// Identity resolution table
let identityTable = [
  { sourceId: 'maria.chen@acme.com', source: 'Email', canonical: 'EMP-1047', name: 'Maria Chen' },
  { sourceId: '@mariachen', source: 'Slack', canonical: 'EMP-1047', name: 'Maria Chen' },
  { sourceId: 'MC-2019-0047', source: 'HRIS', canonical: 'EMP-1047', name: 'Maria Chen' },
  { sourceId: 'mchen', source: 'Jira', canonical: 'EMP-1047', name: 'Maria Chen' },
  { sourceId: 'james.park@acme.com', source: 'Email', canonical: 'EMP-2103', name: 'James Park' },
  { sourceId: '@jpark', source: 'Slack', canonical: 'EMP-2103', name: 'James Park' },
  { sourceId: 'JP-2020-0112', source: 'HRIS', canonical: 'EMP-2103', name: 'James Park' },
  { sourceId: 'jpark', source: 'Jira', canonical: 'EMP-2103', name: 'James Park' },
  { sourceId: 'aisha.patel@acme.com', source: 'Email', canonical: 'EMP-3291', name: 'Aisha Patel' },
  { sourceId: '@aishap', source: 'Slack', canonical: 'EMP-3291', name: 'Aisha Patel' },
  { sourceId: 'AP-2021-0203', source: 'HRIS', canonical: 'EMP-3291', name: 'Aisha Patel' },
  { sourceId: 'apatel', source: 'Jira', canonical: 'EMP-3291', name: 'Aisha Patel' },
  { sourceId: 'raj.kumar@acme.com', source: 'Email', canonical: 'EMP-4455', name: 'Raj Kumar' },
  { sourceId: '@rajk', source: 'Slack', canonical: 'EMP-4455', name: 'Raj Kumar' },
  { sourceId: 'rkumar', source: 'Jira', canonical: 'EMP-4455', name: 'Raj Kumar' }
];

// Unknown identifiers for "Add Unknown" button
let unknownIds = [
  { sourceId: 'unknown.user@ext.com', source: 'Email' },
  { sourceId: '@newcontractor', source: 'Slack' },
  { sourceId: 'EXT-9999', source: 'HRIS' },
  { sourceId: 'tempuser42', source: 'Jira' }
];
let nextUnknownIdx = 0;

// Graph nodes (canonical persons)
let graphNodes = {};
// Graph edges
let graphEdges = [];

// Incoming events queue (visible cards)
let incomingEvents = [];
let maxVisibleEvents = 5;

// Animation state
let activeResolution = null; // currently animating resolution
let resolutionTimer = 0;
let highlightedTableRow = -1;
let glowingNode = null;
let glowTimer = 0;
let unresolvedFlash = 0;

// Metrics
let totalProcessed = 0;
let duplicatesCaught = 0;
let unresolvedCount = 0;

// Manual review queue
let manualReviewQueue = [];
let maxManualReview = 3;

// Scroll offset for identity table
let tableScrollOffset = 0;
let maxVisibleTableRows = 7;

// Canvas-based button definitions
let buttons = [];

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent(document.querySelector('main'));

  // Define buttons (positions calculated in draw relative to canvasWidth)
  buttons = [
    { label: 'Add Event', action: addRandomEvent, color: INDIGO },
    { label: 'Add Duplicate', action: addDuplicateEvent, color: AMBER },
    { label: 'Add Unknown', action: addUnknownEvent, color: '#7B1FA2' },
    { label: 'Reset', action: resetAll, color: '#666666' }
  ];

  // Seed a few initial graph nodes so the right column isn't empty
  addNodeIfNeeded('EMP-1047', 'Maria Chen');
  addNodeIfNeeded('EMP-2103', 'James Park');
  addNodeIfNeeded('EMP-3291', 'Aisha Patel');

  describe('Interactive three-column deduplication pipeline showing incoming events from multiple source systems being resolved through an identity resolution table into canonical graph nodes. Use buttons to add events and observe identity resolution in action.', LABEL);
}

// ---- Data helpers ----

function addNodeIfNeeded(canonical, name) {
  if (!graphNodes[canonical]) {
    // Position nodes in the graph area
    let nodeCount = Object.keys(graphNodes).length;
    let graphX = getColX(2) + getColW(2) / 2;
    let graphY = 90;
    let radius = min(getColW(2), 140) * 0.35;
    let angle = -PI / 2 + nodeCount * TWO_PI / 5;
    graphNodes[canonical] = {
      id: canonical,
      name: name,
      x: graphX + cos(angle) * radius,
      y: graphY + 80 + sin(angle) * radius,
      edgeCount: 0,
      glow: 0
    };
  }
}

function resolveIdentifier(sourceId) {
  for (let entry of identityTable) {
    if (entry.sourceId === sourceId) {
      return entry;
    }
  }
  return null;
}

function pickRandomEntry() {
  return identityTable[floor(random(identityTable.length))];
}

function addRandomEvent() {
  if (activeResolution) return; // wait for current resolution to finish
  let entry = pickRandomEntry();
  let source = entry.source;
  let eventType = random(EVENT_TYPES[source]);
  let evt = {
    sourceId: entry.sourceId,
    source: source,
    eventType: eventType,
    alpha: 0,  // fade-in
    slideX: -80 // slide from left
  };
  incomingEvents.unshift(evt);
  if (incomingEvents.length > maxVisibleEvents) {
    incomingEvents.pop();
  }
  // Start resolution animation
  startResolution(evt);
}

function addDuplicateEvent() {
  if (activeResolution) return;
  // Pick Maria Chen specifically and choose an identifier already used
  let mariaEntries = identityTable.filter(e => e.canonical === 'EMP-1047');
  let entry = random(mariaEntries);
  let source = entry.source;
  let eventType = random(EVENT_TYPES[source]);
  let evt = {
    sourceId: entry.sourceId,
    source: source,
    eventType: eventType,
    alpha: 0,
    slideX: -80,
    isDuplicate: true
  };
  incomingEvents.unshift(evt);
  if (incomingEvents.length > maxVisibleEvents) {
    incomingEvents.pop();
  }
  startResolution(evt);
}

function addUnknownEvent() {
  if (activeResolution) return;
  let unknown = unknownIds[nextUnknownIdx % unknownIds.length];
  nextUnknownIdx++;
  let eventType = random(EVENT_TYPES[unknown.source]);
  let evt = {
    sourceId: unknown.sourceId,
    source: unknown.source,
    eventType: eventType,
    alpha: 0,
    slideX: -80,
    isUnknown: true
  };
  incomingEvents.unshift(evt);
  if (incomingEvents.length > maxVisibleEvents) {
    incomingEvents.pop();
  }
  startResolution(evt);
}

function startResolution(evt) {
  activeResolution = {
    event: evt,
    phase: 'scanning', // scanning -> found/notfound -> done
    timer: 0,
    scanRow: 0,
    resolved: null
  };
  resolutionTimer = 0;

  // Find table row index
  let rowIdx = -1;
  for (let i = 0; i < identityTable.length; i++) {
    if (identityTable[i].sourceId === evt.sourceId) {
      rowIdx = i;
      break;
    }
  }
  activeResolution.targetRow = rowIdx;
}

function resetAll() {
  incomingEvents = [];
  graphNodes = {};
  graphEdges = [];
  totalProcessed = 0;
  duplicatesCaught = 0;
  unresolvedCount = 0;
  manualReviewQueue = [];
  activeResolution = null;
  highlightedTableRow = -1;
  glowingNode = null;
  tableScrollOffset = 0;
  nextUnknownIdx = 0;

  // Re-seed initial nodes
  addNodeIfNeeded('EMP-1047', 'Maria Chen');
  addNodeIfNeeded('EMP-2103', 'James Park');
  addNodeIfNeeded('EMP-3291', 'Aisha Patel');
}

// ---- Layout helpers ----

function getColX(col) {
  let usableW = canvasWidth - margin * 2;
  let gap = 6;
  let colWidths = [0.28, 0.40, 0.32]; // proportions
  let x = margin;
  for (let i = 0; i < col; i++) {
    x += usableW * colWidths[i] + gap;
  }
  return x;
}

function getColW(col) {
  let usableW = canvasWidth - margin * 2;
  let colWidths = [0.28, 0.40, 0.32];
  return usableW * colWidths[col];
}

// ---- Draw ----

function draw() {
  updateCanvasSize();

  // Draw area background
  fill(CHAMPAGNE);
  noStroke();
  rect(0, 0, canvasWidth, drawHeight);

  // Control area background
  fill('white');
  stroke('silver');
  strokeWeight(1);
  rect(0, drawHeight, canvasWidth, controlHeight);

  // Title
  noStroke();
  fill(INDIGO);
  textAlign(CENTER, TOP);
  textStyle(BOLD);
  textSize(constrain(canvasWidth * 0.032, 13, 18));
  text('Deduplication Pipeline', canvasWidth / 2, 6);
  textStyle(NORMAL);

  // Column headers
  let headerY = 26;
  let headerSize = constrain(canvasWidth * 0.02, 9, 12);
  textSize(headerSize);
  textStyle(BOLD);

  fill(INDIGO);
  textAlign(CENTER, TOP);
  text('Incoming Events', getColX(0) + getColW(0) / 2, headerY);

  fill(AMBER);
  text('Identity Resolution', getColX(1) + getColW(1) / 2, headerY);

  fill('#2E7D32');
  text('Graph Result', getColX(2) + getColW(2) / 2, headerY);
  textStyle(NORMAL);

  // Column separators
  stroke('#ccc');
  strokeWeight(1);
  let sepY1 = 40;
  let sepY2 = drawHeight - 55;
  line(getColX(1) - 3, sepY1, getColX(1) - 3, sepY2);
  line(getColX(2) - 3, sepY1, getColX(2) - 3, sepY2);

  // Animate incoming events
  for (let evt of incomingEvents) {
    if (evt.alpha < 255) evt.alpha = min(255, evt.alpha + 15);
    if (evt.slideX < 0) evt.slideX = min(0, evt.slideX + 6);
  }

  // Update resolution animation
  updateResolution();

  // Draw three columns
  drawIncomingEvents();
  drawIdentityTable();
  drawGraphResult();

  // Draw metrics bar
  drawMetrics();

  // Draw buttons
  drawButtons();

  // Update glow timers
  if (glowingNode) {
    glowTimer -= 1;
    if (glowTimer <= 0) {
      if (graphNodes[glowingNode]) graphNodes[glowingNode].glow = 0;
      glowingNode = null;
    }
  }
  if (unresolvedFlash > 0) unresolvedFlash -= 3;
}

function updateResolution() {
  if (!activeResolution) return;
  let ar = activeResolution;
  ar.timer++;

  if (ar.phase === 'scanning') {
    // Scan through table rows visually
    let scanSpeed = 3; // frames per row
    ar.scanRow = floor(ar.timer / scanSpeed);

    if (ar.targetRow >= 0 && ar.scanRow >= ar.targetRow) {
      // Found it
      ar.phase = 'found';
      ar.timer = 0;
      highlightedTableRow = ar.targetRow;
      // Scroll table to show the highlighted row
      if (ar.targetRow >= tableScrollOffset + maxVisibleTableRows) {
        tableScrollOffset = max(0, ar.targetRow - maxVisibleTableRows + 1);
      } else if (ar.targetRow < tableScrollOffset) {
        tableScrollOffset = ar.targetRow;
      }
    } else if (ar.targetRow < 0 && ar.scanRow >= identityTable.length) {
      // Not found
      ar.phase = 'notfound';
      ar.timer = 0;
    }
    // Visual scan highlight
    highlightedTableRow = min(ar.scanRow, identityTable.length - 1);
  }

  if (ar.phase === 'found') {
    if (ar.timer > 30) {
      // Complete the resolution
      let entry = identityTable[ar.targetRow];
      totalProcessed++;

      // Check if this is a duplicate edge
      let existingEdge = graphEdges.find(
        e => e.from === entry.canonical && e.sourceId === ar.event.sourceId && e.eventType === ar.event.eventType
      );
      if (existingEdge || ar.event.isDuplicate) {
        duplicatesCaught++;
      }

      addNodeIfNeeded(entry.canonical, entry.name);
      graphEdges.push({
        from: entry.canonical,
        sourceId: ar.event.sourceId,
        source: ar.event.source,
        eventType: ar.event.eventType,
        timestamp: Date.now()
      });
      graphNodes[entry.canonical].edgeCount++;

      // Trigger glow
      glowingNode = entry.canonical;
      graphNodes[entry.canonical].glow = 255;
      glowTimer = 40;

      highlightedTableRow = -1;
      activeResolution = null;
    }
  }

  if (ar.phase === 'notfound') {
    if (ar.timer > 20) {
      totalProcessed++;
      unresolvedCount++;
      unresolvedFlash = 255;

      // Add to manual review queue
      manualReviewQueue.unshift({
        sourceId: ar.event.sourceId,
        source: ar.event.source,
        timer: 255
      });
      if (manualReviewQueue.length > maxManualReview) {
        manualReviewQueue.pop();
      }

      highlightedTableRow = -1;
      activeResolution = null;
    }
  }
}

// ---- Column drawing ----

function drawIncomingEvents() {
  let colX = getColX(0);
  let colW = getColW(0);
  let startY = 42;
  let cardH = 56;
  let cardGap = 4;

  for (let i = 0; i < incomingEvents.length; i++) {
    let evt = incomingEvents[i];
    let cardY = startY + i * (cardH + cardGap);
    let cardX = colX + evt.slideX;
    let a = evt.alpha;

    if (cardY + cardH > drawHeight - 60) break; // don't overflow into metrics

    // Card background
    let srcColor = color(SOURCE_COLORS[evt.source] || INDIGO);
    srcColor.setAlpha(a);
    fill(255, 255, 255, a * 0.92);
    stroke(red(srcColor), green(srcColor), blue(srcColor), a);
    strokeWeight(2);
    rect(cardX + 2, cardY, colW - 4, cardH, 6);

    // Source badge
    let badgeW = constrain(colW * 0.7, 40, 65);
    noStroke();
    fill(red(srcColor), green(srcColor), blue(srcColor), a);
    rect(cardX + 5, cardY + 4, badgeW, 16, 3);
    fill(255, 255, 255, a);
    textSize(constrain(canvasWidth * 0.016, 8, 10));
    textAlign(LEFT, CENTER);
    textStyle(BOLD);
    text(evt.source, cardX + 8, cardY + 12);
    textStyle(NORMAL);

    // Event type badge
    fill(120, 120, 120, a);
    textSize(constrain(canvasWidth * 0.014, 7, 9));
    textAlign(RIGHT, CENTER);
    text(evt.eventType, cardX + colW - 7, cardY + 12);

    // Identifier
    fill(50, 50, 50, a);
    textSize(constrain(canvasWidth * 0.016, 8, 10));
    textAlign(LEFT, CENTER);
    let idText = evt.sourceId;
    // Truncate if too long
    if (textWidth(idText) > colW - 14) {
      while (textWidth(idText + '...') > colW - 14 && idText.length > 3) {
        idText = idText.slice(0, -1);
      }
      idText += '...';
    }
    text(idText, cardX + 5, cardY + 32);

    // Duplicate / Unknown badge
    if (evt.isDuplicate) {
      fill(AMBER);
      textSize(8);
      textAlign(RIGHT, BOTTOM);
      textStyle(BOLD);
      text('DUP', cardX + colW - 7, cardY + cardH - 4);
      textStyle(NORMAL);
    }
    if (evt.isUnknown) {
      fill(200, 0, 0, a);
      textSize(8);
      textAlign(RIGHT, BOTTOM);
      textStyle(BOLD);
      text('???', cardX + colW - 7, cardY + cardH - 4);
      textStyle(NORMAL);
    }

    // Arrow from active event to center column
    if (i === 0 && activeResolution && activeResolution.event === evt) {
      let arrowStartX = cardX + colW - 2;
      let arrowStartY = cardY + cardH / 2;
      let arrowEndX = getColX(1) + 2;
      let arrowEndY = arrowStartY;
      stroke(GOLD);
      strokeWeight(2);
      // Dashed-style pulsing arrow
      let dashPhase = (frameCount * 0.1) % 1;
      for (let d = 0; d < 1; d += 0.15) {
        let t = (d + dashPhase * 0.15) % 1;
        let dx1 = lerp(arrowStartX, arrowEndX, t);
        let dx2 = lerp(arrowStartX, arrowEndX, min(1, t + 0.08));
        line(dx1, arrowStartY, dx2, arrowStartY);
      }
      // Arrowhead
      fill(GOLD);
      noStroke();
      triangle(arrowEndX, arrowEndY - 4, arrowEndX, arrowEndY + 4, arrowEndX + 5, arrowEndY);
    }
  }
}

function drawIdentityTable() {
  let colX = getColX(1);
  let colW = getColW(1);
  let startY = 42;
  let rowH = 22;
  let tableH = maxVisibleTableRows * rowH + 24;

  // Table header
  fill(INDIGO);
  noStroke();
  rect(colX + 2, startY, colW - 4, 20, 4, 4, 0, 0);
  fill(255);
  textSize(constrain(canvasWidth * 0.015, 7, 9));
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text('Source ID', colX + 6, startY + 10);
  textAlign(RIGHT, CENTER);
  text('Canonical', colX + colW - 6, startY + 10);
  textStyle(NORMAL);

  // Table body background
  fill(255, 255, 255, 230);
  stroke('#ddd');
  strokeWeight(1);
  rect(colX + 2, startY + 20, colW - 4, maxVisibleTableRows * rowH + 2, 0, 0, 4, 4);

  // Draw visible rows
  let visibleCount = min(maxVisibleTableRows, identityTable.length - tableScrollOffset);
  for (let i = 0; i < visibleCount; i++) {
    let rowIdx = i + tableScrollOffset;
    let entry = identityTable[rowIdx];
    let ry = startY + 22 + i * rowH;

    // Highlight row during scanning
    if (rowIdx === highlightedTableRow && activeResolution) {
      let phase = activeResolution.phase;
      if (phase === 'scanning') {
        fill(255, 255, 200, 180);
        noStroke();
        rect(colX + 3, ry, colW - 6, rowH - 2, 2);
      } else if (phase === 'found') {
        // Pulse green on found
        let pulse = 128 + 127 * sin(frameCount * 0.2);
        fill(200, 255, 200, pulse);
        noStroke();
        rect(colX + 3, ry, colW - 6, rowH - 2, 2);
      }
    }

    // Row separator
    stroke('#eee');
    strokeWeight(0.5);
    line(colX + 4, ry + rowH - 1, colX + colW - 4, ry + rowH - 1);

    // Source color dot
    fill(SOURCE_COLORS[entry.source] || INDIGO);
    noStroke();
    ellipse(colX + 10, ry + rowH / 2, 6, 6);

    // Source ID text
    fill('#333');
    textSize(constrain(canvasWidth * 0.014, 7, 9));
    textAlign(LEFT, CENTER);
    let srcText = entry.sourceId;
    let maxSrcW = colW * 0.52;
    if (textWidth(srcText) > maxSrcW) {
      while (textWidth(srcText + '..') > maxSrcW && srcText.length > 3) {
        srcText = srcText.slice(0, -1);
      }
      srcText += '..';
    }
    text(srcText, colX + 16, ry + rowH / 2);

    // Arrow
    fill('#999');
    textSize(10);
    textAlign(CENTER, CENTER);
    text('\u2192', colX + colW * 0.6, ry + rowH / 2);

    // Canonical ID
    fill(INDIGO);
    textSize(constrain(canvasWidth * 0.014, 7, 9));
    textStyle(BOLD);
    textAlign(RIGHT, CENTER);
    text(entry.canonical, colX + colW - 6, ry + rowH / 2);
    textStyle(NORMAL);
  }

  // Scroll indicators
  if (tableScrollOffset > 0) {
    fill(150);
    noStroke();
    textSize(10);
    textAlign(CENTER, CENTER);
    text('\u25B2', colX + colW / 2, startY + 23);
  }
  if (tableScrollOffset + maxVisibleTableRows < identityTable.length) {
    fill(150);
    noStroke();
    textSize(10);
    textAlign(CENTER, CENTER);
    text('\u25BC', colX + colW / 2, startY + 22 + visibleCount * rowH - 2);
  }

  // Manual Review Queue below table
  let queueY = startY + tableH + 10;
  let queueLabelY = queueY;

  // Flash red on unresolved
  if (unresolvedFlash > 0) {
    fill(255, 0, 0, unresolvedFlash * 0.3);
    noStroke();
    rect(colX + 2, queueY - 2, colW - 4, 18 + manualReviewQueue.length * 18, 4);
  }

  fill(unresolvedFlash > 0 ? color(200, 0, 0) : color('#888'));
  noStroke();
  textSize(constrain(canvasWidth * 0.015, 8, 10));
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text('Manual Review Queue', colX + 4, queueLabelY);
  textStyle(NORMAL);

  for (let i = 0; i < manualReviewQueue.length; i++) {
    let item = manualReviewQueue[i];
    let iy = queueLabelY + 16 + i * 18;
    if (iy > drawHeight - 65) break;

    fill(255, 200, 200, item.timer);
    stroke(200, 0, 0, item.timer * 0.5);
    strokeWeight(1);
    rect(colX + 4, iy, colW - 8, 16, 3);

    fill(180, 0, 0, item.timer);
    noStroke();
    textSize(constrain(canvasWidth * 0.013, 7, 9));
    textAlign(LEFT, CENTER);
    let mrText = item.sourceId;
    let mrMaxW = colW - 20;
    if (textWidth(mrText) > mrMaxW) {
      while (textWidth(mrText + '..') > mrMaxW && mrText.length > 3) {
        mrText = mrText.slice(0, -1);
      }
      mrText += '..';
    }
    text('\u2718 ' + mrText, colX + 7, iy + 8);

    if (item.timer > 120) item.timer -= 0.3;
  }
}

function drawGraphResult() {
  let colX = getColX(2);
  let colW = getColW(2);
  let centerX = colX + colW / 2;
  let centerY = 155;
  let graphRadius = min(colW, 180) * 0.32;

  // Draw edges first
  let nodeKeys = Object.keys(graphNodes);
  for (let edge of graphEdges) {
    let fromNode = graphNodes[edge.from];
    if (!fromNode) continue;
    // Draw small ticks around the node to represent edges
    let nodeIdx = nodeKeys.indexOf(edge.from);
    // Just show edges as subtle lines radiating from nodes
  }

  // Reposition nodes in a nice arc
  for (let i = 0; i < nodeKeys.length; i++) {
    let node = graphNodes[nodeKeys[i]];
    let angle = -PI / 2 + i * TWO_PI / max(nodeKeys.length, 3);
    let targetX = centerX + cos(angle) * graphRadius;
    let targetY = centerY + sin(angle) * graphRadius;
    // Smooth lerp to target position
    node.x = lerp(node.x, targetX, 0.1);
    node.y = lerp(node.y, targetY, 0.1);
  }

  // Draw connections between nodes that share edges (interactions between employees)
  // Draw self-referencing edge counts as orbital marks
  for (let i = 0; i < nodeKeys.length; i++) {
    let nodeA = graphNodes[nodeKeys[i]];
    for (let j = i + 1; j < nodeKeys.length; j++) {
      let nodeB = graphNodes[nodeKeys[j]];
      // Draw a faint connection line between all person nodes
      stroke(200, 200, 220);
      strokeWeight(1);
      line(nodeA.x, nodeA.y, nodeB.x, nodeB.y);
    }
  }

  // Draw edge ticks around each node
  for (let key of nodeKeys) {
    let node = graphNodes[key];
    let edgeCount = node.edgeCount;
    if (edgeCount > 0) {
      let nodeR = constrain(12 + edgeCount * 1.5, 12, 28);
      for (let e = 0; e < min(edgeCount, 16); e++) {
        let ea = (e / min(edgeCount, 16)) * TWO_PI - PI / 2;
        let tickR = nodeR + 5;
        let tickEnd = nodeR + 10;
        stroke(AMBER);
        strokeWeight(1.5);
        line(
          node.x + cos(ea) * tickR,
          node.y + sin(ea) * tickR,
          node.x + cos(ea) * tickEnd,
          node.y + sin(ea) * tickEnd
        );
      }
    }
  }

  // Draw nodes
  for (let key of nodeKeys) {
    let node = graphNodes[key];
    let nodeR = constrain(12 + node.edgeCount * 1.5, 12, 28);

    // Glow effect
    if (node.glow > 0) {
      noStroke();
      fill(255, 215, 0, node.glow * 0.5);
      ellipse(node.x, node.y, nodeR * 2 + 16, nodeR * 2 + 16);
      node.glow = max(0, node.glow - 4);
    }

    // Node circle
    stroke(INDIGO);
    strokeWeight(2);
    fill(255);
    ellipse(node.x, node.y, nodeR * 2, nodeR * 2);

    // Inner fill based on edge count
    noStroke();
    let intensity = constrain(node.edgeCount * 15, 0, 200);
    fill(48, 63, 159, intensity);
    ellipse(node.x, node.y, nodeR * 2 - 4, nodeR * 2 - 4);

    // Name label
    fill(INDIGO);
    noStroke();
    textSize(constrain(canvasWidth * 0.015, 7, 10));
    textStyle(BOLD);
    textAlign(CENTER, TOP);
    // Abbreviate name: first name only for small canvas
    let displayName = node.name;
    if (colW < 150) {
      displayName = node.name.split(' ')[0];
    }
    text(displayName, node.x, node.y + nodeR + 3);
    textStyle(NORMAL);

    // Canonical ID below name
    fill('#777');
    textSize(constrain(canvasWidth * 0.012, 6, 8));
    text(node.id, node.x, node.y + nodeR + 15);

    // Edge count badge
    if (node.edgeCount > 0) {
      fill(AMBER);
      noStroke();
      let badgeR = 8;
      ellipse(node.x + nodeR - 2, node.y - nodeR + 2, badgeR * 2, badgeR * 2);
      fill(255);
      textSize(8);
      textStyle(BOLD);
      textAlign(CENTER, CENTER);
      text(node.edgeCount, node.x + nodeR - 2, node.y - nodeR + 2);
      textStyle(NORMAL);
    }
  }

  // "New node" indicator for nodes added during this session
  // (Raj Kumar node appears when his events are added)
}

function drawMetrics() {
  let metricsY = drawHeight - 52;
  let metricsH = 48;

  // Metrics background
  fill(255, 255, 255, 220);
  stroke('#ddd');
  strokeWeight(1);
  rect(margin, metricsY, canvasWidth - margin * 2, metricsH, 6);

  let uniquePersons = Object.keys(graphNodes).length;
  let metrics = [
    { label: 'Processed', value: totalProcessed, color: INDIGO },
    { label: 'Unique', value: uniquePersons, color: '#2E7D32' },
    { label: 'Duplicates', value: duplicatesCaught, color: AMBER },
    { label: 'Unresolved', value: unresolvedCount, color: '#C62828' }
  ];

  let metricW = (canvasWidth - margin * 2) / metrics.length;
  for (let i = 0; i < metrics.length; i++) {
    let mx = margin + i * metricW;
    let m = metrics[i];

    // Value
    fill(m.color);
    noStroke();
    textSize(constrain(canvasWidth * 0.03, 14, 20));
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(m.value, mx + metricW / 2, metricsY + 15);

    // Label
    textStyle(NORMAL);
    fill('#666');
    textSize(constrain(canvasWidth * 0.016, 8, 10));
    text(m.label, mx + metricW / 2, metricsY + 34);
  }
}

function drawButtons() {
  let btnY = drawHeight + 8;
  let btnH = 30;
  let totalBtns = buttons.length;
  let btnGap = 6;
  let totalGaps = (totalBtns - 1) * btnGap;
  let btnW = (canvasWidth - margin * 2 - totalGaps) / totalBtns;

  textSize(constrain(canvasWidth * 0.02, 9, 12));

  for (let i = 0; i < totalBtns; i++) {
    let btn = buttons[i];
    let bx = margin + i * (btnW + btnGap);
    let by = btnY;

    // Store bounds for click detection
    btn.x = bx;
    btn.y = by;
    btn.w = btnW;
    btn.h = btnH;

    // Hover check
    let isHovered = mouseX > bx && mouseX < bx + btnW &&
                    mouseY > by && mouseY < by + btnH;

    // Button background
    if (isHovered) {
      fill(btn.color);
      stroke(btn.color);
    } else {
      fill(255);
      stroke(btn.color);
    }
    strokeWeight(2);
    rect(bx, by, btnW, btnH, 6);

    // Button label
    noStroke();
    fill(isHovered ? 255 : btn.color);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    text(btn.label, bx + btnW / 2, by + btnH / 2);
    textStyle(NORMAL);
  }
}

// ---- Interaction ----

function mousePressed() {
  // Check button clicks
  for (let btn of buttons) {
    if (btn.x !== undefined &&
        mouseX > btn.x && mouseX < btn.x + btn.w &&
        mouseY > btn.y && mouseY < btn.y + btn.h) {
      btn.action();
      return;
    }
  }

  // Check table scroll area clicks
  let colX = getColX(1);
  let colW = getColW(1);
  let startY = 42;
  let tableTop = startY + 20;
  let tableBottom = startY + 20 + maxVisibleTableRows * 22;

  if (mouseX > colX && mouseX < colX + colW) {
    // Click in upper portion = scroll up
    if (mouseY > tableTop && mouseY < tableTop + 30 && tableScrollOffset > 0) {
      tableScrollOffset = max(0, tableScrollOffset - 1);
    }
    // Click in lower portion = scroll down
    if (mouseY > tableBottom - 30 && mouseY < tableBottom &&
        tableScrollOffset + maxVisibleTableRows < identityTable.length) {
      tableScrollOffset = min(identityTable.length - maxVisibleTableRows, tableScrollOffset + 1);
    }
  }
}

function mouseWheel(event) {
  // Allow scrolling the identity table
  let colX = getColX(1);
  let colW = getColW(1);
  let startY = 42;
  let tableBottom = startY + 20 + maxVisibleTableRows * 22;

  if (mouseX > colX && mouseX < colX + colW &&
      mouseY > startY && mouseY < tableBottom) {
    if (event.delta > 0) {
      tableScrollOffset = min(identityTable.length - maxVisibleTableRows, tableScrollOffset + 1);
    } else {
      tableScrollOffset = max(0, tableScrollOffset - 1);
    }
    return false; // prevent page scroll
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
