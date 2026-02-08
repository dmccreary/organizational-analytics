// Relational vs Graph Database MicroSim
// Side-by-side comparison of relational and graph representations

let canvasWidth = 400;
let drawHeight = 450;
let controlHeight = 50;
let canvasHeight = drawHeight + controlHeight;
let margin = 15;
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

// Employees
const employees = [
  { id: 'E1', name: 'Maria', dept: 'Engineering' },
  { id: 'E2', name: 'James', dept: 'Engineering' },
  { id: 'E3', name: 'Aisha', dept: 'Product' },
  { id: 'E4', name: 'Carlos', dept: 'Design' },
  { id: 'E5', name: 'Li', dept: 'Product' }
];

const departments = ['Engineering', 'Product', 'Design'];

// Communication edges [from, to]
const commEdges = [
  ['E1', 'E2'], ['E1', 'E3'], ['E2', 'E3'],
  ['E3', 'E5'], ['E4', 'E1'], ['E4', 'E5'],
  ['E5', 'E2'], ['E2', 'E4']
];

// Scenarios
const scenarios = [
  {
    label: '1-Hop',
    desc: "Who does Maria talk to?",
    sql: "SELECT e2.name\nFROM comm c\nJOIN emp e2 ON c.to=e2.id\nWHERE c.from='E1'",
    cypher: "MATCH (m:Emp {name:'Maria'})\n      -[:COMM]->(p)\nRETURN p.name",
    rdbmsTime: 10,
    graphTime: 5,
    highlight: { nodes: ['E1', 'E2', 'E3'], edges: [0, 1] }
  },
  {
    label: '2-Hop',
    desc: "Friends of Maria's friends?",
    sql: "SELECT DISTINCT e3.name\nFROM comm c1\nJOIN comm c2\n  ON c1.to=c2.from\nJOIN emp e3\n  ON c2.to=e3.id\nWHERE c1.from='E1'",
    cypher: "MATCH (m:Emp {name:'Maria'})\n      -[:COMM*2]->(fof)\nRETURN DISTINCT fof.name",
    rdbmsTime: 150,
    graphTime: 8,
    highlight: { nodes: ['E1', 'E2', 'E3', 'E4', 'E5'], edges: [0, 1, 2, 3, 7] }
  },
  {
    label: 'Path',
    desc: "Shortest path Maria to Carlos?",
    sql: "-- Recursive CTE needed\n-- Complex, error-prone\n-- Performance degrades\n-- exponentially",
    cypher: "MATCH path=\n  shortestPath(\n  (a:Emp {name:'Maria'})\n  -[:COMM*]-(b:Emp\n  {name:'Carlos'}))\nRETURN path",
    rdbmsTime: 3000,
    graphTime: 12,
    highlight: { nodes: ['E1', 'E4'], edges: [4], path: ['E1', 'E4'] }
  },
  {
    label: 'Aggregate',
    desc: "Most connected department?",
    sql: "SELECT d.name,\n  COUNT(*) as conns\nFROM comm c\nJOIN emp e ON c.from=e.id\nJOIN dept d ON e.dept=d.id\nGROUP BY d.name\nORDER BY conns DESC",
    cypher: "MATCH (e:Emp)-[c:COMM]-()\nRETURN e.dept,\n  count(c) as conns\nORDER BY conns DESC",
    rdbmsTime: 500,
    graphTime: 15,
    highlight: { nodes: ['E1', 'E2', 'E3', 'E4', 'E5'], edges: [0, 1, 2, 3, 4, 5, 6, 7] }
  }
];

let selectedScenario = 0;
let animProgress = 0;
let animSpeed = 0.015;
let buttons = [];

// Graph node positions (normalized 0-1, mapped to right half)
const nodePositions = {
  'E1': { x: 0.35, y: 0.25 },
  'E2': { x: 0.65, y: 0.15 },
  'E3': { x: 0.75, y: 0.50 },
  'E4': { x: 0.25, y: 0.65 },
  'E5': { x: 0.60, y: 0.75 }
};

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent(document.querySelector('main'));
  describe('Side-by-side comparison of relational database tables and graph database network for the same organizational data, with scenario buttons to compare query performance.', LABEL);
  textFont('Arial');
}

function draw() {
  updateCanvasSize();

  // Draw area
  fill(CHAMPAGNE);
  noStroke();
  rect(0, 0, canvasWidth, drawHeight);

  // Control area
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  let halfW = canvasWidth / 2;
  let fontSize = constrain(canvasWidth * 0.02, 9, 13);

  // Divider line
  stroke('#ddd');
  strokeWeight(2);
  line(halfW, 0, halfW, drawHeight);

  // Headers
  noStroke();
  fill(INDIGO);
  rect(0, 0, halfW, 28);
  fill(AMBER);
  rect(halfW, 0, halfW, 28);

  fill('white');
  textAlign(CENTER, CENTER);
  textSize(fontSize + 2);
  textStyle(BOLD);
  text('Relational View', halfW / 2, 14);
  text('Graph View', halfW + halfW / 2, 14);
  textStyle(NORMAL);

  // Scenario description
  let sc = scenarios[selectedScenario];
  fill(INDIGO_DARK);
  textAlign(CENTER, TOP);
  textSize(fontSize + 1);
  textStyle(BOLD);
  text(sc.desc, canvasWidth / 2, 34);
  textStyle(NORMAL);

  // Left side: Relational view
  drawRelationalView(sc, 5, 55, halfW - 10, drawHeight - 115, fontSize);

  // Right side: Graph view
  drawGraphView(sc, halfW + 5, 55, halfW - 10, drawHeight - 115, fontSize);

  // Timing comparison bar at bottom of draw area
  drawTimingBar(sc, 5, drawHeight - 55, canvasWidth - 10, 50, fontSize);

  // Draw scenario buttons in control area
  drawButtons(fontSize);

  // Advance animation
  if (animProgress < 1) {
    animProgress += animSpeed;
    if (animProgress > 1) animProgress = 1;
  }
}

function drawRelationalView(sc, rx, ry, rw, rh, fontSize) {
  // SQL query box
  let sqlBoxH = rh * 0.45;
  noStroke();
  fill(245, 245, 255);
  rect(rx, ry, rw, sqlBoxH, 5);
  stroke('#ccc');
  strokeWeight(1);
  noFill();
  rect(rx, ry, rw, sqlBoxH, 5);

  // SQL label
  noStroke();
  fill(INDIGO);
  textAlign(LEFT, TOP);
  textSize(fontSize * 0.85);
  textStyle(BOLD);
  text('SQL Query:', rx + 8, ry + 5);
  textStyle(NORMAL);

  // SQL code
  fill('#333');
  textSize(constrain(fontSize * 0.78, 8, 11));
  textAlign(LEFT, TOP);
  let lines = sc.sql.split('\n');
  for (let i = 0; i < lines.length; i++) {
    text(lines[i], rx + 8, ry + 20 + i * (fontSize + 2));
  }

  // Mini table representation
  let tableY = ry + sqlBoxH + 10;
  let tableH = rh - sqlBoxH - 10;

  // Draw a simplified Employees mini-table
  let miniTableW = rw * 0.9;
  let miniTableX = rx + (rw - miniTableW) / 2;
  let miniRowH = constrain(fontSize * 1.6, 14, 20);

  // Table header
  noStroke();
  fill(INDIGO);
  rect(miniTableX, tableY, miniTableW, miniRowH, 4, 4, 0, 0);
  fill('white');
  textAlign(CENTER, CENTER);
  textSize(fontSize * 0.8);
  textStyle(BOLD);
  text('Employees', miniTableX + miniTableW / 2, tableY + miniRowH / 2);
  textStyle(NORMAL);

  // Table rows
  let cols = ['id', 'name', 'dept'];
  let colW = miniTableW / cols.length;

  // Column headers
  fill('#E8EAF6');
  noStroke();
  rect(miniTableX, tableY + miniRowH, miniTableW, miniRowH);
  fill(INDIGO_DARK);
  textSize(fontSize * 0.7);
  textStyle(BOLD);
  for (let c = 0; c < cols.length; c++) {
    text(cols[c], miniTableX + c * colW + colW / 2, tableY + miniRowH + miniRowH / 2);
  }
  textStyle(NORMAL);

  // Data rows
  for (let r = 0; r < employees.length; r++) {
    let rowY = tableY + miniRowH * 2 + r * miniRowH;
    let isHL = sc.highlight.nodes.indexOf(employees[r].id) !== -1 && animProgress > r / employees.length;

    noStroke();
    fill(isHL ? color(255, 215, 0, 80) : (r % 2 === 0 ? 'white' : color(248, 248, 255)));
    rect(miniTableX, rowY, miniTableW, miniRowH);

    fill(isHL ? INDIGO_DARK : '#555');
    textSize(fontSize * 0.7);
    let emp = employees[r];
    let vals = [emp.id, emp.name, emp.dept];
    for (let c = 0; c < vals.length; c++) {
      text(vals[c], miniTableX + c * colW + colW / 2, rowY + miniRowH / 2);
    }
  }

  // Table border
  stroke('#ccc');
  strokeWeight(1);
  noFill();
  rect(miniTableX, tableY + miniRowH, miniTableW, miniRowH * (employees.length + 1));
}

function drawGraphView(sc, gx, gy, gw, gh, fontSize) {
  let nodeR = constrain(canvasWidth * 0.028, 14, 24);

  // Draw edges first
  for (let i = 0; i < commEdges.length; i++) {
    let fromId = commEdges[i][0];
    let toId = commEdges[i][1];
    let fromPos = getNodeScreenPos(fromId, gx, gy, gw, gh);
    let toPos = getNodeScreenPos(toId, gx, gy, gw, gh);

    let isHL = sc.highlight.edges.indexOf(i) !== -1 && animProgress > 0.2;
    let edgeAlpha = isHL ? 255 * min(1, animProgress * 2) : 60;

    stroke(isHL ? color(212, 136, 15, edgeAlpha) : color(150, 150, 150, 60));
    strokeWeight(isHL ? 2.5 : 1);

    // Draw arrow
    let angle = atan2(toPos.y - fromPos.y, toPos.x - fromPos.x);
    let endX = toPos.x - cos(angle) * nodeR;
    let endY = toPos.y - sin(angle) * nodeR;
    let startX = fromPos.x + cos(angle) * nodeR;
    let startY = fromPos.y + sin(angle) * nodeR;

    line(startX, startY, endX, endY);

    // Arrowhead
    if (isHL) {
      fill(AMBER);
      noStroke();
      push();
      translate(endX, endY);
      rotate(angle);
      triangle(0, 0, -8, -3, -8, 3);
      pop();
    }
  }

  // Draw nodes
  for (let emp of employees) {
    let pos = getNodeScreenPos(emp.id, gx, gy, gw, gh);
    let isHL = sc.highlight.nodes.indexOf(emp.id) !== -1;
    let nodeAlpha = isHL ? min(255, animProgress * 400) : 180;

    // Node shadow
    noStroke();
    fill(0, 0, 0, 15);
    ellipse(pos.x + 2, pos.y + 2, nodeR * 2);

    // Node fill
    let isDept = false;
    if (isHL && animProgress > 0.1) {
      fill(255, 215, 0, nodeAlpha); // Gold for highlighted
      stroke(AMBER_DARK);
    } else {
      fill(color(92, 107, 192, nodeAlpha)); // Indigo light
      stroke(INDIGO);
    }
    strokeWeight(2);
    ellipse(pos.x, pos.y, nodeR * 2);

    // Node label
    noStroke();
    fill(isHL ? INDIGO_DARK : '#333');
    textAlign(CENTER, CENTER);
    textSize(constrain(fontSize * 0.8, 8, 11));
    textStyle(BOLD);
    text(emp.name, pos.x, pos.y);
    textStyle(NORMAL);

    // Department label below
    fill(isHL ? AMBER_DARK : '#888');
    textSize(constrain(fontSize * 0.6, 6, 9));
    text(emp.dept, pos.x, pos.y + nodeR + 8);
  }

  // Cypher query box at top
  let cypherH = gh * 0.33;
  noStroke();
  fill(255, 248, 230, 200);
  rect(gx, gy + gh - cypherH, gw, cypherH, 5);
  stroke('#ddd');
  strokeWeight(1);
  noFill();
  rect(gx, gy + gh - cypherH, gw, cypherH, 5);

  noStroke();
  fill(AMBER_DARK);
  textAlign(LEFT, TOP);
  textSize(fontSize * 0.85);
  textStyle(BOLD);
  text('Cypher Query:', gx + 8, gy + gh - cypherH + 5);
  textStyle(NORMAL);

  fill('#333');
  textSize(constrain(fontSize * 0.78, 8, 11));
  let lines = sc.cypher.split('\n');
  for (let i = 0; i < lines.length; i++) {
    text(lines[i], gx + 8, gy + gh - cypherH + 20 + i * (fontSize + 2));
  }
}

function getNodeScreenPos(nodeId, gx, gy, gw, gh) {
  let np = nodePositions[nodeId];
  let graphAreaH = gh * 0.6; // Only use top 60% for nodes (bottom has cypher box)
  return {
    x: gx + np.x * gw,
    y: gy + np.y * graphAreaH
  };
}

function drawTimingBar(sc, bx, by, bw, bh, fontSize) {
  // Background
  noStroke();
  fill(245, 245, 245);
  rect(bx, by, bw, bh, 5);

  let barW = bw * 0.35;
  let barH = 16;
  let barX = bx + bw * 0.35;
  let maxTime = max(sc.rdbmsTime, sc.graphTime);

  // RDBMS bar
  let rdbmsBarW = map(sc.rdbmsTime, 0, maxTime, 10, barW);
  fill(INDIGO);
  rect(barX, by + 6, rdbmsBarW * min(1, animProgress * 2), barH, 3);

  fill(INDIGO_DARK);
  textAlign(RIGHT, CENTER);
  textSize(fontSize * 0.85);
  text('RDBMS:', barX - 5, by + 6 + barH / 2);

  fill(INDIGO_DARK);
  textAlign(LEFT, CENTER);
  text(formatTime(sc.rdbmsTime), barX + rdbmsBarW + 8, by + 6 + barH / 2);

  // Graph bar
  let graphBarW = map(sc.graphTime, 0, maxTime, 10, barW);
  fill(AMBER);
  rect(barX, by + 6 + barH + 4, graphBarW * min(1, animProgress * 2), barH, 3);

  fill(AMBER_DARK);
  textAlign(RIGHT, CENTER);
  text('Graph:', barX - 5, by + 6 + barH + 4 + barH / 2);

  fill(AMBER_DARK);
  textAlign(LEFT, CENTER);
  text(formatTime(sc.graphTime), barX + graphBarW + 8, by + 6 + barH + 4 + barH / 2);

  // Speedup label
  let speedup = (sc.rdbmsTime / sc.graphTime).toFixed(0);
  fill(GOLD);
  noStroke();
  let labelX = bx + bw - 70;
  let labelY = by + bh / 2;
  rect(labelX - 5, labelY - 14, 75, 28, 5);
  fill(INDIGO_DARK);
  textAlign(CENTER, CENTER);
  textSize(fontSize);
  textStyle(BOLD);
  text(speedup + 'x faster', labelX + 32, labelY);
  textStyle(NORMAL);
}

function formatTime(ms) {
  if (ms < 1000) return ms + ' ms';
  return (ms / 1000).toFixed(1) + ' s';
}

function drawButtons(fontSize) {
  buttons = [];
  let btnCount = scenarios.length;
  let btnGap = 8;
  let totalGap = (btnCount - 1) * btnGap;
  let btnW = min((canvasWidth - margin * 2 - totalGap) / btnCount, 120);
  let totalBtnW = btnCount * btnW + totalGap;
  let startX = (canvasWidth - totalBtnW) / 2;
  let btnH = 32;
  let btnY = drawHeight + (controlHeight - btnH) / 2;

  for (let i = 0; i < btnCount; i++) {
    let bx = startX + i * (btnW + btnGap);
    let isSelected = i === selectedScenario;

    // Button background
    noStroke();
    if (isSelected) {
      fill(AMBER);
    } else {
      fill(INDIGO);
    }
    rect(bx, btnY, btnW, btnH, 6);

    // Button label
    fill('white');
    textAlign(CENTER, CENTER);
    textSize(constrain(fontSize * 0.9, 9, 12));
    textStyle(BOLD);
    text(scenarios[i].label, bx + btnW / 2, btnY + btnH / 2);
    textStyle(NORMAL);

    buttons.push({ x: bx, y: btnY, w: btnW, h: btnH, idx: i });
  }
}

function mousePressed() {
  for (let btn of buttons) {
    if (mouseX >= btn.x && mouseX <= btn.x + btn.w &&
        mouseY >= btn.y && mouseY <= btn.y + btn.h) {
      if (selectedScenario !== btn.idx) {
        selectedScenario = btn.idx;
        animProgress = 0;
      }
    }
  }
}

function windowResized() {
  updateCanvasSize();
  resizeCanvas(canvasWidth, canvasHeight);
}

function updateCanvasSize() {
  const container = document.querySelector('main');
  if (container) {
    canvasWidth = container.offsetWidth;
  }
  canvasHeight = drawHeight + controlHeight;
}
