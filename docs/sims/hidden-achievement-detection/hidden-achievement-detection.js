// Hidden Achievement Detection Pipeline - p5.js MicroSim
// Horizontal flowchart with 5 stages showing the process from
// raw graph data to hidden achievement identification.
// Canvas-based controls only (no DOM elements).

let canvasWidth = 900;
let drawHeight = 440;
let controlHeight = 40;
let canvasHeight = drawHeight + controlHeight;

// Aria color palette
const INDIGO = [48, 63, 159];       // #303F9F
const INDIGO_DARK = [26, 35, 126];  // #1A237E
const INDIGO_LIGHT = [92, 107, 192]; // #5C6BC0
const AMBER = [212, 136, 15];       // #D4880F
const AMBER_DARK = [176, 109, 11];  // #B06D0B
const GOLD = [255, 215, 0];         // #FFD700
const CHAMPAGNE = [255, 248, 231];  // #FFF8E7

// Pipeline stage definitions
let stages = [
  {
    label: 'Communication\nGraph',
    color: INDIGO,
    contents: ['Employee nodes', 'Communication edges', 'Project nodes'],
    annotation: 'Raw organizational data',
    tooltip: [
      'Sample Communication Graph:',
      '',
      '  Alice ---email---> Bob',
      '  Bob ---slack---> Carol',
      '  Carol ---meeting--> Dave',
      '  Alice ---review--> Eve',
      '  Eve ---email---> Bob',
      '',
      '5 employees, 5 edges'
    ],
    detail: 'The communication graph captures all interaction channels: emails, Slack messages, meeting co-attendance, code reviews, and document collaborations. Each employee becomes a node; each interaction becomes a weighted, timestamped edge. Project nodes link to participants, revealing cross-functional collaboration patterns.'
  },
  {
    label: 'Centrality\nAnalysis',
    color: INDIGO,
    contents: ['Betweenness calc', 'Degree calc', 'Eigenvector calc'],
    annotation: 'Who is structurally\nimportant?',
    tooltip: [
      'Centrality Scores:',
      '',
      '  Name   Betw  Deg  Eigen',
      '  Alice  0.42  4    0.71',
      '  Bob    0.68  5    0.83',
      '  Carol  0.15  3    0.45',
      '  Dave   0.08  2    0.22',
      '  Eve    0.55  4    0.76'
    ],
    detail: 'Three centrality algorithms run on the communication graph. Betweenness centrality finds bridge-builders who connect otherwise disconnected groups. Degree centrality counts raw connection volume. Eigenvector centrality identifies employees connected to other well-connected people. The composite score weights all three.'
  },
  {
    label: 'Recognition\nHistory Overlay',
    color: AMBER,
    contents: ['Merge formal', 'recognition events', 'with centrality scores'],
    annotation: 'Who has been\nrecognized?',
    tooltip: [
      'Recognition Events Merged:',
      '',
      '  Name   Centrality  Awards',
      '  Alice  High        3',
      '  Bob    Very High   0  <--',
      '  Carol  Medium      2',
      '  Dave   Low         1',
      '  Eve    High        0  <--'
    ],
    detail: 'Formal recognition events -- awards, promotions, bonuses, shout-outs, and performance ratings -- are merged with the centrality scores. This overlay creates a two-dimensional view: structural importance vs. organizational acknowledgment. The gap between these dimensions is the key signal.'
  },
  {
    label: 'Gap\nDetection',
    color: AMBER,
    contents: ['Identify high-centrality', 'low-recognition', 'employees'],
    annotation: 'Who is important but\nunrecognized?',
    tooltip: [
      'Gap Analysis Results:',
      '',
      '  HIDDEN ACHIEVERS:',
      '  1. Bob   (gap: 0.83)',
      '     Bridge: Eng <-> Sales',
      '  2. Eve   (gap: 0.71)',
      '     Bridge: QA <-> Product',
      '',
      '  2 of 5 employees flagged'
    ],
    detail: 'The gap detection engine applies a threshold model: employees whose centrality scores rank in the top quartile but whose recognition counts fall in the bottom quartile are flagged as hidden achievers. Additional filters check for bridge-building patterns, mentoring activity, and knowledge-sharing behaviors that often go unnoticed.'
  },
  {
    label: 'Recommendation\nEngine',
    color: GOLD,
    contents: ['Generate recognition', 'suggestions with', 'supporting context'],
    annotation: 'Actionable recognition\ninsights',
    tooltip: [
      'Recommendations:',
      '',
      '  Bob: "Key bridge between',
      '    Engineering and Sales.',
      '    Consider: team award,',
      '    leadership nomination"',
      '',
      '  Eve: "Critical QA-Product',
      '    connector. Consider:',
      '    mentoring recognition"'
    ],
    detail: 'The recommendation engine generates actionable recognition suggestions with full context. Each recommendation includes the employee name, their structural role, specific contributions detected through graph patterns, and suggested recognition types mapped to organizational programs. Managers receive prioritized lists with evidence narratives.'
  }
];

// Layout computed in layoutPipeline()
let stageRects = [];
let arrowPaths = [];
let stageW = 140;
let stageH = 100;

// Interaction state
let selectedStage = -1;
let hoveredStage = -1;
let flowAnimStage = -1;  // which stage has active flow animation
let flowAnimProgress = 0;

// Particle system for data flow
let particles = [];

// Reset button
let resetBtn = { x: 0, y: 0, w: 80, h: 28 };

// ---- Responsive sizing ----

function updateCanvasSize() {
  let container = document.querySelector('main');
  if (container) {
    canvasWidth = container.getBoundingClientRect().width;
  }
}

function setup() {
  updateCanvasSize();
  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent(document.querySelector('main'));
  textFont('Arial');
  layoutPipeline();
}

function layoutPipeline() {
  let margin = 20;
  let availableW = canvasWidth - margin * 2;
  let numStages = stages.length;
  let gapBetween = 30;

  // Calculate stage width to fill available space
  stageW = Math.min(160, (availableW - gapBetween * (numStages - 1)) / numStages);
  stageH = 100;

  let totalWidth = numStages * stageW + (numStages - 1) * gapBetween;
  let startX = (canvasWidth - totalWidth) / 2;
  let stageY = 70;

  stageRects = [];
  for (let i = 0; i < numStages; i++) {
    stageRects.push({
      x: startX + i * (stageW + gapBetween),
      y: stageY,
      w: stageW,
      h: stageH
    });
  }

  // Reset button position
  resetBtn.x = canvasWidth / 2 - resetBtn.w / 2;
  resetBtn.y = drawHeight + (controlHeight - resetBtn.h) / 2;
}

// ---- Drawing ----

function draw() {
  // Draw region background
  noStroke();
  fill(240, 248, 255); // aliceblue
  rect(0, 0, canvasWidth, drawHeight);
  stroke(192);
  strokeWeight(1);
  noFill();
  rect(0, 0, canvasWidth - 1, drawHeight);

  // Control region background
  noStroke();
  fill(255);
  rect(0, drawHeight, canvasWidth, controlHeight);
  stroke(192);
  strokeWeight(1);
  noFill();
  rect(0, drawHeight, canvasWidth - 1, controlHeight - 1);

  // Title
  noStroke();
  fill(30);
  textAlign(CENTER, TOP);
  textSize(18);
  textStyle(BOLD);
  text('Hidden Achievement Detection Pipeline', canvasWidth / 2, 10);
  textStyle(NORMAL);
  textSize(11);
  fill(100);
  text('Hover for sample data  |  Click a stage to highlight data flow', canvasWidth / 2, 34);

  // Check hover
  hoveredStage = -1;
  for (let i = 0; i < stageRects.length; i++) {
    if (hitTest(stageRects[i])) {
      hoveredStage = i;
    }
  }

  // Draw connecting arrows
  drawConnectingArrows();

  // Draw stages
  for (let i = 0; i < stages.length; i++) {
    drawStage(i);
  }

  // Draw annotations below stages
  drawAnnotations();

  // Update and draw particles
  if (flowAnimStage >= 0) {
    flowAnimProgress += 0.02;
    if (flowAnimProgress > 1.5) {
      flowAnimProgress = 0;
    }
    spawnFlowParticles();
  }
  updateParticles();
  drawParticles();

  // Draw tooltip if hovering and no selection active
  if (hoveredStage >= 0 && selectedStage < 0) {
    drawTooltip(hoveredStage);
  }

  // Draw detail panel if a stage is selected
  if (selectedStage >= 0) {
    drawDetailPanel();
  }

  // Draw reset button
  drawResetButton();
}

function drawConnectingArrows() {
  for (let i = 0; i < stageRects.length - 1; i++) {
    let r1 = stageRects[i];
    let r2 = stageRects[i + 1];

    let fromX = r1.x + r1.w;
    let fromY = r1.y + r1.h / 2;
    let toX = r2.x;
    let toY = r2.y + r2.h / 2;

    // Determine if this arrow is in the active flow
    let isActive = false;
    if (selectedStage >= 0) {
      // Highlight arrows adjacent to the selected stage
      if (i === selectedStage || i === selectedStage - 1) {
        isActive = true;
      }
    }

    // Draw arrow line
    let arrowColor = isActive ? GOLD : [150, 150, 170];
    let weight = isActive ? 3 : 2;

    stroke(...arrowColor);
    strokeWeight(weight);
    line(fromX, fromY, toX, toY);

    // Draw arrowhead
    let angle = atan2(toY - fromY, toX - fromX);
    let sz = isActive ? 10 : 8;
    fill(...arrowColor);
    noStroke();
    triangle(
      toX, toY,
      toX - sz * cos(angle - PI / 6), toY - sz * sin(angle - PI / 6),
      toX - sz * cos(angle + PI / 6), toY - sz * sin(angle + PI / 6)
    );
  }
}

function drawStage(i) {
  let r = stageRects[i];
  let stage = stages[i];
  let isHovered = (hoveredStage === i);
  let isSelected = (selectedStage === i);

  // Selection glow
  if (isSelected) {
    noFill();
    stroke(...GOLD);
    strokeWeight(4);
    rect(r.x - 4, r.y - 4, r.w + 8, r.h + 8, 14);
  }

  // Drop shadow
  noStroke();
  fill(0, 0, 0, 25);
  rect(r.x + 3, r.y + 3, r.w, r.h, 10);

  // Stage box
  let col = stage.color;
  if (isHovered) {
    fill(
      lerp(col[0], 255, 0.18),
      lerp(col[1], 255, 0.18),
      lerp(col[2], 255, 0.18)
    );
  } else {
    fill(...col);
  }
  stroke(30, 30, 60);
  strokeWeight(1.2);
  rect(r.x, r.y, r.w, r.h, 10);

  // Stage label (multi-line)
  fill(255);
  noStroke();
  textAlign(CENTER, TOP);
  textSize(12);
  textStyle(BOLD);
  let labelLines = stage.label.split('\n');
  for (let li = 0; li < labelLines.length; li++) {
    text(labelLines[li], r.x + r.w / 2, r.y + 10 + li * 15);
  }
  textStyle(NORMAL);

  // Contents list
  textSize(9);
  fill(220, 220, 240);
  textAlign(CENTER, TOP);
  let contentStartY = r.y + 10 + labelLines.length * 15 + 6;
  for (let c = 0; c < stage.contents.length; c++) {
    text(stage.contents[c], r.x + r.w / 2, contentStartY + c * 12);
  }

  // Stage number badge
  fill(255, 255, 255, 60);
  noStroke();
  ellipse(r.x + r.w - 14, r.y + 14, 20, 20);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(10);
  textStyle(BOLD);
  text(i + 1, r.x + r.w - 14, r.y + 14);
  textStyle(NORMAL);
}

function drawAnnotations() {
  textSize(10);
  textAlign(CENTER, TOP);
  fill(80);
  noStroke();

  for (let i = 0; i < stages.length; i++) {
    let r = stageRects[i];
    let annotLines = stages[i].annotation.split('\n');
    for (let li = 0; li < annotLines.length; li++) {
      text(annotLines[li], r.x + r.w / 2, r.y + r.h + 8 + li * 13);
    }
  }
}

function drawTooltip(stageIdx) {
  let stage = stages[stageIdx];
  let r = stageRects[stageIdx];
  let lines = stage.tooltip;

  // Measure tooltip size
  textSize(11);
  let maxLineW = 0;
  for (let l of lines) {
    let w = textWidth(l);
    if (w > maxLineW) maxLineW = w;
  }
  let tooltipW = maxLineW + 24;
  let tooltipH = lines.length * 15 + 16;

  // Position tooltip below the stage box
  let tx = r.x + r.w / 2 - tooltipW / 2;
  let ty = r.y + r.h + 34;

  // Keep tooltip on screen
  if (tx < 5) tx = 5;
  if (tx + tooltipW > canvasWidth - 5) tx = canvasWidth - 5 - tooltipW;
  if (ty + tooltipH > drawHeight - 5) {
    ty = r.y - tooltipH - 8; // flip above if no room below
  }

  // Draw tooltip background
  fill(255, 255, 255, 245);
  stroke(...INDIGO_DARK);
  strokeWeight(1.5);
  rect(tx, ty, tooltipW, tooltipH, 6);

  // Small triangle pointer toward stage
  let arrowX = r.x + r.w / 2;
  if (arrowX < tx + 10) arrowX = tx + 10;
  if (arrowX > tx + tooltipW - 10) arrowX = tx + tooltipW - 10;
  fill(255, 255, 255, 245);
  stroke(...INDIGO_DARK);
  strokeWeight(1.5);
  triangle(arrowX - 6, ty, arrowX + 6, ty, arrowX, ty - 6);
  // Cover the bottom line of the triangle
  noStroke();
  fill(255, 255, 255, 245);
  rect(arrowX - 5, ty, 10, 2);

  // Tooltip text (monospace feel)
  noStroke();
  textAlign(LEFT, TOP);
  textSize(11);
  for (let li = 0; li < lines.length; li++) {
    let line = lines[li];
    if (li === 0) {
      fill(...INDIGO_DARK);
      textStyle(BOLD);
    } else if (line.indexOf('<--') >= 0) {
      fill(198, 40, 40); // highlight gaps in red
      textStyle(BOLD);
    } else if (line.indexOf('HIDDEN') >= 0) {
      fill(...AMBER_DARK);
      textStyle(BOLD);
    } else {
      fill(60);
      textStyle(NORMAL);
    }
    text(line, tx + 12, ty + 8 + li * 15);
  }
  textStyle(NORMAL);
}

function drawDetailPanel() {
  let stage = stages[selectedStage];
  let panelH = 70;
  let panelX = 14;
  let panelW = canvasWidth - 28;
  let panelY = drawHeight - panelH - 8;

  // Background
  fill(...CHAMPAGNE);
  stroke(...AMBER);
  strokeWeight(1.5);
  rect(panelX, panelY, panelW, panelH, 8);

  // Title
  fill(...INDIGO);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(12);
  textStyle(BOLD);
  let titleText = 'Stage ' + (selectedStage + 1) + ': ' + stage.label.replace('\n', ' ');
  text(titleText, panelX + 10, panelY + 6);
  textStyle(NORMAL);

  // Detail text with word wrap
  fill(50);
  textSize(10);
  let words = stage.detail.split(' ');
  let wrapLines = [];
  let currentLine = '';
  let maxW = panelW - 20;
  for (let w of words) {
    let testLine = currentLine.length === 0 ? w : currentLine + ' ' + w;
    if (textWidth(testLine) > maxW) {
      wrapLines.push(currentLine);
      currentLine = w;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine.length > 0) wrapLines.push(currentLine);

  for (let li = 0; li < Math.min(wrapLines.length, 4); li++) {
    text(wrapLines[li], panelX + 10, panelY + 24 + li * 12);
  }
}

function drawResetButton() {
  let isHover = hitTest(resetBtn);
  if (isHover) {
    fill(...INDIGO_LIGHT);
  } else {
    fill(...INDIGO);
  }
  stroke(80);
  strokeWeight(1);
  rect(resetBtn.x, resetBtn.y, resetBtn.w, resetBtn.h, 6);

  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(12);
  text('Reset', resetBtn.x + resetBtn.w / 2, resetBtn.y + resetBtn.h / 2);
}

// ---- Particle system for data flow ----

function spawnFlowParticles() {
  // Spawn particles on the left and right edges of the selected stage
  if (frameCount % 8 !== 0) return;

  // Flow into the selected stage from the left
  if (selectedStage > 0) {
    let prevR = stageRects[selectedStage - 1];
    let curR = stageRects[selectedStage];
    particles.push({
      x: prevR.x + prevR.w,
      y: prevR.y + prevR.h / 2 + random(-6, 6),
      targetX: curR.x,
      targetY: curR.y + curR.h / 2,
      color: GOLD,
      size: random(5, 8),
      life: 1.0
    });
  }

  // Flow out of the selected stage to the right
  if (selectedStage < stages.length - 1) {
    let curR = stageRects[selectedStage];
    let nextR = stageRects[selectedStage + 1];
    particles.push({
      x: curR.x + curR.w,
      y: curR.y + curR.h / 2 + random(-6, 6),
      targetX: nextR.x,
      targetY: nextR.y + nextR.h / 2,
      color: GOLD,
      size: random(5, 8),
      life: 1.0
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    let dx = p.targetX - p.x;
    let dy = p.targetY - p.y;
    let dist = sqrt(dx * dx + dy * dy);
    let speed = 3;

    if (dist < speed + 2) {
      particles.splice(i, 1);
      continue;
    }

    p.x += (dx / dist) * speed;
    p.y += (dy / dist) * speed;
    p.life -= 0.01;

    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

function drawParticles() {
  noStroke();
  for (let p of particles) {
    let alpha = p.life * 220;
    fill(p.color[0], p.color[1], p.color[2], alpha);
    ellipse(p.x, p.y, p.size, p.size);
  }
}

// ---- Interaction ----

function hitTest(r) {
  return mouseX >= r.x && mouseX <= r.x + r.w &&
         mouseY >= r.y && mouseY <= r.y + r.h;
}

function mousePressed() {
  // Check reset button
  if (hitTest(resetBtn)) {
    selectedStage = -1;
    flowAnimStage = -1;
    flowAnimProgress = 0;
    particles = [];
    return;
  }

  // Check stage clicks
  for (let i = 0; i < stageRects.length; i++) {
    if (hitTest(stageRects[i])) {
      if (selectedStage === i) {
        // Deselect
        selectedStage = -1;
        flowAnimStage = -1;
        particles = [];
      } else {
        selectedStage = i;
        flowAnimStage = i;
        flowAnimProgress = 0;
        particles = [];
      }
      return;
    }
  }

  // Click on empty space clears selection
  selectedStage = -1;
  flowAnimStage = -1;
  particles = [];
}

function windowResized() {
  updateCanvasSize();
  resizeCanvas(canvasWidth, canvasHeight);
  layoutPipeline();
}
