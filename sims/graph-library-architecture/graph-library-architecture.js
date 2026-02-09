// Graph Library Architecture MicroSim
// Displays a 5-tier layered architecture diagram for an organizational
// analytics graph library. Hover tiers for descriptions, click Tier 2
// query categories to expand individual queries.

// === Canvas dimensions ===
let canvasWidth = 400;
let drawHeight = 450;
let controlHeight = 50;
let canvasHeight = drawHeight + controlHeight;
let margin = 25;
let defaultTextSize = 16;

// === Aria color palette ===
const INDIGO      = '#303F9F';
const INDIGO_DARK = '#1A237E';
const AMBER       = '#D4880F';
const AMBER_DARK  = '#B06D0B';
const GOLD        = '#FFD700';
const CHAMPAGNE   = '#FFF8E7';

// === Tier definitions (bottom to top: index 0 = bottom) ===
const tiers = [
  {
    name: 'Graph Database',
    color: INDIGO,
    textColor: '#FFFFFF',
    boxes: ['Graph Database (Neo4j / Memgraph)'],
    description: 'Neo4j or similar graph database storing organizational nodes and relationships'
  },
  {
    name: 'Query Library',
    color: AMBER,
    textColor: '#FFFFFF',
    boxes: ['Centrality', 'Community', 'Pathfinding', 'Similarity', 'NLP-Enriched'],
    description: 'Parameterized Cypher query templates organized by analytical domain'
  },
  {
    name: 'Functions & Scoring',
    color: INDIGO,
    textColor: '#FFFFFF',
    boxes: ['Health Score Calculator', 'Benchmark Engine', 'Alert Evaluator'],
    description: 'Python functions that combine query results into composite metrics'
  },
  {
    name: 'API Layer',
    color: AMBER,
    textColor: '#FFFFFF',
    boxes: ['REST / GraphQL API'],
    description: 'HTTP endpoints exposing library queries to external consumers'
  },
  {
    name: 'Consumers',
    color: GOLD,
    textColor: '#000000',
    boxes: ['Dashboards', 'HRIS Integration', 'Custom Applications'],
    description: 'Applications that consume analytics: dashboards, HRIS, custom apps'
  }
];

// === Expanded queries for Tier 2 (Query Library) categories ===
const expandedQueries = {
  'Centrality':   ['degree_centrality', 'betweenness', 'pagerank'],
  'Community':    ['detect_communities', 'find_silos', 'bridges'],
  'Pathfinding':  ['shortest_path', 'all_paths', 'critical_path'],
  'Similarity':   ['role_similarity', 'comm_patterns'],
  'NLP-Enriched': ['sentiment_trends', 'topic_clusters']
};

// === State ===
let hoveredTierIndex = -1;       // which tier is hovered (-1 = none)
let expandedCategory = null;     // which Tier 2 category is expanded (null = none)
let resetButton;                 // p5 button for resetting view

// Computed layout values (recalculated in draw)
let tierHeight, tierGap, tierStartY;
let sideBoxWidth, sideBoxHeight;

// Store bounding boxes for hit-testing (filled during draw)
let tierBoxBounds = [];  // array of arrays of {x,y,w,h,label} per tier

// =========================================================
// setup
// =========================================================
function setup() {
  updateCanvasSize();
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent(document.querySelector('main'));

  // Reset button in control area
  resetButton = createButton('Reset View');
  resetButton.parent(document.querySelector('main'));
  resetButton.mousePressed(() => { expandedCategory = null; });
  resetButton.style('font-size', '14px');
  resetButton.style('padding', '6px 16px');
  resetButton.style('background', INDIGO);
  resetButton.style('color', '#fff');
  resetButton.style('border', 'none');
  resetButton.style('border-radius', '4px');
  resetButton.style('cursor', 'pointer');

  textFont('Arial');
  describe('Layered architecture diagram with five tiers showing the structure of an organizational analytics graph library', LABEL);
}

// =========================================================
// draw
// =========================================================
function draw() {
  updateCanvasSize();

  // --- Background for draw area ---
  fill('aliceblue');
  noStroke();
  rect(0, 0, canvasWidth, drawHeight);

  // --- Background for control area ---
  fill('white');
  noStroke();
  rect(0, drawHeight, canvasWidth, controlHeight);

  // Position the reset button centered in the control area
  resetButton.position(
    resetButton.elt.offsetParent
      ? (canvasWidth / 2 - resetButton.elt.offsetWidth / 2)
      : canvasWidth / 2 - 50,
    drawHeight + (controlHeight - 30) / 2
  );

  // === Layout calculations ===
  const numTiers = tiers.length;
  tierHeight = 44;
  tierGap = (drawHeight - margin * 2 - numTiers * tierHeight) / (numTiers - 1);
  // Tiers draw bottom-to-top: tier index 0 is at the bottom
  tierStartY = drawHeight - margin - tierHeight; // y of bottom tier top-edge

  const drawWidth = canvasWidth - margin * 2;

  // Side boxes (Tests on left, Config on right)
  sideBoxWidth = 70;
  sideBoxHeight = 34;

  // Clear bounding boxes
  tierBoxBounds = [];

  // === Draw each tier ===
  for (let i = 0; i < numTiers; i++) {
    const tier = tiers[i];
    const ty = tierStartY - i * (tierHeight + tierGap); // top y of tier band
    const numBoxes = tier.boxes.length;
    const boxGap = 8;
    const totalGap = (numBoxes - 1) * boxGap;

    // Available width for boxes (leave room for side boxes at tiers 1-2)
    let availW = drawWidth;
    let offsetX = margin;
    if (i === 1 || i === 2) {
      availW = drawWidth - sideBoxWidth * 2 - 20; // narrower for side boxes
      offsetX = margin + sideBoxWidth + 10;
    }

    const boxW = (availW - totalGap) / numBoxes;
    let bounds = [];

    for (let j = 0; j < numBoxes; j++) {
      const bx = offsetX + j * (boxW + boxGap);
      const by = ty;

      // Determine if this box is hovered
      const isHovered = (hoveredTierIndex === i);

      // Draw box
      noStroke();
      fill(tier.color);
      if (isHovered) {
        // Lighten on hover
        fill(i === 0 || i === 2 ? '#5C6BC0' : (i === 4 ? '#FFE44D' : '#E6A020'));
      }
      rect(bx, by, boxW, tierHeight, 6);

      // Draw label
      noStroke();
      fill(tier.textColor);
      textAlign(CENTER, CENTER);
      textSize(constrain(boxW / 8, 9, 14));
      text(tier.boxes[j], bx + boxW / 2, by + tierHeight / 2);

      bounds.push({ x: bx, y: by, w: boxW, h: tierHeight, label: tier.boxes[j] });
    }
    tierBoxBounds.push(bounds);
  }

  // === Draw side boxes: Tests (left) and Config (right) ===
  drawSideBox('Tests', margin, 1, 2, '#4CAF50', '#FFFFFF');
  drawSideBox('Config &\nThresholds', canvasWidth - margin - sideBoxWidth, 1, 2, '#F44336', '#FFFFFF');

  // === Draw upward arrows between tiers ===
  drawTierArrows();

  // === Draw expanded queries if a Tier 2 category is selected ===
  if (expandedCategory && expandedQueries[expandedCategory]) {
    drawExpandedPanel();
  }

  // === Draw hover tooltip ===
  drawTooltip();

  // === Detect hover tier ===
  detectHoverTier();
}

// =========================================================
// drawSideBox - draws a side utility box connected to tiers
// =========================================================
function drawSideBox(label, bx, tierIdxLow, tierIdxHigh, boxColor, textCol) {
  // Vertical center between the two connected tiers
  const yLow  = tierStartY - tierIdxLow  * (tierHeight + tierGap);
  const yHigh = tierStartY - tierIdxHigh * (tierHeight + tierGap);
  const cy = (yLow + yHigh) / 2 + tierHeight / 2;
  const by = cy - sideBoxHeight / 2;

  // Box
  noStroke();
  fill(boxColor);
  rect(bx, by, sideBoxWidth, sideBoxHeight, 4);

  // Label
  noStroke();
  fill(textCol);
  textAlign(CENTER, CENTER);
  textSize(10);
  text(label, bx + sideBoxWidth / 2, by + sideBoxHeight / 2);

  // Dashed connecting lines to tier edges
  stroke(boxColor);
  strokeWeight(1.5);
  drawingContext.setLineDash([4, 4]);

  // Determine x attachment points
  // If on the left side, connect right edge of side box to left edge of tier boxes
  // If on the right side, connect left edge of side box to right edge of tier boxes
  const isLeft = (bx < canvasWidth / 2);
  for (let idx = tierIdxLow; idx <= tierIdxHigh; idx++) {
    if (tierBoxBounds[idx] && tierBoxBounds[idx].length > 0) {
      const tb = isLeft ? tierBoxBounds[idx][0] : tierBoxBounds[idx][tierBoxBounds[idx].length - 1];
      const fromX = isLeft ? bx + sideBoxWidth : bx;
      const toX   = isLeft ? tb.x : tb.x + tb.w;
      const toY   = tb.y + tb.h / 2;
      line(fromX, cy, toX, toY);
    }
  }

  drawingContext.setLineDash([]);
  strokeWeight(1);
  noStroke();
}

// =========================================================
// drawTierArrows - arrows flowing upward between tiers
// =========================================================
function drawTierArrows() {
  stroke('#666666');
  strokeWeight(1.5);
  fill('#666666');

  for (let i = 0; i < tiers.length - 1; i++) {
    const lowerBounds = tierBoxBounds[i];
    const upperBounds = tierBoxBounds[i + 1];
    if (!lowerBounds || !upperBounds) continue;

    // Connect each lower box to each upper box (center to center)
    for (let lb of lowerBounds) {
      for (let ub of upperBounds) {
        const x1 = lb.x + lb.w / 2;
        const y1 = lb.y;                 // top of lower box
        const x2 = ub.x + ub.w / 2;
        const y2 = ub.y + ub.h;          // bottom of upper box

        // Arrow line
        line(x1, y1, x2, y2);

        // Arrowhead (small triangle pointing up)
        const angle = atan2(y2 - y1, x2 - x1);
        const aSize = 6;
        noStroke();
        triangle(
          x2, y2,
          x2 - aSize * cos(angle - 0.4), y2 - aSize * sin(angle - 0.4),
          x2 - aSize * cos(angle + 0.4), y2 - aSize * sin(angle + 0.4)
        );
        stroke('#666666');
      }
    }
  }
  noStroke();
}

// =========================================================
// drawExpandedPanel - shows individual queries for a clicked category
// =========================================================
function drawExpandedPanel() {
  const queries = expandedQueries[expandedCategory];
  if (!queries) return;

  // Find the bounding box of the clicked category in tier 1 (index 1)
  let catBox = null;
  if (tierBoxBounds[1]) {
    for (let b of tierBoxBounds[1]) {
      if (b.label === expandedCategory) { catBox = b; break; }
    }
  }
  if (!catBox) return;

  const panelW = 150;
  const lineH = 22;
  const panelH = queries.length * lineH + 12;
  let px = catBox.x + catBox.w / 2 - panelW / 2;
  let py = catBox.y - panelH - 6;

  // Keep panel within canvas bounds
  px = constrain(px, margin, canvasWidth - margin - panelW);
  py = constrain(py, 4, drawHeight - panelH - 4);

  // Panel background
  noStroke();
  fill(255, 255, 255, 240);
  stroke(AMBER);
  strokeWeight(2);
  rect(px, py, panelW, panelH, 6);
  noStroke();

  // Category title
  fill(AMBER_DARK);
  textAlign(CENTER, TOP);
  textSize(12);
  textStyle(BOLD);
  text(expandedCategory, px + panelW / 2, py + 4);

  // Query items
  textStyle(NORMAL);
  fill('#333333');
  textAlign(LEFT, TOP);
  textSize(11);
  for (let q = 0; q < queries.length; q++) {
    text('  ' + queries[q] + '()', px + 8, py + 20 + q * lineH);
  }
  textStyle(NORMAL);
}

// =========================================================
// drawTooltip - shows tier description on hover
// =========================================================
function drawTooltip() {
  if (hoveredTierIndex < 0 || hoveredTierIndex >= tiers.length) return;
  if (mouseY > drawHeight) return; // no tooltip in control area

  const desc = tiers[hoveredTierIndex].description;
  textSize(12);
  const tw = textWidth(desc) + 16;
  const th = 26;
  let tx = mouseX + 14;
  let ty = mouseY - 30;

  // Keep tooltip on screen
  if (tx + tw > canvasWidth - 4) tx = canvasWidth - tw - 4;
  if (ty < 4) ty = 4;

  noStroke();
  fill(0, 0, 0, 200);
  rect(tx, ty, tw, th, 4);

  noStroke();
  fill(255);
  textAlign(LEFT, CENTER);
  textSize(12);
  text(desc, tx + 8, ty + th / 2);
}

// =========================================================
// detectHoverTier - check which tier the mouse is over
// =========================================================
function detectHoverTier() {
  hoveredTierIndex = -1;
  for (let i = 0; i < tierBoxBounds.length; i++) {
    for (let b of tierBoxBounds[i]) {
      if (mouseX >= b.x && mouseX <= b.x + b.w &&
          mouseY >= b.y && mouseY <= b.y + b.h) {
        hoveredTierIndex = i;
        return;
      }
    }
  }
}

// =========================================================
// mousePressed - click to expand Tier 2 categories
// =========================================================
function mousePressed() {
  // Only check Tier 2 (index 1) boxes
  if (tierBoxBounds[1]) {
    for (let b of tierBoxBounds[1]) {
      if (mouseX >= b.x && mouseX <= b.x + b.w &&
          mouseY >= b.y && mouseY <= b.y + b.h) {
        if (expandedCategory === b.label) {
          expandedCategory = null; // toggle off
        } else {
          expandedCategory = b.label;
        }
        return;
      }
    }
  }
}

// =========================================================
// windowResized
// =========================================================
function windowResized() {
  updateCanvasSize();
  resizeCanvas(canvasWidth, canvasHeight);
}

// =========================================================
// updateCanvasSize
// =========================================================
function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  canvasWidth = Math.floor(container.width);
  canvasHeight = drawHeight + controlHeight;
}
