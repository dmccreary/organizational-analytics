// Task Assignment Optimization Flow MicroSim
// Vertical flowchart showing decision process for task assignment
// with two parallel optimization paths: speed/fit vs. development
// Built-in p5.js controls
// MicroSim template version 2026.02

let canvasWidth = 400;
let drawHeight = 520;
let controlHeight = 45;
let canvasHeight = drawHeight + controlHeight;
let margin = 25;
let defaultTextSize = 16;

// Aria color scheme
const INDIGO = '#303F9F';
const INDIGO_DARK = '#1A237E';
const INDIGO_LIGHT = '#5C6BC0';
const AMBER = '#D4880F';
const AMBER_DARK = '#B06D0B';
const GOLD = '#FFD700';
const CHAMPAGNE = '#FFF8E7';

// Flowchart node definitions
let flowNodes = [];
let flowEdges = [];

// State
let hoveredNode = null;
let clickedNode = null;
let showSampleData = false;

// Controls
let sampleDataCheckbox, resetButton;

// Sample data for each stage
const sampleData = {
  0: { label: 'Task: "Build dashboard API"', detail: 'Priority: High | Skills: Python, REST, SQL | Estimated: 8h' },
  1: { label: 'Priority = "high"', detail: 'Route to urgent path (left)' },
  2: { label: '3 candidates found', detail: 'Alice (92%), Bob (78%), Carlos (65%)' },
  3: { label: '2 candidates pass', detail: 'Alice: 40% load, Bob: 55% load' },
  4: { label: 'Alice: bridging = 0.72', detail: 'Bob: bridging = 0.31' },
  5: { label: 'Assigned: Alice', detail: 'Skill: 92% | Load: 40% | Bridge: 0.72' },
  6: { label: '2 growth candidates', detail: 'Dana (1 gap: REST), Eve (2 gaps: SQL, API)' },
  7: { label: 'Both pass relaxed check', detail: 'Dana: 60% load, Eve: 45% load' },
  8: { label: 'Dana: REST aligns with Q2 goal', detail: 'Eve: SQL aligns, API partially' },
  9: { label: 'Assigned: Dana', detail: 'Learning: REST | Dev goal: Backend skills' },
  10: { label: 'Alice: load 40% -> 50%', detail: 'Event logged, metrics updated' }
};

// Cypher snippets for each node
const cypherSnippets = [
  "MATCH (t:Task)\nWHERE t.status = 'unassigned'\nRETURN t ORDER BY t.created DESC",
  "CASE WHEN t.priority\n  IN ['high','critical']\n  THEN 'urgent'\n  ELSE 'backlog'\nEND",
  "MATCH (e:Employee)-[:HAS_SKILL]->(s:Skill)\n  <-[:REQUIRES]-(t:Task)\nWITH e, count(s)*1.0/size((t)-[:REQUIRES]->()) AS fitScore\nWHERE fitScore >= 0.6",
  "MATCH (e:Employee)\nWHERE e.currentWorkload < e.maxCapacity\nRETURN e, e.maxCapacity - e.currentWorkload\n  AS available",
  "MATCH (e:Employee)\nRETURN e,\n  e.betweennessCentrality\n  AS bridgingPotential\nORDER BY bridgingPotential DESC",
  "MATCH (t:Task), (e:Employee {id: bestMatch.id})\nCREATE (t)-[:ASSIGNED_TO\n  {assignedAt: datetime()}]->(e)",
  "MATCH (t:Task)-[:REQUIRES]->(s:Skill)\nWHERE NOT (e)-[:HAS_SKILL]->(s)\nWITH e, collect(s) AS learningOps\nWHERE size(learningOps)\n  BETWEEN 1 AND 2",
  "MATCH (e:Employee)\nWHERE e.currentWorkload\n  < e.maxCapacity * 0.7\nRETURN e, e.currentWorkload",
  "MATCH (e)-[:HAS_GOAL]->(g:DevGoal)\n  -[:DEVELOPS]->(s:Skill)\n  <-[:REQUIRES]-(t:Task)\nWHERE NOT (e)-[:HAS_SKILL]->(s)\nRETURN e, s, g",
  "MATCH (t:Task), (e:Employee {id: assignee.id})\nCREATE (t)-[:ASSIGNED_TO\n  {forDevelopment: true,\n   learningSkills: gaps}]->(e)",
  "MATCH (e:Employee)-[:ASSIGNED_TO]-(t)\nSET e.currentWorkload =\n  e.currentWorkload + 1\nCREATE (e)-[:EVENT {\n  type:'assignment',\n  time:datetime()}]->(t)"
];

// Node descriptions (shown on hover)
const nodeDescriptions = [
  "Entry point: a new task arrives in the system queue, awaiting assignment to an employee.",
  "Decision gate: check if the task is high-priority/critical (urgent path) or can go to the backlog (growth path).",
  "Find employees whose skills match at least 60% of the task requirements using graph pattern matching.",
  "Filter candidates who have remaining capacity in their current workload to take on additional tasks.",
  "Calculate each candidate's betweenness centrality to add a bonus for employees who bridge organizational silos.",
  "Assign the task to the candidate with the highest combined score of skill fit, capacity, and bridging potential.",
  "Find employees with 1-2 skill gaps relative to the task, turning it into a learning opportunity.",
  "Use a relaxed capacity threshold (70%) so growth assignments don't overload employees.",
  "Match the task's learning gaps against each employee's stated development goals for the quarter.",
  "Assign the task with a development flag so managers can track growth-oriented work separately.",
  "After assignment, increment the employee's workload counter and log an event for tracking and analytics."
];

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent(document.querySelector('main'));

  buildFlowchart();

  // Controls below drawHeight
  sampleDataCheckbox = createCheckbox('Show Sample Data', false);
  sampleDataCheckbox.position(10, drawHeight + 12);
  sampleDataCheckbox.style('font-size', '13px');
  sampleDataCheckbox.style('font-family', 'Arial, Helvetica, sans-serif');
  sampleDataCheckbox.style('cursor', 'pointer');
  sampleDataCheckbox.changed(() => {
    showSampleData = sampleDataCheckbox.checked();
  });

  resetButton = createButton('Reset View');
  resetButton.position(170, drawHeight + 10);
  resetButton.mousePressed(() => {
    clickedNode = null;
  });
  resetButton.style('font-size', '13px');
  resetButton.style('padding', '5px 14px');
  resetButton.style('border-radius', '6px');
  resetButton.style('cursor', 'pointer');
  resetButton.style('background-color', INDIGO);
  resetButton.style('color', 'white');
  resetButton.style('border', '1px solid ' + INDIGO);
  resetButton.style('font-weight', 'bold');

  describe('Interactive vertical flowchart showing a task assignment optimization workflow with two paths: one optimizing for speed and skill fit, and another optimizing for employee development and growth.', LABEL);
}

function buildFlowchart() {
  // Node positions are calculated dynamically in layoutNodes()
  // Node types: 'entry', 'diamond', 'process', 'result', 'final'
  flowNodes = [
    { id: 0, label: 'Incoming Task',               type: 'entry',   col: 'center' },
    { id: 1, label: 'Priority\nCheck',              type: 'diamond', col: 'center' },
    { id: 2, label: 'Skill Match\nFilter',          type: 'process', col: 'left' },
    { id: 3, label: 'Workload\nCheck',              type: 'process', col: 'left' },
    { id: 4, label: 'Network Fit\nScore',           type: 'process', col: 'left' },
    { id: 5, label: 'Assign to\nBest Match',        type: 'result',  col: 'left' },
    { id: 6, label: 'Dev Opportunity\nScan',        type: 'process', col: 'right' },
    { id: 7, label: 'Workload Check\n(Relaxed)',    type: 'process', col: 'right' },
    { id: 8, label: 'Learning\nAlignment',          type: 'process', col: 'right' },
    { id: 9, label: 'Assign for\nGrowth',           type: 'result',  col: 'right' },
    { id: 10, label: 'Update Workload\n& Track',    type: 'final',   col: 'center' }
  ];

  flowEdges = [
    { from: 0, to: 1, edgeColor: INDIGO },
    { from: 1, to: 2, edgeColor: INDIGO, label: 'High/Critical' },
    { from: 1, to: 6, edgeColor: AMBER,  label: 'Backlog' },
    { from: 2, to: 3, edgeColor: INDIGO },
    { from: 3, to: 4, edgeColor: INDIGO },
    { from: 4, to: 5, edgeColor: INDIGO },
    { from: 6, to: 7, edgeColor: AMBER },
    { from: 7, to: 8, edgeColor: AMBER },
    { from: 8, to: 9, edgeColor: AMBER },
    { from: 5, to: 10, edgeColor: GOLD },
    { from: 9, to: 10, edgeColor: GOLD }
  ];
}

function layoutNodes() {
  let centerX = canvasWidth / 2;
  let leftX = canvasWidth * 0.25;
  let rightX = canvasWidth * 0.75;

  // Vertical spacing
  let topY = 40;
  let diamondY = 100;
  let branchStartY = 170;
  let branchGap = 68;
  let finalY = 475;

  for (let n of flowNodes) {
    if (n.col === 'center') {
      n.x = centerX;
    } else if (n.col === 'left') {
      n.x = leftX;
    } else {
      n.x = rightX;
    }

    if (n.id === 0) n.y = topY;
    else if (n.id === 1) n.y = diamondY;
    else if (n.id === 2) n.y = branchStartY;
    else if (n.id === 3) n.y = branchStartY + branchGap;
    else if (n.id === 4) n.y = branchStartY + branchGap * 2;
    else if (n.id === 5) n.y = branchStartY + branchGap * 3;
    else if (n.id === 6) n.y = branchStartY;
    else if (n.id === 7) n.y = branchStartY + branchGap;
    else if (n.id === 8) n.y = branchStartY + branchGap * 2;
    else if (n.id === 9) n.y = branchStartY + branchGap * 3;
    else if (n.id === 10) n.y = finalY;
  }

  // Node dimensions
  for (let n of flowNodes) {
    if (n.type === 'diamond') {
      n.w = 90;
      n.h = 56;
    } else {
      n.w = canvasWidth < 500 ? 110 : 130;
      n.h = 44;
    }
  }
}

function draw() {
  updateCanvasSize();
  layoutNodes();

  // Drawing area background
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
  fill(INDIGO_DARK);
  textAlign(CENTER, TOP);
  textSize(15);
  textStyle(BOLD);
  text('Task Assignment Optimization Flow', canvasWidth / 2, 8);
  textStyle(NORMAL);

  // Path labels
  textSize(10);
  fill(INDIGO);
  textStyle(ITALIC);
  textAlign(CENTER, TOP);
  text('Optimize for speed & fit', canvasWidth * 0.25, 150);
  fill(AMBER_DARK);
  text('Optimize for development', canvasWidth * 0.75, 150);
  textStyle(NORMAL);

  // Draw edges first (behind nodes)
  drawEdges();

  // Draw nodes
  for (let n of flowNodes) {
    drawNode(n);
  }

  // Draw sample data badges if enabled
  if (showSampleData) {
    drawSampleDataBadges();
  }

  // Draw hover tooltip
  if (hoveredNode !== null && clickedNode === null) {
    drawTooltip(hoveredNode);
  }

  // Draw Cypher overlay panel
  if (clickedNode !== null) {
    drawCypherPanel(clickedNode);
  }

  // Instruction text
  noStroke();
  fill('#888');
  textSize(9);
  textAlign(CENTER, TOP);
  text('Hover for description | Click for Cypher query', canvasWidth / 2, 26);

  // Update hovered node
  updateHover();
}

function drawEdges() {
  for (let e of flowEdges) {
    let fromNode = flowNodes[e.from];
    let toNode = flowNodes[e.to];

    let x1 = fromNode.x;
    let y1 = fromNode.y;
    let x2 = toNode.x;
    let y2 = toNode.y;

    // Compute start/end points based on node shapes
    if (fromNode.type === 'diamond') {
      // Exit from sides for branches
      if (toNode.col === 'left') {
        x1 = fromNode.x - fromNode.w / 2;
        y1 = fromNode.y;
      } else if (toNode.col === 'right') {
        x1 = fromNode.x + fromNode.w / 2;
        y1 = fromNode.y;
      } else {
        y1 = fromNode.y + fromNode.h / 2;
      }
    } else {
      y1 = fromNode.y + fromNode.h / 2;
    }

    // Entry to top of target node
    y2 = toNode.y - toNode.h / 2;

    stroke(e.edgeColor);
    strokeWeight(2);
    noFill();

    // For diamond to branch: draw an L-shaped path
    if (fromNode.type === 'diamond' && (toNode.col === 'left' || toNode.col === 'right')) {
      // Horizontal then vertical
      line(x1, y1, x2, y1);
      line(x2, y1, x2, y2);
      // Arrowhead at the bottom of the vertical segment
      drawArrowhead(x2, y2, PI / 2, e.edgeColor);
    } else if (fromNode.col !== 'center' && toNode.col === 'center') {
      // Convergence: from branch to center final node
      // Vertical then horizontal then vertical
      let midY = (y1 + y2) / 2 + 10;
      line(x1, y1, x1, midY);
      line(x1, midY, x2, midY);
      line(x2, midY, x2, y2);
      drawArrowhead(x2, y2, PI / 2, e.edgeColor);
    } else {
      // Straight vertical line
      line(x1, y1, x2, y2);
      drawArrowhead(x2, y2, PI / 2, e.edgeColor);
    }

    // Edge label
    if (e.label) {
      noStroke();
      fill(e.edgeColor);
      textSize(9);
      textStyle(BOLD);
      textAlign(CENTER, CENTER);
      if (fromNode.type === 'diamond' && toNode.col === 'left') {
        text(e.label, (x1 + x2) / 2, y1 - 10);
      } else if (fromNode.type === 'diamond' && toNode.col === 'right') {
        text(e.label, (x1 + x2) / 2, y1 - 10);
      }
      textStyle(NORMAL);
    }
  }
}

function drawArrowhead(x, y, angle, col) {
  fill(col);
  noStroke();
  let sz = 7;
  push();
  translate(x, y);
  rotate(angle);
  triangle(0, 0, -sz, -sz * 0.6, sz, -sz * 0.6);
  pop();
}

function drawNode(n) {
  let isHovered = (hoveredNode === n.id);
  let isClicked = (clickedNode === n.id);

  // Glow for clicked node
  if (isClicked) {
    noStroke();
    if (n.type === 'diamond') {
      fill(255, 215, 0, 60);
      drawDiamond(n.x, n.y, n.w + 12, n.h + 12);
    } else {
      fill(255, 215, 0, 60);
      rect(n.x - n.w / 2 - 4, n.y - n.h / 2 - 4, n.w + 8, n.h + 8, 14);
    }
  }

  // Shadow
  noStroke();
  fill(0, 0, 0, 25);
  if (n.type === 'diamond') {
    drawDiamond(n.x + 2, n.y + 2, n.w, n.h);
  } else {
    rect(n.x - n.w / 2 + 2, n.y - n.h / 2 + 2, n.w, n.h, 10);
  }

  // Node fill and stroke
  let fillCol, strokeCol, textCol;

  if (n.type === 'entry' || n.type === 'final') {
    fillCol = INDIGO;
    strokeCol = INDIGO_DARK;
    textCol = '#FFFFFF';
  } else if (n.type === 'diamond') {
    fillCol = AMBER;
    strokeCol = AMBER_DARK;
    textCol = '#FFFFFF';
  } else if (n.type === 'result') {
    fillCol = GOLD;
    strokeCol = '#C5A600';
    textCol = '#1A237E';
  } else {
    // process nodes
    fillCol = '#FFFFFF';
    strokeCol = n.col === 'left' ? INDIGO : AMBER;
    textCol = '#333333';
  }

  // Hover brightening
  if (isHovered) {
    stroke(GOLD);
    strokeWeight(3);
  } else {
    stroke(strokeCol);
    strokeWeight(1.5);
  }

  fill(fillCol);

  if (n.type === 'diamond') {
    drawDiamond(n.x, n.y, n.w, n.h);
  } else {
    rect(n.x - n.w / 2, n.y - n.h / 2, n.w, n.h, 10);
  }

  // Node label text
  noStroke();
  fill(textCol);
  textAlign(CENTER, CENTER);
  textSize(11);
  textStyle(BOLD);

  // Handle multi-line labels
  let lines = n.label.split('\n');
  let lineH = 13;
  let startY = n.y - (lines.length - 1) * lineH / 2;
  for (let i = 0; i < lines.length; i++) {
    text(lines[i], n.x, startY + i * lineH);
  }
  textStyle(NORMAL);
}

function drawDiamond(cx, cy, w, h) {
  beginShape();
  vertex(cx, cy - h / 2);
  vertex(cx + w / 2, cy);
  vertex(cx, cy + h / 2);
  vertex(cx - w / 2, cy);
  endShape(CLOSE);
}

function drawSampleDataBadges() {
  for (let n of flowNodes) {
    let data = sampleData[n.id];
    if (!data) continue;

    // Small badge next to node
    let badgeX = n.x + n.w / 2 + 4;
    let badgeY = n.y - 10;
    let badgeW = 110;
    let badgeH = 28;

    // For left-column nodes, put badge on the left
    if (n.col === 'left') {
      badgeX = n.x - n.w / 2 - badgeW - 4;
    }
    // For center nodes, prefer right
    if (n.col === 'center' && n.x + n.w / 2 + badgeW + 8 > canvasWidth) {
      badgeX = n.x - n.w / 2 - badgeW - 4;
    }

    // Keep within bounds
    if (badgeX < 2) badgeX = 2;
    if (badgeX + badgeW > canvasWidth - 2) badgeX = canvasWidth - badgeW - 2;

    // Draw badge
    noStroke();
    fill(255, 255, 255, 220);
    rect(badgeX, badgeY, badgeW, badgeH, 5);
    stroke('#ccc');
    strokeWeight(0.5);
    noFill();
    rect(badgeX, badgeY, badgeW, badgeH, 5);

    noStroke();
    fill(INDIGO);
    textAlign(LEFT, TOP);
    textSize(8);
    textStyle(BOLD);
    text(data.label, badgeX + 4, badgeY + 3);
    textStyle(NORMAL);
    fill('#666');
    textSize(7);
    text(data.detail, badgeX + 4, badgeY + 14);
  }
}

function drawTooltip(nodeId) {
  let n = flowNodes[nodeId];
  let desc = nodeDescriptions[nodeId];
  if (!desc) return;

  let tw = min(220, canvasWidth - 20);
  let padding = 8;

  // Word-wrap the description
  textSize(10);
  let words = desc.split(' ');
  let lines = [];
  let currentLine = '';
  let maxW = tw - padding * 2;
  for (let w of words) {
    let testLine = currentLine.length === 0 ? w : currentLine + ' ' + w;
    if (textWidth(testLine) > maxW) {
      lines.push(currentLine);
      currentLine = w;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine.length > 0) lines.push(currentLine);

  let th = 24 + lines.length * 13;

  // Position tooltip near node
  let tx = n.x + 10;
  let ty = n.y - th - 10;
  if (ty < 38) ty = n.y + n.h / 2 + 8;
  if (tx + tw > canvasWidth - 5) tx = canvasWidth - tw - 5;
  if (tx < 5) tx = 5;

  // Shadow
  noStroke();
  fill(0, 0, 0, 20);
  rect(tx + 2, ty + 2, tw, th, 6);

  // Background
  fill(255, 252, 240);
  stroke(AMBER);
  strokeWeight(1);
  rect(tx, ty, tw, th, 6);

  // Title
  noStroke();
  fill(INDIGO);
  textAlign(LEFT, TOP);
  textSize(10);
  textStyle(BOLD);
  let nodeLabel = flowNodes[nodeId].label.replace('\n', ' ');
  text(nodeLabel, tx + padding, ty + 5);
  textStyle(NORMAL);

  // Description
  fill('#444');
  textSize(10);
  for (let i = 0; i < lines.length; i++) {
    text(lines[i], tx + padding, ty + 20 + i * 13);
  }
}

function drawCypherPanel(nodeId) {
  let snippet = cypherSnippets[nodeId];
  if (!snippet) return;

  let panelW = min(canvasWidth - 20, 360);
  let panelX = (canvasWidth - panelW) / 2;

  // Calculate panel height from snippet lines
  let snippetLines = snippet.split('\n');
  let panelH = 30 + snippetLines.length * 14 + 10;
  let panelY = drawHeight - panelH - 8;

  // Semi-transparent overlay behind panel
  noStroke();
  fill(0, 0, 0, 80);
  rect(0, panelY - 10, canvasWidth, drawHeight - panelY + 10);

  // Panel background
  fill('#1E1E2E');
  stroke(INDIGO_LIGHT);
  strokeWeight(1.5);
  rect(panelX, panelY, panelW, panelH, 8);

  // Title bar
  noStroke();
  fill(INDIGO_LIGHT);
  textAlign(LEFT, TOP);
  textSize(10);
  textStyle(BOLD);
  let nodeLabel = flowNodes[nodeId].label.replace('\n', ' ');
  text('Cypher: ' + nodeLabel, panelX + 10, panelY + 6);
  textStyle(NORMAL);

  // Close hint
  fill('#999');
  textAlign(RIGHT, TOP);
  textSize(9);
  text('click to close', panelX + panelW - 10, panelY + 6);

  // Code text
  fill('#A9DC76');
  textAlign(LEFT, TOP);
  textFont('monospace');
  textSize(11);
  for (let i = 0; i < snippetLines.length; i++) {
    text(snippetLines[i], panelX + 12, panelY + 24 + i * 14);
  }
  textFont('Arial');
}

function updateHover() {
  hoveredNode = null;
  if (mouseY > drawHeight) return;

  for (let n of flowNodes) {
    if (hitTestNode(n, mouseX, mouseY)) {
      hoveredNode = n.id;
      break;
    }
  }

  // Set cursor
  if (hoveredNode !== null) {
    cursor(HAND);
  } else {
    cursor(ARROW);
  }
}

function hitTestNode(n, mx, my) {
  if (n.type === 'diamond') {
    // Diamond hit test: check if point is inside the rotated square
    let dx = abs(mx - n.x);
    let dy = abs(my - n.y);
    return (dx / (n.w / 2) + dy / (n.h / 2)) <= 1;
  } else {
    return mx >= n.x - n.w / 2 && mx <= n.x + n.w / 2 &&
           my >= n.y - n.h / 2 && my <= n.y + n.h / 2;
  }
}

function mousePressed() {
  if (mouseY > drawHeight) return;

  // If a panel is open, clicking anywhere closes it
  if (clickedNode !== null) {
    clickedNode = null;
    return;
  }

  // Check if a node was clicked
  for (let n of flowNodes) {
    if (hitTestNode(n, mouseX, mouseY)) {
      clickedNode = n.id;
      return;
    }
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
