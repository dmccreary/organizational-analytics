// Privacy by Design Architecture MicroSim
// CANVAS_HEIGHT: 545
// Four stacked layers (Data Collection, Storage, Analysis, Reporting), each with
// three privacy controls. Hover a control for an explanation, click a layer
// header to collapse it, and switch on "Score Your System" to check off the
// controls an architecture has and see which layer is weakest.
// MicroSim template version 2026.03

// ===========================================
// CANVAS LAYOUT
// ===========================================
let containerWidth;
let canvasWidth = 800;
let drawHeight = 500;
let controlHeight = 45;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 12;
let defaultTextSize = 14;

const LAYERS_TOP = 54;
const HEADER_H = 22;
const BOX_H = 48;
const LAYER_PAD = 9;
const LAYER_H = HEADER_H + BOX_H + LAYER_PAD;     // expanded layer
const COLLAPSED_H = HEADER_H + 4;                  // collapsed layer
const LAYER_GAP = 13;
const INFO_H = 64;
const BAR_W = 30;                                  // "Privacy Controls" bar on the right

// ===========================================
// ARIA COLOR SCHEME
// ===========================================
const INDIGO = '#303F9F';
const INDIGO_DARK = '#1A237E';
const INDIGO_LIGHT = '#5C6BC0';
const INDIGO_PALE = '#C5CAE9';
const AMBER = '#D4880F';
const AMBER_DARK = '#B06D0B';
const GOLD = '#FFD700';
const CHAMPAGNE = '#FFF8E7';
const CHECK_GREEN = '#2E7D32';

// ===========================================
// CONTENT (explanations follow the chapter's Privacy by Design section)
// ===========================================
const layers = [
  { name: 'Data Collection', band: INDIGO_PALE, headText: INDIGO_DARK,
    controls: [
      { title: 'Metadata Only', sub: 'Capture headers, not bodies',
        detail: 'Collect who communicated with whom and when, not what was said. Content is collected only with explicit consent and a legitimate purpose.',
        example: 'Email headers (sender, recipient, timestamp) are ingested. Message bodies are not.' },
      { title: 'Pseudonymize at Ingestion', sub: 'Strip PII before graph loading',
        detail: 'Replace names and employee IDs with pseudonyms before the data enters the analytical graph.',
        example: 'Maria Chen becomes PSN_4782 before her node is created.' },
      { title: 'Purpose Declaration', sub: "Document each source's purpose",
        detail: 'Record the stated purpose of every data source, so data collected for one reason is not quietly reused for another.',
        example: 'Calendar data: used to measure cross-team meeting load, and nothing else.' }
    ] },
  { name: 'Storage', band: INDIGO, headText: '#FFFFFF',
    controls: [
      { title: 'Encryption', sub: 'At rest and in transit',
        detail: 'Encrypt stored graph files, backups and exports, and encrypt data as it moves between systems.',
        example: 'A stolen backup holds only unreadable ciphertext.' },
      { title: 'Access Controls', sub: 'Least privilege, role-based',
        detail: 'Give each role the minimum access it needs to do its job.',
        example: 'A department manager sees aggregate metrics for their own department, never individual communication patterns.' },
      { title: 'Identity Vault Separation', sub: 'Pseudonym keys isolated',
        detail: 'Keep the mapping from real identities to pseudonyms in a separate, secured store.',
        example: 'The analyst who runs queries does not hold the re-identification key.' }
    ] },
  { name: 'Analysis', band: AMBER, headText: '#1A1A1A',
    controls: [
      { title: 'Aggregate by Default', sub: 'Team-level, not individual',
        detail: 'Default to aggregate queries. Individual-level queries are the exception and need a documented reason.',
        example: '"How connected is Engineering to Product?" needs department-level volumes, not person-to-person edges.' },
      { title: 'Query Logging', sub: 'Every access audited',
        detail: 'Log every query against identifiable or pseudonymized data: who ran it, when, and how many results came back.',
        example: 'An append-only audit log that analysts cannot edit or delete.' },
      { title: 'Minimum Group Size', sub: 'Suppress results below threshold',
        detail: 'The query interface refuses to return results for groups smaller than a set threshold, often 5 to 10 people.',
        example: 'A query scoped to a three-person team returns no result.' }
    ] },
  { name: 'Reporting', band: GOLD, headText: INDIGO_DARK,
    controls: [
      { title: 'Department-Level Results', sub: 'No individual dashboards',
        detail: 'Present results for teams or departments, not for named individuals.',
        example: 'A dashboard compares collaboration between departments. It has no per-person view.' },
      { title: 'Small Cell Suppression', sub: 'Hide groups < 5',
        detail: 'Hide any reported figure based on so few people that someone could be re-identified from it.',
        example: 'A row for a team of three is shown as "suppressed".' },
      { title: 'Data Provenance', sub: 'What was used and how',
        detail: 'Every report states what data was used, how it was processed, and what assumptions were made.',
        example: 'A footnote: "Email metadata, pseudonymized, 12 months, groups under 5 suppressed."' }
    ] }
];

// Sample systems to assess. Each entry lists [layer, control] pairs that are in place.
const examples = [
  { name: 'Blank checklist', checked: [] },
  { name: 'Example: rushed pilot',
    checked: [[0, 0], [1, 0], [1, 1], [2, 1]] },
  { name: 'Example: careful rollout',
    checked: [[0, 0], [0, 1], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2], [3, 0], [3, 1]] }
];

// ===========================================
// STATE
// ===========================================
let expanded = [true, true, true, true];
let implemented = layers.map(() => [false, false, false]);
let hovered = null;             // { layer, control } under the mouse
let hoveredHeader = -1;
let pinned = null;              // control clicked while exploring
let scoreCheckbox, exampleSelect;

// geometry (recomputed every frame)
let bandX = 12, bandW = 700, layerY = [0, 0, 0, 0];

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(containerWidth, containerHeight);
  const mainElement = document.querySelector('main');
  canvas.parent(mainElement);
  textSize(defaultTextSize);

  scoreCheckbox = createCheckbox('Score Your System', false);
  scoreCheckbox.parent(mainElement);
  scoreCheckbox.position(10, drawHeight + 12);
  scoreCheckbox.changed(() => { pinned = null; });

  exampleSelect = createSelect();
  exampleSelect.parent(mainElement);
  examples.forEach((ex, i) => exampleSelect.option(ex.name, String(i)));
  exampleSelect.changed(loadExample);
  positionControls();

  describe('Layered architecture diagram with four layers: Data Collection, Storage, Analysis and Reporting. Each layer holds three privacy controls. A scoring mode lets the user check off controls and reports the score for each layer.', LABEL);
}

function loadExample() {
  const ex = examples[parseInt(exampleSelect.value(), 10)];
  implemented = layers.map(() => [false, false, false]);
  ex.checked.forEach(pair => { implemented[pair[0]][pair[1]] = true; });
  expanded = [true, true, true, true];
  pinned = null;
  // choosing a sample system switches scoring on
  if (ex.checked.length > 0) scoreCheckbox.checked(true);
}

function positionControls() {
  if (typeof exampleSelect === 'undefined') return;
  // the "Start from:" label is dropped on narrow screens
  exampleSelect.position(canvasWidth < 520 ? 180 : 268, drawHeight + 11);
}

function scoring() {
  return scoreCheckbox.checked();
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

  // Title
  noStroke();
  fill(INDIGO_DARK);
  textAlign(CENTER, TOP);
  textStyle(BOLD);
  textSize(canvasWidth < 480 ? 17 : 22);
  text('Privacy by Design Architecture', canvasWidth / 2, 9);
  textStyle(NORMAL);

  computeLayout();
  findHover();

  drawFlowLabel('Raw data', LAYERS_TOP - 9, true);
  for (let i = 0; i < layers.length; i++) drawLayer(i);
  const bottom = layerY[layers.length - 1] + layerHeight(layers.length - 1);
  drawFlowLabel('Reports', bottom + 10, false);
  drawSideBar(bottom);
  drawInfoPanel();
  drawControlLabels();

  cursor(hovered || hoveredHeader >= 0 ? HAND : ARROW);
}

function layerHeight(i) {
  return expanded[i] ? LAYER_H : COLLAPSED_H;
}

function computeLayout() {
  bandX = margin;
  bandW = canvasWidth - margin - BAR_W - 20;
  let y = LAYERS_TOP;
  for (let i = 0; i < layers.length; i++) {
    layerY[i] = y;
    y += layerHeight(i) + LAYER_GAP;
  }
}

function boxRect(i, j) {
  const gap = canvasWidth < 520 ? 6 : 10;
  const w = (bandW - 4 * gap) / 3;
  return { x: bandX + gap + j * (w + gap), y: layerY[i] + HEADER_H, w: w, h: BOX_H };
}

function findHover() {
  hovered = null;
  hoveredHeader = -1;
  if (mouseY > drawHeight) return;
  for (let i = 0; i < layers.length; i++) {
    if (mouseX >= bandX && mouseX <= bandX + bandW &&
        mouseY >= layerY[i] && mouseY <= layerY[i] + (expanded[i] ? HEADER_H : COLLAPSED_H)) {
      hoveredHeader = i;
      return;
    }
    if (!expanded[i]) continue;
    for (let j = 0; j < 3; j++) {
      const r = boxRect(i, j);
      if (mouseX >= r.x && mouseX <= r.x + r.w && mouseY >= r.y && mouseY <= r.y + r.h) {
        hovered = { layer: i, control: j };
        return;
      }
    }
  }
}

// Split text into lines no wider than maxW (uses the current text settings)
function wrapLines(str, maxW) {
  const words = str.split(' ');
  const lines = [];
  let current = '';
  words.forEach(word => {
    const trial = current ? current + ' ' + word : word;
    if (textWidth(trial) > maxW && current) {
      lines.push(current);
      current = word;
    } else {
      current = trial;
    }
  });
  if (current) lines.push(current);
  return lines;
}

function layerScore(i) {
  return implemented[i].filter(v => v).length;
}

// -------------------------------------------
// Layers
// -------------------------------------------
function drawLayer(i) {
  const layer = layers[i];
  const y = layerY[i];
  const h = layerHeight(i);
  const narrow = canvasWidth < 520;

  // arrow down into the next layer
  if (i < layers.length - 1) {
    const ax = bandX + bandW / 2;
    stroke(70);
    strokeWeight(2);
    line(ax, y + h + 1, ax, y + h + LAYER_GAP - 6);
    noStroke();
    fill(70);
    triangle(ax, y + h + LAYER_GAP - 1, ax - 5, y + h + LAYER_GAP - 8, ax + 5, y + h + LAYER_GAP - 8);
  }

  // layer band
  stroke(i === hoveredHeader ? INDIGO_DARK : 120);
  strokeWeight(i === hoveredHeader ? 2 : 1);
  fill(layer.band);
  rect(bandX, y, bandW, h, 8);

  // header: collapse marker, name, score
  noStroke();
  fill(layer.headText);
  const hy = y + (expanded[i] ? HEADER_H / 2 + 1 : COLLAPSED_H / 2);
  const tx = bandX + 12;
  if (expanded[i]) {
    triangle(tx - 4, hy - 4, tx + 6, hy - 4, tx + 1, hy + 4);     // pointing down
  } else {
    triangle(tx - 3, hy - 6, tx - 3, hy + 6, tx + 5, hy);         // pointing right
  }
  textAlign(LEFT, CENTER);
  textStyle(BOLD);
  textSize(narrow ? 13 : 14);
  text('Layer ' + (i + 1) + ': ' + layer.name, tx + 14, hy);
  if (scoring()) {
    textAlign(RIGHT, CENTER);
    text(layerScore(i) + ' of 3', bandX + bandW - 12, hy);
  }
  textStyle(NORMAL);

  if (!expanded[i]) return;

  // control boxes
  for (let j = 0; j < 3; j++) {
    const c = layer.controls[j];
    const r = boxRect(i, j);
    const isHover = hovered && hovered.layer === i && hovered.control === j;
    const isPinned = pinned && pinned.layer === i && pinned.control === j;
    const isOn = scoring() && implemented[i][j];

    if (isHover || isPinned) {
      stroke(INDIGO_DARK);
      strokeWeight(3);
    } else {
      stroke(110);
      strokeWeight(1);
    }
    fill(isOn ? '#E8F5E9' : (isHover ? CHAMPAGNE : 255));
    rect(r.x, r.y, r.w, r.h, 7);

    // check box in the corner while scoring
    const checkW = scoring() ? 22 : 0;
    if (scoring()) {
      const cx = r.x + r.w - 18, cy = r.y + (narrow ? 3 : 6);
      stroke(isOn ? CHECK_GREEN : 110);
      strokeWeight(1.5);
      fill(isOn ? CHECK_GREEN : 255);
      rect(cx, cy, 13, 13, 3);
      if (isOn) {
        stroke(255);
        strokeWeight(2);
        noFill();
        line(cx + 3, cy + 7, cx + 5.5, cy + 10);
        line(cx + 5.5, cy + 10, cx + 10.5, cy + 3.5);
      }
    }

    noStroke();
    fill(20);
    textAlign(LEFT, TOP);
    if (narrow) {
      // title only, wrapped to two lines
      textStyle(BOLD);
      textSize(11.5);
      const lines = wrapLines(c.title, r.w - 10);
      // While scoring, the title sits at the bottom of the box so it stays
      // clear of the check box in the top corner. Otherwise it is centered.
      const startY = scoring()
        ? r.y + r.h - 5 - lines.length * 13
        : r.y + (r.h - lines.length * 13) / 2;
      lines.forEach((ln, k) => text(ln, r.x + 5, startY + k * 13));
      textStyle(NORMAL);
    } else {
      textStyle(BOLD);
      textSize(r.w < 200 ? 12.5 : 14);
      text(c.title, r.x + 9, r.y + 7);
      textStyle(NORMAL);
      fill(60);
      textSize(r.w < 200 ? 11.5 : 12.5);
      const sub = wrapLines(c.sub, r.w - 14 - (r.w < 200 ? 0 : checkW));
      text(sub[0] + (sub.length > 1 ? '...' : ''), r.x + 9, r.y + 27);
    }
  }
}

function drawFlowLabel(label, y, above) {
  const ax = bandX + bandW / 2;
  noStroke();
  fill(70);
  textAlign(CENTER, CENTER);
  textStyle(ITALIC);
  textSize(12.5);
  text(above ? label + '  ▼' : '▼  ' + label, ax, y);
  textStyle(NORMAL);
}

// Vertical "Privacy Controls" bar spanning every layer
function drawSideBar(bottom) {
  const x = canvasWidth - margin - BAR_W;
  const y = LAYERS_TOP;
  const h = bottom - LAYERS_TOP;
  noStroke();
  fill(INDIGO);
  rect(x, y, BAR_W, h, 8);
  push();
  translate(x + BAR_W / 2, y + h / 2);
  rotate(HALF_PI);
  fill(255);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(14);
  text('Privacy Controls', 0, 0);
  textStyle(NORMAL);
  pop();
}

// -------------------------------------------
// Info panel: explanation, or the score summary
// -------------------------------------------
function drawInfoPanel() {
  const x = margin;
  const y = drawHeight - INFO_H - 6;
  const w = canvasWidth - 2 * margin;
  const narrow = canvasWidth < 520;
  const fs = narrow ? 11.5 : 13;
  const lead = narrow ? 13 : 16;

  stroke(AMBER);
  strokeWeight(1);
  fill(CHAMPAGNE);
  rect(x, y, w, INFO_H, 8);
  noStroke();
  fill(AMBER);
  rect(x, y, 5, INFO_H, 8, 0, 0, 8);

  const tx = x + 14;
  const tw = w - 24;
  textAlign(LEFT, TOP);

  const focus = hovered || (scoring() ? null : pinned);
  if (focus) {
    const c = layers[focus.layer].controls[focus.control];
    fill(INDIGO_DARK);
    textStyle(BOLD);
    textSize(fs + 1);
    text(c.title + ' (' + layers[focus.layer].name + ' layer)', tx, y + 5);
    textStyle(NORMAL);
    fill(25);
    textSize(fs);
    // show the explanation, then the example if there is room for it
    let lines = wrapLines(c.detail, tw);
    const exampleLines = wrapLines('Example: ' + c.example, tw);
    const maxLines = Math.floor((INFO_H - 26) / lead);
    if (lines.length + exampleLines.length <= maxLines) lines = lines.concat(exampleLines);
    lines.slice(0, maxLines).forEach((ln, k) => text(ln, tx, y + 23 + k * lead));
    return;
  }

  if (scoring()) {
    const total = layers.reduce((sum, layer, i) => sum + layerScore(i), 0);
    fill(INDIGO_DARK);
    textStyle(BOLD);
    textSize(fs + 1);
    text('Score: ' + total + ' of 12 controls in place', tx, y + 5);
    textStyle(NORMAL);

    // progress bar
    const barX = tx + (narrow ? 215 : 250);
    const barW = Math.max(40, x + w - barX - 14);
    stroke(150);
    strokeWeight(1);
    fill(255);
    rect(barX, y + 8, barW, 11, 5);
    noStroke();
    fill(total === 12 ? CHECK_GREEN : AMBER);
    if (total > 0) rect(barX, y + 8, barW * total / 12, 11, 5);

    fill(25);
    textSize(fs);
    const lines = wrapLines(assessment(total), tw);
    lines.slice(0, 3).forEach((ln, k) => text(ln, tx, y + 24 + k * lead));
    return;
  }

  fill(25);
  textSize(fs);
  const hint = 'Hover over a control for an explanation and an example. Click a layer header to collapse or expand it. ' +
    'Turn on Score Your System to check off the controls an architecture has and find its weakest layer.';
  wrapLines(hint, tw).slice(0, 4).forEach((ln, k) => text(ln, tx, y + 8 + k * lead));
}

// Plain-language verdict for the current checklist
function assessment(total) {
  if (total === 12) {
    return 'All twelve controls are in place. Privacy is built into every layer of this architecture.';
  }
  const empty = [];
  let weakest = 0;
  layers.forEach((layer, i) => {
    if (layerScore(i) === 0) empty.push(layer.name);
    if (layerScore(i) < layerScore(weakest)) weakest = i;
  });
  if (total === 0) {
    return 'No controls are checked yet. Click each control this system has in place.';
  }
  if (empty.length > 0) {
    return 'Not adequate. No privacy controls at the ' + empty.join(' and ') +
      (empty.length > 1 ? ' layers' : ' layer') +
      ', so protection added in the other layers can be undone there.';
  }
  return 'Every layer has some protection, but ' + (12 - total) + ' of the 12 controls are missing. Weakest layer: ' +
    layers[weakest].name + ' (' + layerScore(weakest) + ' of 3).';
}

function drawControlLabels() {
  if (canvasWidth < 520) return;
  noStroke();
  fill(30);
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Start from:', 190, drawHeight + 22);
}

// ===========================================
// INTERACTION
// ===========================================
function mousePressed() {
  if (mouseY > drawHeight) return;
  findHover();
  if (hoveredHeader >= 0) {
    expanded[hoveredHeader] = !expanded[hoveredHeader];
    return;
  }
  if (hovered) {
    if (scoring()) {
      implemented[hovered.layer][hovered.control] = !implemented[hovered.layer][hovered.control];
    } else {
      const same = pinned && pinned.layer === hovered.layer && pinned.control === hovered.control;
      pinned = same ? null : { layer: hovered.layer, control: hovered.control };
    }
  }
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
    positionControls();
  }
}
