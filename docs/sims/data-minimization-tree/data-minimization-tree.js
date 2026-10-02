// Data Minimization Decision Tree MicroSim
// CANVAS_HEIGHT: 550
// A binary decision tree for deciding whether a data element should be collected
// for an organizational analytics project. Learners walk a sample scenario with
// Yes / No buttons and get feedback on each answer, or type a data element of
// their own. The tree ends with a decision and the justification for it.
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
let defaultTextSize = 14;

// ===========================================
// ARIA COLOR SCHEME
// ===========================================
const INDIGO = '#303F9F';
const INDIGO_DARK = '#1A237E';
const INDIGO_LIGHT = '#5C6BC0';
const AMBER = '#D4880F';
const AMBER_DARK = '#B06D0B';
const GOLD = '#FFD700';
const CHAMPAGNE = '#FFF8E7';
const SOFT_RED = '#EF9A9A';
const DEEP_RED = '#B71C1C';
const GOOD_GREEN = '#1B5E20';

// ===========================================
// THE DECISION TREE
// col 0 = the spine of questions, col 1 = outcomes to the right
// ===========================================
const tree = {
  q0: { type: 'q', row: 0, col: 0, yes: 'q1', no: 't1',
        text: 'Is this data element needed to answer your stated analytics question?',
        yesWhy: 'it is needed to answer the question',
        noWhy: 'it is not needed to answer the question',
        example: 'Salary data in a study of communication patterns does not help answer the question, so the answer here is No.' },
  q1: { type: 'q', row: 1, col: 0, yes: 't2', no: 'q2',
        text: 'Can the question be answered with aggregated data instead?',
        yesWhy: 'aggregated data can answer the question',
        noWhy: 'aggregated data cannot answer the question',
        example: '"How connected is Engineering to Product?" needs department-level message volumes, not person-to-person edges, so the answer here is Yes.' },
  q2: { type: 'q', row: 2, col: 0, yes: 't3', no: 'q3',
        text: 'Can the question be answered with pseudonymized data?',
        yesWhy: 'pseudonymized data can answer the question',
        noWhy: 'pseudonymized data cannot answer the question',
        example: 'Finding the people who bridge teams needs person-to-person edges, but not names. Pseudonymous IDs work, so the answer here is Yes.' },
  q3: { type: 'q', row: 3, col: 0, yes: 't4', no: 't5',
        text: 'Is there explicit consent and legal basis for identifiable collection?',
        yesWhy: 'there is explicit consent and a legal basis for identifiable collection',
        noWhy: 'there is no explicit consent or legal basis for identifiable collection',
        example: 'Offering support to an isolated employee means knowing who they are. That is only acceptable with explicit consent and a legal basis.' },
  t1: { type: 't', row: 0, col: 1, kind: 'stop',
        text: 'Do not collect. Document why it was excluded.',
        example: 'Performance ratings are left out of a collaboration study, with a note recording the reason.' },
  t2: { type: 't', row: 1, col: 1, kind: 'restrict',
        text: 'Collect at aggregate level only.',
        example: 'Store weekly message counts between departments, not individual messages.' },
  t3: { type: 't', row: 2, col: 1, kind: 'restrict',
        text: 'Pseudonymize at ingestion.',
        example: 'Maria Chen is stored as PSN_4782. The key is kept in a separate identity vault.' },
  t4: { type: 't', row: 3, col: 1, kind: 'collect',
        text: 'Collect with full audit trail and retention schedule.',
        example: 'Every access is logged, and the data is purged on a set schedule.' },
  t5: { type: 't', row: 4, col: 0, kind: 'stop',
        text: 'Do not collect. Redesign the analysis question.',
        example: '"Which individuals send few emails?" is redesigned as "Which teams are isolated?"' }
};
const nodeIds = Object.keys(tree);

// ===========================================
// SAMPLE SCENARIOS
// answers: the model answer and reasoning for each question on the path
// ===========================================
const scenarios = [
  { label: 'Email metadata, department study',
    question: 'How connected is Engineering to Product?',
    element: 'Email sender and recipient metadata',
    answers: {
      q0: { yes: true,  why: 'Communication metadata is what shows how the two departments connect.' },
      q1: { yes: true,  why: 'The question is about departments, so department-level message volumes are enough.' }
    } },
  { label: 'Email headers, finding bridges',
    question: 'Which people connect otherwise separate teams?',
    element: 'Email headers (sender, recipient, timestamp)',
    answers: {
      q0: { yes: true,  why: 'Headers are what a communication graph is built from.' },
      q1: { yes: false, why: 'Finding individual bridges needs person-to-person edges. Department totals would hide them.' },
      q2: { yes: true,  why: 'The analysis needs distinct people, not their names. Pseudonymous IDs work.' }
    } },
  { label: 'Salary in a communication study',
    question: 'Which people connect otherwise separate teams?',
    element: 'Salary and performance ratings',
    answers: {
      q0: { yes: false, why: 'Pay and ratings do not help find bridges between teams.' }
    } },
  { label: 'Identity, opt-in support program',
    question: 'Which isolated employees should be offered support? Employees opted in to the program and legal review is complete.',
    element: 'Employee name linked to network position',
    answers: {
      q0: { yes: true,  why: 'Support cannot be offered without knowing who needs it.' },
      q1: { yes: false, why: 'Support goes to individuals, so group totals cannot answer the question.' },
      q2: { yes: false, why: 'Reaching out means resolving the pseudonym to a real person.' },
      q3: { yes: true,  why: 'The program is opt-in and has a documented legal basis.' }
    } },
  { label: 'Identity, flagging low emailers',
    question: 'Which individuals send the fewest emails, so managers can be told who is disengaged? Employees have not been asked.',
    element: 'Employee name linked to email counts',
    answers: {
      q0: { yes: true,  why: 'The question as written asks about named individuals.' },
      q1: { yes: false, why: 'It asks about individuals, not groups.' },
      q2: { yes: false, why: 'Managers want names, so pseudonyms would not answer it.' },
      q3: { yes: false, why: 'Employees have not consented, and flagging individuals this way is surveillance.' }
    } },
  { label: 'Try your own...', own: true }
];

// ===========================================
// STATE
// ===========================================
let scenarioIndex = 0;
let current = 'q0';                 // node the learner is on
let path = [];                      // [{ q: 'q0', yes: true }, ...]
let feedback = null;                // { ok: true/false, text: '...' }
let hoveredNode = null;
let scenarioSelect, elementInput, yesButton, noButton, resetButton;

// geometry (recomputed every frame)
let layout = {};

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(containerWidth, containerHeight);
  const mainElement = document.querySelector('main');
  canvas.parent(mainElement);
  textSize(defaultTextSize);

  // Row 1: scenario
  scenarioSelect = createSelect();
  scenarioSelect.parent(mainElement);
  scenarios.forEach((s, i) => scenarioSelect.option(s.label, String(i)));
  scenarioSelect.position(84, drawHeight + 10);
  scenarioSelect.changed(() => {
    scenarioIndex = parseInt(scenarioSelect.value(), 10);
    startOver();
  });

  // Row 2: answers
  yesButton = createButton('Yes');
  yesButton.parent(mainElement);
  yesButton.position(10, drawHeight + 45);
  yesButton.mousePressed(() => answer(true));

  noButton = createButton('No');
  noButton.parent(mainElement);
  noButton.position(58, drawHeight + 45);
  noButton.mousePressed(() => answer(false));

  resetButton = createButton('Start Over');
  resetButton.parent(mainElement);
  resetButton.position(104, drawHeight + 45);
  resetButton.mousePressed(startOver);

  // Text box for the "Try your own" mode
  elementInput = createInput('');
  elementInput.parent(mainElement);
  elementInput.attribute('placeholder', 'Type a data element');
  elementInput.attribute('maxlength', '60');
  elementInput.position(200, drawHeight + 45);
  elementInput.size(Math.max(120, canvasWidth - 220));

  startOver();
  describe('Binary decision tree with four yes or no questions about whether a data element should be collected, leading to five outcomes: do not collect, collect at aggregate level, pseudonymize at ingestion, collect with audit trail, or redesign the question.', LABEL);
}

function scenario() {
  return scenarios[scenarioIndex];
}

function startOver() {
  current = 'q0';
  path = [];
  feedback = null;
  updateControls();
}

function updateControls() {
  const atEnd = tree[current].type === 't';
  if (atEnd) {
    yesButton.attribute('disabled', '');
    noButton.attribute('disabled', '');
  } else {
    yesButton.removeAttribute('disabled');
    noButton.removeAttribute('disabled');
  }
  if (scenario().own) elementInput.show(); else elementInput.hide();
}

function answer(yes) {
  const node = tree[current];
  if (node.type !== 'q') return;
  const model = scenario().own ? null : scenario().answers[current];

  if (model && model.yes !== yes) {
    // The learner's answer differs from the model answer: explain, and wait
    feedback = { ok: false,
      text: 'Think again. ' + model.why + ' The model answer is ' + (model.yes ? 'Yes' : 'No') + '.' };
    return;
  }
  path.push({ q: current, yes: yes });
  feedback = model
    ? { ok: true, text: (yes ? 'Yes. ' : 'No. ') + model.why }
    : { ok: true, text: 'You answered ' + (yes ? 'Yes' : 'No') + ': ' + (yes ? node.yesWhy : node.noWhy) + '.' };
  current = yes ? node.yes : node.no;
  updateControls();
}

function elementName() {
  if (!scenario().own) return scenario().element;
  const typed = elementInput.value().trim();
  return typed || 'your data element';
}

// Sentence that justifies the decision from the answers given
function justification() {
  const reasons = path.map(step => step.yes ? tree[step.q].yesWhy : tree[step.q].noWhy);
  return 'Because ' + reasons.join('; ') + '.';
}

// ===========================================
// DRAW
// ===========================================
function draw() {
  updateCanvasSize();

  fill('aliceblue');
  stroke('silver');
  strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  noStroke();
  fill(INDIGO_DARK);
  textAlign(CENTER, TOP);
  textStyle(BOLD);
  textSize(canvasWidth < 480 ? 17 : 22);
  text('Data Minimization Decision Tree', canvasWidth / 2, 8);
  textStyle(NORMAL);

  computeLayout();
  hoveredNode = nodeAt(mouseX, mouseY);

  drawEdges();
  nodeIds.forEach(drawNode);
  if (layout.wide) drawLegend();
  drawPanel();
  drawControlLabels();
}

function computeLayout() {
  const wide = canvasWidth >= 640;
  const L = { wide: wide };
  if (wide) {
    L.treeX = margin;
    L.treeW = Math.round(canvasWidth * 0.58) - margin;
    L.rowY = 42;
    L.rowStep = 78;
    L.nodeH = 60;
    L.fs = 12.5;
    L.panel = { x: L.treeX + L.treeW + 12, y: 42, w: canvasWidth - (L.treeX + L.treeW + 12) - margin, h: drawHeight - 50 };
  } else {
    L.treeX = margin;
    L.treeW = canvasWidth - 2 * margin;
    L.rowY = 38;
    L.rowStep = 62;
    L.nodeH = 48;
    L.fs = 11.5;
    L.panel = { x: margin, y: 344, w: canvasWidth - 2 * margin, h: drawHeight - 344 - 6 };
  }
  // Column widths leave a gap between them that is wide enough for the
  // "Yes" / "No" branch labels.
  L.qW = Math.min(200, L.treeW * 0.46);
  L.tW = Math.min(180, L.treeW * 0.37);
  L.qX = L.treeX + L.treeW * 0.265;         // center of the question column
  L.tX = L.treeX + L.treeW * 0.795;         // center of the outcome column
  layout = L;
}

function nodeRect(id) {
  const n = tree[id];
  const L = layout;
  const isQuestionColumn = (n.col === 0);
  const w = (n.type === 'q') ? L.qW : (isQuestionColumn ? L.qW : L.tW);
  const cx = isQuestionColumn ? L.qX : L.tX;
  return { x: cx - w / 2, y: L.rowY + n.row * L.rowStep, w: w, h: L.nodeH };
}

function nodeAt(mx, my) {
  if (my > drawHeight) return null;
  for (let i = 0; i < nodeIds.length; i++) {
    const r = nodeRect(nodeIds[i]);
    if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) return nodeIds[i];
  }
  return null;
}

// Split text into lines no wider than maxW (uses the current text settings)
function wrapLines(str, maxW) {
  const words = str.split(' ');
  const lines = [];
  let line = '';
  words.forEach(word => {
    const trial = line ? line + ' ' + word : word;
    if (textWidth(trial) > maxW && line) {
      lines.push(line);
      line = word;
    } else {
      line = trial;
    }
  });
  if (line) lines.push(line);
  return lines;
}

function onPath(fromId, toId) {
  // true if the learner has travelled this branch
  for (let i = 0; i < path.length; i++) {
    const n = tree[path[i].q];
    const dest = path[i].yes ? n.yes : n.no;
    if (path[i].q === fromId && dest === toId) return true;
  }
  return false;
}

function visited(id) {
  return id === current || path.some(step => step.q === id);
}

// -------------------------------------------
// Tree
// -------------------------------------------
function drawEdges() {
  nodeIds.forEach(id => {
    const n = tree[id];
    if (n.type !== 'q') return;
    drawBranch(id, n.yes, 'Yes');
    drawBranch(id, n.no, 'No');
  });
}

function drawBranch(fromId, toId, label) {
  const a = nodeRect(fromId);
  const b = nodeRect(toId);
  const taken = onPath(fromId, toId);
  const sideways = tree[toId].col !== tree[fromId].col;

  let x1, y1, x2, y2;
  if (sideways) {
    x1 = a.x + a.w; y1 = a.y + a.h / 2; x2 = b.x; y2 = b.y + b.h / 2;
  } else {
    x1 = a.x + a.w / 2; y1 = a.y + a.h; x2 = b.x + b.w / 2; y2 = b.y;
  }

  stroke(taken ? INDIGO_DARK : 120);
  strokeWeight(taken ? 4 : 1.5);
  line(x1, y1, sideways ? x2 - 8 : x2, sideways ? y2 : y2 - 8);
  noStroke();
  fill(taken ? INDIGO_DARK : 120);
  if (sideways) triangle(x2 - 1, y2, x2 - 10, y2 - 6, x2 - 10, y2 + 6);
  else triangle(x2, y2 - 1, x2 - 6, y2 - 10, x2 + 6, y2 - 10);

  // branch label
  textStyle(BOLD);
  textSize(layout.wide ? 13 : 12);
  fill(taken ? INDIGO_DARK : 70);
  if (sideways) {
    textAlign(CENTER, BOTTOM);
    text(label, (x1 + x2) / 2 - 3, y1 - 2);
  } else {
    textAlign(LEFT, CENTER);
    text(label, x1 + 7, (y1 + y2) / 2 - 2);
  }
  textStyle(NORMAL);
}

function outcomeColor(kind) {
  if (kind === 'collect') return GOLD;
  if (kind === 'restrict') return AMBER;
  return SOFT_RED;
}

function drawNode(id) {
  const n = tree[id];
  const r = nodeRect(id);
  const isCurrent = (id === current);
  const wasVisited = visited(id);
  const atEnd = tree[current].type === 't';

  // shadow
  noStroke();
  fill(0, 0, 0, 28);
  rect(r.x + 3, r.y + 3, r.w, r.h, 10);

  // body
  let bg, fg;
  if (n.type === 'q') {
    bg = wasVisited ? INDIGO : INDIGO_LIGHT;
    fg = 255;
  } else {
    bg = outcomeColor(n.kind);
    fg = 20;
  }
  if (isCurrent) {
    stroke(n.type === 'q' ? GOLD : INDIGO_DARK);
    strokeWeight(5);
  } else if (id === hoveredNode) {
    stroke(INDIGO_DARK);
    strokeWeight(3);
  } else {
    stroke(60);
    strokeWeight(1);
  }
  fill(bg);
  rect(r.x, r.y, r.w, r.h, 10);

  // text
  noStroke();
  fill(fg);
  textAlign(CENTER, CENTER);
  textStyle(n.type === 't' ? BOLD : NORMAL);
  let fs = layout.fs;
  textSize(fs);
  let lines = wrapLines(n.text, r.w - 14);
  if (lines.length * (fs + 2.5) > r.h - 6) {       // shrink once if the text is too tall
    fs -= 1;
    textSize(fs);
    lines = wrapLines(n.text, r.w - 12);
  }
  const lead = fs + 2.5;
  const top = r.y + r.h / 2 - (lines.length - 1) * lead / 2;
  lines.forEach((ln, k) => text(ln, r.x + r.w / 2, top + k * lead));
  textStyle(NORMAL);

  // wash out everything that is off the path once a decision is reached
  if (atEnd && !wasVisited) {
    noStroke();
    fill(240, 248, 255, 150);
    rect(r.x - 2, r.y - 2, r.w + 6, r.h + 6, 10);
  }
}

function drawLegend() {
  const items = [
    { label: 'Collect', color: GOLD },
    { label: 'Collect with restrictions', color: AMBER },
    { label: 'Do not collect', color: SOFT_RED }
  ];
  // sits in the free space to the right of the last outcome on the spine
  const x = layout.tX - layout.tW / 2;
  let y = layout.rowY + 4 * layout.rowStep + 6;
  textAlign(LEFT, CENTER);
  textSize(12);
  items.forEach(item => {
    stroke(60);
    strokeWeight(1);
    fill(item.color);
    rect(x, y, 16, 12, 3);
    noStroke();
    fill(40);
    text(item.label, x + 22, y + 6.5);
    y += 17;
  });
}

// -------------------------------------------
// Info panel
// -------------------------------------------
function drawPanel() {
  const p = layout.panel;
  const wide = layout.wide;
  const fs = wide ? 13 : 11.5;
  const lead = wide ? 16.5 : 13.5;
  const pad = wide ? 12 : 9;

  stroke(AMBER);
  strokeWeight(1);
  fill(CHAMPAGNE);
  rect(p.x, p.y, p.w, p.h, 8);

  // Build the panel as a list of text blocks, then flow them top to bottom
  const blocks = [];
  const atEnd = tree[current].type === 't';
  const s = scenario();

  if (hoveredNode) {
    const n = tree[hoveredNode];
    blocks.push({ t: n.type === 'q' ? 'EXAMPLE FOR THIS QUESTION' : 'EXAMPLE OF THIS OUTCOME', style: 'label' });
    blocks.push({ t: n.text, style: 'bold' });
    blocks.push({ t: n.example, style: 'normal' });
  } else {
    if (wide || !atEnd) {
      blocks.push({ t: 'ANALYTICS QUESTION', style: 'label' });
      blocks.push({ t: s.own ? 'Your own question. Keep it in mind as you answer.' : s.question, style: 'normal' });
    }
    blocks.push({ t: 'DATA ELEMENT', style: 'label' });
    blocks.push({ t: elementName(), style: 'bold' });

    if (atEnd) {
      const end = tree[current];
      blocks.push({ t: 'DECISION', style: 'label' });
      blocks.push({ t: end.text, style: end.kind === 'stop' ? 'bad' : 'good' });
      blocks.push({ t: justification(), style: 'normal' });
    } else if (feedback) {
      blocks.push({ t: feedback.ok ? 'YOUR LAST ANSWER' : 'FEEDBACK', style: 'label' });
      blocks.push({ t: feedback.text, style: feedback.ok ? 'good' : 'bad' });
    } else {
      blocks.push({ t: 'YOUR TURN', style: 'label' });
      blocks.push({ t: 'Read the highlighted question in the tree and answer it with the Yes or No button. Hover over any box for an example.', style: 'normal' });
    }
    if (wide && path.length > 0) {
      // the answers given so far, which become the justification
      const shortNames = {
        q0: 'Needed for the question', q1: 'Aggregated data is enough',
        q2: 'Pseudonymized data is enough', q3: 'Consent and legal basis'
      };
      blocks.push({ t: 'PATH SO FAR', style: 'label' });
      path.forEach((step, k) => {
        blocks.push({ t: (k + 1) + '. ' + shortNames[step.q] + ': ' + (step.yes ? 'Yes' : 'No'), style: 'normal' });
      });
    }
  }

  let y = p.y + pad - 2;
  const bottom = p.y + p.h - 4;
  textAlign(LEFT, TOP);
  noStroke();
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.style === 'label') {
      if (y + 13 > bottom) break;
      y += (i === 0) ? 0 : (wide ? 7 : 3);
      fill(AMBER_DARK);
      textStyle(BOLD);
      textSize(wide ? 12 : 11);
      text(b.t, p.x + pad, y);
      y += wide ? 15 : 13;
      textStyle(NORMAL);
      continue;
    }
    textSize(fs);
    if (b.style === 'bold') { fill(20); textStyle(BOLD); }
    else if (b.style === 'good') { fill(GOOD_GREEN); textStyle(BOLD); }
    else if (b.style === 'bad') { fill(DEEP_RED); textStyle(BOLD); }
    else { fill(30); textStyle(NORMAL); }
    const lines = wrapLines(b.t, p.w - 2 * pad);
    for (let k = 0; k < lines.length; k++) {
      if (y + lead > bottom + 2) break;
      text(lines[k], p.x + pad, y);
      y += lead;
    }
    textStyle(NORMAL);
  }
}

function drawControlLabels() {
  noStroke();
  fill(30);
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Scenario:', 12, drawHeight + 21);
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
    if (typeof elementInput !== 'undefined') {
      elementInput.size(Math.max(120, canvasWidth - 220));
    }
  }
}
