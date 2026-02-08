// ETL Event-to-Graph Transform MicroSim
// Demonstrates how a single raw event record is decomposed into
// multiple graph elements (nodes and edges) during ETL transformation.

// ============================================================
// Layout Constants
// ============================================================
let canvasWidth = 400;
let drawHeight = 450;
let controlHeight = 50;
let canvasHeight = drawHeight + controlHeight;
let margin = 20;
let defaultTextSize = 14;

// Aria color scheme
const INDIGO = '#303F9F';
const INDIGO_DARK = '#1A237E';
const INDIGO_LIGHT = '#5C6BC0';
const AMBER = '#D4880F';
const AMBER_LIGHT = '#F5C14B';
const CHAMPAGNE = '#FFF8E7';
const GOLD = '#FFD700';
const LIGHT_GRAY = '#F0F0F0';

// ============================================================
// Event Type Data
// ============================================================
const eventTypes = ['Email', 'Chat', 'Calendar'];
let currentEventTypeIndex = 0;

// Each event type defines the raw fields, the sender, recipients,
// and the edge label used in the graph output.
const eventData = {
  Email: {
    type: 'email',
    sender: 'maria.chen@acme.com',
    senderShort: 'Maria',
    recipients: ['james.park@acme.com', 'aisha.patel@acme.com'],
    recipientShorts: ['James', 'Aisha'],
    timestamp: '2026-02-08T09:14:32Z',
    extra: { label: 'subject_hash', value: 'a3f7c2e1' },
    edgeLabel: 'EMAILED'
  },
  Chat: {
    type: 'chat_message',
    sender: 'maria.chen@acme.com',
    senderShort: 'Maria',
    recipients: ['james.park@acme.com', 'aisha.patel@acme.com'],
    recipientShorts: ['James', 'Aisha'],
    timestamp: '2026-02-08T10:22:05Z',
    extra: { label: 'channel', value: '#proj-alpha' },
    edgeLabel: 'MESSAGED'
  },
  Calendar: {
    type: 'calendar_invite',
    sender: 'maria.chen@acme.com',
    senderShort: 'Maria',
    recipients: ['james.park@acme.com', 'aisha.patel@acme.com'],
    recipientShorts: ['James', 'Aisha'],
    timestamp: '2026-02-08T14:00:00Z',
    extra: { label: 'meeting_id', value: 'mtg-8842' },
    edgeLabel: 'INVITED'
  }
};

// ============================================================
// Step Definitions (6 steps)
// ============================================================
// Step 0: Highlight sender field   -> create sender node
// Step 1: Highlight recipients     -> create recipient 1 node
// Step 2: (continued)              -> create recipient 2 node
// Step 3: Highlight edge rule      -> create edge 1
// Step 4: (continued)              -> create edge 2
// Step 5: All done — full graph visible
let currentStep = -1; // -1 means initial state, nothing highlighted
const MAX_STEP = 5;

// ============================================================
// Animation
// ============================================================
let highlightAlpha = 0;       // pulsing highlight for newly added elements
let highlightTimer = 0;
const HIGHLIGHT_DURATION = 30; // frames

// ============================================================
// Button Geometry (computed in draw)
// ============================================================
let stepBtn = { x: 0, y: 0, w: 0, h: 0 };
let resetBtn = { x: 0, y: 0, w: 0, h: 0 };
let typeBtn = { x: 0, y: 0, w: 0, h: 0 };

// ============================================================
// p5.js Lifecycle
// ============================================================
function setup() {
  updateCanvasSize();
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent(document.querySelector('main'));
  textFont('Arial');
  describe(
    'An interactive ETL visualization showing how a raw event record ' +
    'is decomposed into graph nodes and edges step by step.',
    LABEL
  );
}

function draw() {
  updateCanvasSize();

  // Advance highlight timer
  if (highlightTimer > 0) {
    highlightTimer--;
    highlightAlpha = map(highlightTimer, HIGHLIGHT_DURATION, 0, 255, 0);
  } else {
    highlightAlpha = 0;
  }

  // ----------------------------------------------------------
  // Draw area background
  // ----------------------------------------------------------
  noStroke();
  fill(CHAMPAGNE);
  rect(0, 0, canvasWidth, drawHeight);

  // Thin border around draw area
  noFill();
  stroke('#CCCCCC');
  strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);

  // ----------------------------------------------------------
  // Control area background
  // ----------------------------------------------------------
  noStroke();
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);
  stroke('#CCCCCC');
  noFill();
  rect(0, drawHeight, canvasWidth, controlHeight);

  // ----------------------------------------------------------
  // Compute stage widths (three equal columns)
  // ----------------------------------------------------------
  let stageW = (canvasWidth - margin * 2) / 3;
  let stageX1 = margin;                    // Raw Event
  let stageX2 = margin + stageW;           // Transform Rules
  let stageX3 = margin + stageW * 2;       // Graph Elements
  let stageTop = 40;
  let stageBottom = drawHeight - 20;

  // ----------------------------------------------------------
  // Stage headers
  // ----------------------------------------------------------
  drawStageHeader('1. Raw Event', stageX1, stageW);
  drawStageHeader('2. Transform Rules', stageX2, stageW);
  drawStageHeader('3. Graph Elements', stageX3, stageW);

  // ----------------------------------------------------------
  // Flow arrows between stages
  // ----------------------------------------------------------
  drawFlowArrow(stageX1 + stageW - 6, drawHeight / 2, stageX2 + 6, drawHeight / 2);
  drawFlowArrow(stageX2 + stageW - 6, drawHeight / 2, stageX3 + 6, drawHeight / 2);

  // ----------------------------------------------------------
  // Stage 1: Raw Event Card
  // ----------------------------------------------------------
  let evt = eventData[eventTypes[currentEventTypeIndex]];
  drawRawEventCard(evt, stageX1 + 8, stageTop + 20, stageW - 16);

  // ----------------------------------------------------------
  // Stage 2: Transform Rule Cards
  // ----------------------------------------------------------
  drawTransformRules(evt, stageX2 + 8, stageTop + 20, stageW - 16);

  // ----------------------------------------------------------
  // Stage 3: Graph Elements
  // ----------------------------------------------------------
  drawGraphElements(evt, stageX3 + 8, stageTop + 20, stageW - 16);

  // ----------------------------------------------------------
  // Controls
  // ----------------------------------------------------------
  drawControls();
}

// ============================================================
// Stage Headers
// ============================================================
function drawStageHeader(label, x, w) {
  push();
  noStroke();
  fill(INDIGO);
  textSize(13);
  textAlign(CENTER, TOP);
  textStyle(BOLD);
  text(label, x + w / 2, 10);
  pop();
}

// ============================================================
// Flow Arrows
// ============================================================
function drawFlowArrow(x1, y1, x2, y2) {
  push();
  stroke(INDIGO_LIGHT);
  strokeWeight(2);
  let headLen = 8;
  line(x1, y1, x2 - headLen, y2);
  // arrowhead
  fill(INDIGO_LIGHT);
  noStroke();
  triangle(
    x2, y2,
    x2 - headLen, y2 - headLen / 2,
    x2 - headLen, y2 + headLen / 2
  );
  pop();
}

// ============================================================
// Stage 1: Raw Event Card
// ============================================================
function drawRawEventCard(evt, x, y, w) {
  push();
  let cardH = 300;
  let pad = 10;
  let lineH = 22;

  // Card background
  fill(LIGHT_GRAY);
  stroke(INDIGO);
  strokeWeight(2);
  rect(x, y, w, cardH, 8);

  // Title bar
  fill(INDIGO);
  noStroke();
  rect(x, y, w, 28, 8, 8, 0, 0);
  fill('white');
  textSize(12);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  text(evt.type.toUpperCase() + ' EVENT', x + w / 2, y + 14);

  // JSON-like fields
  textAlign(LEFT, TOP);
  textStyle(NORMAL);
  textSize(11);
  let fieldY = y + 36;

  // Helper to draw a highlighted or normal field
  function drawField(label, value, isHighlighted) {
    if (isHighlighted) {
      noStroke();
      fill(AMBER_LIGHT + '80'); // semi-transparent amber
      rect(x + 2, fieldY - 2, w - 4, lineH, 3);
    }
    fill(INDIGO_DARK);
    textStyle(BOLD);
    text(label + ':', x + pad, fieldY);
    textStyle(NORMAL);
    fill('#333333');
    // Truncate long values
    let displayVal = value;
    if (textWidth(displayVal) > w - pad * 2 - textWidth(label + ': ')) {
      while (textWidth(displayVal + '...') > w - pad * 2 - textWidth(label + ': ') && displayVal.length > 0) {
        displayVal = displayVal.slice(0, -1);
      }
      displayVal += '...';
    }
    text(displayVal, x + pad + textWidth(label + ': '), fieldY);
    fieldY += lineH;
  }

  // Determine which fields to highlight based on step
  let hlSender = (currentStep === 0);
  let hlRecipients = (currentStep === 1 || currentStep === 2);
  let hlEdge = (currentStep === 3 || currentStep === 4);

  drawField('type', '"' + evt.type + '"', false);
  drawField('sender', '"' + evt.sender + '"', hlSender);
  drawField('recipients', '[', hlRecipients);

  // Indent recipients
  let savedX = x;
  for (let i = 0; i < evt.recipients.length; i++) {
    fill('#333333');
    textStyle(NORMAL);
    let rText = '  "' + evt.recipients[i] + '"' + (i < evt.recipients.length - 1 ? ',' : '');
    if (hlRecipients) {
      noStroke();
      fill(AMBER_LIGHT + '80');
      rect(x + 2, fieldY - 2, w - 4, lineH, 3);
    }
    fill('#333333');
    text(rText, x + pad + 10, fieldY);
    fieldY += lineH;
  }

  fill('#333333');
  textStyle(NORMAL);
  text(']', x + pad, fieldY);
  fieldY += lineH;

  drawField('timestamp', '"' + evt.timestamp + '"', false);
  drawField(evt.extra.label, '"' + evt.extra.value + '"', false);

  pop();
}

// ============================================================
// Stage 2: Transform Rule Cards
// ============================================================
function drawTransformRules(evt, x, y, w) {
  push();
  let ruleH = 75;
  let gap = 16;
  let rules = [
    { title: 'Rule 1: Sender Node', desc: 'Sender → Node (MERGE)', activeSteps: [0] },
    { title: 'Rule 2: Recipient Nodes', desc: 'Each Recipient → Node (MERGE)', activeSteps: [1, 2] },
    { title: 'Rule 3: Edges', desc: 'Sender + Recipient → Edge (CREATE)', activeSteps: [3, 4] }
  ];

  for (let i = 0; i < rules.length; i++) {
    let ry = y + i * (ruleH + gap);
    let isActive = rules[i].activeSteps.includes(currentStep);

    // Card background
    if (isActive) {
      fill(GOLD + '40');
      stroke(AMBER);
      strokeWeight(3);
    } else {
      fill(CHAMPAGNE);
      stroke(INDIGO_LIGHT);
      strokeWeight(1);
    }
    rect(x, ry, w, ruleH, 6);

    // Title
    noStroke();
    fill(INDIGO_DARK);
    textSize(12);
    textStyle(BOLD);
    textAlign(LEFT, TOP);
    text(rules[i].title, x + 10, ry + 10);

    // Description
    fill(INDIGO);
    textSize(11);
    textStyle(NORMAL);
    text(rules[i].desc, x + 10, ry + 30);

    // Show edge label for rule 3
    if (i === 2) {
      fill(INDIGO_LIGHT);
      textSize(10);
      text('label: ' + evt.edgeLabel, x + 10, ry + 50);
    }

    // Active indicator
    if (isActive && highlightTimer > 0) {
      noFill();
      stroke(AMBER);
      strokeWeight(2);
      let a = map(highlightAlpha, 0, 255, 0, 1);
      drawingContext.globalAlpha = a;
      rect(x - 2, ry - 2, w + 4, ruleH + 4, 8);
      drawingContext.globalAlpha = 1.0;
    }
  }
  pop();
}

// ============================================================
// Stage 3: Graph Elements
// ============================================================
function drawGraphElements(evt, x, y, w) {
  push();
  let centerX = x + w / 2;
  let centerY = y + 150;
  let nodeR = 28;
  let spreadX = w * 0.35;
  let spreadY = 100;

  // Node positions
  let senderPos = { x: centerX, y: centerY - spreadY };
  let recip1Pos = { x: centerX - spreadX, y: centerY + spreadY * 0.6 };
  let recip2Pos = { x: centerX + spreadX, y: centerY + spreadY * 0.6 };

  // Determine what is visible based on step
  let showSender = currentStep >= 0;
  let showRecip1 = currentStep >= 1;
  let showRecip2 = currentStep >= 2;
  let showEdge1 = currentStep >= 3;
  let showEdge2 = currentStep >= 4;

  // Draw "Graph Output" label area
  noStroke();
  fill(INDIGO);
  textSize(11);
  textAlign(CENTER, TOP);
  textStyle(ITALIC);
  text(showSender ? 'Nodes: ' + countVisible() + '  Edges: ' + countEdges() : 'Awaiting transform...', x + w / 2, y);

  // Draw edges first (behind nodes)
  if (showEdge1) {
    drawEdge(senderPos, recip1Pos, evt.edgeLabel, currentStep === 3);
  }
  if (showEdge2) {
    drawEdge(senderPos, recip2Pos, evt.edgeLabel, currentStep === 4);
  }

  // Draw nodes
  if (showSender) {
    drawNode(senderPos.x, senderPos.y, nodeR, evt.senderShort, currentStep === 0);
  }
  if (showRecip1) {
    drawNode(recip1Pos.x, recip1Pos.y, nodeR, evt.recipientShorts[0], currentStep === 1);
  }
  if (showRecip2) {
    drawNode(recip2Pos.x, recip2Pos.y, nodeR, evt.recipientShorts[1], currentStep === 2);
  }

  // Step 5: draw a completion badge
  if (currentStep >= MAX_STEP) {
    fill(INDIGO);
    textSize(12);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    noStroke();

    // Badge background
    fill(GOLD + 'CC');
    rect(x + w / 2 - 55, centerY + spreadY + 40, 110, 28, 14);
    fill(INDIGO_DARK);
    textSize(11);
    text('Transform Complete', x + w / 2, centerY + spreadY + 54);
  }

  pop();

  function countVisible() {
    let c = 0;
    if (showSender) c++;
    if (showRecip1) c++;
    if (showRecip2) c++;
    return c;
  }

  function countEdges() {
    let c = 0;
    if (showEdge1) c++;
    if (showEdge2) c++;
    return c;
  }
}

// ============================================================
// Draw a single graph node (amber circle with label)
// ============================================================
function drawNode(nx, ny, r, label, isNew) {
  push();
  // Glow effect for newly added node
  if (isNew && highlightTimer > 0) {
    noStroke();
    let a = map(highlightAlpha, 0, 255, 0, 0.4);
    drawingContext.globalAlpha = a;
    fill(GOLD);
    ellipse(nx, ny, r * 3, r * 3);
    drawingContext.globalAlpha = 1.0;
  }

  // Node circle
  fill(AMBER);
  stroke(INDIGO_DARK);
  strokeWeight(2);
  ellipse(nx, ny, r * 2, r * 2);

  // Label
  noStroke();
  fill('white');
  textSize(12);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  text(label, nx, ny);

  // "Person" type label below
  fill(INDIGO);
  textSize(9);
  textStyle(NORMAL);
  text(':Person', nx, ny + r + 10);
  pop();
}

// ============================================================
// Draw a directed edge (indigo arrow with label)
// ============================================================
function drawEdge(from, to, label, isNew) {
  push();
  // Calculate direction vector
  let dx = to.x - from.x;
  let dy = to.y - from.y;
  let dist = sqrt(dx * dx + dy * dy);
  let nx = dx / dist;
  let ny = dy / dist;

  // Offset start and end by node radius (28)
  let r = 28;
  let sx = from.x + nx * r;
  let sy = from.y + ny * r;
  let ex = to.x - nx * r;
  let ey = to.y - ny * r;

  // Glow for new edge
  if (isNew && highlightTimer > 0) {
    let a = map(highlightAlpha, 0, 255, 0, 0.6);
    drawingContext.globalAlpha = a;
    stroke(GOLD);
    strokeWeight(6);
    line(sx, sy, ex, ey);
    drawingContext.globalAlpha = 1.0;
  }

  // Edge line
  stroke(INDIGO);
  strokeWeight(2);
  line(sx, sy, ex, ey);

  // Arrowhead
  let headLen = 10;
  let angle = atan2(ey - sy, ex - sx);
  fill(INDIGO);
  noStroke();
  triangle(
    ex, ey,
    ex - headLen * cos(angle - PI / 6), ey - headLen * sin(angle - PI / 6),
    ex - headLen * cos(angle + PI / 6), ey - headLen * sin(angle + PI / 6)
  );

  // Edge label at midpoint
  let mx = (sx + ex) / 2;
  let my = (sy + ey) / 2;
  // Offset label slightly perpendicular to edge
  let perpX = -ny * 12;
  let perpY = nx * 12;
  noStroke();
  // Label background
  fill(CHAMPAGNE + 'DD');
  rectMode(CENTER);
  let tw = textWidth(label) + 12;
  rect(mx + perpX, my + perpY, tw, 16, 3);
  rectMode(CORNER);
  // Label text
  fill(INDIGO_DARK);
  textSize(10);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  text(label, mx + perpX, my + perpY);

  pop();
}

// ============================================================
// Canvas-Based Controls
// ============================================================
function drawControls() {
  push();
  let btnH = 32;
  let btnY = drawHeight + (controlHeight - btnH) / 2;
  let gap = 12;

  // Step button
  let stepW = 80;
  let stepX = margin;
  stepBtn = { x: stepX, y: btnY, w: stepW, h: btnH };
  drawButton(stepX, btnY, stepW, btnH, currentStep >= MAX_STEP ? 'Done' : 'Step (' + (currentStep + 2) + '/6)', INDIGO, currentStep >= MAX_STEP);

  // Reset button
  let resetW = 70;
  let resetX = stepX + stepW + gap;
  resetBtn = { x: resetX, y: btnY, w: resetW, h: btnH };
  drawButton(resetX, btnY, resetW, btnH, 'Reset', '#666666', false);

  // Event Type toggle button (right side)
  let typeLbl = 'Event: ' + eventTypes[currentEventTypeIndex];
  textSize(12);
  let typeW = textWidth(typeLbl) + 24;
  let typeX = canvasWidth - margin - typeW;
  typeBtn = { x: typeX, y: btnY, w: typeW, h: btnH };
  drawButton(typeX, btnY, typeW, btnH, typeLbl, INDIGO_LIGHT, false);

  pop();
}

function drawButton(bx, by, bw, bh, label, col, disabled) {
  push();
  if (disabled) {
    fill('#AAAAAA');
  } else {
    fill(col);
  }
  noStroke();
  rect(bx, by, bw, bh, 6);

  fill('white');
  textSize(12);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  text(label, bx + bw / 2, by + bh / 2);
  pop();
}

// ============================================================
// Interaction
// ============================================================
function mousePressed() {
  // Step button
  if (insideButton(stepBtn) && currentStep < MAX_STEP) {
    currentStep++;
    highlightTimer = HIGHLIGHT_DURATION;
  }

  // Reset button
  if (insideButton(resetBtn)) {
    currentStep = -1;
    highlightTimer = 0;
  }

  // Event Type toggle
  if (insideButton(typeBtn)) {
    currentEventTypeIndex = (currentEventTypeIndex + 1) % eventTypes.length;
    currentStep = -1;
    highlightTimer = 0;
  }
}

function insideButton(btn) {
  return mouseX >= btn.x && mouseX <= btn.x + btn.w &&
         mouseY >= btn.y && mouseY <= btn.y + btn.h;
}

// ============================================================
// Responsive Canvas
// ============================================================
function windowResized() {
  updateCanvasSize();
  resizeCanvas(canvasWidth, canvasHeight);
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  canvasWidth = Math.floor(container.width);
}
