// End-to-End Analytics Pipeline MicroSim
// Visualizes 6 stages of organizational analytics from raw events to delivery
// with continuous feedback loop, timeline bar, hover tooltips, and click-to-expand

// ---- Canvas dimensions ----
let canvasWidth = 400;
let drawHeight = 500;
let controlHeight = 50;
let canvasHeight = drawHeight + controlHeight;
let margin = 25;
let defaultTextSize = 16;

// ---- State ----
let expandedStage = -1;   // index of currently expanded stage (-1 = none)
let hoveredStage = -1;    // index of stage under the cursor
let resetBtn;

// ---- Stage definitions ----
const stages = [
  {
    name: "Raw Events",
    color: [200, 200, 200],           // light gray
    items: ["Email", "Calendar", "Chat", "Badge", "HRIS"],
    hoverText: "Chapter 3: Employee Event Streams",
    expandText: [
      "Collect raw organizational",
      "signals from multiple systems.",
      "",
      "Sources:",
      "  - Email metadata",
      "  - Calendar invites",
      "  - Chat messages",
      "  - Badge swipes",
      "  - HRIS records"
    ]
  },
  {
    name: "Staging &\nNormalization",
    color: [92, 107, 192],            // indigo-light #5C6BC0
    textWhite: true,
    items: ["Parse", "Validate", "Deduplicate", "Normalize", "Anonymize"],
    hoverText: "Chapter 4: Data Pipelines and Graph Loading",
    expandText: [
      "Clean, validate, and prepare",
      "data for graph ingestion.",
      "",
      "Steps:",
      "  - Parse raw formats",
      "  - Validate schema",
      "  - Remove duplicates",
      "  - Normalize fields",
      "  - Anonymize PII"
    ]
  },
  {
    name: "Graph\nLoading",
    color: [48, 63, 159],             // indigo #303F9F
    textWhite: true,
    items: ["Create nodes", "Create edges", "Attach props"],
    hoverText: "Chapters 4-5: Data Pipelines, Modeling",
    expandText: [
      "Build the labeled property",
      "graph from staged data.",
      "",
      "Operations:",
      "  - Create Person nodes",
      "  - Create Event nodes",
      "  - Link with edges",
      "  - Attach properties",
      "  - Set timestamps"
    ]
  },
  {
    name: "Algorithm\nExecution",
    color: [212, 136, 15],            // amber #D4880F
    textWhite: true,
    items: ["Centrality", "Community", "Pathfinding", "Similarity", "NLP"],
    hoverText: "Chapters 7-10: Algorithms, NLP, ML",
    expandText: [
      "Run graph algorithms to",
      "extract structural patterns.",
      "",
      "Algorithms:",
      "  - Centrality metrics",
      "  - Community detection",
      "  - Shortest paths",
      "  - Node similarity",
      "  - NLP enrichment"
    ]
  },
  {
    name: "Insight\nGeneration",
    color: [176, 109, 11],            // amber-dark #B06D0B
    textWhite: true,
    items: ["Health Score", "Benchmark", "Anomaly", "Alert"],
    hoverText: "Chapters 11, 14: Insights, Dashboards",
    expandText: [
      "Transform algorithm output",
      "into actionable insights.",
      "",
      "Outputs:",
      "  - Org health scores",
      "  - Peer benchmarks",
      "  - Anomaly flags",
      "  - Alert triggers"
    ]
  },
  {
    name: "Delivery",
    color: [255, 215, 0],             // gold #FFD700
    textWhite: false,
    items: ["Dashboard", "Reports", "API", "Alerts"],
    hoverText: "Chapter 14: Reporting and Dashboards",
    expandText: [
      "Deliver insights to",
      "stakeholders and systems.",
      "",
      "Channels:",
      "  - Live dashboards",
      "  - Scheduled reports",
      "  - REST / GraphQL API",
      "  - Push alerts"
    ]
  }
];

// ---- Timeline cadence labels ----
const cadences = [
  { label: "Real-time", stages: [0, 1, 2], color: [92, 107, 192] },
  { label: "Scheduled", stages: [3], color: [212, 136, 15] },
  { label: "On-demand", stages: [4, 5], color: [176, 109, 11] }
];

// ---- Setup ----
function setup() {
  updateCanvasSize();
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent(document.querySelector('main'));
  describe('Interactive pipeline diagram with six stages from Raw Events to Delivery, connected by arrows and a feedback loop.', LABEL);

  // Reset View button
  resetBtn = createButton('Reset View');
  resetBtn.parent(document.querySelector('main'));
  resetBtn.mousePressed(() => { expandedStage = -1; });
  resetBtn.style('font-size', '14px');
  resetBtn.style('padding', '6px 16px');
  resetBtn.style('margin-top', '4px');
  resetBtn.style('cursor', 'pointer');
  resetBtn.style('background', '#303F9F');
  resetBtn.style('color', 'white');
  resetBtn.style('border', 'none');
  resetBtn.style('border-radius', '4px');

  textFont('Arial');
}

// ---- Draw ----
function draw() {
  updateCanvasSize();

  // Background for draw area
  fill('aliceblue');
  stroke('silver');
  strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);

  // Background for control area
  fill('white');
  noStroke();
  rect(0, drawHeight, canvasWidth, controlHeight);

  // Title
  noStroke();
  fill(48, 63, 159);
  textAlign(CENTER, TOP);
  textSize(18);
  textStyle(BOLD);
  text("End-to-End Analytics Pipeline", canvasWidth / 2, 10);

  // Compute layout
  let stageTopY = 45;
  let stageAreaHeight = 200;
  let timelineY = drawHeight - 70;
  let arrowY = stageTopY + stageAreaHeight + 15;

  let numStages = stages.length;
  let totalGap = margin * 2;
  let usableWidth = canvasWidth - totalGap;
  let gapBetween = 8;
  let stageW = (usableWidth - gapBetween * (numStages - 1)) / numStages;
  let stageH = stageAreaHeight;

  // Detect hover
  hoveredStage = -1;
  for (let i = 0; i < numStages; i++) {
    let sx = margin + i * (stageW + gapBetween);
    if (mouseX >= sx && mouseX <= sx + stageW && mouseY >= stageTopY && mouseY <= stageTopY + stageH) {
      hoveredStage = i;
    }
  }

  // ---- Draw stages ----
  for (let i = 0; i < numStages; i++) {
    let s = stages[i];
    let sx = margin + i * (stageW + gapBetween);
    let sy = stageTopY;

    // Stage box
    let c = s.color;
    let isHovered = (hoveredStage === i);
    let isExpanded = (expandedStage === i);

    // Shadow on hover
    if (isHovered) {
      noStroke();
      fill(0, 0, 0, 40);
      rect(sx + 3, sy + 3, stageW, stageH, 8);
    }

    // Expanded overlay
    if (isExpanded) {
      // Draw expanded panel over the full draw area below the title
      drawExpandedPanel(i, stageTopY, stageAreaHeight);
      continue;  // skip normal drawing for this stage
    }

    // Normal stage box
    fill(c[0], c[1], c[2]);
    stroke(0, 0, 0, 50);
    strokeWeight(isHovered ? 2 : 1);
    rect(sx, sy, stageW, stageH, 8);

    // Stage number badge
    noStroke();
    fill(255, 255, 255, 180);
    ellipse(sx + 14, sy + 14, 20, 20);
    fill(c[0], c[1], c[2]);
    textAlign(CENTER, CENTER);
    textSize(11);
    textStyle(BOLD);
    text(i + 1, sx + 14, sy + 13);

    // Stage name
    noStroke();
    fill(s.textWhite ? 255 : 40);
    textAlign(CENTER, TOP);
    textSize(constrain(stageW * 0.18, 9, 13));
    textStyle(BOLD);
    let nameLines = s.name.split('\n');
    for (let li = 0; li < nameLines.length; li++) {
      text(nameLines[li], sx + stageW / 2, sy + 28 + li * 14);
    }

    // Sub-items
    textStyle(NORMAL);
    textSize(constrain(stageW * 0.15, 8, 11));
    textAlign(CENTER, TOP);
    fill(s.textWhite ? [255, 255, 255, 220] : [60, 60, 60]);
    let itemStartY = sy + 28 + nameLines.length * 14 + 10;
    for (let j = 0; j < s.items.length; j++) {
      noStroke();
      text(s.items[j], sx + stageW / 2, itemStartY + j * 14);
    }

    // "Click to expand" hint at bottom
    noStroke();
    fill(s.textWhite ? [255, 255, 255, 120] : [100, 100, 100, 150]);
    textSize(8);
    textAlign(CENTER, BOTTOM);
    textStyle(ITALIC);
    text("click to expand", sx + stageW / 2, sy + stageH - 4);
  }

  // ---- Draw arrows between stages (skip if a stage is expanded) ----
  if (expandedStage === -1) {
    for (let i = 0; i < numStages - 1; i++) {
      let x1 = margin + i * (stageW + gapBetween) + stageW;
      let x2 = margin + (i + 1) * (stageW + gapBetween);
      let ay = stageTopY + stageH / 2;
      let midX = (x1 + x2) / 2;

      stroke(80);
      strokeWeight(2);
      line(x1, ay, x2 - 4, ay);

      // Arrowhead
      fill(80);
      noStroke();
      triangle(x2 - 2, ay, x2 - 8, ay - 4, x2 - 8, ay + 4);
    }

    // ---- Feedback arrow from Stage 6 back to Stage 1 ----
    let feedbackY = stageTopY + stageH + 12;
    let x6Right = margin + 5 * (stageW + gapBetween) + stageW;
    let x1Left = margin;

    stroke(48, 63, 159, 160);
    strokeWeight(2);
    noFill();

    // Curved path below stages
    let curveBottom = feedbackY + 20;
    beginShape();
    vertex(x6Right - stageW / 2, stageTopY + stageH);
    bezierVertex(
      x6Right - stageW / 2, curveBottom + 10,
      x1Left + stageW / 2, curveBottom + 10,
      x1Left + stageW / 2, stageTopY + stageH
    );
    endShape();

    // Arrowhead at Stage 1 end
    fill(48, 63, 159, 160);
    noStroke();
    let arrX = x1Left + stageW / 2;
    let arrY = stageTopY + stageH;
    triangle(arrX, arrY + 2, arrX - 5, arrY + 10, arrX + 5, arrY + 10);

    // Feedback label
    noStroke();
    fill(48, 63, 159, 200);
    textAlign(CENTER, TOP);
    textSize(11);
    textStyle(ITALIC);
    text("Continuous Improvement", canvasWidth / 2, curveBottom + 2);
  }

  // ---- Timeline bar ----
  let tlY = timelineY;
  let tlH = 28;

  // Timeline background
  noStroke();
  fill(240);
  rect(margin, tlY, canvasWidth - margin * 2, tlH, 4);

  // Timeline label
  fill(80);
  textAlign(LEFT, BOTTOM);
  textSize(11);
  textStyle(BOLD);
  noStroke();
  text("Cadence:", margin, tlY - 3);

  // Draw cadence segments
  for (let c of cadences) {
    let minIdx = Math.min(...c.stages);
    let maxIdx = Math.max(...c.stages);
    let cx1 = margin + minIdx * (stageW + gapBetween);
    let cx2 = margin + maxIdx * (stageW + gapBetween) + stageW;
    let segW = cx2 - cx1;

    fill(c.color[0], c.color[1], c.color[2], 180);
    noStroke();
    rect(cx1, tlY, segW, tlH, 4);

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(constrain(segW * 0.12, 9, 12));
    textStyle(BOLD);
    noStroke();
    text(c.label, cx1 + segW / 2, tlY + tlH / 2 - 1);
  }

  // ---- Hover tooltip ----
  if (hoveredStage >= 0 && expandedStage === -1) {
    let s = stages[hoveredStage];
    let tipText = s.hoverText;
    textSize(12);
    textStyle(NORMAL);
    let tw = textWidth(tipText) + 16;
    let th = 26;
    let tx = mouseX - tw / 2;
    let ty = mouseY - th - 10;

    // Keep tooltip on screen
    tx = constrain(tx, 4, canvasWidth - tw - 4);
    ty = constrain(ty, 4, drawHeight - th - 4);

    // Tooltip box
    fill(30, 30, 30, 220);
    noStroke();
    rect(tx, ty, tw, th, 6);

    // Tooltip text
    fill(255);
    textAlign(CENTER, CENTER);
    noStroke();
    text(tipText, tx + tw / 2, ty + th / 2 - 1);
  }

  // ---- Cursor hint ----
  if (hoveredStage >= 0 && expandedStage === -1) {
    cursor(HAND);
  } else {
    cursor(ARROW);
  }
}

// ---- Draw expanded detail panel for a stage ----
function drawExpandedPanel(idx, topY, areaH) {
  let s = stages[idx];
  let c = s.color;
  let panelX = margin;
  let panelW = canvasWidth - margin * 2;
  let panelY = topY;
  let panelH = areaH;

  // Panel background
  fill(c[0], c[1], c[2]);
  stroke(0, 0, 0, 60);
  strokeWeight(2);
  rect(panelX, panelY, panelW, panelH, 10);

  // Stage number and name
  noStroke();
  fill(s.textWhite ? 255 : 40);
  textAlign(LEFT, TOP);
  textSize(20);
  textStyle(BOLD);
  let nameOneLine = s.name.replace('\n', ' ');
  text("Stage " + (idx + 1) + ": " + nameOneLine, panelX + 16, panelY + 14);

  // Chapter reference
  textSize(12);
  textStyle(ITALIC);
  fill(s.textWhite ? [255, 255, 255, 180] : [80, 80, 80]);
  noStroke();
  text(s.hoverText, panelX + 16, panelY + 40);

  // Divider line
  stroke(s.textWhite ? [255, 255, 255, 80] : [0, 0, 0, 40]);
  strokeWeight(1);
  line(panelX + 16, panelY + 58, panelX + panelW - 16, panelY + 58);

  // Expanded description lines
  noStroke();
  fill(s.textWhite ? [255, 255, 255, 230] : [50, 50, 50]);
  textAlign(LEFT, TOP);
  textSize(14);
  textStyle(NORMAL);
  for (let li = 0; li < s.expandText.length; li++) {
    noStroke();
    text(s.expandText[li], panelX + 20, panelY + 68 + li * 18);
  }

  // Close hint
  noStroke();
  fill(s.textWhite ? [255, 255, 255, 120] : [100, 100, 100]);
  textAlign(RIGHT, BOTTOM);
  textSize(11);
  textStyle(ITALIC);
  text("click elsewhere or press Reset View to close", panelX + panelW - 10, panelY + panelH - 6);
}

// ---- Mouse interaction ----
function mousePressed() {
  // Check if a stage was clicked
  let numStages = stages.length;
  let gapBetween = 8;
  let usableWidth = canvasWidth - margin * 2;
  let stageW = (usableWidth - gapBetween * (numStages - 1)) / numStages;
  let stageTopY = 45;
  let stageH = 200;

  for (let i = 0; i < numStages; i++) {
    let sx = margin + i * (stageW + gapBetween);
    if (mouseX >= sx && mouseX <= sx + stageW && mouseY >= stageTopY && mouseY <= stageTopY + stageH) {
      if (expandedStage === i) {
        expandedStage = -1;  // collapse if already expanded
      } else {
        expandedStage = i;   // expand this stage
      }
      return;
    }
  }

  // Click outside any stage collapses the panel
  if (expandedStage >= 0) {
    expandedStage = -1;
  }
}

// ---- Responsive resize ----
function windowResized() {
  updateCanvasSize();
  resizeCanvas(canvasWidth, canvasHeight);
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  canvasWidth = Math.floor(container.width);
}
