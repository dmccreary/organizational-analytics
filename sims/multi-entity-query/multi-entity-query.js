// Multi-Entity Query Visualization MicroSim
// CANVAS_HEIGHT: 550
// Steps through the chapter's sample Cypher query one clause at a time and
// shows which nodes and edges of a small organizational graph each clause matches.
// The matches are computed from the graph data below, not hard-coded.
// MicroSim template version 2026.03

// ===========================================
// CANVAS LAYOUT
// ===========================================
let containerWidth;
let canvasWidth = 800;
let drawHeight = 470;
let controlHeight = 80;                 // two rows of controls
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 10;
let sliderLeftMargin = 240;             // Show Query checkbox + "Speed: n" label
let defaultTextSize = 14;

const TITLE_H = 34;
const PANEL_Y = 38;
const PANEL_H = 250;
const QUERY_W = 286;                    // width needed for the longest query line (40 characters)
const WIDE = 670;                       // at this width the graph and the query fit side by side
const EXPLAIN_Y = 294;
const EXPLAIN_H = 60;
const TABLE_Y = 360;

// ===========================================
// ARIA COLOR SCHEME
// ===========================================
const INDIGO = '#303F9F';
const INDIGO_DARK = '#1A237E';
const INDIGO_LIGHT = '#5C6BC0';
const AMBER = '#D4880F';
const AMBER_DARK = '#B06D0B';
const AMBER_LIGHT = '#F5C14B';
const GOLD = '#FFD700';
const CHAMPAGNE = '#FFF8E7';
const GRAPH_BG = '#141A46';             // dark panel for contrast (per the spec)
const SOFT_RED = '#EF6C6C';
const LIGHT_INDIGO = '#9FA8DA';

// ===========================================
// GRAPH DATA
// x and y are fractions of the graph panel's width and height.
// ===========================================
const nodes = [
  { id: 'maria',  kind: 'Employee',   label: 'Maria',  x: 0.27, y: 0.17, dept: 'eng',
    props: ["employee_id: 'EMP-10042'", "first_name: 'Maria'", "last_name: 'Chen'"] },
  { id: 'james',  kind: 'Employee',   label: 'James',  x: 0.27, y: 0.74, dept: 'eng',
    props: ["employee_id: 'EMP-10005'", "first_name: 'James'", "last_name: 'Park'"] },
  { id: 'carlos', kind: 'Employee',   label: 'Carlos', x: 0.86, y: 0.46, dept: 'prod',
    props: ["employee_id: 'EMP-10077'", "first_name: 'Carlos'", "last_name: 'Rivera'"] },
  { id: 'aisha',  kind: 'Employee',   label: 'Aisha',  x: 0.66, y: 0.12, dept: 'prod',
    props: ["employee_id: 'EMP-10099'", "first_name: 'Aisha'", "last_name: 'Patel'"] },
  { id: 'eng',    kind: 'Department', label: 'Engineering', x: 0.13, y: 0.46,
    props: ["dept_id: 'DEPT-ENG'", "name: 'Engineering'", 'headcount: 85'] },
  { id: 'prod',   kind: 'Department', label: 'Product', x: 0.895, y: 0.17,
    props: ["dept_id: 'DEPT-PROD'", "name: 'Product'", 'headcount: 32'] },
  { id: 'proj',   kind: 'Project',    label: 'Cloud Migration', x: 0.615, y: 0.46,
    props: ["project_id: 'PROJ-2025-CLOUD'", "name: 'Cloud Migration'", "status: 'active'"] },
  { id: 'jira',   kind: 'License',    label: 'Jira', x: 0.355, y: 0.46,
    props: ["license_id: 'LIC-JIRA-2025'", "software: 'Jira'", 'annual_cost: 150.00'] }
];

const fullName = { maria: 'Maria Chen', james: 'James Park', carlos: 'Carlos Rivera', aisha: 'Aisha Patel' };

const edges = [
  { from: 'maria',  to: 'proj',  type: 'WORKS_ON' },
  { from: 'james',  to: 'proj',  type: 'WORKS_ON' },
  { from: 'carlos', to: 'proj',  type: 'WORKS_ON' },
  { from: 'maria',  to: 'eng',   type: 'WORKS_IN' },
  { from: 'james',  to: 'eng',   type: 'WORKS_IN' },
  { from: 'carlos', to: 'prod',  type: 'WORKS_IN' },
  { from: 'aisha',  to: 'prod',  type: 'WORKS_IN' },
  { from: 'maria',  to: 'james',  type: 'COMMUNICATES_WITH', frequency: 'daily' },
  { from: 'james',  to: 'maria',  type: 'COMMUNICATES_WITH', frequency: 'daily' },
  { from: 'maria',  to: 'carlos', type: 'COMMUNICATES_WITH', frequency: 'daily' },
  { from: 'carlos', to: 'maria',  type: 'COMMUNICATES_WITH', frequency: 'daily' },
  { from: 'maria',  to: 'aisha',  type: 'COMMUNICATES_WITH', frequency: 'daily' },
  { from: 'james',  to: 'carlos', type: 'COMMUNICATES_WITH', frequency: 'daily' },
  { from: 'carlos', to: 'aisha',  type: 'COMMUNICATES_WITH', frequency: 'weekly' },
  { from: 'maria',  to: 'jira',  type: 'HOLDS_LICENSE' },
  { from: 'james',  to: 'jira',  type: 'HOLDS_LICENSE' }
];

const nodeById = {};
nodes.forEach(n => { nodeById[n.id] = n; });

// ===========================================
// RUN THE QUERY ON THE DATA (one clause at a time)
// ===========================================
// Clause 1: (e:Employee)-[:WORKS_ON]->(p:Project {name: 'Cloud Migration'})
const candidates = edges.filter(e => e.type === 'WORKS_ON' && e.to === 'proj').map(e => e.from);
// Clause 3: (e)-[comm:COMMUNICATES_WITH {frequency: 'daily'}]->(other:Employee)
const dailyContacts = {};
// WHERE myDept <> otherDept
const crossDeptContacts = {};
// Clause 4: (e)-[:HOLDS_LICENSE]->(lic:License {software: 'Jira'})
const hasJira = {};
candidates.forEach(id => {
  dailyContacts[id] = edges
    .filter(e => e.type === 'COMMUNICATES_WITH' && e.frequency === 'daily' && e.from === id)
    .map(e => e.to);
  crossDeptContacts[id] = dailyContacts[id].filter(other => nodeById[other].dept !== nodeById[id].dept);
  hasJira[id] = edges.some(e => e.type === 'HOLDS_LICENSE' && e.from === id && e.to === 'jira');
});
// RETURN ... ORDER BY cross_dept_contacts DESC
const results = candidates
  .filter(id => crossDeptContacts[id].length > 0 && hasJira[id])
  .sort((a, b) => crossDeptContacts[b].length - crossDeptContacts[a].length);
const droppedCandidates = candidates.filter(id => !results.includes(id));

// ===========================================
// QUERY TEXT (clause number = the step that executes the line)
// ===========================================
const queryLines = [
  { t: "MATCH (e:Employee)-[:WORKS_ON]->", c: 1 },
  { t: "  (p:Project {name: 'Cloud Migration'}),", c: 1 },
  { t: "  (e)-[:WORKS_IN]->(myDept:Department),", c: 2 },
  { t: "  (e)-[comm:COMMUNICATES_WITH", c: 3 },
  { t: "    {frequency: 'daily'}]->", c: 3 },
  { t: "    (other:Employee),", c: 3 },
  { t: "  (other)-[:WORKS_IN]->", c: 3 },
  { t: "    (otherDept:Department),", c: 3 },
  { t: "  (e)-[:HOLDS_LICENSE]->", c: 5 },
  { t: "    (lic:License {software: 'Jira'})", c: 5 },
  { t: "WHERE myDept <> otherDept", c: 4 },
  { t: "RETURN e.first_name + ' ' + e.last_name", c: 6 },
  { t: "         AS employee,", c: 6 },
  { t: "  myDept.name AS department,", c: 6 },
  { t: "  count(DISTINCT other)", c: 6 },
  { t: "    AS cross_dept_contacts,", c: 6 },
  { t: "  lic.annual_cost AS jira_cost", c: 6 },
  { t: "ORDER BY cross_dept_contacts DESC", c: 6 }
];

const steps = [
  { title: 'Start',
    text: 'Nothing is matched yet, so every node and edge is dimmed. Press Play or Next to run the query one clause at a time.' },
  { title: 'MATCH (e)-[:WORKS_ON]->(p)',
    text: "Find the Project named 'Cloud Migration', then every Employee with a WORKS_ON edge to it. That gives three candidates for e." },
  { title: 'MATCH (e)-[:WORKS_IN]->(myDept)',
    text: "Follow each candidate's WORKS_IN edge to bind myDept." },
  { title: "MATCH (e)-[comm {frequency: 'daily'}]->(other)",
    text: "Follow only the daily COMMUNICATES_WITH edges that leave each candidate, and look up each contact's department. The weekly edge is ignored." },
  { title: 'WHERE myDept <> otherDept',
    text: 'Drop every pair that shares a department. Maria and James are both in Engineering, so the edges between them are eliminated.' },
  { title: 'MATCH (e)-[:HOLDS_LICENSE]->(lic)',
    text: 'Keep only candidates with a HOLDS_LICENSE edge to the Jira license. Carlos has none, so he no longer matches e.' },
  { title: 'RETURN ... ORDER BY',
    text: 'Count the distinct cross-department contacts of each remaining employee and sort in descending order. Two rows are returned.' }
];
const LAST_STEP = steps.length - 1;

// ===========================================
// STATE
// ===========================================
let currentStep = 0;
let isPlaying = false;                  // default state is paused
let lastAdvance = 0;
let hoveredNode = null;

// Controls
let playButton, backButton, nextButton, resetButton, speedSlider, queryCheckbox;

// Layout rectangles (recomputed every frame from canvasWidth)
let graphRect = { x: 0, y: 0, w: 0, h: 0 };
let queryRect = null;

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(containerWidth, containerHeight);
  const mainElement = document.querySelector('main');
  canvas.parent(mainElement);
  textSize(defaultTextSize);

  // Row 1: step controls
  playButton = createButton('Play');
  playButton.parent(mainElement);
  playButton.position(10, drawHeight + 8);
  playButton.mousePressed(togglePlay);

  backButton = createButton('Back');
  backButton.parent(mainElement);
  backButton.position(68, drawHeight + 8);
  backButton.mousePressed(() => { pausePlayback(); goToStep(currentStep - 1); });

  nextButton = createButton('Next');
  nextButton.parent(mainElement);
  nextButton.position(124, drawHeight + 8);
  nextButton.mousePressed(() => { pausePlayback(); goToStep(currentStep + 1); });

  resetButton = createButton('Reset');
  resetButton.parent(mainElement);
  resetButton.position(180, drawHeight + 8);
  resetButton.mousePressed(() => { pausePlayback(); goToStep(0); });

  // Row 2: query toggle and speed
  queryCheckbox = createCheckbox('Show Query', canvasWidth >= WIDE);
  queryCheckbox.parent(mainElement);
  queryCheckbox.position(10, drawHeight + 46);

  speedSlider = createSlider(1, 5, 3, 1);
  speedSlider.parent(mainElement);
  speedSlider.position(sliderLeftMargin, drawHeight + 45);
  speedSlider.size(canvasWidth - sliderLeftMargin - 20);

  describe('Step-through visualization of a multi-entity Cypher query. Each clause highlights the nodes and edges it matches in a small organizational graph, and a table shows the candidate bindings and the final result rows.', LABEL);
}

// ===========================================
// PLAYBACK
// ===========================================
function stepDelay() {
  // Speed 1 (slow) to 5 (fast): milliseconds spent on each step
  return [3600, 2800, 2000, 1300, 800][speedSlider.value() - 1];
}

function togglePlay() {
  if (isPlaying) {
    pausePlayback();
    return;
  }
  if (currentStep >= LAST_STEP) currentStep = 0;     // replay from the start
  isPlaying = true;
  lastAdvance = millis();
  playButton.html('Pause');
}

function pausePlayback() {
  isPlaying = false;
  playButton.html('Play');
}

function goToStep(step) {
  currentStep = constrain(step, 0, LAST_STEP);
}

// ===========================================
// MATCH STATE FOR EACH STEP
// ===========================================
// Returns 'dim', 'active' (matched by the current clause), 'matched'
// (matched by an earlier clause) or 'rejected' (eliminated).
function edgeState(e, step) {
  const fromCandidate = candidates.includes(e.from);
  const droppedNow = step >= 5 && droppedCandidates.includes(e.from);

  if (e.type === 'WORKS_ON') {
    if (step < 1) return 'dim';
    if (droppedNow) return 'rejected';
    return step === 1 ? 'active' : 'matched';
  }
  if (e.type === 'WORKS_IN') {
    // candidates bind myDept at step 2; other contacts bind otherDept at step 3
    const firstStep = fromCandidate ? 2 : 3;
    const isContact = candidates.some(c => dailyContacts[c].includes(e.from));
    if (!fromCandidate && !isContact) return 'dim';
    if (step < firstStep) return 'dim';
    return step === firstStep ? 'active' : 'matched';
  }
  if (e.type === 'COMMUNICATES_WITH') {
    if (!fromCandidate || e.frequency !== 'daily' || step < 3) return 'dim';
    if (step === 3) return 'active';
    const sameDept = nodeById[e.from].dept === nodeById[e.to].dept;
    if (sameDept || droppedNow) return 'rejected';
    return 'matched';
  }
  if (e.type === 'HOLDS_LICENSE') {
    if (!fromCandidate || step < 5) return 'dim';
    return step === 5 ? 'active' : 'matched';
  }
  return 'dim';
}

function nodeState(n, step) {
  if (step === LAST_STEP && results.includes(n.id)) return 'result';
  let lit = false;
  let active = false;
  edges.forEach(e => {
    if (e.from !== n.id && e.to !== n.id) return;
    const s = edgeState(e, step);
    if (s === 'active') { lit = true; active = true; }
    if (s === 'matched') lit = true;
  });
  if (active && step !== LAST_STEP) return 'active';
  return lit ? 'matched' : 'dim';
}

// ===========================================
// DRAW
// ===========================================
function draw() {
  updateCanvasSize();

  // Drawing region and control region backgrounds
  fill('aliceblue');
  stroke('silver');
  strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  // Auto-advance while playing
  if (isPlaying && millis() - lastAdvance > stepDelay()) {
    if (currentStep < LAST_STEP) {
      currentStep++;
      lastAdvance = millis();
    }
    if (currentStep >= LAST_STEP) pausePlayback();
  }

  // Title
  noStroke();
  fill(INDIGO_DARK);
  textAlign(CENTER, TOP);
  textStyle(BOLD);
  textSize(canvasWidth < 500 ? 17 : 20);
  text('Multi-Entity Query Visualization', canvasWidth / 2, 9);
  textStyle(NORMAL);

  computeLayout();
  drawGraphPanel();
  if (queryRect) drawQueryPanel();
  drawExplanation();
  drawTable();
  drawControlLabels();
  drawTooltip();
}

function computeLayout() {
  const showQuery = queryCheckbox.checked();
  const wide = canvasWidth >= WIDE;
  if (showQuery && wide) {
    // side by side: graph on the left, query on the right
    const gw = canvasWidth - QUERY_W - 3 * margin;
    graphRect = { x: margin, y: PANEL_Y, w: gw, h: PANEL_H };
    queryRect = { x: margin + gw + margin, y: PANEL_Y, w: QUERY_W, h: PANEL_H };
  } else if (showQuery) {
    // narrow screen: the query panel covers the graph while it is switched on
    graphRect = { x: margin, y: PANEL_Y, w: canvasWidth - 2 * margin, h: PANEL_H };
    queryRect = { x: margin, y: PANEL_Y, w: canvasWidth - 2 * margin, h: PANEL_H };
  } else {
    graphRect = { x: margin, y: PANEL_Y, w: canvasWidth - 2 * margin, h: PANEL_H };
    queryRect = null;
  }
}

function graphHidden() {
  return queryRect !== null && canvasWidth < WIDE;
}

// -------------------------------------------
// Graph panel
// -------------------------------------------
function nodeXY(n) {
  return { x: graphRect.x + n.x * graphRect.w, y: graphRect.y + n.y * graphRect.h };
}

function nodeSize(n) {
  if (n.kind === 'Employee') return { round: true, r: 21 };
  textSize(12);
  textStyle(BOLD);
  const w = textWidth(n.label) + 14;
  textStyle(NORMAL);
  return { round: false, hw: w / 2, hh: 13 };
}

// Point where a line from the node center toward (tx, ty) leaves the node shape
function boundaryPoint(n, tx, ty) {
  const p = nodeXY(n);
  const size = nodeSize(n);
  const dx = tx - p.x;
  const dy = ty - p.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  let dist;
  if (size.round) {
    dist = size.r + 2;
  } else {
    const tx1 = Math.abs(dx) > 0.001 ? (size.hw + 2) / Math.abs(dx / len) : Infinity;
    const ty1 = Math.abs(dy) > 0.001 ? (size.hh + 2) / Math.abs(dy / len) : Infinity;
    dist = Math.min(tx1, ty1);
  }
  return { x: p.x + (dx / len) * dist, y: p.y + (dy / len) * dist };
}

function edgeBaseColor(e) {
  if (e.type === 'WORKS_ON') return AMBER;
  if (e.type === 'WORKS_IN') return LIGHT_INDIGO;
  if (e.type === 'HOLDS_LICENSE') return GOLD;
  return AMBER_LIGHT;       // COMMUNICATES_WITH
}

function drawGraphPanel() {
  if (graphHidden()) return;

  // dark panel
  stroke(INDIGO_DARK);
  strokeWeight(1);
  fill(GRAPH_BG);
  rect(graphRect.x, graphRect.y, graphRect.w, graphRect.h, 8);

  const pulse = 0.5 + 0.5 * Math.sin(millis() / 230);

  // edges first, then nodes on top
  edges.forEach(e => drawEdge(e, pulse));
  nodes.forEach(n => drawNode(n, pulse));
  drawLegend();
}

function drawEdge(e, pulse) {
  const state = edgeState(e, currentStep);
  const a = nodeById[e.from];
  const b = nodeById[e.to];
  const pa = nodeXY(a);
  const pb = nodeXY(b);

  // Two edges that run in opposite directions between the same pair are
  // shifted sideways so that both arrows stay visible.
  let ox = 0, oy = 0;
  const hasReverse = edges.some(o => o.from === e.to && o.to === e.from);
  if (hasReverse) {
    const dx = pb.x - pa.x, dy = pb.y - pa.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    ox = (-dy / len) * 5;
    oy = (dx / len) * 5;
  }
  const start = boundaryPoint(a, pb.x, pb.y);
  const end = boundaryPoint(b, pa.x, pa.y);
  const x1 = start.x + ox, y1 = start.y + oy, x2 = end.x + ox, y2 = end.y + oy;

  let c, weight;
  if (state === 'dim') {
    c = color(255, 255, 255, 46);
    weight = 1.2;
  } else if (state === 'rejected') {
    c = color(SOFT_RED);
    c.setAlpha(190);
    weight = 1.6;
  } else {
    c = color(edgeBaseColor(e));
    weight = (state === 'active') ? 2.6 + 2.2 * pulse : 2.6;
  }

  stroke(c);
  strokeWeight(weight);
  noFill();
  if (e.type === 'COMMUNICATES_WITH') {
    drawingContext.setLineDash(e.frequency === 'daily' ? [7, 5] : [2, 5]);
  }
  if (state === 'rejected') drawingContext.setLineDash([3, 5]);
  line(x1, y1, x2, y2);
  drawingContext.setLineDash([]);

  // arrowhead
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const ah = (state === 'dim') ? 7 : 9;
  noStroke();
  fill(c);
  triangle(
    x2, y2,
    x2 - ah * Math.cos(ang - 0.42), y2 - ah * Math.sin(ang - 0.42),
    x2 - ah * Math.cos(ang + 0.42), y2 - ah * Math.sin(ang + 0.42)
  );

  // a cross marks an edge that a clause has eliminated
  if (state === 'rejected') {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    stroke(SOFT_RED);
    strokeWeight(2.5);
    line(mx - 5, my - 5, mx + 5, my + 5);
    line(mx - 5, my + 5, mx + 5, my - 5);
  }
}

function nodeFill(n) {
  if (n.kind === 'Employee') return AMBER;
  if (n.kind === 'Department') return INDIGO_LIGHT;
  if (n.kind === 'Project') return AMBER_DARK;
  return GOLD;      // License
}

function drawNode(n, pulse) {
  const state = nodeState(n, currentStep);
  const p = nodeXY(n);
  const size = nodeSize(n);
  const lit = state !== 'dim';

  // glow ring for nodes matched by the current clause, and for result rows
  if (state === 'active' || state === 'result') {
    const glow = color(state === 'result' ? GOLD : 255);
    glow.setAlpha(state === 'result' ? 150 + 90 * pulse : 70 + 80 * pulse);
    noFill();
    stroke(glow);
    strokeWeight(state === 'result' ? 4 : 3);
    const grow = 5 + 3 * pulse;
    if (size.round) {
      circle(p.x, p.y, 2 * (size.r + grow));
    } else {
      rect(p.x - size.hw - grow, p.y - size.hh - grow, 2 * (size.hw + grow), 2 * (size.hh + grow), 10);
    }
  }

  if (lit) {
    fill(nodeFill(n));
    stroke(255);
    strokeWeight(n === hoveredNode ? 3 : 1.5);
  } else {
    fill(255, 255, 255, 26);
    stroke(255, 255, 255, 70);
    strokeWeight(n === hoveredNode ? 2.5 : 1);
  }
  if (size.round) {
    circle(p.x, p.y, 2 * size.r);
  } else {
    rect(p.x - size.hw, p.y - size.hh, 2 * size.hw, 2 * size.hh, 7);
  }

  // label
  noStroke();
  if (!lit) {
    fill(255, 255, 255, 120);
  } else if (n.kind === 'License') {
    fill(30);
  } else {
    fill(255);
  }
  textAlign(CENTER, CENTER);
  textSize(12);
  textStyle(BOLD);
  text(n.label, p.x, p.y);
  textStyle(NORMAL);

  // "e" tag on the employees that are candidates for the variable e
  if (n.kind === 'Employee' && candidates.includes(n.id) && currentStep >= 1) {
    const dropped = currentStep >= 5 && droppedCandidates.includes(n.id);
    const tx = p.x + size.r * 0.82, ty = p.y - size.r * 0.82;
    stroke(GRAPH_BG);
    strokeWeight(1.5);
    fill(dropped ? SOFT_RED : GOLD);
    circle(tx, ty, 17);
    noStroke();
    fill(30);
    textSize(12);
    textStyle(BOLD);
    text('e', tx, ty - 1);
    textStyle(NORMAL);
    if (dropped) {
      stroke(30);
      strokeWeight(1.5);
      line(tx - 6, ty + 6, tx + 6, ty - 6);
      noStroke();
    }
  }
}

function drawLegend() {
  // Two rows of three entries along the bottom edge of the panel
  const items = [
    { label: 'WORKS_ON', color: AMBER, dash: [] },
    { label: 'WORKS_IN', color: LIGHT_INDIGO, dash: [] },
    { label: 'HOLDS_LICENSE', color: GOLD, dash: [] },
    { label: 'COMM. daily', color: AMBER_LIGHT, dash: [7, 5] },
    { label: 'COMM. weekly', color: AMBER_LIGHT, dash: [2, 5] },
    { label: 'eliminated', color: SOFT_RED, dash: [3, 5] }
  ];
  const rowH = 15;
  const colW = min(132, (graphRect.w - 16) / 3);
  const x0 = graphRect.x + (graphRect.w - 3 * colW) / 2 + 4;
  const y0 = graphRect.y + graphRect.h - 2 * rowH - 5;
  const small = colW < 118;
  textAlign(LEFT, CENTER);
  textSize(small ? 10 : 11);
  items.forEach((item, i) => {
    const x = x0 + (i % 3) * colW;
    const cy = y0 + Math.floor(i / 3) * rowH + rowH / 2;
    const lineLen = small ? 18 : 26;
    stroke(item.color);
    strokeWeight(2.2);
    drawingContext.setLineDash(item.dash);
    line(x, cy, x + lineLen, cy);
    drawingContext.setLineDash([]);
    noStroke();
    fill(225);
    text(item.label, x + lineLen + 5, cy);
  });
}

// -------------------------------------------
// Query panel
// -------------------------------------------
function drawQueryPanel() {
  stroke(INDIGO_LIGHT);
  strokeWeight(1);
  fill(CHAMPAGNE);
  rect(queryRect.x, queryRect.y, queryRect.w, queryRect.h, 8);

  noStroke();
  fill(INDIGO_DARK);
  textAlign(LEFT, TOP);
  textSize(13);
  textStyle(BOLD);
  text('Cypher query', queryRect.x + 10, queryRect.y + 7);
  textStyle(NORMAL);

  const lineH = 12.3;
  const top = queryRect.y + 26;
  // shrink the code a little if the panel is narrower than the longest line
  const codeSize = (queryRect.w >= QUERY_W) ? 11 : max(8.5, 11 * queryRect.w / QUERY_W);
  textFont('monospace');
  textSize(codeSize);
  textAlign(LEFT, CENTER);
  queryLines.forEach((ln, i) => {
    const y = top + i * lineH;
    const isCurrent = ln.c === currentStep;
    const isDone = ln.c < currentStep;
    if (isCurrent) {
      noStroke();
      fill(GOLD);
      rect(queryRect.x + 5, y, queryRect.w - 10, lineH, 3);
    }
    noStroke();
    if (isCurrent) fill(20);
    else if (isDone) fill(INDIGO);
    else fill(90);
    text(ln.t, queryRect.x + 10, y + lineH / 2 + 0.5);
  });
  textFont('Arial');
}

// -------------------------------------------
// Explanation box
// -------------------------------------------
function drawExplanation() {
  const x = margin;
  const w = canvasWidth - 2 * margin;
  stroke(AMBER);
  strokeWeight(1);
  fill(255);
  rect(x, EXPLAIN_Y, w, EXPLAIN_H, 6);
  noStroke();
  fill(AMBER);
  rect(x, EXPLAIN_Y, 5, EXPLAIN_H, 6, 0, 0, 6);

  const narrow = canvasWidth < 560;
  fill(INDIGO_DARK);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  textSize(narrow ? 12 : 14);
  const s = steps[currentStep];
  text('Step ' + (currentStep + 1) + ' of ' + steps.length + ':  ' + s.title, x + 14, EXPLAIN_Y + 6);
  textStyle(NORMAL);
  fill(30);
  textSize(narrow ? 11.5 : 13);
  textLeading(narrow ? 13 : 16);
  text(s.text, x + 14, EXPLAIN_Y + (narrow ? 22 : 25), w - 24, EXPLAIN_H - 24);
}

// -------------------------------------------
// Binding table and result table
// -------------------------------------------
function drawTable() {
  const x = margin;
  const w = canvasWidth - 2 * margin;
  const narrow = canvasWidth < 560;
  const headH = 22;
  const rowH = 23;
  const fs = narrow ? 11 : 13;

  if (currentStep === LAST_STEP) {
    // RETURN: the result set
    const cols = narrow
      ? [{ t: 'employee', f: 0.30 }, { t: 'department', f: 0.28 }, { t: 'contacts', f: 0.20 }, { t: 'jira_cost', f: 0.22 }]
      : [{ t: 'employee', f: 0.27 }, { t: 'department', f: 0.25 }, { t: 'cross_dept_contacts', f: 0.27 }, { t: 'jira_cost', f: 0.21 }];
    drawTableHeader(x, TABLE_Y, w, headH, cols, fs, AMBER_DARK);
    results.forEach((id, r) => {
      const y = TABLE_Y + headH + r * rowH;
      stroke(220);
      strokeWeight(1);
      fill(CHAMPAGNE);
      rect(x, y, w, rowH);
      noStroke();
      fill(20);
      textSize(fs);
      textAlign(LEFT, CENTER);
      const cells = [fullName[id], nodeById[nodeById[id].dept].label, String(crossDeptContacts[id].length), '150.0'];
      let cx = x;
      cells.forEach((cell, i) => {
        text(cell, cx + 8, y + rowH / 2);
        cx += cols[i].f * w;
      });
    });
    noStroke();
    fill(60);
    textSize(fs - 1);
    textAlign(LEFT, TOP);
    text(results.length + ' rows returned, ordered by cross_dept_contacts DESC. ' +
         'Carlos Rivera is not returned: no Jira license.',
         x + 2, TABLE_Y + headH + results.length * rowH + 6, w - 4, 34);
    return;
  }

  // Steps 1 to 6: the bindings found so far for each candidate e
  const cols = narrow
    ? [{ t: 'e', f: 0.22 }, { t: 'myDept', f: 0.20 }, { t: 'daily contacts', f: 0.34 }, { t: 'cross', f: 0.10 }, { t: 'Jira', f: 0.14 }]
    : [{ t: 'e (candidate)', f: 0.20 }, { t: 'myDept', f: 0.17 }, { t: 'daily contacts (other)', f: 0.31 }, { t: 'cross-dept count', f: 0.17 }, { t: 'Jira license', f: 0.15 }];
  drawTableHeader(x, TABLE_Y, w, headH, cols, fs, INDIGO);

  candidates.forEach((id, r) => {
    const y = TABLE_Y + headH + r * rowH;
    const dropped = currentStep >= 5 && droppedCandidates.includes(id);
    stroke(220);
    strokeWeight(1);
    fill(dropped ? '#FDECEC' : 255);
    rect(x, y, w, rowH);
    noStroke();
    textSize(fs);
    textAlign(LEFT, CENTER);
    const cy = y + rowH / 2;
    let cx = x;

    // e
    if (currentStep >= 1) {
      fill(dropped ? 140 : 20);
      text(narrow ? nodeById[id].label : fullName[id], cx + 8, cy);
    }
    cx += cols[0].f * w;

    // myDept
    if (currentStep >= 2) {
      fill(dropped ? 140 : 20);
      const deptLabel = nodeById[nodeById[id].dept].label;
      text(narrow && deptLabel === 'Engineering' ? 'Eng.' : deptLabel, cx + 8, cy);
    }
    cx += cols[1].f * w;

    // daily contacts: same-department contacts are struck out from the WHERE step on
    if (currentStep >= 3) {
      let tx = cx + 8;
      dailyContacts[id].forEach((other, i) => {
        const name = nodeById[other].label;
        const sameDept = nodeById[other].dept === nodeById[id].dept;
        const struck = currentStep >= 4 && sameDept;
        fill(struck ? '#C62828' : (dropped ? 140 : 20));
        text(name, tx, cy);
        const tw = textWidth(name);
        if (struck) {
          stroke('#C62828');
          strokeWeight(1.3);
          line(tx - 1, cy, tx + tw + 1, cy);
          noStroke();
        }
        tx += tw;
        if (i < dailyContacts[id].length - 1) {
          fill(90);
          text(', ', tx, cy);
          tx += textWidth(', ');
        }
      });
    }
    cx += cols[2].f * w;

    // cross-department count
    if (currentStep >= 4) {
      fill(dropped ? 140 : 20);
      text(String(crossDeptContacts[id].length), cx + 8, cy);
    }
    cx += cols[3].f * w;

    // Jira license
    if (currentStep >= 5) {
      fill(hasJira[id] ? '#1B5E20' : '#C62828');
      textStyle(BOLD);
      text(hasJira[id] ? 'yes' : 'no', cx + 8, cy);
      textStyle(NORMAL);
    }
  });
}

function drawTableHeader(x, y, w, h, cols, fs, bg) {
  noStroke();
  fill(bg);
  rect(x, y, w, h, 5, 5, 0, 0);
  fill(255);
  textSize(fs);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  let cx = x;
  cols.forEach(col => {
    text(col.t, cx + 8, y + h / 2);
    cx += col.f * w;
  });
  textStyle(NORMAL);
}

// -------------------------------------------
// Control labels
// -------------------------------------------
function drawControlLabels() {
  noStroke();
  fill(30);
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Speed: ' + speedSlider.value(), 150, drawHeight + 56);

  // step counter to the right of the buttons
  textAlign(RIGHT, CENTER);
  fill(INDIGO_DARK);
  text('Step ' + (currentStep + 1) + ' of ' + steps.length, canvasWidth - 20, drawHeight + 20);
}

// -------------------------------------------
// Hover tooltip with node properties
// -------------------------------------------
function findHoveredNode() {
  if (graphHidden()) return null;
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    const p = nodeXY(n);
    const size = nodeSize(n);
    if (size.round) {
      if (dist(mouseX, mouseY, p.x, p.y) <= size.r) return n;
    } else if (Math.abs(mouseX - p.x) <= size.hw && Math.abs(mouseY - p.y) <= size.hh) {
      return n;
    }
  }
  return null;
}

function drawTooltip() {
  hoveredNode = findHoveredNode();
  if (!hoveredNode) return;
  const n = hoveredNode;
  const lines = [':' + n.kind].concat(n.props);
  textSize(12);
  textStyle(BOLD);
  let w = textWidth(lines[0]);
  textStyle(NORMAL);
  n.props.forEach(pr => { w = max(w, textWidth(pr)); });
  w += 18;
  const h = lines.length * 16 + 10;
  let x = mouseX + 14;
  let y = mouseY + 12;
  if (x + w > canvasWidth - 4) x = mouseX - w - 10;
  if (y + h > drawHeight - 4) y = mouseY - h - 8;
  x = max(4, x);

  stroke(AMBER);
  strokeWeight(1);
  fill(CHAMPAGNE);
  rect(x, y, w, h, 6);
  noStroke();
  textAlign(LEFT, TOP);
  lines.forEach((ln, i) => {
    fill(i === 0 ? INDIGO_DARK : 30);
    textStyle(i === 0 ? BOLD : NORMAL);
    text(ln, x + 9, y + 6 + i * 16);
  });
  textStyle(NORMAL);
}

// ===========================================
// RESPONSIVE SIZING
// ===========================================
function windowResized() {
  updateCanvasSize();
  resizeCanvas(containerWidth, containerHeight);
}

function updateCanvasSize() {
  const container = document.querySelector('main');
  if (container) {
    containerWidth = Math.floor(container.getBoundingClientRect().width);
    canvasWidth = containerWidth;
    if (typeof speedSlider !== 'undefined') {
      speedSlider.size(canvasWidth - sliderLeftMargin - 20);
    }
  }
}
