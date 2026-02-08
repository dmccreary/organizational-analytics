// Data Ingestion Pipeline Architecture MicroSim
// Visualizes the end-to-end data ingestion pipeline from source systems
// through staging, ETL, quality gates, and graph database loading.
// Canvas-based controls only (no DOM elements).
// MicroSim template version 2026.02

// ============================================================
// Layout constants
// ============================================================
let canvasWidth = 400;
let drawHeight = 500;
let controlHeight = 50;
let canvasHeight = drawHeight + controlHeight;
let margin = 20;
let defaultTextSize = 16;

// Aria color scheme
const INDIGO       = '#303F9F';
const INDIGO_DARK  = '#1A237E';
const INDIGO_LIGHT = '#5C6BC0';
const AMBER        = '#D4880F';
const AMBER_DARK   = '#B06D0B';
const AMBER_LIGHT  = '#F5C14B';
const GOLD         = '#FFD700';
const CHAMPAGNE    = '#FFF8E7';

// ============================================================
// Pipeline stage definitions
// ============================================================
// Each stage stores its label, color, description, and a set of
// detail items that are shown when the user clicks the stage.
let pipelineStages = [
  {
    label: 'Source\nSystems',
    color: '#757575',
    items: ['Email Server', 'Chat Platform', 'Calendar', 'HRIS'],
    description: 'Raw organizational data originates from multiple source systems. Each produces events in its own format and cadence.',
    details: [
      'Email Server - SMTP/IMAP events',
      'Chat Platform - Real-time messages',
      'Calendar - Meeting & schedule events',
      'HRIS - Employee lifecycle records'
    ]
  },
  {
    label: 'Staging\nArea',
    color: INDIGO_LIGHT,
    subtitle: 'Buffer, Decouple, Inspect',
    pendingCount: 12847,
    description: 'A buffer zone that decouples source systems from downstream processing. Records are inspected and queued for ETL.',
    details: [
      'Buffers incoming events',
      'Decouples producers from consumers',
      'Inspects record format & size',
      'Pending: 12,847 records'
    ]
  },
  {
    label: 'ETL\nEngine',
    color: AMBER,
    subSteps: ['Extract', 'Transform', 'Load'],
    description: 'The ETL engine extracts data from staging, transforms it into the target schema, and loads it for quality checks.',
    details: [
      'Extract: Pull from staging queue',
      'Transform: Map fields, normalize',
      'Load: Write to quality gate input',
      'Throughput: ~2,400 records/min'
    ]
  },
  {
    label: 'Quality\nGate',
    color: '#2E7D32',
    checks: ['Schema Validation', 'Deduplication', 'Referential Integrity'],
    description: 'Every record must pass three quality checks before entering the graph database. Failed records are quarantined.',
    details: [
      'Schema Validation - field types & required',
      'Deduplication - hash-based duplicate check',
      'Referential Integrity - FK lookups',
      'Pass rate: ~97.2%'
    ]
  },
  {
    label: 'Graph\nDatabase',
    color: INDIGO,
    nodeCount: 52341,
    edgeCount: 847229,
    description: 'The labeled property graph stores organizational entities as nodes and their interactions as edges with rich properties.',
    details: [
      'Nodes: 52,341 (Person, Dept, Event)',
      'Edges: 847,229 (relationships)',
      'Index-free adjacency traversal',
      'Cypher query interface'
    ]
  }
];

// Dead Letter Queue (below main flow, connected from Quality Gate)
let dlq = {
  label: 'Dead Letter Queue',
  color: '#C62828',
  quarantined: 361,
  description: 'Records that fail quality checks are quarantined here for manual review and reprocessing.',
  details: [
    'Quarantined: 361 records',
    'Schema failures: 142',
    'Duplicates: 187',
    'Ref integrity failures: 32'
  ]
};

// ============================================================
// Animation state
// ============================================================
let isAnimating = false;
let flowDots = [];           // animated dots on the main pipeline
let nextSpawnFrame = 0;
let spawnInterval = 30;      // frames between spawns
let eventsProcessed = 0;
let dotsFailed = 0;
let failChance = 0.03;       // 3 % chance a dot fails at quality gate

// Mode: 'batch' or 'stream'
let pipelineMode = 'batch';

// ============================================================
// Interaction state
// ============================================================
let expandedStage = -1;      // -1 = none, 0-4 = stage index, 5 = DLQ
let tooltipAlpha = 0;        // fade-in for tooltip panel

// ============================================================
// Canvas-based button definitions
// ============================================================
// We define buttons as simple rectangles checked in mousePressed().
let buttons = {};  // populated in draw based on current canvasWidth

// ============================================================
// p5.js lifecycle
// ============================================================

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent(document.querySelector('main'));
  textFont('Arial');
  describe(
    'Interactive data ingestion pipeline diagram showing source systems, ' +
    'staging area, ETL engine, quality gate, graph database, and dead letter queue. ' +
    'Animated dots flow through the pipeline when the Animate button is pressed.',
    LABEL
  );
}

function draw() {
  updateCanvasSize();

  // ---- backgrounds ----
  noStroke();
  fill(CHAMPAGNE);
  rect(0, 0, canvasWidth, drawHeight);

  fill('white');
  stroke('silver');
  strokeWeight(1);
  rect(0, drawHeight, canvasWidth, controlHeight);

  // ---- title ----
  noStroke();
  fill(INDIGO_DARK);
  textAlign(CENTER, TOP);
  textSize(17);
  textStyle(BOLD);
  text('Data Ingestion Pipeline Architecture', canvasWidth / 2, 6);
  textStyle(NORMAL);

  // ---- compute stage layout ----
  // 5 stages laid out left to right with arrows between them.
  let stageCount = pipelineStages.length;
  let arrowW = 18;
  let totalArrowW = (stageCount - 1) * arrowW;
  let availW = canvasWidth - margin * 2 - totalArrowW;
  let stageW = availW / stageCount;
  let stageH = 88;
  let stageY = 32;

  // ---- draw connecting arrows (main flow) ----
  for (let i = 0; i < stageCount - 1; i++) {
    let x1 = margin + (i + 1) * stageW + i * arrowW;
    let x2 = x1 + arrowW;
    let ay = stageY + stageH / 2;
    stroke('#999');
    strokeWeight(2);
    line(x1, ay, x2 - 4, ay);
    fill('#999');
    noStroke();
    triangle(x2 - 4, ay - 5, x2 - 4, ay + 5, x2, ay);
  }

  // ---- draw each stage box ----
  for (let i = 0; i < stageCount; i++) {
    let sx = margin + i * (stageW + arrowW);
    let sy = stageY;
    let st = pipelineStages[i];
    let isHovered = mouseX > sx && mouseX < sx + stageW &&
                    mouseY > sy && mouseY < sy + stageH;
    let isExpanded = expandedStage === i;

    drawStageBox(sx, sy, stageW, stageH, st, i, isHovered, isExpanded);
  }

  // ---- Dead Letter Queue (below quality gate, stage index 3) ----
  let dlqW = stageW * 1.3;
  let dlqH = 60;
  let qgX = margin + 3 * (stageW + arrowW);  // quality gate x
  let dlqX = qgX + stageW / 2 - dlqW / 2;
  let dlqY = stageY + stageH + 70;

  // Red arrow from quality gate down to DLQ
  let arrowStartX = qgX + stageW / 2;
  let arrowStartY = stageY + stageH;
  let arrowEndY = dlqY;
  stroke(dlq.color);
  strokeWeight(2);
  line(arrowStartX, arrowStartY + 2, arrowStartX, arrowEndY - 2);
  fill(dlq.color);
  noStroke();
  triangle(arrowStartX - 5, arrowEndY - 6, arrowStartX + 5, arrowEndY - 6, arrowStartX, arrowEndY);

  // "Failed" label on the red arrow
  noStroke();
  fill(dlq.color);
  textSize(10);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text('Failed', arrowStartX + 6, (arrowStartY + arrowEndY) / 2);
  textStyle(NORMAL);

  // DLQ box
  let dlqHovered = mouseX > dlqX && mouseX < dlqX + dlqW &&
                   mouseY > dlqY && mouseY < dlqY + dlqH;
  let dlqExpanded = expandedStage === 5;

  stroke(dlq.color);
  strokeWeight(dlqHovered || dlqExpanded ? 3 : 2);
  fill(dlqHovered ? '#FFEBEE' : '#FFF5F5');
  rect(dlqX, dlqY, dlqW, dlqH, 8);

  noStroke();
  fill(dlq.color);
  textAlign(CENTER, TOP);
  textSize(11);
  textStyle(BOLD);
  text('Dead Letter Queue', dlqX + dlqW / 2, dlqY + 8);
  textStyle(NORMAL);
  textSize(10);
  fill('#555');
  text('Quarantined: ' + (dlq.quarantined + dotsFailed), dlqX + dlqW / 2, dlqY + 24);
  textSize(9);
  fill('#888');
  text('Click for details', dlqX + dlqW / 2, dlqY + 40);

  // ---- expanded detail panel ----
  if (expandedStage >= 0) {
    drawDetailPanel(stageW, stageH, stageY, arrowW, dlqX, dlqY, dlqW, dlqH);
  }

  // ---- animation: flow dots ----
  if (isAnimating) {
    updateAndDrawDots(stageW, stageH, stageY, arrowW, dlqX, dlqY, dlqW, dlqH);
  } else if (flowDots.length > 0) {
    // still draw remaining dots even when paused
    drawDotsOnly(stageW, stageH, stageY, arrowW, dlqX, dlqY, dlqW, dlqH);
  }

  // ---- events processed counter ----
  noStroke();
  fill(INDIGO);
  textSize(12);
  textStyle(BOLD);
  textAlign(CENTER, BOTTOM);
  text('Loaded: ' + eventsProcessed + '  |  Quarantined: ' + dotsFailed, canvasWidth / 2, drawHeight - 6);
  textStyle(NORMAL);

  // ---- instruction text ----
  noStroke();
  fill('#888');
  textSize(10);
  textAlign(CENTER, BOTTOM);
  text('Click any stage for details', canvasWidth / 2, drawHeight - 20);

  // ---- draw canvas-based control buttons ----
  drawControls();
}

// ============================================================
// Draw a single pipeline stage box
// ============================================================
function drawStageBox(sx, sy, sw, sh, stage, index, isHovered, isExpanded) {
  // Box
  stroke(stage.color);
  strokeWeight(isHovered || isExpanded ? 3 : 2);
  let bgCol = isHovered
    ? lerpColor(color(stage.color), color(255), 0.85)
    : color(255);
  fill(bgCol);
  rect(sx, sy, sw, sh, 8);

  noStroke();
  textAlign(CENTER, CENTER);

  // Stage-specific content
  if (index === 0) {
    // Source Systems: show 4 sub-boxes
    drawSourceSystems(sx, sy, sw, sh, stage);
  } else if (index === 1) {
    // Staging Area
    drawStagingArea(sx, sy, sw, sh, stage);
  } else if (index === 2) {
    // ETL Engine
    drawETLEngine(sx, sy, sw, sh, stage);
  } else if (index === 3) {
    // Quality Gate
    drawQualityGate(sx, sy, sw, sh, stage);
  } else if (index === 4) {
    // Graph Database
    drawGraphDB(sx, sy, sw, sh, stage);
  }
}

// ---- Stage 0: Source Systems ----
function drawSourceSystems(sx, sy, sw, sh, stage) {
  // Title
  fill(stage.color);
  textSize(sw > 90 ? 10 : 8);
  textStyle(BOLD);
  textAlign(CENTER, TOP);
  text('Source Systems', sx + sw / 2, sy + 4);
  textStyle(NORMAL);

  // 4 mini source boxes
  let boxW = sw - 10;
  let boxH = 13;
  let startY = sy + 20;
  let colors = ['#78909C', '#78909C', '#78909C', '#78909C'];
  let labels = stage.items;

  for (let j = 0; j < labels.length; j++) {
    let by = startY + j * (boxH + 3);
    fill('#ECEFF1');
    stroke('#B0BEC5');
    strokeWeight(1);
    rect(sx + 5, by, boxW, boxH, 3);

    noStroke();
    fill('#455A64');
    textSize(sw > 90 ? 9 : 7);
    textAlign(CENTER, CENTER);
    text(labels[j], sx + sw / 2, by + boxH / 2);
  }
}

// ---- Stage 1: Staging Area ----
function drawStagingArea(sx, sy, sw, sh, stage) {
  fill(INDIGO_LIGHT);
  noStroke();
  // Light indigo tint inside
  fill(230, 233, 255, 100);
  noStroke();
  rect(sx + 3, sy + 3, sw - 6, sh - 6, 6);

  fill(stage.color);
  textSize(sw > 90 ? 10 : 8);
  textStyle(BOLD);
  textAlign(CENTER, TOP);
  text('Staging Area', sx + sw / 2, sy + 6);
  textStyle(NORMAL);

  // Pending counter
  textSize(sw > 90 ? 12 : 9);
  fill(INDIGO_DARK);
  textStyle(BOLD);
  text('Pending: 12,847', sx + sw / 2, sy + 28);
  textStyle(NORMAL);

  // Subtitle
  textSize(sw > 90 ? 8 : 7);
  fill('#666');
  text(stage.subtitle, sx + sw / 2, sy + 50);

  // Small buffer icon
  fill(INDIGO_LIGHT);
  noStroke();
  textSize(16);
  text('\u2630', sx + sw / 2, sy + sh - 14); // trigram for buffer
}

// ---- Stage 2: ETL Engine ----
function drawETLEngine(sx, sy, sw, sh, stage) {
  fill(AMBER);
  textSize(sw > 90 ? 10 : 8);
  textStyle(BOLD);
  textAlign(CENTER, TOP);
  noStroke();
  text('ETL Engine', sx + sw / 2, sy + 4);
  textStyle(NORMAL);

  // Three sub-steps: Extract -> Transform -> Load
  let subW = (sw - 16) / 3;
  let subH = 22;
  let subY = sy + 25;
  let labels = stage.subSteps;
  let subColors = [AMBER_LIGHT, AMBER, AMBER_DARK];

  for (let j = 0; j < 3; j++) {
    let bx = sx + 4 + j * (subW + 2);
    fill(subColors[j]);
    stroke(AMBER_DARK);
    strokeWeight(1);
    rect(bx, subY, subW, subH, 4);

    noStroke();
    fill(j === 0 ? '#333' : 'white');
    textSize(subW > 30 ? 8 : 6);
    textAlign(CENTER, CENTER);
    text(labels[j], bx + subW / 2, subY + subH / 2);

    // Tiny arrow between sub-steps
    if (j < 2) {
      fill('#999');
      noStroke();
      let ax = bx + subW + 1;
      triangle(ax - 2, subY + subH / 2 - 3, ax - 2, subY + subH / 2 + 3, ax + 2, subY + subH / 2);
    }
  }

  // Gear icon
  noStroke();
  fill(AMBER_DARK);
  textSize(18);
  textAlign(CENTER, CENTER);
  text('\u2699', sx + sw / 2, sy + sh - 16);
}

// ---- Stage 3: Quality Gate ----
function drawQualityGate(sx, sy, sw, sh, stage) {
  fill('#2E7D32');
  textSize(sw > 90 ? 10 : 8);
  textStyle(BOLD);
  textAlign(CENTER, TOP);
  noStroke();
  text('Quality Gate', sx + sw / 2, sy + 4);
  textStyle(NORMAL);

  // 3 checks with checkmarks
  let checks = stage.checks;
  let startY = sy + 22;
  let lineH = 16;

  for (let j = 0; j < checks.length; j++) {
    let cy = startY + j * lineH;
    // Green checkmark
    fill('#4CAF50');
    textSize(11);
    textAlign(LEFT, TOP);
    noStroke();
    text('\u2713', sx + 6, cy);

    // Check label
    fill('#333');
    textSize(sw > 100 ? 8 : 7);
    textAlign(LEFT, TOP);
    text(checks[j], sx + 18, cy + 1);
  }

  // Shield icon
  noStroke();
  fill('#2E7D32');
  textSize(16);
  textAlign(CENTER, CENTER);
  text('\uD83D\uDEE1', sx + sw / 2, sy + sh - 12);
}

// ---- Stage 4: Graph Database ----
function drawGraphDB(sx, sy, sw, sh, stage) {
  fill(INDIGO);
  textSize(sw > 90 ? 10 : 8);
  textStyle(BOLD);
  textAlign(CENTER, TOP);
  noStroke();
  text('Graph Database', sx + sw / 2, sy + 4);
  textStyle(NORMAL);

  // Node and edge counts
  textSize(sw > 90 ? 9 : 7);
  fill(INDIGO_DARK);
  textAlign(CENTER, TOP);
  text('Nodes: 52,341', sx + sw / 2, sy + 24);
  text('Edges: 847,229', sx + sw / 2, sy + 38);

  // Mini network icon (3 dots connected by lines)
  let cx = sx + sw / 2;
  let cy = sy + sh - 18;
  stroke(INDIGO);
  strokeWeight(1.5);
  // edges
  line(cx - 12, cy - 6, cx + 12, cy - 6);
  line(cx - 12, cy - 6, cx, cy + 8);
  line(cx + 12, cy - 6, cx, cy + 8);
  // nodes
  noStroke();
  fill(INDIGO);
  ellipse(cx - 12, cy - 6, 8, 8);
  fill(AMBER);
  ellipse(cx + 12, cy - 6, 8, 8);
  fill(GOLD);
  ellipse(cx, cy + 8, 8, 8);
}

// ============================================================
// Detail panel (shown when a stage is clicked)
// ============================================================
function drawDetailPanel(stageW, stageH, stageY, arrowW, dlqX, dlqY, dlqW, dlqH) {
  let panelW = canvasWidth - margin * 2;
  let panelH = 90;
  let panelY = stageY + stageH + 4;

  let stage, stageColor;
  if (expandedStage === 5) {
    stage = dlq;
    stageColor = dlq.color;
    panelY = dlqY + dlqH + 4;
    // Ensure panel fits
    if (panelY + panelH > drawHeight - 28) {
      panelH = drawHeight - 28 - panelY;
    }
  } else {
    stage = pipelineStages[expandedStage];
    stageColor = stage.color;
  }

  // Panel background
  fill(255, 255, 255, 245);
  stroke(stageColor);
  strokeWeight(2);
  rect(margin, panelY, panelW, panelH, 8);

  noStroke();

  // Title
  fill(stageColor);
  textSize(12);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  let titleText = expandedStage === 5 ? dlq.label : stage.label.replace('\n', ' ');
  text(titleText, margin + 10, panelY + 8);
  textStyle(NORMAL);

  // Description
  fill('#444');
  textSize(10);
  textAlign(LEFT, TOP);
  text(stage.description, margin + 10, panelY + 24, panelW / 2 - 10, panelH - 30);

  // Detail items on the right side
  let detailX = margin + panelW / 2 + 10;
  let detailY = panelY + 10;
  let details = stage.details;

  for (let j = 0; j < details.length; j++) {
    fill(stageColor);
    textSize(9);
    textAlign(LEFT, TOP);
    text('\u2022', detailX, detailY + j * 14);
    fill('#555');
    text(' ' + details[j], detailX + 8, detailY + j * 14);
  }

  // Close hint
  fill('#aaa');
  textSize(9);
  textAlign(RIGHT, BOTTOM);
  text('click stage to close', margin + panelW - 8, panelY + panelH - 4);
}

// ============================================================
// Animation: spawn, update, and draw flow dots
// ============================================================
function updateAndDrawDots(stageW, stageH, stageY, arrowW, dlqX, dlqY, dlqW, dlqH) {
  let speed = pipelineMode === 'stream' ? 2.5 : 1.5;

  // Spawn new dots
  if (frameCount >= nextSpawnFrame) {
    let batchSize = pipelineMode === 'batch' ? 3 : 1;
    for (let b = 0; b < batchSize; b++) {
      let dotColor = random([INDIGO, AMBER, INDIGO_LIGHT, AMBER_DARK]);
      let sourceIndex = floor(random(4));
      flowDots.push({
        progress: 0,               // 0 = start, 1 = end
        color: dotColor,
        yOffset: random(-4, 4),
        speed: random(0.003, 0.005) * speed,
        failed: false,
        failChecked: false,
        sourceIndex: sourceIndex,
        failProgress: 0             // for animating down to DLQ
      });
    }
    nextSpawnFrame = frameCount + (pipelineMode === 'stream' ? 15 : 40);
  }

  // Update dots
  for (let i = flowDots.length - 1; i >= 0; i--) {
    let dot = flowDots[i];

    if (dot.failed) {
      // Animate downward to DLQ
      dot.failProgress += 0.02 * speed;
      if (dot.failProgress >= 1) {
        flowDots.splice(i, 1);
        dotsFailed++;
      }
    } else {
      dot.progress += dot.speed;

      // Check failure at quality gate position (progress ~ 0.75)
      if (!dot.failChecked && dot.progress >= 0.72 && dot.progress < 0.80) {
        dot.failChecked = true;
        if (random() < failChance) {
          dot.failed = true;
          dot.failProgress = 0;
        }
      }

      // Dot reached the end
      if (dot.progress >= 1) {
        flowDots.splice(i, 1);
        eventsProcessed++;
      }
    }
  }

  // Draw dots
  drawDotsOnly(stageW, stageH, stageY, arrowW, dlqX, dlqY, dlqW, dlqH);
}

function drawDotsOnly(stageW, stageH, stageY, arrowW, dlqX, dlqY, dlqW, dlqH) {
  let trackY = stageY + stageH / 2;
  let trackStartX = margin + stageW / 2;
  let trackEndX = margin + 4 * (stageW + arrowW) + stageW / 2;
  let trackLen = trackEndX - trackStartX;

  // Quality gate center for fail diversion
  let qgCenterX = margin + 3 * (stageW + arrowW) + stageW / 2;
  let qgCenterY = trackY;

  for (let dot of flowDots) {
    if (dot.failed) {
      // Lerp from quality gate position down to DLQ
      let fx = qgCenterX;
      let fy = lerp(qgCenterY, dlqY + 15, dot.failProgress);
      fill(dlq.color);
      noStroke();
      ellipse(fx, fy, 8, 8);
    } else {
      let dx = trackStartX + dot.progress * trackLen;
      let dy = trackY + dot.yOffset;
      fill(dot.color);
      noStroke();
      ellipse(dx, dy, 8, 8);
    }
  }
}

// ============================================================
// Canvas-based control buttons
// ============================================================
function drawControls() {
  let btnH = 28;
  let btnY = drawHeight + (controlHeight - btnH) / 2;
  let btnGap = 10;

  // Button 1: Animate Flow / Pause
  let btn1W = 110;
  let btn1X = margin;
  let btn1Label = isAnimating ? 'Pause Flow' : 'Animate Flow';
  let btn1Color = isAnimating ? AMBER_DARK : INDIGO;

  drawButton(btn1X, btnY, btn1W, btnH, btn1Label, btn1Color, 'white');
  buttons.animate = { x: btn1X, y: btnY, w: btn1W, h: btnH };

  // Button 2: Batch / Stream toggle
  let btn2W = 90;
  let btn2X = btn1X + btn1W + btnGap;
  let btn2Label = pipelineMode === 'batch' ? 'Batch' : 'Stream';
  let btn2Color = pipelineMode === 'batch' ? INDIGO_LIGHT : AMBER;

  drawButton(btn2X, btnY, btn2W, btnH, btn2Label, btn2Color, 'white');
  buttons.mode = { x: btn2X, y: btnY, w: btn2W, h: btnH };

  // Mode indicator dot
  noStroke();
  fill(pipelineMode === 'batch' ? GOLD : '#4CAF50');
  ellipse(btn2X + btn2W - 14, btnY + btnH / 2, 8, 8);

  // Button 3: Reset
  let btn3W = 65;
  let btn3X = btn2X + btn2W + btnGap;
  let btn3Label = 'Reset';
  let btn3Color = '#757575';

  drawButton(btn3X, btnY, btn3W, btnH, btn3Label, btn3Color, 'white');
  buttons.reset = { x: btn3X, y: btnY, w: btn3W, h: btnH };
}

function drawButton(x, y, w, h, label, bgColor, textColor) {
  // Hover detection
  let isHovered = mouseX > x && mouseX < x + w &&
                  mouseY > y && mouseY < y + h;

  // Shadow
  noStroke();
  fill(0, 0, 0, 30);
  rect(x + 2, y + 2, w, h, 6);

  // Button body
  stroke(bgColor);
  strokeWeight(1);
  if (isHovered) {
    fill(lerpColor(color(bgColor), color(255), 0.2));
  } else {
    fill(bgColor);
  }
  rect(x, y, w, h, 6);

  // Label
  noStroke();
  fill(textColor);
  textSize(12);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text(label, x + w / 2, y + h / 2);
  textStyle(NORMAL);
}

// ============================================================
// Mouse interaction
// ============================================================
function mousePressed() {
  // ---- Check control buttons ----
  if (buttons.animate && isInside(buttons.animate)) {
    isAnimating = !isAnimating;
    return;
  }

  if (buttons.mode && isInside(buttons.mode)) {
    pipelineMode = pipelineMode === 'batch' ? 'stream' : 'batch';
    return;
  }

  if (buttons.reset && isInside(buttons.reset)) {
    isAnimating = false;
    flowDots = [];
    eventsProcessed = 0;
    dotsFailed = 0;
    expandedStage = -1;
    return;
  }

  // ---- Check stage clicks ----
  let stageCount = pipelineStages.length;
  let arrowW = 18;
  let totalArrowW = (stageCount - 1) * arrowW;
  let availW = canvasWidth - margin * 2 - totalArrowW;
  let stageW = availW / stageCount;
  let stageH = 88;
  let stageY = 32;

  for (let i = 0; i < stageCount; i++) {
    let sx = margin + i * (stageW + arrowW);
    if (mouseX > sx && mouseX < sx + stageW &&
        mouseY > stageY && mouseY < stageY + stageH) {
      expandedStage = expandedStage === i ? -1 : i;
      return;
    }
  }

  // ---- Check DLQ click ----
  let dlqW = stageW * 1.3;
  let dlqH = 60;
  let qgX = margin + 3 * (stageW + arrowW);
  let dlqX = qgX + stageW / 2 - dlqW / 2;
  let dlqY = stageY + stageH + 70;

  if (mouseX > dlqX && mouseX < dlqX + dlqW &&
      mouseY > dlqY && mouseY < dlqY + dlqH) {
    expandedStage = expandedStage === 5 ? -1 : 5;
    return;
  }

  // Click elsewhere closes panel
  expandedStage = -1;
}

function isInside(btn) {
  return mouseX > btn.x && mouseX < btn.x + btn.w &&
         mouseY > btn.y && mouseY < btn.y + btn.h;
}

// ============================================================
// Responsive resize
// ============================================================
function windowResized() {
  updateCanvasSize();
  resizeCanvas(canvasWidth, canvasHeight);
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  canvasWidth = Math.floor(container.width);
  if (canvasWidth < 350) canvasWidth = 350; // minimum usable width
}
