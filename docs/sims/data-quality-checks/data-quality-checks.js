// Data Quality Check Framework MicroSim
// Three-tier quality check visualization: Record, Batch, Graph
// with dead letter queue and animated simulation
// Canvas-based controls only
// MicroSim template version 2026.02

let canvasWidth = 400;
let drawHeight = 450;
let controlHeight = 50;
let canvasHeight = drawHeight + controlHeight;
let margin = 25;
let defaultTextSize = 16;

// Aria color theme
const INDIGO = '#303F9F';
const INDIGO_DARK = '#1A237E';
const INDIGO_LIGHT = '#5C6BC0';
const AMBER = '#D4880F';
const AMBER_DARK = '#B06D0B';
const AMBER_LIGHT = '#F5C14B';
const GOLD = '#FFD700';
const CHAMPAGNE = '#FFF8E7';
const PASS_GREEN = '#4CAF50';
const FAIL_RED = '#E53935';
const DLQ_BG = '#FFEBEE';

// Check items for each level
let recordChecks = [
  { label: 'Schema', fullLabel: 'Schema Validation', pass: true,
    desc: 'Validates that each record conforms to the expected JSON schema, checking field names, data types, and required fields.' },
  { label: 'Range', fullLabel: 'Range Checks', pass: true,
    desc: 'Ensures numeric values fall within acceptable bounds (e.g., age 0-150, salary > 0, dates not in the future).' },
  { label: 'Ref Valid', fullLabel: 'Referential Validity', pass: true,
    desc: 'Confirms that foreign keys and references point to existing entities (e.g., department_id maps to a real department).' },
  { label: 'Complete', fullLabel: 'Completeness', pass: true,
    desc: 'Checks that all required fields are populated and not null, empty, or placeholder values.' }
];

let batchChecks = [
  { label: 'Volume', fullLabel: 'Volume Checks', pass: true,
    desc: 'Compares the number of records in the batch against expected volume. Flags anomalies like 90% drops or 10x spikes.' },
  { label: 'Distrib.', fullLabel: 'Distribution Checks', pass: true,
    desc: 'Verifies that statistical distributions (mean, median, std dev) of key fields match historical baselines.' },
  { label: 'Temporal', fullLabel: 'Temporal Coverage', pass: true,
    desc: 'Ensures timestamps span the expected time window with no gaps or duplicate time periods.' }
];

let graphChecks = [
  { label: 'Node Growth', fullLabel: 'Node Growth Rate', pass: true,
    desc: 'Monitors that new node creation stays within expected bounds. Sudden spikes may indicate duplicate ingestion.' },
  { label: 'Edge Dens.', fullLabel: 'Edge Density', pass: true,
    desc: 'Checks that the ratio of edges to nodes remains consistent. Abnormal density suggests data modeling errors.' },
  { label: 'Orphans', fullLabel: 'Orphan Detection', pass: true,
    desc: 'Identifies nodes with zero edges (disconnected from the graph). Orphans often indicate failed relationship mapping.' }
];

// Animation state
let simulating = false;
let simPhase = 0; // 0=idle, 1=record, 2=batch, 3=graph, 4=done
let simProgress = 0; // 0 to 1 within each phase
let simSpeed = 0.02;
let particles = [];
let dlqCount = 0;
let dlqCategories = { record: 0, batch: 0, graph: 0 };

// Interaction state
let selectedCheck = null; // { level, index }
let tooltipTimer = 0;

// Button definitions (computed in draw)
let buttons = {};

// Layout computed values
let funnelLeft, funnelRight, dlqLeft, dlqRight;
let levelY = [];
let levelH = 95;
let headerH = 22;
let checkItemH = 28;
let levelGap = 12;
let arrowGap = 8;

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent(document.querySelector('main'));
  describe('Interactive three-tier data quality check framework showing record-level, batch-level, and graph-level validation with dead letter queue routing and animated simulation.', LABEL);
}

function draw() {
  updateCanvasSize();

  // Drawing area background
  fill(CHAMPAGNE);
  noStroke();
  rect(0, 0, canvasWidth, drawHeight);

  // Control area
  fill('white');
  stroke('silver');
  strokeWeight(1);
  rect(0, drawHeight, canvasWidth, controlHeight);

  // Compute layout
  computeLayout();

  // Title
  noStroke();
  fill(INDIGO_DARK);
  textAlign(CENTER, TOP);
  textSize(Math.min(17, canvasWidth * 0.035));
  textStyle(BOLD);
  text('Data Quality Check Framework', (funnelLeft + funnelRight) / 2, 6);
  textStyle(NORMAL);

  // Draw the three levels
  drawLevel(0, 'Record-Level Checks', AMBER, recordChecks, funnelLeft, levelY[0]);
  drawLevel(1, 'Batch-Level Checks', INDIGO, batchChecks, funnelLeft + 15, levelY[1]);
  drawLevel(2, 'Graph-Level Checks', GOLD, graphChecks, funnelLeft + 30, levelY[2]);

  // Draw connecting arrows between levels
  drawFunnelArrows();

  // Draw dead letter queue
  drawDeadLetterQueue();

  // Draw arrows to DLQ
  drawDLQArrows();

  // Draw outcome indicators
  drawOutcomes();

  // Draw tooltip if a check is selected
  drawTooltip();

  // Draw particles
  updateAndDrawParticles();

  // Instruction text
  noStroke();
  fill('#888');
  textSize(10);
  textAlign(CENTER, BOTTOM);
  text('Click any check item for details', (funnelLeft + funnelRight) / 2, drawHeight - 3);

  // Draw canvas-based buttons
  drawButtons();

  // Advance simulation
  if (simulating) {
    advanceSimulation();
  }
}

function computeLayout() {
  // Funnel occupies left 72% of canvas, DLQ occupies right side
  let contentW = canvasWidth - margin * 2;
  funnelLeft = margin;
  funnelRight = margin + contentW * 0.70;
  dlqLeft = funnelRight + 15;
  dlqRight = canvasWidth - margin;

  // Vertical positions for 3 levels
  let startY = 28;
  for (let i = 0; i < 3; i++) {
    levelY[i] = startY + i * (levelH + levelGap + arrowGap);
  }
}

function drawLevel(levelIdx, title, headerColor, checks, lx, ly) {
  // Narrowing funnel: each level is slightly narrower
  let inset = levelIdx * 15;
  let lLeft = funnelLeft + inset;
  let lRight = funnelRight - inset;
  let lw = lRight - lLeft;

  // Background rect with rounded corners
  fill(255, 255, 255, 220);
  stroke('#ccc');
  strokeWeight(1);
  rect(lLeft, ly, lw, levelH, 6);

  // Header bar
  noStroke();
  fill(headerColor);
  rect(lLeft, ly, lw, headerH, 6, 6, 0, 0);

  // Header text
  fill('white');
  textSize(Math.min(12, lw * 0.04));
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text(title, lLeft + 8, ly + headerH / 2);
  textStyle(NORMAL);

  // Level number badge
  fill(255, 255, 255, 180);
  textSize(10);
  textAlign(RIGHT, CENTER);
  text('L' + (levelIdx + 1), lRight - 8, ly + headerH / 2);

  // Check items in a row
  let itemAreaY = ly + headerH + 4;
  let itemAreaH = levelH - headerH - 8;
  let itemW = (lw - 16) / checks.length;
  let itemGap = 2;

  for (let i = 0; i < checks.length; i++) {
    let ix = lLeft + 8 + i * itemW;
    let iy = itemAreaY;
    let iw = itemW - itemGap;
    let ih = itemAreaH;
    let ck = checks[i];

    // Item background
    let isSelected = selectedCheck && selectedCheck.level === levelIdx && selectedCheck.index === i;
    let isHovered = mouseX > ix && mouseX < ix + iw && mouseY > iy && mouseY < iy + ih;

    if (isSelected) {
      fill('#E8EAF6');
      stroke(INDIGO);
      strokeWeight(2);
    } else if (isHovered) {
      fill('#F5F5F5');
      stroke('#bbb');
      strokeWeight(1);
    } else {
      fill(255);
      stroke('#ddd');
      strokeWeight(1);
    }
    rect(ix, iy, iw, ih, 4);

    // Pass/Fail icon
    noStroke();
    let iconSize = Math.min(18, iw * 0.3);
    textSize(iconSize);
    textAlign(CENTER, CENTER);
    if (ck.pass) {
      fill(PASS_GREEN);
      text('\u2713', ix + iw / 2, iy + ih * 0.35);
    } else {
      fill(FAIL_RED);
      text('\u2717', ix + iw / 2, iy + ih * 0.35);
    }

    // Label
    fill('#444');
    textSize(Math.min(9, iw * 0.14));
    textAlign(CENTER, CENTER);
    text(ck.label, ix + iw / 2, iy + ih * 0.72);
  }
}

function drawFunnelArrows() {
  for (let i = 0; i < 2; i++) {
    let fromY = levelY[i] + levelH;
    let toY = levelY[i + 1];
    let midX = (funnelLeft + funnelRight) / 2;
    let midY = (fromY + toY) / 2;

    // Check if level passes
    let checks = i === 0 ? recordChecks : batchChecks;
    let allPass = checks.every(c => c.pass);

    stroke(allPass ? PASS_GREEN : '#ccc');
    strokeWeight(2);
    // Downward arrow
    line(midX, fromY + 2, midX, toY - 2);
    // Arrowhead
    noStroke();
    fill(allPass ? PASS_GREEN : '#ccc');
    triangle(midX - 5, toY - 7, midX + 5, toY - 7, midX, toY - 1);

    // Small label
    noStroke();
    fill(allPass ? PASS_GREEN : '#999');
    textSize(9);
    textAlign(LEFT, CENTER);
    text(allPass ? 'PASS' : 'BLOCKED', midX + 8, midY);
  }
}

function drawDLQArrows() {
  let dlqCenterX = (dlqLeft + dlqRight) / 2;

  for (let i = 0; i < 3; i++) {
    let checks = i === 0 ? recordChecks : i === 1 ? batchChecks : graphChecks;
    let hasFailure = checks.some(c => !c.pass);

    if (hasFailure) {
      let inset = i * 15;
      let fromX = funnelRight - inset;
      let fromY = levelY[i] + levelH / 2;
      let toX = dlqLeft;
      let toY = 28 + 25 + i * 40;

      stroke(FAIL_RED);
      strokeWeight(1.5);
      // Horizontal arrow to DLQ
      line(fromX, fromY, toX - 3, toY);
      // Arrowhead
      noStroke();
      fill(FAIL_RED);
      triangle(toX - 8, toY - 4, toX - 8, toY + 4, toX - 2, toY);
    }
  }
}

function drawDeadLetterQueue() {
  let dlqW = dlqRight - dlqLeft;
  let dlqTop = 28;
  let dlqH = levelY[2] + levelH - dlqTop;

  // Background
  fill(DLQ_BG);
  stroke(FAIL_RED);
  strokeWeight(2);
  rect(dlqLeft, dlqTop, dlqW, dlqH, 6);

  // Header
  noStroke();
  fill(FAIL_RED);
  rect(dlqLeft, dlqTop, dlqW, headerH, 6, 6, 0, 0);

  fill('white');
  textSize(Math.min(10, dlqW * 0.09));
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text('Dead Letter', dlqLeft + dlqW / 2, dlqTop + headerH / 2 - 1);
  textStyle(NORMAL);

  // DLQ content
  let contentY = dlqTop + headerH + 8;
  fill('#C62828');
  textSize(Math.min(9, dlqW * 0.08));
  textAlign(CENTER, TOP);

  // Count
  textStyle(BOLD);
  text('Count: ' + dlqCount, dlqLeft + dlqW / 2, contentY);
  textStyle(NORMAL);

  // Category breakdown
  let catY = contentY + 18;
  fill('#D32F2F');
  textSize(Math.min(8, dlqW * 0.07));
  textAlign(LEFT, TOP);
  if (dlqCategories.record > 0) {
    text('Rec: ' + dlqCategories.record, dlqLeft + 6, catY);
    catY += 14;
  }
  if (dlqCategories.batch > 0) {
    text('Bat: ' + dlqCategories.batch, dlqLeft + 6, catY);
    catY += 14;
  }
  if (dlqCategories.graph > 0) {
    text('Gph: ' + dlqCategories.graph, dlqLeft + 6, catY);
    catY += 14;
  }

  // Review required label
  if (dlqCount > 0) {
    let lblY = dlqTop + dlqH - 30;
    fill('#FFCDD2');
    noStroke();
    rect(dlqLeft + 4, lblY, dlqW - 8, 22, 4);
    fill('#B71C1C');
    textSize(Math.min(9, dlqW * 0.08));
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text('Review Req.', dlqLeft + dlqW / 2, lblY + 11);
    textStyle(NORMAL);
  }
}

function drawOutcomes() {
  let graphAllPass = graphChecks.every(c => c.pass);
  let batchAllPass = batchChecks.every(c => c.pass);
  let recordAllPass = recordChecks.every(c => c.pass);
  let allPass = graphAllPass && batchAllPass && recordAllPass;

  // Outcome indicator below graph level
  let outY = levelY[2] + levelH + 6;
  let inset = 2 * 15;
  let outLeft = funnelLeft + inset;
  let outRight = funnelRight - inset;
  let outW = outRight - outLeft;
  let outH = 22;
  let midX = (outLeft + outRight) / 2;

  if (allPass) {
    // Graph Updated - green
    fill(PASS_GREEN);
    noStroke();
    rect(outLeft, outY, outW, outH, 4);
    fill('white');
    textSize(10);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text('\u2713 Graph Updated', midX, outY + outH / 2);
    textStyle(NORMAL);
  } else if (!graphAllPass || !batchAllPass || !recordAllPass) {
    // Rollback + Alert - red
    fill(FAIL_RED);
    noStroke();
    rect(outLeft, outY, outW, outH, 4);
    fill('white');
    textSize(10);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text('\u2717 Rollback + Alert', midX, outY + outH / 2);
    textStyle(NORMAL);
  }

  // Downward arrow from graph level to outcome
  let arrowX = midX;
  let arrowFromY = levelY[2] + levelH;
  stroke(allPass ? PASS_GREEN : FAIL_RED);
  strokeWeight(2);
  line(arrowX, arrowFromY + 1, arrowX, outY - 1);
  noStroke();
  fill(allPass ? PASS_GREEN : FAIL_RED);
  triangle(arrowX - 4, outY - 5, arrowX + 4, outY - 5, arrowX, outY - 1);
}

function drawTooltip() {
  if (!selectedCheck) return;

  let checks;
  if (selectedCheck.level === 0) checks = recordChecks;
  else if (selectedCheck.level === 1) checks = batchChecks;
  else checks = graphChecks;

  let ck = checks[selectedCheck.index];
  if (!ck) return;

  // Tooltip panel at the bottom of the drawing area
  let panelH = 48;
  let panelY = drawHeight - panelH - 14;
  let panelX = margin;
  let panelW = funnelRight - margin - 5;

  fill(255, 255, 255, 245);
  stroke(INDIGO_LIGHT);
  strokeWeight(2);
  rect(panelX, panelY, panelW, panelH, 6);

  // Title
  noStroke();
  fill(INDIGO);
  textSize(11);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text(ck.fullLabel + (ck.pass ? '  \u2713 PASS' : '  \u2717 FAIL'), panelX + 8, panelY + 5);
  textStyle(NORMAL);

  // Description - wrap text
  fill('#555');
  textSize(9);
  textAlign(LEFT, TOP);
  let descW = panelW - 16;
  text(ck.desc, panelX + 8, panelY + 20, descW, panelH - 24);
}

function drawButtons() {
  let btnY = drawHeight + 8;
  let btnH = 32;
  let btnGap = 8;

  // Compute button widths based on canvas width
  let availW = canvasWidth - margin * 2;
  let simBtnW = availW * 0.38;
  let togBtnW = availW * 0.38;
  let resetBtnW = availW * 0.20;

  let simBtnX = margin;
  let togBtnX = simBtnX + simBtnW + btnGap;
  let resetBtnX = togBtnX + togBtnW + btnGap;

  // Adjust widths to fit
  let totalUsed = simBtnW + togBtnW + resetBtnW + btnGap * 2;
  if (totalUsed > availW) {
    let scale = availW / totalUsed;
    simBtnW *= scale;
    togBtnW *= scale;
    resetBtnW *= scale;
    togBtnX = simBtnX + simBtnW + btnGap;
    resetBtnX = togBtnX + togBtnW + btnGap;
  }

  // Store button bounds for mousePressed
  buttons.simulate = { x: simBtnX, y: btnY, w: simBtnW, h: btnH };
  buttons.toggle = { x: togBtnX, y: btnY, w: togBtnW, h: btnH };
  buttons.reset = { x: resetBtnX, y: btnY, w: resetBtnW, h: btnH };

  // Draw Simulate button
  let simHover = isInside(mouseX, mouseY, buttons.simulate);
  fill(simulating ? AMBER_DARK : (simHover ? INDIGO_LIGHT : INDIGO));
  noStroke();
  rect(simBtnX, btnY, simBtnW, btnH, 6);
  fill('white');
  textSize(Math.min(12, simBtnW * 0.11));
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text(simulating ? 'Simulating...' : 'Simulate Checks', simBtnX + simBtnW / 2, btnY + btnH / 2);
  textStyle(NORMAL);

  // Draw Toggle Failures button
  let togHover = isInside(mouseX, mouseY, buttons.toggle);
  fill(togHover ? AMBER : AMBER_DARK);
  noStroke();
  rect(togBtnX, btnY, togBtnW, btnH, 6);
  fill('white');
  textSize(Math.min(12, togBtnW * 0.11));
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text('Toggle Failures', togBtnX + togBtnW / 2, btnY + btnH / 2);
  textStyle(NORMAL);

  // Draw Reset button
  let resHover = isInside(mouseX, mouseY, buttons.reset);
  fill(resHover ? '#888' : '#666');
  noStroke();
  rect(resetBtnX, btnY, resetBtnW, btnH, 6);
  fill('white');
  textSize(Math.min(12, resetBtnW * 0.14));
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text('Reset', resetBtnX + resetBtnW / 2, btnY + btnH / 2);
  textStyle(NORMAL);
}

function isInside(mx, my, bounds) {
  return mx > bounds.x && mx < bounds.x + bounds.w &&
         my > bounds.y && my < bounds.y + bounds.h;
}

function mousePressed() {
  // Check buttons first
  if (buttons.simulate && isInside(mouseX, mouseY, buttons.simulate)) {
    if (!simulating) {
      startSimulation();
    }
    return;
  }
  if (buttons.toggle && isInside(mouseX, mouseY, buttons.toggle)) {
    toggleFailures();
    return;
  }
  if (buttons.reset && isInside(mouseX, mouseY, buttons.reset)) {
    resetAll();
    return;
  }

  // Check for check item clicks
  let allLevels = [
    { checks: recordChecks, levelIdx: 0 },
    { checks: batchChecks, levelIdx: 1 },
    { checks: graphChecks, levelIdx: 2 }
  ];

  for (let lvl of allLevels) {
    let inset = lvl.levelIdx * 15;
    let lLeft = funnelLeft + inset;
    let lRight = funnelRight - inset;
    let lw = lRight - lLeft;
    let ly = levelY[lvl.levelIdx];
    let itemAreaY = ly + headerH + 4;
    let itemAreaH = levelH - headerH - 8;
    let itemW = (lw - 16) / lvl.checks.length;

    for (let i = 0; i < lvl.checks.length; i++) {
      let ix = lLeft + 8 + i * itemW;
      let iy = itemAreaY;
      let iw = itemW - 2;
      let ih = itemAreaH;

      if (mouseX > ix && mouseX < ix + iw && mouseY > iy && mouseY < iy + ih) {
        if (selectedCheck && selectedCheck.level === lvl.levelIdx && selectedCheck.index === i) {
          selectedCheck = null;
        } else {
          selectedCheck = { level: lvl.levelIdx, index: i };
        }
        return;
      }
    }
  }

  // Click elsewhere to dismiss tooltip
  selectedCheck = null;
}

function startSimulation() {
  simulating = true;
  simPhase = 1;
  simProgress = 0;
  particles = [];
  dlqCount = 0;
  dlqCategories = { record: 0, batch: 0, graph: 0 };

  // Set all to pass first, simulation will process them
  setAllPass(recordChecks);
  setAllPass(batchChecks);
  setAllPass(graphChecks);
}

function setAllPass(checks) {
  for (let c of checks) c.pass = true;
}

function advanceSimulation() {
  simProgress += simSpeed;

  if (simProgress >= 1) {
    // Phase complete, randomly fail some checks
    if (simPhase === 1) {
      // Process record level - some random failures
      for (let c of recordChecks) {
        c.pass = random() > 0.25;
      }
      let failures = recordChecks.filter(c => !c.pass).length;
      if (failures > 0) {
        dlqCount += failures;
        dlqCategories.record += failures;
        spawnDLQParticles(0, failures);
      }
      spawnFlowParticles(0);
    } else if (simPhase === 2) {
      // Process batch level
      for (let c of batchChecks) {
        c.pass = random() > 0.3;
      }
      let failures = batchChecks.filter(c => !c.pass).length;
      if (failures > 0) {
        dlqCount += failures;
        dlqCategories.batch += failures;
        spawnDLQParticles(1, failures);
      }
      spawnFlowParticles(1);
    } else if (simPhase === 3) {
      // Process graph level
      for (let c of graphChecks) {
        c.pass = random() > 0.3;
      }
      let failures = graphChecks.filter(c => !c.pass).length;
      if (failures > 0) {
        dlqCount += failures;
        dlqCategories.graph += failures;
        spawnDLQParticles(2, failures);
      }
      spawnFlowParticles(2);
    }

    simPhase++;
    simProgress = 0;

    if (simPhase > 3) {
      simulating = false;
      simPhase = 0;
    }
  }

  // Animate scan line during active phase
  if (simPhase >= 1 && simPhase <= 3) {
    let lvlIdx = simPhase - 1;
    let inset = lvlIdx * 15;
    let lLeft = funnelLeft + inset;
    let lRight = funnelRight - inset;
    let ly = levelY[lvlIdx];

    // Scanning highlight
    let scanX = lLeft + simProgress * (lRight - lLeft);
    stroke(GOLD);
    strokeWeight(2);
    line(scanX, ly, scanX, ly + levelH);

    // Glow effect
    noStroke();
    fill(255, 215, 0, 40);
    rect(lLeft, ly, simProgress * (lRight - lLeft), levelH, 6);
  }
}

function spawnFlowParticles(fromLevel) {
  if (fromLevel >= 2) return;
  let midX = (funnelLeft + funnelRight) / 2;
  let fromY = levelY[fromLevel] + levelH;
  let toY = levelY[fromLevel + 1];

  for (let i = 0; i < 3; i++) {
    particles.push({
      x: midX + random(-10, 10),
      y: fromY,
      targetX: midX + random(-10, 10),
      targetY: toY,
      progress: 0,
      speed: random(0.02, 0.04),
      color: PASS_GREEN,
      size: random(4, 7),
      alpha: 255
    });
  }
}

function spawnDLQParticles(fromLevel, count) {
  let inset = fromLevel * 15;
  let fromX = funnelRight - inset;
  let fromY = levelY[fromLevel] + levelH / 2;
  let toX = dlqLeft;

  for (let i = 0; i < count; i++) {
    particles.push({
      x: fromX,
      y: fromY,
      targetX: toX,
      targetY: 28 + 25 + fromLevel * 40 + random(-5, 5),
      progress: 0,
      speed: random(0.02, 0.04),
      color: FAIL_RED,
      size: random(4, 7),
      alpha: 255
    });
  }
}

function updateAndDrawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.progress += p.speed;

    if (p.progress >= 1) {
      particles.splice(i, 1);
      continue;
    }

    // Easing
    let t = p.progress;
    let ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    let px = lerp(p.x, p.targetX, ease);
    let py = lerp(p.y, p.targetY, ease);
    let alpha = map(p.progress, 0.7, 1, 255, 0);
    alpha = constrain(alpha, 0, 255);

    noStroke();
    let c = color(p.color);
    c.setAlpha(alpha);
    fill(c);
    ellipse(px, py, p.size, p.size);
  }
}

function toggleFailures() {
  // Randomly toggle check items
  let allChecks = [...recordChecks, ...batchChecks, ...graphChecks];
  for (let c of allChecks) {
    if (random() > 0.5) {
      c.pass = !c.pass;
    }
  }

  // Update DLQ counts
  dlqCount = 0;
  dlqCategories = { record: 0, batch: 0, graph: 0 };
  let rf = recordChecks.filter(c => !c.pass).length;
  let bf = batchChecks.filter(c => !c.pass).length;
  let gf = graphChecks.filter(c => !c.pass).length;
  dlqCount = rf + bf + gf;
  dlqCategories.record = rf;
  dlqCategories.batch = bf;
  dlqCategories.graph = gf;
}

function resetAll() {
  simulating = false;
  simPhase = 0;
  simProgress = 0;
  particles = [];
  dlqCount = 0;
  dlqCategories = { record: 0, batch: 0, graph: 0 };
  selectedCheck = null;

  setAllPass(recordChecks);
  setAllPass(batchChecks);
  setAllPass(graphChecks);
}

function windowResized() {
  updateCanvasSize();
  resizeCanvas(canvasWidth, canvasHeight);
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  canvasWidth = Math.floor(container.width);
}
